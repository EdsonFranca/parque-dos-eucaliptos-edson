'use client';

import { useState, useEffect } from 'react';

export default function TestarEmailsPage() {
  const [resultado, setResultado] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);

  const testarSetup = async () => {
    setCarregando(true);
    try {
      const response = await fetch('/api/admin/setup-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setResultado(data);
    } catch (error: any) {
      setResultado({ error: error.message });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf3de] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black mb-6">Testar Setup de Emails</h1>
        
        <button
          onClick={testarSetup}
          disabled={carregando}
          className="bg-[#4a5937] text-white px-6 py-3 rounded-xl font-black mb-6 disabled:opacity-50"
        >
          {carregando ? 'Executando...' : 'Executar Setup de Emails'}
        </button>

        {resultado && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="font-black mb-4">Resultado:</h2>
            <pre className="text-sm bg-[#f4f7ef] p-4 rounded-xl overflow-auto">
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="font-black mb-4">Emails de Teste:</h2>
          <ul className="space-y-2">
            <li>📧 salarod01@gmail.com → Salomão Rodrigues 01 (Chácara 01)</li>
            <li>📧 salarod02@gmail.com → Salomão Rodrigues 02 (Chácara 02)</li>
            <li>📧 salarod03@gmail.com → Salomão Rodrigues 03 (Chácara 03)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
