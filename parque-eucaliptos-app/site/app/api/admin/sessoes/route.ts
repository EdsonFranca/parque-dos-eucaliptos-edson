import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServerClients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error('Config: defina SUPABASE_SERVICE_ROLE_KEY no .env.local.');
  }

  const anonClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const serviceClient = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { anonClient, serviceClient };
}

async function isAdminRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return { ok: false as const, status: 401 };

  const { anonClient, serviceClient } = getServerClients();
  const { data: authData, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !authData.user) return { ok: false as const, status: 401 };

  const { data: perfilAdmin } = await serviceClient
    .from('perfis_moradores')
    .select('tipo_usuario')
    .eq('id', authData.user.id)
    .single();

  if (perfilAdmin?.tipo_usuario !== 'admin') return { ok: false as const, status: 403 };

  return { ok: true as const, serviceClient };
}

// Registrar início de sessão
export async function POST(request: Request) {
  try {
    const auth = await isAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: auth.status });
    }

    const { userId, userEmail, userName } = await request.json();
    
    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const { serviceClient } = auth;

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

// Listar sessões ativas
export async function GET(request: Request) {
  try {
    const auth = await isAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: auth.status });
    }

    const { serviceClient } = auth;

    // Remove sessões inativas (mais de 30 minutos sem atividade)
    const trintaMinutosAtras = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    await serviceClient
      .from('sessoes_ativas')
      .delete()
      .lt('ultima_atividade', trintaMinutosAtras);

    // Busca sessões ativas
    const { data: sessoes, error } = await serviceClient
      .from('sessoes_ativas')
      .select('*')
      .eq('status', 'ativa')
      .order('inicio_sessao', { ascending: false });

    if (error) {
      console.error('Erro ao buscar sessões:', error);
      return NextResponse.json({ error: 'Erro ao buscar sessões.' }, { status: 500 });
    }

    return NextResponse.json({ sessoes: sessoes || [] });
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

// Atualizar atividade da sessão
export async function PUT(request: Request) {
  try {
    const auth = await isAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: auth.status });
    }

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário obrigatório.' }, { status: 400 });
    }

    const { serviceClient } = auth;

    const { error } = await serviceClient
      .from('sessoes_ativas')
      .update({ 
        ultima_atividade: new Date().toISOString(),
        status: 'ativa'
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao atualizar sessão:', error);
      return NextResponse.json({ error: 'Erro ao atualizar sessão.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

// Encerrar sessão
export async function DELETE(request: Request) {
  try {
    const auth = await isAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: auth.status });
    }

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário obrigatório.' }, { status: 400 });
    }

    const { serviceClient } = auth;

    const { error } = await serviceClient
      .from('sessoes_ativas')
      .update({ status: 'inativa' })
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao encerrar sessão:', error);
      return NextResponse.json({ error: 'Erro ao encerrar sessão.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
