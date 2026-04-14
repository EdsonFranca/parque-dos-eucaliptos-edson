-- HABILITAR REALTIME PARA TABELA OBRAS
-- Isso permite que as atualizações de curtidas sejam propagadas em tempo real

-- 1. Habilitar Realtime para a tabela obras
ALTER PUBLICATION supabase_realtime ADD TABLE obras;

-- 2. Verificar se a tabela está na publicação
SELECT * 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'obras';
