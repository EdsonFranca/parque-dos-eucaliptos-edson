-- TESTE FINAL: DESABILITAR RLS E TENTAR EXCLUIR

-- 1. Desabilitar RLS temporariamente
ALTER TABLE emails_permitidos DISABLE ROW LEVEL SECURITY;

-- 2. Tentar excluir o email (agora deve funcionar)
DELETE FROM emails_permitidos 
WHERE email = 'salarod01@gmail.com';

-- 3. Verificar se foi excluído
SELECT email, nome, chacara, ativo 
FROM emails_permitidos 
WHERE email = 'salarod01@gmail.com';

-- 4. Listar todos os emails para verificação
SELECT email, nome, chacara, ativo 
FROM emails_permitidos 
ORDER BY email;

-- 5. Reabilitar RLS
ALTER TABLE emails_permitidos ENABLE ROW LEVEL SECURITY;
