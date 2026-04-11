// Testar conexão básica com Supabase
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl ? 'OK' : 'NÃO DEFINIDA');
console.log('Service Key:', supabaseServiceKey ? 'OK' : 'NÃO DEFINIDA');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('Configure as variáveis de ambiente primeiro!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('Testando conexão com Supabase...');
    
    // Testar conexão básica
    const { data, error } = await supabase.from('perfis_moradores').select('count').limit(1);
    
    if (error) {
      console.error('Erro na conexão:', error);
      console.log('A tabela perfis_moradores pode não existir');
      
      // Tentar listar tabelas
      console.log('Verificando se tabela existe...');
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_info', { table_name: 'perfis_moradores' });
      
      if (tablesError) {
        console.log('Tabela não encontrada. Execute o script SQL no dashboard.');
      }
    } else {
      console.log('Conexão OK! Tabela existe.');
    }
    
    // Testar criação de usuário
    console.log('Testando criação de usuário...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test123456',
      email_confirm: true
    });
    
    if (userError) {
      console.error('Erro ao criar usuário:', userError.message);
    } else {
      console.log('Usuário criado com sucesso! ID:', userData.user.id);
      
      // Limpar usuário de teste
      await supabase.auth.admin.deleteUser(userData.user.id);
      console.log('Usuário de teste removido.');
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testConnection();
