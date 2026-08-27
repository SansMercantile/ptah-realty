"""
PTAH Realty -- Module 5: Search & Retrieval Engine.

Multi-criteria search across properties: free-text (address/suburb/
complex), erf number, owner name, title deed number, or GPS coordinates
+ radius. Also covers auto-suggestion (lightweight prefix search) and
per-user recently-viewed history.

Deliberately does NOT support searching by owner ID number -- that's
identity data that belongs in the KYC module (DocFox integration), not
duplicated here as an unverified search key on our own property records.

Sits alongside api/intelligence_routes.py under a different URL prefix
(/api/v1/realty/search vs /api/v1/intelligence) -- this one operates on
the flatter routes.py property schema for quick lookups; intelligence
routes deal with the richer PropertyRecord/KYC/deeds model.
"""
from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from auth import UserPublic, get_current_user
from tenancy import get_tenant_db

router = APIRouter(prefix="/api/v1/realty/search", tags=["Search & Retrieval"])


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("")
async def search_properties(
    request: Request,
    q: str | None = None,
    erf_number: str | None = None,
    owner_name: str | None = None,
    title_deed_number: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_m: int = 1000,
    limit: int = 25,
    user: UserPublic = Depends(get_current_user),
) -> dict:
    """Multi-criteria property search. GPS search (lat+lng) takes
    priority and ignores other filters, since $near queries can't be
    combined with additional filters without a compound index; the
    other criteria (erf/owner/deed/free-text) can be combined together.
    """
    db = await get_tenant_db(request)

    if lat is not None and lng is not None:
        cursor = db.properties.find({
            "location": {
                "$near": {
                    "$geometry": {"type": "Point", "coordinates": [lng, lat]},
                    "$maxDistance": radius_m,
                }
            }
        }).limit(limit)
        results = [_serialize(r) for r in await cursor.to_list(length=limit)]
        for r in results:
            r["match_reason"] = "gps_radius"
        return {"results": results, "count": len(results)}

    filters = []
    if erf_number:
        filters.append({"erf_number": erf_number})
    if title_deed_number:
        filters.append({"title_deed_number": title_deed_number})
    if owner_name:
        filters.append({"registered_owner": {"$regex": owner_name, "$options": "i"}})
    if q:
        filters.append({"$or": [
            {"address_line": {"$regex": q, "$options": "i"}},
            {"suburb": {"$regex": q, "$options": "i"}},
            {"complex_name": {"$regex": q, "$options": "i"}},
        ]})

    query = {"$and": filters} if filters else {}
    cursor = db.properties.find(query).sort("updated_at", -1).limit(limit)
    results = [_serialize(r) for r in await cursor.to_list(length=limit)]
    return {"results": results, "count": len(results)}


@router.get("/suggest")
async def suggest(request: Request, q: str, limit: int = 8, user: UserPublic = Depends(get_current_user)) -> dict:
    """Lightweight auto-suggestion for a search-as-you-type box --
    prefix match on address/suburb/complex, small result set, minimal
    fields (not the full property document)."""
    if len(q) < 2:
        return {"suggestions": []}
    db = await get_tenant_db(request)
    cursor = db.properties.find(
        {"$or": [
            {"address_line": {"$regex": f"^{q}", "$options": "i"}},
            {"suburb": {"$regex": f"^{q}", "$options": "i"}},
            {"complex_name": {"$regex": f"^{q}", "$options": "i"}},
        ]},
        {"address_line": 1, "suburb": 1, "city": 1, "complex_name": 1},
    ).limit(limit)
    suggestions = [_serialize(r) for r in await cursor.to_list(length=limit)]
    return {"suggestions": suggestions}


class RecentlyViewedCreate(BaseModel):
    property_id: str


@router.post("/recently-viewed")
async def record_recently_viewed(body: RecentlyViewedCreate, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    await db.recently_viewed.update_one(
        {"user_id": user.id, "property_id": body.property_id},
        {"$set": {"viewed_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    return {"recorded": True}


@router.get("/recently-viewed")
async def get_recently_viewed(request: Request, limit: int = 20, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    cursor = db.recently_viewed.find({"user_id": user.id}).sort("viewed_at", -1).limit(limit)
    views = await cursor.to_list(length=limit)
    property_ids = [ObjectId(v["property_id"]) for v in views]
    props_by_id = {}
    if property_ids:
        async for p in db.properties.find({"_id": {"$in": property_ids}}):
            props_by_id[str(p["_id"])] = _serialize(p)
    ordered = [props_by_id[v["property_id"]] for v in views if v["property_id"] in props_by_id]
    return {"properties": ordered}
