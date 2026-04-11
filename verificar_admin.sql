-- Verificar se o usuário admin foi criado corretamente
-- Execute no SQL Editor do Supabase

-- 1. Verificar se o usuário existe na auth.users
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'admin@parquedoseucaliptos.com';

-- 2. Verificar se existe na tabela perfis
SELECT id, email, tipo_usuario 
FROM perfis 
WHERE email = 'admin@parquedoseucaliptos.com';

-- 3. Verificar se existe na tabela perfis_moradores
SELECT id, nome, apto, perfil_completo, updated_at 
FROM perfis_moradores 
WHERE id IN (SELECT id FROM perfis WHERE email = 'admin@parquedoseucaliptos.com');

-- 4. Verificar junção completa
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created,
    p.tipo_usuario,
    pm.nome,
    pm.apto,
    pm.perfil_completo
FROM auth.users u
LEFT JOIN perfis p ON u.id = p.id
LEFT JOIN perfis_moradores pm ON u.id = pm.id
WHERE u.email = 'admin@parquedoseucaliptos.com';

-- 5. Verificar todos os usuários admin
SELECT 
    u.email,
    p.tipo_usuario,
    pm.nome,
    pm.perfil_completo
FROM auth.users u
JOIN perfis p ON u.id = p.id
LEFT JOIN perfis_moradores pm ON u.id = pm.id
WHERE p.tipo_usuario = 'admin';
