export type Radar={symbol:string;event:string;severity:'LOW'|'MEDIUM'|'HIGH';confidence:number;detail:string;createdAt:string};
export function buildRadar(symbol:string, data:{change24h:number;fundingRate:number|null;volume24h:number;prevVolume24h:number|null}):Radar[]{
 const out:Radar[]=[]; const now=new Date().toISOString();
 if(Math.abs(data.change24h)>=7) out.push({symbol,event:'PRICE_MOVE',severity:'HIGH',confidence:0.92,detail:`24h move ${data.change24h.toFixed(2)}%`,createdAt:now});
 if(data.fundingRate!==null && Math.abs(data.fundingRate)>=0.0005) out.push({symbol,event:'FUNDING_ANOMALY',severity:'MEDIUM',confidence:0.78,detail:`Funding ${data.fundingRate.toFixed(6)}`,createdAt:now});
 if(data.prevVolume24h && data.volume24h >= data.prevVolume24h*2) out.push({symbol,event:'VOLUME_SPIKE',severity:'HIGH',confidence:0.89,detail:'24h volume doubled vs stored baseline',createdAt:now});
 return out;
}
