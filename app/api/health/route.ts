import { env } from '@/lib/config';
export const dynamic='force-dynamic';
export async function GET(){
  let supabase='missing';
  if(env.supabaseUrl && env.supabaseServiceRoleKey){
    try { supabase = 'configured'; } catch { supabase='error'; }
  }
  return Response.json({ok:true,service:'umbra',version:'0.5.1',timestamp:new Date().toISOString(),integrations:{supabase}});
}
