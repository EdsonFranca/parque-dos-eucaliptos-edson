import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Testar conexão básica
    console.log('🔍 Testando conexão com Supabase...');
    
    const { data: testData, error: testError } = await supabase
      .from('perfis_moradores')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Erro ao acessar tabela:', testError);
      return NextResponse.json({ 
        status: 'error',
        message: 'Tabela perfis_moradores não existe ou sem acesso',
        error: testError 
      });
    }
    
    // Testar criação de usuário simples
    console.log('🔍 Testando criação de usuário...');
    
    const testEmail = `test_${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
      options: {
        data: {
          nome: 'Test User',
          chacara: 'Test Chácara'
        }
      }
    });
    
    if (authError) {
      console.log('❌ Erro ao criar usuário:', authError);
      return NextResponse.json({ 
        status: 'error',
        message: 'Erro ao criar usuário no Supabase Auth',
        error: authError,
        testEmail: testEmail
      });
    }
    
    console.log('✅ Usuário criado com sucesso:', authData.user?.id);
    
    // Limpar usuário de teste
    await supabase.auth.admin.deleteUser(authData.user!.id);
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Supabase Auth funcionando corretamente',
      authData: {
        id: authData.user?.id,
        email: authData.user?.email
      },
      tableAccess: {
        perfis_moradores: testData ? 'OK' : 'NOK'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Erro geral no diagnóstico',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
