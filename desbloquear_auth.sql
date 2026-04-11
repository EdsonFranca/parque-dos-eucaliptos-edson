-- Script para desbloquear criação de usuários no Supabase
-- Execute se o diagnóstico mostrar problemas de RLS/triggers

-- 1. Desabilitar RLS temporariamente na auth.users (se estiver ativado)
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas que podem estar bloqueando
DROP POLICY IF EXISTS "users_insert_policy" ON auth.users;
DROP POLICY IF EXISTS "users_select_policy" ON auth.users;
DROP POLICY IF EXISTS "users_update_policy" ON auth.users;
DROP POLICY IF EXISTS "users_delete_policy" ON auth.users;

-- 3. Remover triggers que podem estar bloqueando
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS auth_user_created_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- 4. Remover funções de trigger
DROP FUNCTION IF EXISTS auth.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_profile();

-- 5. Garantir que a tabela perfis não tenha RLS bloqueando
ALTER TABLE perfis DISABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_moradores DISABLE ROW LEVEL SECURITY;

-- 6. Remover políticas das tabelas de perfis
DROP POLICY IF EXISTS "perfis_insert_policy" ON perfis;
DROP POLICY IF EXISTS "perfis_select_policy" ON perfis;
DROP POLICY IF EXISTS "perfis_moradores_insert_policy" ON perfis_moradores;
DROP POLICY IF EXISTS "perfis_moradores_select_policy" ON perfis_moradores;

-- 7. Verificar se as extensões necessárias existem
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 8. Testar criação de usuário simples
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    gen_random_uuid(),
    'admin@parquedoseucaliptos.com',
    crypt('senha123456', gen_salt('bf', 12)),
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated'
) RETURNING id;
