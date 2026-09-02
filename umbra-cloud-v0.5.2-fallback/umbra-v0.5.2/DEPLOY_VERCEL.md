# UMBRA v0.5.2 Vercel deployment

## Required environment variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- UMBRA_CRON_SECRET

## Recommended
- COINGECKO_API_KEY

## Market provider behavior
UMBRA tries Binance first. If Vercel receives HTTP 451/403/5xx or another provider error, UMBRA automatically falls back to Coinbase Exchange public market data, then CoinGecko.

No API key is required for Coinbase Exchange public market-data endpoints. CoinGecko Pro uses `COINGECKO_API_KEY` when configured.

After updating GitHub, redeploy the Vercel project. Then test:

- `/api/health`
- `/api/assets`
- `/api/radar`

A successful `/api/assets` response should contain non-null `price`, `change24h`, and `volume24h` and a `source` such as `coinbase-exchange-public` or `coingecko` if Binance is unavailable.
