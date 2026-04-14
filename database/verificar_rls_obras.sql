-- VERIFICAR E CORRIGIR RLS NA TABELA OBRAS

-- 1. Verificar se RLS está habilitado na tabela obras
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'obras';

-- 2. Verificar políticas RLS existentes para obras
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'obras';

-- 3. Desabilitar RLS temporariamente para teste
ALTER TABLE obras DISABLE ROW LEVEL SECURITY;

-- 4. Tentar UPDATE novamente (substitua ID_REAL)
UPDATE obras SET likes = 'usuario-teste-123' WHERE id = 'ID_REAL';

-- 5. Verificar resultado
SELECT id, likes FROM obras WHERE id = 'ID_REAL';

-- 6. Reabilitar RLS
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
