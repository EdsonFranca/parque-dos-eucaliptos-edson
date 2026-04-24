import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Search, Loader2, MessageSquare, Plus, Trash2, X, Send, Inbox, Bell } from 'lucide-react';

export default function ClassificadosView({ perfil }: { perfil: any }) {
  const [abaLocal, setAbaLocal] = useState<'vitrine' | 'inbox'>('vitrine');
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Inbox data
  const [meusChatsLista, setMeusChatsLista] = useState<any[]>([]);
  const mensagensFimRef = useRef<HTMLDivElement>(null);

  const [mostrandoForm, setMostrandoForm] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [novaImagem, setNovaImagem] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [filtroPrecoMin, setFiltroPrecoMin] = useState('');
  const [filtroPrecoMax, setFiltroPrecoMax] = useState('');

  // Estados do Chat
  const [chatAtivo, setChatAtivo] = useState<any>(null); // Pode ser os dados do anúncio ou do chat aberto
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [chatSubscription, setChatSubscription] = useState<any>(null);

  const fetchAnuncios = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from('classificados')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setAnuncios(data);
    }
    setCarregando(false);
  };

  const fetchMeusChatsBase = async () => {
    const { data } = await supabase
      .from('chats_classificados')
      .select(`
        *,
        classificados (titulo, imagem_url, preco)
      `)
      .or(`interessado_id.eq.${perfil.id},vendedor_id.eq.${perfil.id}`);
    
    if (data) {
      setMeusChatsLista(data);
    }
  };

  useEffect(() => {
    fetchAnuncios();
    fetchMeusChatsBase();
  }, []);

  useEffect(() => {
    if (chatAtivo) {
       mensagensFimRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens, chatAtivo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      const reader = new FileReader();
      reader.onloadend = () => setNovaImagem(reader.result as string);
      reader.readAsDataURL(arquivo);
    }
  };

  const handlePublicar = async () => {
    if (!novoTitulo || !novaDescricao || !novoPreco || !novaImagem) {
      return alert("Preencha todos os campos e adicione uma foto!");
    }
    setSalvando(true);

    const precoNumerico = Number(novoPreco.replace(',', '.'));
    if (isNaN(precoNumerico)) {
      setSalvando(false);
      return alert("Preço inválido.");
    }

    const { error, data } = await supabase
      .from('classificados')
      .insert([{
        vendedor_id: perfil.id,
        vendedor_nome: perfil.nome,
        titulo: novoTitulo,
        descricao: novaDescricao,
        preco: precoNumerico,
        imagem_url: novaImagem
      }]).select();

    if (!error && data) {
      setAnuncios(prev => [data[0], ...prev]);
      setMostrandoForm(false);
      setNovoTitulo(''); setNovaDescricao(''); setNovoPreco(''); setNovaImagem(null);
      alert("✅ Anúncio publicado com sucesso!");
    } else {
      console.error(error);
      alert("Erro ao publicar anúncio.");
    }
    setSalvando(false);
  };

  const handleDeletar = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar seu anúncio?")) return;
    const { error } = await supabase.from('classificados').delete().eq('id', id);
    if (!error) {
      setAnuncios(prev => prev.filter(anuncio => anuncio.id !== id));
    } else {
      alert("Erro ao apagar anúncio.");
    }
  };

  // Funções de Chat
  const abrirChat = async (anuncio: any) => {
    if (perfil.id === anuncio.vendedor_id) {
      return alert("Você não pode abrir chat consigo mesmo!");
    }

    // Tenta encontrar um chat existente
    const { data: chatExistente } = await supabase
      .from('chats_classificados')
      .select('id')
      .eq('classificado_id', anuncio.id)
      .eq('interessado_id', perfil.id)
      .single();

    let chatId = chatExistente?.id;

    if (!chatId) {
      // Cria novo chat
      const { data: novoChat, error } = await supabase
        .from('chats_classificados')
        .insert([{
          classificado_id: anuncio.id,
          interessado_id: perfil.id,
          vendedor_id: anuncio.vendedor_id
        }]).select().single();
      
      if (error) {
        console.error("Erro Supabase criar chat:", error);
        return alert("Erro ao inicializar chat: " + error.message);
      }
      chatId = novoChat.id;
    }

    setChatAtivo({ id: chatId, anuncio: anuncio, role: perfil.id === anuncio.vendedor_id ? 'vendedor' : 'comprador' });
    carregarMensagens(chatId);

    // Inscrever no Realtime!
    const sub = supabase.channel(`chat_${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens_chats', filter: `chat_id=eq.${chatId}` }, payload => {
         // Evita duplicar se a msg foi gerada otimisticamente
         if (payload.new.remetente_id !== perfil.id) {
           setMensagens(prev => [...prev, payload.new]);
         }
      }).subscribe();
      
    setChatSubscription(sub);
  };

  const fecharChat = () => {
    if (chatSubscription) {
      supabase.removeChannel(chatSubscription);
      setChatSubscription(null);
    }
    setChatAtivo(null);
    setMensagens([]);
  };

  const carregarMensagens = async (chatId: string) => {
    const { data } = await supabase
      .from('mensagens_chats')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (data) setMensagens(data);
  };

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !chatAtivo) return;

    const texto = novaMensagem;
    setNovaMensagem('');

    // Update Otimista
    const tempId = 'temp-' + Date.now();
    setMensagens(prev => [...prev, {
      id: tempId,
      chat_id: chatAtivo.id,
      remetente_id: perfil.id,
      conteudo: texto,
      created_at: new Date().toISOString()
    }]);

    const { data } = await supabase.from('mensagens_chats').insert([{
      chat_id: chatAtivo.id,
      remetente_id: perfil.id,
      conteudo: texto
    }]).select().single();
    
    if (data) {
      setMensagens(prev => prev.map(m => m.id === tempId ? data : m));
    }
  };

  const abrirConversaInbox = async (chat: any) => {
    setChatAtivo({ 
      id: chat.id, 
      anuncio: chat.classificados || { titulo: 'Anúncio indisponível', preco: 0 }, 
      role: perfil.id === chat.vendedor_id ? 'vendedor' : 'comprador',
      vendedor_id_chat: chat.vendedor_id,
      interessado_id_chat: chat.interessado_id
    });
    carregarMensagens(chat.id);
    
    // Inscrever no Realtime!
    const sub = supabase.channel(`chat_${chat.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens_chats', filter: `chat_id=eq.${chat.id}` }, payload => {
         if (payload.new.remetente_id !== perfil.id) {
           setMensagens(prev => [...prev, payload.new]);
         }
      }).subscribe();
      
    setChatSubscription(sub);
  };

  const anunciosFiltrados = anuncios.filter((anuncio) => {
    const termo = filtroBusca.trim().toLowerCase();
    const matchTexto = !termo
      || anuncio.titulo?.toLowerCase().includes(termo)
      || anuncio.descricao?.toLowerCase().includes(termo)
      || anuncio.vendedor_nome?.toLowerCase().includes(termo);

    const preco = Number(anuncio.preco);
    const min = filtroPrecoMin ? Number(filtroPrecoMin.replace(',', '.')) : null;
    const max = filtroPrecoMax ? Number(filtroPrecoMax.replace(',', '.')) : null;
    const matchMin = min === null || (!Number.isNaN(min) && preco >= min);
    const matchMax = max === null || (!Number.isNaN(max) && preco <= max);

    return matchTexto && matchMin && matchMax;
  });

  return (
    <main className="flex-1 px-10 pb-10 pt-4 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
           <h2 className="text-3xl font-black text-[#1d2a13] uppercase tracking-tight flex items-center gap-3">Compra e Venda <span className="text-2xl">🛒</span></h2>
           <p className="text-xs font-bold text-[#4a5937]/70 uppercase tracking-widest mt-1">Classificados Exclusivos para Moradores</p>
        </div>
        <div className="flex gap-2">
          {!mostrandoForm && (
            <button 
               onClick={() => setMostrandoForm(true)}
               className="bg-[#1d2a13] hover:bg-black text-white px-5 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-colors uppercase text-xs tracking-widest shrink-0"
            >
               <Plus size={16} /> Anunciar
            </button>
          )}
          <button 
             onClick={() => setAbaLocal(abaLocal === 'vitrine' ? 'inbox' : 'vitrine')}
             className={`px-5 py-3 rounded-full font-bold shadow-md flex items-center gap-2 transition-colors uppercase text-xs tracking-widest shrink-0 ${abaLocal === 'inbox' ? 'bg-[#4a5937] text-white' : 'bg-white text-[#4a5937] border border-[#e4eed7] hover:bg-[#e4eed7]'}`}
          >
             {abaLocal === 'inbox' ? <Search size={16} /> : <Bell size={16} />}
             {abaLocal === 'inbox' ? 'Ver Vitrine' : `Mensagens (${meusChatsLista.length})`}
          </button>
        </div>
      </div>

      {mostrandoForm && (
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all mb-10">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-[#1d2a13]">Novo Anúncio</h3>
             <button onClick={() => setMostrandoForm(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full"><X size={16} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <input 
                type="text" 
                placeholder="Título do Produto" 
                className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] px-5 py-4 mb-4 font-bold outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner text-sm" 
                value={novoTitulo} 
                onChange={(e) => setNovoTitulo(e.target.value)} 
              />
              <textarea 
                placeholder="Descreva as condições, tempo de uso, motivo da venda..." 
                className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] p-5 mb-4 h-32 outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner text-sm resize-none custom-scrollbar" 
                value={novaDescricao} 
                onChange={(e) => setNovaDescricao(e.target.value)} 
              />
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[#2c3f1d]/50">R$</span>
                <input 
                  type="text" 
                  placeholder="0.00" 
                  className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] pl-12 pr-5 py-4 mb-4 font-bold outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner text-sm" 
                  value={novoPreco} 
                  onChange={(e) => setNovoPreco(e.target.value)} 
                />
              </div>
            </div>

            <div>
              <label className="block border-2 border-dashed border-[#4a5937]/20 bg-[#f4f7ef] hover:bg-[#e4eed7] p-6 rounded-[1.5rem] h-[16rem] cursor-pointer text-center transition-colors mb-6 relative">
                {novaImagem ? (
                  <img src={novaImagem} className="w-full h-full rounded-xl shadow-md object-cover" alt="preview" />
                ) : (
                  <div className="h-full flex flex-col justify-center items-center opacity-60 text-[#4a5937]">
                    <Camera size={40} className="mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest mt-2">Fazer Upload da Foto</span>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              
              <button 
                onClick={handlePublicar} 
                disabled={salvando} 
                className="w-full bg-[#1d2a13] hover:bg-black text-white font-black py-4 rounded-[1.5rem] transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {salvando ? <Loader2 size={16} className="animate-spin" /> : "PUBLICAR OFERTA"}
              </button>
            </div>
          </div>
        </section>
      )}

      {abaLocal === 'vitrine' ? (
        carregando ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#4a5937]" size={40} /></div>
        ) : anuncios.length === 0 ? (
          <p className="text-center text-[#2c3f1d]/50 italic bg-white p-10 rounded-[2rem]">Nenhum anúncio disponível no momento.</p>
        ) : (
          <>
            <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Search size={16} className="text-[#4a5937]" />
                <h3 className="text-sm font-black text-[#1d2a13] uppercase tracking-widest">Filtros da Vitrine</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Buscar por título, descrição ou morador"
                  value={filtroBusca}
                  onChange={(e) => setFiltroBusca(e.target.value)}
                  className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner text-sm"
                />
                <input
                  type="text"
                  placeholder="Preço mínimo"
                  value={filtroPrecoMin}
                  onChange={(e) => setFiltroPrecoMin(e.target.value)}
                  className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner text-sm"
                />
                <input
                  type="text"
                  placeholder="Preço máximo"
                  value={filtroPrecoMax}
                  onChange={(e) => setFiltroPrecoMax(e.target.value)}
                  className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner text-sm"
                />
              </div>
            </section>

            {anunciosFiltrados.length === 0 ? (
              <p className="text-center text-[#2c3f1d]/50 italic bg-white p-10 rounded-[2rem]">
                Nenhum anúncio encontrado com os filtros informados.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {anunciosFiltrados.map(anuncio => (
              <div key={anuncio.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-[#4a5937]/20 group flex flex-col">
                 <div className="h-48 overflow-hidden relative">
                   {anuncio.imagem_url ? (
                     <img src={anuncio.imagem_url} alt={anuncio.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full bg-slate-200 flex justify-center items-center"><Camera className="text-slate-400" /></div>
                   )}
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-full text-[#4a5937]">
                      R$ {Number(anuncio.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </div>
                 </div>
                 
                 <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-[#1d2a13] line-clamp-1 mb-1">{anuncio.titulo}</h3>
                    <p className="text-[10px] font-bold text-[#4a5937]/60 uppercase tracking-widest mb-3">Por: {anuncio.vendedor_nome || 'Morador'}</p>
                    <p className="text-sm text-[#2c3f1d]/70 line-clamp-3 mb-5 flex-1">{anuncio.descricao}</p>
                    
                    {perfil.id === anuncio.vendedor_id ? (
                       <button onClick={() => handleDeletar(anuncio.id)} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 text-xs uppercase tracking-widest rounded-full flex justify-center items-center gap-2 transition-colors">
                         <Trash2 size={14} /> Excluir Anúncio
                       </button>
                    ) : (
                       <button onClick={() => abrirChat(anuncio)} className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3 text-xs uppercase tracking-widest rounded-full flex justify-center items-center gap-2 transition-colors shadow-md">
                         <MessageSquare size={14} /> Tenho Interesse
                       </button>
                    )}
                 </div>
              </div>
                ))}
              </div>
            )}
          </>
        )
      ) : (
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#e4eed7]">
          <h3 className="text-xl font-bold text-[#1d2a13] mb-6 flex items-center gap-2"><Inbox size={20}/> Suas Conversas ({meusChatsLista.length})</h3>
          
          {meusChatsLista.length === 0 ? (
             <p className="text-[#2c3f1d]/50 italic">Você não possui nenhuma negociação ativa.</p>
          ) : (
            <div className="flex flex-col gap-3">
               {meusChatsLista.map(chat => {
                 const isVendedor = chat.vendedor_id === perfil.id;
                 return (
                   <div 
                     key={chat.id} 
                     onClick={() => abrirConversaInbox(chat)}
                     className="flex items-center gap-4 p-4 rounded-2xl border border-[#e4eed7] hover:bg-[#f4f7ef] cursor-pointer transition-colors"
                   >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                         {chat.classificados?.imagem_url ? (
                           <img src={chat.classificados.imagem_url} alt="Produto" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center"><Camera size={20} className="text-gray-300"/></div>
                         )}
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                           <h4 className="font-bold text-[#1d2a13]">{chat.classificados?.titulo || 'Anúncio removido'}</h4>
                           <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md ${isVendedor ? 'bg-[#e4eed7] text-[#4a5937]' : 'bg-blue-100 text-blue-700'}`}>
                              {isVendedor ? 'Você Vende' : 'Você Compra'}
                           </span>
                         </div>
                         <p className="text-xs text-[#2c3f1d]/60 flex items-center gap-1"><MessageSquare size={12}/> Clique para abrir o bate-papo</p>
                      </div>
                   </div>
                 )
               })}
            </div>
          )}
        </section>
      )}

      {/* MODAL DE CHAT */}
      {chatAtivo && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full md:w-[400px] h-full bg-[#f4f7ef] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
             
             {/* Chat Header */}
             <div className="bg-[#1d2a13] text-white p-6 shrink-0 rounded-bl-[2.5rem]">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="font-black text-lg break-words">{chatAtivo.anuncio.titulo}</h3>
                 <button onClick={fecharChat} className="bg-white/10 hover:bg-red-500/80 p-2 rounded-full transition-colors"><X size={16} /></button>
               </div>
               <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">
                 Você é o: {chatAtivo.role === 'vendedor' ? 'Vendedor' : 'Comprador'}
               </p>
               <p className="text-xl font-bold mt-2">R$ {Number(chatAtivo.anuncio.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
             </div>

             {/* Chat Messages */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
               {mensagens.map(msg => {
                 const isMine = msg.remetente_id === perfil.id;
                 const key = typeof msg.id === 'string' ? msg.id : msg.id.toString();
                 return (
                   <div key={key} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] rounded-[1.5rem] px-5 py-4 shadow-sm text-sm ${isMine ? 'bg-[#4a5937] text-white rounded-br-none' : 'bg-white text-[#2c3f1d] rounded-bl-none border border-[#e4eed7]'}`}>
                       <p className="leading-relaxed">{msg.conteudo}</p>
                       <span className={`block text-[9px] mt-2 ${isMine ? 'text-white/50 text-right' : 'text-[#2c3f1d]/40'}`}>
                         {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                     </div>
                   </div>
                 )
               })}
               {mensagens.length === 0 && (
                 <div className="h-full flex items-center justify-center text-center p-4">
                   <p className="text-[#4a5937]/50 italic text-sm">Nenhuma mensagem ainda.<br/>Envie um "Olá!" para o vendedor.</p>
                 </div>
               )}
               <div ref={mensagensFimRef} />
             </div>

             {/* Chat Input */}
             <div className="p-6 bg-white border-t border-[#e4eed7] shrink-0">
               <form onSubmit={enviarMensagem} className="flex gap-2">
                 <input 
                   type="text" 
                   value={novaMensagem}
                   onChange={e => setNovaMensagem(e.target.value)}
                   className="flex-1 bg-[#f4f7ef] rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-[#4a5937]/20 border-none text-sm shadow-inner"
                   placeholder="Mensagem..."
                 />
                 <button type="submit" disabled={!novaMensagem.trim()} className="bg-[#4a5937] hover:bg-[#323d24] text-white p-3 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50">
                   <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
                 </button>
               </form>
             </div>
           </div>
        </div>
      )}

    </main>
  );
}
