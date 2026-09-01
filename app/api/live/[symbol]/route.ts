import { fetchDerivatives, fetchMarket } from '@/lib/connectors/binance';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const normalized = symbol.toUpperCase();
  try {
    const [market, derivatives] = await Promise.allSettled([fetchMarket(normalized), fetchDerivatives(normalized)]);
    return Response.json({
      symbol: normalized,
      market: market.status === 'fulfilled' ? market.value : null,
      derivatives: derivatives.status === 'fulfilled' ? derivatives.value : null,
      sources: {
        market: market.status === 'fulfilled' ? 'binance' : 'unavailable',
        derivatives: derivatives.status === 'fulfilled' ? 'binance-futures' : 'unavailable'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'upstream_error' }, { status: 502 });
  }
}
