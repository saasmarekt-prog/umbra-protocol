import { db } from '@/lib/db/server';
import { fetchDerivatives, fetchMarket } from '@/lib/connectors/binance';
import { buildRadar } from '@/lib/intelligence/radar';

const ASSETS = ['BTC','ETH','SOL','BNB','XRP'];
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supa = db();
    const { data, error } = await supa.from('radar_events').select('*').order('created_at',{ascending:false}).limit(50);
    if (!error && data?.length) return Response.json(data, { headers:{'Cache-Control':'no-store'} });
  } catch {}

  const liveEvents = (await Promise.all(ASSETS.map(async symbol => {
    try {
      const [m, d] = await Promise.allSettled([fetchMarket(symbol), fetchDerivatives(symbol)]);
      if (m.status !== 'fulfilled') return [];
      const derivatives = d.status === 'fulfilled' ? d.value : null;
      const events = buildRadar(symbol,{change24h:m.value.change24h,fundingRate:derivatives?.fundingRate ?? null,volume24h:m.value.volume24h,prevVolume24h:null});
      return events.map(e => ({...e, source:'live-market'}));
    } catch { return []; }
  }))).flat();

  return Response.json(liveEvents.slice(0,50), { headers:{'Cache-Control':'no-store'} });
}
