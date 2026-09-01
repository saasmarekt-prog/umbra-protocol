# UMBRA Cloud v0.4

Vercel-ready UMBRA Intelligence MVP. No SQLite, no long-running worker, no local database.

## Cloud architecture
- Next.js App Router on Vercel
- Vercel Cron -> `/api/collect`
- Supabase Postgres + pgvector
- Market: Binance spot/futures public APIs
- News: NewsAPI (optional key)
- Solana: RPC + Helius-ready adapter
- Social: provider adapter via `SOCIAL_PROVIDER_URL`
- AI: OpenAI-compatible HTTP endpoint via `AI_API_URL`

## Deploy
1. Create a Supabase project and run `supabase/migrations/001_init.sql` in SQL Editor.
2. Import this repository into Vercel.
3. Add environment variables from `.env.example` in Vercel Settings.
4. Redeploy after saving env vars.
5. Open `/api/health`, then `/api/collect` (or let Cron run).

Vercel Hobby only supports daily Cron schedules; this repo uses every 5 minutes, so use Vercel Pro/Enterprise for continuous collection. See Vercel Cron limits.

## Provider status behavior
Missing/failed optional providers remain `null`/empty; UMBRA never fabricates unavailable metrics.

## Security
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `AI_API_KEY`, `NEWS_API_KEY`, Helius keys, or social credentials to the client.
- `NEXT_PUBLIC_*` variables are public by design.
- Protect `/api/collect` with `UMBRA_CRON_SECRET`.
