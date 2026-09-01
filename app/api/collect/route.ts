import {env} from '@/lib/config'; import {collectAll} from '@/lib/collect';
export const maxDuration=300;
export async function GET(req:Request){const auth=req.headers.get('authorization')||''; if(env.cronSecret && auth!==`Bearer ${env.cronSecret}`) return Response.json({error:'unauthorized'},{status:401}); try{const results=await collectAll(); return Response.json({ok:true,results,timestamp:new Date().toISOString()});}catch(e:any){return Response.json({ok:false,error:e.message},{status:500});}}
