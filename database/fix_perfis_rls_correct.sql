-- Garantir RLS ativo e política SELECT para tabela perfis
-- Execute no SQL Editor do Supabase

-- 1. Garantir que RLS está ativo na tabela perfis
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas que podem conflitar
DROP POLICY IF EXISTS "Usuarios podem ver proprio perfil" ON public.perfis;
DROP POLICY IF EXISTS "Admins podem gerenciar perfis" ON public.perfis;
DROP POLICY IF EXISTS "Users can view own profile" ON public.perfis;

-- 3. Criar política SELECT para o próprio usuário
CREATE POLICY "Usuarios podem ver proprio perfil"
ON public.perfis
FOR SELECT
USING (auth.role() = 'authenticated' AND auth.uid() = id);

-- 4. Criar política INSERT para usuários autenticados (se necessário)
CREATE POLICY "Usuarios podem criar proprio perfil"
ON public.perfis
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);

-- 5. Criar política UPDATE para o próprio usuário (se necessário)
CREATE POLICY "Usuarios podem atualizar proprio perfil"
ON public.perfis
FOR UPDATE
USING (auth.role() = 'authenticated' AND auth.uid() = id)
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);

-- 6. Verificar se as políticas foram criadas
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'perfis'
ORDER BY cmd, policyname;

-- 7. Verificar estrutura da tabela perfis
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'perfis' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Testar leitura manual (descomente para testar com seu user ID)
-- SELECT id, nome, email FROM public.perfis WHERE id = 'seu-user-id-aqui';
