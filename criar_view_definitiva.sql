-- Criar view definitiva com verificação completa
-- Execute no SQL Editor do Supabase

-- 1. Verificar se as tabelas base existem
SELECT 'Verificando tabelas base...' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('perfis', 'emails_permitidos') AND table_schema = 'public';

-- 2. Remover qualquer view existente
DROP VIEW IF EXISTS perfis_moradores CASCADE;
DROP VIEW IF EXISTS "perfis moradores" CASCADE;
DROP VIEW IF EXISTS perfis_view CASCADE;

-- 3. Criar view com schema explícito
CREATE OR REPLACE VIEW public.perfis_view AS
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
SELECT 'View criada com sucesso' as status;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'perfis_view' AND table_schema = 'public';

-- 5. Testar acesso
SELECT COUNT(*) as total_registros FROM public.perfis_view;
