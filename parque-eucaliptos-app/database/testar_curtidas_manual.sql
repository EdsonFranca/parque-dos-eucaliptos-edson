-- TESTAR CURTIDAS MANUALMENTE

-- 1. Verificar dados atuais
SELECT id, descricao, likes, created_at FROM obras ORDER BY created_at DESC LIMIT 3;

-- 2. Adicionar uma curtida de teste na primeira obra
UPDATE obras 
SET likes = COALESCE(likes, ARRAY[]::text[]) || 'usuario-teste-' || EXTRACT(EPOCH FROM NOW())::text
WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1);

-- 3. Verificar se a curtida foi adicionada
SELECT id, descricao, likes, array_length(likes, 1) as total_curtidas 
FROM obras 
WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1);
