-- SQL para criar usuário administrador no Supabase
-- Execute no SQL Editor do dashboard Supabase

-- 1. Criar usuário na tabela auth (se ainda não existir)
-- NOTA: Você precisa primeiro criar o usuário no Authentication > Users do dashboard
-- ou usar a API com service_role_key

-- 2. Inserir na tabela perfis (tabela principal de tipos de usuário)
INSERT INTO public.perfis (id, email, tipo_usuario)
VALUES (
  'ID_DO_USUARIO_AUTH', -- Substitua pelo ID real do usuário criado no auth.users
  'admin@parquedoseucaliptos.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET
  tipo_usuario = 'admin';

-- 3. Inserir na tabela perfis_moradores (dados complementares)
INSERT INTO public.perfis_moradores (id, nome, apto, foto_url, perfil_completo, updated_at)
VALUES (
  'ID_DO_USUARIO_AUTH', -- Mesmo ID do auth.users
  'Administrador Sistema',
  'Administração',
  null,
  true,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  nome = 'Administrador Sistema',
  apto = 'Administração',
  perfil_completo = true,
  updated_at = now();

-- 4. Verificar se foi criado corretamente
SELECT 
  p.id,
  p.email,
  p.tipo_usuario,
  pm.nome,
  pm.apto,
  pm.perfil_completo
FROM public.perfis p
LEFT JOIN public.perfis_moradores pm ON p.id = pm.id
WHERE p.tipo_usuario = 'admin';

-- 5. Verificar todos os usuários admin
SELECT * FROM public.perfis WHERE tipo_usuario = 'admin';

-- INSTRUÇÕES:
-- 1. Crie o usuário no dashboard: Authentication > Users > "Add user"
-- 2. Use email: admin@parquedoseucaliptos.com e senha forte
-- 3. Copie o ID do usuário (UUID)
-- 4. Substitua 'ID_DO_USUARIO_AUTH' nos comandos acima
-- 5. Execute este SQL
