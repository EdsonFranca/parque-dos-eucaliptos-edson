'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-slate-900 flex flex-col items-center justify-center p-6 text-white" translate="no">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black italic mb-2 tracking-tighter">CONDOMÍNIO_VIVA 🏢</h1>
        <p className="text-blue-300 font-bold uppercase text-xs tracking-widest">Portal de Transparência e Obras</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* BOTÃO MORADOR */}
        <button
          onClick={() => router.push('/membros/login')} // Agora ele vai para o login primeiro
          className="bg-white text-blue-900 p-8 rounded-3xl shadow-xl hover:scale-105 transition transform flex flex-col items-center border-b-8 border-blue-200"
        >
          <span className="text-5xl mb-4">🏠</span>
          <span className="text-xl font-black uppercase">Sou Morador</span>
          <p className="text-xs text-gray-500 mt-2 font-bold italic">Acesse seu perfil para ver o mural</p>
        </button>

        {/* BOTÃO ADMIN */}
        <button
          onClick={() => router.push('/admin/login')}
          className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl hover:scale-105 transition transform flex flex-col items-center border-b-8 border-blue-800"
        >
          <span className="text-5xl mb-4">🔑</span>
          <span className="text-xl font-black uppercase">Área do Síndico</span>
          <p className="text-xs text-blue-200 mt-2 font-bold italic">Postar atualizações e alertas</p>
        </button>
      </div>

      <footer className="mt-20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
        Desenvolvido com Next.js & Tailwind CSS
      </footer>
    </div>
  );
}
