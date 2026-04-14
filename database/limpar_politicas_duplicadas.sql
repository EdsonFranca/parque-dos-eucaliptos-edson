-- LIMPAR TODAS AS POLÍTICAS DUPLICADAS E CRIAR APENAS AS CORRETAS

-- 1. Remover TODAS as políticas existentes na tabela emails_permitidos
DROP POLICY IF EXISTS "Admins podem gerenciar emails permitidos" ON emails_permitidos;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar emails permitidos" ON emails_permitidos;
DROP POLICY IF EXISTS "Qualquer um pode verificar email permitido" ON emails_permitidos;

-- 2. Criar política única para SELECT (qualquer um pode verificar)
CREATE POLICY "Qualquer um pode verificar email permitido" ON emails_permitidos
  FOR SELECT USING (true);

-- 3. Criar política única para admin (INSERT, UPDATE, DELETE)
CREATE POLICY "Apenas admins podem gerenciar emails permitidos" ON emails_permitidos
  FOR ALL USING (
    EXISTS (
      SELECT 1 
      FROM perfis_moradores 
      WHERE perfis_moradores.id = auth.uid() 
      AND perfis_moradores.tipo_usuario = 'admin'
    )
  );

-- 4. Verificar políticas finais
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
