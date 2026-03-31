'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AreaDoMorador() {
  const [avisos, setAvisos] = useState<any[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [perfil, setPerfil] = useState<any>(null);
  const [novoComentario, setNovoComentario] = useState<{ [key: number]: string }>({});
  const router = useRouter();

  useEffect(() => {
    const perfilSalvo = localStorage.getItem('perfil_morador');
    if (!perfilSalvo) { router.push('/membros/login'); return; }
    setPerfil(JSON.parse(perfilSalvo));

    const buscarDadosNoStorage = () => {
          const avisosSalvos = localStorage.getItem('avisos_condominio');
          const obrasSalvas = localStorage.getItem('obras_condominio');
          if (avisosSalvos) setAvisos(JSON.parse(avisosSalvos));
          if (obrasSalvas) setObras(JSON.parse(obrasSalvas));
        };
    buscarDadosNoStorage();
        // Faz o mural do morador atualizar sozinho a cada 2 segundos
        const intervalo = setInterval(buscarDadosNoStorage, 2000);
        return () => clearInterval(intervalo);
  }, []);

  const handleSair = () => {
    localStorage.removeItem('perfil_morador'); // Limpa só o morador
    router.push('/');
  };

  const darLike = (obraId: number) => {
    const novasObras = obras.map(o => {
      if (o.id === obraId) {
        const listaLikes = o.likes || [];
        // Verifica se o nome do morador já está na lista de likes dessa obra
        if (listaLikes.includes(perfil.nome)) {
          alert("Você já curtiu esta atualização!");
          return o;
        }
        return { ...o, likes: [...listaLikes, perfil.nome] };
      }
      return o;
    });
    setObras(novasObras);
    localStorage.setItem('obras_condominio', JSON.stringify(novasObras));
  };

  const adicionarComentario = (obraId: number) => {
    const texto = novoComentario[obraId];
    if (!texto) return;

    const novasObras = obras.map(o => {
      if (o.id === obraId) {
        const comentarios = o.comentarios || [];
        return { ...o, comentarios: [...comentarios, { usuario: perfil.nome, texto, data: new Date().toLocaleTimeString() }] };
      }
      return o;
    });

    setObras(novasObras);
    localStorage.setItem('obras_condominio', JSON.stringify(novasObras));
    setNovoComentario({ ...novoComentario, [obraId]: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-black" translate="no">
      <nav className="bg-blue-800 text-white p-4 shadow-md sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={perfil?.foto} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
          <span className="font-bold text-sm">Olá, {perfil?.nome.split(' ')[0]}</span>
        </div>
        <button onClick={handleSair} className="text-xs bg-red-500 px-3 py-1 rounded-full font-bold">Sair</button>
      </nav>

      <main className="max-w-2xl mx-auto p-4 space-y-8">
        {/* RENDERIZAÇÃO DOS AVISOS (Já tínhamos) */}
        <section className="space-y-3">
           {avisos.map(a => (
              <div key={a.id} className={`p-4 rounded-xl border-l-4 ${a.urgente ? 'bg-red-100 border-red-500' : 'bg-white border-blue-500 shadow-sm'}`}>
                <h3 className="font-bold text-xs uppercase">{a.urgente ? '🚨 ' : ''}{a.titulo}</h3>
                <p className="text-sm text-gray-700 mt-1">{a.mensagem}</p>
              </div>
           ))}
        </section>

        {/* GALERIA DE OBRAS COM LIKES E COMENTÁRIOS */}
        <section className="space-y-6">
          {obras.map(o => (
            <div key={o.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <img src={o.imagemUrl} className="w-full h-56 object-cover" />
              <div className="p-5">
                <p className="text-sm font-medium mb-3">{o.texto}</p>

                {/* Barra de Progresso */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${o.progresso}%` }}></div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => darLike(o.id)} className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-600 font-bold text-xs hover:bg-blue-100">
                    👍 {o.likes || 0} Curtidas
                  </button>
                  <span className="text-[10px] text-gray-400 font-bold">{o.dataHora}</span>
                </div>

                {/* Seção de Comentários */}
                <div className="border-t pt-4 space-y-2">
                   {o.comentarios?.map((c: any, i: number) => (
                     <div key={i} className="text-[11px] bg-gray-50 p-2 rounded-lg">
                        <span className="font-bold text-blue-800">{c.usuario}: </span> {c.texto}
                     </div>
                   ))}
                   <div className="flex gap-2 mt-3">
                      <input
                        type="text" placeholder="Dúvida ou elogio..."
                        className="flex-1 text-xs p-2 border rounded-lg outline-none"
                        value={novoComentario[o.id] || ''}
                        onChange={(e) => setNovoComentario({...novoComentario, [o.id]: e.target.value})}
                      />
                      <button onClick={() => adicionarComentario(o.id)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold">Enviar</button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
