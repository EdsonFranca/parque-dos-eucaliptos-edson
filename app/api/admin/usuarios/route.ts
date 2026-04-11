import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type PerfilMoradorRow = {
  id: string;
  nome: string | null;
  apto: string | null;
};

function getServerClients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error('Config: defina SUPABASE_SERVICE_ROLE_KEY no .env.local (ou na Vercel).');
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
    .from('perfis')
    .select('tipo_usuario')
    .eq('id', authData.user.id)
    .single();

  if (perfilAdmin?.tipo_usuario !== 'admin') return { ok: false as const, status: 403 };

  return { ok: true as const, serviceClient };
}

export async function GET(request: Request) {
  try {
    const auth = await isAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: auth.status });
    }

    const { serviceClient } = auth;
    const { data: authUsers, error: listError } = await serviceClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (listError) {
      return NextResponse.json({ error: 'Nao foi possivel listar usuarios.' }, { status: 500 });
    }

    const ids = (authUsers.users || []).map((u) => u.id);
    let perfisMoradores: PerfilMoradorRow[] = [];
    if (ids.length > 0) {
      const { data } = await serviceClient
        .from('perfis_moradores')
        .select('id, nome, apto')
        .in('id', ids);
      perfisMoradores = (data || []) as PerfilMoradorRow[];
    }

    const perfilById = new Map(perfisMoradores.map((p) => [p.id, p]));
    const usuarios = (authUsers.users || []).map((u) => {
      const perfil = perfilById.get(u.id);
      return {
        id: u.id,
        email: u.email || '',
        criadoEm: u.created_at || null,
        nome: perfil?.nome || null,
        chacara: perfil?.apto || null,
      };
    });

    return NextResponse.json({ usuarios });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha interna ao listar usuarios.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await isAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: auth.status });
    }

    const { email } = (await request.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: 'Email obrigatorio.' }, { status: 400 });
    }

    const redirectBase = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { error } = await auth.serviceClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectBase}/admin/login`,
    });

    if (error) {
      return NextResponse.json({ error: 'Nao foi possivel enviar reset de senha.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha interna ao enviar reset.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('DELETE request received');
    
    const auth = await isAdminRequest(request);
    if (!auth.ok) {
      console.log('Access denied:', auth.status);
      return NextResponse.json({ error: 'Acesso negado.' }, { status: auth.status });
    }

    const { userId } = (await request.json()) as { userId?: string };
    console.log('User ID to delete:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário obrigatorio.' }, { status: 400 });
    }

    console.log('Attempting to delete user from Supabase Auth...');
    const { error } = await auth.serviceClient.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user from Auth:', error);
      return NextResponse.json({ error: `Nao foi possivel excluir o usuário: ${error.message}` }, { status: 500 });
    }

    console.log('User deleted from Auth successfully');
    
    // Também exclui o perfil do morador se existir
    console.log('Attempting to delete user profile...');
    const { error: profileError } = await auth.serviceClient
      .from('perfis_moradores')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.warn('Error deleting profile (continuing):', profileError);
    }

    console.log('User deletion completed successfully');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Exception in DELETE:', error);
    const message = error instanceof Error ? error.message : 'Falha interna ao excluir usuário.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
