-- =========================================================
-- TABELAS: TRANSPARENCIA + AGENDA
-- =========================================================

CREATE TABLE IF NOT EXISTS public.transparencia_financeira (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('saldo', 'conta_pagar', 'despesa_diaria', 'despesa_mensal', 'despesa_pontual')),
  valor NUMERIC(12,2) NOT NULL CHECK (valor >= 0),
  mes SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL CHECK (ano BETWEEN 2020 AND 2100),
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agenda_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_evento DATE NOT NULL,
  local TEXT,
  criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transparencia_mes_ano ON public.transparencia_financeira (ano DESC, mes DESC);
CREATE INDEX IF NOT EXISTS idx_agenda_data ON public.agenda_eventos (data_evento ASC);

ALTER TABLE public.transparencia_financeira ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Moradores leem transparencia" ON public.transparencia_financeira;
CREATE POLICY "Moradores leem transparencia" ON public.transparencia_financeira
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins gerenciam transparencia" ON public.transparencia_financeira;
CREATE POLICY "Admins gerenciam transparencia" ON public.transparencia_financeira
FOR ALL
USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.perfis_moradores pm
    WHERE pm.id = auth.uid() AND pm.tipo_usuario = 'admin'
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.perfis_moradores pm
    WHERE pm.id = auth.uid() AND pm.tipo_usuario = 'admin'
  )
);

DROP POLICY IF EXISTS "Moradores leem agenda" ON public.agenda_eventos;
CREATE POLICY "Moradores leem agenda" ON public.agenda_eventos
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins gerenciam agenda" ON public.agenda_eventos;
CREATE POLICY "Admins gerenciam agenda" ON public.agenda_eventos
FOR ALL
USING (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.perfis_moradores pm
    WHERE pm.id = auth.uid() AND pm.tipo_usuario = 'admin'
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.perfis_moradores pm
    WHERE pm.id = auth.uid() AND pm.tipo_usuario = 'admin'
  )
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.transparencia_financeira;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agenda_eventos;
