import {db} from '@/lib/db/server';
export async function GET(){
 const {data:scores}=await db().from('umbra_scores').select('symbol,total_score,confidence,calculated_at').order('calculated_at',{ascending:false}).limit(100);
 const latest=new Map<string,any>(); for(const row of scores||[]) if(!latest.has(row.symbol)) latest.set(row.symbol,row);
 const out=[]; for(const symbol of ['BTC','ETH','SOL','BNB','XRP']){
  const {data:m}=await db().from('market_snapshots').select('price,change_24h,volume_24h,captured_at').eq('symbol',symbol).order('captured_at',{ascending:false}).limit(1).maybeSingle();
  const s=latest.get(symbol); out.push({symbol,price:m?.price?Number(m.price):null,change24h:m?.change_24h?Number(m.change_24h):null,volume24h:m?.volume_24h?Number(m.volume_24h):null,score:s?Number(s.total_score):null,confidence:s?Number(s.confidence):null});
 }
 return Response.json(out);
}
