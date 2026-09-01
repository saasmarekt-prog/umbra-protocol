import { env } from '@/lib/config';
export type OnchainSummary={symbol:string;holders:number|null;transfers24h:number|null;source:string;capturedAt:string};

async function rpc(method:string,params:any[]){
  const r=await fetch(env.solanaRpcUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),cache:'no-store'});
  if(!r.ok) throw new Error(`solana rpc ${r.status}`); const j=await r.json(); if(j.error) throw new Error(j.error.message); return j.result;
}
export async function fetchOnchain(symbol:string):Promise<OnchainSummary>{
  // v0.4 deliberately keeps chain analytics conservative: no fabricated holder/whale counts.
  // Helius can be enabled later for parsed transfer analytics and token holder endpoints.
  await rpc('getHealth',[]);
  return {symbol,holders:null,transfers24h:null,source:env.heliusApiKey?'solana-rpc+helius-ready':'solana-rpc',capturedAt:new Date().toISOString()};
}
