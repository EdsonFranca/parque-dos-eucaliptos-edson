-- INVESTIGAR MULTIPLICAÇÃO DE CURTIDAS

-- 1. Verificar dados atuais no banco
SELECT id, descricao, likes, created_at FROM obras ORDER BY created_at DESC;

-- 2. Verificar tipo exato da coluna likes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'obras' AND column_name = 'likes';

-- 3. Verificar se há dados corrompidos ou duplicados
SELECT 
    id,
    descricao,
    likes,
    CASE 
        WHEN likes IS NULL THEN 'NULL'
        WHEN likes = '{}'::text[] THEN 'ARRAY VAZIO'
        WHEN likes = '[]'::text[] THEN 'ARRAY VAZIO STRING'
        ELSE 'TIPO CONHECIDO'
    END as tipo_dado,
    CASE 
        WHEN likes IS NULL THEN 0
        WHEN likes = '{}'::text[] THEN 0
        WHEN likes = '[]'::text[] THEN 0
        ELSE array_length(likes, 1)
    END as quantidade_real
FROM obras 
ORDER BY created_at DESC;

-- 4. Verificar se há múltiplos usuários na mesma obra
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
