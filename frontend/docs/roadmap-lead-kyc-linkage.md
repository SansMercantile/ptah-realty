# Roadmap: Buyer-Side KYC/FICA Linkage for CRM Leads

**Status:** Not started. This document exists so the gap identified below
doesn't get quietly re-fabricated with fake data the next time someone
touches leads, birthdays, or age demographics in this CRM.

## The gap

This app has real KYC/FICA identity verification (`KYCModal.tsx`,
`services/kyc*` on the backend) -- but it is scoped **entirely to property
owners**, for deeds/title verification during a sale. It captures a full
13-digit South African ID number and verifies it against FICA.

The CRM's lead-intake flow (`NewLeadModal.tsx`) has **no equivalent for
buyers**. There is no ID number field, no FICA check, nothing. FICA
compliance in South African real estate applies to both sides of a
transaction, not just the seller, so this is a real compliance gap, not
just a data-completeness one.

This was surfaced because the AI Studio demo's `AgentScheduleCalendar.tsx`
has a "client birthday" calendar feature driven by `Lead.birthday`, and the
demo's mock data had 8 hand-typed sample birthdays with no real source
behind them. Rather than copy those fake values in, `Lead.birthday` /
`Lead.ageBracket` were added to `types.ts` and a **plain, manual,
unverified** date-of-birth field was added to lead intake
(`NewLeadModal.tsx`) and lead editing (`LeadDetailModal.tsx`) as a minimal
stopgap -- see those files for the actual current behaviour.

## Why this matters beyond one calendar widget

South African ID numbers encode date of birth in their first 6 digits
(`YYMMDD...`). If a lead's real, FICA-verified ID number were captured,
`birthday` (and by extension `ageBracket`) would be **derived, verified
data** instead of an honesty-box manual entry a user could mistype or
skip. This also means a real ID-verification flow gives you DOB for free --
it's not two separate features, it's one.

Anything downstream that currently or in future reads `Lead.birthday` /
`Lead.ageBracket` (the calendar's birthday-reminder feature, any age-bracket
demographic reporting) inherits whichever of these two data sources feeds
it. Worth being deliberate about which one before building more on top.

## Proposed full solution (not yet built)

1. **Add a buyer-side KYC/FICA step to the CRM**, reusing `KYCModal.tsx`'s
   existing SA ID number capture + verification UI/logic, but scoped to a
   `Lead` instead of a property owner. Likely a new tab/section on
   `LeadDetailModal.tsx` ("Verify Buyer / FICA"), not a full second modal --
   the owner-side one already has search/lookup UI that doesn't apply here.
2. **Parse DOB out of the verified SA ID number** (positions 0-5 =
   `YYMMDD`; the well-known SA ID format also encodes gender in digit 7 and
   citizenship in digit 11, which are out of scope here but worth knowing
   about if this ever needs sanity-checking against a captured ID). This
   becomes the source of truth for `Lead.birthday` once a lead has a
   verified ID number -- the manual date field this roadmap's minimal
   version added should then be treated as a fallback for leads without
   verification, not overwritten silently.
3. **Decide on `ageBracket`'s real destination.** It's currently unused
   anywhere in the app (confirmed against both this repo and the AI Studio
   demo -- dead field in both). `computeAgeBracket()` in
   `utils/formatters.ts` derives it from birthday already; if a future
   demographic-reporting feature wants it, that function is the place to
   extend, not a new one.
4. **Re-visit `AgentScheduleCalendar.tsx`'s birthday-event feature** (see
   the demo's version for the full implementation: `CalendarEventType`
   'birthday', a dedicated Birthday Milestone modal, day-cell birthday
   indicator) once real birthday data actually exists at meaningful volume
   -- there was no point wiring a demo-only mock-data feature onto a field
   that, as of this roadmap, most real leads won't have populated.
5. **Compliance review**: before building any of the above, confirm with
   whoever owns FICA compliance for Ptah Realty exactly what's legally
   required to be captured/verified for buyers vs. sellers, and whether ID
   numbers need the same encryption-at-rest/access-audit treatment the
   owner-side flow presumably already has (not verified as part of this
   roadmap -- check `services/kyc*` on the backend).

## What NOT to do

Don't repopulate `mockData.ts`'s `INITIAL_LEADS` with fabricated
`birthday` values to make the calendar/demographics features "look done."
That was the original ask this roadmap replaced -- real data or an honest
gap, not synthetic data dressed up as real.
