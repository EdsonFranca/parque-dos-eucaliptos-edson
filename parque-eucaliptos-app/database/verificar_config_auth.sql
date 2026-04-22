-- VERIFICAR CONFIGURAÇÕES DO SUPABASE AUTH

-- Verificar se há usuários com o email que está dando erro
SELECT 
  id,
  email,
  created_at,
  updated_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'salarod01@gmail.com';

-- Verificar todos os usuários recentes (últimas 24 horas)
SELECT 
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
