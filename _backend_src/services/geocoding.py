"""
PTAH Realty -- address geocoding.

Property creation used to trust whatever lat/lng the caller sent verbatim
(manual entry, no validation) -- that's how a hand-typed approximate
coordinate for "12 Camps Bay Drive" ended up plotted in the ocean instead
of on land. This resolves a real address to real coordinates via
Nominatim (OpenStreetMap's free geocoder) and treats that as
authoritative; a caller-supplied lat/lng is only used as a fallback when
geocoding genuinely can't resolve the address (not as a way to override a
successful geocode with an unverified guess).

Nominatim's usage policy (https://operations.osmfoundation.org/policies/nominatim/)
requires a real, identifying User-Agent and caps at ~1 request/second for
this kind of low-volume, non-bulk use -- both honored below.
"""

from __future__ import annotations

import logging

import aiohttp

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "PtahRealty/1.0 (contact: mezzo@sansmercantile.com)"


async def geocode_address(address_line: str, suburb: str, city: str) -> tuple[float, float] | None:
    """Returns (lat, lng) for the given address, or None if it couldn't
    be resolved. Never raises -- a geocoding failure should fall back to
    whatever the caller provided, not break property creation."""
    query = f"{address_line}, {suburb}, {city}, South Africa"
    params = {"q": query, "format": "jsonv2", "limit": 1, "countrycodes": "za"}
    headers = {"User-Agent": USER_AGENT}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                NOMINATIM_URL, params=params, headers=headers, timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                if resp.status != 200:
                    logger.warning("[geocoding] Nominatim returned %d for '%s'", resp.status, query)
                    return None
                results = await resp.json()
    except Exception:
        logger.exception("[geocoding] Failed to geocode '%s'", query)
        return None

    if not results:
        logger.warning("[geocoding] No match for '%s' -- falling back to caller-provided coordinates, if any", query)
        return None

    try:
        lat = float(results[0]["lat"])
        lng = float(results[0]["lon"])
        return (lat, lng)
    except (KeyError, ValueError, TypeError):
        logger.exception("[geocoding] Malformed Nominatim response for '%s'", query)
        return None
