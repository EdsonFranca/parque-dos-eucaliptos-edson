-- CRIAR POLÍTICA RLS PARA TABELA OBRAS

-- Permitir que qualquer usuário autenticado possa ler obras
CREATE POLICY "obras_select_policy" ON obras
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir que qualquer usuário autenticado possa atualizar obras (incluindo curtidas)
CREATE POLICY "obras_update_policy" ON obras
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Permitir que qualquer usuário autenticado possa inserir obras
CREATE POLICY "obras_insert_policy" ON obras
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir que administradores possam deletar obras
CREATE POLICY "obras_delete_policy" ON obras
    FOR DELETE USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM perfis_moradores 
            WHERE perfis_moradores.id = auth.uid() 
            AND perfis_moradores.tipo_usuario = 'admin'
        )
    );
