"""
PTAH Realty -- outbound listing distribution.

Property24 does not offer a public, self-service API for pushing listings --
inbound sync only happens through Property24's proprietary feed protocol,
normally accessed via a syndication middleware provider such as Entegral
Sync API (entegral.net/sync) or PropData (docs.propdata.net), under an
agency/franchise account.

Given that, this module does two things instead of pretending a direct
POST endpoint exists:

  1. `generate_listing_feed_xml()` -- builds a syndication-ready XML feed
     entry for one property, in the general shape these middleware
     providers ingest (address, price, description, image URLs, agent
     details). This can be dropped into Entegral/PropData's feed importer
     once the agency has an account with them.
  2. `EntegralSyncAdapter` -- a provider-shaped adapter stub for Entegral's
     Sync API. It is NOT wired to a confirmed live endpoint -- Entegral's
     API contract is issued per-account, so the URL/payload shape here
     needs to be filled in from Entegral's integration docs once
     credentials exist. It exists so the PortalAdapter interface has
     somewhere real to plug in later without changing the call sites.
"""

from __future__ import annotations

from dataclasses import dataclass
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom

import aiohttp


@dataclass
class ListingPayload:
    property_id: str
    address_line: str
    suburb: str
    city: str
    property_type: str
    bedrooms: int | None
    bathrooms: int | None
    floor_size_sqm: float | None
    erf_size_sqm: float | None
    price: float
    description: str
    image_urls: list[str]
    agent_name: str | None = None
    agent_email: str | None = None


def generate_listing_feed_xml(payload: ListingPayload) -> str:
    root = Element("Listing", {"id": payload.property_id})

    def add(tag: str, value) -> None:
        el = SubElement(root, tag)
        el.text = "" if value is None else str(value)

    add("AddressLine", payload.address_line)
    add("Suburb", payload.suburb)
    add("City", payload.city)
    add("PropertyType", payload.property_type)
    add("Bedrooms", payload.bedrooms)
    add("Bathrooms", payload.bathrooms)
    add("FloorSizeSqm", payload.floor_size_sqm)
    add("ErfSizeSqm", payload.erf_size_sqm)
    add("Price", payload.price)
    add("Description", payload.description)

    images_el = SubElement(root, "Images")
    for url in payload.image_urls:
        img_el = SubElement(images_el, "Image")
        img_el.text = url

    if payload.agent_name or payload.agent_email:
        agent_el = SubElement(root, "Agent")
        if payload.agent_name:
            SubElement(agent_el, "Name").text = payload.agent_name
        if payload.agent_email:
            SubElement(agent_el, "Email").text = payload.agent_email

    rough = tostring(root, encoding="unicode")
    return minidom.parseString(rough).toprettyxml(indent="  ")


class EntegralSyncAdapter:
    """Stub for Entegral's Sync API. Fill in `base_url` and the request
    shape from Entegral's own integration documentation once the agency
    has an account -- this is not a confirmed live contract."""

    name = "entegral_sync"

    async def publish(self, payload: ListingPayload, credentials: dict) -> dict:
        base_url = credentials.get("base_url")
        api_key = credentials.get("api_key")
        if not base_url or not api_key:
            return {
                "success": False,
                "error_message": (
                    "Entegral Sync API credentials not configured. "
                    "Sign up at entegral.net/sync and set base_url/api_key."
                ),
            }

        feed_xml = generate_listing_feed_xml(payload)
        headers = {"Content-Type": "application/xml", "Authorization": f"Bearer {api_key}"}

        async with aiohttp.ClientSession() as session:
            async with session.post(f"{base_url}/listings", data=feed_xml, headers=headers) as resp:
                text = await resp.text()
                if resp.status >= 400:
                    return {"success": False, "error_message": f"Entegral Sync API returned {resp.status}: {text[:300]}"}
                return {"success": True, "raw": text}
