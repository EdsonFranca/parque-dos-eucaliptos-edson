'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  LogOut, Megaphone, HardHat, Camera, Trash2,
  ArrowRight, ShieldCheck, Clock, Loader2, Eraser, Heart
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardAdmin() {
  const [galeria, setGaleria] = useState<any[]>([]);
  const [avisos, setAvisos] = useState<any[]>([]);
  const [descricao, setDescricao] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [progressoNovo, setProgressoNovo] = useState(50);
  const [tituloAviso, setTituloAviso] = useState('');
  const [msgAviso, setMsgAviso] = useState('');
  const [isUrgente, setIsUrgente] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    const fetchData = async () => {
      // Busca Avisos
      const { data: ads } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (ads) setAvisos(ads);

      // Busca Obras com Comentários
      const { data: obs } = await supabase.from('obras').select('*, comentarios_obras(*)').order('created_at', { ascending: false });
      if (obs) setGaleria(obs);
    };
    fetchData();
    const intervalo = setInterval(fetchData, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(arquivo);
    }
  };

  // Função para atualizar progresso no banco (chamada ao soltar o mouse)
  const atualizarProgressoNoBanco = async (id: string, novoValor: number) => {
    const { error } = await supabase
      .from('obras')
      .update({ progresso: novoValor })
      .eq('id', id);

    if (error) {
      alert("Erro ao salvar no banco: " + error.message);
    }
  };

  const handlePublicarAviso = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tituloAviso || !msgAviso) return alert("Preencha título e conteúdo!");

    const { data, error } = await supabase
      .from('posts')
      .insert([{ titulo: tituloAviso, conteudo: msgAviso, autor: 'Síndico', urgente: isUrgente }])
      .select();

    if (!error && data) {
      setAvisos(prev => [data[0], ...prev]);
      setTituloAviso(''); setMsgAviso(''); setIsUrgente(false);
      alert("✅ Aviso publicado!");
    }
  };

  const handlePublicarObra = async () => {
    if (!descricao || !preview) return alert("Adicione uma foto e uma descrição!");
    setCarregando(true);

    const { data, error } = await supabase
      .from('obras')
      .insert([{ descricao, imagem_url: preview, progresso: progressoNovo, likes: [] }])
      .select();

    if (!error && data) {
      setGaleria(prev => [data[0], ...prev]);
      setDescricao(''); setPreview(null); setProgressoNovo(50);
      alert("✅ Obra publicada!");
    }
    setCarregando(false);
  };

  const deletarAviso = async (id: any) => {
    if (!confirm("Remover este aviso?")) return;
    await supabase.from('posts').delete().eq('id', id);
    setAvisos(prev => prev.filter(a => a.id !== id));
  };

  const deletarObra = async (id: any) => {
    if (!confirm("Remover esta obra?")) return;
    await supabase.from('obras').delete().eq('id', id);
    setGaleria(prev => prev.filter(obraItem => obraItem.id !== id));
  };

  const limparFormularios = () => {
    setDescricao(''); setPreview(null); setProgressoNovo(50);
    setTituloAviso(''); setMsgAviso(''); setIsUrgente(false);
  };

  if (!hasMounted) return <div className="min-h-screen bg-[#435334]" />;

  return (
    <div className="min-h-screen bg-[url('https://unsplash.com')] bg-cover bg-fixed bg-center">
      <div className="min-h-screen bg-black/40 backdrop-blur-[2px] p-4 md:p-8">

        {/* HEADER */}
        <header className="max-w-7xl mx-auto mb-10 flex justify-between items-center bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-[#435334] p-2 rounded-xl"><ShieldCheck className="text-white" size={24} /></div>
            <div>
              <h1 className="text-xl font-black text-[#435334] uppercase tracking-tighter">Painel do Síndico</h1>
              <p className="text-[9px] font-bold text-[#435334]/50 uppercase tracking-widest leading-none">Administração Premium</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={limparFormularios} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2 rounded-full font-bold text-xs hover:bg-white transition-all uppercase tracking-widest">
              <Eraser size={14} /> Limpar
            </button>
            <button onClick={() => router.push('/')} className="flex items-center gap-2 bg-red-500/10 text-red-600 px-5 py-2 rounded-full font-bold text-xs hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* COLUNA ESQUERDA (CRIAÇÃO) */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-[#eef0e5]/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#435334] p-2 rounded-xl text-white"><HardHat size={20} /></div>
                <h2 className="text-xl font-black text-[#435334] uppercase tracking-tight">Postar Obra</h2>
              </div>
              <textarea className="w-full bg-white border-none rounded-2xl p-4 text-sm mb-4 h-24 outline-none shadow-inner" placeholder="O que avançou hoje?" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              <div className="mb-6">
                <label className="text-[10px] font-black text-[#435334]/60 uppercase tracking-widest leading-none">Progresso Inicial: {progressoNovo}%</label>
                <input type="range" className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-[#435334] mt-2" value={progressoNovo} onChange={(e) => setProgressoNovo(Number(e.target.value))} />
              </div>
              <label className="block border-2 border-dashed border-[#435334]/20 p-6 rounded-2xl cursor-pointer text-center hover:bg-white/50 mb-6 relative">
                {preview ? <img src={preview} className="max-h-40 mx-auto rounded-xl shadow-lg" alt="preview" /> : <div className="py-4 opacity-40"><Camera size={32} className="mx-auto" /></div>}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              <button onClick={handlePublicarObra} disabled={carregando} className="w-full bg-[#435334] text-white font-black py-4 rounded-2xl hover:bg-[#2d3a22] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#435334]/20">
                {carregando ? <Loader2 className="animate-spin" /> : 'PUBLICAR OBRA'} <ArrowRight size={18} />
              </button>
            </section>

            <section className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50">
               <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#435334] p-2 rounded-xl text-white"><Megaphone size={20} /></div>
                <h2 className="text-xl font-black text-[#435334] uppercase tracking-tight">Novo Comunicado</h2>
              </div>
              <input type="text" placeholder="Título" className="w-full bg-slate-50 rounded-xl p-4 mb-4 font-bold outline-none border border-slate-100" value={tituloAviso} onChange={(e) => setTituloAviso(e.target.value)} />
              <textarea placeholder="Mensagem para o mural..." className="w-full bg-slate-50 rounded-xl p-4 mb-4 h-24 outline-none border border-slate-100" value={msgAviso} onChange={(e) => setMsgAviso(e.target.value)} />
              <label className="flex items-center gap-3 p-4 bg-red-50/50 rounded-2xl cursor-pointer mb-6 border border-red-100">
                <input type="checkbox" checked={isUrgente} onChange={(e) => setIsUrgente(e.target.checked)} className="w-5 h-5 accent-red-600" />
                <span className="font-black text-red-600 text-[10px] uppercase tracking-widest">Aviso Urgente 🚨</span>
              </label>
              <button onClick={handlePublicarAviso} className="w-full bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-lg">POSTAR AVISO</button>
            </section>
          </div>

          {/* COLUNA DIREITA (GESTÃO) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-[0.3em] ml-4"><Clock size={16} /> Monitoramento em Tempo Real</h3>

            <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* MAPEAMENTO DE OBRAS */}
              {galeria.map((obraItem) => (
                <div key={obraItem.id} className="bg-white/95 p-6 rounded-[2rem] shadow-xl relative animate-in fade-in slide-in-from-right-4 border border-white/20">
                  <button onClick={() => deletarObra(obraItem.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <div className="flex gap-6 items-start">
                    <img src={obraItem.imagem_url} className="w-24 h-24 rounded-2xl object-cover shadow-md" alt="obra" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-2 pr-6">
                        <span className="text-[10px] font-black text-[#435334] uppercase tracking-widest">Progresso: {obraItem.progresso}%</span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest">
                           <Heart size={10} fill="currentColor" /> {obraItem.likes?.length || 0} Curtidas
                        </div>
                      </div>

                      {/* BARRA DE PROGRESSO EDITÁVEL SEM DELAY */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={obraItem.progresso}
                        onChange={(e) => {
                          const novoV = Number(e.target.value);
                          setGaleria(prev => prev.map(oItem =>
                            oItem.id === obraItem.id ? { ...oItem, progresso: novoV } : oItem
                          ));
                        }}
                        onMouseUp={(e: any) => atualizarProgressoNoBanco(obraItem.id, Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-green-600 mb-3"
                      />

                      <p className="text-xs text-slate-500 font-medium mb-4">{obraItem.descricao}</p>

                      {/* COMENTÁRIOS DOS MORADORES */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">Feedback dos Moradores</p>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                          {obraItem.comentarios_obras?.length > 0 ? obraItem.comentarios_obras.map((c: any) => (
                            <div key={c.id} className="text-[10px] leading-tight flex flex-col gap-0.5">
                              <span className="font-bold text-[#435334] uppercase text-[9px]">{c.usuario_nome}:</span>
                              <span className="text-slate-600 italic">"{c.texto}"</span>
                            </div>
                          )) : <p className="text-[10px] text-slate-300 italic">Nenhum comentário ainda.</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* MAPEAMENTO DE AVISOS */}
              {avisos.map((avisoItem) => (
                <div key={avisoItem.id} className={`bg-white/95 p-6 rounded-[2rem] shadow-xl border-l-[10px] relative ${avisoItem.urgente ? 'border-red-500' : 'border-[#435334]'}`}>
                  <button onClick={() => deletarAviso(avisoItem.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <h4 className="font-black text-[#435334] uppercase text-sm mb-1">{avisoItem.titulo}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{avisoItem.conteudo}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
