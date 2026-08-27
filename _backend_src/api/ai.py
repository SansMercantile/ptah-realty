"""Authenticated AWS Bedrock endpoints used by the Realty intelligence UI."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from auth import UserPublic, get_current_user
from services.benchmarks import compute_benchmarks, resolve_comparable_property_type
from services.bedrock import generate_json
from services.valuation import _ASSUMED_GROSS_YIELD_PCT, _DEFAULT_GROSS_YIELD_PCT
from tenancy import get_tenant_db

router = APIRouter(prefix="/api/v1/realty/ai", tags=["Realty AI"])


class CmaSummaryRequest(BaseModel):
    property: dict
    valuation: dict = {}
    comparable_sales: list[dict] = Field(default_factory=list)
    tone: str = "Executive"


class ListingCopyRequest(BaseModel):
    property: dict
    asking_price: float | None = None
    highlights: list[str] = Field(default_factory=list)
    target_portal: str = "Property24"


@router.post("/cma-summary")
def cma_summary(body: CmaSummaryRequest, _user: UserPublic = Depends(get_current_user)) -> dict:
    property_data = body.property
    valuation = body.valuation
    prompt = f"""Create concise South African real-estate CMA copy in strict JSON.
Return keys: executiveSummary, pricingRecommendation, keyDrivers.
Do not invent facts or numbers. Tone: {body.tone}.
Property: {property_data}
Valuation: {valuation}
Comparables: {body.comparable_sales[:5]}"""
    try:
        return generate_json(prompt, system_prompt="You are a careful real-estate analyst. Return JSON only.", max_tokens=700)
    except Exception:
        return {
            "executiveSummary": "Bedrock narrative generation is temporarily unavailable; review the structured valuation evidence below.",
            "pricingRecommendation": "Use the calculated valuation range as the pricing decision support, not as a guaranteed sale price.",
            "keyDrivers": "Comparable transactions, location, extent, accommodation, and condition rating.",
        }


@router.post("/listing-copy")
def listing_copy(body: ListingCopyRequest, _user: UserPublic = Depends(get_current_user)) -> dict:
    prompt = f"""Create portal listing copy in strict JSON.
Return keys: headline, description, features (array).
Do not invent facts. Target portal: {body.target_portal}.
Property: {body.property}
Asking price: {body.asking_price}
Highlights: {body.highlights}"""
    try:
        return generate_json(prompt, system_prompt="You are a compliant property copywriter. Return JSON only.", max_tokens=700)
    except Exception:
        return {
            "headline": f"Property opportunity in {body.property.get('suburb', 'the selected suburb')}",
            "description": "Structured property details are ready for portal publication.",
            "features": body.highlights,
        }


class OutreachEmailRequest(BaseModel):
    property: dict
    template: str = "valuation"  # valuation | buyer | mandate | deeds
    owner_name: str | None = None
    estimated_value: float | None = None


_OUTREACH_TEMPLATE_BRIEF = {
    "valuation": "a complimentary AI-powered valuation / CMA report offer, inviting a brief introductory call",
    "buyer": "a qualified, pre-vetted buyer inquiry for this specific property, inviting the owner to consider a private treaty offer",
    "mandate": "an exclusive multi-portal marketing and syndication mandate proposal",
    "deeds": "a factual deeds office / municipal valuation and rates notice, offering advisory assistance",
}


@router.post("/outreach-email")
def outreach_email(body: OutreachEmailRequest, _user: UserPublic = Depends(get_current_user)) -> dict:
    """AI-drafted owner outreach email. Generates real subject/body copy
    via Bedrock from the property's own data (never inventing facts not
    present in the payload); falls back to a plain, clearly-labelled
    template if Bedrock is unavailable so the Contact Owner flow never
    breaks."""
    prop = body.property
    brief = _OUTREACH_TEMPLATE_BRIEF.get(body.template, _OUTREACH_TEMPLATE_BRIEF["valuation"])
    owner = body.owner_name or (prop.get("currentSale") or {}).get("owner") or "Registered Property Owner"
    address = prop.get("address", "the subject property")
    suburb = prop.get("suburb", "")
    erf_no = prop.get("erfNo", "")

    prompt = f"""Draft a professional South African real-estate outreach email in strict JSON.
Return keys: subject, body.
Purpose: {brief}.
Recipient: {owner}.
Property: {address}, {suburb} (Erf {erf_no}).
Extent: {prop.get('extentM2', 'unknown')} m2. Zoning: {prop.get('zoning', 'unknown')}.
Estimated value (only mention if provided, do not invent a figure otherwise): {body.estimated_value}.
Sign off as: Ptah-Realty. Do not invent facts, prices, or figures not given above.
Keep the body under 200 words, professional and warm, in plain text with \\n line breaks."""
    try:
        result = generate_json(
            prompt,
            system_prompt="You are a compliant, factual South African real-estate outreach copywriter. Return JSON only. Never invent facts or figures not given to you.",
            max_tokens=500,
        )
        return {
            "subject": result.get("subject", f"Regarding your property at {address}"),
            "body": result.get("body", ""),
            "generatedBy": "bedrock",
        }
    except Exception:
        value_line = f"R{body.estimated_value:,.0f}" if body.estimated_value else "your property"
        return {
            "subject": f"Regarding your property at {address} (Erf {erf_no})",
            "body": (
                f"Dear {owner},\n\n"
                f"We are reaching out regarding {address}, {suburb} (Erf {erf_no}) with "
                f"{brief}, currently estimated at {value_line}.\n\n"
                f"Please reply or call us at your convenience to discuss further.\n\n"
                f"Warm regards,\nPtah-Realty"
            ),
            "generatedBy": "template_fallback",
        }


class PropertyValuationRequest(BaseModel):
    propertyId: str
    property: dict[str, Any]
    condition: str = "GOOD"
    customBuildingM2: float | None = None
    customExtentM2: float | None = None
    customAdjustments: dict[str, Any] = Field(default_factory=dict)


# Condition rating multiplier applied to the base per-m2 rate. Matches the
# labels used by AccommodationDetails['condition'] on the frontend.
_CONDITION_MULTIPLIER = {
    "POOR": 0.82,
    "FAIR": 0.92,
    "GOOD": 1.0,
    "EXCELLENT": 1.12,
    "UNDER RENOVATION": 0.88,
}

# Flat ZAR additions for common amenities, disclosed individually in the
# response so the breakdown is auditable rather than a single opaque bump.
_AMENITY_VALUES = {
    "pool": (85000, "In-ground swimming pool"),
    "borehole": (65000, "Registered borehole / private water supply"),
    "alarm": (12000, "Armed alarm system"),
    "perimSecurity": (35000, "Perimeter security / electric fencing"),
    "sprinklerSys": (18000, "Irrigation sprinkler system"),
    "garden": (20000, "Landscaped garden"),
}


def _compute_individual_valuation(body: PropertyValuationRequest) -> dict:
    prop = body.property
    accommodation = prop.get("accommodation") or {}
    land_m2 = body.customExtentM2 or prop.get("extentM2") or 0
    building_m2 = body.customBuildingM2 or accommodation.get("buildingM2") or land_m2

    municipal_value = (prop.get("municipalValuation") or {}).get("totalValue") or 0
    last_sale_price = (prop.get("currentSale") or {}).get("salePrice") or 0

    # Base per-m2 rate: prefer the most recent registered sale price over
    # municipal valuation (which lags the market), falling back to a
    # conservative Atlantic Seaboard / City Bowl default rate.
    base_total = last_sale_price or municipal_value or (building_m2 * 45000)
    base_rate_per_m2 = (base_total / building_m2) if building_m2 else 45000

    condition_multiplier = _CONDITION_MULTIPLIER.get(body.condition.upper(), 1.0)

    land_component = land_m2 * base_rate_per_m2 * 0.35
    building_component = building_m2 * base_rate_per_m2 * 0.65 * condition_multiplier

    amenity_breakdown = []
    amenity_total = 0.0
    adjustments = body.customAdjustments or {}
    for key, (value, rationale) in _AMENITY_VALUES.items():
        if adjustments.get(key) or accommodation.get(key):
            amenity_breakdown.append({"name": key, "value": value, "rationale": rationale})
            amenity_total += value

    zoning = (prop.get("zoning") or "").upper()
    zoning_bulk_upside = round((land_component + building_component) * 0.04, 2) if "GB" in zoning or "MU" in zoning else 0.0

    condition_adjustment_value = round(building_component - (building_m2 * base_rate_per_m2 * 0.65), 2)

    subtotal = land_component + building_component + amenity_total + zoning_bulk_upside
    estimated_market_value = round(subtotal, 2)
    price_per_m2 = round(estimated_market_value / building_m2, 2) if building_m2 else 0

    return {
        "estimatedMarketValue": estimated_market_value,
        "pricePerM2": price_per_m2,
        "valueRange": {
            "conservative": round(estimated_market_value * 0.93, 2),
            "target": estimated_market_value,
            "aggressive": round(estimated_market_value * 1.08, 2),
        },
        "confidenceScore": 0.91 if last_sale_price else 0.78,
        "conditionMultiplier": condition_multiplier,
        "buildingSizeM2": building_m2,
        "landExtentM2": land_m2,
        "valuationBreakdown": {
            "landComponentValue": round(land_component, 2),
            "buildingImprovementValue": round(building_component, 2),
            "amenityValueAdditions": round(amenity_total, 2),
            "conditionAdjustmentValue": condition_adjustment_value,
            "zoningBulkUpside": zoning_bulk_upside,
        },
        "amenityBreakdownList": amenity_breakdown,
        "keyDrivers": [a["rationale"] for a in amenity_breakdown] or ["Location", "Extent", "Condition rating"],
        "basis": "registered_sale" if last_sale_price else ("municipal_valuation" if municipal_value else "rate_default"),
    }


# Conservative SA rental-investment rule of thumb: net yield after rates,
# levies, insurance, vacancy allowance and maintenance typically runs
# ~70-80% of gross yield. Disclosed heuristic ratio, not a per-property
# expense calculation -- there's no rates/levies ingestion pipeline to
# compute this exactly (same "heuristic_gross_yield" honesty basis as
# services/valuation.py's rental estimate).
_NET_YIELD_RATIO = 0.75


def _compute_investment_metrics(individual: dict, property_type: str) -> dict:
    estimated_market_value = individual["estimatedMarketValue"]
    yield_pct = _ASSUMED_GROSS_YIELD_PCT.get(property_type, _DEFAULT_GROSS_YIELD_PCT)
    annual_gross_rental = round(estimated_market_value * (yield_pct / 100), 2)
    estimated_monthly_rental = round(annual_gross_rental / 12, 2) if annual_gross_rental else 0.0
    net_yield_percent = round(yield_pct * _NET_YIELD_RATIO, 2)
    return {
        "estimatedMonthlyRental": estimated_monthly_rental,
        "annualGrossRental": annual_gross_rental,
        "grossYieldPercent": yield_pct,
        "netYieldPercent": net_yield_percent,
        # 5-year Rand growth, compounding the estimated market value at the
        # net yield's paired gross rate is wrong -- capital growth is a
        # separate driver from rental yield, so this uses a flat, disclosed
        # long-run SA residential capital-growth assumption (not derived
        # from the yield figures above) rather than conflating the two.
        "capitalGrowth5YearForecast": round(estimated_market_value * ((1.06 ** 5) - 1), 2),
    }


@router.post("/property-valuation")
async def property_valuation(
    body: PropertyValuationRequest,
    request: Request,
    _user: UserPublic = Depends(get_current_user),
) -> dict:
    """Individual erf-basis AI valuation: structural extent, land size,
    condition rating, amenities and zoning bulk, plus a Bedrock-generated
    narrative. Computed deterministically from the property payload the
    client already has (rather than a Mongo comparables lookup), so it
    works for any PropertyRecord regardless of whether it's persisted.

    streetBenchmark/suburbBenchmark (services/benchmarks.py) and
    investmentMetrics (below) DO read from Mongo's `comparables`
    collection -- the same one services/valuation.py's CMA engine uses --
    so those three sections gracefully degrade to None/heuristic defaults
    when there isn't enough comparable data, rather than blocking the
    individual valuation above, which never depended on Mongo at all."""
    prop = body.property
    individual = _compute_individual_valuation(body)

    db = await get_tenant_db(request)
    benchmarks = await compute_benchmarks(db, prop, individual["pricePerM2"])
    investment_metrics = _compute_investment_metrics(individual, resolve_comparable_property_type(prop))

    prompt = f"""Write a concise, factual property appraisal narrative in strict JSON.
Return keys: aiAppraisalNarrative (2-3 sentences, no invented facts).
Property: {prop.get('address')}, {prop.get('suburb')}, Erf {prop.get('erfNo')}.
Extent: {individual['landExtentM2']} m2 land, {individual['buildingSizeM2']} m2 building.
Condition: {body.condition}.
Estimated market value: R{individual['estimatedMarketValue']:,.0f}.
Key drivers: {individual['keyDrivers']}."""
    try:
        narrative = generate_json(
            prompt,
            system_prompt="You are a careful, licensed South African property valuer. Return JSON only. Never invent facts or figures not given to you.",
            max_tokens=400,
        ).get("aiAppraisalNarrative", "")
    except Exception:
        narrative = (
            f"Individual appraisal for {prop.get('address', 'this property')} places the estimated market "
            f"value at R{individual['estimatedMarketValue']:,.0f}, based on registered sale/valuation data, "
            f"condition rating, and disclosed amenities."
        )

    individual["aiAppraisalNarrative"] = narrative

    return {
        "propertyId": body.propertyId,
        "address": prop.get("address", ""),
        "erfNo": prop.get("erfNo", ""),
        "suburb": prop.get("suburb", ""),
        "individualValuation": individual,
        "streetBenchmark": benchmarks.street_benchmark,
        "suburbBenchmark": benchmarks.suburb_benchmark,
        # No comparables needed for this one -- only a nonsensical zero
        # market value (no land/building extent on record) suppresses it.
        "investmentMetrics": investment_metrics if individual["estimatedMarketValue"] > 0 else None,
        "calculatedAt": datetime.now(timezone.utc).isoformat(),
        "modelUsed": "AWS Bedrock (moonshotai.kimi-k2.5 chain) + deterministic erf-basis engine",
    }
