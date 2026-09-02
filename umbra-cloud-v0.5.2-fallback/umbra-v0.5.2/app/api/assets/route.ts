import { fetchMarket } from '@/lib/connectors/binance';
import { db } from '@/lib/db/server';
import { score as calcScore, confidence as calcConfidence } from '@/lib/intelligence/score';

const ASSETS = ['BTC','ETH','SOL','BNB','XRP'];

export const dynamic = 'force-dynamic';

async function latestStored(symbol: string) {
  try {
    const supa = db();
    const [{ data: m }, { data: s }] = await Promise.all([
      supa.from('market_snapshots').select('price,change_24h,volume_24h,captured_at').eq('symbol', symbol).order('captured_at',{ascending:false}).limit(1).maybeSingle(),
      supa.from('umbra_scores').select('total_score,confidence,calculated_at').eq('symbol', symbol).order('calculated_at',{ascending:false}).limit(1).maybeSingle(),
    ]);
    return { m, s };
  } catch {
    return { m: null, s: null };
  }
}

export async function GET() {
  const results = await Promise.all(ASSETS.map(async symbol => {
    try {
      const live = await fetchMarket(symbol);
      const stored = await latestStored(symbol);
      const persistedScore = stored.s ? Number(stored.s.total_score) : null;
      const persistedConfidence = stored.s ? Number(stored.s.confidence) : null;

      // Do not manufacture a full intelligence score. Until all signal families exist,
      // expose a transparent market-only provisional score instead.
      const momentum = Math.max(0, Math.min(100, 50 + live.change24h * 4));
      const volume = 50;
      const provisional = Math.round(calcScore({
        momentum,
        liquidity: 50,
        volume,
        sentiment: 50,
        onchain: 50,
        whales: 50,
        derivatives: 50,
        development: 50,
        risk: Math.min(100, 20 + Math.abs(live.change24h) * 2),
      }) * 10) / 10;

      return {
        symbol,
        price: live.price,
        change24h: live.change24h,
        volume24h: live.volume24h,
        score: persistedScore ?? provisional,
        confidence: persistedConfidence ?? 22.2,
        scoreType: persistedScore == null ? 'market-provisional' : 'full',
        source: live.source ?? 'binance-public',
        capturedAt: live.capturedAt,
      };
    } catch (error) {
      const stored = await latestStored(symbol);
      return {
        symbol,
        price: stored.m?.price != null ? Number(stored.m.price) : null,
        change24h: stored.m?.change_24h != null ? Number(stored.m.change_24h) : null,
        volume24h: stored.m?.volume_24h != null ? Number(stored.m.volume_24h) : null,
        score: stored.s?.total_score != null ? Number(stored.s.total_score) : null,
        confidence: stored.s?.confidence != null ? Number(stored.s.confidence) : null,
        scoreType: stored.s ? 'full-stored' : 'unavailable',
        source: stored.m ? 'supabase-stored' : 'unavailable',
        error: error instanceof Error ? error.message : 'market unavailable',
      };
    }
  }));
  return Response.json(results, { headers: { 'Cache-Control': 'no-store' } });
}
