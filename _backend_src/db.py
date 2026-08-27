"""
PTAH Realty -- MongoDB (Motor async driver) connection.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGODB_URI)
    return _client


def get_db():
    return get_client()[settings.MONGODB_DB_NAME]


async def ensure_indexes(db=None) -> None:
    """Provisions all indexes this app relies on. Accepts an optional db
    so it can be called for any tenant's database (see tenancy.py's
    onboarding flow) -- previously this only ran against the default
    tenant's db at startup, meaning a newly onboarded tenant's fresh
    database never got e.g. the 2dsphere geo index radius valuation
    depends on. Defaults to the original single-tenant db for backwards
    compatibility with the existing startup call in main.py."""
    if db is None:
        db = get_db()
    await db.properties.create_index([("suburb", 1)])
    await db.properties.create_index([("city", 1), ("suburb", 1)])
    await db.properties.create_index([("property_type", 1), ("tenure_type", 1)])
    await db.properties.create_index([("created_at", -1)])
    await db.properties.create_index([("complex_name", 1)])
    await db.properties.create_index([("province", 1), ("suburb", 1)])
    await db.properties.create_index([("erf_number", 1)])
    await db.properties.create_index([("title_deed_number", 1)])
    await db.properties.create_index([("location", "2dsphere")])
    await db.comparables.create_index([("suburb", 1), ("sale_date", -1)])
    await db.comparables.create_index([("complex_name", 1)])
    await db.comparables.create_index([("source", 1), ("source_ref", 1)], unique=True, sparse=True)
    await db.comparables.create_index([("location", "2dsphere")])
    await db.valuation_snapshots.create_index([("property_id", 1), ("created_at", -1)])
    await db.reports.create_index([("property_id", 1), ("created_at", -1)])
    await db.sync_jobs.create_index([("property_id", 1), ("created_at", -1)])
    await db.media_assets.create_index([("property_id", 1), ("sort_order", 1)])
    await db.users.create_index([("email", 1)], unique=True)
