'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Mail, User, Home, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export default function CadastroPage() {
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

  const verificarEmailPermitido = async (email: string) => {
    try {
      const response = await fetch('/api/auth/verificar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      return data.permitido;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  };

  const obterDadosEmail = async (email: string) => {
    try {
      const response = await fetch('/api/auth/verificar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.permitido && data.dados) {
        return {
          nome: data.dados.nome,
          chacara: data.dados.chacara
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter dados do email:', error);
      return null;
    }
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
    const emailPermitido = await verificarEmailPermitido(formData.email);
    if (!emailPermitido) {
      setErro('Seu email não está autorizado para cadastro. Contate o síndico.');
      setCarregando(false);
      return;
    }

    try {
      console.log(' Criando usuário no Supabase Auth...');
      
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            nome: formData.nome,
            chacara: formData.chacara,
            tipo: 'morador'
          }
        }
      });

      if (authError) {
        console.error('❌ Erro no Supabase Auth:', authError);
        if (authError.message.includes('already registered')) {
          setErro('Este email já está cadastrado. Tente fazer login.');
        } else {
          setErro('Erro ao criar conta: ' + authError.message);
        }
        setCarregando(false);
        return;
      }

      console.log('✅ Usuário criado no Supabase Auth:', authData.user?.id);

      // 2. Tentar criar perfil na tabela perfis_moradores
      try {
        const { error: perfilError } = await supabase
          .from('perfis_moradores')
          .insert([{
            id: authData.user?.id,
            nome: formData.nome,
            email: formData.email,
            chacara: formData.chacara,
            tipo_usuario: 'morador'
          }]);

        if (perfilError) {
          console.warn('⚠️ Perfil não criado (tabela pode não existir):', perfilError);
        } else {
          console.log('✅ Perfil criado com sucesso');
        }
      } catch (perfilError) {
        console.warn('⚠️ Erro ao criar perfil (ignorando):', perfilError);
      }

      console.log('✅ Cadastro completo com sucesso!');
      setSucesso(true);
      
      setTimeout(() => {
        router.push('/membros/login');
      }, 3000);

    } catch (error) {
      console.error('❌ Erro geral no cadastro:', error);
      setErro('Erro ao criar conta. Tente novamente.');
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
          
          <h1 className="text-3xl font-black text-[#1d2a13] mb-2">Cadastro de Morador</h1>
          <p className="text-sm text-[#2c3f1d]/60">Complete seus dados para acessar o sistema</p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-[2rem] shadow-lg p-8">
          {sucesso ? (
            <div className="text-center py-8">
              <CheckCircle2 className="text-green-500 mx-auto mb-4" size={48} />
              <h2 className="text-xl font-black text-[#1d2a13] mb-2">Cadastro Realizado!</h2>
              <p className="text-sm text-[#2c3f1d]/60 mb-4">
                Sua conta foi criada com sucesso. Você será redirecionado para o login.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs text-green-700">
                  <strong>Importante:</strong> Verifique seu email para confirmar o cadastro antes de fazer o primeiro login.
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
              <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl p-3 mt-4">
                <p className="font-bold">🔐 Cadastro com Supabase</p>
                <p>Cadastro via Supabase Auth com perfil integrado</p>
              </div>

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
                    Cadastrando...
                  </>
                ) : (
                  'Finalizar Cadastro'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#4a5937]/40 mt-6">
          🔐 Cadastro via Supabase Auth. Ao se cadastrar, você concorda com as regras do Parque dos Eucaliptos.
        </p>
      </div>
    </div>
  );
}
