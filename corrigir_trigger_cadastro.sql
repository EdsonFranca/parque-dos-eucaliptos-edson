-- Corrigir trigger que impede cadastro de usuários
-- Execute no SQL Editor do Supabase

-- 1. Remover o trigger antigo que está causando erro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS criar_perfil_usuario();

-- 2. Criar função atualizada que inclui todas as colunas necessárias
CREATE OR REPLACE FUNCTION criar_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, email, nome, tipo_usuario)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
    'morador'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION criar_perfil_usuario();

-- 4. Verificar se o trigger foi criado corretamente
SELECT 
  trigger_name,
  action_timing,
  action_statement,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth'
AND trigger_name = 'on_auth_user_created';
