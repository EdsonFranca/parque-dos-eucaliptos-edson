-- INSERIR NOVOS EMAILS COM RLS TEMPORARIAMENTE DESABILITADO

-- 1. Desabilitar RLS temporariamente
ALTER TABLE emails_permitidos DISABLE ROW LEVEL SECURITY;

-- 2. Inserir novos emails permitidos
INSERT INTO emails_permitidos (email, nome, chacara, ativo, created_at) VALUES
('edson.s.franca@gmail.com', 'Edson Franca', 'Chácara Edson', true, NOW()),
('contalidervila@gmail.com', 'Contato Lider Vila', 'Chácara Lider', true, NOW());

-- 3. Verificar se os emails foram inseridos corretamente
SELECT email, nome, chacara, ativo, created_at
FROM emails_permitidos 
WHERE email IN ('edson.s.franca@gmail.com', 'contalidervila@gmail.com')
ORDER BY email;

-- 4. Reabilitar RLS
ALTER TABLE emails_permitidos ENABLE ROW LEVEL SECURITY;
