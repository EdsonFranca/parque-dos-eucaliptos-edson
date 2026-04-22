-- DIAGNÓSTICO E CORREÇÃO DO REALTIME

-- 1. Verificar se a publicação supabase_realtime existe
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- 2. Verificar quais tabelas estão na publicação
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- 3. Se a publicação não existir, criar uma nova
CREATE PUBLICATION IF NOT EXISTS realtime;

-- 4. Adicionar tabela obras à publicação (usando nome genérico)
ALTER PUBLICATION realtime ADD TABLE obras;

-- 5. Verificar se funcionou
SELECT * FROM pg_publication_tables WHERE pubname = 'realtime' AND tablename = 'obras';
