-- Corrigir política RLS para permitir que admin veja todas as sessões
-- Primeiro remove a política atual
DROP POLICY IF EXISTS "Apenas admin pode gerenciar sessoes" ON sessoes_ativas;

-- Cria política corrigida que permite admin ver todas as sessões
CREATE POLICY "Apenas admin pode gerenciar sessoes"
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

-- Desabilitar RLS temporariamente para testar (se necessário)
-- ALTER TABLE sessoes_ativas DISABLE ROW LEVEL SECURITY;
