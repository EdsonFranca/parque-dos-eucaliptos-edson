'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginMorador() {
  // Estados para controlar o que o usuário digita
  const [senha, setSenha] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Estados para controlar a tela
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);
  const [verSenha, setVerSenha] = useState(false);

  const router = useRouter();

  // Garante que a senha inicial exista no navegador para o primeiro teste
  useEffect(() => {
    const senhaAtual = localStorage.getItem('senha_morador');
    if (!senhaAtual) {
      localStorage.setItem('senha_morador', 'morador123');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const senhaSalva = localStorage.getItem('senha_morador') || 'morador123';

    // PASSO 1: Login Comum
    if (!primeiroAcesso) {
      if (senha.trim() === senhaSalva) {
        // Se for a senha padrão 'morador123', obriga a trocar
        if (senhaSalva === 'morador123') {
          setPrimeiroAcesso(true);
        } else {
          router.push('/membros');
        }
      } else {
        alert("Senha incorreta! Tente 'morador123'");
      }
    }
    // PASSO 2: Troca de Senha Obrigatória
    else {
      if (novaSenha !== confirmarSenha) {
        return alert("As senhas não coincidem! Verifique o que digitou.");
      }
      if (novaSenha.length < 4) {
        return alert("A nova senha deve ter pelo menos 4 caracteres.");
      }

      // Salva a nova senha definitiva e vai para o Perfil
      localStorage.setItem('senha_morador', novaSenha);
      alert("Senha definida com sucesso! Agora complete seu perfil.");
      router.push('/membros/perfil');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-black" translate="no">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm border-t-[12px] border-blue-800 relative">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Portal Morador 🏠</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Acesso Restrito</p>
        </div>

        <div className="space-y-4 mb-6">
          {!primeiroAcesso ? (
            /* CAMPO DE LOGIN NORMAL */
            <div className="relative">
              <input
                type={verSenha ? "text" : "password"}
                placeholder="Senha do Condomínio"
                className="w-full p-5 border-2 border-gray-100 bg-gray-50 rounded-2xl outline-none focus:border-blue-500 font-bold"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button type="button" onClick={() => setVerSenha(!verSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
                {verSenha ? '👁️' : '🙈'}
              </button>
            </div>
          ) : (
            /* CAMPOS DE TROCA DE SENHA */
            <div className="space-y-4">
              <p className="text-[10px] font-black text-orange-600 uppercase text-center mb-2">
                ⚠️ Crie uma senha pessoal:
              </p>
              <div className="relative">
                <input
                  type={verSenha ? "text" : "password"}
                  placeholder="Nova Senha"
                  className="w-full p-5 border-2 border-orange-400 bg-orange-50 rounded-2xl outline-none font-bold"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <input
                  type={verSenha ? "text" : "password"}
                  placeholder="Confirme a Nova Senha"
                  className="w-full p-5 border-2 border-orange-400 bg-orange-50 rounded-2xl outline-none font-bold"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-blue-800 text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-lg hover:bg-blue-900 transition-all active:scale-95">
          {primeiroAcesso ? 'Confirmar Senha' : 'Entrar no Mural'}
        </button>

        <p className="mt-6 text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest">
          {primeiroAcesso ? "Guarde sua nova senha com cuidado" : "Esqueceu a senha? Fale com o Síndico"}
        </p>
      </form>
    </div>
  );
}
