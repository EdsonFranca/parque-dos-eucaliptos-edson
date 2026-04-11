-- Script para verificar e criar tabelas necessárias
-- Execute no SQL Editor do Supabase

-- 1. Verificar se a tabela perfis_moradores existe
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'perfis_moradores';

-- 2. Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS perfis_moradores (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT,
  email TEXT,
  chacara TEXT,
  tipo_usuario TEXT DEFAULT 'morador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar se a tabela emails_permitidos existe
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'emails_permitidos';

-- 4. Criar emails_permitidos se não existir
CREATE TABLE IF NOT EXISTS emails_permitidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  chacara TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  ativo BOOLEAN DEFAULT true
);

-- 5. Habilitar RLS
ALTER TABLE perfis_moradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_permitidos ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas básicas
DROP POLICY IF EXISTS "Usuarios podem ver proprio perfil" ON perfis_moradores;
CREATE POLICY "Usuarios podem ver proprio perfil" ON perfis_moradores
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins podem gerenciar perfis" ON perfis_moradores;
CREATE POLICY "Admins podem gerenciar perfis" ON perfis_moradores
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM perfis_moradores 
      WHERE tipo_usuario = 'admin'
    )
  );

-- 7. Verificar estrutura final
\d perfis_moradores
\d emails_permitidos
