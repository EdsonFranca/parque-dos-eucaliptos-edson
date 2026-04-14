import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Config: defina variáveis do Supabase no .env.local');
  }

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Registrar sessão de usuário (sem exigir permissão de admin)
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido.' }, { status: 401 });
    }

    const supabase = getServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    const { userId, userEmail, userName } = await request.json();
    
    // Verificar se o userId corresponde ao token
    if (authData.user.id !== userId) {
      return NextResponse.json({ error: 'ID do usuário não corresponde ao token.' }, { status: 403 });
    }
    
    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // Usar service role key para ter permissão de escrita na tabela
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurado');
    }

    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Remove sessões antigas do mesmo usuário
    await serviceClient
      .from('sessoes_ativas')
      .delete()
      .eq('user_id', userId);

    // Insere nova sessão
    const { error } = await serviceClient
      .from('sessoes_ativas')
      .insert({
        user_id: userId,
        user_email: userEmail,
        user_name: userName || null,
        inicio_sessao: new Date().toISOString(),
        ultima_atividade: new Date().toISOString(),
        status: 'ativa'
      });

    if (error) {
      console.error('Erro ao registrar sessão:', error);
      return NextResponse.json({ error: 'Erro ao registrar sessão.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao registrar sessão:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
