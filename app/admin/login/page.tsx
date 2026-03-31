'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginAdmin() {
  const [senha, setSenha] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const router = useRouter();

  // Garante a senha inicial padrão
  useEffect(() => {
    if (!localStorage.getItem('senha_admin')) {
      localStorage.setItem('senha_admin', 'admin123');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const senhaSalva = localStorage.getItem('senha_admin') || 'admin123';

    if (!primeiroAcesso) {
      if (senha === senhaSalva) {
        if (senhaSalva === 'admin123') {
          setPrimeiroAcesso(true);
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        alert("Senha administrativa incorreta!");
      }
    } else {
      if (novaSenha !== confirmarSenha) {
        return alert("As senhas não coincidem!");
      }
      if (novaSenha.length < 4) {
        return alert("A nova senha deve ter pelo menos 4 caracteres.");
      }

      localStorage.setItem('senha_admin', novaSenha);
      alert("Senha alterada com sucesso!");
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-black" translate="no">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border-t-8 border-blue-600 relative">
        <h1 className="text-xl font-black text-center mb-6 uppercase italic tracking-tighter text-blue-900">Painel Síndico 🔑</h1>

        <div className="space-y-4 mb-6">
          {!primeiroAcesso ? (
            /* LOGIN NORMAL */
            <div className="relative">
              <input
                type={verSenha ? "text" : "password"}
                placeholder="Senha de Acesso"
                className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-600 font-bold"
                value={senha} onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button type="button" onClick={() => setVerSenha(!verSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-xl">
                {verSenha ? '👁️' : '🙈'}
              </button>
            </div>
          ) : (
            /* TROCA DE SENHA */
            <div className="space-y-4">
              <p className="text-[10px] font-black text-orange-600 uppercase text-center">Defina sua senha definitiva:</p>
              <input
                type={verSenha ? "text" : "password"}
                placeholder="Nova Senha"
                className="w-full p-4 border-2 border-orange-200 rounded-2xl outline-none focus:border-blue-600 font-bold"
                value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
              <input
                type={verSenha ? "text" : "password"}
                placeholder="Confirme a Nova Senha"
                className="w-full p-4 border-2 border-orange-200 rounded-2xl outline-none focus:border-blue-600 font-bold"
                value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition uppercase tracking-widest shadow-lg">
          {primeiroAcesso ? 'Salvar e Entrar' : 'Acessar Painel'}
        </button>

        <p className="mt-6 text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest">
          Acesso restrito ao administrador do sistema
        </p>
      </form>
    </div>
  );
}
