import { env } from '@/lib/config';

export async function askAI(context:any, question:string){
  if(env.aiApiUrl && env.aiApiKey){
    const r=await fetch(env.aiApiUrl,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${env.aiApiKey}`},body:JSON.stringify({model:env.aiModel,messages:[{role:'system',content:'You are UMBRA market intelligence assistant. Never present speculation as certainty. Use only provided context and explicitly state missing data.'},{role:'user',content:`Context:\n${JSON.stringify(context)}\n\nQuestion:\n${question}`}],temperature:0.2}),cache:'no-store'});
    if(r.ok){const j=await r.json(); return j.choices?.[0]?.message?.content ?? 'AI provider returned no content.';}
  }
  return `UMBRA AI (safe fallback)\n\nQuestion: ${question}\n\nCurrent market context is available, but no AI provider is configured. Configure AI_API_URL + AI_API_KEY for generated analysis. Data availability is shown explicitly to avoid fabricated signals.`;
}
