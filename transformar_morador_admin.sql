-- Query para transformar morador@teste.com.br em admin
-- Execute no SQL Editor do Supabase

-- 1. Adicionar coluna nome na tabela perfis se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS nome TEXT;

-- 2. Adicionar coluna email na tabela perfis se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Adicionar coluna tipo_usuario na tabela perfis se não existir
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS tipo_usuario TEXT;

-- 4. Inserir/atualizar o perfil como admin
INSERT INTO perfis (id, nome, email, tipo_usuario)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', 'Morador Teste'),
  email,
  'admin'
FROM auth.users 
WHERE email = 'morador@teste.com.br'
ON CONFLICT (id) 
DO UPDATE SET 
  tipo_usuario = 'admin',
  email = EXCLUDED.email,
  nome = COALESCE(EXCLUDED.nome, perfis.nome);

-- 5. Garantir que o email está na lista de permitidos
INSERT INTO emails_permitidos (email, nome, chacara, ativo)
VALUES 
  ('morador@teste.com.br', 'Morador Teste', 'Admin', true)
ON CONFLICT (email) 
DO UPDATE SET 
  ativo = true,
  nome = COALESCE(EXCLUDED.nome, emails_permitidos.nome);

-- 6. Verificação (opcional)
SELECT 
  u.email,
  u.id,
  p.nome,
  p.tipo_usuario,
  ep.ativo as email_permitido
FROM auth.users u
LEFT JOIN perfis p ON u.id = p.id
LEFT JOIN emails_permitidos ep ON u.email = ep.email
WHERE u.email = 'morador@teste.com.br';
