import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: anuncios } = await supabase.from('classificados').select('id, vendedor_id');
  if (!anuncios || anuncios.length === 0) {
    console.log("No anuncios found to test with.");
    return;
  }
  const anuncio = anuncios[0];
  const { data, error } = await supabase.from('chats_classificados').insert([{
    classificado_id: anuncio.id,
    interessado_id: anuncio.vendedor_id, 
    vendedor_id: anuncio.vendedor_id
  }]);
  console.log("Insert Error:", error);
}
test();
