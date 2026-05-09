'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Mantendo sua importação original
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);

    if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      if (hashParams.get('type') === 'recovery') {
        setModoRecuperacao(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      console.log('Iniciando login com:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      console.log('Resultado do signIn:', { data, error });

      if (error) {
        console.error('Erro no signIn:', error);
        setErro("Email ou senha inválidos");
        setCarregando(false);
        return;
      }

      if (data?.user) {
        console.log('Usuário autenticado, verificando perfil admin...');
        const { data: perfil, error: perfilError } = await supabase
          .from('perfis_moradores')
          .select('tipo_usuario')
          .eq('id', data.user.id)
          .single();

        console.log('Verificação de perfil:', { perfil, perfilError });

        if (perfilError || perfil?.tipo_usuario !== 'admin') {
          console.error('Acesso negado:', { perfilError, perfil });
          setErro("Acesso negado: você não é administrador.");
          await supabase.auth.signOut();
          setCarregando(false);
          return;
        }

        console.log('Login bem-sucedido, redirecionando para dashboard...');
        router.push('/admin/dashboard');
      }

    } catch (err) {
      console.error('Erro no handleLogin:', err);
      setErro("Erro inesperado ao fazer login");
    } finally {
      setCarregando(false);
    }
  };

  const handleEsqueciSenha = async () => {
    setErro('');
    setSucesso('');

    if (!email) {
      setErro('Informe seu e-mail para receber o link de recuperação.');
      return;
    }

    setCarregando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });

      if (error) {
        setErro('Não foi possível enviar o e-mail de recuperação.');
      } else {
        setSucesso('Enviamos um link de recuperação para seu e-mail.');
      }
    } catch (err) {
      setErro('Erro de conexão ao solicitar recuperação.');
    } finally {
      setCarregando(false);
    }
  };

  const handleAtualizarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!novaSenha || novaSenha.length < 6) {
      setErro('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErro('A confirmação da senha não confere.');
      return;
    }

    setCarregando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) {
        setErro('Não foi possível atualizar a senha.');
      } else {
        setSucesso('Senha atualizada com sucesso. Faça login com a nova senha.');
        setModoRecuperacao(false);
        setNovaSenha('');
        setConfirmarNovaSenha('');
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/admin/login');
        }
      }
    } catch (err) {
      setErro('Erro de conexão ao atualizar senha.');
    } finally {
      setCarregando(false);
    }
  };

  if (!hasMounted) return <div className="min-h-screen bg-[#eaf3de]" />;

  return (
    <div className="flex h-screen bg-[#eaf3de] text-[#2c3f1d] font-sans overflow-hidden">
      
      {/* 50% LEFT - HERO IMAGE DA LOGIN */}
      <div className="hidden lg:block w-1/2 relative bg-[#1d2a13]">
        <img 
          src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80 backdrop-grayscale"
          style={{ filter: "grayscale(10%) contrast(110%)" }}
          alt="Administração"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d2a13] via-[#1d2a13]/60 to-transparent flex flex-col justify-end p-16">
          <div className="mb-8">
            <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-xl">
               <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-5xl font-black text-white leading-[1.1] mb-6">
              Controle. <br/>Gestão. <br/>Transparência.
            </h1>
            <p className="text-[#eaf3de]/80 font-medium text-lg max-w-md">
              Área restrita à administração para controle efetivo de benfeitorias, murais e IA.
            </p>
          </div>
        </div>
      </div>

      {/* 50% RIGHT - FORM */}
      <div className="flex-1 flex flex-col h-full relative">
         
         {/* Botão de Voltar Opcional lá no topo */}
         <header className="flex items-center justify-start px-10 py-8 shrink-0">
           <button onClick={() => router.push('/')} className="text-[#2c3f1d]/50 hover:text-[#2c3f1d] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
             &larr; Voltar
           </button>
         </header>

         <main className="flex-1 flex flex-col items-center justify-center px-10 pb-20 max-w-sm mx-auto w-full">
            <div className="text-center mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="inline-block bg-[#1d2a13]/10 text-[#1d2a13] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4 border border-[#1d2a13]/20">
                Acesso Administrativo
              </span>
              <h2 className="text-3xl font-black mb-2 text-[#1d2a13]">Painel do Síndico</h2>
              <p className="text-sm text-[#2c3f1d]/60 font-medium">Autentique-se com credenciais autorizadas.</p>
            </div>

            <form onSubmit={modoRecuperacao ? handleAtualizarSenha : handleLogin} className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
               
              <div className="space-y-1 relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2c3f1d]/40">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  placeholder="admin@condominio.com"
                  className="w-full bg-white border border-white focus:border-[#4a5937]/30 rounded-[1.5rem] p-4 pl-14 text-sm font-medium outline-none transition-all shadow-sm text-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {modoRecuperacao ? (
                <>
                  <div className="space-y-1 relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2c3f1d]/40">
                      <Lock size={18} />
                    </div>
                    <input
                      type={verSenha ? "text" : "password"}
                      placeholder="Nova senha administrativa"
                      className="w-full bg-white border border-white focus:border-[#4a5937]/30 rounded-[1.5rem] p-4 pl-14 text-sm font-medium outline-none transition-all shadow-sm text-black"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setVerSenha(!verSenha)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2c3f1d]/40 hover:text-[#4a5937] transition-colors"
                    >
                      {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="space-y-1 relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2c3f1d]/40">
                      <Lock size={18} />
                    </div>
                    <input
                      type={verSenha ? "text" : "password"}
                      placeholder="Confirmar nova senha"
                      className="w-full bg-white border border-white focus:border-[#4a5937]/30 rounded-[1.5rem] p-4 pl-14 text-sm font-medium outline-none transition-all shadow-sm text-black"
                      value={confirmarNovaSenha}
                      onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1 relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2c3f1d]/40">
                    <Lock size={18} />
                  </div>
                  <input
                    type={verSenha ? "text" : "password"}
                    placeholder="Senha Administrativa"
                    className="w-full bg-white border border-white focus:border-[#4a5937]/30 rounded-[1.5rem] p-4 pl-14 text-sm font-medium outline-none transition-all shadow-sm text-black"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha(!verSenha)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#2c3f1d]/40 hover:text-[#4a5937] transition-colors"
                  >
                    {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}

              {erro && (
                <div className="flex items-center gap-2 p-3 bg-red-100/50 border border-red-200 rounded-xl animate-in shake duration-300">
                  <AlertCircle className="text-red-600 shrink-0" size={14} />
                  <p className="text-[10px] text-red-600 font-bold uppercase">{erro}</p>
                </div>
              )}

              {sucesso && (
                <div className="flex items-center gap-2 p-3 bg-emerald-100/60 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] text-emerald-700 font-bold uppercase">{sucesso}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-[#1d2a13] hover:bg-[#2c3f1d] text-white py-4 rounded-[1.5rem] shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 text-sm font-bold disabled:opacity-50 mt-2"
              >
                {carregando ? (
                  <><Loader2 className="animate-spin" size={18} /> Autenticando Autoridade...</>
                ) : (
                  <><ArrowRight size={18} /> {modoRecuperacao ? 'Salvar nova senha' : 'Acessar Painel'}</>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              {!modoRecuperacao ? (
                <button
                  type="button"
                  onClick={handleEsqueciSenha}
                  className="text-[10px] font-bold text-[#2c3f1d]/50 hover:text-[#4a5937] uppercase tracking-[0.1em] transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              ) : null}
              <p className="text-[#2c3f1d]/40 text-[9px] font-black uppercase tracking-[0.3em] mt-3">
                Acesso Restrito &bull; Nível Administrativo
              </p>
            </div>
         </main>
      </div>
    </div>
  );
}
