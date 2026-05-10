-- DIAGNÓSTICO COMPLETO DAS CURTIDAS

-- 1. Verificar estrutura da tabela obras
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'obras' 
ORDER BY ordinal_position;

-- 2. Verificar dados atuais das obras
SELECT id, descricao, likes, created_at 
FROM obras 
ORDER BY created_at DESC
LIMIT 5;

-- 3. Verificar se há alguma obra com curtidas
SELECT id, descricao, likes, array_length(likes, 1) as num_curtidas
FROM obras 
WHERE likes IS NOT NULL AND array_length(likes, 1) > 0;

-- 4. Teste manual - adicionar curtida em uma obra específica
UPDATE obras 
SET likes = COALESCE(likes, ARRAY[]::text[]) || 'test-diagnostico-' || EXTRACT(EPOCH FROM NOW())::text
WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1);

-- 5. Verificar se a curtida foi adicionada
SELECT id, likes, array_length(likes, 1) as num_curtidas
FROM obras 
WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1);
