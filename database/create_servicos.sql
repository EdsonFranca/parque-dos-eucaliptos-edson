-- =========================================================
-- GUIA: POSTAGEM DE SERVICOS
-- Estrutura + consistencia de dados + RLS
-- Execute no SQL Editor do Supabase
-- =========================================================

-- 1) Tabela principal da guia
CREATE TABLE IF NOT EXISTS public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  prestador_nome TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  contato TEXT NOT NULL,
  foto_url TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Regras de consistencia basica
  CONSTRAINT servicos_titulo_nao_vazio CHECK (length(trim(titulo)) >= 3),
  CONSTRAINT servicos_descricao_nao_vazia CHECK (length(trim(descricao)) >= 10),
  CONSTRAINT servicos_contato_nao_vazio CHECK (length(trim(contato)) >= 5),
  CONSTRAINT servicos_prestador_nome_nao_vazio CHECK (length(trim(prestador_nome)) >= 2),
  CONSTRAINT servicos_foto_nao_vazia CHECK (length(trim(foto_url)) >= 10)
);

COMMENT ON TABLE public.servicos IS 'Postagens de servicos da comunidade';
COMMENT ON COLUMN public.servicos.prestador_id IS 'Auth user id do morador que publicou';
COMMENT ON COLUMN public.servicos.ativo IS 'Soft state para moderacao futura';

-- 2) Trigger para manter updated_at consistente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_servicos_updated_at ON public.servicos;
CREATE TRIGGER trg_servicos_updated_at
BEFORE UPDATE ON public.servicos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 3) Indices para listagem e filtros
CREATE INDEX IF NOT EXISTS idx_servicos_created_at ON public.servicos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON public.servicos(ativo);
CREATE INDEX IF NOT EXISTS idx_servicos_prestador_id ON public.servicos(prestador_id);
CREATE INDEX IF NOT EXISTS idx_servicos_titulo_lower ON public.servicos((lower(titulo)));
CREATE INDEX IF NOT EXISTS idx_servicos_prestador_nome_lower ON public.servicos((lower(prestador_nome)));

-- 4) RLS
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Servicos leitura autenticada" ON public.servicos;
CREATE POLICY "Servicos leitura autenticada"
ON public.servicos
FOR SELECT
USING (auth.role() = 'authenticated' AND ativo = true);

DROP POLICY IF EXISTS "Morador publica proprio servico" ON public.servicos;
CREATE POLICY "Morador publica proprio servico"
ON public.servicos
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
  AND auth.uid() = prestador_id
);

DROP POLICY IF EXISTS "Morador atualiza proprio servico" ON public.servicos;
CREATE POLICY "Morador atualiza proprio servico"
ON public.servicos
FOR UPDATE
USING (
  auth.role() = 'authenticated'
  AND auth.uid() = prestador_id
)
WITH CHECK (
  auth.role() = 'authenticated'
  AND auth.uid() = prestador_id
);

DROP POLICY IF EXISTS "Morador remove proprio servico" ON public.servicos;
CREATE POLICY "Morador remove proprio servico"
ON public.servicos
FOR DELETE
USING (
  auth.role() = 'authenticated'
  AND auth.uid() = prestador_id
);

DROP POLICY IF EXISTS "Admin gerencia todos servicos" ON public.servicos;
CREATE POLICY "Admin gerencia todos servicos"
ON public.servicos
FOR ALL
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1
    FROM public.perfis_moradores pm
    WHERE pm.id = auth.uid()
      AND pm.tipo_usuario = 'admin'
  )
)
WITH CHECK (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1
    FROM public.perfis_moradores pm
    WHERE pm.id = auth.uid()
      AND pm.tipo_usuario = 'admin'
  )
);

-- 5) Realtime para atualizacoes futuras da guia (opcional, mas recomendado)
ALTER PUBLICATION supabase_realtime ADD TABLE public.servicos;
