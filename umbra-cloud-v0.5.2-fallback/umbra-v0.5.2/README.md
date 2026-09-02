# UMBRA Cloud v0.5.2

Vercel/Supabase production-oriented build.

## Fix in v0.5.2
The previous build received HTTP 451 from Binance from Vercel. Market data now uses an ordered provider chain:
1. Binance public spot API
2. Coinbase Exchange public ticker + 24h stats
3. CoinGecko (Pro when `COINGECKO_API_KEY` is configured; public endpoint otherwise)

This means a Binance geo/WAF restriction no longer makes `/api/assets` empty when another provider is available.

## Required Vercel env
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- UMBRA_CRON_SECRET

Recommended:
- COINGECKO_API_KEY

Optional:
- HELIUS_API_KEY
- NEWS_API_KEY
- SOCIAL_PROVIDER_URL
- SOCIAL_PROVIDER_API_KEY
- AI_API_URL
- AI_API_KEY
- AI_MODEL
