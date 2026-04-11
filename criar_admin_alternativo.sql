-- Solução alternativa: Criar usuário admin usando método direto
-- Execute no SQL Editor do Supabase

-- 1. Primeiro, vamos criar um usuário admin usando um método diferente
-- Vamos usar o sistema do Supabase diretamente sem depender do auth.users

-- 2. Criar usuário na tabela perfis primeiro (sem depender do auth)
INSERT INTO perfis (id, email, tipo_usuario)
VALUES (
    '00000000-0000-0000-0000-000000000001', -- UUID fixo para admin
    'admin@parquedoseucaliptos.com',
    'admin'
) ON CONFLICT (id) DO UPDATE SET 
    tipo_usuario = 'admin';

-- 3. Criar dados complementares
INSERT INTO perfis_moradores (id, nome, apto, perfil_completo, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Administrador Sistema',
    'Administração',
    true,
    now()
) ON CONFLICT (id) DO UPDATE SET 
    nome = 'Administrador Sistema',
    apto = 'Administração',
    perfil_completo = true,
    updated_at = now();

-- 4. Agora tentar criar o auth user com o mesmo ID
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
    '00000000-0000-0000-0000-000000000001',
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

-- 5. Verificar se foi criado
SELECT 
    u.id,
    u.email,
    p.tipo_usuario,
    pm.nome,
    pm.perfil_completo
FROM auth.users u
LEFT JOIN perfis p ON u.id = p.id
LEFT JOIN perfis_moradores pm ON u.id = pm.id
WHERE u.email = 'admin@parquedoseucaliptos.com';

-- 6. Se ainda não funcionar, tentamos criar um usuário de teste
-- com email diferente para ver se o problema é específico do email

SELECT 'Teste concluído. Verifique os resultados acima.' as status;
