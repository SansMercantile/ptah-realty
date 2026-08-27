"""
PTAH Realty -- Module 1: Suburb & Demographic Analytics.

Geographical filtering (suburb/city) with property distribution
analytics -- counts and price stats broken down by property type and
tenure (sectional title vs freehold), over a historical date range.

Sits alongside api/intelligence_routes.py's /analytics/suburbs (which
uses the richer PropertyRecord model and DemographicAnalytics schema) --
this one is a lighter-weight version over the flatter routes.py property
schema, matching the documented /api/v1/realty/analytics production
route.
"""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, Request

from auth import UserPublic, get_current_user
from tenancy import get_tenant_db

router = APIRouter(prefix="/api/v1/realty/analytics", tags=["Suburb & Demographic Analytics"])


@router.get("/suburb-summary")
async def suburb_summary(
    request: Request,
    suburb: str | None = None,
    city: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    user: UserPublic = Depends(get_current_user),
) -> dict:
    db = await get_tenant_db(request)

    match: dict = {}
    if suburb:
        match["suburb"] = suburb
    if city:
        match["city"] = city
    if date_from or date_to:
        match["created_at"] = {}
        if date_from:
            match["created_at"]["$gte"] = date_from
        if date_to:
            match["created_at"]["$lte"] = date_to

    pipeline = [
        {"$match": match},
        {"$facet": {
            "by_property_type": [
                {"$group": {"_id": "$property_type", "count": {"$sum": 1}, "avg_price": {"$avg": "$asking_price"}}},
            ],
            "by_tenure": [
                {"$group": {"_id": "$tenure_type", "count": {"$sum": 1}}},
            ],
            "totals": [
                {"$group": {"_id": None, "count": {"$sum": 1}, "avg_price": {"$avg": "$asking_price"}, "prices": {"$push": "$asking_price"}}},
            ],
        }},
    ]

    result = await db.properties.aggregate(pipeline).to_list(length=1)
    facets = result[0] if result else {"by_property_type": [], "by_tenure": [], "totals": []}
    totals = facets["totals"][0] if facets["totals"] else {"count": 0, "avg_price": None, "prices": []}

    prices = sorted(p for p in totals.get("prices", []) if p is not None)
    median_price = None
    if prices:
        mid = len(prices) // 2
        median_price = prices[mid] if len(prices) % 2 else (prices[mid - 1] + prices[mid]) / 2

    return {
        "suburb": suburb,
        "city": city,
        "total_count": totals.get("count", 0),
        "avg_price": totals.get("avg_price"),
        "median_price": median_price,
        "by_property_type": [
            {"property_type": f["_id"], "count": f["count"], "avg_price": f["avg_price"]}
            for f in facets["by_property_type"]
        ],
        "by_tenure": [{"tenure_type": f["_id"], "count": f["count"]} for f in facets["by_tenure"]],
    }


@router.get("/suburbs")
async def list_suburbs(request: Request, city: str | None = None, user: UserPublic = Depends(get_current_user)) -> dict:
    """Distinct suburbs available for geographical filtering, optionally
    scoped to a city."""
    db = await get_tenant_db(request)
    query = {"city": city} if city else {}
    suburbs = await db.properties.distinct("suburb", query)
    return {"suburbs": sorted(suburbs)}
