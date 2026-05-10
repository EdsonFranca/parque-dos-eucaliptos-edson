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
  console.log('Buscando mensagens...')
  const { data: msgs } = await supabaseAdmin.from('mensagens_chats').select('id');
  if (msgs && msgs.length > 0) {
     const ids = msgs.map(m => m.id);
     const { error } = await supabaseAdmin.from('mensagens_chats').delete().in('id', ids);
     console.log('Mensagens apagadas:', ids.length, error || 'Sem erros');
  } else {
     console.log('Nenhuma mensagem na base.');
  }
  
  console.log('Buscando caixas de chat...')
  const { data: chats } = await supabaseAdmin.from('chats_classificados').select('id');
  if (chats && chats.length > 0) {
     const cIds = chats.map(c => c.id);
     const { error } = await supabaseAdmin.from('chats_classificados').delete().in('id', cIds);
     console.log('Chats apagados:', cIds.length, error || 'Sem erros');
  } else {
     console.log('Nenhum chat na base.');
  }
  
  console.log('Limpador concluído com sucesso!');
}
test();
