-- Verificar e corrigir encoding do nome da view
-- Execute no SQL Editor do Supabase

-- 1. Verificar nome exato da view
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name LIKE '%perfis%' AND table_schema = 'public';

-- 2. Verificar se as tabelas base existem
SELECT 'Verificando tabelas base...' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('perfis', 'emails_permitidos') AND table_schema = 'public';

-- 3. Remover completamente qualquer objeto com nome semelhante (VIEW primeiro)
DROP VIEW IF EXISTS "perfis moradores";
DROP TABLE IF EXISTS "perfis moradores";
DROP VIEW IF EXISTS "perfis_moradores";
DROP TABLE IF EXISTS "perfis_moradores";

-- 4. Criar view com nome limpo e encoding correto
CREATE OR REPLACE VIEW perfis_moradores AS
SELECT 
    p.id,
    p.nome,
    p.email,
    p.tipo_usuario,
    ep.chacara,
    ep.ativo as email_permitido
FROM public.perfis p
LEFT JOIN public.emails_permitidos ep ON p.email = ep.email;

-- 5. Verificar se foi criada corretamente
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'perfis_moradores' AND table_schema = 'public';

-- 6. Testar acesso direto
SELECT 'Testando acesso direto...' as status;
SELECT COUNT(*) as total_registros FROM perfis_moradores LIMIT 1;
