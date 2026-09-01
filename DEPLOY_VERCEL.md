# UMBRA Cloud — Vercel Deployment

## 1) Supabase
Create a Supabase project and run `supabase/migrations/001_init.sql` in SQL Editor.
The database is Postgres; `pgvector` is enabled by the migration for future RAG/embeddings. Supabase documents pgvector as the Postgres extension for storing embeddings. 

Required Vercel environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UMBRA_CRON_SECRET`
- `SOLANA_RPC_URL`

Optional providers:
- `HELIUS_API_KEY`
- `NEWS_API_KEY`
- `SOCIAL_PROVIDER_URL`
- `SOCIAL_PROVIDER_API_KEY`
- `AI_API_URL`
- `AI_API_KEY`
- `AI_MODEL`

## 2) Vercel
Import this repository into Vercel.
Framework preset: Next.js.
Root directory: repository root.

Add environment variables in Settings -> Environment Variables, then redeploy. Vercel's documentation notes that environment changes require a redeploy to take effect.

## 3) Cron
`vercel.json` runs `/api/collect` every 5 minutes. Vercel Cron invokes the deployed function. Hobby cannot deploy schedules more frequent than daily; Pro/Enterprise support per-minute schedules.

## 4) First verification
After deployment:
- `GET /api/health`
- open `/`
- invoke `/api/collect` from Vercel Cron or a protected request using `Authorization: Bearer <UMBRA_CRON_SECRET>`
- verify rows in Supabase tables

## 5) Secrets
Do not expose service-role, AI, News, Helius, or social keys in `NEXT_PUBLIC_*` variables. Vercel explicitly treats `NEXT_PUBLIC_*` values as client-visible.
