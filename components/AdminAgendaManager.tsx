'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Loader2 } from 'lucide-react';

type Evento = {
  id: string;
  titulo: string;
  descricao?: string;
  data_evento: string;
  local?: string;
};

export default function AdminAgendaManager() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [local, setLocal] = useState('');

  const carregar = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from('agenda_eventos')
      .select('*')
      .order('data_evento', { ascending: true });
    setEventos((data || []) as Evento[]);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const salvar = async () => {
    if (!titulo || !dataEvento) {
      alert('Preencha título e data do evento.');
      return;
    }
    const { error, data } = await supabase
      .from('agenda_eventos')
      .insert([{
        titulo,
        descricao,
        data_evento: dataEvento,
        local,
      }]).select();
    if (error || !data) {
      alert(`Erro ao salvar evento: ${error?.message || 'falha inesperada'}`);
      return;
    }
    setEventos((prev) => [...prev, data[0] as Evento].sort((a, b) => a.data_evento.localeCompare(b.data_evento)));
    setTitulo('');
    setDescricao('');
    setDataEvento('');
    setLocal('');
  };

  const excluir = async (id: string) => {
    if (!confirm('Excluir evento da agenda?')) return;
    const { error } = await supabase.from('agenda_eventos').delete().eq('id', id);
    if (error) {
      alert(`Erro ao excluir evento: ${error.message}`);
      return;
    }
    setEventos((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-[#4a5937]/20 transition-all">
      <h2 className="text-xl font-black text-[#1d2a13] uppercase tracking-tight mb-6">Agenda do Condomínio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do evento" className="bg-[#f4f7ef] rounded-[1rem] px-4 py-3 text-sm outline-none" />
        <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Local" className="bg-[#f4f7ef] rounded-[1rem] px-4 py-3 text-sm outline-none" />
      </div>
      <div className="mb-4">
        <input type="date" value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} className="w-full md:w-64 bg-[#f4f7ef] rounded-[1rem] px-4 py-3 text-sm outline-none" />
      </div>
      <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição (opcional)" className="w-full bg-[#f4f7ef] rounded-[1rem] p-4 text-sm outline-none mb-4 h-20 resize-none" />
      <button onClick={salvar} className="w-full bg-[#1d2a13] hover:bg-black text-white font-black py-3 rounded-[1rem] flex items-center justify-center gap-2 mb-6">
        <Plus size={14} /> Adicionar evento
      </button>

      {carregando ? (
        <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-[#4a5937]" /></div>
      ) : (
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {eventos.map((evento) => (
            <div key={evento.id} className="bg-[#f8fbf3] p-4 rounded-2xl border border-[#e4eed7] flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-sm">{evento.titulo}</p>
                <p className="text-[10px] uppercase tracking-widest text-[#2c3f1d]/60 mt-1">{evento.data_evento}{evento.local ? ` • ${evento.local}` : ''}</p>
                {evento.descricao && <p className="text-xs text-[#2c3f1d]/70 mt-2">{evento.descricao}</p>}
              </div>
              <button onClick={() => excluir(evento.id)} className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
