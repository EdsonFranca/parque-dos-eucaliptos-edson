-- Inserir emails de teste para cadastro
INSERT INTO emails_permitidos (email, nome, chacara) VALUES
  ('salarod01@gmail.com', 'Salomão Rodrigues 01', 'Chácara 01'),
  ('salarod02@gmail.com', 'Salomão Rodrigues 02', 'Chácara 02'),
  ('salarod03@gmail.com', 'Salomão Rodrigues 03', 'Chácara 03')
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  chacara = EXCLUDED.chacara,
  ativo = true;
