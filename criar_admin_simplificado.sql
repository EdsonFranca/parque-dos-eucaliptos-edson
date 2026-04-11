-- Solução simplificada: Criar usuário admin sem modificar auth.users
-- Execute no SQL Editor do Supabase com role postgres

-- 1. Primeiro, verificar se já existe algum usuário na auth.users
SELECT id, email FROM auth.users LIMIT 5;

-- 2. Se não existir, vamos criar um usuário de teste via dashboard primeiro
-- NOTA: Este script assume que você vai criar o usuário manualmente no dashboard

-- 3. Depois de criar o usuário no dashboard, vamos associar aos perfis
-- Substitua 'ID_DO_USUARIO_CRIADO' pelo ID real

-- 4. Criar perfil admin (usando ID real que você vai obter do dashboard)
INSERT INTO perfis (id, email, tipo_usuario)
VALUES ('ID_DO_USUARIO_CRIADO', 'admin@parquedoseucaliptos.com', 'admin')
ON CONFLICT (id) DO UPDATE SET tipo_usuario = 'admin';

-- 5. Criar perfil morador
INSERT INTO perfis_moradores (id, nome, apto, perfil_completo, updated_at)
VALUES ('ID_DO_USUARIO_CRIADO', 'Administrador Sistema', 'Administração', true, now())
ON CONFLICT (id) DO UPDATE SET 
    nome = 'Administrador Sistema',
    apto = 'Administração',
    perfil_completo = true,
    updated_at = now();

-- 6. Verificar resultado
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

-- INSTRUÇÕES:
-- 1. Vá ao dashboard Supabase > Authentication > Users
-- 2. Clique "Add user"
-- 3. Email: admin@parquedoseucaliptos.com
-- 4. Senha: senha123456
-- 5. Marque "Auto confirm user"
-- 6. Copie o ID gerado
-- 7. Substitua 'ID_DO_USUARIO_CRIADO' acima
-- 8. Execute este script
