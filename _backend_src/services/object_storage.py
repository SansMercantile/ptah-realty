"""AWS S3 asset storage with a local-disk development fallback."""
from __future__ import annotations

import os
from urllib.parse import urlparse

import boto3

from config import settings


def s3_enabled() -> bool:
    return bool(settings.S3_BUCKET)


def _client():
    return boto3.client("s3", region_name=settings.AWS_REGION)


def asset_key(property_id: str, filename: str) -> str:
    return f"{settings.S3_PREFIX}/properties/{property_id}/{filename}"


def upload_bytes(property_id: str, filename: str, contents: bytes, content_type: str) -> str:
    """Upload an asset and return a browser-readable URL.

    A configured public asset base URL is preferred. Otherwise a short-lived
    presigned URL is returned; production deployments should normally place
    CloudFront or an authenticated download route in front of the bucket.
    """
    key = asset_key(property_id, filename)
    client = _client()
    client.put_object(Bucket=settings.S3_BUCKET, Key=key, Body=contents, ContentType=content_type)
    public_base = os.getenv("REALTY_ASSET_BASE_URL")
    if public_base:
        return f"{public_base.rstrip('/')}/{key}"
    return client.generate_presigned_url(
        "get_object", Params={"Bucket": settings.S3_BUCKET, "Key": key}, ExpiresIn=3600
    )


def delete_asset(url: str) -> None:
    """Delete a previously uploaded S3 URL when it belongs to our bucket."""
    parsed = urlparse(url)
    if parsed.scheme == "s3" or "amazonaws.com" in parsed.netloc:
        _client().delete_object(Bucket=settings.S3_BUCKET, Key=parsed.path.lstrip("/"))
        return
    base = os.getenv("REALTY_ASSET_BASE_URL")
    if base and url.startswith(base.rstrip("/") + "/"):
        _client().delete_object(Bucket=settings.S3_BUCKET, Key=url[len(base.rstrip("/")) + 1 :])
