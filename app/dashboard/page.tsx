"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Calendar, History, Bookmark, Settings, MessageSquare, Lightbulb, Droplets, AlertCircle, Bot, CheckCircle2, LogOut, Megaphone, FileText, Heart } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [carregandoIA, setCarregandoIA] = useState(false);

  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  const [estatutoTexto, setEstatutoTexto] = useState<string | null>(null);
  const [obras, setObras] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const numeroWhatsApp = process.env.NEXT_PUBLIC_SINDICO_WHATSAPP_NUMERO?.replace(/\D/g, '') || '';
  const mensagemWhatsApp = `Olá${perfil?.nome ? `, sou ${perfil.nome}` : ''}, gostaria de falar com o síndico.`;
  const hrefWhatsApp = numeroWhatsApp ? `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagemWhatsApp)}` : '';

  // Função para buscar dados (movida para fora do useEffect)
  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
      return;
    }

    const { data: perfilData } = await supabase
      .from('perfis_moradores')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (perfilData) {
      setPerfil(perfilData);
    }

    // Buscar Estatuto Oficial
    const { data: listaEstatuto } = await supabase.from('posts').select('*').eq('autor', 'ESTATUTO').order('created_at', { ascending: false }).limit(1);
    if (listaEstatuto && listaEstatuto.length > 0) {
      setEstatutoTexto(listaEstatuto[0].conteudo);
    }

    // Buscar obras e posts simultaneamente
    try {
      console.log('Buscando obras...');
      const { data: listaObras, error: errorObras } = await supabase.from('obras').select('*').order('created_at', { ascending: false });
      
      if (errorObras) {
        console.error('Erro ao buscar obras:', errorObras);
      } else {
        console.log('Obras encontradas:', listaObras?.length || 0);
        if (listaObras) setObras(listaObras);
      }

      console.log('Buscando posts...');
      const { data: listaPosts, error: errorPosts } = await supabase.from('posts').select('*').neq('autor', 'ESTATUTO').order('created_at', { ascending: false });
      
      if (errorPosts) {
        console.error('Erro ao buscar posts:', errorPosts);
      } else {
        console.log('Posts encontrados:', listaPosts?.length || 0);
        if (listaPosts) setPosts(listaPosts);
      }
    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
    }
  };

  // Função para curtir/descurtir obra
  const toggleLike = async (obraId: string) => {
    try {
      if (!perfil) {
        console.log('Usuário não logado');
        return;
      }

      const obra = obras.find(o => o.id === obraId);
      if (!obra) {
        console.log('Obra não encontrada:', obraId);
        return;
      }

      // Padronizar likes como array de strings
      let likes: string[] = [];
      if (obra.likes) {
        if (Array.isArray(obra.likes)) {
          likes = obra.likes.filter((id: any) => typeof id === 'string');
        } else if (typeof obra.likes === 'string') {
          try {
            const parsed = JSON.parse(obra.likes);
            likes = Array.isArray(parsed) ? parsed.filter((id: any) => typeof id === 'string') : [];
          } catch {
            likes = obra.likes ? [obra.likes] : [];
          }
        }
      }

      const usuarioId = perfil.id;
      const jaCurtiu = likes.includes(usuarioId);

      console.log('Tentando curtir obra:', obraId, 'Já curtiu:', jaCurtiu);

      const novosLikes = jaCurtiu
        ? likes.filter(id => id !== usuarioId)
        : [...likes, usuarioId];

      setObras(prev => prev.map(o =>
        o.id === obraId ? { ...o, likes: novosLikes } : o
      ));

      const { error } = await supabase
        .from('obras')
        .update({ likes: novosLikes })
        .eq('id', obraId)
        .select(); // Retorna os dados atualizados

      if (error) {
        console.error('Erro ao atualizar likes:', error);
        setObras(prev => prev.map(o =>
          o.id === obraId ? { ...o, likes } : o
        ));
        return;
      }

      console.log('Likes atualizados com sucesso:', novosLikes.length);
    } catch (error) {
      console.error('Erro ao curtir obra:', error);
      const obraOriginal = obras.find(o => o.id === obraId);
      setObras(prev => prev.map(o =>
        o.id === obraId ? { ...o, likes: obraOriginal?.likes || [] } : o
      ));
    }
  };

  useEffect(() => {
    fetchData();
    
    // Configurar Realtime para atualizações instantâneas das obras
    const obrasSubscription = supabase
      .channel('obras_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'obras'
        },
        (payload) => {
          console.log('Mudança em obras detectada:', payload);
          
          if (payload.eventType === 'UPDATE') {
            // Atualizar apenas a obra modificada
            setObras(prev => prev.map(obra => 
              obra.id === payload.new.id ? { ...obra, ...payload.new } : obra
            ));
          } else if (payload.eventType === 'INSERT') {
            // Adicionar nova obra no início
            setObras(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            // Remover obra deletada
            setObras(prev => prev.filter(obra => obra.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Polling otimizado para atualizações (evitar multiplicação)
    const intervalo = setInterval(async () => {
      console.log('Verificando atualizações...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Buscar apenas obras atualizadas nos últimos 10 segundos
      const dezSegundosAtras = new Date(Date.now() - 10000).toISOString();
      const { data: obrasAtualizadas } = await supabase
        .from('obras')
        .select('id, likes, updated_at')
        .gte('updated_at', dezSegundosAtras)
        .order('updated_at', { ascending: false });

      if (obrasAtualizadas && obrasAtualizadas.length > 0) {
        console.log('Atualizando', obrasAtualizadas.length, 'obras');
        setObras(prev => {
          const novasObras = [...prev];
          obrasAtualizadas.forEach(obraAtualizada => {
            const index = novasObras.findIndex(o => o.id === obraAtualizada.id);
            if (index !== -1) {
              // Garantir que likes seja sempre um array
              const likesNormalizados = obraAtualizada.likes ? 
                (Array.isArray(obraAtualizada.likes) ? obraAtualizada.likes : []) : [];
              novasObras[index] = { ...novasObras[index], ...obraAtualizada, likes: likesNormalizados };
            }
          });
          return novasObras;
        });
      }
    }, 5000); // Aumentado para 5 segundos para reduzir carga

    return () => {
      clearInterval(intervalo);
      supabase.removeChannel(obrasSubscription);
    };
  }, [router]);

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

      if (documentos && documentos.length > 0) {
        setResposta(documentos[0].content);
      } else {
        setResposta("Não encontrei essa regra nas normas do condomínio.");
      }
    } catch (err) {
      setResposta("Erro ao conectar com o Zelador Digital.");
    } finally {
      setCarregandoIA(false);
    }
  };

  const limparZelador = () => {
    setPergunta('');
    setResposta('');
  };

  const handleLogout = async () => {
    // Registrar logout para encerrar sessão ativa
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch('/api/admin/sessoes', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            userId: session.user.id
          })
        });
      }
    } catch (error) {
      console.warn('Não foi possível encerrar sessão ativa:', error);
    }

    localStorage.removeItem("auth");
    localStorage.removeItem("perfil_morador");
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <div className="flex h-screen bg-[#eaf3de] text-[#2c3f1d] font-sans overflow-hidden">
      {/* 75% LEFT DASHBOARD */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        
        <Header
          activeTab={abaAtiva}
          onTabChange={setAbaAtiva}
          onLogout={handleLogout}
        />

        {/* Dashboard Main Content */}
        {abaAtiva === 'dashboard' ? (
        <main className="flex-1 px-10 pb-10 space-y-10">
          
          {/* HERO (Mantendo as boas-vindas originais ajustadas) */}
          <section className="relative h-[320px] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop" 
              className="absolute w-full h-full object-cover" 
              alt="Eucaliptos Background" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2c3f1d]/90 via-[#2c3f1d]/60 to-transparent p-12 flex flex-col justify-center">
              <div>
                <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-[0.1em] mb-4 border border-white/20">
                  BEM-VINDO AO CORAÇÃO VERDE
                </span>
                
                <h1 className="text-4xl md:text-5xl font-black max-w-2xl text-white leading-tight mb-8">
                  Que bom ter você aqui, <br/>
                  <span className="italic text-[#eef0e5]">{perfil?.nome || 'Morador'}</span>!
                </h1>

                <div className="flex gap-4">
                  <button className="bg-[#4a5937] hover:bg-[#344026] text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg transition-colors">
                    Ver Benfeitorias
                  </button>
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-bold border border-white/30 transition-colors">
                    Agenda Cultural
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* LOWER GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* LEFT 2 COLUMNS (8 of 12) */}
            <div className="col-span-8 space-y-10">
               
               {/* Obras do Parque */}
               <div>
                  <div className="flex items-end justify-between mb-6">
                    <h2 className="text-2xl font-bold">Acompanhamento de Obras</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {obras.length > 0 ? obras.map(obra => {
                      // Padronizar likes como array de strings
                      let likes: string[] = [];
                      if (obra.likes) {
                        if (Array.isArray(obra.likes)) {
                          likes = obra.likes.filter((id: any) => typeof id === 'string');
                        } else if (typeof obra.likes === 'string') {
                          try {
                            const parsed = JSON.parse(obra.likes);
                            likes = Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : [];
                          } catch {
                            likes = obra.likes ? [obra.likes] : [];
                          }
                        }
                      }
                      const usuarioCurtiu = perfil && likes.includes(perfil.id);
                      
                      return (
                      <div key={obra.id} className="bg-transparent group cursor-pointer w-full">
                        <div className="rounded-[2rem] overflow-hidden mb-4 shadow-sm h-48 relative border-[3px] border-transparent group-hover:border-white transition-all bg-white/50">
                          {obra.imagem_url ? (
                             <img src={obra.imagem_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Obra"/>
                          ) : (
                             <div className="w-full h-full flex justify-center items-center"><span className="text-slate-400">Sem Imagem</span></div>
                          )}
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase text-[#4a5937] tracking-widest shadow-sm">
                             {obra.progresso}% Concluída
                          </div>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-[#1d2a13] line-clamp-1">{obra.descricao.split('.')[0]}</h3>
                        <p className="text-sm text-[#2c3f1d]/70 leading-relaxed line-clamp-2">{obra.descricao}</p>
                        <div className="w-full bg-[#dbeaeb] h-1.5 rounded-full overflow-hidden mt-4">
                          <div className="bg-[#4a5937] h-full transition-all duration-1000" style={{width: `${obra.progresso}%`}}></div>
                        </div>
                        
                        {/* Botão de curtir */}
                        <button
                          onClick={() => toggleLike(obra.id)}
                          className={`flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            usuarioCurtiu 
                              ? 'bg-red-500 text-white hover:bg-red-600' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Heart size={14} fill={usuarioCurtiu ? 'currentColor' : 'none'} />
                          {likes.length} curtida{likes.length !== 1 ? 's' : ''}
                        </button>
                      </div>
                    )}) : (
                      <p className="text-sm text-[#2c3f1d]/50 italic">Nenhuma obra cadastrada ainda.</p>
                    )}
                  </div>
               </div>

               {/* Mural de Comunicados (Substituindo Próximas Benfeitorias) */}
               <div className="bg-[#e4eed7] p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                  <h2 className="text-xl font-bold mb-6 text-[#1d2a13]">Mural de Comunicados</h2>
                  
                  <div className="space-y-4">
                    {posts.length > 0 ? posts.map(post => (
                      <div key={post.id} className="bg-white rounded-[2.5rem] py-5 px-6 flex flex-col md:flex-row items-start gap-5 shadow-sm border border-transparent hover:border-[#4a5937]/10 transition-all">
                         <div className={`p-4 rounded-full shrink-0 ${post.urgente ? 'bg-red-100 text-red-600' : 'bg-[#eaf3de] text-[#4a5937]'}`}>
                           <Megaphone size={20} />
                         </div>
                         <div className="flex-1 mt-1 w-full">
                           <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-2">
                             <h4 className="font-bold text-[15px]">{post.titulo}</h4>
                             {post.urgente && <span className="bg-red-600 text-white text-[9px] px-3 py-1 rounded-full uppercase font-black tracking-widest animate-pulse shadow-sm self-start md:self-auto">Urgente</span>}
                           </div>
                           <p className="text-xs text-[#2c3f1d]/70 leading-relaxed font-medium whitespace-pre-wrap">{post.conteudo}</p>
                         </div>
                      </div>
                    )) : (
                      <p className="text-sm text-[#4a5937]/50 italic text-center py-4">Nenhum aviso importante no momento.</p>
                    )}
                  </div>
               </div>
            </div>

            {/* RIGHT SIDE DASH CARDS (4 of 12) */}
            <div className="col-span-4 space-y-6">
              
              {/* Próximas Agendas */}
              <div className="bg-[#daeccb] pt-6 pb-6 px-6 rounded-[2rem] shadow-sm">
                <h3 className="font-bold mb-6 flex items-center gap-2"><Calendar size={18}/> Próximas Agendas</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-sm shrink-0">
                      <span className="text-[9px] font-bold text-black/50 uppercase leading-none">Set</span>
                      <span className="text-sm font-black leading-none mt-1">12</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Conselho do Parque</h4>
                      <p className="text-[10px] text-[#2c3f1d]/60">19:00 • Auditório Norte</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-white w-12 h-12 rounded-full flex flex-col items-center justify-center shadow-sm shrink-0">
                      <span className="text-[9px] font-bold text-black/50 uppercase leading-none">Set</span>
                      <span className="text-sm font-black leading-none mt-1">15</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Feira de Orgânicos</h4>
                      <p className="text-[10px] text-[#2c3f1d]/60">08:00 • Entrada Sul</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Painel Transparência */}
              <div className="bg-[#4a5937] text-white p-6 rounded-[2rem] shadow-xl relative">
                <h3 className="font-bold mb-6">Painel Transparência</h3>
                
                <div className="flex gap-4">
                  <div className="bg-black/10 rounded-2xl p-4 flex-1">
                    <p className="text-[8px] uppercase tracking-widest text-white/50 mb-1">Investimento Total</p>
                    <p className="font-medium text-xl">R$ 1.2M</p>
                  </div>
                  <div className="bg-black/10 rounded-2xl p-4 flex-1">
                    <p className="text-[8px] uppercase tracking-widest text-white/50 mb-1">Visitantes / Mês</p>
                    <p className="font-medium text-xl">45k</p>
                  </div>
                </div>

                <button className="w-full bg-white hover:bg-slate-50 text-[#4a5937] py-3 rounded-full text-xs font-bold mt-6 shadow-md transition-colors">
                  Ver Detalhes Financeiros
                </button>

                <div className="absolute right-4 bottom-[4.5rem] bg-[#c3641c] w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <AlertCircle size={18} className="text-white" />
                </div>
              </div>

              {/* Status do Parque */}
              <div className="border border-[#d0dfbb] bg-[#e4efd1] p-6 rounded-[2.5rem]">
                <h3 className="font-bold mb-4 text-[10px] tracking-widest text-[#2c3f1d]/70 uppercase">Status do Parque</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> Portões</span>
                    <span className="font-bold">Abertos</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#16a34a]"></span> Qualidade do Ar</span>
                    <span className="font-bold">Excelente</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#eab308]"></span> Estacionamento</span>
                    <span className="font-bold">85% Ocupado</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </main>
        ) : (
          <main className="flex-1 px-10 pb-10 pt-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] shadow-xl p-10 md:p-16 max-w-5xl mx-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex items-center gap-4 mb-10 pb-8 border-b border-[#2c3f1d]/10">
                 <div className="bg-[#e4eed7] p-4 rounded-2xl text-[#4a5937]"><FileText size={32} /></div>
                 <div>
                   <h2 className="text-3xl font-black text-[#1d2a13] uppercase tracking-tight">Estatuto Oficial do Parque</h2>
                   <p className="text-xs font-bold text-[#4a5937]/70 uppercase tracking-widest mt-1">Regulamento Interno para Moradores</p>
                 </div>
               </div>
               
               <div className="whitespace-pre-wrap leading-relaxed text-[#2c3f1d]/90 font-medium text-[15px]">
                  {estatutoTexto ? estatutoTexto : <span className="italic text-[#2c3f1d]/50">O estatuto ainda não foi publicado via painel do síndico.</span>}
               </div>
            </div>
          </main>
        )}
      </div>

      {/* 25% RIGHT SIDEBAR (Digital Janitor) */}
      <aside className="w-[300px] lg:w-[320px] shrink-0 bg-[#eaf4dd] h-full flex flex-col p-8 pb-8 border-l border-white overflow-y-auto">
        
        {/* Profile */}
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 rounded-full bg-[#051c2c] shadow-lg overflow-hidden border-2 border-white relative shrink-0">
             <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Janitor" alt="AI Agent" className="w-full h-full object-cover scale-110" />
           </div>
           <div>
             <h3 className="font-black text-[15px] text-[#051c2c] leading-tight flex items-center gap-1">
               Zelador Digital <Bot size={14} className="text-[#4a5937]" />
             </h3>
             <p className="text-[10px] text-[#2c3f1d]/50 font-black uppercase tracking-widest mt-1">Inteligência Artificial</p>
           </div>
        </div>

        {/* Chat / Inquiries */}
        <div className="flex-1 flex flex-col space-y-4">
          
          <div className="bg-white rounded-[1.5rem] rounded-tl-none px-6 py-5 text-sm font-medium italic text-[#2c3f1d]/70 shadow-sm border border-black/5">
            "Olá{perfil?.nome ? ` ${perfil.nome}` : ''}! Sou seu assistente digital. Qual a sua dúvida sobre as regras do condomínio?"
          </div>

          {resposta && (
             <div className="bg-[#4a5937]/10 border border-[#4a5937]/20 rounded-[1.5rem] rounded-tr-none px-6 py-5 text-sm font-medium text-[#2c3f1d] shadow-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2">
               <span className="block text-[9px] font-black uppercase text-[#4a5937]/60 mb-2 tracking-widest">Resposta Oficial</span>
               <p className="mb-4">{resposta}</p>
               
               <button 
                 onClick={limparZelador}
                 className="w-full bg-white border border-[#4a5937]/20 hover:bg-[#4a5937] hover:text-white text-[#4a5937] py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm"
               >
                 <CheckCircle2 size={14}/> Entendido
               </button>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="mt-8 pt-8 border-t border-[#2c3f1d]/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!carregandoIA && pergunta.trim()) {
                perguntarZelador();
              }
            }}
          >
            <textarea
               className="w-full bg-white border-none rounded-[1.5rem] p-5 text-xs outline-none focus:ring-2 focus:ring-[#4a5937]/20 transition-all resize-none shadow-sm mb-4 h-24 text-black"
               placeholder="Escreva sua pergunta aqui..."
               value={pergunta}
               onChange={(e) => setPergunta(e.target.value)}
               onKeyDown={(e) => {
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
               className="w-full bg-[#4a5937] hover:bg-[#323d24] text-white py-4 rounded-[1.5rem] flex items-center justify-center gap-2 text-sm font-bold shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50"
            >
               <MessageSquare size={16}/> {carregandoIA ? 'Consultando...' : 'Enviar Pergunta'}
            </button>
          </form>

          {hrefWhatsApp && (
            <div className="mt-5">
              <a
                href={hrefWhatsApp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-[1.5rem] border border-[#4f8a50] bg-[#d7f5d4] px-4 py-3 text-sm font-semibold text-[#14632f] shadow-sm transition-colors hover:bg-[#c6ecbe]"
              >
                <MessageSquare size={16} />
                Fale com o síndico no WhatsApp
              </a>
            </div>
          )}
        </div>

      </aside>

    </div>
  );
}