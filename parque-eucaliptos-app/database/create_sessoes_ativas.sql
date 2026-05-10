-- Criar tabela para rastrear sessões ativas dos usuários
CREATE TABLE IF NOT EXISTS sessoes_ativas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  inicio_sessao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sessoes_ativas_user_id ON sessoes_ativas(user_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_ativas_status ON sessoes_ativas(status);
CREATE INDEX IF NOT EXISTS idx_sessoes_ativas_ultima_atividade ON sessoes_ativas(ultima_atividade);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Primeiro remove o trigger se existir
DROP TRIGGER IF EXISTS update_sessoes_ativas_updated_at ON sessoes_ativas;

-- Depois cria o trigger
CREATE TRIGGER update_sessoes_ativas_updated_at 
    BEFORE UPDATE ON sessoes_ativas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE sessoes_ativas ENABLE ROW LEVEL SECURITY;

-- Política para permitir que apenas admin possa ver/manipular sessões
-- Primeiro remove a política se existir
DROP POLICY IF EXISTS "Apenas admin pode gerenciar sessoes" ON sessoes_ativas;

-- Depois cria a política
CREATE POLICY "Apenas admin pode gerenciar sessoes"
    ON sessoes_ativas
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 
            FROM perfis_moradores 
            WHERE perfis_moradores.id = auth.uid() 
            AND perfis_moradores.tipo_usuario = 'admin'
        )
    );
