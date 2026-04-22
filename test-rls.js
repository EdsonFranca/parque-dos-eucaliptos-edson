import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We need an active session to test RLS. We can't log in without password.
// But we can check policies.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data } = await supabaseAdmin.from('perfis_moradores').select('*').limit(1);
  console.log("Perfis:", data);
}
test();
