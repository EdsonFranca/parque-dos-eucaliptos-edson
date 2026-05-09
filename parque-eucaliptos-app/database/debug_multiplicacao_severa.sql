-- DEBUG MULTIPLICAÇÃO SEVERA DE CURTIDAS

-- 1. Verificar EXATAMENTE o que está no banco agora
SELECT 
    id,
    descricao,
    likes,
    CASE 
        WHEN likes IS NULL THEN 'NULL'
        WHEN likes = '{}'::text[] THEN 'ARRAY VAZIO'
        WHEN likes = '[]'::text[] THEN 'ARRAY VAZIO STRING'
        WHEN jsonb_typeof(likes::jsonb) IS NOT NULL THEN jsonb_typeof(likes::jsonb)
        ELSE 'TIPO DESCONHECIDO: ' || typeof(likes)
    END as tipo_dado,
    CASE 
        WHEN jsonb_array_length(likes::jsonb) IS NOT NULL THEN jsonb_array_length(likes::jsonb)
        WHEN likes = '{}'::text[] THEN 0
        WHEN likes = '[]'::text[] THEN 0
        ELSE 999
    END as quantidade_real
FROM obras 
ORDER BY created_at DESC;

-- 2. Verificar se há IDs duplicados dentro do array de likes
SELECT 
    id,
    descricao,
    likes,
    -- Contar elementos únicos no array
    CASE 
        WHEN likes IS NULL THEN 0
        ELSE array_length(array(SELECT DISTINCT unnest(likes)), 1)
    END as curtidas_unicas,
    -- Contar elementos totais no array
    CASE 
        WHEN likes IS NULL THEN 0
        ELSE array_length(likes, 1)
    END as curtidas_totais
FROM obras 
ORDER BY created_at DESC;

-- 3. Limpar curtidas duplicadas (manter apenas IDs únicos)
UPDATE obras 
SET likes = (
    CASE 
        WHEN likes IS NULL THEN '{}'::text[]
        ELSE array(SELECT DISTINCT unnest(likes))
    END
);
