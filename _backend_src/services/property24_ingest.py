"""
PTAH Realty -- comparable sales ingestion via Apify's Property24 scraper.

Property24 has no public API for pulling listings/sold data, so comparable
ingestion goes through an Apify actor. Requires APIFY_TOKEN in the
environment (APIFY_PROPERTY24_ACTOR selects which actor).

IMPORTANT -- history (2026-08-20): this originally ran
`solidcode/property24-scraper`. Live CloudWatch logs showed every ingest
job over several days returning "Apify returned 0 raw item(s)" -- the
sold->for_sale fallback ran every time and *also* came back empty, which
is what actually produced the "0 comparable sales" bug reports. Switched
to `crawlerbros/property24-scraper`, which documents explicit retry/
backoff, Apify Proxy escalation, and a TLS-impersonating fallback client
for exactly this kind of blocking, and is actively maintained.

IMPORTANT -- sold-price data availability (still true with the new actor):
Property24 itself has no public "recently sold" feed -- neither actor
exposes a sold dealType/transactionType, because the underlying site
doesn't have one to scrape. `ingest_from_apify` always pulls "for sale"
(asking price) listings and tags every record `price_basis: "asking"` so
downstream valuation/UI code treats it as a weaker signal than an actual
sale price (see services/valuation.py's confidence penalty for this).
Real sold-price data would require a different source entirely (Deeds
Office / WinDeed / Lightstone, or a purchased Property24 report feed) --
this is a data-availability constraint, not a bug.

crawlerbros/property24-scraper searches by *province*, not free-text
suburb/address -- there's no suburb-level query param on this actor. So
`ingest_from_apify` resolves the caller's free-text `search_location` to
one of the 9 SA provinces (best-effort keyword match, see
_resolve_province), pulls a broad batch of that province's listings for
the requested property type, and filters down to the ones whose `suburb`/
`city` actually match the search text. If nothing matches (an unusual
suburb name our keyword table doesn't know, e.g.), the raw province-wide
batch is used instead of returning nothing -- valuation.py filters
comparables again downstream by suburb/complex/radius, so an imperfect
province-level ingest still isn't wasted, and this is logged clearly
either way so it's diagnosable instead of silently returning empty.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

import aiohttp

from config import settings

logger = logging.getLogger(__name__)

APIFY_RUN_URL = (
    "https://api.apify.com/v2/acts/{actor}/run-sync-get-dataset-items"
    "?token={token}"
)

# Best-effort free-text -> SA province resolution. crawlerbros/property24-scraper
# only accepts one of these 9 province values, not a suburb/address string, so
# this is how a caller's "Camps Bay, Cape Town" or "Bedfordview" becomes a
# valid actor input. Keyed on lowercase substring match against the whole
# search_location string; first match wins. Not exhaustive -- covers the
# major metros -- falls back to "gauteng" (most populous) with a logged
# warning when nothing matches, rather than failing the ingest outright.
_PROVINCE_KEYWORDS: dict[str, str] = {
    # Western Cape
    "cape town": "westernCape", "camps bay": "westernCape", "bantry bay": "westernCape",
    "clifton": "westernCape", "sea point": "westernCape", "green point": "westernCape",
    "constantia": "westernCape", "stellenbosch": "westernCape", "somerset west": "westernCape",
    "paarl": "westernCape", "george": "westernCape", "hermanus": "westernCape",
    "western cape": "westernCape",
    # Gauteng
    "johannesburg": "gauteng", "sandton": "gauteng", "randburg": "gauteng",
    "midrand": "gauteng", "bedfordview": "gauteng", "centurion": "gauteng",
    "pretoria": "gauteng", "roodepoort": "gauteng", "soweto": "gauteng",
    "benoni": "gauteng", "boksburg": "gauteng", "gauteng": "gauteng",
    # KwaZulu-Natal
    "durban": "kwazulunatal", "umhlanga": "kwazulunatal", "pietermaritzburg": "kwazulunatal",
    "ballito": "kwazulunatal", "kwazulu": "kwazulunatal", "natal": "kwazulunatal",
    # Eastern Cape
    "port elizabeth": "easternCape", "gqeberha": "easternCape", "east london": "easternCape",
    "eastern cape": "easternCape",
    # Free State
    "bloemfontein": "freeState", "free state": "freeState",
    # Limpopo
    "polokwane": "limpopo", "limpopo": "limpopo",
    # Mpumalanga
    "nelspruit": "mpumalanga", "mbombela": "mpumalanga", "mpumalanga": "mpumalanga",
    # North West
    "rustenburg": "northWest", "mahikeng": "northWest", "north west": "northWest",
    # Northern Cape
    "kimberley": "northernCape", "northern cape": "northernCape",
}

_DEFAULT_PROVINCE = "gauteng"


def _resolve_province(search_location: str) -> str:
    loc = search_location.lower()
    for keyword, province in _PROVINCE_KEYWORDS.items():
        if keyword in loc:
            return province
    logger.warning(
        "[realty_ingest] Could not resolve a province for '%s' -- defaulting to "
        "'%s'. Add a keyword to _PROVINCE_KEYWORDS in property24_ingest.py if "
        "this location comes up again.",
        search_location, _DEFAULT_PROVINCE,
    )
    return _DEFAULT_PROVINCE


async def ingest_from_apify(db, search_location: str, property_type: str, max_items: int = 100) -> int:
    """Runs the Apify Property24 scraper for `search_location` and upserts
    results into the `comparables` collection. Returns the number of
    documents upserted.

    Always asking-price data (see module docstring for why) -- fetches a
    broad batch for the resolved province + property type, then narrows to
    listings whose suburb/city match the caller's free-text location.
    """
    if not settings.APIFY_TOKEN:
        raise RuntimeError("APIFY_TOKEN is not configured -- cannot run comparable ingestion.")

    property_type_map = {
        "apartment": "apartment",
        "house": "house",
        "townhouse": "townhouse",
        "vacant_land": "vacantLand",
        "commercial": "commercial",
    }
    mapped_property_type = property_type_map.get(property_type, "apartment")
    province = _resolve_province(search_location)

    # Fetch a wider batch than max_items -- most of it gets filtered out by
    # the suburb match below, and crawlerbros' search is province-wide with
    # no suburb param, so a small maxItems would mostly miss the target area.
    fetch_count = max(max_items * 4, 200)
    items = await _run_actor(province, mapped_property_type, fetch_count)
    logger.info(
        "[realty_ingest] Apify returned %d raw item(s) for province=%s propertyType=%s (target location '%s')",
        len(items), province, mapped_property_type, search_location,
    )

    matched = _filter_by_location(items, search_location)
    if matched:
        logger.info(
            "[realty_ingest] %d/%d item(s) matched location '%s' by suburb/city",
            len(matched), len(items), search_location,
        )
        items = matched[:max_items]
    elif items:
        logger.warning(
            "[realty_ingest] 0/%d item(s) matched location '%s' by suburb/city -- "
            "using unfiltered province-wide batch instead (valuation.py filters "
            "comparables again downstream by suburb/complex/radius, so this isn't "
            "wasted, but it's a weaker match than a real suburb hit).",
            len(items), search_location,
        )
        items = items[:max_items]

    upserted = 0
    skipped_no_id = 0
    skipped_no_price = 0
    for item in items:
        doc = _map_apify_item(item)
        if doc is None:
            skipped_no_id += 1
            logger.debug("[realty_ingest] Skipped item with no listing id/url: %s", list(item.keys()))
            continue
        if doc["sale_price"] is None and doc["list_price"] is None:
            skipped_no_price += 1
        await db.comparables.update_one(
            {"source": "property24_apify", "source_ref": doc["source_ref"]},
            {"$set": doc},
            upsert=True,
        )
        upserted += 1

    logger.info(
        "[realty_ingest] Upserted %d comparables for '%s' (price_basis=asking, skipped_no_id=%d, no_price=%d)",
        upserted, search_location, skipped_no_id, skipped_no_price,
    )
    return upserted


def _filter_by_location(items: list[dict], search_location: str) -> list[dict]:
    """Keeps items whose suburb or city appears in (or contains) the
    caller's free-text search_location, case-insensitively."""
    loc = search_location.lower()
    out = []
    for item in items:
        suburb = str(item.get("suburb") or "").lower()
        city = str(item.get("city") or "").lower()
        if (suburb and (suburb in loc or loc in suburb)) or (city and (city in loc or loc in city)):
            out.append(item)
    return out


async def _run_actor(province: str, mapped_property_type: str, max_items: int) -> list[dict]:
    """Runs one crawlerbros/property24-scraper search-mode call. Returns raw items."""
    actor = settings.APIFY_PROPERTY24_ACTOR
    url = APIFY_RUN_URL.format(actor=actor.replace("/", "~"), token=settings.APIFY_TOKEN)

    run_input = {
        "mode": "search",
        "transactionType": "forSale",  # only mode this actor supports -- see module docstring
        "propertyType": mapped_property_type,
        "province": province,
        "includeFullDetails": False,
        "maxItems": min(max_items, 500),  # actor's hard cap
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=run_input, timeout=aiohttp.ClientTimeout(total=300)) as resp:
            if resp.status >= 400:
                body = await resp.text()
                raise RuntimeError(f"Apify actor run failed ({resp.status}): {body[:500]}")
            items = await resp.json()
    return items


_REVERSE_PROPERTY_TYPE = {
    "house": "house",
    "apartment": "apartment",
    "townhouse": "townhouse",
    "vacantland": "vacant_land",
    "farm": "house",
    "commercial": "commercial",
    "industrial": "commercial",
}


def _map_apify_item(item: dict) -> dict | None:
    """Maps one crawlerbros/property24-scraper dataset item (search-mode
    schema -- see https://apify.com/crawlerbros/property24-scraper) to our
    normalized comparable schema."""
    listing_id = item.get("listingId") or item.get("listingUrl")
    if not listing_id:
        logger.debug("[realty_ingest] Item has no usable id/url, keys=%s", list(item.keys()))
        return None

    # price / priceOnApplication / pricePerSqm are mutually exclusive on
    # this actor -- price is the only one we can use as a flat sale/asking
    # figure; pricePerSqm-only commercial listings and priceOnApplication
    # listings are skipped downstream by valuation.py's "needs a price and
    # a floor size" filter, same as before.
    price = item.get("price")

    listed_date_raw = item.get("datePosted") or item.get("scrapedAt")
    try:
        sale_date = datetime.fromisoformat(listed_date_raw) if listed_date_raw else datetime.now(timezone.utc)
    except ValueError:
        sale_date = datetime.now(timezone.utc)
    if sale_date.tzinfo is None:
        sale_date = sale_date.replace(tzinfo=timezone.utc)

    raw_type = str(item.get("propertyType") or "apartment").strip().lower()
    normalized_type = _REVERSE_PROPERTY_TYPE.get(raw_type, "apartment")

    doc = {
        "source": "property24_apify",
        "source_ref": str(listing_id),
        "address_line": item.get("streetAddress") or item.get("titleText"),
        "suburb": item.get("suburb"),
        "complex_name": None,  # not returned by this actor
        "property_type": normalized_type,
        "bedrooms": item.get("bedrooms"),
        "bathrooms": item.get("bathrooms"),
        "erf_size_sqm": None,  # not distinguished from floor size by this actor
        "floor_size_sqm": item.get("floorSizeSqm"),
        "sale_price": None,  # this actor only returns asking prices -- see module docstring
        "list_price": price,
        "price_basis": "asking",
        "sale_date": sale_date,
        "listing_status": "active",
        "ingested_at": datetime.now(timezone.utc),
    }

    lat, lng = item.get("latitude"), item.get("longitude")
    if lat is not None and lng is not None:
        doc["location"] = {"type": "Point", "coordinates": [lng, lat]}
    # else: this record won't be found by the radius ($geoNear) valuation
    # method -- only by complex/suburb -- since includeFullDetails=False
    # doesn't return coordinates on this actor (only includeFullDetails=True does).

    return doc
