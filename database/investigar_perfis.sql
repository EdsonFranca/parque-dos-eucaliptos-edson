-- INVESTIGAR E CORRIGIR POLÍTICAS DA TABELA perfis

-- 1. Verificar todas as políticas da tabela perfis
SELECT 
  schemaname AS esquema,
  tablename AS tabela,
  policyname AS politica,
  permissive AS permissiva,
  roles AS papeis,
  cmd AS comando,
  qual AS qualificador
FROM pg_policies 
WHERE tablename = 'perfis'
ORDER BY policyname;

-- 2. Verificar se a tabela perfis existe e sua estrutura
\d perfis;

-- 3. Remover políticas problemáticas da tabela perfis (se existirem)
DROP POLICY IF EXISTS "Usuarios podem ver proprio perfil" ON perfis;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar perfis" ON perfis;
DROP POLICY IF EXISTS "Usuarios podem ver perfis" ON perfis;

-- 4. Desabilitar RLS temporariamente na tabela perfis para testar
ALTER TABLE perfis DISABLE ROW LEVEL SECURITY;

-- 5. Verificar se a recursão sumiu (teste simples)
SELECT COUNT(*) FROM perfis LIMIT 1;
