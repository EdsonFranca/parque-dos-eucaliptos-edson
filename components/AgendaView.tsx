'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CalendarDays, Clock3, MapPin, Loader2 } from 'lucide-react';

export default function AgendaView() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      const { data } = await supabase
        .from('agenda_eventos')
        .select('*')
        .order('data_evento', { ascending: true });
      setEventos(data || []);
      setCarregando(false);
    };
    carregar();
  }, []);

  return (
    <main className="flex-1 px-10 pb-10 pt-4 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[#1d2a13] uppercase tracking-tight">Agenda</h2>
        <p className="text-xs font-bold text-[#4a5937]/70 uppercase tracking-widest mt-1">Eventos e compromissos oficiais do condomínio</p>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={32} className="animate-spin text-[#4a5937]" /></div>
      ) : eventos.length === 0 ? (
        <div className="bg-white p-10 rounded-[2rem] text-center text-[#2c3f1d]/60 italic">Nenhum evento publicado no momento.</div>
      ) : (
        <section className="space-y-4">
          {eventos.map((evento) => (
            <article key={evento.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#e4eed7]">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-[#e4eed7] text-[#4a5937]"><CalendarDays size={18} /></div>
                <div className="flex-1">
                  <h3 className="font-black text-[#1d2a13] text-lg">{evento.titulo}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#2c3f1d]/70 mt-2 font-bold uppercase tracking-widest">
                    <span className="inline-flex items-center gap-1"><Clock3 size={12} /> {evento.data_evento}</span>
                    {evento.local && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {evento.local}</span>}
                  </div>
                  {evento.descricao && <p className="text-sm text-[#2c3f1d]/80 mt-3">{evento.descricao}</p>}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
