-- Garantir RLS ativo e política SELECT para perfis_moradores
-- Execute no SQL Editor do Supabase

-- 1. Garantir que RLS está ativo na tabela perfis_moradores
ALTER TABLE public.perfis_moradores ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas que podem conflitar
DROP POLICY IF EXISTS "Usuarios podem ver proprio perfil" ON public.perfis_moradores;
DROP POLICY IF EXISTS "Admins podem gerenciar perfis" ON public.perfis_moradores;

-- 3. Criar política SELECT para o próprio usuário
CREATE POLICY "Usuarios podem ver proprio perfil"
ON public.perfis_moradores
FOR SELECT
USING (auth.role() = 'authenticated' AND auth.uid() = id);

-- 4. Verificar se a política foi criada
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'perfis_moradores' AND cmd = 'SELECT';

-- 5. Testar leitura manual (descomente para testar com seu user ID)
-- SELECT * FROM public.perfis_moradores WHERE id = 'seu-user-id-aqui';
