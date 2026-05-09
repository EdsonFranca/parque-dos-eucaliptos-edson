-- HABILITAR REALTIME CORRIGIDO
-- Script que verifica e trata erros de publicação existente

-- 1. Verificar se a publicação realtime já existe
SELECT * FROM pg_publication WHERE pubname = 'realtime';

-- 2. Se não existir, criar (ignorar erro se já existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'realtime') THEN
        CREATE PUBLICATION realtime;
    END IF;
END $$;

-- 3. Adicionar tabela obras (ignorar erro se já estiver na publicação)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'realtime' AND tablename = 'obras'
    ) THEN
        ALTER PUBLICATION realtime ADD TABLE obras;
    END IF;
END $$;

-- 4. Verificar se funcionou
SELECT * FROM pg_publication_tables WHERE pubname = 'realtime' AND tablename = 'obras';
