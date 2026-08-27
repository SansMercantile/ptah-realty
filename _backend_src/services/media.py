"""
PTAH Realty -- local media storage for property photos.

Photos are stored on local disk under settings.MEDIA_DIR and served via
the /media static mount in main.py. This mirrors the REPORTS_DIR pattern
already used for PDF reports -- no S3 bucket is provisioned for this
mini-app, so this stays local-disk until/unless that changes.

Only one variant is stored per upload. reports.py and property24_feed.py
already fall back to `original_url` when `print_variant_url` /
`web_variant_url` are absent, so a resize pipeline can be added later
(e.g. Pillow) without touching either call site.
"""

from __future__ import annotations

import os
import uuid

from fastapi import UploadFile

from config import settings
from services.object_storage import delete_asset, s3_enabled, upload_bytes

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB


class MediaError(Exception):
    pass


async def save_media_file(property_id: str, file: UploadFile) -> str:
    """Saves an uploaded photo under MEDIA_DIR/<property_id>/ and returns
    the public URL path (served by the /media static mount)."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise MediaError(f"Unsupported file type '{ext or 'unknown'}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}")

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise MediaError(f"File exceeds {MAX_UPLOAD_BYTES // (1024 * 1024)}MB limit.")

    filename = f"{uuid.uuid4().hex}{ext}"
    content_type = file.content_type or "application/octet-stream"
    if s3_enabled():
        return upload_bytes(property_id, filename, contents, content_type)

    property_dir = os.path.join(settings.MEDIA_DIR, property_id)
    os.makedirs(property_dir, exist_ok=True)
    dest_path = os.path.join(property_dir, filename)
    with open(dest_path, "wb") as f:
        f.write(contents)
    return f"/media/{property_id}/{filename}"


def media_url_to_path(url: str) -> str:
    """Reverses save_media_file's URL for on-disk access (used by the PDF
    report renderer, which needs a real filesystem path, not a URL)."""
    rel = url.removeprefix("/media/")
    return os.path.join(settings.MEDIA_DIR, rel)


def delete_media_file(url: str) -> None:
    if s3_enabled():
        delete_asset(url)
        return
    path = media_url_to_path(url)
    if os.path.exists(path):
        os.remove(path)
