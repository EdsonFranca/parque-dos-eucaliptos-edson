import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('classificados')
    .select('*')
    .eq('status', 'inativo')
    .order('updated_at', { ascending: false });
  console.log('Error:', error);
  console.log('Data count:', data?.length);
}

test();
