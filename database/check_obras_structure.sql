-- Verificar estrutura da tabela obras
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'obras' 
ORDER BY ordinal_position;

-- Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'obras'
) AS table_exists;

-- Verificar dados na tabela
SELECT COUNT(*) as total_obras FROM obras LIMIT 5;
