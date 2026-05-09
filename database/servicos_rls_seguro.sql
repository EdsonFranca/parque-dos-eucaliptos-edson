-- POLÍTICAS RLS SEGURAS E GRANULARES PARA TABELA SERVIÇOS
-- Execute no SQL Editor do Supabase

-- 1. Remover todas as políticas existentes (limpeza)
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
    EXECUTE 'DROP POLICY IF EXISTS "servicos_all_policy" ON public.servicos';
EXCEPTION
    WHEN others THEN
        NULL; -- Ignorar erros de DROP
END;
$$;

-- 2. Verificar se RLS está ativo na tabela
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas granulares e seguras

-- Política SELECT: Todos os autenticados podem ver todos os serviços
CREATE POLICY "servicos_select_todos_autenticados"
ON public.servicos
FOR SELECT
USING (auth.role() = 'authenticated');

-- Política INSERT: Apenas se auth.uid() = prestador_id (usuário só pode criar seus próprios serviços)
CREATE POLICY "servicos_insert_proprio_prestador"
ON public.servicos
FOR INSERT
WITH CHECK (auth.uid() = prestador_id);

-- Política UPDATE: Apenas se auth.uid() = prestador_id (usuário só pode editar seus próprios serviços)
CREATE POLICY "servicos_update_proprio_prestador"
ON public.servicos
FOR UPDATE
USING (auth.uid() = prestador_id)
WITH CHECK (auth.uid() = prestador_id);

-- Política DELETE: Apenas se auth.uid() = prestador_id (usuário só pode excluir seus próprios serviços)
CREATE POLICY "servicos_delete_proprio_prestador"
ON public.servicos
FOR DELETE
USING (auth.uid() = prestador_id);

-- 4. Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'servicos'
ORDER BY cmd, policyname;

-- 5. Verificar estrutura da tabela servicos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'servicos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Teste de inserção manual (descomente para testar)
-- INSERT INTO public.servicos (prestador_id, prestador_nome, titulo, descricao, contato, foto_url, ativo)
-- VALUES (auth.uid(), 'Teste User', 'Serviço Teste', 'Descrição teste', 'contato@teste.com', '', true);

-- 7. Verificar serviços (descomente para testar)
-- SELECT * FROM public.servicos ORDER BY created_at DESC LIMIT 5;
