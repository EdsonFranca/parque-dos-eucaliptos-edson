-- CRIAR POLÍTICA RLS SIMPLES E FUNCIONAL
-- Primeiro remove qualquer política existente
DROP POLICY IF EXISTS "Apenas admin pode gerenciar sessoes" ON sessoes_ativas;

-- Cria uma política que permite admin ver TUDO na tabela
CREATE POLICY "Admin pode ver todas as sessoes"
    ON sessoes_ativas
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM perfis_moradores 
            WHERE perfis_moradores.id = auth.uid() 
            AND perfis_moradores.tipo_usuario = 'admin'
        )
    );

-- Política para INSERT, UPDATE, DELETE
CREATE POLICY "Admin pode gerenciar todas as sessoes"
    ON sessoes_ativas
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 
            FROM perfis_moradores 
            WHERE perfis_moradores.id = auth.uid() 
            AND perfis_moradores.tipo_usuario = 'admin'
        )
    );

-- Reabilitar RLS
ALTER TABLE sessoes_ativas ENABLE ROW LEVEL SECURITY;
