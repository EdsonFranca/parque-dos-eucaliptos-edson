'use client';

import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LogOut, Bot, Bell, ShieldCheck, MapPin, Search, Sparkles, Heart, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';

// Cliente fora do componente evita o erro de múltiplas instâncias no console
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MuralMembros() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [novoComentario, setNovoComentario] = useState<{ [key: string]: string }>({});
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const dadosPerfil = localStorage.getItem('perfil_morador');
    if (dadosPerfil) setPerfil(JSON.parse(dadosPerfil));

    const fetchData = async () => {
      // 1. Busca Avisos (Posts simples do síndico)
      const { data: avisos } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (avisos) setPosts(avisos);

      // 2. Busca Obras e inclui os comentários relacionados
      const { data: listaObras } = await supabase
        .from('obras')
        .select('*, comentarios_obras(*)')
        .order('created_at', { ascending: false });
      if (listaObras) setObras(listaObras);
    };

    fetchData();
    const intervalo = setInterval(fetchData, 5000);
    return () => clearInterval(intervalo);
  }, []);

  // --- FUNÇÃO DO ZELADOR IA (A QUE ESTAVA FALTANDO) ---
  const perguntarZelador = async () => {
    if (!pergunta) return;
    setCarregandoIA(true);
    setResposta('Consultando estatuto...');

    try {
      const resIA = await fetch('/api/ingestao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: pergunta }),
      });
      const { embedding } = await resIA.json();

      const { data: documentos } = await supabase.rpc('match_documentos', {
        query_embedding: embedding,
        match_threshold: 0.1,
        match_count: 1,
      });

      if (documentos && documentos.length > 0) setResposta(documentos[0].content);
      else setResposta("Não encontrei essa regra nas normas do condomínio.");
    } catch (err) {
      setResposta("Erro ao conectar com o Zelador Digital.");
    } finally {
      setCarregandoIA(false);
    }
  };

  // --- LÓGICA DE CURTIDA ---
  const handleLike = async (obraId: string, likesAtuais: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Faça login para curtir!");

    // Tratar likes como array (formato correto)
    let likes: string[] = [];
    if (likesAtuais) {
      if (Array.isArray(likesAtuais)) {
        likes = likesAtuais;
      } else if (typeof likesAtuais === 'string') {
        // Se for string, tentar fazer parse do JSON
        try {
          const parsed = JSON.parse(likesAtuais);
          likes = Array.isArray(parsed) ? parsed : [likesAtuais];
        } catch {
          likes = likesAtuais ? [likesAtuais] : [];
        }
      }
    }

    if (likes.includes(user.id)) return alert("Você já curtiu esta obra!");

    const novosLikes = [...likes, user.id];
    const { error } = await supabase.from('obras').update({ likes: novosLikes }).eq('id', obraId);

    if (!error) {
      setObras(prev => prev.map(o => o.id === obraId ? { ...o, likes: novosLikes } : o));
    }
  };

const limparZelador = () => {
  setPergunta('');
  setResposta('');
};

  // --- LÓGICA DE COMENTÁRIO ---
  const handleComentar = async (obraId: string) => {
    const texto = novoComentario[obraId];
    if (!texto) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Faça login para comentar!");

    const { error } = await supabase.from('comentarios_obras').insert([
      {
        obra_id: obraId,
        usuario_id: user.id,
        usuario_nome: perfil?.nome || 'Morador',
        texto
      }
    ]);

    if (!error) {
      setNovoComentario({ ...novoComentario, [obraId]: '' });
      // O fetch automático do setInterval atualizará a lista
    }
  };

  if (!hasMounted) return <div className="min-h-screen bg-[#435334]" />;

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-local bg-center text-slate-900">
      <div className="min-h-screen bg-black/40 backdrop-blur-[2px] p-4 md:p-8">

        <Header
          title={`Olá, ${perfil?.nome || 'Morador'}`}
          showNavigation={false}
          onLogout={() => { supabase.auth.signOut(); router.push('/'); }}
        />

        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8 space-y-10">

            {/* SEÇÃO OBRAS */}
            <section className="space-y-6">
              <h2 className="text-white font-black text-sm uppercase tracking-widest ml-4 flex items-center gap-2">
                <ShieldCheck size={18} /> Acompanhamento de Obras
              </h2>
              {obras.length > 0 ? obras.map(obra => {
                // Tratar likes como array (formato correto)
                let likes: string[] = [];
                if (obra.likes) {
                  if (Array.isArray(obra.likes)) {
                    likes = obra.likes;
                  } else if (typeof obra.likes === 'string') {
                    // Se for string, tentar fazer parse do JSON
                    try {
                      const parsed = JSON.parse(obra.likes);
                      likes = Array.isArray(parsed) ? parsed : [obra.likes];
                    } catch {
                      likes = obra.likes ? [obra.likes] : [];
                    }
                  }
                }
                const usuarioCurtiu = perfil && likes.includes(perfil.id);

                return (
                <div key={obra.id} className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in slide-in-from-bottom-4">
                  <img src={obra.imagem_url} className="w-full h-72 object-cover" alt="Obra" />
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-[#435334]/50 uppercase tracking-widest">Status da Obra</span>
                      <span className="font-black text-[#435334]">{obra.progresso}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-3 rounded-full mb-6 overflow-hidden">
                      <div className="bg-green-600 h-full transition-all duration-1000" style={{ width: `${obra.progresso}%` }} />
                    </div>
                    <p className="text-slate-700 font-medium mb-8 leading-relaxed">{obra.descricao}</p>

                    <div className="flex items-center gap-6 mb-8 pt-4 border-t border-slate-100">
                      <button onClick={() => handleLike(obra.id, likes)} className="flex items-center gap-2 text-red-500 font-bold hover:scale-110 transition-transform">
                        <Heart size={20} fill={usuarioCurtiu ? "currentColor" : "none"} /> {likes.length}
                      </button>
                      <div className="flex items-center gap-2 text-slate-400 font-bold">
                        <MessageCircle size={20} /> {obra.comentarios_obras?.length || 0} Comentários
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      {obra.comentarios_obras?.map((c: any) => (
                        <div key={c.id} className="bg-slate-50 p-3 rounded-2xl text-xs border border-slate-100">
                          <span className="font-black text-[#435334] mr-2 uppercase">{c.usuario_nome}:</span>
                          <span className="text-slate-600">{c.texto}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        className="flex-1 bg-white border-2 border-slate-100 p-4 rounded-2xl text-sm outline-none focus:border-[#435334]/30 transition-all"
                        placeholder="Escreva um comentário..."
                        value={novoComentario[obra.id] || ''}
                        onChange={(e) => setNovoComentario({...novoComentario, [obra.id]: e.target.value})}
                      />
                      <button onClick={() => handleComentar(obra.id)} className="bg-[#435334] text-white p-4 rounded-2xl hover:bg-[#2d3a22] transition-all shadow-lg shadow-[#435334]/20">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}) : (
                <p className="text-white/40 italic ml-4 text-sm">Nenhuma obra em andamento.</p>
              )}
            </section>

            {/* SEÇÃO COMUNICADOS */}
            <section className="space-y-6">
              <h2 className="text-white font-black text-sm uppercase tracking-widest ml-4 flex items-center gap-2">
                <Bell size={18} /> Mural de Comunicados
              </h2>
              {posts.map(post => (
                <div key={post.id} className={`bg-white/90 p-7 rounded-[2.5rem] shadow-xl border-l-[10px] ${post.urgente ? 'border-red-500' : 'border-[#435334]'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-black text-xl text-[#435334] uppercase tracking-tight leading-tight">{post.titulo}</h3>
                    {post.urgente && <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg">URGENTE 🚨</span>}
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed">{post.conteudo}</p>
                </div>
              ))}
            </section>
          </div>

          {/* COLUNA ZELADOR IA */}
          <div className="lg:col-span-4">
            <div className="bg-[#eef0e5]/95 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border border-white/50 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#435334] p-2 rounded-xl"><Bot className="text-white" size={20} /></div>
                <div>
                  <h3 className="text-[#435334] font-black text-lg leading-none">Zelador Digital</h3>
                  <span className="text-[9px] font-bold text-[#435334]/40 uppercase tracking-widest">Inteligência Artificial</span>
                </div>
              </div>
              <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  if (!carregandoIA && pergunta.trim()) {
                    perguntarZelador();
                  }
                }}
              >
                <textarea
                  className="w-full bg-white/50 border-2 border-[#435334]/5 rounded-2xl p-4 text-sm mb-4 h-32 outline-none focus:border-[#435334]/20 transition-all resize-none shadow-inner"
                  placeholder="Qual sua dúvida sobre as regras?"
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!carregandoIA && pergunta.trim()) {
                        perguntarZelador();
                      }
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={carregandoIA}
                  className="w-full bg-[#435334] text-white font-black py-5 rounded-2xl hover:bg-[#2d3a22] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#435334]/20 disabled:opacity-50"
                >
                {carregandoIA ? 'Consultando...' : 'ENVIAR PERGUNTA'} <Search size={18} />
                </button>
              </form>
              {resposta && (
                <div className="mt-6 p-5 bg-white/80 rounded-2xl border border-[#435334]/10 animate-in fade-in slide-in-from-top-2 shadow-sm">
                  <p className="text-[10px] font-black text-[#435334]/40 uppercase mb-2 tracking-widest flex items-center gap-2">
                    <ShieldCheck size={12} /> Resposta Oficial:
                  </p>
                  <p className="text-sm font-medium text-slate-700 italic leading-relaxed mb-4">"{resposta}"</p>

                  <button
                    onClick={limparZelador}
                    className="w-full bg-white border-2 border-[#435334]/10 text-[#435334] font-black py-2 rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#435334] hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Entendido, obrigado!
                  </button>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
