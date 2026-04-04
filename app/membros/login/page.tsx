'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { User, Lock, ArrowRight, TreePine, AlertCircle, Eye, EyeOff } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginMorador() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [hasMounted, setHasMounted] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setErro('Acesso Negado: Verifique seu e-mail e senha.');
        setCarregando(false);
      } else {
        // VERIFICAÇÃO DE PERFIL NO BANCO
        const { data: perfil } = await supabase
          .from('perfis_moradores')
          .select('perfil_completo')
          .eq('id', data.user.id)
          .single();

        if (perfil?.perfil_completo) {
          router.push('/membros');
        } else {
          router.push('/membros/perfil');
        }
      }
    } catch (err) {
      setErro('Erro na conexão com o servidor.');
      setCarregando(false);
    }
  }; // <--- ESSA CHAVE FECHA O HANDLELOGIN

  if (!hasMounted) return <div className="min-h-screen bg-[#435334]" />;

  return (
    <div className="min-h-screen bg-[url('https://unsplash.com')] bg-cover bg-fixed bg-center flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-500">
        <form
          onSubmit={handleLogin}
          className="bg-[#eef0e5]/95 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white/50 relative overflow-hidden"
        >
          <div className="absolute -bottom-10 -left-10 opacity-5 text-[#435334]">
            <TreePine size={250} />
          </div>

          <header className="text-center mb-10 relative">
            <div className="bg-[#435334] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3 hover:rotate-0 transition-transform">
              <TreePine className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black text-[#435334] uppercase tracking-tighter">Portal do Morador</h1>
            <p className="text-[10px] font-black text-[#435334]/50 uppercase tracking-[0.3em] mt-2">Parque dos Eucaliptos</p>
          </header>

          <div className="space-y-4 mb-8 relative">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#435334]/60 uppercase ml-4 tracking-widest">E-mail de Acesso</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#435334]/30">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full bg-white border-2 border-[#435334]/5 rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-[#435334]/30 transition-all shadow-inner text-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#435334]/60 uppercase ml-4 tracking-widest">Senha Pessoal</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#435334]/30">
                  <Lock size={18} />
                </div>
                <input
                  type={verSenha ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-[#435334]/5 rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-[#435334]/30 transition-all shadow-inner text-black"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVerSenha(!verSenha)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#435334]/30 hover:text-[#435334]"
                >
                  {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in shake duration-300">
                <AlertCircle className="text-red-500" size={14} />
                <p className="text-[10px] text-red-600 font-bold uppercase">{erro}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#435334] hover:bg-[#2d3a22] text-white font-black py-5 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 tracking-widest text-xs disabled:opacity-50"
          >
            {carregando ? 'AUTENTICANDO...' : 'ENTRAR NO PORTAL'}
            <ArrowRight size={18} />
          </button>

          <div className="mt-8 text-center space-y-4">
            <button type="button" className="text-[9px] font-black text-[#435334]/40 uppercase tracking-widest hover:text-[#435334] transition-colors">
              Esqueceu sua senha?
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">
          Ambiente Seguro &bull; Residencial Premium
        </p>
      </div>
    </div>
  );
}
