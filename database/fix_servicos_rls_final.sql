-- VERSÃO FINAL - CORREÇÃO DEFINITIVA RLS SERVIÇOS
-- Execute no SQL Editor do Supabase

-- 1. Forçar remoção de todas as políticas (ignorando erros)
DO $$
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Servicos leitura autenticada" ON public.servicos';
    EXECUTE 'DROP POLICY IF EXISTS "Morador publica proprio servico" ON public.servicos';
    EXECUTE 'DROP POLICY IF EXISTS "Morador atualiza proprio servico" ON public.servicos';
    EXECUTE 'DROP POLICY IF EXISTS "Morador remove proprio servico" ON public.servicos';
    EXECUTE 'DROP POLICY IF EXISTS "Admin gerencia todos servicos" ON public.servicos';
    EXECUTE 'DROP POLICY IF EXISTS "Usuarios autenticados podem criar servicos" ON public.servicos';
    EXECUTE 'DROP POLICY IF EXISTS "Usuarios autenticados podem ver servicos" ON public.servicos';
    EXECUTE 'DROP POLICY IF EXISTS "Usuarios podem atualizar proprios servicos" ON public.servicos';
    EXECUTE 'DROP POLICY IF EXISTS "Usuarios podem excluir proprios servicos" ON public.servicos';
    EXECUTE 'DROP POLICY IF EXISTS "servicos_policy" ON public.servicos';
EXCEPTION
    WHEN others THEN
        NULL; -- Ignorar todos os erros de DROP
END;
$$;

-- 2. Desabilitar e reabilitar RLS para limpar cache
ALTER TABLE public.servicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- 3. Criar política única e simples
CREATE POLICY "servicos_all_policy"
ON public.servicos
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Verificar políticas ativas
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'servicos';

-- 5. Testar inserção manual (descomente para testar)
-- INSERT INTO public.servicos (prestador_id, prestador_nome, titulo, descricao, contato, foto_url, ativo)
-- VALUES ('test-user-id', 'Test User', 'Serviço Teste', 'Descrição teste', 'contato@teste.com', '', true);

-- 6. Verificar dados (descomente para testar)
-- SELECT * FROM public.servicos ORDER BY created_at DESC LIMIT 5;
