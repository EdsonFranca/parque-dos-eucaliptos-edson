-- Script para diagnosticar problemas no Supabase
-- Execute no SQL Editor do dashboard

-- 1. Verificar se o Auth está ativado
SELECT * FROM auth.users LIMIT 1;

-- 2. Verificar se as tabelas existem
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name IN ('perfis', 'perfis_moradores')
ORDER BY table_name;

-- 3. Verificar estrutura das tabelas
\d perfis
\d perfis_moradores

-- 4. Verificar se há triggers ou constraints bloqueando
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('perfis', 'perfis_moradores');

-- 5. Verificar se RLS está ativado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('perfis', 'perfis_moradores');

-- 6. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('perfis', 'perfis_moradores');

-- 7. Testar inserção manual (sem depender do auth)
-- Primeiro veja se já existe algum usuário
SELECT id, email FROM auth.users LIMIT 5;

-- Se não existir, crie um manualmente para teste
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
    gen_random_uuid(),
    'test@example.com',
    crypt('test123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 8. Verificar logs de erro recentes
SELECT * FROM auth.audit_logs WHERE event = 'signup' ORDER BY created_at DESC LIMIT 5;
