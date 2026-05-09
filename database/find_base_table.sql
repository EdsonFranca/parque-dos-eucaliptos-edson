-- Identificar tabela base da view perfis_moradores
-- Execute no SQL Editor do Supabase

-- 1. Verificar se perfis_moradores é realmente uma VIEW
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_name = 'perfis_moradores' AND table_schema = 'public';

-- 2. Se for VIEW, verificar sua definição
SELECT 
    view_definition,
    view_name
FROM information_schema.views 
WHERE view_name = 'perfis_moradores' AND view_schema = 'public';

-- 3. Alternativa: usar \d command (se funcionar no Supabase)
-- \d public.perfis_moradores

-- 4. Listar todas as tabelas que podem ser a base
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND (table_name LIKE '%perfil%' OR table_name LIKE '%morador%' OR table_name LIKE '%user%' OR table_name LIKE '%profile%')
ORDER BY table_name;

-- 5. Verificar estrutura das tabelas candidatas
-- Descomente as linhas abaixo para testar cada tabela
/*
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'moradores' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
*/
