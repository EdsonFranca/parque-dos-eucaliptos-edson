-- Verificar RLS na tabela perfis_moradores
-- Execute no SQL Editor do Supabase

-- 1. Verificar se RLS está ativo na tabela perfis_moradores
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'perfis_moradores';

-- 2. Verificar políticas existentes na tabela perfis_moradores
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'perfis_moradores';

-- 3. Se não houver política SELECT, criar uma
-- (Descomente e execute se necessário)

/*
-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuarios podem ver proprio perfil" ON public.perfis_moradores;
DROP POLICY IF EXISTS "Admins podem gerenciar perfis" ON public.perfis_moradores;

-- Criar política SELECT para o próprio usuário
CREATE POLICY "Usuarios podem ver proprio perfil"
ON public.perfis_moradores
FOR SELECT
USING (auth.role() = 'authenticated' AND auth.uid() = id);

-- Criar política UPDATE para o próprio usuário
CREATE POLICY "Usuarios podem atualizar proprio perfil"
ON public.perfis_moradores
FOR UPDATE
USING (auth.role() = 'authenticated' AND auth.uid() = id)
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);

-- Criar política INSERT para usuários autenticados
CREATE POLICY "Usuarios podem criar proprio perfil"
ON public.perfis_moradores
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);
*/

-- 4. Testar leitura manual (descomente para testar)
-- SELECT * FROM public.perfis_moradores WHERE id = 'seu-user-id-aqui';

-- 5. Verificar estrutura da tabela
\d public.perfis_moradores;
