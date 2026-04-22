'use client';

import { useState } from 'react';

const sqlCompleto = `-- Execute este SQL no dashboard do Supabase para criar as tabelas necessárias

-- 1. Criar tabela de emails permitidos
CREATE TABLE IF NOT EXISTS emails_permitidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT,
  chacara TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_por UUID REFERENCES auth.users(id),
  ativo BOOLEAN DEFAULT true
);

-- 2. Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_emails_permitidos_email ON emails_permitidos(email);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE emails_permitidos ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança
DROP POLICY IF EXISTS "Apenas admins podem gerenciar emails permitidos" ON emails_permitidos;
CREATE POLICY "Apenas admins podem gerenciar emails permitidos" ON emails_permitidos
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM perfis 
      WHERE tipo_usuario = 'admin'
    )
  );

DROP POLICY IF EXISTS "Qualquer um pode verificar email permitido" ON emails_permitidos;
CREATE POLICY "Qualquer um pode verificar email permitido" ON emails_permitidos
  FOR SELECT USING (true);

-- 5. Inserir emails de teste
INSERT INTO emails_permitidos (email, nome, chacara) VALUES
  ('salarod01@gmail.com', 'Salomão Rodrigues 01', 'Chácara 01'),
  ('salarod02@gmail.com', 'Salomão Rodrigues 02', 'Chácara 02'),
  ('salarod03@gmail.com', 'Salomão Rodrigues 03', 'Chácara 03')
ON CONFLICT (email) DO NOTHING;`;

export default function SetupPage() {
  const [copiado, setCopiado] = useState(false);

  const copiarSQL = async () => {
    try {
      await navigator.clipboard.writeText(sqlCompleto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      alert('Erro ao copiar SQL');
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf3de] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#1d2a13] mb-4">⚙️ Setup do Sistema</h1>
          <p className="text-lg text-[#2c3f1d]/80">
            Siga os passos abaixo para configurar os emails de teste
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Passo 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-black text-[#1d2a13] mb-4 flex items-center gap-2">
              <span className="text-2xl">1️⃣</span>
              Abrir Dashboard Supabase
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-[#2c3f1d]/70">
                Acesse o <strong>dashboard do Supabase</strong> do seu projeto
              </p>
              <div className="bg-[#f4f7ef] p-4 rounded-xl">
                <p className="text-xs font-mono text-[#4a5937]">
                  https://supabase.com/dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-black text-[#1d2a13] mb-4 flex items-center gap-2">
              <span className="text-2xl">2️⃣</span>
              SQL Editor
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-[#2c3f1d]/70">
                Vá em <strong>SQL Editor</strong> no menu lateral
              </p>
              <div className="bg-[#f4f7ef] p-4 rounded-xl">
                <p className="text-xs text-[#4a5937]">SQL Editor</p>
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-black text-[#1d2a13] mb-4 flex items-center gap-2">
              <span className="text-2xl">3️⃣</span>
              Copiar SQL
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-[#2c3f1d]/70">
                Clique no botão para copiar o SQL completo
              </p>
              <button
                onClick={copiarSQL}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all ${
                  copiado 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#4a5937] text-white hover:bg-[#323d24]'
                }`}
              >
                {copiado ? '✅ Copiado!' : '📋 Copiar SQL Completo'}
              </button>
            </div>
          </div>

          {/* Passo 4 */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-black text-[#1d2a13] mb-4 flex items-center gap-2">
              <span className="text-2xl">4️⃣</span>
              Colar e Executar
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-[#2c3f1d]/70">
                Cole o SQL no editor e clique em <strong>Run</strong>
              </p>
              <div className="bg-[#f4f7ef] p-4 rounded-xl">
                <p className="text-xs text-[#4a5937]">Run ▶️</p>
              </div>
            </div>
          </div>

        </div>

        {/* SQL Completo */}
        <div className="mt-8 bg-[#1d2a13] text-white p-6 rounded-2xl">
          <h3 className="text-lg font-black mb-4">📄 SQL Completo (Clique para copiar)</h3>
          <pre 
            onClick={copiarSQL}
            className="bg-black/20 p-4 rounded-xl overflow-x-auto text-xs font-mono cursor-pointer hover:bg-black/30 transition-colors"
          >
            {sqlCompleto}
          </pre>
        </div>

        {/* Emails de Teste */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-black text-[#1d2a13] mb-4">📧 Emails de Teste Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#e4eed7] p-4 rounded-xl text-center">
              <p className="text-xs font-mono text-[#4a5937] mb-2">salarod01@gmail.com</p>
              <p className="text-sm font-black">Salomão Rodrigues 01</p>
              <p className="text-xs text-[#2c3f1d]/70">Chácara 01</p>
            </div>
            <div className="bg-[#e4eed7] p-4 rounded-xl text-center">
              <p className="text-xs font-mono text-[#4a5937] mb-2">salarod02@gmail.com</p>
              <p className="text-sm font-black">Salomão Rodrigues 02</p>
              <p className="text-xs text-[#2c3f1d]/70">Chácara 02</p>
            </div>
            <div className="bg-[#e4eed7] p-4 rounded-xl text-center">
              <p className="text-xs font-mono text-[#4a5937] mb-2">salarod03@gmail.com</p>
              <p className="text-sm font-black">Salomão Rodrigues 03</p>
              <p className="text-xs text-[#2c3f1d]/70">Chácara 03</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
