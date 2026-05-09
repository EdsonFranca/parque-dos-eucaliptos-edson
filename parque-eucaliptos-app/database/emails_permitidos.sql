-- Tabela de emails permitidos para cadastro
CREATE TABLE IF NOT EXISTS emails_permitidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  chacara TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  ativo BOOLEAN DEFAULT true
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_emails_permitidos_email ON emails_permitidos(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE emails_permitidos ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver/manipular emails permitidos
CREATE POLICY "Apenas admins podem gerenciar emails permitidos" ON emails_permitidos
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM perfis 
      WHERE tipo_usuario = 'admin'
    )
  );

-- Política: Qualquer um pode verificar se email está permitido (para cadastro)
CREATE POLICY "Qualquer um pode verificar email permitido" ON emails_permitidos
  FOR SELECT USING (true);

-- Inserir alguns emails de exemplo (remover após setup)
INSERT INTO emails_permitidos (email, nome, chacara) VALUES
  ('joao.silva@example.com', 'João Silva', 'Chácara 01'),
  ('maria.santos@example.com', 'Maria Santos', 'Chácara 02')
ON CONFLICT (email) DO NOTHING;
