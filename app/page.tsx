'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { TreePine, Users, ShieldCheck, Sparkles, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const router = useRouter();
  const [statusIA, setStatusIA] = useState('Aguardando...');
  const [hasMounted, setHasMounted] = useState(false);
  const [mostrarPopupCadastro, setMostrarPopupCadastro] = useState(false);
  const [emailCadastro, setEmailCadastro] = useState('');
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [resultadoVerificacao, setResultadoVerificacao] = useState<any>(null);

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

  const verificarEmailCadastro = async () => {
    if (!emailCadastro.trim()) {
      alert('Por favor, digite seu email.');
      return;
    }

    setVerificandoEmail(true);
    setResultadoVerificacao(null);

    try {
      const response = await fetch('/api/auth/verificar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailCadastro }),
      });

      const data = await response.json();
      setResultadoVerificacao(data);

      if (!response.ok) {
        alert(data.error || 'Erro ao verificar email.');
        setMostrarPopupCadastro(false);
      }
    } catch (err) {
      alert('Erro de conexão. Tente novamente.');
      setMostrarPopupCadastro(false);
    } finally {
      setVerificandoEmail(false);
    }
  };

  const irParaCadastro = () => {
    if (resultadoVerificacao?.permitido) {
      // Armazenar dados pré-preenchidos para o cadastro
      localStorage.setItem('cadastro_pre_preenchido', JSON.stringify({
        email: emailCadastro,
        nome: resultadoVerificacao.dados?.nome,
        chacara: resultadoVerificacao.dados?.chacara
      }));
      router.push('/membros/cadastro');
    }
  };

  if (!hasMounted) return <div className="min-h-screen bg-[#eaf3de]" />;

  return (
    <div className="flex min-h-screen bg-[#eaf3de] text-[#2c3f1d] font-sans overflow-auto">
      
      {/* 50% LEFT - HERO IMAGE */}
      <div className="hidden lg:flex w-1/2 relative bg-[#2c3f1d] items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
          alt="Floresta"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d2a13] via-[#2c3f1d]/40 to-transparent flex flex-col justify-center p-12">
          <div className="max-w-lg mx-auto">
            <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-xl">
               <TreePine className="text-white" size={32} />
            </div>
            <h1 className="text-5xl font-black text-white leading-[1.1] mb-6">
              Onde a natureza e a<br/>transparência se encontram.
            </h1>
            <p className="text-[#eaf3de]/80 font-medium text-lg max-w-md">
              Tecnologia, bem-estar e gestão inteligente <br/> para toda a sua família.
            </p>
          </div>
        </div>
      </div>

      {/* 50% RIGHT - LOGIN ACTIONS */}
      <div className="flex-1 flex flex-col min-h-screen relative">
         
         <header className="flex items-center justify-end px-4 py-4 lg:px-10 lg:py-8 shrink-0">
            {/* Status da IA Superior */}
            <div className="bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white flex items-center gap-2 shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
              {statusIA.includes('Erro') ? (
                <XCircle className="text-red-500" size={14} />
              ) : statusIA.includes('Pronto') ? (
                <CheckCircle2 className="text-[#4a5937]" size={14} />
              ) : (
                <Loader2 className="text-[#4a5937] animate-spin" size={14} />
              )}
              <span className="text-[9px] font-black text-[#2c3f1d] uppercase tracking-[0.15em] leading-none">
                {statusIA}
              </span>
            </div>
         </header>

         <main className="flex-1 flex flex-col items-center justify-start pt-10 px-4 pb-8 md:px-10 max-w-md mx-auto w-full">
            <div className="text-center mb-8 md:mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="inline-block bg-[#4a5937]/10 text-[#4a5937] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-6 border border-[#4a5937]/20">
                Portal de Acesso
              </span>
              <h2 className="text-4xl font-black mb-3 text-[#1d2a13]">Parque Dos Eucaliptos</h2>
              <p className="text-sm text-[#2c3f1d]/60 font-medium">Selecione o seu perfil para entrar no sistema do condomínio.</p>
            </div>

            <div className="w-full space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
               
               {/* Botão Morador */}
               <button
                 onClick={() => router.push('/membros/login')}
                 className="group relative w-full bg-white p-4 md:p-5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-white hover:border-[#4a5937]/20 overflow-hidden flex items-center gap-3 md:gap-4"
               >
                 <div className="bg-[#eaf4df] p-3 rounded-2xl text-[#4a5937] group-hover:scale-110 group-hover:bg-[#4a5937] group-hover:text-white transition-all">
                   <Users size={24} />
                 </div>
                 <div className="text-left flex-1">
                   <span className="block text-lg font-black text-[#1d2a13]">SOU MORADOR</span>
                   <span className="text-[10px] font-bold text-[#2c3f1d]/50 uppercase tracking-widest mt-1 hidden md:block">Acesso ao Mural e Zelador IA</span>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#2c3f1d]/30 group-hover:bg-[#4a5937]/10 group-hover:text-[#4a5937] transition-colors">
                    <ArrowRight size={16} />
                 </div>
               </button>

               {/* Botão Síndico */}
               <button
                 onClick={() => router.push('/admin/login')}
                 className="group relative w-full bg-[#1d2a13] p-4 md:p-5 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-[#1d2a13] overflow-hidden flex items-center gap-3 md:gap-4"
               >
                 <div className="bg-white/10 p-3 rounded-2xl text-white group-hover:scale-110 transition-transform">
                   <ShieldCheck size={24} />
                 </div>
                 <div className="text-left flex-1">
                   <span className="block text-lg font-black text-white">SÍNDICO</span>
                   <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1 hidden md:block">Gestão Administrativa</span>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <ArrowRight size={16} />
                 </div>
               </button>

               {/* Botão Cadastro */}
               <button
                 onClick={() => setMostrarPopupCadastro(true)}
                 className="group relative w-full bg-transparent border-2 border-dashed border-[#4a5937]/30 p-3 md:p-4 rounded-[2rem] hover:border-[#4a5937]/60 hover:bg-[#4a5937]/5 transition-all overflow-hidden flex items-center gap-3 md:gap-4"
               >
                 <div className="bg-[#e4eed7] p-3 rounded-2xl text-[#4a5937] group-hover:scale-110 group-hover:bg-[#4a5937] group-hover:text-white transition-all">
                   <Sparkles size={24} />
                 </div>
                 <div className="text-left flex-1">
                   <span className="block text-lg font-black text-[#1d2a13]">FAZER CADASTRO</span>
                   <span className="text-[10px] font-bold text-[#2c3f1d]/50 uppercase tracking-widest mt-1 hidden md:block">Novo morador autorizado</span>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-[#eaf4df] flex items-center justify-center text-[#4a5937]/30 group-hover:bg-[#4a5937]/10 group-hover:text-[#4a5937] transition-colors">
                    <ArrowRight size={16} />
                 </div>
               </button>

            </div>

            {/* Footer */}
            <footer className="mt-8 md:mt-12 text-center">
              <p className="text-[#2c3f1d]/40 text-[9px] font-black uppercase tracking-[0.3em]">
                Residencial Premium • 2026
              </p>
            </footer>

         </main>

        {/* Popup de Cadastro */}
        {mostrarPopupCadastro && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-[#1d2a13]">Verificar Cadastro</h3>
                <button
                  onClick={() => {
                    setMostrarPopupCadastro(false);
                    setEmailCadastro('');
                    setResultadoVerificacao(null);
                  }}
                  className="text-[#2c3f1d]/50 hover:text-[#2c3f1d] transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {!resultadoVerificacao ? (
                <>
                  <p className="text-sm text-[#2c3f1d]/70 mb-6">
                    Digite seu email para verificar se você está autorizado a se cadastrar no sistema.
                  </p>
                  
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={emailCadastro}
                    onChange={(e) => setEmailCadastro(e.target.value)}
                    className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-[1rem] px-4 py-3 text-sm mb-6 outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                    disabled={verificandoEmail}
                  />

                  <button
                    onClick={verificarEmailCadastro}
                    disabled={verificandoEmail || !emailCadastro.trim()}
                    className="w-full bg-[#4a5937] hover:bg-[#323d24] text-white py-3 rounded-[1rem] font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {verificandoEmail ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar Email'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className={`p-4 rounded-xl mb-6 ${
                    resultadoVerificacao.permitido 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {resultadoVerificacao.permitido ? (
                        <CheckCircle2 className="text-green-600" size={20} />
                      ) : (
                        <XCircle className="text-red-600" size={20} />
                      )}
                      <span className={`font-bold text-sm ${
                        resultadoVerificacao.permitido ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {resultadoVerificacao.permitido ? 'Email Autorizado!' : 'Email Não Autorizado'}
                      </span>
                    </div>
                    <p className={`text-xs ${
                      resultadoVerificacao.permitido ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {resultadoVerificacao.mensagem}
                    </p>
                  </div>

                  {resultadoVerificacao.permitido && resultadoVerificacao.dados && (
                    <div className="bg-[#f4f7ef] p-4 rounded-xl mb-6">
                      <p className="text-xs text-[#4a5937]/60 mb-2">Dados pré-preenchidos:</p>
                      <p className="text-sm font-medium text-[#1d2a13]">
                        Nome: {resultadoVerificacao.dados.nome || 'Não informado'}
                      </p>
                      <p className="text-sm font-medium text-[#1d2a13]">
                        Chácara: {resultadoVerificacao.dados.chacara || 'Não informada'}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {resultadoVerificacao.permitido ? (
                      <button
                        onClick={irParaCadastro}
                        className="flex-1 bg-[#4a5937] hover:bg-[#323d24] text-white py-3 rounded-[1rem] font-black text-sm transition-colors"
                      >
                        Continuar Cadastro
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setMostrarPopupCadastro(false);
                          setEmailCadastro('');
                          setResultadoVerificacao(null);
                        }}
                        className="flex-1 bg-[#2c3f1d] hover:bg-black text-white py-3 rounded-[1rem] font-black text-sm transition-colors"
                      >
                        Fechar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEmailCadastro('');
                        setResultadoVerificacao(null);
                      }}
                      className="flex-1 bg-transparent border border-[#4a5937]/30 text-[#4a5937] hover:bg-[#4a5937]/10 py-3 rounded-[1rem] font-black text-sm transition-colors"
                    >
                      Verificar Outro Email
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
