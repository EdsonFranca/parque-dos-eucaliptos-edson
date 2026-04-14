-- INSERIR NOVOS EMAILS PERMITIDOS

-- Inserir novos emails permitidos para cadastro
INSERT INTO emails_permitidos (email, nome, chacara, ativo, created_at) VALUES
('edson.s.franca@gmail.com', 'Edson Franca', 'Chácara Edson', true, NOW()),
('contalidervila@gmail.com', 'Contato Lider Vila', 'Chácara Lider', true, NOW());

-- Verificar se os emails foram inseridos corretamente
SELECT email, nome, chacara, ativo, created_at
FROM emails_permitidos 
WHERE email IN ('edson.s.franca@gmail.com', 'contalidervila@gmail.com')
ORDER BY email;
