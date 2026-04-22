-- TESTAR CORREÇÕES DAS CURTIDAS
-- Execute este script para verificar se as correções funcionam corretamente

-- 1. Verificar estrutura atual da tabela obras
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'obras' 
ORDER BY ordinal_position;

-- 2. Verificar dados atuais das curtidas
SELECT 
    id,
    descricao,
    likes,
    CASE 
        WHEN likes IS NULL THEN 'NULL'
        WHEN cardinality(likes) = 0 THEN 'ARRAY VAZIO'
        ELSE 'ARRAY COM DADOS'
    END as tipo_dado,
    CASE 
        WHEN likes IS NULL THEN 0
        WHEN cardinality(likes) = 0 THEN 0
        ELSE cardinality(likes)
    END as quantidade_real
FROM obras 
ORDER BY created_at DESC;

-- 3. Limpar dados corrompidos (se necessário)
-- Descomente as linhas abaixo se precisar limpar os dados
-- UPDATE obras SET likes = '{}'::text[] WHERE likes IS NULL OR cardinality(likes) = 0;

-- 4. Testar inserção de curtida de exemplo
UPDATE obras 
SET likes = array_append(
    COALESCE(likes, '{}'::text[]), 
    'test-user-id-' || EXTRACT(EPOCH FROM NOW())::text
)
WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1);

-- 5. Verificar resultado do teste
SELECT 
    id, 
    descricao, 
    likes, 
    cardinality(likes) as total_curtidas
FROM obras 
WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1);

-- 6. Testar remoção de curtida duplicada (se existir)
UPDATE obras 
SET likes = (
    SELECT array_agg(DISTINCT element) 
    FROM unnest(likes) as element
)
WHERE id = (SELECT id FROM obras ORDER BY created_at DESC LIMIT 1)
AND cardinality(likes) > 1;

-- 7. Verificar final
SELECT 
    id, 
    descricao, 
    likes, 
    cardinality(likes) as total_curtidas
FROM obras 
ORDER BY created_at DESC LIMIT 3;
