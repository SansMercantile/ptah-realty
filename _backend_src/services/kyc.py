"""Provider-neutral KYC mock service.

The mock deliberately returns explicit provider/status fields so callers can
swap in ID validation, CIPC, credit, sanctions, or deeds adapters later.
"""
from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4
from models import DeedsQueryResult, KycCase, KycCheck, PropertyRecord
from schemas import DeedsQuery, KycCorporateRequest, KycIndividualRequest
from services.property_intelligence import search_properties
from schemas import PropertySearchQuery


def _check(subject_id: str, kind: str, status: str, provider: str, findings: list[str] | None = None) -> KycCheck:
    return KycCheck(check_id=f"check-{uuid4().hex[:10]}", subject_id=subject_id, check_type=kind, status=status, provider=provider, checked_at=datetime.now(timezone.utc), findings=findings or [])


def verify_individual(request: KycIndividualRequest) -> KycCase:
    subject_id = f"individual-{request.id_number}"
    checks = [_check(subject_id, "id_validation", "passed", "mock-idv")]
    if request.run_faceview: checks.append(_check(subject_id, "faceview", "passed", "mock-faceview"))
    if request.run_credit_check: checks.append(_check(subject_id, "credit", "passed", "mock-credit", ["No adverse record in mock data"]))
    if request.run_sanctions: checks.append(_check(subject_id, "sanctions", "clear", "mock-screening"))
    return KycCase(id=f"kyc-{uuid4().hex[:10]}", subject_type="individual", subject_name=request.full_name, id_number=request.id_number, checks=checks, overall_status="passed", created_at=datetime.now(timezone.utc))


def verify_corporate(request: KycCorporateRequest) -> KycCase:
    subject_id = f"company-{request.registration_number}"
    checks = [_check(subject_id, "cipc_report", "passed", "mock-cipc"), _check(subject_id, "director_lookup", "passed", "mock-cipc")]
    if request.run_sanctions: checks.append(_check(subject_id, "sanctions", "clear", "mock-screening"))
    return KycCase(id=f"kyc-{uuid4().hex[:10]}", subject_type="corporate", subject_name=request.legal_name, registration_number=request.registration_number, checks=checks, overall_status="passed", created_at=datetime.now(timezone.utc))


async def query_deeds(db, request: DeedsQuery) -> DeedsQueryResult:
    if request.query_type == "owner":
        matches = await search_properties(db, PropertySearchQuery(owner_name=request.query_value))
    elif request.query_type == "title_deed":
        matches = await search_properties(db, PropertySearchQuery(title_deed_number=request.query_value))
    elif request.query_type == "erf":
        matches = await search_properties(db, PropertySearchQuery(erf_number=request.query_value))
    else:
        matches = []
    return DeedsQueryResult(query_type=request.query_type, query_value=request.query_value, matches=matches, generated_at=datetime.now(timezone.utc))
