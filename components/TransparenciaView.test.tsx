/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import TransparenciaView from './TransparenciaView';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}));

describe('TransparenciaView', () => {
  it('deve montar o painel financeiro', () => {
    const { container } = render(<TransparenciaView />);
    expect(container).toBeTruthy();
  });
});
