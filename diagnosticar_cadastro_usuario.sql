-- Diagnosticar erro de cadastro: "Database error saving new user"
-- Execute no SQL Editor do Supabase

-- 1. Verificar se RLS está ativado na auth.users
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'auth';

-- 2. Verificar políticas RLS na auth.users
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'auth';

-- 3. Verificar triggers na auth.users
SELECT 
    trigger_name,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 4. Verificar se há triggers na tabela perfis
SELECT 
    trigger_name,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'perfis';

-- 5. Verificar constraints na tabela perfis
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'perfis';

-- 6. Verificar se a tabela perfis tem todas as colunas necessárias
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'perfis' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Testar inserção manual de perfil (sem auth.users)
SELECT 'Testando estrutura da tabela perfis...' as status;

-- 8. Verificar se existe trigger para criar perfil automaticamente
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
AND routine_name LIKE ANY(ARRAY['%perfil%', '%user%', '%auth%', '%trigger%']);
