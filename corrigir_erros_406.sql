-- Corrigir erros 406 Not Acceptable em perfis_moradores
-- Execute no SQL Editor do Supabase

-- 1. Verificar se a view perfis_moradores existe
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'perfis_moradores' AND table_schema = 'public';

-- 2. Se não existir, criar a view
DROP TABLE IF EXISTS perfis_moradores;
DROP VIEW IF EXISTS perfis_moradores;
CREATE OR REPLACE VIEW perfis_moradores AS
SELECT 
    p.id,
    p.nome,
    p.email,
    p.tipo_usuario,
    ep.chacara,
    ep.ativo as email_permitido
FROM public.perfis p
LEFT JOIN public.emails_permitidos ep ON p.email = ep.email;

-- 3. Verificar RLS na tabela perfis
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'perfis' AND schemaname = 'public';

-- 4. Se RLS estiver ativo, criar política para usuários verem próprio perfil
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON perfis;
CREATE POLICY "Usuários podem ver próprio perfil" ON perfis
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON perfis;
CREATE POLICY "Admins podem ver todos os perfis" ON perfis
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM perfis 
      WHERE tipo_usuario = 'admin'
    )
  );

-- 5. Verificar se a view tem políticas RLS
-- Views não podem ter RLS diretamente, então precisamos garantir acesso às tabelas base

-- 6. Garantir que emails_permitidos também tenha políticas adequadas
ALTER TABLE emails_permitidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualquer um pode verificar email permitido" ON emails_permitidos;
CREATE POLICY "Qualquer um pode verificar email permitido" ON emails_permitidos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins podem gerenciar emails permitidos" ON emails_permitidos;
CREATE POLICY "Admins podem gerenciar emails permitidos" ON emails_permitidos
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM perfis 
      WHERE tipo_usuario = 'admin'
    )
  );

-- 7. Testar acesso à view
SELECT 'Testando acesso à view perfis_moradores...' as status;
SELECT COUNT(*) as total_perfis FROM perfis_moradores LIMIT 1;
