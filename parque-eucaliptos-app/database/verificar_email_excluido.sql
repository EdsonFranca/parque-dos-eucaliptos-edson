-- VERIFICAR SE EMAIL FOI REALMENTE REMOVIDO

-- Substitua 'email@exemplo.com' pelo email que você tentou excluir
SELECT email, nome, chacara, ativo 
FROM emails_permitidos 
WHERE email = 'email@exemplo.com';

-- Verificar todos os emails para comparação
SELECT email, nome, chacara, ativo 
FROM emails_permitidos 
ORDER BY email;

-- Se o email ainda existe, remova manualmente
DELETE FROM emails_permitidos 
WHERE email = 'email@exemplo.com';

-- Verificar se foi removido
SELECT email, nome, chacara, ativo 
FROM emails_permitidos 
WHERE email = 'email@exemplo.com';
