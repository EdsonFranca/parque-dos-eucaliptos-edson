-- LIMPAR DADOS FALSOS DE CURTIDAS

-- 1. Verificar dados atuais
SELECT id, descricao, likes FROM obras ORDER BY created_at DESC;

-- 2. Limpar todas as curtidas (definir como array vazio)
UPDATE obras SET likes = '{}'::text[];

-- 3. Verificar se foi limpo
SELECT id, descricao, likes FROM obras ORDER BY created_at DESC;

-- 4. Zerar todas as curtidas (alternativa se array não funcionar)
UPDATE obras SET likes = NULL;
