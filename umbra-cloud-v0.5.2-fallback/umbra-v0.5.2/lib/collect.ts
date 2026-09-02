import { db } from '@/lib/db/server';
import { fetchDerivatives, fetchMarket } from '@/lib/connectors/binance';
import { fetchNews } from '@/lib/connectors/news';
import { fetchOnchain } from '@/lib/connectors/solana';
import { fetchSocial } from '@/lib/connectors/social';
import { buildRadar } from '@/lib/intelligence/radar';
import { score, confidence } from '@/lib/intelligence/score';

const ASSETS=['BTC','ETH','SOL','BNB','XRP'];
export async function collectAll(){
  const supa=db(); const results=[];
  for(const symbol of ASSETS){
    const [m,d,o,s,n]=await Promise.allSettled([fetchMarket(symbol),fetchDerivatives(symbol),fetchOnchain(symbol),fetchSocial(symbol),fetchNews(symbol)]);
    if(m.status!=='fulfilled') { results.push({symbol,ok:false,error:String(m.reason)}); continue; }
    const market=m.value; const derivatives=d.status==='fulfilled'?d.value:null; const onchain=o.status==='fulfilled'?o.value:null; const social=s.status==='fulfilled'?s.value:null; const news=n.status==='fulfilled'?n.value:[];
    const {data:prev}=await supa.from('market_snapshots').select('volume_24h').eq('symbol',symbol).order('captured_at',{ascending:false}).limit(1).maybeSingle();
    const prevVol=prev?.volume_24h?Number(prev.volume_24h):null;
    await supa.from('market_snapshots').insert({symbol,price:market.price,change_24h:market.change24h,volume_24h:market.volume24h,captured_at:market.capturedAt,source:'binance'});
    if(derivatives) await supa.from('derivative_snapshots').insert({symbol,funding_rate:derivatives.fundingRate,open_interest:derivatives.openInterest,captured_at:derivatives.capturedAt,source:'binance-futures'});
    if(onchain) await supa.from('onchain_snapshots').insert({symbol,holders:onchain.holders,transfers_24h:onchain.transfers24h,captured_at:onchain.capturedAt,source:onchain.source});
    if(social) await supa.from('social_snapshots').insert({symbol,mentions_24h:social.mentions24h,sentiment:social.sentiment,captured_at:new Date().toISOString(),source:social.source});
    for(const item of news) await supa.from('news_items').upsert({symbol,title:item.title,url:item.url,source:item.source,published_at:item.publishedAt,description:item.description},{onConflict:'url'});
    const inputs={
      momentum:Math.min(100,Math.max(0,50+market.change24h*4)), liquidity:70, volume:Math.min(100,50+(prevVol&&prevVol>0?Math.min(50,market.volume24h/prevVol*25):10)),
      sentiment:social?.sentiment??50,onchain:onchain?.transfers24h==null?50:Math.min(100,onchain.transfers24h/1000),whales:50,
      derivatives:derivatives?.fundingRate==null?50:Math.max(0,100-Math.min(100,Math.abs(derivatives.fundingRate)*100000)),development:50,
      risk:Math.min(100,20+Math.abs(market.change24h)*2)
    };
    const available=[social?.sentiment,onchain?.transfers24h,derivatives?.fundingRate].filter(v=>v!==undefined&&v!==null).length+6;
    const total=9;
    const totalScore=score(inputs); const conf=confidence(available,total);
    await supa.from('umbra_scores').insert({symbol,total_score:totalScore,confidence:conf,inputs,calculated_at:new Date().toISOString()});
    for(const event of buildRadar(symbol,{change24h:market.change24h,fundingRate:derivatives?.fundingRate??null,volume24h:market.volume24h,prevVolume24h:prevVol})) await supa.from('radar_events').insert(event);
    results.push({symbol,ok:true,score:totalScore,confidence:conf});
  }
  return results;
}
