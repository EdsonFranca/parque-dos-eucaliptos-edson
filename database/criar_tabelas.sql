-- Execute este SQL no dashboard do Supabase para criar as tabelas necessárias

-- 1. Criar tabela de emails permitidos
CREATE TABLE IF NOT EXISTS emails_permitidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  chacara TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  ativo BOOLEAN DEFAULT true
);

-- 2. Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_emails_permitidos_email ON emails_permitidos(email);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE emails_permitidos ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
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

-- 5. Inserir emails de teste
INSERT INTO emails_permitidos (email, nome, chacara) VALUES
  ('salarod01@gmail.com', 'Salomão Rodrigues 01', 'Chácara 01'),
  ('salarod02@gmail.com', 'Salomão Rodrigues 02', 'Chácara 02'),
  ('salarod03@gmail.com', 'Salomão Rodrigues 03', 'Chácara 03')
ON CONFLICT (email) DO NOTHING;
