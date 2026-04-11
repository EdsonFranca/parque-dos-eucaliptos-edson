import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const emailsTeste = [
      { email: 'salarod01@gmail.com', nome: 'Salomão Rodrigues 01', chacara: 'Chácara 01' },
      { email: 'salarod02@gmail.com', nome: 'Salomão Rodrigues 02', chacara: 'Chácara 02' },
      { email: 'salarod03@gmail.com', nome: 'Salomão Rodrigues 03', chacara: 'Chácara 03' }
    ];

    const { data, error } = await supabase
      .from('emails_permitidos')
      .upsert(emailsTeste, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      return NextResponse.json({ error: 'Erro ao inserir emails de teste: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Emails de teste inseridos com sucesso!',
      inseridos: data?.length || 0 
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha interna.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
