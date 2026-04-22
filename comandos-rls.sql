-- DESATIVAR/CONFIGURAR O RLS PARA FUNCIONAR COM O MORADOR 

-- 1. Políticas Válidas para Configurações (Ler e Editar como Admin)
DROP POLICY IF EXISTS "Leitura irrestrita para configuracoes" ON configuracoes_gerais;
DROP POLICY IF EXISTS "Admin pode tudo em configuracoes" ON configuracoes_gerais;
CREATE POLICY "Leitura irrestrita para configuracoes" ON configuracoes_gerais FOR SELECT USING (true);
CREATE POLICY "Admin pode tudo em configuracoes" ON configuracoes_gerais FOR ALL USING (true);

-- 2. Políticas para os Classificados (Ler, Inserir e Apagar)
DROP POLICY IF EXISTS "Leitura irrestrita para classificados ativos" ON classificados;
DROP POLICY IF EXISTS "Dono pode gerenciar seus classificados" ON classificados;
CREATE POLICY "Leitura irrestrita para classificados ativos" ON classificados FOR SELECT USING (true);
CREATE POLICY "Dono pode gerenciar seus classificados" ON classificados FOR ALL USING (auth.uid() = vendedor_id) WITH CHECK (auth.uid() = vendedor_id);

-- 3. Políticas das Conversas (Chats)
DROP POLICY IF EXISTS "Participantes do chat podem ver" ON chats_classificados;
DROP POLICY IF EXISTS "Usuários podem criar chats" ON chats_classificados;
DROP POLICY IF EXISTS "Permissao Total Participante Chat" ON chats_classificados;
CREATE POLICY "Permissao Total Participante Chat" ON chats_classificados FOR ALL USING (auth.uid() = interessado_id OR auth.uid() = vendedor_id);

-- 4. Políticas das Mensagens do Chat 
DROP POLICY IF EXISTS "Participantes podem ler mensagens" ON mensagens_chats;
DROP POLICY IF EXISTS "Remetente pode enviar mensagens" ON mensagens_chats;
DROP POLICY IF EXISTS "Permissao Total Participante Mensagens" ON mensagens_chats;
CREATE POLICY "Permissao Total Participante Mensagens" ON mensagens_chats FOR ALL USING (
  EXISTS (
    SELECT 1 FROM chats_classificados 
    WHERE id = mensagens_chats.chat_id AND (interessado_id = auth.uid() OR vendedor_id = auth.uid())
  )
);

-- 5. Ativação de Sincronia em Tempo Real (Realtime)
-- Se acusar que a tabela já está na publicação, pode ignorar o erro.
ALTER PUBLICATION supabase_realtime ADD TABLE chats_classificados;
ALTER PUBLICATION supabase_realtime ADD TABLE mensagens_chats;
