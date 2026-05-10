-- VERIFICAR ESTRUTURA EXATA E INSERIR CORRETAMENTE

-- 1. Verificar estrutura exata da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'emails_permitidos' 
ORDER BY ordinal_position;

-- 2. Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'emails_permitidos';

-- 3. Tentar INSERT simplificado (sem created_at se não existir)
INSERT INTO emails_permitidos (email, nome, chacara, ativo) VALUES
('edson.s.franca@gmail.com', 'Edson Franca', 'Chácara Edson', true),
('contalidervila@gmail.com', 'Contato Lider Vila', 'Chácara Lider', true);

-- 4. Verificar se foram inseridos
SELECT * FROM emails_permitidos 
WHERE email IN ('edson.s.franca@gmail.com', 'contalidervila@gmail.com')
ORDER BY email;
