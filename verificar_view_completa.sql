-- Verificação completa da view e permissões
-- Execute no SQL Editor do Supabase

-- 1. Verificar se perfis_view existe
SELECT 'Verificando perfis_view...' as status;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'perfis_view' AND table_schema = 'public';

-- 2. Verificar estrutura da view
SELECT 'Estrutura da perfis_view:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'perfis_view' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Testar query direta na view
SELECT 'Testando query direta:' as status;
SELECT COUNT(*) as total_registros FROM perfis_view;

-- 4. Verificar permissões do usuário atual
SELECT 'Verificando permissões:' as status;
SELECT current_user as usuario_atual;

-- 5. Testar com usuário anônimo (role)
SELECT 'Testando com role anon:' as status;
SET LOCAL ROLE anon;
SELECT COUNT(*) as total_anon FROM perfis_view LIMIT 1;
RESET ROLE;

-- 6. Verificar RLS nas tabelas base
SELECT 'Verificando RLS nas tabelas base:' as status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('perfis', 'emails_permitidos') AND schemaname = 'public';
