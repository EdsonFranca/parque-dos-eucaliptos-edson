-- Solução definitiva para erro 400 com espaço no nome
-- Execute no SQL Editor do Supabase

-- 1. Forçar remoção completa
DROP VIEW IF EXISTS "perfis moradores" CASCADE;
DROP TABLE IF EXISTS "perfis moradores" CASCADE;

-- 2. Limpar completamente e recriar
DROP VIEW IF EXISTS perfis_moradores CASCADE;

-- 3. Criar view com nome garantido
CREATE VIEW perfis_moradores AS
SELECT 
    p.id,
    p.nome,
    p.email,
    p.tipo_usuario,
    ep.chacara,
    ep.ativo as email_permitido
FROM public.perfis p
LEFT JOIN public.emails_permitidos ep ON p.email = ep.email;

-- 4. Verificar criação
SELECT 'View criada com sucesso' as status, 
       table_name, 
       table_type
FROM information_schema.tables 
WHERE table_name = 'perfis_moradores' AND table_schema = 'public';

-- 5. Testar query
SELECT COUNT(*) as total FROM perfis_moradores;
