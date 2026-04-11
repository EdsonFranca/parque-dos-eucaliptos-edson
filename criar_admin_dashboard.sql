-- Script para associar usuário criado no dashboard ao perfil admin
-- Execute DEPOIS de criar o usuário no Authentication > Users

-- 1. Primeiro, delete o usuário atual se existir (para evitar conflitos)
DELETE FROM perfis_moradores WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@parquedoseucaliptos.com');
DELETE FROM perfis WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@parquedoseucaliptos.com');
DELETE FROM auth.users WHERE email = 'admin@parquedoseucaliptos.com';

-- 2. Agora crie o usuário manualmente no dashboard:
-- Vá para Authentication > Users > Add user
-- Email: admin@parquedoseucaliptos.com
-- Senha: senha123456
-- Marque "Auto confirm user"
-- Copie o ID gerado

-- 3. Depois de criar no dashboard, substitua 'NOVO_ID_AQUI' abaixo:
INSERT INTO perfis (id, email, tipo_usuario)
VALUES ('NOVO_ID_AQUI', 'admin@parquedoseucaliptos.com', 'admin');

INSERT INTO perfis_moradores (id, nome, apto, perfil_completo, updated_at)
VALUES ('NOVO_ID_AQUI', 'Administrador Sistema', 'Administração', true, now());

-- 4. Verificar
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
