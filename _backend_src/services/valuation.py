"""
PTAH Realty -- CMA aggregation and valuation calculator (MongoDB version).

Uses Mongo's native 2dsphere index for the radius method instead of the
bounding-box + haversine trick the SQL version needed -- $geoNear already
gives us an exact, indexed distance filter.
"""

from __future__ import annotations

import math
import statistics
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from services.property24_ingest import _resolve_province
from services.property24_market_stats import get_province_market_context

ValuationMethod = Literal["radius", "complex", "suburb"]

DEFAULT_RADIUS_M = 1500
MIN_COMPARABLES_FOR_CONFIDENCE = 5
MAX_COMPARABLE_AGE_DAYS = 365

# Rough SA residential gross-yield conventions by property type, used only
# to derive a disclosed rental *estimate* -- there's no real rental-listing
# ingestion pipeline (property24_ingest.py only pulls for-sale data), so
# this is explicitly a heuristic, not market rental comps. Every snapshot
# carries rental_estimate_basis="heuristic_gross_yield" so nothing
# downstream can mistake it for real data.
_ASSUMED_GROSS_YIELD_PCT = {
    "apartment": 8.5,
    "townhouse": 8.0,
    "house": 7.0,
    "vacant_land": 0.0,
    "commercial": 9.5,
}
_DEFAULT_GROSS_YIELD_PCT = 8.0


class ValuationError(Exception):
    pass


@dataclass
class ValuationSnapshot:
    property_id: str
    method: ValuationMethod
    radius_m: Optional[int]
    comparable_count: int
    price_per_sqm: dict = field(default_factory=dict)
    estimated_value: dict = field(default_factory=dict)
    confidence_score: float = 0.0
    comparable_ids: list = field(default_factory=list)
    price_basis: Literal["sold", "asking", "mixed"] = "sold"
    market_context: Optional[dict] = None
    estimated_monthly_rental: Optional[float] = None
    rental_yield_percent: Optional[float] = None
    rental_estimate_basis: Literal["heuristic_gross_yield"] = "heuristic_gross_yield"


async def _fetch_comparables(db, prop: dict, method: ValuationMethod, radius_m: int) -> list[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_COMPARABLE_AGE_DAYS)
    # Includes both real sold comps and the "for_sale" asking-price fallback
    # (see property24_ingest.py) -- compute_valuation() below distinguishes
    # them via price_basis rather than filtering the weaker signal out here.
    base_filter = {
        "listing_status": {"$in": ["sold", "active"]},
        "sale_date": {"$gte": cutoff},
    }

    if method == "complex" and prop.get("complex_name"):
        cursor = db.comparables.find(
            {**base_filter, "complex_name": prop["complex_name"]}
        ).sort("sale_date", -1).limit(200)
        return await cursor.to_list(length=200)

    if method == "radius":
        lng, lat = prop["location"]["coordinates"]
        pipeline = [
            {
                "$geoNear": {
                    "near": {"type": "Point", "coordinates": [lng, lat]},
                    "distanceField": "distance_m",
                    "maxDistance": radius_m,
                    "query": {**base_filter, "property_type": prop["property_type"]},
                    "spherical": True,
                }
            },
            {"$limit": 200},
        ]
        return await db.comparables.aggregate(pipeline).to_list(length=200)

    # suburb fallback
    cursor = db.comparables.find(
        {**base_filter, "suburb": prop["suburb"], "property_type": prop["property_type"]}
    ).sort("sale_date", -1).limit(200)
    return await cursor.to_list(length=200)


def _percentile(sorted_values: list[float], p: float) -> float:
    if len(sorted_values) == 1:
        return sorted_values[0]
    idx = (len(sorted_values) - 1) * p
    lo, hi = math.floor(idx), math.ceil(idx)
    if lo == hi:
        return sorted_values[lo]
    return sorted_values[lo] + (sorted_values[hi] - sorted_values[lo]) * (idx - lo)


def _confidence(comparables: list[dict]) -> float:
    if not comparables:
        return 0.0
    sample_factor = min(len(comparables) / MIN_COMPARABLES_FOR_CONFIDENCE, 1.0)

    now = datetime.now(timezone.utc)
    ages = []
    for c in comparables:
        sale_date = c.get("sale_date")
        if isinstance(sale_date, datetime):
            age = (now - sale_date.replace(tzinfo=timezone.utc) if sale_date.tzinfo is None else now - sale_date).days
        else:
            age = MAX_COMPARABLE_AGE_DAYS
        ages.append(age)
    avg_age = statistics.mean(ages)
    recency_factor = max(0.0, 1 - avg_age / MAX_COMPARABLE_AGE_DAYS)

    score = 0.6 * sample_factor + 0.4 * recency_factor

    # Asking prices are a materially weaker signal than confirmed sales
    # (they're what a seller wants, not what a buyer paid) -- penalize
    # confidence when any comp in the set isn't a real sale, and penalize
    # harder if none of them are.
    basis_set = {c.get("price_basis", "sold") for c in comparables}
    if basis_set == {"asking"}:
        score *= 0.5
    elif "asking" in basis_set:
        score *= 0.8

    return round(score, 3)


def _price_basis_summary(priced: list[dict]) -> Literal["sold", "asking", "mixed"]:
    basis_set = {c.get("price_basis", "sold") for c in priced}
    if basis_set == {"sold"}:
        return "sold"
    if basis_set == {"asking"}:
        return "asking"
    return "mixed"


async def compute_valuation(
    db,
    prop: dict,
    method: Optional[ValuationMethod] = None,
    radius_m: int = DEFAULT_RADIUS_M,
) -> ValuationSnapshot:
    resolved_method: ValuationMethod = method or ("complex" if prop.get("complex_name") else "radius")

    comparables = await _fetch_comparables(db, prop, resolved_method, radius_m)

    # Effective price: real sale price where we have it, otherwise the
    # "for_sale" asking-price fallback (see property24_ingest.py). Every
    # comp carries price_basis so this never silently blends the two --
    # _confidence() and price_basis on the snapshot both reflect it.
    priced = []
    for c in comparables:
        effective_price = c.get("sale_price") or c.get("list_price")
        if effective_price and c.get("floor_size_sqm"):
            priced.append({**c, "_effective_price": effective_price})

    if not priced:
        raise ValuationError(
            f'No usable comparables found for property {prop["_id"]} using method "{resolved_method}"'
        )

    price_per_sqm = sorted(c["_effective_price"] / c["floor_size_sqm"] for c in priced)
    low = _percentile(price_per_sqm, 0.25)
    mid = _percentile(price_per_sqm, 0.5)
    high = _percentile(price_per_sqm, 0.75)

    floor_size = prop.get("floor_size_sqm") or statistics.median(c["floor_size_sqm"] for c in priced)

    # Free/public supplementary context (suburb/province average price --
    # see property24_market_stats.py). Never fatal: a failed fetch just
    # means market_context stays None, valuation math above doesn't depend
    # on it.
    market_context = None
    try:
        province = _resolve_province(prop.get("suburb") or prop.get("city") or "")
        market_context = await get_province_market_context(province)
    except Exception:
        pass

    yield_pct = _ASSUMED_GROSS_YIELD_PCT.get(prop.get("property_type"), _DEFAULT_GROSS_YIELD_PCT)
    estimated_monthly_rental = round((mid * floor_size) * (yield_pct / 100) / 12, 2) if yield_pct else None

    return ValuationSnapshot(
        property_id=str(prop["_id"]),
        method=resolved_method,
        radius_m=radius_m if resolved_method == "radius" else None,
        comparable_count=len(priced),
        price_per_sqm={"low": round(low, 2), "mid": round(mid, 2), "high": round(high, 2)},
        estimated_value={
            "low": round(low * floor_size, 2),
            "mid": round(mid * floor_size, 2),
            "high": round(high * floor_size, 2),
        },
        confidence_score=_confidence(priced),
        comparable_ids=[str(c["_id"]) for c in priced],
        price_basis=_price_basis_summary(priced),
        market_context=market_context,
        estimated_monthly_rental=estimated_monthly_rental,
        rental_yield_percent=yield_pct if yield_pct else None,
    )
