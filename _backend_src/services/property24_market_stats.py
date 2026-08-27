"""
PTAH Realty -- free/public Property24 market-context stats.

Pulls the suburb-average price + active listing count that Property24
shows for free on its /property-values pages, e.g.
https://www.property24.com/property-values/cape-town/western-cape/432 ->
"Currently the average price of properties in Cape Town is R 10 226 369.
There are currently 4125 properties on the market in Cape Town."

This is supplementary market CONTEXT only -- one aggregate number per
area, not per-property comparables. It does NOT touch the per-property/
street-level "Last 10 sales in the street" / "Last 20 sales within 1km"
data -- that's Property24's own paid "Buy Property Report" product
(see https://www.property24.com/purchase-property-report), gated the
same way a paid subscription would be, just metered per-report instead
of per-month. Scraping around that paywall is out of scope; this module
only reads the free aggregate stat the page already discloses to anyone
who loads it, no login, no purchase.

Direct aiohttp GET, no Apify actor needed -- these pages render the
aggregate stat server-side in plain HTML (confirmed by fetching them
directly), unlike the for-sale listing search which needs Apify's
anti-blocking handling (see property24_ingest.py).
"""

from __future__ import annotations

import logging
import re
import time

import aiohttp

logger = logging.getLogger(__name__)

# Confirmed 2026-08-20 from https://www.property24.com/property-values
# (province name -> (url slug, numeric area id)). Property24 assigns
# these ids per area and they don't change once assigned.
_PROVINCE_AREA: dict[str, tuple[str, int]] = {
    "gauteng": ("gauteng", 1),
    "kwazulunatal": ("kwazulu-natal", 2),
    "freeState": ("free-state", 3),
    "mpumalanga": ("mpumalanga", 5),
    "northWest": ("north-west", 6),
    "easternCape": ("eastern-cape", 7),
    "northernCape": ("northern-cape", 8),
    "westernCape": ("western-cape", 9),
    "limpopo": ("limpopo", 14),
}

_AVG_PRICE_RE = re.compile(r"average price of properties in [^i]*is R\s*([\d\s]+)\.")
_LISTING_COUNT_RE = re.compile(r"currently\s+([\d\s]+)\s+properties on the market")

_CACHE: dict[str, tuple[float, dict]] = {}
_CACHE_TTL_S = 24 * 60 * 60  # this is a slow-moving aggregate, no need to refetch often


async def get_province_market_context(province: str) -> dict | None:
    """Returns {"avg_price": float, "active_listings": int, "source_url": str}
    for the given province key (as used by property24_ingest._resolve_province),
    or None if the page couldn't be fetched/parsed. Cached in-process for 24h."""
    cached = _CACHE.get(province)
    if cached and (time.time() - cached[0]) < _CACHE_TTL_S:
        return cached[1]

    area = _PROVINCE_AREA.get(province)
    if area is None:
        logger.warning("[market_stats] Unknown province key '%s' -- no area mapping", province)
        return None
    slug, area_id = area
    url = f"https://www.property24.com/property-values/{slug}/{area_id}"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=20)) as resp:
                if resp.status >= 400:
                    logger.warning("[market_stats] %s returned %d", url, resp.status)
                    return None
                html = await resp.text()
    except Exception:
        logger.exception("[market_stats] Failed to fetch %s", url)
        return None

    avg_match = _AVG_PRICE_RE.search(html)
    count_match = _LISTING_COUNT_RE.search(html)
    if not avg_match:
        logger.warning("[market_stats] Could not parse average price out of %s", url)
        return None

    result = {
        "avg_price": float(avg_match.group(1).replace(" ", "").replace("\xa0", "")),
        "active_listings": int(count_match.group(1).replace(" ", "").replace("\xa0", "")) if count_match else None,
        "source_url": url,
    }
    _CACHE[province] = (time.time(), result)
    return result
