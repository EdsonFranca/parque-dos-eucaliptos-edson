-- Método alternativo: Criar admin manualmente sem depender do auth.createUser
-- Execute no SQL Editor do dashboard Supabase

-- 1. Primeiro, verifique se já existe algum usuário admin
SELECT * FROM perfis WHERE tipo_usuario = 'admin';

-- 2. Criar usuário diretamente na tabela auth.users (método manual)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    last_sign_in_at,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    gen_random_uuid(),
    'admin@parquedoseucaliptos.com',
    crypt('senha123456', gen_salt('bf')),
    now(),
    null,
    null,
    null,
    now(),
    now(),
    'authenticated',
    'authenticated'
) RETURNING id;

-- 3. Pegue o ID retornado acima e use nos INSERTs seguintes:
-- Substitua 'UUID_RETORNADO_ACIMA' pelo ID que apareceu

INSERT INTO perfis (id, email, tipo_usuario)
VALUES ('UUID_RETORNADO_ACIMA', 'admin@parquedoseucaliptos.com', 'admin')
ON CONFLICT (id) DO UPDATE SET tipo_usuario = 'admin';

INSERT INTO perfis_moradores (id, nome, apto, perfil_completo, updated_at)
VALUES ('UUID_RETORNADO_ACIMA', 'Administrador Sistema', 'Administração', true, now())
ON CONFLICT (id) DO UPDATE SET 
    nome = 'Administrador Sistema',
    apto = 'Administração',
    perfil_completo = true,
    updated_at = now();

-- 4. Verificar se foi criado
SELECT 
    p.id,
    p.email,
    p.tipo_usuario,
    pm.nome,
    pm.apto,
    pm.perfil_completo
FROM perfis p
LEFT JOIN perfis_moradores pm ON p.id = pm.id
WHERE p.tipo_usuario = 'admin';

-- 5. Para fazer login, use:
-- Email: admin@parquedoseucaliptos.com
-- Senha: senha123456
