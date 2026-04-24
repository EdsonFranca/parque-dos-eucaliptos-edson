-- =========================================================
-- MIGRACAO: chave de configuracao da guia de servicos
-- =========================================================

INSERT INTO public.configuracoes_gerais (chave, valor)
VALUES ('servicos_ativo', true)
ON CONFLICT (chave) DO UPDATE
SET valor = EXCLUDED.valor;
