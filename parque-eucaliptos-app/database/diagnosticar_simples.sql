-- DIAGNÓSTICO SIMPLES - EXECUTE PASSO A PASSO

-- Passo 1: Verificar se tabela obras existe
SELECT table_name FROM information_schema.tables WHERE table_name = 'obras';

-- Passo 2: Verificar estrutura básica
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'obras' ORDER BY ordinal_position;

-- Passo 3: Verificar dados existentes
SELECT COUNT(*) as total_obras FROM obras;

-- Passo 4: Verificar se coluna likes existe
SELECT column_name FROM information_schema.columns WHERE table_name = 'obras' AND column_name = 'likes';
