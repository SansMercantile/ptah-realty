# PTAH Realty -- Backend

FastAPI + MongoDB backend for the PTAH Realty mini-app. Runs on AWS; the
frontend (public repo: `ptah-realty`, served at
[ptahrealty.sansmercantile.com](https://ptahrealty.sansmercantile.com)) calls
this service over HTTPS via `REALTY_BACKEND_URL`.

This directory lives in `constellation` (private) rather than the public
`ptah-realty` frontend repo, since it holds MongoDB/Bedrock/Apify/Entegral
integration details that shouldn't ship in a public repo.

See the original design notes in `ptah/backend/migrations/002_realty_valuation.sql`
and `docs/ARCHITECTURE.md` under the main `ptah` directory for background --
this service supersedes that SQL-based draft with a MongoDB-backed
implementation.

## Setup

```bash
cp .env.example .env      # MONGODB_URI, APIFY_TOKEN, AWS_REGION
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8010
```

## API surface

The original valuation/listing APIs remain under `/api/v1/realty`. The demo feature modules are exposed through:

- `/api/v1/realty/search` - property, GPS, suggestions, and recently viewed.
- `/api/v1/realty/analytics` - suburb summaries and suburb lists.
- `/api/v1/realty/prospecting` - DOM filters, owner dates, leads, and scripts.
- `/api/v1/intelligence` - typed property-panel search, analytics, KYC, and deeds mock contracts.

The companion UI is in [ptah-realty (demo)](./ptah-realty%20(demo)). It uses AWS-first configuration: Amazon Bedrock for AI, Amazon S3 as the optional production asset store, and vector cadastral mode by default. External registry and listing providers remain provider-specific.
