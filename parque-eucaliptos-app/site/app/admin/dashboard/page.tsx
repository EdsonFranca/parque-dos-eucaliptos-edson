'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
//import { supabase } from '@/lib/supabase';
import { supabase } from '../../../lib/supabase';
import {
  LogOut, Megaphone, HardHat, Camera, Trash2,
  ArrowRight, ShieldCheck, Clock, Loader2, Eraser, Heart, FileText, Users, Mail, XCircle, Upload, Plus, Search, RefreshCcw as Reload
} from 'lucide-react';

export default function DashboardAdmin() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [erroUsuarios, setErroUsuarios] = useState('');
  const [pesquisaUsuario, setPesquisaUsuario] = useState('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<any[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [sessoesAtivas, setSessoesAtivas] = useState<any[]>([]);
  const [carregandoSessoes, setCarregandoSessoes] = useState(false);
  const [erroSessoes, setErroSessoes] = useState('');
  const [resetandoEmail, setResetandoEmail] = useState<string | null>(null);
  const [excluindoUsuario, setExcluindoUsuario] = useState<string | null>(null);
  const [galeria, setGaleria] = useState<any[]>([]);
  const [avisos, setAvisos] = useState<any[]>([]);
  const [descricao, setDescricao] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [progressoNovo, setProgressoNovo] = useState(50);
  const [tituloAviso, setTituloAviso] = useState('');
  const [msgAviso, setMsgAviso] = useState('');
  const [estatutoText, setEstatutoText] = useState('');
  const [isUrgente, setIsUrgente] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoPDF, setCarregandoPDF] = useState(false);
  const [emailPermitidoManual, setEmailPermitidoManual] = useState('');
  const [nomePermitidoManual, setNomePermitidoManual] = useState('');
  const [chacaraPermitidoManual, setChacaraPermitidoManual] = useState('');
  const [emailsPermitidos, setEmailsPermitidos] = useState<any[]>([]);
  const [pesquisaEmailsPermitidos, setPesquisaEmailsPermitidos] = useState('');
  const [carregandoEmailsPermitidosList, setCarregandoEmailsPermitidosList] = useState(false);
  const [carregandoEmailsPermitidos, setCarregandoEmailsPermitidos] = useState(false);
  const [mensagemEmailsPermitidos, setMensagemEmailsPermitidos] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return null;
    return { Authorization: `Bearer ${session.access_token}` };
  };

  const carregarUsuarios = async () => {
    setCarregandoUsuarios(true);
    setErroUsuarios('');
    try {
      const headers = await getAuthHeader();
      if (!headers) return;

      const res = await fetch('/api/admin/usuarios', { headers });
      const data = await res.json();
      if (!res.ok) {
        setErroUsuarios(data.error || 'Falha ao carregar usuarios.');
        return;
      }
      setUsuarios(data.usuarios || []);
    } catch (err) {
      setErroUsuarios('Erro de conexao ao carregar usuarios.');
    } finally {
      setCarregandoUsuarios(false);
    }
  };

  const filtrarUsuarios = (termo: string) => {
    if (!termo.trim()) {
      setUsuariosFiltrados([]);
      setMostrarTodos(false);
      return;
    }

    const termoLower = termo.toLowerCase();
    const filtrados = usuarios.filter(usuario => 
      (usuario.nome && usuario.nome.toLowerCase().includes(termoLower)) ||
      (usuario.email && usuario.email.toLowerCase().includes(termoLower))
    );
    setUsuariosFiltrados(filtrados);
    setMostrarTodos(false);
  };

  useEffect(() => {
    filtrarUsuarios(pesquisaUsuario);
  }, [usuarios, pesquisaUsuario]);

  const carregarSessoesAtivas = async () => {
    setCarregandoSessoes(true);
    setErroSessoes('');
    try {
      const headers = await getAuthHeader();
      if (!headers) return;

      const res = await fetch('/api/admin/sessoes', { headers });
      const data = await res.json();
      if (!res.ok) {
        setErroSessoes(data.error || 'Falha ao carregar sessões ativas.');
        return;
      }
      
      setSessoesAtivas(data.sessoes || []);
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
      setErroSessoes('Erro de conexao ao carregar sessões.');
    } finally {
      setCarregandoSessoes(false);
    }
  };

  const enviarResetSenha = async (email: string) => {
    if (!confirm(`Enviar e-mail de reset para ${email}?`)) return;
    setResetandoEmail(email);
    try {
      const headers = await getAuthHeader();
      if (!headers) return;

      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Nao foi possivel enviar reset.');
        return;
      }
      alert('E-mail de redefinicao enviado com sucesso.');
    } catch (err) {
      alert('Erro de conexao ao enviar reset.');
    } finally {
      setResetandoEmail(null);
    }
  };

  const excluirUsuario = async (userId: string, nome: string, email: string) => {
    console.log('excluirUsuario called with:', { userId, nome, email });
    
    if (!confirm(`Tem certeza que deseja excluir o usuário "${nome}" (${email})?\n\nEsta ação é irreversível!`)) return;
    setExcluindoUsuario(userId);
    try {
      const headers = await getAuthHeader();
      console.log('Headers obtained:', headers);
      if (!headers) {
        console.log('No headers available');
        return;
      }

      console.log('Sending DELETE request...');
      const res = await fetch('/api/admin/usuarios', {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok) {
        alert(data.error || 'Nao foi possivel excluir o usuário.');
        return;
      }
      alert('Usuário excluído com sucesso.');
      setUsuarios(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error in excluirUsuario:', err);
      alert('Erro de conexao ao excluir usuário.');
    } finally {
      setExcluindoUsuario(null);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        console.log('Verificando sessão...');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          console.log('Nenhuma sessão encontrada, redirecionando para login');
          router.push('/admin/login');
          return;
        }

        console.log('Sessão encontrada, verificando perfil...', session.user.id);
        const { data: perfil, error } = await supabase
          .from('perfis_moradores')
          .select('tipo_usuario')
          .eq('id', session.user.id)
          .single();

        console.log('Resultado da verificação:', { perfil, error });

        if (error) {
          console.error('Erro ao verificar perfil:', error);
          // Em caso de erro na verificação, não redirecionar ainda
          // Pode ser um erro temporário
          return;
        }

        if (!perfil) {
          console.log('Perfil não encontrado para o usuário:', session.user.id);
          router.push('/');
          return;
        }

        if (perfil.tipo_usuario !== 'admin') {
          console.log('Usuário não é admin:', perfil);
          router.push('/');
          return;
        }

        console.log('Perfil admin confirmado, carregando dados...');
        
        // Carregar dados em paralelo para melhor performance
        const [obrasResult, postsResult] = await Promise.all([
          supabase
            .from('obras')
            .select('*, comentarios_obras(*)')
            .order('created_at', { ascending: false }),
          supabase
            .from('posts')
            .select('*')
            .neq('autor', 'ESTATUTO')
            .order('created_at', { ascending: false })
        ]);

        if (obrasResult.data) setGaleria(obrasResult.data);
        if (postsResult.data) setAvisos(postsResult.data);
        
        console.log('Dados carregados com sucesso');
        setLoading(false);
        
        // Carregar dados adicionais sem bloquear
        carregarUsuarios();
        carregarSessoesAtivas();
        
      } catch (error) {
        console.error('Erro no checkAdmin:', error);
        setLoading(false);
      }
    };

    checkAdmin();

    // Listener para mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/admin/login');
        }
        // Não fazer nada em SIGNED_IN ou TOKEN_REFRESHED para evitar loops
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!pesquisaUsuario && !mostrarTodos) {
      setUsuariosFiltrados([]);
    }
  }, [pesquisaUsuario, mostrarTodos]);

  useEffect(() => {
    const interval = setInterval(() => {
      carregarSessoesAtivas();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(arquivo);
    }
  };

  const atualizarProgressoNoBanco = async (id: string, novoValor: number) => {
    const { error } = await supabase
      .from('obras')
      .update({ progresso: novoValor })
      .eq('id', id);

    if (error) {
      alert("Erro ao salvar no banco: " + error.message);
    }
  };

  const handleImportarPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setCarregandoPDF(true);
    setEstatutoText("Processando PDF, aguarde extração do texto...");
    
    try {
      const formData = new FormData();
      formData.append('file', arquivo);

      const res = await fetch('/api/extrair-pdf', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setEstatutoText(data.texto);
      } else {
        alert("Erro no servidor: " + data.error);
        setEstatutoText("");
      }
    } catch (err) {
      alert("Falha de rede ao tentar extrair o texto.");
      setEstatutoText("");
    } finally {
      setCarregandoPDF(false);
      e.target.value = '';
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const extractEmailsFromText = (text: string) => {
    const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    return Array.from(new Set(matches.map((email) => email.toLowerCase().trim())));
  };

  const carregarEmailsPermitidos = async (query = '') => {
    setCarregandoEmailsPermitidosList(true);
    try {
      const headers = await getAuthHeader();
      if (!headers) return;

      const url = new URL('/api/admin/emails-permitidos', window.location.origin);
      if (query) url.searchParams.set('q', query.trim());

      const res = await fetch(url.toString(), { headers });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.error || 'Erro ao carregar emails permitidos');
        return;
      }
      setEmailsPermitidos(data.emails || []);
    } catch (err) {
      console.error('Erro ao carregar emails permitidos:', err);
    } finally {
      setCarregandoEmailsPermitidosList(false);
    }
  };

  const enviarEmailsPermitidos = async (emails: { email: string; nome?: string | null; chacara?: string | null }[]) => {
    if (!emails.length) return false;
    setCarregandoEmailsPermitidos(true);
    setMensagemEmailsPermitidos('');

    try {
      const headers = await getAuthHeader();
      if (!headers) {
        alert('Sessão inválida. Faça login novamente.');
        return false;
      }

      const res = await fetch('/api/admin/emails-permitidos', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar emails permitidos.');
        return false;
      }

      setMensagemEmailsPermitidos(`✅ ${data.count} email(s) permitidos adicionados ou atualizados com sucesso.`);
      setEmailPermitidoManual('');
      setNomePermitidoManual('');
      setChacaraPermitidoManual('');
      await carregarEmailsPermitidos();
      return true;
    } catch (err) {
      alert('Erro de conexão ao salvar emails permitidos.');
      return false;
    } finally {
      setCarregandoEmailsPermitidos(false);
    }
  };

  const handleAdicionarEmailPermitido = async () => {
    const email = emailPermitidoManual.trim().toLowerCase();

    if (!email) {
      alert('Digite um email válido para adicionar.');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Formato de email inválido.');
      return;
    }

    await enviarEmailsPermitidos([
      {
        email,
        nome: nomePermitidoManual.trim() || null,
        chacara: chacaraPermitidoManual.trim() || null,
      },
    ]);
  };

  const handleImportarEmailsPermitidos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setCarregandoEmailsPermitidos(true);
    setMensagemEmailsPermitidos('');

    try {
      const ext = arquivo.name.split('.').pop()?.toLowerCase();
      let texto = '';

      if (ext === 'pdf') {
        const formData = new FormData();
        formData.append('file', arquivo);

        const res = await fetch('/api/extrair-pdf', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Erro ao extrair texto do PDF.');
          return;
        }

        texto = data.texto || '';
      } else if (ext === 'txt') {
        texto = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Falha ao ler o arquivo TXT.'));
          reader.readAsText(arquivo, 'UTF-8');
        });
      } else {
        alert('Apenas arquivos PDF ou TXT são aceitos.');
        return;
      }

      const emails = extractEmailsFromText(texto);
      if (!emails.length) {
        alert('Nenhum email válido encontrado no arquivo.');
        return;
      }

      await enviarEmailsPermitidos(emails.map((email) => ({ email })));
    } catch (err) {
      alert('Erro ao importar a lista de emails permitidos.');
    } finally {
      setCarregandoEmailsPermitidos(false);
      if (e.target) e.target.value = '';
    }
  };

  useEffect(() => {
    if (hasMounted && !loading) {
      carregarEmailsPermitidos();
    }
  }, [hasMounted, loading]);

  const handleAtualizarEstatuto = async () => {
    if (!estatutoText) return alert("Extraia ou digite o texto do estatuto!");
    setCarregando(true);

    const { error } = await supabase
      .from('posts')
      .insert([{ titulo: 'Estatuto do Parque', conteudo: estatutoText, autor: 'ESTATUTO', urgente: false }]);

    if (!error) {
      alert("✅ Estatuto salvo! Ele está disponível na nova aba dos moradores.");
      setEstatutoText('');
    } else {
       alert("Erro ao salvar o estatuto.");
    }
    setCarregando(false);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  };

  if (!hasMounted) return <div className="min-h-screen bg-[#eaf3de]" />;
  if (loading) return <div className="min-h-screen bg-[#eaf3de] flex items-center justify-center"><Loader2 className="animate-spin text-[#4a5937]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#eaf3de] text-[#2c3f1d] font-sans pb-10">
      
      {/* HEADER ADMINISTRATIVO */}
      <header className="bg-[#1d2a13] px-8 md:px-12 py-6 mb-10 shadow-lg shrink-0 flex flex-col md:flex-row justify-between items-center text-white gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl"><ShieldCheck size={28} className="text-white" /></div>
            <div>
              <h1 className="text-2xl font-black mb-1">Painel do Síndico</h1>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none">Gestão Administrativa & Auditoria</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={limparFormularios} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-full font-bold text-xs transition-colors uppercase tracking-widest shadow-sm">
              <Eraser size={14} /> Limpar Edições
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-full font-bold text-xs transition-colors uppercase tracking-widest shadow-sm">
              <LogOut size={14} /> Encerrar Sessão
            </button>
          </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* COLUNA ESQUERDA (CRIAÇÃO DE CONTEÚDO) */}
        <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
          
          {/* Postar Obra */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#e4eed7] p-3 rounded-2xl text-[#4a5937]"><HardHat size={24} /></div>
              <h2 className="text-xl font-black text-[#1d2a13] uppercase tracking-tight">Postar Obra</h2>
            </div>
            
            <textarea 
              className="w-full bg-[#f4f7ef] border-none rounded-[1.5rem] p-5 text-sm mb-6 h-28 outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner resize-none text-[#2c3f1d]" 
              placeholder="Descreva o andamento da obra..." 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
            />
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                 <label className="text-[10px] font-black text-[#2c3f1d]/60 uppercase tracking-widest leading-none">Avanço Físico</label>
                 <span className="text-xs font-bold text-[#4a5937]">{progressoNovo}%</span>
              </div>
              <input 
                type="range" 
                className="w-full h-2 bg-[#dbeaeb] rounded-full appearance-none cursor-pointer accent-[#4a5937]" 
                value={progressoNovo} 
                onChange={(e) => setProgressoNovo(Number(e.target.value))} 
              />
            </div>

            <label className="block border-2 border-dashed border-[#4a5937]/20 bg-[#f4f7ef] hover:bg-[#e4eed7] p-6 rounded-[1.5rem] cursor-pointer text-center transition-colors mb-8 relative">
              {preview ? (
                <img src={preview} className="max-h-40 mx-auto rounded-xl shadow-md object-cover" alt="preview" />
              ) : (
                <div className="py-6 flex flex-col items-center opacity-60 text-[#4a5937]">
                  <Camera size={32} className="mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">Adicionar Foto</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>

            <button 
              onClick={handlePublicarObra} 
              disabled={carregando} 
              className="w-full bg-[#4a5937] hover:bg-[#323d24] text-white font-black py-4 rounded-[1.5rem] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {carregando ? <><Loader2 className="animate-spin" size={18}/> Publicando</> : <>PUBLICAR OBRA <ArrowRight size={18} /></>}
            </button>
          </section>

          {/* Novo Comunicado */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all">
             <div className="flex items-center gap-4 mb-8">
               <div className="bg-[#feeadd] p-3 rounded-2xl text-[#b2571b]"><Megaphone size={24} /></div>
               <h2 className="text-xl font-black text-[#1d2a13] uppercase tracking-tight">Comunicado</h2>
            </div>
            
            <input 
              type="text" 
              placeholder="Título Oficial" 
              className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] px-5 py-4 mb-4 font-bold outline-none focus:ring-2 focus:ring-[#b2571b]/20 shadow-inner text-sm" 
              value={tituloAviso} 
              onChange={(e) => setTituloAviso(e.target.value)} 
            />
            <textarea 
              placeholder="Digite a mensagem rápida para o mural..." 
              className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] p-5 mb-4 h-28 outline-none focus:ring-2 focus:ring-[#b2571b]/20 shadow-inner text-sm resize-none" 
              value={msgAviso} 
              onChange={(e) => setMsgAviso(e.target.value)} 
            />
            
            <label className="flex items-center gap-3 p-5 bg-red-50 hover:bg-red-100 rounded-[1.5rem] cursor-pointer mb-8 transition-colors border border-red-100">
              <input type="checkbox" checked={isUrgente} onChange={(e) => setIsUrgente(e.target.checked)} className="w-5 h-5 accent-red-600 rounded" />
              <span className="font-black text-red-600 text-[10px] uppercase tracking-widest">Marcar como Urgente 🚨</span>
            </label>
            
            <button 
              onClick={handlePublicarAviso} 
              className="w-full bg-[#1d2a13] hover:bg-black text-white font-black py-4 rounded-[1.5rem] transition-colors shadow-lg flex justify-center items-center gap-2"
            >
              DISPARAR AVISO
            </button>
          </section>

          {/* Estatuto do Parque */}
          <section className="bg-gradient-to-br from-[#1d2a13] to-[#2c3f1d] p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
             <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="flex items-center gap-4">
                 <div className="bg-white/10 p-3 rounded-2xl text-white"><FileText size={24} /></div>
                 <h2 className="text-xl font-black text-white uppercase tracking-tight">Estatuto Oficial</h2>
               </div>
               
               <label className="flex items-center gap-2 bg-white hover:bg-slate-100 text-[#1d2a13] px-5 py-2.5 rounded-full cursor-pointer transition-colors shadow-sm text-xs font-bold uppercase tracking-widest">
                 {carregandoPDF ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                 {carregandoPDF ? 'LENDO...' : 'IMPORTAR PDF'}
                 <input type="file" accept=".pdf" className="hidden" onChange={handleImportarPDF} disabled={carregandoPDF} />
               </label>
            </div>
            
            <textarea 
              placeholder="Importe um PDF para povoar este documento ou cole o texto do regulamento aqui..." 
              className="w-full bg-white/5 border border-white/10 text-white rounded-[1.5rem] p-5 mb-8 h-48 outline-none focus:ring-2 focus:ring-white/20 text-sm resize-none whitespace-pre-wrap leading-relaxed relative z-10 custom-scrollbar placeholder-white/30" 
              value={estatutoText} 
              onChange={(e) => setEstatutoText(e.target.value)} 
            />
            
            <button 
              onClick={handleAtualizarEstatuto} 
              disabled={carregando}
              className="w-full bg-[#eaf3de] hover:bg-white text-[#1d2a13] font-black py-4 rounded-[1.5rem] transition-colors shadow-lg flex justify-center items-center gap-2 relative z-10 disabled:opacity-50"
            >
              {carregando ? 'Salvando...' : 'ATUALIZAR ESTATUTO DO PARQUE'}
            </button>
            <ShieldCheck className="absolute -right-10 -bottom-10 text-white/5" size={200} />
          </section>

          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#e4eed7] p-3 rounded-2xl text-[#4a5937]"><Upload size={24} /></div>
              <div>
                <h2 className="text-xl font-black text-[#1d2a13] uppercase tracking-tight">Emails Permitidos</h2>
                <p className="text-[10px] text-[#2c3f1d]/70 uppercase tracking-[0.2em]">Gerencie autorizações de cadastro</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <label className="sm:col-span-3 block">
                <span className="text-[10px] font-black text-[#2c3f1d]/70 uppercase tracking-[0.2em] mb-2 block">Email autorizado</span>
                <input
                  type="email"
                  placeholder="nome@exemplo.com"
                  value={emailPermitidoManual}
                  onChange={(e) => setEmailPermitidoManual(e.target.value)}
                  className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-[1.5rem] px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                />
              </label>
              <label>
                <span className="text-[10px] font-black text-[#2c3f1d]/70 uppercase tracking-[0.2em] mb-2 block">Nome (opcional)</span>
                <input
                  type="text"
                  placeholder="Nome do autorizado"
                  value={nomePermitidoManual}
                  onChange={(e) => setNomePermitidoManual(e.target.value)}
                  className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-[1.5rem] px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                />
              </label>
              <label>
                <span className="text-[10px] font-black text-[#2c3f1d]/70 uppercase tracking-[0.2em] mb-2 block">Chácara (opcional)</span>
                <input
                  type="text"
                  placeholder="Chácara / Unidade"
                  value={chacaraPermitidoManual}
                  onChange={(e) => setChacaraPermitidoManual(e.target.value)}
                  className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-[1.5rem] px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                />
              </label>
            </div>

            <button
              onClick={handleAdicionarEmailPermitido}
              disabled={carregandoEmailsPermitidos}
              className="w-full bg-[#4a5937] hover:bg-[#323d24] text-white font-black py-4 rounded-[1.5rem] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} />
              {carregandoEmailsPermitidos ? 'Adicionando...' : 'Adicionar Email Permitido'}
            </button>

            <div className="mt-8 border-t border-[#e4eed7] pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-black text-[#1d2a13] uppercase tracking-tight">Importar lista de emails</p>
                  <p className="text-[10px] text-[#2c3f1d]/60 mt-1">Envie um arquivo PDF ou TXT com emails para autorizar cadastramentos.</p>
                </div>
                <label className="flex items-center gap-2 bg-[#4a5937] hover:bg-[#323d24] text-white px-4 py-3 rounded-full cursor-pointer text-xs font-black uppercase tracking-widest transition-colors shadow-sm">
                  <Upload size={14} />
                  {carregandoEmailsPermitidos ? 'Importando...' : 'Selecionar PDF / TXT'}
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={handleImportarEmailsPermitidos}
                    disabled={carregandoEmailsPermitidos}
                  />
                </label>
              </div>
              <p className="text-[10px] text-[#2c3f1d]/60">O sistema extrai emails automaticamente. Cada email válido será inserido ou atualizado na tabela.</p>
            </div>

            {mensagemEmailsPermitidos && (
              <div className="mt-6 bg-[#eaf3de] border border-[#4a5937]/20 text-[#4a5937] p-4 rounded-2xl text-sm">
                {mensagemEmailsPermitidos}
              </div>
            )}
          </section>

          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#e4eed7] p-3 rounded-2xl text-[#4a5937]"><Search size={24} /></div>
              <div>
                <h2 className="text-xl font-black text-[#1d2a13] uppercase tracking-tight">Lista de Emails Permitidos</h2>
                <p className="text-[10px] text-[#2c3f1d]/70 uppercase tracking-[0.2em]">Busca rápida entre emails autorizados</p>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5937]/50" />
                <input
                  type="text"
                  placeholder="Buscar email autorizado..."
                  value={pesquisaEmailsPermitidos}
                  onChange={(e) => setPesquisaEmailsPermitidos(e.target.value)}
                  className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-[1.5rem] pl-12 pr-5 py-4 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                />
              </div>
              <button
                onClick={() => carregarEmailsPermitidos(pesquisaEmailsPermitidos)}
                className="inline-flex items-center gap-2 bg-[#4a5937] hover:bg-[#323d24] text-white px-5 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-colors"
              >
                <Reload size={14} />
                Atualizar lista
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto pr-2 space-y-3">
              {carregandoEmailsPermitidosList ? (
                <div className="py-12 flex items-center justify-center text-[#4a5937]">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              ) : emailsPermitidos
                  .filter((item) =>
                    !pesquisaEmailsPermitidos || item.email.toLowerCase().includes(pesquisaEmailsPermitidos.toLowerCase())
                  )
                  .map((item) => (
                    <div key={item.id || item.email} className="bg-[#f8fbf3] rounded-2xl p-4 border border-[#e4eed7]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-black text-sm text-[#1d2a13] truncate">{item.email}</p>
                          <p className="text-[10px] text-[#2c3f1d]/70 mt-2">
                            {item.nome ? `Nome: ${item.nome}` : 'Nome não informado'}
                          </p>
                          <p className="text-[10px] text-[#2c3f1d]/70 mt-1">
                            {item.chacara ? `Chácara: ${item.chacara}` : 'Chácara não informada'}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${item.ativo ? 'bg-[#e4eed7] text-[#4a5937]' : 'bg-red-50 text-red-600'}`}>
                          {item.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#e4eed7] p-3 rounded-2xl text-[#4a5937]"><Users size={24} /></div>
                <h2 className="text-xl font-black text-[#1d2a13] uppercase tracking-tight">Relatorio de Usuarios</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPesquisaUsuario(''); // Limpa o campo
                    setMostrarTodos(true); // Ativa o modo "ver todos"
                    setUsuariosFiltrados(usuarios); // Carrega todos os usuários
                  }}
                  className="bg-[#4a5937] hover:bg-[#323d24] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Ver Todos
                </button>
                <button
                  onClick={carregarUsuarios}
                  className="bg-[#f4f7ef] hover:bg-[#e4eed7] text-[#4a5937] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Atualizar
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou email..."
                  value={pesquisaUsuario}
                  onChange={(e) => setPesquisaUsuario(e.target.value)}
                  className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-xl px-12 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20 transition-all"
                />
                <div className="absolute left-3 top-1/2 text-[#4a5937]/40" style={{ transform: 'translateY(-50%)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                {pesquisaUsuario && (
                  <button
                    onClick={() => setPesquisaUsuario('')}
                    className="absolute right-3 top-1/2 text-[#4a5937]/40 hover:text-[#4a5937] transition-colors"
                    style={{ transform: 'translateY(-50%)' }}
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
              {pesquisaUsuario && (
                <div className="mt-2 text-xs text-[#4a5937]/60">
                  {usuariosFiltrados.length} resultado(s) encontrado(s)
                </div>
              )}
            </div>

            {(pesquisaUsuario || mostrarTodos) && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {erroUsuarios ? (
                  <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-3">
                    {erroUsuarios}
                  </div>
                ) : null}
                {carregandoUsuarios ? (
                  <div className="py-10 flex items-center justify-center text-[#4a5937]">
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                ) : (pesquisaUsuario && usuariosFiltrados.length === 0) ? (
                  <p className="text-sm text-[#2c3f1d]/50 italic">
                    Nenhum usuário encontrado para esta pesquisa.
                  </p>
                ) : (
                  (mostrarTodos ? usuarios : usuariosFiltrados).map((usuario) => (
                    <div key={usuario.id} className="bg-[#f8fbf3] rounded-2xl p-4 border border-[#e4eed7]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-sm text-[#1d2a13] truncate">{usuario.nome || 'Morador sem nome'}</p>
                          <p className="text-xs text-[#2c3f1d]/70 mt-1 break-all">{usuario.email}</p>
                          <p className="text-[10px] text-[#4a5937]/70 font-bold uppercase tracking-widest mt-2">
                            Chacara: {usuario.chacara || 'Nao informada'}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => enviarResetSenha(usuario.email)}
                            disabled={!usuario.email || resetandoEmail === usuario.email}
                            className="flex items-center gap-2 bg-[#1d2a13] hover:bg-black text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                          >
                            {resetandoEmail === usuario.email ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                            Resetar
                          </button>
                          <button
                            onClick={() => excluirUsuario(usuario.id, usuario.nome || 'Morador', usuario.email)}
                            disabled={excluindoUsuario === usuario.id}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                          >
                            {excluindoUsuario === usuario.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          {/* Usuários Logados em Tempo Real */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-[#dbeaeb] p-3 rounded-2xl text-[#4a5937]"><Users size={24} /></div>
                <h2 className="text-xl font-black text-[#1d2a13] uppercase tracking-tight">Usuários Logados</h2>
                <span className="bg-[#e4eed7] text-[#4a5937] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#d0dfbb]">
                  {sessoesAtivas.length} Online
                </span>
              </div>
              <button
                onClick={carregarSessoesAtivas}
                className="bg-[#f4f7ef] hover:bg-[#e4eed7] text-[#4a5937] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Atualizar
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {erroSessoes ? (
                <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl px-4 py-3">
                  {erroSessoes}
                </div>
              ) : null}
              {carregandoSessoes ? (
                <div className="py-10 flex items-center justify-center text-[#4a5937]">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              ) : (
                <>
                  {sessoesAtivas && sessoesAtivas.length > 0 ? (
                    sessoesAtivas.map((sessao) => (
                      <div key={sessao.id} className="bg-[#f8fbf3] rounded-2xl p-4 border border-[#e4eed7] relative mb-4">
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-sm text-[#1d2a13] truncate">{sessao.user_name || 'Usuário'}</p>
                            <p className="text-xs text-[#2c3f1d]/70 mt-1 break-all">{sessao.user_email || 'Email não disponível'}</p>
                            <div className="flex items-center gap-4 mt-2 text-[10px] text-[#4a5937]/70">
                              <span className="font-bold uppercase tracking-widest">
                                Entrou: {sessao.inicio_sessao ? new Date(sessao.inicio_sessao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </span>
                              <span className="font-bold uppercase tracking-widest">
                                Última atividade: {sessao.ultima_atividade ? new Date(sessao.ultima_atividade).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#2c3f1d]/50 italic">Nenhum usuário logado no momento.</p>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        {/* COLUNA DIREITA (GESTÃO E MONITORAMENTO LIVE) */}
        <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
          <div className="flex items-center gap-3 mb-8 px-2">
            <Clock size={20} className="text-[#4a5937]" />
            <h3 className="font-black text-sm uppercase tracking-[0.3em] text-[#4a5937]">Monitoramento em Tempo Real</h3>
          </div>

          <div className="space-y-6">
            
            {/* OBRAS ATIVAS MAPPING */}
            {galeria.map((obraItem) => (
              <div key={obraItem.id} className="bg-white p-6 rounded-[2rem] shadow-sm relative border border-transparent hover:border-[#4a5937]/10 transition-all flex flex-col md:flex-row gap-6 items-start">
                
                <button onClick={() => deletarObra(obraItem.id)} className="absolute top-4 right-4 p-3 bg-red-50 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm">
                  <Trash2 size={16} />
                </button>
                
                <img src={obraItem.imagem_url} className="w-full md:w-48 md:h-48 rounded-[1.5rem] object-cover shadow-md" alt="obra" />
                
                <div className="flex-1 w-full mt-2 md:mt-0">
                  <div className="flex justify-between mb-4 pr-14">
                    <span className="inline-block bg-[#e4eed7] text-[#4a5937] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-[#d0dfbb]">
                      {obraItem.progresso}% Concluída
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">
                       <Heart size={12} fill="currentColor" /> {
                         (() => {
                           if (!obraItem.likes) return 0;
                           if (Array.isArray(obraItem.likes)) {
                             return obraItem.likes.filter((id: any) => typeof id === 'string').length;
                           }
                           return 1;
                         })()
                       }
                    </div>
                  </div>

                  <p className="text-sm font-medium text-[#2c3f1d] leading-relaxed mb-6">{obraItem.descricao}</p>

                  <div className="mb-6">
                    <label className="text-[9px] font-black text-[#2c3f1d]/50 uppercase tracking-widest mb-2 block">Ajuste de Progresso Manual:</label>
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
                      className="w-full h-2 bg-[#f4f7ef] rounded-full appearance-none cursor-pointer accent-[#4a5937]"
                    />
                  </div>

                  {/* Comentários Feedback */}
                  <div className="bg-[#f4f7ef] rounded-[1.5rem] p-5">
                    <p className="text-[9px] font-black text-[#4a5937]/60 uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
                       <Megaphone size={12}/> Feedback dos Moradores
                    </p>
                    <div className="space-y-3 max-h-32 overflow-y-auto pr-2">
                      {obraItem.comentarios_obras?.length > 0 ? obraItem.comentarios_obras.map((c: any) => (
                        <div key={c.id} className="text-[11px] leading-tight flex flex-col gap-1 pb-3 border-b border-[#4a5937]/10 last:border-0 last:pb-0">
                          <span className="font-black text-[#1d2a13] uppercase tracking-wide">{c.usuario_nome}</span>
                          <span className="text-[#2c3f1d]/80 italic">"{c.texto}"</span>
                        </div>
                      )) : <p className="text-[10px] text-[#4a5937]/40 font-medium italic">Nenhum comentário recebido ainda.</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* AVISOS MAPPING */}
            {avisos.map((avisoItem) => (
              <div key={avisoItem.id} className={`bg-white p-6 rounded-[2rem] shadow-sm border-l-[6px] relative flex items-start gap-4 ${avisoItem.urgente ? 'border-l-red-500 bg-red-50/30' : 'border-l-[#4a5937]'}`}>
                <div className={`p-4 rounded-2xl ${avisoItem.urgente ? 'bg-red-100 text-red-600' : 'bg-[#e4eed7] text-[#4a5937]'}`}>
                   <Megaphone size={20} />
                </div>
                <div className="flex-1 pt-1 pr-12">
                  <h4 className="font-black text-[#1d2a13] uppercase text-[13px] mb-2">{avisoItem.titulo}</h4>
                  <p className="text-xs text-[#2c3f1d]/70 font-medium leading-relaxed">{avisoItem.conteudo}</p>
                </div>
                <button onClick={() => deletarAviso(avisoItem.id)} className="absolute top-6 right-6 p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            
          </div>
        </div>
      </main>
    </div>
  );
}
