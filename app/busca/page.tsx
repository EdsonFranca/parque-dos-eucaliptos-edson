"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowLeft, Calendar, Megaphone, FileText, Heart } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import FaleComSindicoFloating from '@/components/FaleComSindicoFloating';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SearchResult {
  type: 'obra' | 'post' | 'estatuto';
  id: string;
  title: string;
  content: string;
  metadata?: any;
  relevance: number;
}

function BuscaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      const { data: perfilData } = await supabase
        .from('perfis_moradores')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (perfilData) {
        setPerfil(perfilData);
      }

      const searchResults: SearchResult[] = [];
      const termo = searchTerm.toLowerCase();

      // Buscar obras
      const { data: obras } = await supabase
        .from('obras')
        .select('*')
        .order('created_at', { ascending: false });

      if (obras) {
        obras.forEach(obra => {
          let relevance = 0;
          if (obra.descricao.toLowerCase().includes(termo)) relevance += 10;
          if (obra.progresso.toString().includes(termo)) relevance += 5;

          if (relevance > 0) {
            searchResults.push({
              type: 'obra',
              id: obra.id,
              title: obra.descricao.split('.')[0] || obra.descricao,
              content: obra.descricao,
              metadata: obra,
              relevance
            });
          }
        });
      }

      // Buscar posts/comunicados
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .neq('autor', 'ESTATUTO')
        .order('created_at', { ascending: false });

      if (posts) {
        posts.forEach(post => {
          let relevance = 0;
          if (post.titulo.toLowerCase().includes(termo)) relevance += 15;
          if (post.conteudo.toLowerCase().includes(termo)) relevance += 10;
          if (post.autor.toLowerCase().includes(termo)) relevance += 5;

          if (relevance > 0) {
            searchResults.push({
              type: 'post',
              id: post.id,
              title: post.titulo,
              content: post.conteudo,
              metadata: post,
              relevance
            });
          }
        });
      }

      // Buscar estatuto
      const { data: estatuto } = await supabase
        .from('posts')
        .select('*')
        .eq('autor', 'ESTATUTO')
        .order('created_at', { ascending: false })
        .limit(1);

      if (estatuto && estatuto.length > 0) {
        const estatutoPost = estatuto[0];
        if (estatutoPost.conteudo.toLowerCase().includes(termo)) {
          searchResults.push({
            type: 'estatuto',
            id: estatutoPost.id,
            title: 'Estatuto do Parque',
            content: estatutoPost.conteudo,
            metadata: estatutoPost,
            relevance: 20
          });
        }
      }

      // Ordenar por relevância
      searchResults.sort((a, b) => b.relevance - a.relevance);
      setResults(searchResults);

    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("perfil_morador");
    await supabase.auth.signOut();
    router.replace("/");
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'obra': return <FileText size={20} />;
      case 'post': return <Megaphone size={20} />;
      case 'estatuto': return <FileText size={20} />;
      default: return <Search size={20} />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'obra': return 'text-blue-600 bg-blue-50';
      case 'post': return 'text-green-600 bg-green-50';
      case 'estatuto': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex h-screen bg-[#eaf3de] text-[#2c3f1d] font-sans overflow-hidden">
      <FaleComSindicoFloating />

      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <Header
          onLogout={handleLogout}
          showNavigation={false}
        />

        <main className="flex-1 px-10 pb-10">
          <div className="max-w-4xl mx-auto">
            {/* Header da busca */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#2c3f1d]/70 hover:text-[#2c3f1d] mb-4"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>

              <div className="flex items-center gap-4 mb-6">
                <Search size={24} className="text-[#2c3f1d]" />
                <h1 className="text-2xl font-bold">
                  Resultados para "{query}"
                </h1>
              </div>
            </div>

            {/* Resultados */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c3f1d] mx-auto mb-4"></div>
                <p className="text-[#2c3f1d]/70">Buscando...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-6">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="bg-white rounded-[2rem] p-6 shadow-sm border border-transparent hover:border-[#4a5937]/10 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${getResultColor(result.type)}`}>
                        {getResultIcon(result.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-[#1d2a13]">{result.title}</h3>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#eaf3de] text-[#4a5937] capitalize">
                            {result.type}
                          </span>
                        </div>

                        <p className="text-sm text-[#2c3f1d]/70 leading-relaxed mb-4">
                          {result.content.length > 200
                            ? `${result.content.substring(0, 200)}...`
                            : result.content
                          }
                        </p>

                        {result.type === 'obra' && result.metadata && (
                          <div className="flex items-center gap-4 text-xs text-[#2c3f1d]/60">
                            <span>Progresso: {result.metadata.progresso}%</span>
                            {perfil && (
                              <div className="flex items-center gap-1">
                                <Heart size={12} />
                                <span>{result.metadata.likes?.length || 0} curtidas</span>
                              </div>
                            )}
                          </div>
                        )}

                        {result.type === 'post' && result.metadata && (
                          <div className="flex items-center gap-2 text-xs text-[#2c3f1d]/60">
                            {result.metadata.urgente && (
                              <span className="bg-red-500 text-white px-2 py-1 rounded-full">
                                Urgente
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search size={48} className="text-[#2c3f1d]/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2c3f1d]/70 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-[#2c3f1d]/50">
                  Tente usar palavras-chave diferentes ou verifique a ortografia.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-[#eaf3de] text-[#2c3f1d] font-sans overflow-hidden">
        <div className="flex-1 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c3f1d] mx-auto mb-4"></div>
              <p className="text-[#2c3f1d]/70">Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <BuscaContent />
    </Suspense>
  );
}