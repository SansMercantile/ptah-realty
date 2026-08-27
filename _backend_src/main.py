"""
PTAH Realty -- FastAPI entrypoint.
"""

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routes import router as realty_router
from api.intelligence_routes import router as intelligence_router
from api.search import router as search_router
from api.analytics import router as analytics_router
from api.prospecting import router as prospecting_router
from api.ai import router as ai_router
from config import settings
from db import ensure_indexes
from tenancy import ensure_default_tenant

logging.basicConfig(level=settings.DEBUG and logging.DEBUG or logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    # See the comment on Settings.CORS_ORIGINS -- "*" + credentials=True is
    # invalid per the CORS spec, and this app has no cookie/session auth.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(realty_router)
app.include_router(intelligence_router)
app.include_router(search_router)
app.include_router(analytics_router)
app.include_router(prospecting_router)
app.include_router(ai_router)

os.makedirs(settings.MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.MEDIA_DIR), name="media")


@app.on_event("startup")
async def on_startup() -> None:
    await ensure_indexes()
    await ensure_default_tenant()
    logger.info("PTAH Realty started -- MongoDB indexes ensured, default tenant seeded.")


@app.get("/")
async def root():
    return {"service": settings.APP_NAME, "status": "online"}


@app.get("/health")
async def health():
    return {"status": "ok"}
