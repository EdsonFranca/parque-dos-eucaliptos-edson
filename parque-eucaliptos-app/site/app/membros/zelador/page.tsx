'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bot, Search, BookOpen, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FaleComSindicoFloating from '@/components/FaleComSindicoFloating';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ZeladorChat() {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleEnviar = async () => {
    if (!pergunta) return;
    setCarregando(true);
    setResposta('Consultando o estatuto oficial...');

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

      if (error) throw error;

      if (documentos && documentos.length > 0) {
        setResposta(documentos[0].content);
      } else {
        setResposta("Informação não localizada nas normas atuais do condomínio.");
      }
    } catch (err) {
      console.error(err);
      setResposta("Houve um erro na comunicação com a base de dados.");
    } finally {
      setCarregando(false);
    }
  };

  if (!hasMounted) return <div className="min-h-screen bg-[#435334]" />;

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-local bg-center text-slate-900">
      <div className="min-h-screen bg-black/40 backdrop-blur-sm p-4 md:p-8 flex flex-col items-center justify-center">
        <FaleComSindicoFloating />

        {/* Botão Voltar */}
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        {/* Card Principal */}
        <div className="w-full max-w-2xl bg-[#eef0e5]/95 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/50 relative overflow-hidden">

          {/* Elemento Decorativo */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BookOpen size={120} className="text-[#435334]" />
          </div>

          <header className="text-center mb-10 relative">
            <div className="bg-[#435334] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Bot className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-[#435334] uppercase tracking-tighter">Zelador Digital</h1>
            <p className="text-[10px] font-black text-[#435334]/50 uppercase tracking-[0.3em] mt-2">Consulta Inteligente de Normas</p>
          </header>

          <div className="space-y-6 relative">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#435334]/60 uppercase ml-4 tracking-widest">Sua dúvida sobre o condomínio</label>
              <div className="relative">
                <input
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!carregando && pergunta.trim()) {
                        handleEnviar();
                      }
                    }
                  }}
                  placeholder="Ex: Qual o horário de silêncio no domingo?"
                  className="w-full bg-white border-2 border-[#435334]/5 rounded-[2rem] p-6 text-sm font-medium outline-none focus:border-[#435334]/30 transition-all shadow-inner pr-16"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#435334]/20">
                  <Sparkles size={20} />
                </div>
              </div>
            </div>

            <button
              onClick={handleEnviar}
              disabled={carregando}
              className="w-full bg-[#435334] hover:bg-[#2d3a22] text-white font-black py-6 rounded-[2rem] shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 tracking-widest text-sm"
            >
              {carregando ? 'PROCESSANDO...' : 'CONSULTAR ESTATUTO'}
              <Search size={20} />
            </button>

            {resposta && (
              <div className="mt-10 p-8 bg-white/80 rounded-[2.5rem] border border-[#435334]/10 animate-in fade-in zoom-in-95 duration-500 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[#435334]/40">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Parecer Oficial do Condomínio</span>
                </div>
                <p className="text-base font-medium text-slate-700 italic leading-relaxed">
                  "{resposta}"
                </p>
                <div className="mt-6 pt-4 border-t border-[#435334]/5 text-center">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Esta resposta é baseada nos documentos digitais do Parque dos Eucaliptos</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <p className="mt-8 text-white/40 text-[10px] font-bold uppercase tracking-widest">Sistema de Apoio ao Morador &copy; 2026</p>
      </div>
    </div>
  );
}
