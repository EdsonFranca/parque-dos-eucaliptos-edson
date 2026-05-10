import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Criar cliente com service role key para operações admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  // Adicionar headers CORS
  const origin = request.headers.get('origin');
  const headers = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'JSON inválido no corpo da requisição' },
        { status: 400, headers }
      );
    }

    const { email, password, nome, chacara } = body;

    // Validar campos obrigatórios
    if (!email || !password || !nome) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400, headers }
      );
    }

    // 1. Criar usuário no auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        chacara: chacara || 'Administração'
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário no auth:', authError);
      return NextResponse.json(
        { error: 'Erro ao criar usuário: ' + authError.message },
        { status: 400, headers }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Falha ao criar usuário' },
        { status: 500, headers }
      );
    }

    // 2. Inserir na tabela perfis (tipo de usuário)
    const { error: perfilError } = await supabaseAdmin
      .from('perfis')
      .insert({
        id: authData.user.id,
        email,
        tipo_usuario: 'admin'
      });

    if (perfilError) {
      console.error('Erro ao criar perfil:', perfilError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erro ao criar perfil de administrador: ' + perfilError.message },
        { status: 500, headers }
      );
    }

    // 3. Inserir na tabela perfis_moradores (dados complementares)
    const { error: moradorError } = await supabaseAdmin
      .from('perfis_moradores')
      .insert({
        id: authData.user.id,
        nome,
        apto: chacara || 'Administração',
        perfil_completo: true,
        updated_at: new Date().toISOString()
      });

    if (moradorError) {
      console.error('Erro ao criar perfil_morador:', moradorError);
      // Não remover usuário pois o perfil principal já foi criado
      return NextResponse.json(
        { error: 'Erro ao criar perfil complementar: ' + moradorError.message },
        { status: 500, headers }
      );
    }

    
    return NextResponse.json({
      success: true,
      message: 'Usuário administrador criado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nome,
        tipo_usuario: 'admin'
      }
    }, { headers });

  } catch (error) {
    console.error('Erro no endpoint:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500, headers }
    );
  }
}

export async function GET() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  return NextResponse.json({
    message: 'Endpoint para criar usuário administrador',
    method: 'POST',
    required_fields: ['email', 'password', 'nome'],
    optional_fields: ['chacara']
  }, { headers });
}
