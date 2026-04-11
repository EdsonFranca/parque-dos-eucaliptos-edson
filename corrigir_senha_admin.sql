-- Corrigir senha do usuário admin
-- Execute no SQL Editor do Supabase

-- 1. Primeiro, verificar se o usuário existe
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@parquedoseucaliptos.com';

-- 2. Atualizar a senha corretamente (usando o método do Supabase)
UPDATE auth.users 
SET 
    encrypted_password = crypt('senha123456', gen_salt('bf', 12)),
    updated_at = now()
WHERE email = 'admin@parquedoseucaliptos.com';

-- 3. Verificar se o tipo_usuario está correto
SELECT id, email, tipo_usuario FROM perfis WHERE email = 'admin@parquedoseucaliptos.com';

-- 4. Se não existir na tabela perfis, criar
INSERT INTO perfis (id, email, tipo_usuario)
SELECT id, email, 'admin'
FROM auth.users 
WHERE email = 'admin@parquedoseucaliptos.com'
ON CONFLICT (id) DO UPDATE SET tipo_usuario = 'admin';

-- 5. Verificação final
SELECT 
    u.id,
    u.email,
    p.tipo_usuario,
    pm.nome
FROM auth.users u
LEFT JOIN perfis p ON u.id = p.id
LEFT JOIN perfis_moradores pm ON u.id = pm.id
WHERE u.email = 'admin@parquedoseucaliptos.com';
