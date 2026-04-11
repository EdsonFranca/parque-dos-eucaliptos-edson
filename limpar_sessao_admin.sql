-- Limpar sessão e cache para forçar reautenticação
-- Execute no SQL Editor do Supabase

-- 1. Revogar todos os tokens do usuário
SELECT 'Revogando tokens do usuário morador@teste.com.br...' as status;
DELETE FROM auth.sessions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'morador@teste.com.br');

-- 2. Verificar status atual
SELECT 'Status atual do perfil:' as status;
SELECT id, email, tipo_usuario 
FROM perfis 
WHERE email = 'morador@teste.com.br';

-- 3. Forçar atualização do timestamp (opcional - COMENTADO pois coluna não existe)
-- UPDATE perfis 
-- SET updated_at = NOW() 
-- WHERE email = 'morador@teste.com.br';

-- 4. Verificar view final
SELECT 'Verificando view final:' as status;
SELECT id, nome, email, tipo_usuario, chacara, email_permitido 
FROM perfis_moradores 
WHERE email = 'morador@teste.com.br';
