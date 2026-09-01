import {db} from '@/lib/db/server';
export async function GET(){const {data,error}=await db().from('radar_events').select('*').order('created_at',{ascending:false}).limit(50); if(error) return Response.json({error:error.message},{status:500}); return Response.json(data||[]);}
