/**
 * @vitest-environment jsdom
 */
import { vi, expect, describe, it } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

const mockSupabaseInstance = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn(),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  })),
  removeChannel: vi.fn(),
  rpc: vi.fn(),
}));

// 1. Mock do Supabase ANTES de qualquer import
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => mockSupabaseInstance),
  };
});

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush, query: {} })),
}));

// 2. Mocks dos componentes locais
vi.mock('@/components/FaleComSindicoFloating', () => ({
  default: () => <div data-testid="mock-fale-sindico">Fale com o Sindico</div>,
}));

vi.mock('@/components/Header', () => ({
  default: () => <header>Header Mock</header>,
}));

// 3. Agora importamos a página e o createClient mockado
import Dashboard from './page';
import { createClient } from '@supabase/supabase-js';

const mockSupabase = mockSupabaseInstance;

describe('Dashboard', () => {
  it('deve renderizar o dashboard quando o usuário estiver autenticado', async () => {
    // Definimos o que o getSession deve retornar neste teste
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: '123', email: 'teste@teste.com' } } },
      error: null,
    });
    
    mockSupabase.single.mockResolvedValue({
      data: { id: '123', nome: 'John Doe', tipo_usuario: 'morador' },
      error: null
    });

    render(<Dashboard />);

    await waitFor(() => {
      // Use um texto que você sabe que existe no Dashboard
      expect(screen.getByText(/BEM-VINDO AO CORAÇÃO VERDE/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem de erro se não houver sessão', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
