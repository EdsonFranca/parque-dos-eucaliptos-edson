-- Apenas adicionar política INSERT mantendo RLS ativo
-- Execute no SQL Editor do Supabase

CREATE POLICY "Usuarios podem criar proprios servicos"
ON public.servicos
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = prestador_id
);
