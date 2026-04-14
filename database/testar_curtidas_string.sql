-- TESTAR CURTIDAS COM STRING

-- 1. Verificar dados atuais
SELECT id, descricao, likes FROM obras ORDER BY created_at DESC LIMIT 3;

-- 2. Verificar tipo da coluna likes
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'likes';

-- 3. Tentar UPDATE com string (substitua ID_REAL pelo ID)
UPDATE obras SET likes = 'usuario-teste-123' WHERE id = 'ID_REAL';

-- 4. Verificar resultado
SELECT id, likes FROM obras WHERE id = 'ID_REAL';
