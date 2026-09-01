import { env } from '@/lib/config';
export type SocialSummary={mentions24h:number|null;sentiment:number|null;source:string};
export async function fetchSocial(symbol:string):Promise<SocialSummary>{
  if(!env.socialProviderUrl || !env.socialProviderApiKey) return {mentions24h:null,sentiment:null,source:'not-configured'};
  const u=new URL(env.socialProviderUrl); u.searchParams.set('symbol',symbol);
  const r=await fetch(u,{headers:{Authorization:`Bearer ${env.socialProviderApiKey}`},cache:'no-store'}); if(!r.ok) throw new Error(`social ${r.status}`);
  const j=await r.json(); return {mentions24h:Number.isFinite(Number(j.mentions24h))?Number(j.mentions24h):null,sentiment:Number.isFinite(Number(j.sentiment))?Number(j.sentiment):null,source:'configured-provider'};
}
