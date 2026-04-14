-- CORRIGIR POLÍTICA RECURSIVA NA TABELA emails_permitidos
-- O problema: política faz referência à tabela 'perfis' em vez de 'perfis_moradores'
-- Isso causa recursão infinita quando há políticas em ambas as tabelas

-- 1. Remover todas as políticas existentes da tabela emails_permitidos
DROP POLICY IF EXISTS "Apenas admins podem gerenciar emails permitidos" ON emails_permitidos;
DROP POLICY IF EXISTS "Qualquer um pode verificar email permitido" ON emails_permitidos;

-- 2. Criar política simples para SELECT (qualquer um pode verificar)
CREATE POLICY "Qualquer um pode verificar email permitido" ON emails_permitidos
  FOR SELECT USING (true);

-- 3. Criar política para admin (INSERT, UPDATE, DELETE)
CREATE POLICY "Apenas admins podem gerenciar emails permitidos" ON emails_permitidos
  FOR ALL USING (
    EXISTS (
      SELECT 1 
      FROM perfis_moradores 
      WHERE perfis_moradores.id = auth.uid() 
      AND perfis_moradores.tipo_usuario = 'admin'
    )
  );

-- 4. Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname AS esquema,
  tablename AS tabela,
  policyname AS politica,
  permissive AS permissiva,
  roles AS papeis,
  cmd AS comando,
  qual AS qualificador
FROM pg_policies 
WHERE tablename = 'emails_permitidos';

-- 5. Testar a política (descomente para testar)
-- SELECT * FROM emails_permitidos LIMIT 1;
