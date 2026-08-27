"""Property search and suburb analytics -- real MongoDB implementation.

Queries the SAME `properties` collection used by the core CMA valuation
flow (api/routes.py) rather than a separate dataset, so this module and
the existing valuation/comparables features share one source of truth
per tenant. Maps between that flatter existing document shape and the
richer PropertyRecord/DemographicAnalytics domain models.

registered_owner/bond_holder on the underlying property document are
plain names (not ID numbers) -- verified identity data belongs in the
KYC module (services/kyc.py, DocFox integration once configured), never
duplicated here as unverified free text.
"""
from __future__ import annotations

from datetime import date, datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase

from models import (
    Accommodation, DemographicAnalytics, Owner, PropertyCategory,
    PropertyRecord, PropertyStatus, Transfer,
)
from schemas import AnalyticsQuery, PropertySearchQuery

# Existing property_type values (routes.py PropertyCreate) that count as
# sectional-title-style stock for demographic purposes when no explicit
# tenure_type was set.
_SECTIONAL_TYPES = {"apartment", "townhouse"}


def _to_category(doc: dict) -> PropertyCategory:
    tenure = doc.get("tenure_type")
    if tenure in ("sectional_title", "freehold"):
        return PropertyCategory(tenure)
    if doc.get("property_type") == "commercial":
        return PropertyCategory.commercial
    if doc.get("property_type") in _SECTIONAL_TYPES:
        return PropertyCategory.sectional_title
    return PropertyCategory.freehold


def _doc_to_record(doc: dict, transfers: list[dict]) -> PropertyRecord:
    coords = (doc.get("location") or {}).get("coordinates", [None, None])
    lng, lat = coords[0], coords[1]

    owners: list[Owner] = []
    if doc.get("registered_owner"):
        owners.append(Owner(id=f"owner-{doc['_id']}", full_name=doc["registered_owner"]))

    bonds = []
    if doc.get("bond_holder"):
        from models import Bond
        bonds = [Bond(lender=doc["bond_holder"], bond_number="", amount=0)]

    accommodation = None
    if any(doc.get(k) is not None for k in ("bedrooms", "bathrooms", "garage_count", "has_pool", "condition_rating")):
        accommodation = Accommodation(
            bedrooms=doc.get("bedrooms") or 0,
            bathrooms=doc.get("bathrooms") or 0,
            garages=doc.get("garage_count") or 0,
            pool=bool(doc.get("has_pool")),
            condition_rating=doc.get("condition_rating") or 3,
        )

    record_transfers = [
        Transfer(
            id=str(t["_id"]),
            property_id=str(doc["_id"]),
            transfer_date=t["transfer_date"].date() if isinstance(t["transfer_date"], datetime) else t["transfer_date"],
            sale_price=t.get("price") or 0,
            seller_names=[t["seller"]] if t.get("seller") else [],
            buyer_names=[t["buyer"]] if t.get("buyer") else [],
            title_deed_number=t.get("deed_number"),
        )
        for t in transfers
    ]

    updated_at = doc.get("updated_at") or datetime.now(timezone.utc)
    if updated_at.tzinfo is None:
        updated_at = updated_at.replace(tzinfo=timezone.utc)

    return PropertyRecord(
        id=str(doc["_id"]),
        province=doc.get("province") or "",
        suburb=doc.get("suburb", ""),
        city=doc.get("city", ""),
        street_address=doc.get("address_line", ""),
        erf_number=doc.get("erf_number"),
        category=_to_category(doc),
        zoning=doc.get("zoning"),
        land_extent_sqm=doc.get("erf_size_sqm"),
        building_extent_sqm=doc.get("floor_size_sqm"),
        latitude=lat if lat is not None else 0.0,
        longitude=lng if lng is not None else 0.0,
        title_deed_number=doc.get("title_deed_number"),
        municipal_value=doc.get("municipal_valuation"),
        status=PropertyStatus.active if doc.get("status") != "archived" else PropertyStatus.archived,
        owners=owners,
        transfers=record_transfers,
        bonds=bonds,
        accommodation=accommodation,
        updated_at=updated_at,
    )


async def search_properties(db: AsyncIOMotorDatabase, query: PropertySearchQuery) -> list[PropertyRecord]:
    if query.latitude is not None and query.longitude is not None:
        cursor = db.properties.find({
            "location": {
                "$near": {
                    "$geometry": {"type": "Point", "coordinates": [query.longitude, query.latitude]},
                    "$maxDistance": query.radius_m,
                }
            }
        }).limit(100)
        docs = await cursor.to_list(length=100)
    else:
        mongo_query: dict = {}
        if query.province:
            mongo_query["province"] = query.province
        if query.suburb:
            mongo_query["suburb"] = {"$regex": f"^{query.suburb}$", "$options": "i"}
        if query.erf_number:
            mongo_query["erf_number"] = query.erf_number
        if query.title_deed_number:
            mongo_query["title_deed_number"] = query.title_deed_number
        if query.owner_name:
            mongo_query["registered_owner"] = {"$regex": query.owner_name, "$options": "i"}
        if query.street_address:
            mongo_query["address_line"] = {"$regex": query.street_address, "$options": "i"}
        # query.owner_id / farm_number intentionally not queryable here --
        # owner ID numbers aren't stored on property docs (see module
        # docstring); farm_number has no equivalent field yet.
        cursor = db.properties.find(mongo_query).limit(100)
        docs = await cursor.to_list(length=100)

    records = []
    for doc in docs:
        transfers = await db.title_transfers.find({"property_id": str(doc["_id"])}).to_list(length=50)
        records.append(_doc_to_record(doc, transfers))
    return records


async def suburb_analytics(db: AsyncIOMotorDatabase, query: AnalyticsQuery) -> DemographicAnalytics:
    match: dict = {}
    if query.province:
        match["province"] = query.province
    if query.suburb:
        match["suburb"] = {"$regex": f"^{query.suburb}$", "$options": "i"}

    docs = await db.properties.find(match).to_list(length=None)
    property_count = len(docs)
    sectional_count = sum(1 for d in docs if _to_category(d) == PropertyCategory.sectional_title)
    freehold_count = sum(1 for d in docs if _to_category(d) == PropertyCategory.freehold)

    doc_ids = [str(d["_id"]) for d in docs]
    transfer_docs = []
    if doc_ids:
        transfer_docs = await db.title_transfers.find({"property_id": {"$in": doc_ids}}).to_list(length=None)

    in_range_prices = []
    for t in transfer_docs:
        t_date = t["transfer_date"]
        t_year = t_date.year if isinstance(t_date, (datetime, date)) else None
        if t_year and query.start_year <= t_year <= query.end_year and t.get("price"):
            in_range_prices.append(t["price"])

    total = sum(in_range_prices)
    return DemographicAnalytics(
        province=query.province,
        suburb=query.suburb,
        start_year=query.start_year,
        end_year=query.end_year,
        property_count=property_count,
        sectional_title_count=sectional_count,
        freehold_count=freehold_count,
        total_transfer_value=total,
        average_transfer_value=(total / len(in_range_prices)) if in_range_prices else 0,
    )
