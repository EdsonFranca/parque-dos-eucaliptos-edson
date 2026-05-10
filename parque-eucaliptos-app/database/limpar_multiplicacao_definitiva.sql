-- LIMPEZA DEFINITIVA DA MULTIPLICAÇÃO DE CURTIDAS

-- 1. Zerar todas as curtidas (limpeza completa)
UPDATE obras SET likes = '{}'::text[] WHERE likes IS NOT NULL;

-- 2. Verificar resultado da limpeza
SELECT id, descricao, likes, array_length(likes, 1) as curtidas_count FROM obras ORDER BY created_at DESC;

-- 3. Se ainda houver multiplicação, forçar limpeza total
UPDATE obras SET likes = NULL;

-- 4. Verificar resultado final
SELECT id, descricao, likes FROM obras ORDER BY created_at DESC;
