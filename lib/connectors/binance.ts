import { env } from '@/lib/config';

export type MarketPoint = {
  symbol:string;
  price:number;
  change24h:number;
  volume24h:number;
  capturedAt:string;
  source:string;
};

export type DerivativePoint = {
  symbol:string;
  fundingRate:number|null;
  openInterest:number|null;
  capturedAt:string;
};

const SYMBOLS: Record<string,string> = {
  BTC:'BTC', ETH:'ETH', SOL:'SOL', BNB:'BNB', XRP:'XRP'
};

async function getJson(url:string, init:RequestInit = {}) {
  const r=await fetch(url,{...init,cache:'no-store',headers:{accept:'application/json',...(init.headers||{})}});
  if(!r.ok) throw new Error(`upstream ${r.status}`);
  return r.json();
}

async function fromBinance(symbol:string):Promise<MarketPoint>{
  const s=`${symbol.toUpperCase()}USDT`;
  const ticker=await getJson(`https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`);
  return {symbol,price:Number(ticker.lastPrice),change24h:Number(ticker.priceChangePercent),volume24h:Number(ticker.quoteVolume),capturedAt:new Date().toISOString(),source:'binance-public'};
}

async function fromCoinbase(symbol:string):Promise<MarketPoint>{
  const product=`${symbol.toUpperCase()}-USD`;
  const [ticker, stats] = await Promise.all([
    getJson(`https://api.exchange.coinbase.com/products/${product}/ticker`),
    getJson(`https://api.exchange.coinbase.com/products/${product}/stats`),
  ]);
  const price=Number(ticker.price ?? stats.last);
  const open=Number(stats.open);
  const volumeBase=Number(stats.volume);
  if(!Number.isFinite(price) || !Number.isFinite(open) || open <= 0 || !Number.isFinite(volumeBase)) throw new Error('coinbase invalid market payload');
  return {symbol,price,change24h:((price-open)/open)*100,volume24h:price*volumeBase,capturedAt:new Date().toISOString(),source:'coinbase-exchange-public'};
}

const CG_IDS: Record<string,string> = {
  BTC:'bitcoin', ETH:'ethereum', SOL:'solana', BNB:'binancecoin', XRP:'ripple'
};

async function fromCoinGecko(symbol:string):Promise<MarketPoint>{
  const id=CG_IDS[symbol.toUpperCase()];
  if(!id) throw new Error('unsupported CoinGecko asset');
  const base=env.coinGeckoApiKey ? 'https://pro-api.coingecko.com/api/v3/simple/price' : 'https://api.coingecko.com/api/v3/simple/price';
  const url=new URL(base);
  url.searchParams.set('ids',id);
  url.searchParams.set('vs_currencies','usd');
  url.searchParams.set('include_24hr_change','true');
  url.searchParams.set('include_24hr_vol','true');
  if(env.coinGeckoApiKey){
    // CoinGecko Pro uses x-cg-pro-api-key.
    const j=await getJson(url.toString(),{headers:{'x-cg-pro-api-key':env.coinGeckoApiKey}});
    const x=j[id];
    if(!x) throw new Error('coingecko asset missing');
    return {symbol,price:Number(x.usd),change24h:Number(x.usd_24h_change ?? 0),volume24h:Number(x.usd_24h_vol ?? 0),capturedAt:new Date().toISOString(),source:'coingecko'};
  }
  const j=await getJson(url.toString());
  const x=j[id];
  if(!x) throw new Error('coingecko asset missing');
  return {symbol,price:Number(x.usd),change24h:Number(x.usd_24h_change ?? 0),volume24h:Number(x.usd_24h_vol ?? 0),capturedAt:new Date().toISOString(),source:'coingecko-public'};
}

export async function fetchMarket(symbol:string):Promise<MarketPoint>{
  const errors:string[]=[];
  for(const provider of [() => fromBinance(symbol), () => fromCoinbase(symbol), () => fromCoinGecko(symbol)]){
    try {
      const x=await provider();
      if([x.price,x.change24h,x.volume24h].every(Number.isFinite)) return x;
      errors.push(`${x.source}:invalid-values`);
    } catch(error) {
      errors.push(error instanceof Error ? error.message : 'provider failed');
    }
  }
  throw new Error(`market providers unavailable: ${errors.join(' | ')}`);
}

export async function fetchDerivatives(symbol:string):Promise<DerivativePoint>{
  const s=`${symbol.toUpperCase()}USDT`;
  const [funding, oi]=await Promise.all([
    getJson(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${s}`),
    getJson(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${s}`)
  ]);
  return {symbol,fundingRate:Number.isFinite(Number(funding.lastFundingRate))?Number(funding.lastFundingRate):null,openInterest:Number.isFinite(Number(oi.openInterest))?Number(oi.openInterest):null,capturedAt:new Date().toISOString()};
}
