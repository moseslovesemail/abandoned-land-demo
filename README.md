# Abandoned Land NZ — Working Demo

A deployable prototype for discovering and triaging underutilised land opportunities across New Zealand councils.

## What this demo proves

- interactive South Island candidate-land dashboard
- council, text and elevation filtering
- opportunity scoring
- synthetic parcel records with map coordinates
- lead submission and intake queue
- JSON API endpoints
- Railway-compatible Node/Express server
- `/health` endpoint

> **Prototype data only:** every parcel shown is synthetic. The demo does not claim that any real property is abandoned, council-owned, available or for sale.

## Deploy on Railway

1. Create a new Railway project from this GitHub repository.
2. Railway should detect Node automatically.
3. No environment variables are required for the first demo.
4. Railway runs `npm start` and supplies `PORT` automatically.
5. In the Railway service, generate a public domain under Networking.
6. Visit `/health` on that domain to confirm the service is running.

## API

- `GET /health`
- `GET /api/sites`
- `GET /api/sites?council=Tasman%20District&minElevation=200`
- `GET /api/leads`
- `POST /api/leads`

Example lead body:

```json
{
  "council": "Tasman District",
  "location": "Upper Motueka Valley",
  "source": "Council record",
  "contact": "example@example.nz",
  "notes": "Potential candidate for verification."
}
```

## Current prototype limitation

Lead submissions are held in server memory and reset after a redeploy/restart. A later version can connect Railway Postgres for persistent leads, council accounts, provenance records and audit history.
