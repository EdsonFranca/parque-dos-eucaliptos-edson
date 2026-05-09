'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function ZeladorDigital() {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleEnviar = async () => {
    if (!pergunta) return;
    setCarregando(true);
    try {
      const resIA = await fetch('/api/ingestao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: pergunta }),
      });
      const { embedding } = await resIA.json();

      const { data: documentos, error } = await supabase.rpc('match_documentos', {
        query_embedding: embedding,
        match_threshold: 0.1,
        match_count: 1,
      });

      if (documentos && documentos.length > 0) setResposta(documentos[0].content);
      else setResposta("Não encontrei no estatuto.");
    } catch (err) { setResposta("Erro na consulta."); }
    finally { setCarregando(false); }
  };

  return (
    <div className="bg-slate-800 p-4 rounded-2xl border border-blue-500/30 shadow-lg">
      <h3 className="text-blue-400 font-bold text-sm mb-3">🤖 Zelador Digital (Beta)</h3>
      <input
        className="w-full bg-slate-900 p-3 rounded-lg text-sm mb-2 outline-none border border-slate-700 focus:border-blue-500"
        placeholder="Tire uma dúvida sobre as regras..."
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
      />
      <button onClick={handleEnviar} className="w-full bg-blue-600 p-2 rounded-lg text-xs font-bold uppercase tracking-tighter">
        {carregando ? 'Consultando...' : 'Perguntar'}
      </button>
      {resposta && <p className="mt-3 text-xs italic text-slate-300 border-t border-slate-700 pt-2">{resposta}</p>}
    </div>
  );
}
