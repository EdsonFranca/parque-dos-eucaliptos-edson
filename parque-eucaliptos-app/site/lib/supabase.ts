import { createClient } from '@supabase/supabase-js';

// Adicione as URLs e Chaves em um arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

//if (!supabaseUrl || !supabaseAnonKey) {
  //console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas. O cliente não conseguirá se conectar.');
//}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'parque-admin-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
