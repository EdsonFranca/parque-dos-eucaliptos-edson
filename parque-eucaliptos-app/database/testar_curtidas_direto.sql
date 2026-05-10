-- TESTAR SE CURTIDAS ESTÃO FUNCIONANDO NO BANCO
-- Execute este script para verificar se as curtidas estão sendo salvas

-- 1. Verificar estrutura da tabela obras
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'obras' AND column_name = 'likes';

-- 2. Verificar dados atuais das obras e curtidas
SELECT id, descricao, likes, created_at 
FROM obras 
ORDER BY created_at DESC;

-- 3. Testar manualmente uma curtida (substitua ID_REAL pelo ID de uma obra)
-- UPDATE obras SET likes = array_append(likes, 'test-user-id') WHERE id = 'ID_REAL';

-- 4. Verificar se a curtida foi adicionada
SELECT id, likes FROM obras WHERE id = 'ID_REAL';
