/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ClassificadosView from './ClassificadosView';

const mockClassificadosData = [
  {
    id: '1',
    vendedor_id: 'outro-1',
    vendedor_nome: 'Joana',
    titulo: 'Bicicleta Aro 29',
    descricao: 'Semi nova, revisada.',
    preco: 1200,
    imagem_url: 'https://img.local/bike.png',
  },
  {
    id: '2',
    vendedor_id: 'outro-2',
    vendedor_nome: 'Carlos',
    titulo: 'Sofá 3 lugares',
    descricao: 'Confortável e conservado.',
    preco: 600,
    imagem_url: 'https://img.local/sofa.png',
  },
];

const mockChatsData: any[] = [];

const mockInsertSelect = vi.hoisted(() => vi.fn());
const mockInsert = vi.hoisted(() => vi.fn(() => ({ select: mockInsertSelect })));
const mockDeleteEq = vi.hoisted(() => vi.fn());
const mockDelete = vi.hoisted(() => vi.fn(() => ({ eq: mockDeleteEq })));

const classificadosQuery = {
  select: vi.fn(() => ({
    order: vi.fn().mockResolvedValue({ data: mockClassificadosData }),
  })),
  insert: mockInsert,
  delete: mockDelete,
};

const chatsQuery = {
  select: vi.fn(() => ({
    or: vi.fn().mockResolvedValue({ data: mockChatsData }),
  })),
};

const genericQuery = {
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn().mockResolvedValue({ data: null }),
      order: vi.fn().mockResolvedValue({ data: [] }),
    })),
    order: vi.fn().mockResolvedValue({ data: [] }),
  })),
  insert: vi.fn(() => ({
    select: vi.fn().mockResolvedValue({ data: [] }),
  })),
};

const mockFrom = vi.hoisted(() => vi.fn((table: string) => {
  if (table === 'classificados') return classificadosQuery;
  if (table === 'chats_classificados') return chatsQuery;
  return genericQuery;
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('ClassificadosView', () => {
  const perfil = { id: 'morador-123', nome: 'Fulano' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertSelect.mockResolvedValue({
      error: null,
      data: [{
        id: 'novo-1',
        vendedor_id: perfil.id,
        vendedor_nome: perfil.nome,
        titulo: 'Mesa de Jantar',
        descricao: '6 lugares, madeira maciça.',
        preco: 900,
        imagem_url: 'data:image/png;base64,abc123',
      }],
    });
    mockDeleteEq.mockResolvedValue({ error: null });
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('lista anúncios carregados da vitrine', async () => {
    render(<ClassificadosView perfil={perfil} />);

    await waitFor(() => {
      expect(screen.getByText('Bicicleta Aro 29')).toBeInTheDocument();
      expect(screen.getByText('Sofá 3 lugares')).toBeInTheDocument();
    });
  });

  it('permite criar um novo anúncio', async () => {
    class MockFileReader {
      result: string | ArrayBuffer | null = 'data:image/png;base64,abc123';
      onloadend: null | (() => void) = null;

      readAsDataURL() {
        if (this.onloadend) this.onloadend();
      }
    }
    vi.stubGlobal('FileReader', MockFileReader as any);

    render(<ClassificadosView perfil={perfil} />);

    fireEvent.click(screen.getByRole('button', { name: /anunciar/i }));
    fireEvent.change(screen.getByPlaceholderText('Título do Produto'), {
      target: { value: 'Mesa de Jantar' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Descreva as condições, tempo de uso, motivo da venda...'),
      { target: { value: '6 lugares, madeira maciça.' } },
    );
    fireEvent.change(screen.getByPlaceholderText('0.00'), {
      target: { value: '900' },
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [new File(['abc'], 'foto.png', { type: 'image/png' })] } });

    fireEvent.click(screen.getByRole('button', { name: /publicar oferta/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
      expect(screen.getByText('Mesa de Jantar')).toBeInTheDocument();
    });
  });

  it('aplica filtros por texto e faixa de preço', async () => {
    render(<ClassificadosView perfil={perfil} />);

    await waitFor(() => {
      expect(screen.getByText('Bicicleta Aro 29')).toBeInTheDocument();
      expect(screen.getByText('Sofá 3 lugares')).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText('Buscar por título, descrição ou morador'),
      { target: { value: 'bicicleta' } },
    );
    expect(screen.getByText('Bicicleta Aro 29')).toBeInTheDocument();
    expect(screen.queryByText('Sofá 3 lugares')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Buscar por título, descrição ou morador'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByPlaceholderText('Preço mínimo'), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByPlaceholderText('Preço máximo'), {
      target: { value: '1300' },
    });

    expect(screen.getByText('Bicicleta Aro 29')).toBeInTheDocument();
    expect(screen.queryByText('Sofá 3 lugares')).not.toBeInTheDocument();
  });
});
