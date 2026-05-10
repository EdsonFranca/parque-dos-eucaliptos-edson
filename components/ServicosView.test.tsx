/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ServicosView from './ServicosView';

const mockServicosData = [
  {
    id: 'srv-1',
    titulo: 'Jardinagem Residencial',
    descricao: 'Corte de grama e manutenção de canteiros.',
    contato: '(11) 99999-0001',
    prestador_nome: 'Marcos',
  },
  {
    id: 'srv-2',
    titulo: 'Aulas de Violão',
    descricao: 'Aulas para iniciantes e intermediários.',
    contato: 'violao@exemplo.com',
    prestador_nome: 'Ana',
  },
];

const mockInsertSelect = vi.hoisted(() => vi.fn());
const mockInsert = vi.hoisted(() => vi.fn(() => ({ select: mockInsertSelect })));

const servicosQuery = {
  select: vi.fn(() => ({
    order: vi.fn().mockResolvedValue({ data: mockServicosData }),
  })),
  insert: mockInsert,
};

const genericQuery = {
  select: vi.fn(() => ({
    order: vi.fn().mockResolvedValue({ data: [] }),
  })),
  insert: vi.fn(() => ({
    select: vi.fn().mockResolvedValue({ data: [] }),
  })),
};

const mockFrom = vi.hoisted(() => vi.fn((table: string) => {
  if (table === 'servicos') return servicosQuery;
  return genericQuery;
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

describe('ServicosView', () => {
  const perfil = { id: 'morador-1', nome: 'Fulano QA' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('alert', vi.fn());
    let servicosList = [...mockServicosData];

    vi.stubGlobal('fetch', vi.fn(async (url: any, options: any) => {
      if (options && options.method === 'POST') {
        const newItem = {
          id: 'srv-new',
          titulo: 'Eletricista Residencial',
          descricao: 'Instalações e manutenções elétricas.',
          contato: '(11) 98888-7777',
          prestador_id: perfil.id,
          prestador_nome: perfil.nome,
        };
        servicosList = [newItem, ...servicosList];
        return {
          ok: true,
          json: async () => ({
            data: [newItem]
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ data: servicosList }),
      };
    }));
    mockInsertSelect.mockResolvedValue({
      error: null,
      data: [{
        id: 'srv-new',
        titulo: 'Eletricista Residencial',
        descricao: 'Instalações e manutenções elétricas.',
        contato: '(11) 98888-7777',
        prestador_id: perfil.id,
        prestador_nome: perfil.nome,
      }],
    });
  });

  it('lista serviços carregados', async () => {
    render(<ServicosView perfil={perfil} />);

    await waitFor(() => {
      expect(screen.getByText('Jardinagem Residencial')).toBeInTheDocument();
      expect(screen.getByText('Aulas de Violão')).toBeInTheDocument();
    });
  });

  it('permite criar uma nova postagem de serviço', async () => {
    class MockFileReader {
      result: string | ArrayBuffer | null = 'data:image/png;base64,servico123';
      onloadend: null | (() => void) = null;

      readAsDataURL() {
        if (this.onloadend) this.onloadend();
      }
    }
    vi.stubGlobal('FileReader', MockFileReader as any);

    render(<ServicosView perfil={perfil} />);

    fireEvent.click(screen.getByRole('button', { name: /publicar servico/i }));
    fireEvent.change(screen.getByPlaceholderText('Ex: Serviços de Jardinagem'), {
      target: { value: 'Eletricista Residencial' },
    });
    fireEvent.change(screen.getByPlaceholderText('(11) 98765-4321'), {
      target: { value: '(11) 98888-7777' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Descreva detalhadamente o serviço oferecido, incluindo experiência, materiais, etc...'),
      { target: { value: 'Instalações e manutenções elétricas.' } },
    );
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(['abc'], 'servico.png', { type: 'image/png' })] },
    });

    fireEvent.click(screen.getAllByRole('button', { name: /publicar serviço/i })[1] || screen.getByRole('button', { name: /publicar serviço/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(screen.getByText('Eletricista Residencial')).toBeInTheDocument();
    });
  });

  it('aplica filtro de busca na listagem de serviços', async () => {
    render(<ServicosView perfil={perfil} />);

    await waitFor(() => {
      expect(screen.getByText('Jardinagem Residencial')).toBeInTheDocument();
      expect(screen.getByText('Aulas de Violão')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Buscar por servico, descricao ou prestador'), {
      target: { value: 'violão' },
    });

    expect(screen.getByText('Aulas de Violão')).toBeInTheDocument();
    expect(screen.queryByText('Jardinagem Residencial')).not.toBeInTheDocument();
  });
});
