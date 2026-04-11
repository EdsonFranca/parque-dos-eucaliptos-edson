-- Garantir que morador@teste.com.br seja admin definitivamente
-- Execute no SQL Editor do Supabase

-- 1. Verificar status atual
SELECT 'Status atual do usuário:' as status;
SELECT id, email, tipo_usuario 
FROM perfis 
WHERE email = 'morador@teste.com.br';

-- 2. Forçar tipo_usuario = 'admin' (garantindo valor correto)
UPDATE perfis 
SET tipo_usuario = 'admin' 
WHERE email = 'morador@teste.com.br';

-- 3. Verificar se está na lista de permitidos
SELECT 'Verificando emails_permitidos:' as status;
SELECT email, ativo 
FROM emails_permitidos 
WHERE email = 'morador@teste.com.br';

-- 4. Garantir que está ativo na lista de permitidos
UPDATE emails_permitidos 
SET ativo = true 
WHERE email = 'morador@teste.com.br';

-- 5. Verificar view final
SELECT 'Verificando view final:' as status;
SELECT id, nome, email, tipo_usuario, chacara, email_permitido 
FROM perfis_moradores 
WHERE email = 'morador@teste.com.br';

-- 6. Verificação final do login
SELECT 'Verificação final - tipo_usuario:' as status;
SELECT tipo_usuario 
FROM perfis 
WHERE email = 'morador@teste.com.br';
