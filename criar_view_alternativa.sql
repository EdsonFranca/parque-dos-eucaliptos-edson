-- Criar view alternativa com nome diferente para contornar cache
-- Execute no SQL Editor do Supabase

-- 1. Remover views antigas
DROP VIEW IF EXISTS perfis_moradores;
DROP VIEW IF EXISTS "perfis moradores";

-- 2. Criar view com nome novo
CREATE VIEW perfis_view AS
SELECT 
    p.id,
    p.nome,
    p.email,
    p.tipo_usuario,
    ep.chacara,
    ep.ativo as email_permitido
FROM public.perfis p
LEFT JOIN public.emails_permitidos ep ON p.email = ep.email;

-- 3. Verificar
SELECT 'View alternativa criada' as status;
SELECT COUNT(*) as total FROM perfis_view LIMIT 1;
