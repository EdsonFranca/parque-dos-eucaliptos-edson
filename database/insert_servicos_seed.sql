-- =========================================================
-- SEED: GUIA POSTAGEM DE SERVICOS
-- Objetivo: popular dados iniciais para homologacao
-- =========================================================

-- Importante:
-- 1) Rode primeiro o script: database/create_servicos.sql
-- 2) Este seed eh idempotente por combinacao (prestador_nome + titulo + contato)

-- Garantir unicidade logica para evitar duplicacoes do seed
CREATE UNIQUE INDEX IF NOT EXISTS uq_servicos_seed_logico
ON public.servicos (prestador_nome, titulo, contato);

INSERT INTO public.servicos (
  prestador_id,
  prestador_nome,
  titulo,
  descricao,
  contato,
  foto_url,
  ativo
)
VALUES
(
  NULL,
  'Marcos Almeida',
  'Jardinagem Residencial',
  'Corte de grama, poda de arbustos e manutenção periódica de jardins e canteiros.',
  '(11) 98888-1201',
  'https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=1200&auto=format&fit=crop',
  true
),
(
  NULL,
  'Ana Clara',
  'Aulas de Violão',
  'Aulas para iniciantes e intermediários, com foco em repertório popular e prática semanal.',
  'anaclara.violao@email.com',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',
  true
),
(
  NULL,
  'Fernanda Souza',
  'Design de Interiores',
  'Consultoria para organização de ambientes, escolha de paleta de cores e otimização de espaço.',
  '(11) 97777-4500',
  'https://images.unsplash.com/photo-1616594039964-3f5f2f6f64a9?q=80&w=1200&auto=format&fit=crop',
  true
),
(
  NULL,
  'Ricardo Lima',
  'Eletricista Residencial',
  'Instalações elétricas, troca de disjuntores, revisão de circuitos e suporte emergencial.',
  '(11) 96666-3322',
  'https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1200&auto=format&fit=crop',
  true
),
(
  NULL,
  'Patricia Nunes',
  'Confeitaria por Encomenda',
  'Bolos e doces para aniversários e confraternizações, com cardápio sob demanda.',
  'patricia.doces@email.com',
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=1200&auto=format&fit=crop',
  true
)
ON CONFLICT (prestador_nome, titulo, contato) DO UPDATE
SET
  descricao = EXCLUDED.descricao,
  foto_url = EXCLUDED.foto_url,
  ativo = EXCLUDED.ativo,
  updated_at = now();

-- Consulta de conferência (opcional)
-- SELECT id, prestador_nome, titulo, contato, ativo, created_at
-- FROM public.servicos
-- ORDER BY created_at DESC;
