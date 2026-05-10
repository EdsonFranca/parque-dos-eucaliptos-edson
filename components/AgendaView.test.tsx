/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import AgendaView from './AgendaView';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}));

describe('AgendaView', () => {
  it('deve renderizar a agenda', () => {
    // Rende sem quebrar
    const { container } = render(<AgendaView />);
    expect(container).toBeTruthy();
  });
});
