'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Camera, User, Home, ArrowRight, LogOut, CheckCircle, ShieldCheck } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConfigurarPerfil() {
  const [nome, setNome] = useState('');
  const [apto, setApto] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
    const verificarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/membros/login');
    };
    verificarSessao();
  }, [router]);

  const handleSair = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dadosPerfil = {
      id: user.id,
      nome,
      apto,
      foto_url: foto || '',
      perfil_completo: true
    };
// Salva no Supabase (Upsert insere ou atualiza)
  const { error } = await supabase
    .from('perfis_moradores')
    .upsert(dadosPerfil);

  if (!error) {
    // Também mantém no localStorage para acesso rápido na UI
    localStorage.setItem('perfil_morador', JSON.stringify(dadosPerfil));
    router.push('/dashboard');
  } else {
    alert("Erro ao salvar perfil: " + error.message);
  }
};

  if (!hasMounted) return <div className="min-h-screen bg-[#435334]" />;

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-local bg-center flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      {/* Botão Sair Flutuante */}
      <button
        onClick={handleSair}
        className="absolute top-8 right-8 flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all shadow-2xl"
      >
        <LogOut size={14} /> Sair
      </button>

      <div className="max-w-md w-full relative animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-[#eef0e5]/95 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl border border-white/50 relative overflow-hidden">

          <header className="text-center mb-10">
            <div className="bg-[#435334] w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-black text-[#435334] uppercase tracking-tighter italic">Seja Bem-vindo</h2>
            <p className="text-[#435334]/50 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Configuração de Identidade</p>
          </header>

          {/* Upload de Foto Estilizado */}
          <label className="cursor-pointer mb-10 block group relative">
            <div className="w-32 h-32 rounded-[2.5rem] bg-white mx-auto border-4 border-[#435334]/10 overflow-hidden flex items-center justify-center relative shadow-inner group-hover:scale-105 transition-transform duration-300">
              {foto ? (
                <img src={foto} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-[#435334]/20 flex flex-col items-center gap-1">
                  <Camera size={32} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Adicionar Foto</span>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-1/3 translate-x-4 bg-[#435334] text-white p-2 rounded-xl shadow-lg border-2 border-white">
              <Camera size={14} />
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
              const arquivo = e.target.files?.[0];
              if (arquivo) {
                const reader = new FileReader();
                reader.onloadend = () => setFoto(reader.result as string);
                reader.readAsDataURL(arquivo);
              }
            }} />
          </label>

          <form onSubmit={handleSalvar} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#435334]/60 uppercase ml-4 tracking-widest leading-none">Nome Completo</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#435334]/30">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  required
                  className="w-full bg-white border-2 border-[#435334]/5 rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-[#435334]/30 transition-all shadow-inner"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#435334]/60 uppercase ml-4 tracking-widest leading-none">Sua Unidade</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#435334]/30">
                  <Home size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Ex: Apto 101 - Bloco B"
                  required
                  className="w-full bg-white border-2 border-[#435334]/5 rounded-2xl p-5 pl-14 text-sm font-bold outline-none focus:border-[#435334]/30 transition-all shadow-inner"
                  value={apto}
                  onChange={(e) => setApto(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#435334] hover:bg-[#2d3a22] text-white font-black py-6 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 tracking-widest text-xs mt-4"
            >
              FINALIZAR CADASTRO <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-[#435334]/30">
            <CheckCircle size={12} />
            <p className="text-[9px] font-bold uppercase tracking-widest">Ambiente de Segurança Parque dos Eucaliptos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
