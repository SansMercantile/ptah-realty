"""
PTAH Realty -- street/suburb comparable benchmarks for the AI Property
Valuation panel (streetBenchmark / suburbBenchmark on the frontend's
AIPropertyValuationResponse -- see types/index.ts).

Until now, api/ai.py's /property-valuation endpoint always returned
streetBenchmark=None and suburbBenchmark=None (the frontend has been
rendering "not yet available" placeholders for both -- see
ValuationModal.tsx / PropertyPanel.tsx). This module fills that gap using
the same `comparables` collection services/valuation.py's CMA engine
already reads (populated by services/property24_ingest.py -- predominantly
asking-price listings, see that module's docstring for why).

Same honesty rule as valuation.py: every figure here is computed from real
comparable rows already in Mongo, nothing is invented. Where the sample is
too thin to support a figure honestly (no comps on a given street, too few
suburb comps, no usable time spread for an appreciation estimate), the
relevant benchmark is returned as None rather than a fabricated number --
the frontend already has a graceful "not available" placeholder for
exactly this case, so returning None here is a real, intended state, not
an error swallowed silently.
"""
from __future__ import annotations

import re
import statistics
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from services.valuation import MAX_COMPARABLE_AGE_DAYS

MIN_COMPARABLES_FOR_STREET = 2
MIN_COMPARABLES_FOR_SUBURB = 3
# Appreciation needs a real time spread to mean anything -- a suburb
# comp set clustered in a single week can't honestly support an annual
# rate, so this is required in addition to MIN_COMPARABLES_FOR_SUBURB * 2.
MIN_APPRECIATION_SPAN_DAYS = 60

# A raw comp-vs-comp rate-of-change is noisy on a thin, unaudited asking-
# price sample -- clamp the derived annual rate to a plausible SA
# residential range rather than surface something like "+340% p.a." off a
# handful of listings.
_APPRECIATION_CLAMP = (-15.0, 25.0)

_HOUSE_NUMBER_RE = re.compile(
    r"^\s*(?:unit\s*\d+[a-z]?[,\s]+|flat\s*\d+[a-z]?[,\s]+|\d+[a-z]?\s*[,/-]?\s*)+",
    re.IGNORECASE,
)


def extract_street_name(address: Optional[str]) -> Optional[str]:
    """Strips leading house/unit/erf numbers off a free-text address line
    to get a comparable street key, e.g. '17 St Bedes Road' -> 'St Bedes
    Road', 'Unit 4, 217 Main Road' -> 'Main Road'. Best-effort string
    heuristic -- same spirit as the frontend's cadastralFilters.ts
    extractStreetName (which hardcodes a handful of demo streets), but
    generalized here to work over the real address_line values ingested
    from Property24."""
    if not address:
        return None
    cleaned = _HOUSE_NUMBER_RE.sub("", address).strip()
    return cleaned or address.strip()


def resolve_comparable_property_type(prop: dict) -> str:
    """Frontend PropertyRecord has no property_type field -- it has
    accommodation.type (a granular AccommodationType like 'Townhouse (2
    storey)'), category ('Freehold' | 'Sectional Title' | ...) and usage
    ('Residential' | 'Commercial' | ...). Maps those to the comparables
    collection's property_type enum (apartment/townhouse/house/
    vacant_land/commercial), the same enum services/property24_ingest.py
    normalizes incoming listings to."""
    usage = (prop.get("usage") or "").lower()
    category = (prop.get("category") or "").lower()
    accommodation_type = ((prop.get("accommodation") or {}).get("type") or "").lower()

    if usage == "commercial" or category == "commercial" or usage == "industrial":
        return "commercial"
    if "vacant" in usage or "vacant" in accommodation_type:
        return "vacant_land"
    if "apartment" in accommodation_type or "penthouse" in accommodation_type:
        return "apartment"
    if "townhouse" in accommodation_type or "cluster" in accommodation_type or "semi-detached" in accommodation_type:
        return "townhouse"
    if "house" in accommodation_type:
        return "house"
    # Sectional title with no more specific accommodation type on record --
    # apartment is the more common SA sectional-title default.
    if "sectional" in category:
        return "apartment"
    return "house"


def _priced(comps: list[dict]) -> list[dict]:
    """Same "sale price if we have it, else asking price" fallback as
    valuation.py's compute_valuation -- every row needs a usable price and
    a floor size to contribute to a rate."""
    out = []
    for c in comps:
        price = c.get("sale_price") or c.get("list_price")
        if price and c.get("floor_size_sqm"):
            out.append({**c, "_effective_price": price})
    return out


def _naive_utc(dt: datetime) -> datetime:
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


def _price_stats(priced_comps: list[dict]) -> Optional[dict]:
    if not priced_comps:
        return None
    rates = [c["_effective_price"] / c["floor_size_sqm"] for c in priced_comps if c.get("floor_size_sqm")]
    if not rates:
        return None
    return {
        "avg_price_per_m2": statistics.mean(rates),
        "median_total_price": statistics.median(sorted(c["_effective_price"] for c in priced_comps)),
    }


def _variance_percent(subject_price_per_m2: float, benchmark_price_per_m2: float) -> float:
    if not subject_price_per_m2 or not benchmark_price_per_m2:
        return 0.0
    return round(((subject_price_per_m2 - benchmark_price_per_m2) / benchmark_price_per_m2) * 100, 1)


# "Recent" sales window for streetBenchmark.recentSalesInStreetCount --
# deliberately narrower than MAX_COMPARABLE_AGE_DAYS (which just governs
# overall comp eligibility) so this figure reads as "sales in roughly the
# last six months," not "sales in the last year."
_RECENT_SALES_WINDOW_DAYS = 180


@dataclass
class BenchmarkResult:
    """Return type of compute_benchmarks() below -- a thin holder for the
    two dict-or-None benchmark payloads, shaped to match
    AIPropertyValuationResponse.streetBenchmark / .suburbBenchmark on the
    frontend (types/index.ts) exactly, field-for-field."""
    street_benchmark: Optional[dict] = None
    suburb_benchmark: Optional[dict] = None


def _annual_appreciation_rate(priced_suburb_comps: list[dict]) -> Optional[float]:
    """Splits the suburb's priced, dated comps into an older and newer
    half by sale_date and annualizes the % change in average price/m2
    between the two halves' midpoint dates. Needs both a decent sample
    (>= MIN_COMPARABLES_FOR_SUBURB * 2 -- half on each side of the split)
    and a real time spread (>= MIN_APPRECIATION_SPAN_DAYS) to mean
    anything; returns None otherwise rather than surfacing a rate derived
    from a handful of same-week listings. Clamped to _APPRECIATION_CLAMP
    -- see module docstring on why a raw comp-vs-comp rate isn't trusted
    unclamped on this sample."""
    dated = [c for c in priced_suburb_comps if isinstance(c.get("sale_date"), datetime)]
    if len(dated) < MIN_COMPARABLES_FOR_SUBURB * 2:
        return None

    dated.sort(key=lambda c: _naive_utc(c["sale_date"]))
    span_days = (_naive_utc(dated[-1]["sale_date"]) - _naive_utc(dated[0]["sale_date"])).days
    if span_days < MIN_APPRECIATION_SPAN_DAYS:
        return None

    midpoint = len(dated) // 2
    older, newer = dated[:midpoint], dated[midpoint:]
    older_rate = statistics.mean(c["_effective_price"] / c["floor_size_sqm"] for c in older)
    newer_rate = statistics.mean(c["_effective_price"] / c["floor_size_sqm"] for c in newer)
    if not older_rate:
        return None

    period_days = (
        _naive_utc(newer[len(newer) // 2]["sale_date"]) - _naive_utc(older[len(older) // 2]["sale_date"])
    ).days
    if period_days <= 0:
        return None

    annualized_pct = ((newer_rate - older_rate) / older_rate) * (365.0 / period_days) * 100
    clamped = max(_APPRECIATION_CLAMP[0], min(_APPRECIATION_CLAMP[1], annualized_pct))
    return round(clamped, 1)


def _build_suburb_benchmark(
    suburb: str, priced_suburb_comps: list[dict], subject_price_per_m2: float
) -> Optional[dict]:
    if len(priced_suburb_comps) < MIN_COMPARABLES_FOR_SUBURB:
        return None
    stats = _price_stats(priced_suburb_comps)
    if not stats:
        return None

    # annualAppreciationRate is a required field on the frontend contract
    # (suburbBenchmark isn't a partial/nullable-field type) -- if the
    # sample can't honestly support it, the whole suburb benchmark comes
    # back None rather than a benchmark with a fabricated rate. See
    # module docstring.
    appreciation_rate = _annual_appreciation_rate(priced_suburb_comps)
    if appreciation_rate is None:
        return None

    # "Days on market" is only honestly knowable for still-active
    # asking-price rows, where sale_date is really the list/scrape date
    # (see property24_ingest.py's docstring on sold-price data
    # availability) -- there's no separate list_date/close_date pair to
    # compute this for an actually-sold row, so this average is scoped to
    # active comps only.
    now = datetime.now(timezone.utc)
    active_ages = [
        (now - _naive_utc(c["sale_date"])).days
        for c in priced_suburb_comps
        if c.get("listing_status") == "active" and isinstance(c.get("sale_date"), datetime)
    ]
    if not active_ages:
        return None
    avg_days_on_market = round(statistics.mean(active_ages))

    total_stock_count = len(priced_suburb_comps)
    if total_stock_count >= 15:
        market_liquidity = "HIGH"
    elif total_stock_count >= 6:
        market_liquidity = "MODERATE"
    else:
        market_liquidity = "LOW"

    return {
        "suburbName": suburb,
        "suburbAveragePricePerM2": round(stats["avg_price_per_m2"], 2),
        "suburbMedianValuation": round(stats["median_total_price"], 2),
        "annualAppreciationRate": appreciation_rate,
        "varianceVsSuburbPercent": _variance_percent(subject_price_per_m2, stats["avg_price_per_m2"]),
        "marketLiquidity": market_liquidity,
        "averageDaysOnMarket": avg_days_on_market,
        "totalStockCount": total_stock_count,
    }


def _build_street_benchmark(
    street_name: str,
    priced_street_comps: list[dict],
    subject_price_per_m2: float,
    suburb_benchmark: Optional[dict],
) -> Optional[dict]:
    if len(priced_street_comps) < MIN_COMPARABLES_FOR_STREET:
        return None
    stats = _price_stats(priced_street_comps)
    if not stats:
        return None

    recent_cutoff = datetime.now(timezone.utc) - timedelta(days=_RECENT_SALES_WINDOW_DAYS)
    recent_sales_count = sum(
        1 for c in priced_street_comps
        if isinstance(c.get("sale_date"), datetime) and _naive_utc(c["sale_date"]) >= recent_cutoff
    )

    sorted_comps = sorted(
        priced_street_comps,
        key=lambda c: _naive_utc(c["sale_date"])
        if isinstance(c.get("sale_date"), datetime)
        else datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    comparative_properties = [
        {
            "address": c.get("address_line") or "",
            "extentM2": c["floor_size_sqm"],
            "lastPrice": c["_effective_price"],
            "lastDate": _naive_utc(c["sale_date"]).date().isoformat()
            if isinstance(c.get("sale_date"), datetime)
            else "",
        }
        for c in sorted_comps[:5]
    ]

    # Prestige rating is derived from the street's own avg rate relative
    # to the suburb's -- not invented -- so it degrades to a neutral
    # label when there's no suburb benchmark to compare against (too few
    # suburb comps, or no usable appreciation spread) rather than a
    # fabricated comparison.
    prestige_rating = "Established Street"
    if suburb_benchmark and suburb_benchmark.get("suburbAveragePricePerM2"):
        street_vs_suburb = _variance_percent(stats["avg_price_per_m2"], suburb_benchmark["suburbAveragePricePerM2"])
        if street_vs_suburb >= 15:
            prestige_rating = "Prime Street"
        elif street_vs_suburb >= 5:
            prestige_rating = "Sought-After Street"
        elif street_vs_suburb <= -10:
            prestige_rating = "Value Street"

    return {
        "streetName": street_name,
        "propertiesInStreetCount": len(priced_street_comps),
        "streetAveragePricePerM2": round(stats["avg_price_per_m2"], 2),
        "streetMedianValuation": round(stats["median_total_price"], 2),
        "varianceVsStreetPercent": _variance_percent(subject_price_per_m2, stats["avg_price_per_m2"]),
        "streetPrestigeRating": prestige_rating,
        "recentSalesInStreetCount": recent_sales_count,
        "comparativeProperties": comparative_properties,
    }


async def compute_benchmarks(db, prop: dict, subject_price_per_m2: float) -> BenchmarkResult:
    """Computes streetBenchmark/suburbBenchmark for the AI Property
    Valuation panel from real rows in Mongo's `comparables` collection --
    the same collection/eligibility window (MAX_COMPARABLE_AGE_DAYS)
    services/valuation.py's CMA engine reads. Either or both benchmarks
    come back None when the sample can't honestly support the figures
    the frontend expects (see module docstring) -- a real, intended
    state, not an error swallowed silently."""
    suburb = prop.get("suburb")
    if not suburb:
        return BenchmarkResult()

    property_type = resolve_comparable_property_type(prop)
    cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_COMPARABLE_AGE_DAYS)
    base_filter = {
        "listing_status": {"$in": ["sold", "active"]},
        "sale_date": {"$gte": cutoff},
        "suburb": suburb,
        "property_type": property_type,
    }

    cursor = db.comparables.find(base_filter).sort("sale_date", -1).limit(300)
    suburb_comps = await cursor.to_list(length=300)
    priced_suburb = _priced(suburb_comps)

    suburb_benchmark = _build_suburb_benchmark(suburb, priced_suburb, subject_price_per_m2)

    street_benchmark = None
    street_name = extract_street_name(prop.get("address"))
    if street_name:
        street_comps = [c for c in priced_suburb if extract_street_name(c.get("address_line")) == street_name]
        street_benchmark = _build_street_benchmark(street_name, street_comps, subject_price_per_m2, suburb_benchmark)

    return BenchmarkResult(street_benchmark=street_benchmark, suburb_benchmark=suburb_benchmark)
