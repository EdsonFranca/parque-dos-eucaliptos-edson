-- SOLUÇÃO DEFINITIVA PARA CURTIDAS

-- 1. Verificar estrutura completa da tabela obras
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'obras' 
ORDER BY ordinal_position;

-- 2. Verificar dados atuais sem modificar nada
SELECT id, descricao, likes, created_at 
FROM obras 
ORDER BY created_at DESC 
LIMIT 3;

-- 3. Se a coluna likes não existir, criar uma nova
-- ALTER TABLE obras ADD COLUMN likes TEXT DEFAULT NULL;

-- 4. Se a coluna likes existir mas for do tipo errado, modificar
-- ALTER TABLE obras ALTER COLUMN likes TYPE TEXT USING likes::TEXT;

-- 5. Tentar UPDATE simples com valor nulo primeiro
UPDATE obras 
SET likes = NULL 
WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1);

-- 6. Verificar se o UPDATE com NULL funcionou
SELECT id, likes FROM obras WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1);

-- 7. Agora tentar UPDATE com valor real
UPDATE obras 
SET likes = 'test-curtida-' || EXTRACT(EPOCH FROM NOW())::text
WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1);

-- 8. Verificar resultado final
SELECT id, likes FROM obras WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1);
