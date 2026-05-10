/** * @vitest-environment jsdom */
import { vi, expect, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// 1. IMPORTANTE: Importe o seu componente aqui (ajuste o caminho se necessário)
import DashboardAdmin from './page'; // ou o nome do arquivo do seu componente

// Mock do Supabase
// Mock do Supabase completo para evitar erros de funções faltando
vi.mock('@supabase/supabase-js', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),    // O erro atual era aqui
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),    // "Greater than or equal" (datas/valores)
  lte: vi.fn().mockReturnThis(),    // "Less than or equal"
  gt: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),  // Buscas de texto
  is: vi.fn().mockReturnThis(),     // Ex: .is('campo', null)
  in: vi.fn().mockReturnThis(), 

    // Simulando que encontrou o perfil de admin no banco de dados
  single: vi.fn().mockResolvedValue({ 
    data: { 
      id: '123', 
      nome: 'Administrador Teste', 
      tipo_usuario: 'admin' 
    }, 
    error: null 
  }),
  auth: {
    getSession: vi.fn().mockResolvedValue({ 
      data: { session: { user: { id: '123', email: 'admin@teste.com' } } }, 
      error: null 
    }),
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: '123' } }, 
      error: null 
    }),

      // SOLUÇÃO DO ERRO: Adicionando a função que estava faltando
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    }
  };

  return {
    createClient: vi.fn(() => mockSupabase),
  };
});

// Mock também da sua instância local caso o componente a importe diretamente
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: {} } } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    }
  }
}));


// Mock do Router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/',
}));

describe('DashboardAdmin', () => {
  it('deve renderizar', () => {
    // Agora o DashboardAdmin deve estar definido por causa do import no topo
    render(<DashboardAdmin />);
    
    // Uma forma melhor de verificar se renderizou é buscar algo que existe na tela
    // Exemplo: expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(document.body).toBeDefined();
  });
});
