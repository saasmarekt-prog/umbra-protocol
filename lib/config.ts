export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  cronSecret: process.env.UMBRA_CRON_SECRET || '',
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  heliusApiKey: process.env.HELIUS_API_KEY || '',
  newsApiKey: process.env.NEWS_API_KEY || '',
  socialProviderUrl: process.env.SOCIAL_PROVIDER_URL || '',
  socialProviderApiKey: process.env.SOCIAL_PROVIDER_API_KEY || '',
  aiApiUrl: process.env.AI_API_URL || '',
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || '',
};
