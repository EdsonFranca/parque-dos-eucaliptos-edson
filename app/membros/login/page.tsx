'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Mail, Lock, Loader2, XCircle, Eye, EyeOff } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    // Validações
    if (!formData.email.trim() || !formData.senha.trim()) {
      setErro('Preencha email e senha.');
      setCarregando(false);
      return;
    }

    try {
      console.log('🔍 Tentando login com Supabase:', formData.email);
      
      // Autenticar com Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.senha,
      });

      if (error) {
        console.error('❌ Erro no Supabase Auth:', error);
        setErro('Email não encontrado ou senha incorreta.');
        setCarregando(false);
        return;
      }

      if (data.user) {
        console.log('✅ Login bem-sucedido com Supabase:', data.user.email);
        
        // Tentar buscar perfil na tabela perfis_moradores
        let perfil = null;
        try {
          const { data: perfilData, error: perfilError } = await supabase
            .from('perfis_moradores')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (!perfilError && perfilData) {
            perfil = perfilData;
            console.log('✅ Perfil encontrado:', perfil);
          } else {
            console.warn('⚠️ Perfil não encontrado, usando dados do Auth:', perfilError);
          }
        } catch (perfilError) {
          console.warn('⚠️ Erro ao buscar perfil (ignorando):', perfilError);
        }

        // Salvar sessão atual
        localStorage.setItem('usuario_atual', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          nome: perfil?.nome || data.user.user_metadata?.nome || 'Morador',
          chacara: perfil?.chacara || data.user.user_metadata?.chacara || 'Não informada',
          tipo: perfil?.tipo_usuario || data.user.user_metadata?.tipo || 'morador'
        }));

        // Registrar sessão ativa para o painel do síndico
        try {
          console.log('Registrando sessão para:', data.user.email);
          const sessaoResponse = await fetch('/api/auth/registrar-sessao', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`
            },
            body: JSON.stringify({
              userId: data.user.id,
              userEmail: data.user.email,
              userName: perfil?.nome || data.user.user_metadata?.nome || 'Morador'
            })
          });
          
          const sessaoData = await sessaoResponse.json();
          console.log('Resposta do registro de sessão:', sessaoResponse.status, sessaoData);
          
          if (!sessaoResponse.ok) {
            console.error('Erro ao registrar sessão:', sessaoData);
          }
        } catch (sessaoError) {
          console.error('Não foi possível registrar sessão ativa:', sessaoError);
        }

        setCarregando(false);
        
        // Redirecionar para o dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Erro geral no login:', error);
      setErro('Erro ao fazer login. Tente novamente.');
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
          
          <h1 className="text-3xl font-black text-[#1d2a13] mb-2">Acesso Morador</h1>
          <p className="text-sm text-[#2c3f1d]/60">Entre com suas credenciais</p>
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-xl p-3 mt-4">
            <p className="font-bold">🔐 Login com Supabase</p>
            <p>Autenticação exclusiva via Supabase Auth</p>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-[2rem] shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-2">
                <XCircle size={16} />
                {erro}
              </div>
            )}

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
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 text-[#4a5937]/40" size={18} style={{ transform: 'translateY(-50%)' }} />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  className="w-full bg-[#f4f7ef] border border-[#e4eed7] rounded-xl pl-12 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 text-[#4a5937]/40 hover:text-[#4a5937] transition-colors"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#4a5937] hover:bg-[#323d24] text-white py-4 rounded-xl font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {carregando ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Links Úteis */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <button
                onClick={() => router.push('/membros/cadastro')}
                className="text-[#4a5937]/60 hover:text-[#4a5937] text-sm transition-colors"
              >
                Não tem conta? Cadastre-se
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#4a5937]/40 mt-6">
          🔐 Autenticação exclusiva via Supabase Auth
        </p>
      </div>
    </div>
  );
}
