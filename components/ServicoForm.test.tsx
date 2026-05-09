/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ServicoForm from './ServicoForm';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } } }) }
  }
}));

describe('ServicoForm', () => {
  it('deve carregar o componente', () => {
    render(<ServicoForm perfil={{id:'1', nome:'A'}} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(/Título do Serviço/i)).toBeTruthy();
  });
});
