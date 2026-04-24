'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BriefcaseBusiness, Plus, Loader2, Search, Camera, Trash2, Pencil, Save, X, MessageCircle } from 'lucide-react';

export default function ServicosView({ perfil }: { perfil: any }) {
  const [servicos, setServicos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrandoForm, setMostrandoForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [contato, setContato] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editContato, setEditContato] = useState('');
  const [editFoto, setEditFoto] = useState<string | null>(null);

  const formatarTelefoneBR = (valor: string) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 13);
    const semPais = digitos.startsWith('55') ? digitos.slice(2) : digitos;
    if (semPais.length <= 2) return semPais;
    if (semPais.length <= 6) return `(${semPais.slice(0, 2)}) ${semPais.slice(2)}`;
    if (semPais.length <= 10) return `(${semPais.slice(0, 2)}) ${semPais.slice(2, 6)}-${semPais.slice(6)}`;
    return `(${semPais.slice(0, 2)}) ${semPais.slice(2, 7)}-${semPais.slice(7, 11)}`;
  };

  const telefoneValidoWhatsApp = (valor: string) => {
    const digitos = valor.replace(/\D/g, '');
    const semPais = digitos.startsWith('55') ? digitos.slice(2) : digitos;
    return semPais.length === 10 || semPais.length === 11;
  };

  const carregarServicos = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar serviços:', error);
      setCarregando(false);
      return;
    }

    if (data) setServicos(data);
    setCarregando(false);
  };

  useEffect(() => {
    carregarServicos();
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    modo: 'novo' | 'edicao',
  ) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (modo === 'novo') setFoto(reader.result as string);
      else setEditFoto(reader.result as string);
    };
    reader.readAsDataURL(arquivo);
  };

  const limparFormulario = () => {
    setTitulo('');
    setDescricao('');
    setContato('');
    setFoto(null);
  };

  const publicarServico = async () => {
    if (!titulo || !descricao || !contato || !foto) {
      alert('Preencha título, descrição, contato e foto.');
      return;
    }
    if (!telefoneValidoWhatsApp(contato)) {
      alert('Informe um telefone válido para WhatsApp com DDD (10 ou 11 dígitos).');
      return;
    }
    if (!perfil?.id) {
      alert('Sessão inválida. Faça login novamente para publicar um serviço.');
      return;
    }

    setSalvando(true);
    const { data, error } = await supabase
      .from('servicos')
      .insert([{
        titulo,
        descricao,
        contato,
        foto_url: foto,
        prestador_id: perfil?.id,
        prestador_nome: perfil?.nome || 'Morador',
      }])
      .select();

    if (!error && data) {
      setServicos((prev) => [data[0], ...prev]);
      limparFormulario();
      setMostrandoForm(false);
      alert('Servico publicado com sucesso!');
    } else {
      console.error('Erro ao publicar serviço:', error);
      if (error?.code === 'PGRST205' || error?.message?.toLowerCase().includes('could not find the table')) {
        alert('Tabela "servicos" não encontrada no Supabase. Execute o script database/create_servicos.sql e tente novamente.');
      } else if (error?.code === '42501') {
        alert('Sem permissão para publicar serviço (RLS). Verifique se as políticas do script create_servicos.sql foram aplicadas.');
      } else {
        alert(`Erro ao publicar serviço: ${error?.message || 'falha inesperada'}`);
      }
    }

    setSalvando(false);
  };

  const iniciarEdicao = (item: any) => {
    setEditandoId(item.id);
    setEditTitulo(item.titulo || '');
    setEditDescricao(item.descricao || '');
    setEditContato(item.contato || '');
    setEditFoto(item.foto_url || null);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditTitulo('');
    setEditDescricao('');
    setEditContato('');
    setEditFoto(null);
  };

  const salvarEdicao = async (id: string) => {
    if (!editTitulo || !editDescricao || !editContato || !editFoto) {
      alert('Preencha título, descrição, contato e foto para salvar.');
      return;
    }
    if (!telefoneValidoWhatsApp(editContato)) {
      alert('Informe um telefone válido para WhatsApp com DDD (10 ou 11 dígitos).');
      return;
    }

    setSalvando(true);
    const { data, error } = await supabase
      .from('servicos')
      .update({
        titulo: editTitulo,
        descricao: editDescricao,
        contato: editContato,
        foto_url: editFoto,
      })
      .eq('id', id)
      .select();

    if (error || !data) {
      alert(`Erro ao editar serviço: ${error?.message || 'falha inesperada'}`);
      setSalvando(false);
      return;
    }

    setServicos((prev) => prev.map((item) => (item.id === id ? data[0] : item)));
    cancelarEdicao();
    setSalvando(false);
    alert('Serviço atualizado com sucesso!');
  };

  const excluirServico = async (id: string) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    const { error } = await supabase.from('servicos').delete().eq('id', id);
    if (error) {
      alert(`Erro ao excluir serviço: ${error.message}`);
      return;
    }
    setServicos((prev) => prev.filter((item) => item.id !== id));
  };

  const getWhatsAppLink = (contatoRaw: string) => {
    const numeros = (contatoRaw || '').replace(/\D/g, '');
    if (!numeros) return '#';
    const numeroComPais = numeros.startsWith('55') ? numeros : `55${numeros}`;
    const texto = encodeURIComponent('Olá! Vi seu anúncio de serviço no app do condomínio.');
    return `https://wa.me/${numeroComPais}?text=${texto}`;
  };

  const servicosFiltrados = servicos.filter((item) => {
    const termo = filtroBusca.trim().toLowerCase();
    if (!termo) return true;
    return item.titulo?.toLowerCase().includes(termo)
      || item.descricao?.toLowerCase().includes(termo)
      || item.prestador_nome?.toLowerCase().includes(termo);
  });

  return (
    <main className="flex-1 px-10 pb-10 pt-4 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1d2a13] uppercase tracking-tight flex items-center gap-3">
            Postagem de Servicos <span className="text-2xl">🛠️</span>
          </h2>
          <p className="text-xs font-bold text-[#4a5937]/70 uppercase tracking-widest mt-1">
            Profissionais e habilidades da comunidade
          </p>
        </div>
        {!mostrandoForm && (
          <button
            onClick={() => setMostrandoForm(true)}
            className="bg-[#1d2a13] hover:bg-black text-white px-5 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-colors uppercase text-xs tracking-widest shrink-0"
          >
            <Plus size={16} /> Publicar Servico
          </button>
        )}
      </div>

      {mostrandoForm && (
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all mb-10">
          <h3 className="text-xl font-bold text-[#1d2a13] mb-6">Novo Servico</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Titulo do servico"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner text-sm"
            />
            <input
              type="text"
              placeholder="Contato (telefone/email)"
              value={contato}
              onChange={(e) => setContato(formatarTelefoneBR(e.target.value))}
              className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner text-sm"
            />
            <button
              onClick={publicarServico}
              disabled={salvando}
              className="bg-[#4a5937] hover:bg-[#323d24] text-white font-black py-4 rounded-[1.5rem] transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {salvando ? <Loader2 size={16} className="animate-spin" /> : 'PUBLICAR'}
            </button>
          </div>
          <label className="block border-2 border-dashed border-[#4a5937]/20 bg-[#f4f7ef] hover:bg-[#e4eed7] p-4 rounded-[1.5rem] h-52 cursor-pointer text-center transition-colors mt-4 relative">
            {foto ? (
              <img src={foto} className="w-full h-full rounded-xl object-cover" alt="Foto do serviço" />
            ) : (
              <div className="h-full flex flex-col justify-center items-center opacity-60 text-[#4a5937]">
                <Camera size={32} className="mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">Adicionar Foto do Serviço</span>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'novo')} />
          </label>
          <textarea
            placeholder="Detalhe o servico, disponibilidade e experiencia..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] p-5 mt-4 h-32 outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner text-sm resize-none"
          />
        </section>
      )}

      <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} className="text-[#4a5937]" />
          <h3 className="text-sm font-black text-[#1d2a13] uppercase tracking-widest">Filtros</h3>
        </div>
        <input
          type="text"
          placeholder="Buscar por servico, descricao ou prestador"
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
          className="w-full bg-[#f4f7ef] border-transparent rounded-[1.5rem] px-5 py-4 font-bold outline-none focus:ring-2 focus:ring-[#4a5937]/20 shadow-inner text-sm"
        />
      </section>

      {carregando ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin text-[#4a5937]" size={40} />
        </div>
      ) : servicosFiltrados.length === 0 ? (
        <p className="text-center text-[#2c3f1d]/50 italic bg-white p-10 rounded-[2rem]">
          Nenhum servico disponivel no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {servicosFiltrados.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all"
            >
              {editandoId === item.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitulo}
                    onChange={(e) => setEditTitulo(e.target.value)}
                    className="w-full bg-[#f4f7ef] rounded-[1rem] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                  />
                  <input
                    type="text"
                    value={editContato}
                    onChange={(e) => setEditContato(formatarTelefoneBR(e.target.value))}
                    className="w-full bg-[#f4f7ef] rounded-[1rem] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#4a5937]/20"
                  />
                  <label className="block border-2 border-dashed border-[#4a5937]/20 bg-[#f4f7ef] hover:bg-[#e4eed7] p-3 rounded-[1rem] h-40 cursor-pointer text-center transition-colors relative">
                    {editFoto ? (
                      <img src={editFoto} className="w-full h-full rounded-lg object-cover" alt="Foto do serviço" />
                    ) : (
                      <div className="h-full flex flex-col justify-center items-center opacity-60 text-[#4a5937]">
                        <Camera size={24} className="mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar Foto</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'edicao')} />
                  </label>
                  <textarea
                    value={editDescricao}
                    onChange={(e) => setEditDescricao(e.target.value)}
                    className="w-full bg-[#f4f7ef] rounded-[1rem] p-4 h-24 text-sm outline-none focus:ring-2 focus:ring-[#4a5937]/20 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => salvarEdicao(item.id)}
                      className="flex-1 bg-[#4a5937] hover:bg-[#323d24] text-white py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Save size={14} /> Salvar
                    </button>
                    <button
                      onClick={cancelarEdicao}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#1d2a13] py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <X size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-36 w-full rounded-xl overflow-hidden mb-4 bg-[#f4f7ef]">
                    {item.foto_url ? (
                      <img src={item.foto_url} alt={item.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#4a5937]/60">
                        <Camera size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-[#e4eed7] text-[#4a5937]">
                      <BriefcaseBusiness size={16} />
                    </div>
                    <h4 className="font-black text-[#1d2a13] line-clamp-1">{item.titulo}</h4>
                  </div>
                  <p className="text-[10px] font-bold text-[#4a5937]/60 uppercase tracking-widest mb-2">
                    Por: {item.prestador_nome || 'Morador'}
                  </p>
                  <p className="text-sm text-[#2c3f1d]/70 leading-relaxed mb-4 line-clamp-4">{item.descricao}</p>
                  <a
                    href={getWhatsAppLink(item.contato)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#16a34a] hover:text-[#15803d] bg-green-50 hover:bg-green-100 px-3 py-2 rounded-full transition-colors"
                  >
                    <MessageCircle size={14} /> {item.contato}
                  </a>
                  {perfil?.id === item.prestador_id && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => iniciarEdicao(item)}
                        className="flex-1 bg-[#e4eed7] hover:bg-[#d2e4bb] text-[#1d2a13] py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Pencil size={14} /> Editar
                      </button>
                      <button
                        onClick={() => excluirServico(item.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
