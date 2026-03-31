'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfigurarPerfil() {
  const [nome, setNome] = useState('');
  const [apto, setApto] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const router = useRouter();

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const perfil = { nome, apto, foto: foto || 'https://flaticon.com' };
    localStorage.setItem('perfil_morador', JSON.stringify(perfil));
    localStorage.setItem('perfil_completo', 'sim');
    router.push('/membros');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-black">
      <div className="max-w-sm w-full text-center">
        <h2 className="text-2xl font-black uppercase mb-2">Quase lá! ✨</h2>
        <p className="text-gray-400 text-xs font-bold mb-8">Personalize como você aparecerá no mural</p>

        <label className="cursor-pointer mb-8 block group">
          <div className="w-28 h-28 rounded-full bg-gray-100 mx-auto border-4 border-blue-100 overflow-hidden flex items-center justify-center shadow-inner relative">
            {/* Se houver foto, mostra a imagem. Se não, mostra o ícone de câmera */}
            {foto ? (
              <img
                src={foto}
                alt="Preview"
                className="w-full h-full object-cover animate-fade-in"
              />
            ) : (
              <div className="text-center">
                <span className="text-4xl opacity-20">📸</span>
                <p className="text-[8px] font-bold text-blue-400 uppercase mt-1">Adicionar</p>
              </div>
            )}

            {/* Efeito de hover para dar um toque profissional */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <span className="text-white text-[10px] font-bold">TROCAR</span>
            </div>
          </div>

          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                                               // 1. Verifica se realmente há um arquivo selecionado
                                                                               const arquivoSelecionado = e.target.files?.[0];

                                                                               if (arquivoSelecionado) {
                                                                                 // 2. Se existir, converte para Base64 (texto) para não sumir ao atualizar a página
                                                                                 const reader = new FileReader();
                                                                                 reader.onloadend = () => {
                                                                                   setFoto(reader.result as string);
                                                                                 };
                                                                                 reader.readAsDataURL(arquivoSelecionado);
                                                                               }
                                                                             }}  />
        </label>

        <form onSubmit={handleSalvar} className="space-y-4">
          <input type="text" placeholder="Seu Nome" required className="w-full p-4 border rounded-2xl" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input type="text" placeholder="Apto / Bloco" required className="w-full p-4 border rounded-2xl" value={apto} onChange={(e) => setApto(e.target.value)} />
          <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg">CONCLUIR PERFIL</button>
        </form>
      </div>
    </div>
  );
}
