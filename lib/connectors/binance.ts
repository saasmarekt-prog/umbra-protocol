export type MarketPoint = { symbol:string; price:number; change24h:number; volume24h:number; capturedAt:string };
export type DerivativePoint = { symbol:string; fundingRate:number|null; openInterest:number|null; capturedAt:string };

const BASE='https://api.binance.com'; const FUT='https://fapi.binance.com';
async function getJson(url:string){ const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error(`upstream ${r.status}`); return r.json(); }
export async function fetchMarket(symbol:string):Promise<MarketPoint>{
  const ticker=await getJson(`${BASE}/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`);
  return {symbol,price:Number(ticker.lastPrice),change24h:Number(ticker.priceChangePercent),volume24h:Number(ticker.quoteVolume),capturedAt:new Date().toISOString()};
}
export async function fetchDerivatives(symbol:string):Promise<DerivativePoint>{
  const s=`${symbol.toUpperCase()}USDT`;
  const [funding, oi]=await Promise.all([
    getJson(`${FUT}/fapi/v1/premiumIndex?symbol=${s}`),
    getJson(`${FUT}/fapi/v1/openInterest?symbol=${s}`)
  ]);
  return {symbol,fundingRate:Number.isFinite(Number(funding.lastFundingRate))?Number(funding.lastFundingRate):null,openInterest:Number.isFinite(Number(oi.openInterest))?Number(oi.openInterest):null,capturedAt:new Date().toISOString()};
}
