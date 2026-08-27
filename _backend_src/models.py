"""Strict domain models for the real-estate intelligence platform."""
from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from pydantic import BaseModel, ConfigDict, Field


class PropertyCategory(StrEnum):
    sectional_title = "sectional_title"
    freehold = "freehold"
    estate = "estate"
    commercial = "commercial"


class PropertyStatus(StrEnum):
    active = "active"
    sold = "sold"
    archived = "archived"


class Accommodation(BaseModel):
    bedrooms: int = Field(ge=0, le=100)
    bathrooms: float = Field(ge=0, le=100)
    garages: int = Field(ge=0, le=100)
    parking_bays: int = Field(default=0, ge=0, le=100)
    pool: bool = False
    condition_rating: int = Field(ge=1, le=5)
    notes: str | None = None


class Owner(BaseModel):
    id: str
    full_name: str
    id_number: str | None = None
    entity_type: str = "individual"
    ownership_share: float = Field(default=1.0, gt=0, le=1)
    birth_date: date | None = None


class Transfer(BaseModel):
    id: str
    property_id: str
    transfer_date: date
    sale_price: float = Field(ge=0)
    sale_type: str = "standard"
    seller_names: list[str] = []
    buyer_names: list[str] = []
    title_deed_number: str | None = None


class Bond(BaseModel):
    lender: str
    bond_number: str
    amount: float = Field(ge=0)
    registration_date: date | None = None
    cancellation_date: date | None = None


class PropertyRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    province: str
    suburb: str
    city: str
    street_address: str
    erf_number: str | None = None
    farm_number: str | None = None
    category: PropertyCategory
    zoning: str | None = None
    land_extent_sqm: float | None = Field(default=None, ge=0)
    building_extent_sqm: float | None = Field(default=None, ge=0)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    title_deed_number: str | None = None
    municipal_value: float | None = Field(default=None, ge=0)
    status: PropertyStatus = PropertyStatus.active
    owners: list[Owner] = []
    transfers: list[Transfer] = []
    bonds: list[Bond] = []
    accommodation: Accommodation | None = None
    updated_at: datetime


class DemographicAnalytics(BaseModel):
    province: str | None
    suburb: str | None
    start_year: int
    end_year: int
    property_count: int = Field(ge=0)
    sectional_title_count: int = Field(ge=0)
    freehold_count: int = Field(ge=0)
    total_transfer_value: float = Field(ge=0)
    average_transfer_value: float = Field(ge=0)


class KycCheck(BaseModel):
    check_id: str
    subject_id: str
    check_type: str
    status: str
    provider: str
    checked_at: datetime
    findings: list[str] = []


class KycCase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    id: str
    subject_type: str
    subject_name: str
    id_number: str | None = None
    registration_number: str | None = None
    checks: list[KycCheck]
    overall_status: str
    created_at: datetime


class DeedsQueryResult(BaseModel):
    query_type: str
    query_value: str
    matches: list[PropertyRecord]
    generated_at: datetime
