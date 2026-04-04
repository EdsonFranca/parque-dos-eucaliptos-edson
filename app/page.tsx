'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { TreePine, Users, ShieldCheck, Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const router = useRouter();
  const [statusIA, setStatusIA] = useState('Aguardando...');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    async function inicializarIA() {
      try {
        setStatusIA('Sincronizando Zelador...');
        const regras = [
          "Mudanças: Agendar com 48h de antecedência, seg-sex, 08h às 17h.",
          "Piscina: Aberta ter-dom, 09h às 21h. Proibido vidro.",
          "Silêncio: Proibido barulho das 22h às 08h. Sujeito a multa."
        ];

        for (const texto of regras) {
          const response = await fetch('/api/ingestao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto }),
          });
          const { embedding } = await response.json();
          await supabase.from('documentos_condominio').upsert({
            content: texto,
            embedding: embedding,
          }, { onConflict: 'content' });
        }
        setStatusIA('Zelador Digital Pronto');
      } catch (err) {
        setStatusIA('Erro de Conexão');
      }
    }
    inicializarIA();
  }, []);

  if (!hasMounted) return <div className="min-h-screen bg-[#435334]" />;

  return (
    <div className="min-h-screen bg-[url('https://unsplash.com')] bg-cover bg-fixed bg-center text-slate-900 font-sans">
      {/* Overlay de Gradiente */}
      <div className="min-h-screen bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 relative">

        {/* Status da IA Superior */}
        <div className="fixed top-8 right-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-3 shadow-2xl transition-all animate-in fade-in slide-in-from-top-4">
          {statusIA.includes('Erro') ? (
            <XCircle className="text-red-400" size={14} />
          ) : statusIA.includes('Pronto') ? (
            <CheckCircle2 className="text-green-400" size={14} />
          ) : (
            <Loader2 className="text-white animate-spin" size={14} />
          )}
          <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
            {statusIA}
          </span>
        </div>

        {/* Conteúdo Central */}
        <main className="max-w-4xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">

          <div className="space-y-4">
            <div className="bg-white/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20 shadow-2xl">
              <TreePine className="text-white" size={40} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none italic">
              Parque dos <br/> <span className="text-white/80">Eucaliptos</span>
            </h1>
            <p className="text-white/60 font-bold text-xs md:text-sm uppercase tracking-[0.4em] max-w-md mx-auto leading-relaxed">
              Tecnologia e Natureza em Harmonia com a sua família
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">

            {/* Botão Morador */}
            <button
              onClick={() => router.push('/membros/login')}
              className="group relative bg-[#eef0e5] p-8 rounded-[2.5rem] shadow-2xl transition-all hover:translate-y-[-4px] hover:shadow-[#435334]/20 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="bg-[#435334] p-3 rounded-2xl text-white group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <div>
                  <span className="block text-xl font-black text-[#435334] uppercase tracking-tight">Sou Morador</span>
                  <span className="text-[10px] font-bold text-[#435334]/40 uppercase tracking-widest">Acesso ao Mural & IA</span>
                </div>
              </div>
              <Sparkles className="absolute -bottom-4 -right-4 text-[#435334]/5 opacity-0 group-hover:opacity-100 transition-opacity" size={100} />
            </button>

            {/* Botão Síndico */}
            <button
              onClick={() => router.push('/admin/login')}
              className="group relative bg-[#435334] p-8 rounded-[2.5rem] shadow-2xl transition-all hover:translate-y-[-4px] border border-white/10 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="bg-white/10 p-3 rounded-2xl text-white group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <span className="block text-xl font-black text-white uppercase tracking-tight">Área do Síndico</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Gestão Administrativa</span>
                </div>
              </div>
              <ShieldCheck className="absolute -bottom-4 -right-4 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity" size={100} />
            </button>

          </div>

          {/* Footer */}
          <footer className="pt-12">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.5em]">
              Residencial de Alto Padrão • 2026
            </p>
          </footer>

        </main>
      </div>
    </div>
  );
}
