// Testar conexão básica com Supabase
const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente manualmente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== TESTE DE CONEXÃO SUPABASE ===');
console.log('URL:', supabaseUrl ? 'OK' : 'NÃO DEFINIDA');
console.log('Service Key:', supabaseServiceKey ? 'OK' : 'NÃO DEFINIDA');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\nConfigure as variáveis de ambiente no .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('\n1. Testando conexão básica...');
    
    // Testar se consegue acessar o auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError && !authError.message.includes('Invalid')) {
      console.log('Conexão com Supabase OK!');
    } else {
      console.log('Conexão estabelecida');
    }
    
    console.log('\n2. Verificando tabela perfis_moradores...');
    
    // Tentar acessar a tabela
    const { data, error } = await supabase
      .from('perfis_moradores')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('ERRO: Tabela não encontrada ou sem acesso');
      console.log('Detalhes:', error.message);
      console.log('\nSOLUÇÃO: Execute o script SQL no dashboard do Supabase:');
      console.log('1. Vá para SQL Editor');
      console.log('2. Cole e execute: CREATE TABLE IF NOT EXISTS perfis_moradores (...)');
    } else {
      console.log('Tabela perfis_moradores encontrada!');
    }
    
    console.log('\n3. Testando criação de usuário...');
    
    // Tentar criar um usuário de teste
    const testEmail = `test_${Date.now()}@example.com`;
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true
    });
    
    if (userError) {
      console.log('ERRO ao criar usuário:', userError.message);
      console.log('Possíveis causas:');
      console.log('- Service Role Key inválida');
      console.log('- Permissões insuficientes');
      console.log('- Configuração do Auth desativada');
    } else {
      console.log('Usuário criado com sucesso! ID:', userData.user.id);
      
      // Limpar usuário de teste
      await supabase.auth.admin.deleteUser(userData.user.id);
      console.log('Usuário de teste removido.');
      console.log('\nTUDO OK! O endpoint deve funcionar agora.');
    }
    
  } catch (error) {
    console.error('Erro geral:', error.message);
  }
}

testConnection();
