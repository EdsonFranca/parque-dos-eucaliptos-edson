import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    
    if (!email) {
      return NextResponse.json({ error: 'Email obrigatório.' }, { status: 400 });
    }

    // Verificar se email está na lista de permitidos
    const { data: emailPermitido, error } = await supabase
      .from('emails_permitidos')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('ativo', true)
      .single();

    if (error) {
      // Se não encontrar, retorna erro esperado
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          permitido: false, 
          mensagem: 'Email não está na lista de autorizados.' 
        });
      }
      return NextResponse.json({ error: 'Erro ao verificar email.' }, { status: 500 });
    }

    return NextResponse.json({ 
      permitido: true, 
      dados: emailPermitido,
      mensagem: 'Email autorizado para cadastro.' 
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha interna.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
