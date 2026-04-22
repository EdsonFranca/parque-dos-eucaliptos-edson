-- VERIFICAR E CORRIGIR POLÍTICAS PARA EXCLUSÃO DE EMAILS

-- 1. Verificar políticas atuais na tabela emails_permitidos
SELECT 
  schemaname AS esquema,
  tablename AS tabela,
  policyname AS politica,
  permissive AS permissiva,
  cmd AS comando,
  qual AS qualificador
FROM pg_policies 
WHERE tablename = 'emails_permitidos'
ORDER BY policyname;

-- 2. Verificar se existem emails na tabela
SELECT COUNT(*) AS total_emails FROM emails_permitidos;

-- 3. Listar todos os emails (para verificação)
SELECT email, nome, chacara, ativo 
FROM emails_permitidos 
ORDER BY email;

-- 4. Remover política existente e criar nova para DELETE
DROP POLICY IF EXISTS "Admins podem excluir emails permitidos" ON emails_permitidos;

CREATE POLICY "Admins podem excluir emails permitidos" ON emails_permitidos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 
      FROM perfis_moradores 
      WHERE perfis_moradores.id = auth.uid() 
      AND perfis_moradores.tipo_usuario = 'admin'
    )
  );

-- 5. Verificar se a política foi criada
SELECT 
  schemaname AS esquema,
  tablename AS tabela,
  policyname AS politica,
  permissive AS permissiva,
  cmd AS comando,
  qual AS qualificador
FROM pg_policies 
WHERE tablename = 'emails_permitidos' AND cmd = 'DELETE';
