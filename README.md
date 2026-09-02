# UMBRA Cloud v0.5.1

Vercel/Supabase deployment build. No SQLite and no local persistence.

## What changed
- Live Binance public market fallback in `/api/assets` even before snapshots exist.
- Transparent provisional score with low confidence when only market data is available.
- `/api/radar` falls back to live market/futures anomaly detection when Supabase has no events.
- `/api/health` now reports version and Supabase configuration status.
- UI labels provisional scores explicitly.

## Required Vercel env
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- UMBRA_CRON_SECRET

Optional:
- HELIUS_API_KEY
- NEWS_API_KEY
- SOCIAL_PROVIDER_URL
- SOCIAL_PROVIDER_API_KEY
- AI_API_URL
- AI_API_KEY
- AI_MODEL
