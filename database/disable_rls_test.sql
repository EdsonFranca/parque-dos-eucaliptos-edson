-- DESABILITAR RLS COMPLETAMENTE PARA TESTE
ALTER TABLE sessoes_ativas DISABLE ROW LEVEL SECURITY;

-- Verificar se a tabela existe e tem dados
SELECT COUNT(*) as total_sessoes FROM sessoes_ativas;

-- Verificar dados atuais
SELECT * FROM sessoes_ativas WHERE status = 'ativa' ORDER BY inicio_sessao DESC;
