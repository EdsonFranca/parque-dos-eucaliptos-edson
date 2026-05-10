import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    console.log('Iniciando verificação de email...');
    const { email } = (await request.json()) as { email?: string };
    
    console.log('Email recebido:', email);
    
    if (!email) {
      return NextResponse.json({ error: 'Email obrigatório.' }, { status: 400 });
    }

    // Verificar se email está na lista de permitidos
    console.log('Consultando tabela emails_permitidos...');
    const { data: emailPermitido, error } = await supabase
      .from('emails_permitidos')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('ativo', true)
      .maybeSingle();

    if (error) {
      console.error('Erro inesperado na consulta:', error);
      return NextResponse.json({ error: `Erro ao verificar email: ${error.message}` }, { status: 500 });
    }

    if (!emailPermitido) {
      return NextResponse.json({
        permitido: false,
        mensagem: 'Email não está na lista de autorizados.'
      });
    }

    return NextResponse.json({
      permitido: true,
      dados: emailPermitido,
      mensagem: 'Email autorizado para cadastro.'
    });

  } catch (error) {
    console.error('Erro geral na API:', error);
    const message = error instanceof Error ? error.message : 'Falha interna.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
