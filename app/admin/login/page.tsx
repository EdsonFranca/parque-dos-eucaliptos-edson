'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    console.log("1. Iniciei a função");

    try {
        console.log("2. Tentando acessar o objeto supabase...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
console.log("3. Supabase respondeu!");
      if (error) {
        setErro("E-mail ou senha incorretos.");
        setCarregando(false);
        return;
      }

      if (data?.session) {
        // Redirecionamento único e definitivo
        window.location.href = '/admin/dashboard';
      }
    } catch (err) {
      setErro("Erro interno no sistema.");
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#9ea392] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[400px] bg-[#eef0e5] rounded-[3rem] p-10 shadow-sm relative overflow-hidden">

        <div className="flex justify-center mb-8">
          <div className="bg-[#435334] p-3 rounded-2xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        </div>

        <header className="text-center mb-10">
          <h1 className="text-xl font-black text-[#435334] uppercase tracking-wider">Painel do Síndico</h1>
          <p className="text-[9px] font-bold text-[#435334]/60 uppercase tracking-[0.3em] mt-1">Parque dos Eucaliptos</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#435334]/60 uppercase ml-1 tracking-widest">E-mail de Acesso</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#435334]/30" size={16} />
              <input
                type="email"
                className="w-full bg-[#e4e9f7]/50 border-none rounded-2xl p-4 pl-14 text-sm font-medium text-[#435334] outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@teste.com.br"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#435334]/60 uppercase ml-1 tracking-widest">Senha Pessoal</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#435334]/30" size={16} />
              <input
                type={verSenha ? "text" : "password"}
                className="w-full bg-[#e4e9f7]/50 border-none rounded-2xl p-4 pl-14 text-sm font-medium text-[#435334] outline-none"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••••"
                required
              />
              {/* CORREÇÃO: Mudei para type="button" para não disparar o login sozinho */}
              <button
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#435334]/30 hover:text-[#435334]"
              >
                {verSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {erro && <p className="text-[10px] text-center font-bold text-red-500 uppercase">{erro}</p>}

          <button
            disabled={carregando}
            type="submit"
            className="w-full bg-[#435334] hover:bg-[#354229] text-white font-bold py-4 rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm tracking-widest uppercase disabled:opacity-50"
          >
            {carregando ? <Loader2 className="animate-spin" size={18} /> : "Entrar no Painel"}
            {!carregando && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
