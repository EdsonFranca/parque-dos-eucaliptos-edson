-- =========================================================
-- MIGRACAO: adicionar foto obrigatoria em servicos existentes
-- Execute este script se a tabela servicos ja existia
-- =========================================================

ALTER TABLE public.servicos
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Preenche linhas antigas sem foto para permitir aplicar NOT NULL
UPDATE public.servicos
SET foto_url = 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop'
WHERE foto_url IS NULL OR length(trim(foto_url)) = 0;

ALTER TABLE public.servicos
ALTER COLUMN foto_url SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'servicos_foto_nao_vazia'
  ) THEN
    ALTER TABLE public.servicos
    ADD CONSTRAINT servicos_foto_nao_vazia CHECK (length(trim(foto_url)) >= 10);
  END IF;
END $$;
