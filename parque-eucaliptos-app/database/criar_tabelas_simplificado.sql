-- Versão simplificada - apenas emails permitidos e perfis_moradores

-- 1. Tabela de emails permitidos
CREATE TABLE IF NOT EXISTS emails_permitidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  chacara TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ativo BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_emails_permitidos_email ON emails_permitidos(email);

-- 2. Habilitar RLS apenas para emails_permitidos
ALTER TABLE emails_permitidos ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode verificar email permitido
CREATE POLICY "Qualquer um pode verificar email permitido" ON emails_permitidos
  FOR SELECT USING (true);

-- Política: Apenas admins podem gerenciar emails permitidos
CREATE POLICY "Apenas admins podem gerenciar emails permitidos" ON emails_permitidos
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM perfis_moradores 
      WHERE tipo_usuario = 'admin'
    )
  );

-- 3. Tabela de perfis (se não existir)
CREATE TABLE IF NOT EXISTS perfis_moradores (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT,
  email TEXT,
  chacara TEXT,
  tipo_usuario TEXT DEFAULT 'morador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Inserir emails de teste
INSERT INTO emails_permitidos (email, nome, chacara) VALUES
  ('salarod01@gmail.com', 'Salomão Rodrigues 01', 'Chácara 01'),
  ('salarod02@gmail.com', 'Salomão Rodrigues 02', 'Chácara 02'),
  ('salarod03@gmail.com', 'Salomão Rodrigues 03', 'Chácara 03')
ON CONFLICT (email) DO NOTHING;
