import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Tentar inserir emails de teste diretamente
    const emailsTeste = [
      { email: 'salarod01@gmail.com', nome: 'Salomão Rodrigues 01', chacara: 'Chácara 01' },
      { email: 'salarod02@gmail.com', nome: 'Salomão Rodrigues 02', chacara: 'Chácara 02' },
      { email: 'salarod03@gmail.com', nome: 'Salomão Rodrigues 03', chacara: 'Chácara 03' }
    ];

    const { data, error } = await supabase
      .from('emails_permitidos')
      .upsert(emailsTeste, { 
        onConflict: 'email'
      })
      .select();

    if (error) {
      // Se a tabela não existe, dar instruções claras
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'TABELA_NAO_EXISTE',
          message: 'A tabela emails_permitidos não existe. Execute o SQL manualmente no Supabase.',
          sql_necessario: `
-- Copie e cole este SQL no SQL Editor do Supabase:
CREATE TABLE IF NOT EXISTS emails_permitidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  chacara TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  ativo BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_emails_permitidos_email ON emails_permitidos(email);

ALTER TABLE emails_permitidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Apenas admins podem gerenciar emails permitidos" ON emails_permitidos;
CREATE POLICY "Apenas admins podem gerenciar emails permitidos" ON emails_permitidos
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM perfis 
      WHERE tipo_usuario = 'admin'
    )
  );

DROP POLICY IF EXISTS "Qualquer um pode verificar email permitido" ON emails_permitidos;
CREATE POLICY "Qualquer um pode verificar email permitido" ON emails_permitidos
  FOR SELECT USING (true);

-- Inserir emails de teste:
INSERT INTO emails_permitidos (email, nome, chacara) VALUES
  ('salarod01@gmail.com', 'Salomão Rodrigues 01', 'Chácara 01'),
  ('salarod02@gmail.com', 'Salomão Rodrigues 02', 'Chácara 02'),
  ('salarod03@gmail.com', 'Salomão Rodrigues 03', 'Chácara 03')
ON CONFLICT (email) DO NOTHING;
          `,
          emails_teste: emailsTeste
        }, { status: 400 });
      }
      
      return NextResponse.json({ error: 'Erro ao inserir emails: ' + error.message }, { status: 500 });
    }

    // 2. Verificar se foram inseridos
    const { data: verificacao } = await supabase
      .from('emails_permitidos')
      .select('*')
      .in('email', ['salarod01@gmail.com', 'salarod02@gmail.com', 'salarod03@gmail.com']);

    return NextResponse.json({ 
      success: true,
      message: 'Emails de teste inseridos com sucesso!',
      emails_inseridos: data?.length || 0,
      emails_verificados: verificacao?.length || 0,
      detalhes: verificacao || []
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha interna.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
