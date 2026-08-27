"""
PTAH Realty -- multi-tenant control plane.

Each tenant (a company leasing this product) gets:
- a custom domain (their own, e.g. cma.acmerealty.co.za)
- a fully separate MongoDB database for isolation
- branding: display name, logo URL, primary/accent colors

Tenant records themselves live in a small shared "control plane" database
(ptah_control_plane) -- this is metadata ABOUT tenants, not tenant data
itself, so it doesn't violate the per-tenant database isolation decision.

Phase 1a (2026-08-19): this module + GET /branding is additive -- it does
not yet change how the existing routes in api/routes.py access the
database (they still call db.get_db(), which is unchanged and still
points at the original single ptah_realty database). Migrating the rest
of the routes to be tenant-aware is Phase 1b. The current production
domains (ptahrealty.sansmercantile.com / ptahrealty-api.sansmercantile.com)
are seeded here as tenant "sansmercantile" pointing at that same existing
database, so nothing about the live app's DATA access changes yet -- this
just makes tenant/branding data resolvable and gets it flowing to the
frontend for the branding UI work.
"""
from __future__ import annotations

from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pydantic import BaseModel
from fastapi import Request

from config import settings
from db import get_db as get_default_db

CONTROL_PLANE_DB_NAME = "ptah_control_plane"

_control_client: AsyncIOMotorClient | None = None

# Per-tenant AsyncIOMotorClient cache, keyed by mongodb_uri, so repeated
# requests for the same tenant reuse one connection pool instead of
# opening a new client every time.
_tenant_clients: dict[str, AsyncIOMotorClient] = {}


def get_control_db() -> AsyncIOMotorDatabase:
    global _control_client
    if _control_client is None:
        _control_client = AsyncIOMotorClient(settings.MONGODB_URI)
    return _control_client[CONTROL_PLANE_DB_NAME]


class TenantBranding(BaseModel):
    display_name: str
    logo_url: str | None = None
    primary_color: str = "#f59e0b"   # matches the current amber-500 default
    accent_color: str = "#f59e0b"


class Tenant(BaseModel):
    id: str
    slug: str
    domain: str
    branding: TenantBranding
    mongodb_uri: str
    mongodb_db_name: str
    status: str = "active"


def get_request_domain(request: Request) -> str:
    """Resolves the ORIGINAL client-facing domain for a request.

    Confirmed empirically 2026-08-23: the frontend's Vercel rewrite proxies
    /api/* to a fixed destination URL, and Vercel sets the Host header on
    that outbound request to the DESTINATION's hostname
    (ptahrealty-api.sansmercantile.com) regardless of which tenant
    frontend domain the browser actually used -- but it preserves the
    original domain in X-Forwarded-Host. Without preferring that header,
    every tenant's frontend would resolve to the same default tenant the
    moment a second tenant went live through this same proxy pattern --
    a real cross-tenant data isolation bug, not a cosmetic one. Direct
    API calls (no Vercel proxy in front, e.g. our own tooling hitting
    ptahrealty-api.sansmercantile.com directly) have no X-Forwarded-Host,
    so Host is used as the fallback there.
    """
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
    return host.split(",")[0].split(":")[0].strip().lower()


async def resolve_tenant_by_domain(host: str) -> Tenant | None:
    """host is the incoming request's Host header, e.g.
    'ptahrealty-api.sansmercantile.com' or 'cma.acmerealty.co.za'."""
    host = host.split(":")[0].lower()  # strip port if present
    db = get_control_db()
    doc = await db.tenants.find_one({"domain": host, "status": "active"})
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return Tenant(**doc)


def get_tenant_database(tenant: Tenant) -> AsyncIOMotorDatabase:
    """Returns (and caches) the database connection for this tenant's own
    separate database, per the per-tenant-database isolation decision."""
    if tenant.mongodb_uri not in _tenant_clients:
        _tenant_clients[tenant.mongodb_uri] = AsyncIOMotorClient(tenant.mongodb_uri)
    client = _tenant_clients[tenant.mongodb_uri]
    return client[tenant.mongodb_db_name]


DEFAULT_TENANT_DOMAINS = [
    "ptahrealty-api.sansmercantile.com",
    "ptahrealty.sansmercantile.com",
]


async def ensure_default_tenant() -> None:
    """Idempotently seeds the control plane with the current production
    installation as a tenant, so the existing domains resolve correctly
    once routes are migrated to be tenant-aware in Phase 1b. Uses
    $setOnInsert so re-running this on every startup never clobbers
    branding a human has since edited via the admin tooling."""
    db = get_control_db()
    now = datetime.now(timezone.utc)
    for domain in DEFAULT_TENANT_DOMAINS:
        await db.tenants.update_one(
            {"domain": domain},
            {
                "$setOnInsert": {
                    "slug": "sansmercantile",
                    "domain": domain,
                    "branding": {
                        "display_name": "Sans Mercantile",
                        "logo_url": None,
                        "primary_color": "#f59e0b",
                        "accent_color": "#f59e0b",
                    },
                    "mongodb_uri": settings.MONGODB_URI,
                    "mongodb_db_name": settings.MONGODB_DB_NAME,
                    "status": "active",
                    "created_at": now,
                }
            },
            upsert=True,
        )


async def get_tenant_db(request: Request) -> AsyncIOMotorDatabase:
    """FastAPI dependency: resolves the request's client-facing domain
    (see get_request_domain) to a tenant and returns that tenant's own
    separate database (Phase 1b). Falls back to the original
    single-tenant db.get_db() when the domain doesn't match a registered
    tenant (local dev, a bare ALB/ECS health check, a staging preview
    domain) so those environments keep working exactly as before rather
    than erroring.
    """
    tenant = await resolve_tenant_by_domain(get_request_domain(request))
    if tenant is None:
        return get_default_db()
    return get_tenant_database(tenant)
