-- =========================================================
-- CORREÇÃO DE RLS PARA TABELA SERVIÇOS
-- Execute no SQL Editor do Supabase
-- =========================================================

-- 1. Remover políticas existentes que podem estar bloqueando
DROP POLICY IF EXISTS "Servicos leitura autenticada" ON public.servicos;
DROP POLICY IF EXISTS "Morador publica proprio servico" ON public.servicos;
DROP POLICY IF EXISTS "Morador atualiza proprio servico" ON public.servicos;
DROP POLICY IF EXISTS "Morador remove proprio servico" ON public.servicos;
DROP POLICY IF EXISTS "Admin gerencia todos servicos" ON public.servicos;

-- 2. Criar política simplificada para permitir inserção
CREATE POLICY "Usuarios autenticados podem criar servicos"
ON public.servicos
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);

-- 3. Política de leitura para usuários autenticados
CREATE POLICY "Usuarios autenticados podem ver servicos"
ON public.servicos
FOR SELECT
USING (auth.role() = 'authenticated');

-- 4. Política de atualização para o próprio criador
CREATE POLICY "Usuarios podem atualizar proprios servicos"
ON public.servicos
FOR UPDATE
USING (auth.role() = 'authenticated' AND auth.uid() = prestador_id)
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = prestador_id);

-- 5. Política de exclusão para o próprio criador
CREATE POLICY "Usuarios podem excluir proprios servicos"
ON public.servicos
FOR DELETE
USING (auth.role() = 'authenticated' AND auth.uid() = prestador_id);

-- 6. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'servicos';

-- 7. Testar inserção manual (descomente para testar)
-- INSERT INTO public.servicos (prestador_id, prestador_nome, titulo, descricao, contato, foto_url, ativo)
-- VALUES ('test-user-id', 'Test User', 'Serviço Teste', 'Descrição teste', 'contato@teste.com', '', true);

-- 8. Verificar dados inseridos
-- SELECT * FROM public.servicos ORDER BY created_at DESC LIMIT 5;
