'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardAdmin() {
  const [galeria, setGaleria] = useState<any[]>([]);
  const [avisos, setAvisos] = useState<any[]>([]);
  const [descricao, setDescricao] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [progressoNovo, setProgressoNovo] = useState(50);
  const [tituloAviso, setTituloAviso] = useState('');
  const [msgAviso, setMsgAviso] = useState('');
  const [isUrgente, setIsUrgente] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const carregar = () => {
      const obras = JSON.parse(localStorage.getItem('obras_condominio') || '[]');
      const avisosLocal = JSON.parse(localStorage.getItem('avisos_condominio') || '[]');
      setGaleria(obras);
      setAvisos(avisosLocal);
    };
    carregar();
    const intervalo = setInterval(carregar, 3000);
    return () => clearInterval(intervalo);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(arquivo);
    }
  };

  const handlePublicarObra = () => {
    if (!descricao || !preview) return alert("Adicione uma foto e uma descrição!");
    const nova = {
      id: Date.now(), texto: descricao, imagemUrl: preview,
      progresso: progressoNovo, likes: [], comentarios: [],
      dataHora: new Date().toLocaleString('pt-BR')
    };
    const novaLista = [nova, ...galeria];
    setGaleria(novaLista);
    localStorage.setItem('obras_condominio', JSON.stringify(novaLista));
    setDescricao(''); setPreview(null); setProgressoNovo(50);
  };

  const atualizarProgresso = (id: number, valor: number) => {
    const novaLista = galeria.map(o => o.id === id ? { ...o, progresso: valor } : o);
    setGaleria(novaLista);
    localStorage.setItem('obras_condominio', JSON.stringify(novaLista));
  };

  const handlePublicarAviso = () => {
    if (!tituloAviso || !msgAviso) return alert("Preencha o título e a mensagem!");
    const novo = { id: Date.now(), titulo: tituloAviso, mensagem: msgAviso, urgente: isUrgente, data: new Date().toLocaleString('pt-BR') };
    const novaLista = [novo, ...avisos];
    setAvisos(novaLista);
    localStorage.setItem('avisos_condominio', JSON.stringify(novaLista));
    setTituloAviso(''); setMsgAviso(''); setIsUrgente(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-black" translate="no">
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-600">
        <h1 className="text-2xl font-black italic text-blue-700 uppercase tracking-tighter">Admin Condomínio</h1>
        <button onClick={() => router.push('/')} className="font-bold text-red-500 hover:underline">Sair</button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* COLUNA DE CRIAÇÃO */}
        <section className="space-y-8">
          {/* Box Obra */}
          <div className="bg-white p-6 rounded-3xl shadow-md border-t-8 border-green-500">
            <h2 className="text-lg font-bold mb-4 uppercase italic">🏗️ Nova Atualização</h2>
            <textarea className="w-full p-4 border-2 rounded-2xl mb-4 outline-none focus:border-green-500" placeholder="O que avançou hoje?" value={descricao} onChange={(e) => setDescricao(e.target.value)} />

            <div className="mb-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Progresso Inicial: {progressoNovo}%</label>
              <input type="range" className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600" value={progressoNovo} onChange={(e) => setProgressoNovo(Number(e.target.value))} />
            </div>

            <label className="block border-2 border-dashed border-gray-200 p-8 rounded-3xl cursor-pointer text-center hover:bg-gray-50 mb-6 relative overflow-hidden">
              {preview ? (
                <img src={preview} className="max-h-48 mx-auto rounded-xl shadow-lg" />
              ) : (
                <div className="py-4">
                  <span className="text-4xl">📸</span>
                  <p className="text-gray-400 font-bold mt-2 text-sm uppercase">Toque para adicionar foto</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
            <button onClick={handlePublicarObra} className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:shadow-xl transition">PUBLICAR OBRA</button>
          </div>

          {/* Box Aviso */}
          <div className="bg-white p-6 rounded-3xl shadow-md border-t-8 border-yellow-500">
            <h2 className="text-lg font-bold mb-4 uppercase italic">📢 Novo Comunicado</h2>
            <input type="text" placeholder="Título do Aviso" className="w-full p-3 border-2 rounded-xl mb-3 font-bold" value={tituloAviso} onChange={(e) => setTituloAviso(e.target.value)} />
            <textarea placeholder="Escreva o comunicado aqui..." className="w-full p-3 border-2 rounded-xl mb-3 h-24" value={msgAviso} onChange={(e) => setMsgAviso(e.target.value)} />

            {/* CHECKBOX URGENTE RESTAURADA */}
            <label className="flex items-center gap-3 mb-6 cursor-pointer bg-red-50 p-3 rounded-xl border border-red-100">
              <input type="checkbox" checked={isUrgente} onChange={(e) => setIsUrgente(e.target.checked)} className="w-6 h-6 accent-red-600" />
              <span className="font-black text-red-600 text-sm">MARCAR COMO URGENTE 🚨</span>
            </label>

            <button onClick={handlePublicarAviso} className="w-full bg-yellow-500 text-white font-black py-4 rounded-2xl hover:bg-yellow-600 transition">POSTAR AVISO</button>
          </div>
        </section>

        {/* COLUNA DE GESTÃO (MONITORAMENTO) */}
        <section className="space-y-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Feed de Publicações Ativas</h2>

          {/* Fotos e Progresso */}
          <div className="space-y-4">
            {galeria.map(o => (
              <div key={o.id} className="bg-white rounded-3xl shadow-sm border p-5 relative group">
                <button onClick={() => {
                  const nova = galeria.filter(item => item.id !== o.id);
                  setGaleria(nova);
                  localStorage.setItem('obras_condominio', JSON.stringify(nova));
                }} className="absolute top-4 right-4 text-red-400 font-black text-xs hover:text-red-600 transition">EXCLUIR 🗑️</button>

                <div className="flex gap-4">
                  <img src={o.imagemUrl} className="w-24 h-24 rounded-2xl object-cover border" />
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-tighter">{o.dataHora}</p>
                    <p className="text-sm font-bold leading-tight mb-3">{o.texto}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-blue-600 uppercase">Progresso: {o.progresso}%</span>
                       <input type="range" className="flex-1 h-1 accent-blue-600" value={o.progresso} onChange={(e) => atualizarProgresso(o.id, Number(e.target.value))} />
                    </div>
                    <div className="mt-2 text-[10px] font-black text-blue-500">👍 {o.likes?.length || 0} CURTIDAS</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Avisos */}
          <div className="space-y-3 pt-6 border-t">
            <h3 className="text-[10px] font-black text-gray-400 uppercase">Avisos no Mural</h3>
            {avisos.map(a => (
              <div key={a.id} className={`p-4 rounded-2xl border-l-8 flex justify-between items-center ${a.urgente ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}>
                <div className="pr-4">
                  <p className="font-bold text-xs uppercase">{a.urgente ? '🚨 ' : ''}{a.titulo}</p>
                  <p className="text-[9px] text-gray-400 font-bold">{a.data}</p>
                </div>
                <button onClick={() => {
                  const nova = avisos.filter(item => item.id !== a.id);
                  setAvisos(nova);
                  localStorage.setItem('avisos_condominio', JSON.stringify(nova));
                }} className="text-red-500 font-black text-[10px] hover:underline">REMOVER</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
