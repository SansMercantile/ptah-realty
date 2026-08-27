"""
PTAH Realty -- authentication.

Per-tenant user accounts (stored in each tenant's own database, alongside
their properties/comparables/reports -- consistent with the per-tenant
database isolation decision in tenancy.py: a breach of one tenant's
database doesn't expose another tenant's credentials).

JWT bearer tokens, bcrypt password hashing. No self-serve public signup --
users are provisioned by an admin (see create_user / the bootstrap script
used to seed the first admin per tenant), consistent with this being a
B2B product companies lease rather than an open consumer app.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from enum import Enum

import bcrypt
import jwt
from bson import ObjectId
from fastapi import Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from config import settings
from tenancy import get_request_domain, get_tenant_db


class UserRole(str, Enum):
    admin = "admin"      # full access, can manage other users
    member = "member"    # normal product usage, no user management


class UserPublic(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole


class LoginRequest(BaseModel):
    email: str  # plain str, not EmailStr -- avoids the optional
                # email-validator dependency; this is a lookup key, not a
                # field needing strict RFC validation
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_access_token(user_id: str, tenant_domain: str) -> str:
    """tenant_domain is embedded in the token so a token minted for one
    tenant's login can't be replayed against a different tenant's
    database even if somehow presented there -- get_current_user below
    checks it matches the resolving request's own tenant."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "tenant_domain": tenant_domain,
        "iat": now,
        "exp": now + timedelta(hours=settings.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


async def create_user(db: AsyncIOMotorDatabase, email: str, password: str, name: str, role: UserRole = UserRole.member) -> UserPublic:
    existing = await db.users.find_one({"email": email.lower()})
    if existing is not None:
        raise ValueError(f"A user with email {email} already exists.")
    doc = {
        "email": email.lower(),
        "password_hash": hash_password(password),
        "name": name,
        "role": role.value,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    return UserPublic(id=str(result.inserted_id), email=doc["email"], name=doc["name"], role=role)


async def authenticate(db: AsyncIOMotorDatabase, email: str, password: str) -> UserPublic | None:
    doc = await db.users.find_one({"email": email.lower()})
    if doc is None or not verify_password(password, doc["password_hash"]):
        return None
    return UserPublic(id=str(doc["_id"]), email=doc["email"], name=doc["name"], role=UserRole(doc["role"]))


async def get_current_user(request: Request, db: AsyncIOMotorDatabase = Depends(get_tenant_db)) -> UserPublic:
    """FastAPI dependency guarding every non-public route. Extracts the
    Bearer token, verifies it, confirms it was issued for THIS request's
    tenant (not replayed from another tenant's login), and loads the
    current user record from that tenant's own database."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
    token = auth_header[7:]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")

    request_host = get_request_domain(request)
    if payload.get("tenant_domain") != request_host:
        raise HTTPException(status_code=401, detail="Token was not issued for this domain.")

    try:
        user_id = ObjectId(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")
    doc = await db.users.find_one({"_id": user_id})
    if doc is None:
        raise HTTPException(status_code=401, detail="User no longer exists.")
    return UserPublic(id=str(doc["_id"]), email=doc["email"], name=doc["name"], role=UserRole(doc["role"]))


async def require_admin(user: UserPublic = Depends(get_current_user)) -> UserPublic:
    if user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user
