-- Criar view com o nome original para compatibilidade
-- Execute no SQL Editor do Supabase

-- 1. Remover views existentes
DROP VIEW IF EXISTS perfis_moradores CASCADE;
DROP VIEW IF EXISTS "perfis moradores" CASCADE;
DROP VIEW IF EXISTS perfis_view CASCADE;

-- 2. Criar view com nome original perfis_moradores
CREATE OR REPLACE VIEW public.perfis_moradores AS
SELECT 
    p.id,
    p.nome,
    p.email,
    p.tipo_usuario,
    ep.chacara,
    ep.ativo as email_permitido
FROM public.perfis p
LEFT JOIN public.emails_permitidos ep ON p.email = ep.email;

-- 3. Verificar criação
SELECT 'View perfis_moradores criada com sucesso' as status;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'perfis_moradores' AND table_schema = 'public';

-- 4. Testar acesso
SELECT COUNT(*) as total_registros FROM public.perfis_moradores;

-- 5. Verificação final
SELECT 'View perfis_moradores criada com sucesso!' as resultado_final;
