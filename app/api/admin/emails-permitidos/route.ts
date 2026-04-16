import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type EmailPermitidoPayload = {
  email: string;
  nome?: string | null;
  chacara?: string | null;
  ativo?: boolean;
};

type AdminAuthResult = {
  ok: true;
  serviceClient: ReturnType<typeof createClient>;
} | {
  ok: false;
  status: number;
};

function getServerClients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error('Config: defina SUPABASE_SERVICE_ROLE_KEY no ambiente.');
  }

  const anonClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const serviceClient = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { anonClient, serviceClient };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function isAdminRequest(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return { ok: false, status: 401 };

  const { anonClient, serviceClient } = getServerClients();
  const { data: authData, error: authError } = await anonClient.auth.getUser(token);
  if (authError || !authData.user) return { ok: false, status: 401 };

  const { data: perfilAdmin, error: perfilError } = await serviceClient
    .from('perfis_moradores')
    .select('tipo_usuario')
    .eq('id', authData.user.id)
    .single();

  if (perfilError || perfilAdmin?.tipo_usuario !== 'admin') {
    return { ok: false, status: 403 };
  }

  return { ok: true, serviceClient };
}

export async function GET(request: Request) {
  try {
    const auth = await isAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: auth.status });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.trim().toLowerCase() || '';
    let queryBuilder = auth.serviceClient
      .from('emails_permitidos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (query) {
      queryBuilder = queryBuilder.ilike('email', `%${query}%`);
    }

    const { data, error } = await queryBuilder;
    if (error) {
      return NextResponse.json({ error: 'Erro ao listar emails permitidos: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, emails: data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha interna.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await isAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: auth.status });
    }

    const body = (await request.json()) as { emails?: EmailPermitidoPayload[] };
    const emails = body.emails || [];

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Nenhum email enviado.' }, { status: 400 });
    }

    const sanitized = emails
      .map((item) => {
        const email = item.email?.toLowerCase().trim();
        if (!email || !isValidEmail(email)) return null;
        return {
          email,
          nome: item.nome?.trim() || null,
          chacara: item.chacara?.trim() || null,
          ativo: item.ativo ?? true,
        };
      })
      .filter((item): item is EmailPermitidoPayload => item !== null);

    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'Nenhum email válido encontrado.' }, { status: 400 });
    }

    const { data, error } = await auth.serviceClient
      .from('emails_permitidos')
      .upsert(sanitized, { onConflict: 'email' })
      .select();

    if (error) {
      return NextResponse.json({ error: 'Erro ao salvar emails: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      emails: data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha interna.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
