import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/config';

let client: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('Supabase server credentials are missing');
  }
  if (!client) client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: { persistSession: false } });
  return client;
}
