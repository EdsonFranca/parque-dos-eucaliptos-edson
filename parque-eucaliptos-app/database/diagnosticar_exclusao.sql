-- DIAGNÓSTICO COMPLETO DA TABELA emails_permitidos

-- 1. Verificar estrutura da tabela
SELECT 
  column_name AS coluna,
  data_type AS tipo,
  is_nullable AS nulo,
  column_default AS padrao
FROM information_schema.columns 
WHERE table_name = 'emails_permitidos'
ORDER BY ordinal_position;

-- 2. Verificar todas as políticas RLS
SELECT 
  schemaname AS esquema,
  tablename AS tabela,
  policyname AS politica,
  permissive AS permissiva,
  roles AS papeis,
  cmd AS comando,
  qual AS qualificador
FROM pg_policies 
WHERE tablename = 'emails_permitidos'
ORDER BY policyname;

-- 3. Verificar triggers na tabela
SELECT 
  event_object_table AS tabela,
  trigger_name AS gatilho,
  event_manipulation AS evento,
  action_timing AS momento,
  action_condition AS condicao,
  action_statement AS acao
FROM information_schema.triggers 
WHERE event_object_table = 'emails_permitidos';

-- 4. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_habilitado
FROM pg_tables 
WHERE tablename = 'emails_permitidos';

-- 5. Desabilitar RLS temporariamente para teste
ALTER TABLE emails_permitidos DISABLE ROW LEVEL SECURITY;

-- 6. Tentar excluir novamente (agora deve funcionar)
DELETE FROM emails_permitidos 
WHERE email = 'salarod01@gmail.com';

-- 7. Verificar se foi excluído
SELECT email, nome, chacara, ativo 
FROM emails_permitidos 
WHERE email = 'salarod01@gmail.com';

-- 8. Reabilitar RLS
ALTER TABLE emails_permitidos ENABLE ROW LEVEL SECURITY;
