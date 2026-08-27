"""
Integration tests for the property intelligence module -- runs against a
real (ephemeral, cleaned-up) test database rather than mocks, since
search_properties/suburb_analytics/query_deeds now query MongoDB
directly (see services/property_intelligence.py). Mirrors the original
prop-001 (Sandton, freehold)/prop-002 (Sea Point, sectional title)
fixture data these tests were written against.
"""
from datetime import datetime, timezone

import certifi
import pytest
import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import ValidationError

from config import settings
from db import ensure_indexes
from schemas import AnalyticsQuery, DeedsQuery, KycIndividualRequest, PropertySearchQuery
from services.kyc import query_deeds, verify_individual
from services.property_intelligence import search_properties, suburb_analytics

TEST_DB_NAME = "ptah_realty_test_intelligence"


@pytest_asyncio.fixture
async def db():
    # tlsCAFile=certifi.where() works around a local-Windows-only cert-store
    # enumeration bug (unrelated to this code) hit repeatedly this session --
    # not needed in the actual Linux deployment container.
    client = AsyncIOMotorClient(settings.MONGODB_URI, tlsCAFile=certifi.where())
    database = client[TEST_DB_NAME]
    await ensure_indexes(database)

    now = datetime.now(timezone.utc)
    prop1 = await database.properties.insert_one({
        "address_line": "12 Rivonia Road", "suburb": "Sandton", "city": "Johannesburg",
        "province": "Gauteng", "property_type": "house", "tenure_type": "freehold",
        "erf_number": "1234", "title_deed_number": "T12345/2018",
        "erf_size_sqm": 850, "floor_size_sqm": 310,
        "location": {"type": "Point", "coordinates": [28.0567, -26.1076]},
        "registered_owner": "Thabo Molefe", "municipal_valuation": 4_200_000,
        "status": "draft", "created_at": now, "updated_at": now,
    })
    await database.title_transfers.insert_one({
        "property_id": str(prop1.inserted_id), "transfer_date": datetime(2022, 5, 10, tzinfo=timezone.utc),
        "seller": "A. Smith", "buyer": "Thabo Molefe", "price": 4_000_000,
        "deed_number": "T12345/2018", "created_at": now,
    })

    prop2 = await database.properties.insert_one({
        "address_line": "8 Regent Road", "suburb": "Sea Point", "city": "Cape Town",
        "province": "Western Cape", "property_type": "apartment", "tenure_type": "sectional_title",
        "erf_number": "88", "title_deed_number": "ST67890/2020",
        "erf_size_sqm": 1200, "floor_size_sqm": 96,
        "location": {"type": "Point", "coordinates": [18.3850, -33.9180]},
        "registered_owner": "Naledi Dlamini", "municipal_valuation": 2_100_000,
        "status": "draft", "created_at": now, "updated_at": now,
    })
    await database.title_transfers.insert_one({
        "property_id": str(prop2.inserted_id), "transfer_date": datetime(2024, 8, 2, tzinfo=timezone.utc),
        "seller": "J. Brown", "buyer": "Naledi Dlamini", "price": 2_350_000,
        "deed_number": "ST67890/2020", "created_at": now,
    })

    yield database

    await database.properties.delete_many({})
    await database.title_transfers.delete_many({})
    client.close()


@pytest.mark.asyncio
async def test_search_by_owner_and_title_deed(db):
    result = await search_properties(db, PropertySearchQuery(owner_name="Thabo", title_deed_number="T12345/2018"))
    assert len(result) == 1
    assert result[0].transfers[0].sale_price == 4_000_000


@pytest.mark.asyncio
async def test_gps_search_uses_radius(db):
    query = PropertySearchQuery(latitude=-26.1076, longitude=28.0567, radius_m=100)
    result = await search_properties(db, query)
    assert len(result) == 1
    assert result[0].suburb == "Sandton"


@pytest.mark.asyncio
async def test_analytics_respects_historical_range_and_categories(db):
    result = await suburb_analytics(db, AnalyticsQuery(province="Western Cape", start_year=2023, end_year=2025))
    assert result.property_count == 1
    assert result.sectional_title_count == 1
    assert result.freehold_count == 0
    assert result.total_transfer_value == 2_350_000


def test_kyc_serializes_all_requested_checks():
    case = verify_individual(KycIndividualRequest(full_name="A Person", id_number="9001015009088"))
    payload = case.model_dump(mode="json")
    assert payload["overall_status"] == "passed"
    assert {check["check_type"] for check in payload["checks"]} == {"id_validation", "faceview", "credit", "sanctions"}
    assert all(check["provider"].startswith("mock-") for check in payload["checks"])


@pytest.mark.asyncio
async def test_deeds_query_reuses_property_search_contract(db):
    result = await query_deeds(db, DeedsQuery(query_type="erf", query_value="88"))
    assert len(result.matches) == 1
    assert result.matches[0].suburb == "Sea Point"
    assert result.generated_at is not None


@pytest.mark.parametrize("payload", [
    {},
    {"latitude": -26.1},
    {"street_address": "", "radius_m": 0},
])
def test_invalid_search_payloads_are_rejected(payload):
    with pytest.raises(ValidationError):
        PropertySearchQuery(**payload)


def test_invalid_analytics_range_is_rejected():
    with pytest.raises(ValidationError):
        AnalyticsQuery(start_year=2026, end_year=2017)
