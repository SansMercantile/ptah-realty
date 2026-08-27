"""Validated HTTP contracts for property intelligence and KYC."""
from __future__ import annotations

from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, model_validator


class PropertySearchQuery(BaseModel):
    province: str | None = None
    suburb: str | None = None
    erf_number: str | None = None
    farm_number: str | None = None
    street_address: str | None = None
    owner_name: str | None = None
    owner_id: str | None = None
    title_deed_number: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    radius_m: int = Field(default=1000, gt=0, le=100_000)

    @model_validator(mode="after")
    def require_criteria(self) -> "PropertySearchQuery":
        fields = (self.province, self.suburb, self.erf_number, self.farm_number,
                  self.street_address, self.owner_name, self.owner_id,
                  self.title_deed_number, self.latitude)
        if not any(value is not None and value != "" for value in fields):
            raise ValueError("at least one search criterion is required")
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("latitude and longitude must be supplied together")
        return self


class AnalyticsQuery(BaseModel):
    province: str | None = None
    suburb: str | None = None
    start_year: int = Field(default=2017, ge=2017, le=2026)
    end_year: int = Field(default=2026, ge=2017, le=2026)

    @model_validator(mode="after")
    def valid_range(self) -> "AnalyticsQuery":
        if self.start_year > self.end_year:
            raise ValueError("start_year must not exceed end_year")
        return self


class KycIndividualRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=200)
    id_number: str = Field(min_length=6, max_length=30)
    run_faceview: bool = True
    run_credit_check: bool = True
    run_sanctions: bool = True


class KycCorporateRequest(BaseModel):
    legal_name: str = Field(min_length=2, max_length=250)
    registration_number: str = Field(min_length=4, max_length=40)
    run_director_lookup: bool = True
    run_sanctions: bool = True


class DeedsQuery(BaseModel):
    query_type: Literal["title_deed", "owner", "erf", "eua", "national"]
    query_value: str = Field(min_length=2, max_length=200)
