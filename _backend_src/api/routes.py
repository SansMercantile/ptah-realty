"""
PTAH Realty -- HTTP API (FastAPI + Motor/MongoDB).

Multi-tenant (Phase 1b, 2026-08-20): every route below resolves its
database via tenancy.get_tenant_db(request), which looks up the tenant by
the request's Host header and returns that tenant's own separate
database -- falling back to the original single db.get_db() for
unregistered domains (local dev, health checks, staging). See tenancy.py.
"""

from __future__ import annotations

import os
import math
import secrets
import uuid
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field

from auth import (
    LoginRequest,
    TokenResponse,
    UserPublic,
    UserRole,
    authenticate,
    create_access_token,
    create_user,
    get_current_user,
    require_admin,
)
from config import settings
from db import ensure_indexes
from services.vercel_domains import VercelError, add_domain_to_project
from tenancy import Tenant, TenantBranding, get_control_db, get_request_domain, get_tenant_database, get_tenant_db, resolve_tenant_by_domain
from services.valuation import ValuationError, ValuationMethod, compute_valuation
from services.reports import generate_narrative, render_report_pdf
from services.property24_ingest import ingest_from_apify
from services.property24_feed import ListingPayload, generate_listing_feed_xml, EntegralSyncAdapter
from services.media import MediaError, delete_media_file, media_url_to_path, save_media_file
from services.geocoding import geocode_address

router = APIRouter(prefix="/api/v1/realty", tags=["Realty Valuation"])


# Generic fallback branding for domains not yet registered as a tenant
# (local dev, a staging preview URL, etc.) -- shows plain Ptah branding
# rather than erroring so those environments still render sensibly.
_FALLBACK_BRANDING = {
    "display_name": "Ptah Realty",
    "logo_url": None,
    "primary_color": "#f59e0b",
    "accent_color": "#f59e0b",
    "powered_by_ptah": True,
}


@router.get("/branding")
async def get_branding(request: Request) -> dict:
    """Returns this tenant's branding (display name, logo, colors) for the
    frontend to render, resolved from the request's client-facing domain
    (see tenancy.get_request_domain -- NOT the raw Host header, which
    Vercel's proxy overwrites with a fixed destination). See tenancy.py
    for the multi-tenant model this is the first slice of."""
    tenant = await resolve_tenant_by_domain(get_request_domain(request))
    if tenant is None:
        return _FALLBACK_BRANDING
    return {**tenant.branding.model_dump(), "powered_by_ptah": True}


@router.post("/auth/login")
async def login(body: LoginRequest, request: Request) -> TokenResponse:
    db = await get_tenant_db(request)
    user = await authenticate(db, body.email, body.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    request_host = get_request_domain(request)
    token = create_access_token(user.id, request_host)
    return TokenResponse(access_token=token, user=user)


@router.get("/auth/me")
async def get_me(user: UserPublic = Depends(get_current_user)) -> dict:
    return {"user": user}


class TenantCreateRequest(BaseModel):
    slug: str
    domain: str
    display_name: str
    logo_url: str | None = None
    primary_color: str = "#f59e0b"
    accent_color: str = "#f59e0b"
    admin_email: str
    admin_name: str
    mongodb_uri: str | None = None  # defaults to the platform's own Atlas cluster


@router.post("/platform/tenants", status_code=201)
async def create_tenant(body: TenantCreateRequest, admin: UserPublic = Depends(require_admin)) -> dict:
    """Onboards a new tenant company: registers it in the control plane,
    provisions its own separate database + indexes, and bootstraps its
    first admin user. Restricted to admins of the CALLING tenant -- in
    practice that means only Sans Mercantile's own admins (calling from
    ptahrealty.sansmercantile.com) can provision new customer tenants;
    each tenant's own admins manage their own users, not other tenants'.
    """
    control_db = get_control_db()
    domain = body.domain.lower()
    if await control_db.tenants.find_one({"domain": domain}) is not None:
        raise HTTPException(status_code=409, detail=f"A tenant already exists for domain {domain}.")

    mongodb_uri = body.mongodb_uri or settings.MONGODB_URI
    mongodb_db_name = f"ptah_realty_{body.slug}"

    tenant_doc = {
        "slug": body.slug,
        "domain": domain,
        "branding": {
            "display_name": body.display_name,
            "logo_url": body.logo_url,
            "primary_color": body.primary_color,
            "accent_color": body.accent_color,
        },
        "mongodb_uri": mongodb_uri,
        "mongodb_db_name": mongodb_db_name,
        "status": "active",
        "created_at": datetime.now(timezone.utc),
    }
    result = await control_db.tenants.insert_one(tenant_doc)

    tenant = Tenant(
        id=str(result.inserted_id),
        slug=body.slug,
        domain=domain,
        branding=TenantBranding(
            display_name=body.display_name,
            logo_url=body.logo_url,
            primary_color=body.primary_color,
            accent_color=body.accent_color,
        ),
        mongodb_uri=mongodb_uri,
        mongodb_db_name=mongodb_db_name,
    )
    new_tenant_db = get_tenant_database(tenant)
    await ensure_indexes(new_tenant_db)

    admin_password = secrets.token_urlsafe(16)
    created_admin = await create_user(new_tenant_db, body.admin_email, admin_password, body.admin_name, role=UserRole.admin)

    # Domain attach is best-effort: the tenant record and admin account
    # above are already fully valid without it, so a Vercel-side failure
    # (bad credentials, domain already attached elsewhere, transient API
    # error) shouldn't fail the whole onboarding call -- it's reported
    # back so the caller knows to finish it manually if needed.
    domain_result = None
    domain_error = None
    try:
        domain_result = await add_domain_to_project(domain)
    except VercelError as exc:
        domain_error = str(exc)

    return {
        "tenant_id": tenant.id,
        "domain": tenant.domain,
        "admin": created_admin,
        "admin_temp_password": admin_password,  # shown once here only -- never persisted in plaintext
        "domain_setup": domain_result,
        "domain_setup_error": domain_error,
    }


class PropertyCreate(BaseModel):
    address_line: str
    suburb: str
    city: str
    property_type: str
    complex_name: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    erf_size_sqm: float | None = None
    floor_size_sqm: float | None = None
    lat: float | None = None  # fallback only -- see geocode_address() in create_property below
    lng: float | None = None
    asking_price: float | None = None
    # Cadastral / title (Module 2 -- Property & Title Information Panel).
    # registered_owner is a name only, not an ID number -- identity
    # verification data belongs in the KYC module (DocFox integration),
    # not duplicated here as unverified free text.
    erf_number: str | None = None
    title_deed_number: str | None = None
    zoning: str | None = None
    registered_owner: str | None = None
    bond_holder: str | None = None
    municipal_valuation: float | None = None
    tenure_type: str | None = None  # "sectional_title" | "freehold"
    # Structural accommodation editor
    garage_count: int | None = None
    has_pool: bool | None = None
    condition_rating: int | None = Field(default=None, ge=1, le=5)


class ValuationRequest(BaseModel):
    property_id: str
    method: ValuationMethod | None = None
    radius_m: int = Field(default=1500, gt=0, le=20_000)


class ReportRequest(BaseModel):
    property_id: str
    valuation_snapshot_id: str


class PublishRequest(BaseModel):
    property_id: str
    description: str
    price: float
    agent_name: str | None = None
    agent_email: str | None = None


class IngestRequest(BaseModel):
    search_location: str
    property_type: str = "apartment"
    max_items: int = Field(default=100, le=500)


@router.post("/properties")
async def create_property(body: PropertyCreate, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)

    # Real address geocoding is authoritative -- a caller-supplied lat/lng
    # (manual entry, or a rough client-side estimate) is only a fallback
    # for the rare case geocoding can't resolve the address at all. This
    # is what stops a mistyped/approximate coordinate from silently
    # persisting as if it were a verified location (see geocoding.py).
    geocoded = await geocode_address(body.address_line, body.suburb, body.city)
    if geocoded is not None:
        lat, lng = geocoded
        geocoding_source = "nominatim"
    elif body.lat is not None and body.lng is not None:
        lat, lng = body.lat, body.lng
        geocoding_source = "caller_provided_unverified"
    else:
        raise HTTPException(
            status_code=422,
            detail="Could not geocode this address, and no fallback lat/lng was provided.",
        )

    doc = {
        **body.model_dump(exclude={"lat", "lng"}),
        "location": {"type": "Point", "coordinates": [lng, lat]},
        "geocoding_source": geocoding_source,
        "status": "draft",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.properties.insert_one(doc)
    return {"id": str(result.inserted_id), "status": "draft", "geocoding_source": geocoding_source}


@router.get("/properties")
async def list_properties(request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    cursor = db.properties.find().sort("created_at", -1).limit(200)
    props = await cursor.to_list(length=200)
    for p in props:
        p["id"] = str(p.pop("_id"))
    return {"properties": props}


@router.get("/properties/{property_id}")
async def get_property(property_id: str, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    prop = await db.properties.find_one({"_id": ObjectId(property_id)})
    if prop is None:
        raise HTTPException(status_code=404, detail="property_not_found")
    prop["id"] = str(prop.pop("_id"))
    return {"property": prop}


class PropertyUpdate(BaseModel):
    """Partial update for the Property & Title Information Panel /
    structural accommodation editor. Every field optional -- only
    fields the caller actually sends get changed."""
    complex_name: str | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    erf_size_sqm: float | None = None
    floor_size_sqm: float | None = None
    asking_price: float | None = None
    erf_number: str | None = None
    title_deed_number: str | None = None
    zoning: str | None = None
    registered_owner: str | None = None
    bond_holder: str | None = None
    municipal_valuation: float | None = None
    tenure_type: str | None = None
    garage_count: int | None = None
    has_pool: bool | None = None
    condition_rating: int | None = Field(default=None, ge=1, le=5)


@router.patch("/properties/{property_id}")
async def update_property(property_id: str, body: PropertyUpdate, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    changes = {k: v for k, v in body.model_dump().items() if v is not None}
    if not changes:
        raise HTTPException(status_code=400, detail="No fields provided to update.")
    changes["updated_at"] = datetime.now(timezone.utc)
    result = await db.properties.update_one({"_id": ObjectId(property_id)}, {"$set": changes})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="property_not_found")
    return {"updated": True, "fields": list(changes.keys() - {"updated_at"})}


class TransferCreate(BaseModel):
    """A historical sale/transfer record for a property's title history."""
    transfer_date: datetime
    seller: str | None = None
    buyer: str | None = None
    price: float | None = None
    deed_number: str | None = None


@router.post("/properties/{property_id}/transfers")
async def add_transfer(property_id: str, body: TransferCreate, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    if await db.properties.find_one({"_id": ObjectId(property_id)}) is None:
        raise HTTPException(status_code=404, detail="property_not_found")
    doc = {**body.model_dump(), "property_id": property_id, "created_at": datetime.now(timezone.utc)}
    result = await db.title_transfers.insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.get("/properties/{property_id}/transfers")
async def list_transfers(property_id: str, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    cursor = db.title_transfers.find({"property_id": property_id}).sort("transfer_date", -1)
    transfers = await cursor.to_list(length=200)
    for t in transfers:
        t["id"] = str(t.pop("_id"))
    return {"transfers": transfers}


@router.post("/properties/{property_id}/media")
async def upload_media(
    property_id: str,
    request: Request, user: UserPublic = Depends(get_current_user),
    file: UploadFile = File(...),
    condition_notes: str | None = Form(default=None),
    sort_order: int = Form(default=0),
) -> dict:
    db = await get_tenant_db(request)
    prop = await db.properties.find_one({"_id": ObjectId(property_id)})
    if prop is None:
        raise HTTPException(status_code=404, detail="property_not_found")

    try:
        original_url = await save_media_file(property_id, file)
    except MediaError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    doc = {
        "property_id": property_id,
        "kind": "photo",
        "original_url": original_url,
        "condition_notes": condition_notes,
        "sort_order": sort_order,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.media_assets.insert_one(doc)
    return {"id": str(result.inserted_id), **{k: v for k, v in doc.items() if k != "created_at"}}


@router.get("/properties/{property_id}/media")
async def list_media(property_id: str, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    cursor = db.media_assets.find({"property_id": property_id}).sort("sort_order", 1)
    media = await cursor.to_list(length=100)
    for m in media:
        m["id"] = str(m.pop("_id"))
    return {"media": media}


@router.delete("/media/{media_id}")
async def delete_media(media_id: str, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    doc = await db.media_assets.find_one({"_id": ObjectId(media_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="media_not_found")
    if doc.get("original_url"):
        delete_media_file(doc["original_url"])
    await db.media_assets.delete_one({"_id": ObjectId(media_id)})
    return {"deleted": True}


@router.post("/valuation")
async def compute_and_save_valuation(body: ValuationRequest, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    prop = await db.properties.find_one({"_id": ObjectId(body.property_id)})
    if prop is None:
        raise HTTPException(status_code=404, detail="property_not_found")

    try:
        snapshot = await compute_valuation(db, prop, body.method, body.radius_m)
    except ValuationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    doc = {
        "property_id": body.property_id,
        "method": snapshot.method,
        "radius_m": snapshot.radius_m,
        "comparable_count": snapshot.comparable_count,
        "price_per_sqm": snapshot.price_per_sqm,
        "estimated_value": snapshot.estimated_value,
        "confidence_score": snapshot.confidence_score,
        "comparable_ids": snapshot.comparable_ids,
        "price_basis": snapshot.price_basis,
        "market_context": snapshot.market_context,
        "estimated_monthly_rental": snapshot.estimated_monthly_rental,
        "rental_yield_percent": snapshot.rental_yield_percent,
        "rental_estimate_basis": snapshot.rental_estimate_basis,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.valuation_snapshots.insert_one(doc)
    return {"id": str(result.inserted_id), **{k: v for k, v in doc.items() if k not in ("property_id", "_id")}}


@router.get("/valuation/{property_id}/latest")
async def get_latest_valuation(property_id: str, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    doc = await db.valuation_snapshots.find_one(
        {"property_id": property_id}, sort=[("created_at", -1)]
    )
    if doc is None:
        raise HTTPException(status_code=404, detail="no_valuation_found")
    doc["id"] = str(doc.pop("_id"))
    return {"valuation": doc}


@router.get("/valuation/by-id/{valuation_id}/comparables")
async def get_valuation_comparables(valuation_id: str, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    """Full comparable records for a saved valuation snapshot -- the
    snapshot itself only stores comparable_ids (see compute_valuation),
    this is the route to resolve those into the actual documents for a
    comparables table in the UI. Also computes a distance-to-subject
    (only when both the subject property and the comparable have a
    location) and a similarity score against the subject property, since
    neither is stored on the comparable itself."""
    db = await get_tenant_db(request)
    snap = await db.valuation_snapshots.find_one({"_id": ObjectId(valuation_id)})
    if snap is None:
        raise HTTPException(status_code=404, detail="valuation_not_found")
    prop = await db.properties.find_one({"_id": ObjectId(snap["property_id"])})

    ids = [ObjectId(cid) for cid in snap.get("comparable_ids", [])]
    cursor = db.comparables.find({"_id": {"$in": ids}})
    comps = await cursor.to_list(length=len(ids) or 1)

    subject_size = (prop or {}).get("floor_size_sqm")
    subject_beds = (prop or {}).get("bedrooms")
    subject_coords = ((prop or {}).get("location") or {}).get("coordinates")

    results = []
    for c in comps:
        c["id"] = str(c.pop("_id"))
        price = c.get("sale_price") or c.get("list_price")
        c["price_per_sqm"] = round(price / c["floor_size_sqm"], 2) if price and c.get("floor_size_sqm") else None

        # Similarity: a plain, disclosed heuristic (not a learned/verified
        # model) based on how close floor size and bedroom count are to
        # the subject property -- good enough to sort/color a comps table,
        # not a claim of statistical rigor.
        similarity = 100.0
        if subject_size and c.get("floor_size_sqm"):
            pct_diff = abs(c["floor_size_sqm"] - subject_size) / subject_size
            similarity -= min(pct_diff * 100, 40)
        if subject_beds is not None and c.get("bedrooms") is not None:
            similarity -= min(abs(c["bedrooms"] - subject_beds) * 8, 24)
        c["similarity_score"] = round(max(similarity, 40.0), 1)

        comp_coords = (c.get("location") or {}).get("coordinates")
        if subject_coords and comp_coords:
            lng1, lat1 = subject_coords
            lng2, lat2 = comp_coords
            R = 6371000
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            dphi = math.radians(lat2 - lat1)
            dlambda = math.radians(lng2 - lng1)
            a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
            c["distance_m"] = round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))
        else:
            c["distance_m"] = None

        results.append(c)

    results.sort(key=lambda c: (c["distance_m"] is None, c["distance_m"] or 0))
    return {"comparables": results}


@router.post("/reports/generate")
async def generate_report(body: ReportRequest, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    prop = await db.properties.find_one({"_id": ObjectId(body.property_id)})
    snap_doc = await db.valuation_snapshots.find_one({"_id": ObjectId(body.valuation_snapshot_id)})
    if prop is None or snap_doc is None:
        raise HTTPException(status_code=404, detail="property_or_valuation_not_found")

    class _Snap:
        method = snap_doc["method"]
        radius_m = snap_doc.get("radius_m")
        comparable_count = snap_doc["comparable_count"]
        price_per_sqm = snap_doc["price_per_sqm"]
        estimated_value = snap_doc["estimated_value"]
        confidence_score = snap_doc["confidence_score"]
        price_basis = snap_doc.get("price_basis", "sold")

    report_doc = {
        "property_id": body.property_id,
        "valuation_snapshot_id": body.valuation_snapshot_id,
        "status": "rendering",
        "created_at": datetime.now(timezone.utc),
    }
    insert_result = await db.reports.insert_one(report_doc)
    report_id = str(insert_result.inserted_id)

    try:
        media_cursor = db.media_assets.find({"property_id": body.property_id}).sort("sort_order", 1)
        media = await media_cursor.to_list(length=100)
        condition_notes = [m["condition_notes"] for m in media if m.get("condition_notes")]

        narrative = generate_narrative(prop, _Snap(), condition_notes)

        os.makedirs(settings.REPORTS_DIR, exist_ok=True)
        pdf_path = os.path.join(settings.REPORTS_DIR, f"{report_id}.pdf")
        # media stores a /media/... URL (served by the static mount), but
        # the PDF renderer needs a real filesystem path -- convert here.
        photo_urls = [m.get("print_variant_url") or m.get("original_url") for m in media if m.get("kind") == "photo"]
        photo_paths = [media_url_to_path(u) for u in photo_urls if u]
        render_report_pdf(prop, _Snap(), narrative, photo_paths, pdf_path)

        await db.reports.update_one(
            {"_id": insert_result.inserted_id},
            {"$set": {"status": "ready", "narrative": narrative, "pdf_path": pdf_path}},
        )
        return {"report_id": report_id, "status": "ready", "pdf_path": pdf_path}
    except Exception as exc:  # noqa: BLE001
        await db.reports.update_one(
            {"_id": insert_result.inserted_id}, {"$set": {"status": "failed", "error_detail": str(exc)}}
        )
        raise HTTPException(status_code=500, detail=f"report_generation_failed: {exc}") from exc


@router.get("/reports/{report_id}")
async def get_report(report_id: str, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    doc = await db.reports.find_one({"_id": ObjectId(report_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="report_not_found")
    doc["id"] = str(doc.pop("_id"))
    return {"report": doc}


@router.get("/reports/{report_id}/download")
async def download_report(report_id: str, request: Request, user: UserPublic = Depends(get_current_user)):
    """Serves the actual generated PDF. get_report() above only returns
    metadata (pdf_path is a local filesystem path, not fetchable over
    HTTP) -- this is the route the frontend/demo should link to."""
    db = await get_tenant_db(request)
    doc = await db.reports.find_one({"_id": ObjectId(report_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="report_not_found")
    pdf_path = doc.get("pdf_path")
    if not pdf_path or not os.path.isfile(pdf_path):
        raise HTTPException(status_code=404, detail="report_pdf_not_found")
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"ptah-realty-report-{report_id}.pdf",
    )


@router.post("/comparables/ingest", status_code=202)
async def ingest_comparables(body: IngestRequest, background_tasks: BackgroundTasks, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    """Kicks off comparable ingestion as a background job and returns
    immediately with a job_id to poll (GET /comparables/ingest/{job_id}).

    This used to run the Apify actor synchronously in the request/response
    cycle. Property24 is currently blocking scraper connections (see
    property24_ingest.py module docstring), which makes a single actor
    call take 90+ seconds, and the sold->for_sale fallback can mean TWO
    such calls back to back -- comfortably past the proxy/edge timeouts
    in front of this API (Vercel's rewrite, Cloudflare, or the ALB,
    whichever is shortest), which was surfacing as a 502 on the frontend
    even though the backend request eventually succeeded. Making this
    async removes the dependency on any of those timeouts entirely.
    """
    db = await get_tenant_db(request)
    job = {
        "search_location": body.search_location,
        "property_type": body.property_type,
        "max_items": body.max_items,
        "status": "pending",
        "upserted_count": None,
        "error": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.ingest_jobs.insert_one(job)
    job_id = str(result.inserted_id)
    # Pass the already-resolved tenant db directly rather than having the
    # background task re-derive it -- there's no Request object once we're
    # outside the request/response cycle, and Motor database handles are
    # safe to reuse across async tasks within the same process.
    background_tasks.add_task(_run_ingest_job, db, job_id, body.search_location, body.property_type, body.max_items)
    return {"job_id": job_id, "status": "pending"}


@router.get("/comparables/ingest/{job_id}")
async def get_ingest_job(job_id: str, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    doc = await db.ingest_jobs.find_one({"_id": ObjectId(job_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="ingest_job_not_found")
    doc["id"] = str(doc.pop("_id"))
    return {"job": doc}


async def _run_ingest_job(db: AsyncIOMotorDatabase, job_id: str, search_location: str, property_type: str, max_items: int) -> None:
    """Background worker for POST /comparables/ingest. Runs outside the
    request/response cycle -- see docstring on that route for why. `db` is
    the tenant database already resolved by the caller (see there)."""
    await db.ingest_jobs.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": "running", "updated_at": datetime.now(timezone.utc)}},
    )
    try:
        count = await ingest_from_apify(db, search_location, property_type, max_items)
    except Exception as exc:  # noqa: BLE001 -- this must never raise into a bare background task
        await db.ingest_jobs.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": {"status": "failed", "error": str(exc), "updated_at": datetime.now(timezone.utc)}},
        )
        return
    await db.ingest_jobs.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": "succeeded", "upserted_count": count, "updated_at": datetime.now(timezone.utc)}},
    )


@router.post("/listings/feed")
async def get_listing_feed(body: PublishRequest, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    """Returns a syndication-ready XML feed entry for this property, since
    Property24 has no self-service inbound API -- hand this to your
    Entegral/PropData feed importer, or use /listings/publish if Entegral
    Sync API credentials are configured."""
    db = await get_tenant_db(request)
    prop = await db.properties.find_one({"_id": ObjectId(body.property_id)})
    if prop is None:
        raise HTTPException(status_code=404, detail="property_not_found")

    media_cursor = db.media_assets.find({"property_id": body.property_id, "kind": "photo"}).sort("sort_order", 1)
    media = await media_cursor.to_list(length=100)

    payload = ListingPayload(
        property_id=body.property_id,
        address_line=prop["address_line"],
        suburb=prop["suburb"],
        city=prop["city"],
        property_type=prop["property_type"],
        bedrooms=prop.get("bedrooms"),
        bathrooms=prop.get("bathrooms"),
        floor_size_sqm=prop.get("floor_size_sqm"),
        erf_size_sqm=prop.get("erf_size_sqm"),
        price=body.price,
        description=body.description,
        image_urls=[m.get("web_variant_url") or m.get("original_url") for m in media],
        agent_name=body.agent_name,
        agent_email=body.agent_email,
    )
    return {"feed_xml": generate_listing_feed_xml(payload)}


@router.post("/listings/publish")
async def publish_listing(body: PublishRequest, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    """Publishes via Entegral Sync API if credentials are configured in
    the `portal_connections` collection; otherwise returns the feed XML
    with an explanation instead of pretending a direct push happened."""
    db = await get_tenant_db(request)
    prop = await db.properties.find_one({"_id": ObjectId(body.property_id)})
    if prop is None:
        raise HTTPException(status_code=404, detail="property_not_found")

    creds_doc = await db.portal_connections.find_one({"portal_name": "entegral_sync", "is_active": True})

    media_cursor = db.media_assets.find({"property_id": body.property_id, "kind": "photo"}).sort("sort_order", 1)
    media = await media_cursor.to_list(length=100)

    payload = ListingPayload(
        property_id=body.property_id,
        address_line=prop["address_line"],
        suburb=prop["suburb"],
        city=prop["city"],
        property_type=prop["property_type"],
        bedrooms=prop.get("bedrooms"),
        bathrooms=prop.get("bathrooms"),
        floor_size_sqm=prop.get("floor_size_sqm"),
        erf_size_sqm=prop.get("erf_size_sqm"),
        price=body.price,
        description=body.description,
        image_urls=[m.get("web_variant_url") or m.get("original_url") for m in media],
        agent_name=body.agent_name,
        agent_email=body.agent_email,
    )

    job_doc = {
        "property_id": body.property_id,
        "portal_name": "entegral_sync",
        "status": "running",
        "created_at": datetime.now(timezone.utc),
    }
    job_result = await db.sync_jobs.insert_one(job_doc)

    if creds_doc is None:
        result = {
            "success": False,
            "error_message": (
                "No Entegral Sync API credentials on file. Property24 has no public "
                "self-service push API -- use /listings/feed to get the XML feed entry "
                "for manual upload, or configure Entegral/PropData credentials."
            ),
        }
    else:
        adapter = EntegralSyncAdapter()
        result = await adapter.publish(payload, creds_doc["credentials"])

    await db.sync_jobs.update_one(
        {"_id": job_result.inserted_id},
        {"$set": {
            "status": "success" if result.get("success") else "failed",
            "error_detail": result.get("error_message"),
            "attempted_at": datetime.now(timezone.utc),
        }},
    )

    if not result.get("success"):
        result["feed_xml"] = generate_listing_feed_xml(payload)
    return result


@router.get("/listings/{property_id}/status")
async def listing_status(property_id: str, request: Request, user: UserPublic = Depends(get_current_user)) -> dict:
    db = await get_tenant_db(request)
    cursor = db.sync_jobs.find({"property_id": property_id}).sort("created_at", -1)
    jobs = await cursor.to_list(length=100)
    for j in jobs:
        j["id"] = str(j.pop("_id"))
    return {"jobs": jobs}
