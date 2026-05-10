-- Script para criar um usuário administrador no Supabase
-- Execute este SQL no dashboard do Supabase (SQL Editor)

-- 1. Criar um usuário na tabela auth.users
-- Você precisa primeiro criar o usuário através do Auth do Supabase
-- ou usar este script com a service_role_key

-- 2. Inserir o perfil do administrador na tabela perfis_moradores
INSERT INTO perfis_moradores (id, nome, email, chacara, tipo_usuario, created_at) 
VALUES (
  'ID_DO_USUARIO_AUTH', -- Substitua pelo ID real do usuário criado no auth.users
  'Administrador Sistema',
  'admin@parquedoseucaliptos.com',
  'Administração',
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  tipo_usuario = 'admin',
  updated_at = NOW();

-- 3. Verificar se o usuário foi criado corretamente
SELECT * FROM perfis_moradores WHERE tipo_usuario = 'admin';

-- INSTRUÇÕES:
-- 1. Primeiro crie o usuário no painel do Supabase > Authentication > Users
-- 2. Copie o ID do usuário criado
-- 3. Substitua 'ID_DO_USUARIO_AUTH' no script acima
-- 4. Execute este script SQL

-- Alternativa: Criar usuário via API (requer service_role_key)
-- Você pode usar o endpoint /api/admin/criar-usuario-admin se existir
