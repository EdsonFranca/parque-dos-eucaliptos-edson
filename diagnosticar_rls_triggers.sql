-- Diagnosticar problemas de RLS e triggers que impedem criação de usuários
-- Execute no SQL Editor do Supabase

-- 1. Verificar se RLS está ativado nas tabelas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'perfis', 'perfis_moradores');

-- 2. Verificar políticas RLS na tabela auth.users
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'auth';

-- 3. Verificar políticas nas tabelas perfis
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('perfis', 'perfis_moradores');

-- 4. Verificar triggers que podem estar bloqueando
SELECT 
    event_object_table as table_name,
    trigger_name,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('users', 'perfis', 'perfis_moradores')
ORDER BY event_object_table, trigger_name;

-- 5. Verificar constraints nas tabelas
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('users', 'perfis', 'perfis_moradores');

-- 6. Verificar se há funções de trigger
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
AND routine_name LIKE ANY(ARRAY['%trigger%', '%user%', '%auth%', '%perfil%']);

-- 7. Testar inserção simples na auth.users
-- Este comando pode falhar se houver algum bloqueio
SELECT 'Testando inserção na auth.users...' as status;

-- 8. Verificar se a tabela auth.users existe
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'auth';

-- 9. Verificar estrutura da auth.users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 10. Verificar se há extensões necessárias
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');
