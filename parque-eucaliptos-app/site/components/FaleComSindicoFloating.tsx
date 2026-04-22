 'use client';
 
 import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
 import { MessageCircle } from 'lucide-react';
 
 type PerfilMorador = {
   nome?: string;
   apto?: string;
 };
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

 function normalizeWhatsappNumber(raw: string) {
   // wa.me expects only digits (country code + number)
   return raw.replace(/\D/g, '');
 }
 
 export default function FaleComSindicoFloating() {
   const [perfil, setPerfil] = useState<PerfilMorador | null>(null);
 
   useEffect(() => {
    let cancelled = false;

    async function carregarPerfil() {
      // 1) Fonte de verdade: Supabase (perfil do usuário logado)
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;

        if (user) {
          const { data: perfilDb } = await supabase
            .from('perfis_moradores')
            .select('nome, apto')
            .eq('id', user.id)
            .single();

          if (!cancelled && perfilDb) {
            setPerfil({ nome: perfilDb.nome ?? undefined, apto: perfilDb.apto ?? undefined });
            return;
          }
        }
      } catch {
        // ignore and fall back
      }

      // 2) Fallback: localStorage (para UX rápida/offline)
      try {
        const dadosPerfil = localStorage.getItem('perfil_morador');
        if (!cancelled && dadosPerfil) setPerfil(JSON.parse(dadosPerfil));
      } catch {
        // ignore malformed localStorage
      }
    }

    carregarPerfil();
    return () => {
      cancelled = true;
    };
   }, []);
 
   const whatsappNumero = useMemo(() => {
     const raw = process.env.NEXT_PUBLIC_SINDICO_WHATSAPP_NUMERO || '';
     return raw ? normalizeWhatsappNumber(raw) : '';
   }, []);
 
   const mensagem = useMemo(() => {
     const unidade = perfil?.apto?.trim();
     const unidadeLabel = unidade ? `chácara ${unidade}` : 'minha chácara';
     const nome = perfil?.nome?.trim();
 
     return `Olá${nome ? `, sou ${nome}` : ''}, sou da ${unidadeLabel} e gostaria de falar com o síndico.`;
   }, [perfil?.apto, perfil?.nome]);
 
   const href = useMemo(() => {
     if (!whatsappNumero) return '';
     return `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
   }, [mensagem, whatsappNumero]);
 
   if (!href) return null;
 
   return (
     <a
       href={href}
       target="_blank"
       rel="noreferrer"
       className="fixed bottom-4 right-4 z-50 group max-w-[calc(100vw-2rem)]"
       aria-label="Falar com o síndico no WhatsApp"
     >
       <div className="flex items-center gap-3 rounded-full bg-[#25D366] text-white px-5 py-4 shadow-2xl shadow-black/30 border border-white/20 backdrop-blur-md transition-transform group-hover:scale-[1.03] active:scale-[0.98] min-w-0">
         <span className="grid place-items-center w-9 h-9 rounded-full bg-white/15">
           <MessageCircle size={18} />
         </span>
         <div className="leading-tight">
           <div className="text-[11px] font-black uppercase tracking-widest">Fale com o Síndico</div>
           <div className="text-[10px] font-bold text-white/85">WhatsApp</div>
         </div>
       </div>
     </a>
   );
 }
