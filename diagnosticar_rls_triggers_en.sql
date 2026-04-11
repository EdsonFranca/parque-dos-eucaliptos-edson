-- Diagnose RLS and trigger issues that prevent user creation
-- Execute in Supabase SQL Editor

-- 1. Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'perfis', 'perfis_moradores');

-- 2. Check RLS policies on auth.users table
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

-- 3. Check policies on perfis tables
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

-- 4. Check triggers that might be blocking
SELECT 
    event_object_table as table_name,
    trigger_name,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('users', 'perfis', 'perfis_moradores')
ORDER BY event_object_table, trigger_name;

-- 5. Check constraints on tables
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('users', 'perfis', 'perfis_moradores');

-- 6. Check if there are trigger functions
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
AND routine_name LIKE ANY(ARRAY['%trigger%', '%user%', '%auth%', '%perfil%']);

-- 7. Test simple insertion in auth.users
-- This command may fail if there's any block
SELECT 'Testing insertion in auth.users...' as status;

-- 8. Check if auth.users table exists
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'auth';

-- 9. Check auth.users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 10. Check if necessary extensions exist
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');
