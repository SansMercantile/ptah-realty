"""Property intelligence and KYC API boundaries.

Tenant-aware and authenticated, matching the pattern used everywhere
else in this backend (see api/routes.py, api/prospecting.py) --
Depends(get_current_user) + get_tenant_db(request) on every route.

Auto-suggestion and recently-viewed live in api/search.py under
/api/v1/realty/search instead of here, to avoid two endpoints doing the
same thing under different URLs.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from auth import UserPublic, get_current_user
from tenancy import get_tenant_db
from schemas import AnalyticsQuery, DeedsQuery, KycCorporateRequest, KycIndividualRequest, PropertySearchQuery
from services.kyc import query_deeds, verify_corporate, verify_individual
from services.property_intelligence import search_properties, suburb_analytics

router = APIRouter(prefix="/api/v1/intelligence", tags=["Property Intelligence"])


@router.post("/properties/search")
async def search(query: PropertySearchQuery, request: Request, user: UserPublic = Depends(get_current_user)):
    db = await get_tenant_db(request)
    return await search_properties(db, query)


@router.post("/analytics/suburbs")
async def analytics(query: AnalyticsQuery, request: Request, user: UserPublic = Depends(get_current_user)):
    db = await get_tenant_db(request)
    return await suburb_analytics(db, query)


@router.post("/kyc/individual")
async def individual_kyc(query: KycIndividualRequest, user: UserPublic = Depends(get_current_user)):
    return verify_individual(query)


@router.post("/kyc/corporate")
async def corporate_kyc(query: KycCorporateRequest, user: UserPublic = Depends(get_current_user)):
    return verify_corporate(query)


@router.post("/deeds/query")
async def deeds(query: DeedsQuery, request: Request, user: UserPublic = Depends(get_current_user)):
    db = await get_tenant_db(request)
    return await query_deeds(db, query)
