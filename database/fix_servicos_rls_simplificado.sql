-- VERSÃO SIMPLIFICADA - CORREÇÃO RLS SERVIÇOS
-- Execute no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para testar
ALTER TABLE public.servicos DISABLE ROW LEVEL SECURITY;

-- 2. Habilitar RLS novamente com política simples
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- 3. Criar política única e simples para tudo
CREATE POLICY "servicos_policy"
ON public.servicos
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Verificar se funcionou
SELECT * FROM pg_policies WHERE tablename = 'servicos';

-- 5. Testar inserção (descomente para testar)
-- INSERT INTO public.servicos (prestador_id, prestador_nome, titulo, descricao, contato, foto_url, ativo)
-- VALUES ('test-user-id', 'Test User', 'Serviço Teste', 'Descrição teste', 'contato@teste.com', '', true);
