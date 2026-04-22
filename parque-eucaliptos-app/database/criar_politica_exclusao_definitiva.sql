-- CRIAR POLÍTICA RLS DEFINITIVA PARA EXCLUSÃO DE EMAILS

-- 1. Remover política existente (se houver)
DROP POLICY IF EXISTS "Admins podem excluir emails permitidos" ON emails_permitidos;

-- 2. Criar política correta para DELETE usando service_role
-- Isso permite que a API (que usa service_role) possa excluir emails
CREATE POLICY "Admins podem excluir emails permitidos" ON emails_permitidos
  FOR DELETE
  TO service_role
  USING (true);

-- 3. Verificar se a política foi criada corretamente
SELECT 
  schemaname AS esquema,
  tablename AS tabela,
  policyname AS politica,
  permissive AS permissiva,
  roles AS papeis,
  cmd AS comando,
  qual AS qualificador
FROM pg_policies 
WHERE tablename = 'emails_permitidos' AND cmd = 'DELETE';
