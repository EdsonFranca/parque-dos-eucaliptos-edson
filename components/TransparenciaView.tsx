'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wallet, ReceiptText, Loader2 } from 'lucide-react';

export default function TransparenciaView() {
  const [itens, setItens] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      const { data } = await supabase
        .from('transparencia_financeira')
        .select('*')
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .order('tipo', { ascending: true });
      setItens(data || []);
      setCarregando(false);
    };
    carregar();
  }, []);

  const resumo = useMemo(() => {
    let saldo = 0;
    let despesas = 0;
    itens.forEach((item) => {
      const valor = Number(item.valor || 0);
      if (item.tipo === 'saldo') saldo += valor;
      else despesas += valor;
    });
    return { saldo, despesas };
  }, [itens]);

  return (
    <main className="flex-1 px-10 pb-10 pt-4 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[#1d2a13] uppercase tracking-tight">Transparência</h2>
        <p className="text-xs font-bold text-[#4a5937]/70 uppercase tracking-widest mt-1">Prestação de contas do condomínio</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#e4eed7]">
          <p className="text-[10px] uppercase tracking-widest text-[#2c3f1d]/60 font-black mb-2">Saldo consolidado</p>
          <p className="text-3xl font-black text-[#1d2a13] flex items-center gap-2">
            <Wallet size={22} className="text-[#4a5937]" />
            R$ {resumo.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#e4eed7]">
          <p className="text-[10px] uppercase tracking-widest text-[#2c3f1d]/60 font-black mb-2">Despesas consolidadas</p>
          <p className="text-3xl font-black text-red-600 flex items-center gap-2">
            <ReceiptText size={22} />
            R$ {resumo.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </section>

      {carregando ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={32} className="animate-spin text-[#4a5937]" /></div>
      ) : itens.length === 0 ? (
        <div className="bg-white p-10 rounded-[2rem] text-center text-[#2c3f1d]/60 italic">Nenhum lançamento financeiro publicado.</div>
      ) : (
        <section className="space-y-4">
          {itens.map((item) => (
            <article key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#e4eed7]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="font-black text-[#1d2a13]">{item.titulo}</h3>
                  <p className="text-xs text-[#2c3f1d]/60 mt-1">
                    {String(item.mes).padStart(2, '0')}/{item.ano} • {item.tipo}
                  </p>
                  {item.descricao && <p className="text-sm text-[#2c3f1d]/80 mt-2">{item.descricao}</p>}
                </div>
                <div className={`text-xl font-black ${item.tipo === 'saldo' ? 'text-[#1d2a13]' : 'text-red-600'}`}>
                  R$ {Number(item.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
