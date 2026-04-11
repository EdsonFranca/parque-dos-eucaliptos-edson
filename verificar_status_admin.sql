-- Verificar status do usuário morador@teste.com.br
-- Execute no SQL Editor do Supabase

-- 1. Verificar se o usuário existe na auth.users
SELECT 'Verificando usuário na auth.users:' as status;
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'morador@teste.com.br';

-- 2. Verificar perfil na tabela perfis
SELECT 'Verificando perfil na tabela perfis:' as status;
SELECT id, nome, email, tipo_usuario 
FROM perfis 
WHERE email = 'morador@teste.com.br';

-- 3. Verificar se está na lista de emails permitidos
SELECT 'Verificando emails_permitidos:' as status;
SELECT email, nome, chacara, ativo 
FROM emails_permitidos 
WHERE email = 'morador@teste.com.br';

-- 4. Verificar view perfis_moradores
SELECT 'Verificando view perfis_moradores:' as status;
SELECT id, nome, email, tipo_usuario, chacara, email_permitido 
FROM perfis_moradores 
WHERE email = 'morador@teste.com.br';

-- 5. Testar query de login (simulando)
SELECT 'Testando query de login:' as status;
SELECT p.tipo_usuario 
FROM perfis p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'morador@teste.com.br';
