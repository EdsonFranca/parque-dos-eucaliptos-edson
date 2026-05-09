'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from 'lucide-react';

export default function ChecagemEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [permitido, setPermitido] = useState(false);
  const [dados, setDados] = useState<{ nome?: string | null; chacara?: string | null } | null>(null);

  const verificarEmail = async () => {
    if (!email.trim()) {
      setMensagem('Digite um email para verificar.');
      return;
    }

    setCarregando(true);
    setMensagem('');
    setPermitido(false);
    setDados(null);

    try {
      const response = await fetch('/api/auth/verificar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.error || 'Erro ao verificar o email.');
        return;
      }

      if (data.permitido) {
        setPermitido(true);
        setDados(data.dados || null);
        setMensagem('Email autorizado para cadastro. Você pode prosseguir.');
      } else {
        setMensagem('Este email não está autorizado para cadastro. Contate o síndico.');
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      setMensagem('Erro de conexão. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await verificarEmail();
  };

  const irParaCadastro = () => {
    if (!permitido) return;

    localStorage.setItem('cadastro_pre_preenchido', JSON.stringify({
      email: email.trim(),
      nome: dados?.nome || '',
      chacara: dados?.chacara || ''
    }));

    router.push('/membros/cadastro');
  };

  return (
    <div className="min-h-screen bg-[#eaf3de] text-[#2c3f1d] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2rem] shadow-lg p-8">
          <button
            onClick={() => router.push('/membros/login')}
            className="mb-6 flex items-center gap-2 text-[#4a5937]/60 hover:text-[#4a5937] transition-colors"
          >
            <ArrowLeft size={16} /> Voltar para login
          </button>

          <h1 className="text-3xl font-black text-[#1d2a13] mb-2">Verificar Email</h1>
          <p className="text-sm text-[#2c3f1d]/60 mb-8">
            Digite seu email para verificar se você está autorizado a se cadastrar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-[#4a5937]/90">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-3xl border border-[#d5e0cd] bg-[#eef3e3] px-4 py-3 text-sm text-[#1d2a13] outline-none focus:border-[#4a5937] focus:ring-2 focus:ring-[#4a5937]/20"
              placeholder="seu@email.com"
            />

            {mensagem && (
              <div className={`rounded-2xl p-4 text-sm ${permitido ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {permitido ? <CheckCircle2 size={16} className="inline mr-2 align-text-bottom" /> : <XCircle size={16} className="inline mr-2 align-text-bottom" />}
                {mensagem}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#4a5937] hover:bg-[#323d24] text-white py-4 rounded-xl font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {carregando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar Email'
              )}
            </button>

            {permitido && (
              <button
                type="button"
                onClick={irParaCadastro}
                className="w-full border border-[#4a5937] text-[#4a5937] py-4 rounded-xl font-black text-sm transition-colors hover:bg-[#4a5937]/10"
              >
                Prosseguir para cadastro
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
