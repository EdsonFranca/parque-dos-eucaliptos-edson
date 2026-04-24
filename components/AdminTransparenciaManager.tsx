'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Save, Trash2, Loader2 } from 'lucide-react';

type Registro = {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: 'saldo' | 'conta_pagar' | 'despesa_diaria' | 'despesa_mensal' | 'despesa_pontual';
  valor: number;
  mes: number;
  ano: number;
};

export default function AdminTransparenciaManager() {
  const [itens, setItens] = useState<Registro[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState<Registro['tipo']>('saldo');
  const [valor, setValor] = useState('');
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [ano, setAno] = useState(String(new Date().getFullYear()));

  const carregar = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from('transparencia_financeira')
      .select('*')
      .order('ano', { ascending: false })
      .order('mes', { ascending: false })
      .order('created_at', { ascending: false });
    setItens((data || []) as Registro[]);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const salvar = async () => {
    if (!titulo || !valor || !mes || !ano) {
      alert('Preencha título, valor, mês e ano.');
      return;
    }
    const valorNumero = Number(valor.replace(',', '.'));
    if (Number.isNaN(valorNumero)) {
      alert('Valor inválido.');
      return;
    }

    const { error, data } = await supabase.from('transparencia_financeira').insert([{
      titulo,
      descricao,
      tipo,
      valor: valorNumero,
      mes: Number(mes),
      ano: Number(ano),
    }]).select();

    if (error || !data) {
      alert(`Erro ao salvar: ${error?.message || 'falha inesperada'}`);
      return;
    }
    setItens((prev) => [data[0] as Registro, ...prev]);
    setTitulo('');
    setDescricao('');
    setValor('');
  };

  const excluir = async (id: string) => {
    if (!confirm('Excluir lançamento financeiro?')) return;
    const { error } = await supabase.from('transparencia_financeira').delete().eq('id', id);
    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
      return;
    }
    setItens((prev) => prev.filter((x) => x.id !== id));
  };

  const atualizarValor = async (id: string, novoValor: number) => {
    const { error } = await supabase
      .from('transparencia_financeira')
      .update({ valor: novoValor })
      .eq('id', id);
    if (error) {
      alert(`Erro ao atualizar: ${error.message}`);
      return;
    }
    setItens((prev) => prev.map((x) => (x.id === id ? { ...x, valor: novoValor } : x)));
  };

  return (
    <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all">
      <h2 className="text-xl font-black text-[#1d2a13] uppercase tracking-tight mb-6">Transparência Financeira</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" className="bg-[#f4f7ef] rounded-[1rem] px-4 py-3 text-sm outline-none" />
        <select value={tipo} onChange={(e) => setTipo(e.target.value as Registro['tipo'])} className="bg-[#f4f7ef] rounded-[1rem] px-4 py-3 text-sm outline-none">
          <option value="saldo">Saldo do condomínio</option>
          <option value="conta_pagar">Conta a pagar</option>
          <option value="despesa_diaria">Despesa diária</option>
          <option value="despesa_mensal">Despesa mensal</option>
          <option value="despesa_pontual">Despesa pontual</option>
        </select>
        <input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Valor (ex: 1500,00)" className="bg-[#f4f7ef] rounded-[1rem] px-4 py-3 text-sm outline-none" />
        <div className="grid grid-cols-2 gap-3">
          <input value={mes} onChange={(e) => setMes(e.target.value)} placeholder="Mês" className="bg-[#f4f7ef] rounded-[1rem] px-4 py-3 text-sm outline-none" />
          <input value={ano} onChange={(e) => setAno(e.target.value)} placeholder="Ano" className="bg-[#f4f7ef] rounded-[1rem] px-4 py-3 text-sm outline-none" />
        </div>
      </div>
      <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição (opcional)" className="w-full bg-[#f4f7ef] rounded-[1rem] p-4 text-sm outline-none mb-4 h-20 resize-none" />
      <button onClick={salvar} className="w-full bg-[#4a5937] hover:bg-[#323d24] text-white font-black py-3 rounded-[1rem] flex items-center justify-center gap-2 mb-6">
        <Plus size={14} /> Adicionar lançamento
      </button>

      {carregando ? (
        <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-[#4a5937]" /></div>
      ) : (
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {itens.map((item) => (
            <div key={item.id} className="bg-[#f8fbf3] p-4 rounded-2xl border border-[#e4eed7]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-sm">{item.titulo}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#2c3f1d]/60 mt-1">
                    {String(item.mes).padStart(2, '0')}/{item.ano} • {item.tipo}
                  </p>
                </div>
                <button onClick={() => excluir(item.id)} className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  defaultValue={item.valor}
                  onBlur={(e) => {
                    const novo = Number(String(e.target.value).replace(',', '.'));
                    if (!Number.isNaN(novo) && novo !== Number(item.valor)) atualizarValor(item.id, novo);
                  }}
                  className="bg-white rounded-xl px-3 py-2 text-sm border border-[#e4eed7] w-40"
                />
                <Save size={14} className="text-[#4a5937]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
