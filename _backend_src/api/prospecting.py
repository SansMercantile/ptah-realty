"""
PTAH Realty -- Module 4: Prospecting & Lead Generation Engine.

Market filters (days on market, ownership duration, sale type), owner
birthday/anniversary tracking for prospecting outreach, lead management,
and a content repository for seller objection scripts / prospecting
guides.

owner_contacts stores name + birthday/anniversary + contact info for
prospecting purposes only (relationship/CRM data) -- NOT identity
verification data. ID numbers and verified identity documents belong in
the KYC module (DocFox integration), never here.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from auth import UserPublic, get_current_user
from tenancy import get_tenant_db

router = APIRouter(prefix="/api/v1/realty/prospecting", tags=["Prospecting & Lead Generation"])


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


# ---------------------------------------------------------------------
# Market filters (DOM, ownership duration, sale type)
# ---------------------------------------------------------------------

@router.get("/filter")
async def filter_prospects(
    request: Request,
    suburb: str | None = None,
    property_type: str | None = None,
    tenure_type: str | None = None,
    dom_min_days: int | None = None,
    dom_max_days: int | None = None,
    limit: int = 50,
    user: UserPublic = Depends(get_current_user),
) -> dict:
    """Filters properties for prospecting. Days-on-market is computed
    from created_at (when the property first entered the system) --
    a dedicated listing_date field, distinct from when we ourselves
    recorded it, is a natural future enhancement if that distinction
    matters for a given tenant's workflow.
    """
    db = await get_tenant_db(request)
    query: dict = {}
    if suburb:
        query["suburb"] = {"$regex": suburb, "$options": "i"}
    if property_type:
        query["property_type"] = property_type
    if tenure_type:
        query["tenure_type"] = tenure_type

    now = datetime.now(timezone.utc)
    if dom_min_days is not None:
        query["created_at"] = {**query.get("created_at", {}), "$lte": now - timedelta(days=dom_min_days)}
    if dom_max_days is not None:
        query["created_at"] = {**query.get("created_at", {}), "$gte": now - timedelta(days=dom_max_days)}

    cursor = db.properties.find(query).sort("created_at", 1).limit(limit)
    results = []
    async for p in cursor:
        dom_days = (now - p["created_at"].replace(tzinfo=timezone.utc)).days if p.get("created_at") else None
        p = _serialize(p)
        p["days_on_market"] = dom_days
        results.append(p)
    return {"results": results, "count": len(results)}


# ---------------------------------------------------------------------
# Owner contacts: birthdays / anniversaries (relationship data, not KYC)
# ---------------------------------------------------------------------

class OwnerContactCreate(BaseModel):
    property_id: str
    name: str
    phone: str | None = None
    email: str | None = None
    birthday: date | None = None          # month/day matters most; year optional context
    purchase_anniversary: date | None = None
    notes: str | None = None


@router.post("/owner-contacts")
async def create_owner_contact(body: OwnerContactCreate, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    if await db.properties.find_one({"_id": ObjectId(body.property_id)}) is None:
        raise HTTPException(status_code=404, detail="property_not_found")
    doc = {**body.model_dump(), "created_at": datetime.now(timezone.utc)}
    # Store dates as ISO strings for simple month/day matching below --
    # avoids datetime/date serialization edge cases in Mongo queries.
    if doc.get("birthday"):
        doc["birthday"] = doc["birthday"].isoformat()
    if doc.get("purchase_anniversary"):
        doc["purchase_anniversary"] = doc["purchase_anniversary"].isoformat()
    result = await db.owner_contacts.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.get("/owner-contacts/upcoming")
async def upcoming_dates(request: Request, days: int = 30, user: UserPublic = Depends(get_current_user)) -> dict:
    """Owner birthdays/anniversaries falling within the next `days` days
    (month/day match, ignoring year) -- a ready-made 'call today' list."""
    db = await get_tenant_db(request)
    today = date.today()
    window = [today + timedelta(days=i) for i in range(days + 1)]
    window_md = {(d.month, d.day) for d in window}

    upcoming = []
    async for c in db.owner_contacts.find():
        for field in ("birthday", "purchase_anniversary"):
            raw = c.get(field)
            if not raw:
                continue
            d = date.fromisoformat(raw)
            if (d.month, d.day) in window_md:
                upcoming.append({
                    "id": str(c["_id"]),
                    "property_id": c["property_id"],
                    "name": c["name"],
                    "phone": c.get("phone"),
                    "email": c.get("email"),
                    "event": field,
                    "date": raw,
                })
    return {"upcoming": upcoming}


# ---------------------------------------------------------------------
# Lead management
# ---------------------------------------------------------------------

class LeadCreate(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None
    source: str | None = None
    property_id: str | None = None
    notes: str | None = None


class LeadUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None


@router.post("/leads")
async def create_lead(body: LeadCreate, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    doc = {
        **body.model_dump(),
        "status": "new",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.leads.insert_one(doc)
    return {"id": str(result.inserted_id), "status": "new"}


@router.get("/leads")
async def list_leads(request: Request, status: str | None = None, limit: int = 100, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    query = {"status": status} if status else {}
    cursor = db.leads.find(query).sort("created_at", -1).limit(limit)
    leads = [_serialize(l) for l in await cursor.to_list(length=limit)]
    return {"leads": leads}


@router.patch("/leads/{lead_id}")
async def update_lead(lead_id: str, body: LeadUpdate, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    changes = {k: v for k, v in body.model_dump().items() if v is not None}
    if not changes:
        raise HTTPException(status_code=400, detail="No fields provided to update.")
    changes["updated_at"] = datetime.now(timezone.utc)
    result = await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": changes})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="lead_not_found")
    return {"updated": True}


# ---------------------------------------------------------------------
# Content repository: seller objection scripts / prospecting guides
# ---------------------------------------------------------------------

class ScriptCreate(BaseModel):
    title: str
    category: str  # e.g. "objection_handling", "cold_call_opener", "listing_pitch"
    body: str


@router.post("/scripts")
async def create_script(body: ScriptCreate, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    doc = {**body.model_dump(), "created_at": datetime.now(timezone.utc)}
    result = await db.prospecting_scripts.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.get("/scripts")
async def list_scripts(request: Request, category: str | None = None, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    query = {"category": category} if category else {}
    cursor = db.prospecting_scripts.find(query).sort("created_at", -1)
    scripts = [_serialize(s) for s in await cursor.to_list(length=200)]
    return {"scripts": scripts}
