# PTAH Realty

Comparative market analysis, automated client-facing PDF valuation reports,
and listing distribution -- a standalone mini-app in the PTAH product family
(same relationship to the main Ptah repo as `priv_pay` has to `Priv`: separate
repo, shared branding, sibling product).

Live at [ptahrealty.sansmercantile.com](https://ptahrealty.sansmercantile.com).

## Repo layout

This repo (public) holds only the frontend. The backend (FastAPI + MongoDB,
Bedrock, Property24/Apify, Entegral integrations) lives in the private
`constellation` repo under `ptah-realty-backend/`, deployed separately on AWS.
The frontend talks to it over HTTPS via `REALTY_BACKEND_URL` -- see
`frontend/server.ts`.

## Why it's a separate repo from Ptah

Ptah's core product is construction/infrastructure project management. Realty
valuation and sales-side publishing is the natural adjacent step once a
development is complete, but it's a distinct workflow with its own data model
-- so it ships as its own app rather than living inside Ptah's codebase,
while keeping Ptah's visual identity (slate/amber palette, animated
building-motif logo).

## Stack

- **Frontend**: React 19 + Vite + Tailwind v4, same build setup as Ptah's own
  frontend (`tsx server.ts` for dev, static Express serve + HTTPS proxy to
  the backend in prod).
- **Backend** (separate repo/deploy): FastAPI + Motor (MongoDB), AWS Bedrock
  for report narrative generation, Property24 comparable-sales ingestion via
  Apify, Entegral Sync API for listing distribution.

## Setup

```bash
cd frontend
npm install
cp .env.example .env      # set REALTY_BACKEND_URL for local/staging backend
npm run dev                # Vite dev proxy -> localhost:8010 by default
```

For production, `REALTY_BACKEND_URL` should point at the deployed backend's
HTTPS endpoint (AWS). `server.ts` proxies `/api` and `/media` to it.

## API surface

Consumed from the backend at `REALTY_BACKEND_URL`:

```
POST /api/v1/realty/properties                      create a property
GET  /api/v1/realty/properties                        list properties
POST /api/v1/realty/properties/{id}/media               upload a property photo
POST /api/v1/realty/comparables/ingest                    pull comparable sales (Property24 scrape)
POST /api/v1/realty/valuation                               compute + save a CMA valuation snapshot
GET  /api/v1/realty/valuation/{id}/latest                    latest valuation for a property
POST /api/v1/realty/reports/generate                           generate the client-facing PDF report
GET  /api/v1/realty/reports/{id}                                 poll report status
POST /api/v1/realty/listings/feed                                  get syndication-ready feed XML
POST /api/v1/realty/listings/publish                                push via Entegral Sync (if configured)
GET  /api/v1/realty/listings/{property_id}/status                    sync job history
```
