-- Verificação final se a view existe e funciona
-- Execute no SQL Editor do Supabase

-- 1. Verificar se perfis_moradores existe
SELECT 'Verificando se perfis_moradores existe...' as status;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'perfis_moradores' AND table_schema = 'public';

-- 2. Verificar estrutura
SELECT 'Estrutura da view:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'perfis_moradores' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Testar query
SELECT 'Testando query na view:' as status;
SELECT COUNT(*) as total_registros FROM perfis_moradores;

-- 4. Verificar dados reais
SELECT 'Mostrando primeiros 3 registros:' as status;
SELECT id, nome, email, tipo_usuario, chacara 
FROM perfis_moradores 
LIMIT 3;
