-- SCRIPT PARA CORREÇÃO DO DASHBOARD
-- Este é um script SQL para ajudar na depuração do problema

-- Verificar se a tabela obras existe e sua estrutura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'obras' 
ORDER BY ordinal_position;

-- Verificar se há Realtime habilitado para obras
SELECT * 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'obras';
