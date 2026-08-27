"""
PTAH Realty -- Vercel domain provisioning.

Attaches a tenant's custom domain to the frontend's Vercel project during
onboarding (see api/routes.py's POST /platform/tenants). Vercel handles
SSL automatically once the domain is attached and its DNS is pointed at
Vercel -- this module doesn't touch DNS itself (the tenant's own domain
registrar does), it only registers the domain with the project and
returns the DNS records the tenant needs to configure.
"""
from __future__ import annotations

import aiohttp

from config import settings

VERCEL_API_BASE = "https://api.vercel.com"


class VercelError(Exception):
    pass


async def add_domain_to_project(domain: str) -> dict:
    """Attaches `domain` to the configured Vercel project. Returns a dict
    with `verified` (bool) and `dns_instructions` (what the tenant needs
    to configure at their own registrar). Raises VercelError with a
    human-readable message on failure -- callers should treat this as
    non-fatal to tenant creation (the tenant record is still valid, the
    domain step can be retried/finished manually) rather than failing the
    whole onboarding call.
    """
    if not settings.VERCEL_API_TOKEN or not settings.VERCEL_PROJECT_ID:
        raise VercelError("Vercel API credentials are not configured on this deployment.")

    url = f"{VERCEL_API_BASE}/v10/projects/{settings.VERCEL_PROJECT_ID}/domains"
    params = {"teamId": settings.VERCEL_TEAM_ID} if settings.VERCEL_TEAM_ID else {}
    headers = {"Authorization": f"Bearer {settings.VERCEL_API_TOKEN}", "Content-Type": "application/json"}

    async with aiohttp.ClientSession() as session:
        async with session.post(url, params=params, headers=headers, json={"name": domain}) as resp:
            body = await resp.json()
            if resp.status >= 400:
                message = body.get("error", {}).get("message", str(body))
                raise VercelError(f"Vercel rejected domain {domain}: {message}")

    verified = body.get("verified", False)
    # is_apex: no subdomain part (e.g. "acmerealty.co.za" vs "cma.acmerealty.co.za").
    # Vercel wants an A record for apex domains and a CNAME for subdomains.
    is_apex = domain.count(".") == 1
    dns_instructions = (
        {"type": "A", "name": "@", "value": "76.76.21.21"}
        if is_apex
        else {"type": "CNAME", "name": domain.split(".")[0], "value": "cname.vercel-dns.com"}
    )

    return {
        "domain": domain,
        "verified": verified,
        "dns_instructions": dns_instructions,
        "note": (
            "Domain attached to Vercel. Point the DNS record above at your "
            "registrar; Vercel provisions SSL automatically once it "
            "detects correct DNS (usually within a few minutes, can take "
            "up to 24-48h for DNS propagation)."
        ),
    }
