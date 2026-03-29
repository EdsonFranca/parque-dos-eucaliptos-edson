'use client';

import { Send, Leaf, AlertCircle, Trees } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{id: string, role: string, content: string}[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: inputVal };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error('API Error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantContent += decoder.decode(value, { stream: true });
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: assistantContent
            };
            return updated;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Ops, erro de rede. Tente de novo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scrolla pro final automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--cream-base)] text-[var(--dark-forest)] font-sans selection:bg-[var(--moss-green)] selection:text-white">
      {/* Header Elegant Nature-First */}
      <header className="py-5 px-8 flex items-center justify-between border-b border-[var(--moss-green)]/10 shadow-sm bg-[var(--cream-base)]/80 backdrop-blur-md sticky top-0 z-10 transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--moss-green)]/10 p-2 rounded-xl">
            <Trees className="w-8 h-8 text-[var(--moss-green)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--forest-green)]">
            Parque dos Eucaliptos
          </h1>
        </div>
        <p className="text-sm font-medium text-[var(--earth-brown)] flex items-center gap-2 bg-[var(--sand-sun)]/10 px-3 py-1 rounded-full border border-[var(--sand-sun)]/20 shadow-sm hidden sm:flex">
          <Leaf className="w-4 h-4" />
          Portal de Documentos Legais
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Intro Banner */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-[var(--moss-green)]/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[var(--moss-green)] rounded-l-3xl"></div>
          <h2 className="text-3xl font-extrabold text-[var(--dark-forest)] mb-3">
            Conheça as Regras do Parque
          </h2>
          <p className="text-lg text-[var(--moss-green)] max-w-2xl mx-auto leading-relaxed">
            Consulte horários, áreas restritas e regulamentos. A nossa Inteligência Artificial 
            (focada exclusivamente nos documentos oficiais) está pronta para tirar suas dúvidas.
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white rounded-3xl shadow-lg border border-[var(--moss-green)]/10 flex flex-col overflow-hidden max-h-[600px] xl:max-h-[700px] mb-8">
          
          {/* Timeline de Mensagens */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--moss-green)]/60 gap-4 animate-in fade-in zoom-in duration-500">
                <div className="bg-[var(--cream-base)] p-5 rounded-full shadow-inner">
                  <Leaf className="w-12 h-12" />
                </div>
                <p className="text-lg font-medium">Faça sua primeira pergunta sobre o parque abaixo!</p>
              </div>
            ) : (
              messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-[var(--moss-green)] text-white rounded-br-sm' 
                      : 'bg-[var(--cream-base)] border border-[var(--moss-green)]/10 text-[var(--dark-forest)] rounded-bl-sm'
                  }`}>
                    {/* Exibe ícone do parque para a IA */}
                    {m.role !== 'user' && (
                      <div className="flex items-center gap-2 mb-2 text-[var(--earth-brown)]">
                         <Trees className="w-4 h-4" />
                         <span className="text-xs font-bold uppercase tracking-wider">Assistente Oficial</span>
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="max-w-[85%] rounded-2xl p-4 bg-[var(--cream-base)] text-[var(--moss-green)] rounded-bl-sm flex gap-2">
                   <div className="w-2 h-2 bg-[var(--moss-green)]/60 rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-[var(--moss-green)]/60 rounded-full animate-bounce delay-200"></div>
                   <div className="w-2 h-2 bg-[var(--moss-green)]/60 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 bg-white border-t border-[var(--moss-green)]/10 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
            <div className="relative flex items-center group">
              <input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Exemplo: Pode levar cachorro? Qual horário de fechamento?"
                className="w-full bg-[var(--cream-base)]/40 border border-[var(--moss-green)]/30 rounded-full pl-6 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-[var(--moss-green)] focus:bg-white transition-all text-[var(--dark-forest)] placeholder-[var(--moss-green)]/50 shadow-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="absolute right-2 p-3 rounded-full bg-[var(--earth-brown)] text-white hover:bg-[var(--moss-green)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--earth-brown)] shadow-sm active:scale-95"
              >
                <Send className="w-5 h-5 -ml-0.5" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs mt-4 text-[var(--earth-brown)]/80 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              IA Treinada exclusivamente com base em informações legais do parque.
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
