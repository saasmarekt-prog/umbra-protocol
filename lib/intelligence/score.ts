export type Inputs={momentum:number;liquidity:number;volume:number;sentiment:number;onchain:number;whales:number;derivatives:number;development:number;risk:number};
export function clamp(v:number){return Math.max(0,Math.min(100,v));}
export function score(i:Inputs){
  const total=0.15*i.momentum+0.10*i.liquidity+0.10*i.volume+0.15*i.sentiment+0.10*i.onchain+0.10*i.whales+0.10*i.derivatives+0.05*i.development+0.15*(100-i.risk);
  return Math.round(clamp(total)*10)/10;
}
export function confidence(available:number,total:number){return Math.round((available/total)*1000)/10;}
