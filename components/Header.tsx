"use client";
import { useRouter } from "next/navigation";
import { Search, LogOut } from "lucide-react";
import { useSearch } from '@/contexts/SearchContext';

interface HeaderProps {
  title?: string;
  showNavigation?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
  showCompraVenda?: boolean;
  showServicos?: boolean;
}

export default function Header({
  title = "Parque dos Eucaliptos",
  showNavigation = true,
  activeTab,
  onTabChange,
  onLogout,
  showCompraVenda = false,
  showServicos = false,
}: HeaderProps) {
  const router = useRouter();
  const { searchTerm, setSearchTerm, setIsSearching } = useSearch();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      router.push(`/busca?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <header className="flex items-center justify-between px-10 py-6 shrink-0">
      <div className="flex items-center gap-10">
        <h1 className="text-xl font-bold flex items-center gap-2">{title}</h1>

        {showNavigation && (
          <nav className="hidden md:flex gap-6 text-sm font-medium text-[#2c3f1d] items-center">
            <button
              onClick={() => onTabChange?.('dashboard')}
              className={`${activeTab === 'dashboard' ? 'border-b-[3px] border-[#2c3f1d] font-bold' : 'text-black/50 hover:text-black'} transition-colors pb-1`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onTabChange?.('estatuto')}
              className={`${activeTab === 'estatuto' ? 'border-b-[3px] border-[#2c3f1d] font-bold' : 'text-black/50 hover:text-black'} transition-colors pb-1`}
            >
              Estatuto do Parque
            </button>
            {showCompraVenda && (
              <button
                onClick={() => onTabChange?.('comercio')}
                className={`${activeTab === 'comercio' ? 'border-b-[3px] border-[#2c3f1d] font-bold' : 'text-black/50 hover:text-black'} transition-colors pb-1`}
              >
                Compra e Venda
              </button>
            )}
            {showServicos && (
              <button
                onClick={() => onTabChange?.('servicos')}
                className={`${activeTab === 'servicos' ? 'border-b-[3px] border-[#2c3f1d] font-bold' : 'text-black/50 hover:text-black'} transition-colors pb-1`}
              >
                Postagem de Serviços
              </button>
            )}
            <button
              onClick={() => onTabChange?.('transparencia')}
              className={`${activeTab === 'transparencia' ? 'border-b-[3px] border-[#2c3f1d] font-bold' : 'text-black/50 hover:text-black'} transition-colors pb-1`}
            >
              Transparência
            </button>
            <button
              onClick={() => onTabChange?.('agenda')}
              className={`${activeTab === 'agenda' ? 'border-b-[3px] border-[#2c3f1d] font-bold' : 'text-black/50 hover:text-black'} transition-colors pb-1`}
            >
              Agendas
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-red-700/60 hover:text-red-700 transition-colors pb-1 flex items-center gap-2 font-bold ml-4"
              >
                <LogOut size={14} /> Sair
              </button>
            )}
          </nav>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 text-gray-400" size={16} style={{transform: "translateY(-50%)"}} />
        <input
          type="text"
          placeholder="Buscar no site..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="bg-white rounded-full py-2 pl-10 pr-4 text-sm font-medium w-64 shadow-sm border-none outline-none focus:ring-2 focus:ring-[#2c3f1d]/20"
        />
      </form>
    </header>
  );
}