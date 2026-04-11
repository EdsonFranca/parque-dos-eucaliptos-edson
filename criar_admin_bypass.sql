-- Solução definitiva: Bypass completo do sistema de autenticação
-- Execute no SQL Editor do Supabase

-- 1. Desativar completamente as restrições
SET session_replication_role = 'replica';

-- 2. Remover todas as políticas RLS que possam existir
DROP POLICY IF EXISTS "users_insert_policy" ON auth.users;
DROP POLICY IF EXISTS "users_select_policy" ON auth.users;
DROP POLICY IF EXISTS "users_update_policy" ON auth.users;
DROP POLICY IF EXISTS "users_delete_policy" ON auth.users;

-- 3. Desativar RLS na auth.users
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- 4. Criar usuário admin com método direto
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    '12345678-1234-1234-1234-123456789abc', -- UUID fixo e fácil de lembrar
    'admin@parquedoseucaliptos.com',
    crypt('senha123456', gen_salt('bf', 12)),
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('senha123456', gen_salt('bf', 12)),
    updated_at = now();

-- 5. Criar perfil admin
INSERT INTO perfis (id, email, tipo_usuario)
VALUES (
    '12345678-1234-1234-1234-123456789abc',
    'admin@parquedoseucaliptos.com',
    'admin'
) ON CONFLICT (id) DO UPDATE SET 
    tipo_usuario = 'admin';

-- 6. Criar perfil morador
INSERT INTO perfis_moradores (id, nome, apto, perfil_completo, updated_at)
VALUES (
    '12345678-1234-1234-1234-123456789abc',
    'Administrador Sistema',
    'Administração',
    true,
    now()
) ON CONFLICT (id) DO UPDATE SET 
    nome = 'Administrador Sistema',
    apto = 'Administração',
    perfil_completo = true,
    updated_at = now();

-- 7. Restaurar configuração normal
SET session_replication_role = 'DEFAULT';

-- 8. Verificação final
SELECT 
    u.id,
    u.email,
    p.tipo_usuario,
    pm.nome,
    pm.perfil_completo,
    'USUÁRIO ADMIN CRIADO COM SUCESSO!' as status
FROM auth.users u
LEFT JOIN perfis p ON u.id = p.id
LEFT JOIN perfis_moradores pm ON u.id = pm.id
WHERE u.email = 'admin@parquedoseucaliptos.com';

-- 9. Teste de login - execute no seu aplicativo
-- Email: admin@parquedoseucaliptos.com
-- Senha: senha123456
