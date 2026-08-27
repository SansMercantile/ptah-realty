"""
PTAH Realty -- configuration.
Standalone mini-app repo, sibling to the main PTAH constellation repo --
same relationship as priv_pay has to Priv.
"""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "PTAH Realty"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8010"))

    # Matches the MONGODB_URI secret already used across the constellation
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "ptah_realty")

    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    # Optional AWS-native storage and mapping configuration. Local disk and
    # vector cadastral mode remain the safe defaults for development.
    S3_BUCKET: str | None = os.getenv("REALTY_S3_BUCKET")
    S3_PREFIX: str = os.getenv("REALTY_S3_PREFIX", "realty")
    AWS_LOCATION_MAP_NAME: str | None = os.getenv("AWS_LOCATION_MAP_NAME")
    AWS_LOCATION_API_KEY: str | None = os.getenv("AWS_LOCATION_API_KEY")

    APIFY_TOKEN: str = os.getenv("APIFY_TOKEN", "")
    # crawlerbros/property24-scraper -- switched from solidcode/property24-scraper
    # (2026-08-20) after CloudWatch logs showed every live ingest run returning
    # 0 raw items, sold and for_sale alike, for days straight. crawlerbros
    # documents explicit retry/backoff, Apify-Proxy escalation, and a
    # TLS-impersonating fallback client for exactly the blocking pattern that
    # was silently zeroing solidcode's results. See services/property24_ingest.py.
    APIFY_PROPERTY24_ACTOR: str = os.getenv(
        "APIFY_PROPERTY24_ACTOR", "crawlerbros/property24-scraper"
    )

    REPORTS_DIR: str = os.getenv("REALTY_REPORTS_DIR", "./data/reports")

    # Property photo storage. Local disk, same pattern as REPORTS_DIR -- no
    # S3 bucket is provisioned for this mini-app. Served at /media by main.py.
    MEDIA_DIR: str = os.getenv("REALTY_MEDIA_DIR", "./data/media")

    # Wildcard origin + allow_credentials=True is invalid per the CORS spec
    # (browsers reject it for credentialed requests) -- this app has no
    # cookie/session auth, so credentials stay off rather than narrowing
    # CORS_ORIGINS unnecessarily.
    CORS_ORIGINS: list = ["*"]

    # Auth (2026-08-22): JWT bearer tokens, per-tenant user accounts stored
    # in each tenant's own database (see tenancy.py) -- consistent with
    # the per-tenant database isolation decision, a breach of one tenant's
    # DB doesn't expose another tenant's credentials. JWT_SECRET MUST be
    # overridden via env var in every real deployment; the default here
    # only exists so local dev doesn't hard-crash without a .env file.
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-only-insecure-secret-override-in-prod")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = int(os.getenv("JWT_EXPIRY_HOURS", "12"))

    # Custom domain provisioning (2026-08-23): calls Vercel's REST API to
    # attach a tenant's custom domain to the frontend project during
    # onboarding. Not needed for the app to run without this feature --
    # left optional (None) so local dev/tests don't require it.
    VERCEL_API_TOKEN: str | None = os.getenv("VERCEL_API_TOKEN")
    VERCEL_PROJECT_ID: str | None = os.getenv("VERCEL_PROJECT_ID")
    VERCEL_TEAM_ID: str | None = os.getenv("VERCEL_TEAM_ID")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
