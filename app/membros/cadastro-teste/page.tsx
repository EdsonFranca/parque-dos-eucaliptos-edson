'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, User, Home, Loader2, CheckCircle2, XCircle } from 'lucide-react';

// Lista de emails permitidos (hardcoded)
const EMAILS_PERMITIDOS = [
  { email: 'salarod01@gmail.com', nome: 'Salomão Rodrigues 01', chacara: 'Chácara 01' },
  { email: 'salarod02@gmail.com', nome: 'Salomão Rodrigues 02', chacara: 'Chácara 02' },
  { email: 'salarod03@gmail.com', nome: 'Salomão Rodrigues 03', chacara: 'Chácara 03' }
];

export default function CadastroTestePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    chacara: '',
    senha: '',
    confirmarSenha: ''
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Carregar dados pré-preenchidos se existirem
    const dadosPrePreenchidos = localStorage.getItem('cadastro_pre_preenchido');
    if (dadosPrePreenchidos) {
      const dados = JSON.parse(dadosPrePreenchidos);
      setFormData(prev => ({
        ...prev,
        nome: dados.nome || '',
        email: dados.email || '',
        chacara: dados.chacara || ''
      }));
      localStorage.removeItem('cadastro_pre_preenchido');
    }
  }, []);

  const verificarEmailPermitido = (email: string) => {
    const emailNormalizado = email.toLowerCase().trim();
    return EMAILS_PERMITIDOS.some(item => item.email === emailNormalizado);
  };

  const obterDadosEmail = (email: string) => {
    const emailNormalizado = email.toLowerCase().trim();
    return EMAILS_PERMITIDOS.find(item => item.email === emailNormalizado);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    // Validações
    if (!formData.nome.trim() || !formData.email.trim() || !formData.chacara.trim()) {
      setErro('Preencha todos os campos obrigatórios.');
      setCarregando(false);
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem.');
      setCarregando(false);
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      setCarregando(false);
      return;
    }

    // Verificar se email está na lista permitida
    if (!verificarEmailPermitido(formData.email)) {
      setErro('Seu email não está autorizado para cadastro. Contate o síndico.');
      setCarregando(false);
      return;
    }

    // Simular cadastro bem-sucedido (sem Supabase)
    try {
      console.log('✅ Cadastro simulado com sucesso para:', formData.email);
      
      // Salvar em localStorage para simular usuário criado
      const usuarioSimulado = {
        id: 'sim_' + Date.now(),
        email: formData.email,
        nome: formData.nome,
        chacara: formData.chacara,
        criadoEm: new Date().toISOString()
      };
      
      localStorage.setItem('usuario_simulado', JSON.stringify(usuarioSimulado));
      
      setSucesso(true);
      setTimeout(() => {
        router.push('/membros/login');
      }, 3000);

    } catch (error) {
      console.error('Erro no cadastro simulado:', error);
      setErro('Erro ao simular cadastro. Tente novamente.');
      setCarregando(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!hasMounted) return <div className="min-h-screen bg-[#eaf3de]" />;

  return (
    <div className="min-h-screen bg-[#eaf3de] text-[#2c3f1d] font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-[#4a5937]/60 hover:text-[#4a5937] transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          
          <h1 className="text-3xl font-black text-[#1d2a13] mb-2">Cadastro de Teste 🧪</h1>
          <p className="text-sm text-[#2c3f1d]/60">Versão de teste sem Supabase</p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-[2rem] shadow-lg p-8">
          {sucesso ? (
            <div className="text-center py-8">
              <CheckCircle2 className="text-green-500 mx-auto mb-4" size={48} />
              <h2 className="text-xl font-black text-[#1d2a13] mb-2">Cadastro Simulado!</h2>
              <p className="text-sm text-[#2c3f1d]/60 mb-4">
                Cadastro simulado com sucesso. Verifique o console para ver os dados.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs text-green-700">
                  <strong>Importante:</strong> Esta é uma versão de teste. O usuário foi salvo apenas no localStorage.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-2">
                  <XCircle size={16} />
                  {erro}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-[#4a5937]/70 uppercase tracking-widest mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 text-[#4a5937]/40" size={18} style={{ transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#4a5937]/70 uppercase tracking-widest mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 text-[#4a5937]/40" size={18} style={{ transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#4a5937]/70 uppercase tracking-widest mb-2">
                  Chácara
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 text-[#4a5937]/40" size={18} style={{ transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="chacara"
                    value={formData.chacara}
                    onChange={handleInputChange}
                    className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                    placeholder="Ex: Chácara 01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#4a5937]/70 uppercase tracking-widest mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#4a5937]/70 uppercase tracking-widest mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                  placeholder="Confirme sua senha"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-[#4a5937] hover:bg-[#323d24] text-white py-4 rounded-xl font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {carregando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Simulando...
                  </>
                ) : (
                  'Simular Cadastro'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#4a5937]/40 mt-6">
          🧪 Versão de teste - dados salvos apenas no localStorage
        </p>
      </div>
    </div>
  );
}
