'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function DebugPage() {
  const [resultado, setResultado] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

  const testarSupabase = async () => {
    setCarregando(true);
    setResultado(null);
    
    try {
      const response = await fetch('/api/debug/supabase');
      const data = await response.json();
      setResultado(data);
    } catch (error) {
      setResultado({
        status: 'error',
        message: 'Erro ao executar diagnóstico',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf3de] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={() => window.history.back()}
            className="mb-6 flex items-center gap-2 text-[#4a5937]/60 hover:text-[#4a5937] transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          
          <h1 className="text-3xl font-black text-[#1d2a13] mb-4">🔍 Diagnóstico Supabase</h1>
          <p className="text-lg text-[#2c3f1d]/80">
            Teste a conexão e criação de usuários no Supabase
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-lg p-8">
          <button
            onClick={testarSupabase}
            disabled={carregando}
            className="w-full bg-[#4a5937] hover:bg-[#323d24] text-white py-4 rounded-xl font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
          >
            {carregando ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Testando...
              </>
            ) : (
              '🔍 Executar Diagnóstico'
            )}
          </button>

          {resultado && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-[#1d2a13] mb-4">Resultado do Diagnóstico:</h3>
              
              {resultado.status === 'success' ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={20} />
                    <span className="font-bold">✅ Supabase Funcionando!</span>
                  </div>
                  <pre className="text-xs bg-green-100 p-3 rounded-lg overflow-auto">
                    {JSON.stringify(resultado, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle size={20} />
                    <span className="font-bold">❌ Problema Detectado!</span>
                  </div>
                  <pre className="text-xs bg-red-100 p-3 rounded-lg overflow-auto">
                    {JSON.stringify(resultado, null, 2)}
                  </pre>
                </div>
              )}

              {resultado.status === 'error' && resultado.error?.message?.includes('Database error saving new user') && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-4 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={20} />
                    <span className="font-bold">⚠️ Problema Específico Identificado!</span>
                  </div>
                  <div className="text-sm space-y-2">
                    <p><strong>Problema:</strong> "Database error saving new user"</p>
                    <p><strong>Causa Provável:</strong> Configuração do banco de dados ou políticas de RLS</p>
                    <p><strong>Solução:</strong> Verificar configuração do projeto Supabase</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-[2rem] shadow-lg p-6">
          <h3 className="text-lg font-black text-[#1d2a13] mb-4">📋 Próximos Passos:</h3>
          <div className="space-y-3 text-sm text-[#2c3f1d]/70">
            <p>1. Execute o diagnóstico acima</p>
            <p>2. Verifique o resultado</p>
            <p>3. Se houver erro, acesse o dashboard do Supabase</p>
            <p>4. Verifique as configurações do projeto</p>
            <p>5. Corrija o problema identificado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
