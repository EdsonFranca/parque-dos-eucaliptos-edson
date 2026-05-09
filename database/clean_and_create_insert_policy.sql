-- Limpar políticas antigas e criar nova política INSERT
-- Execute no SQL Editor do Supabase

-- Remover políticas de INSERT antigas que podem estar conflitando
DROP POLICY IF EXISTS "Usuarios podem criar proprios servicos" ON public.servicos;
DROP POLICY IF EXISTS "Usuarios autenticados podem criar servicos" ON public.servicos;
DROP POLICY IF EXISTS "Morador publica proprio servico" ON public.servicos;

-- Criar política INSERT correta
CREATE POLICY "Usuarios podem criar proprios servicos"
ON public.servicos
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = prestador_id
);

-- Verificar política criada
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'servicos' AND cmd = 'INSERT';
