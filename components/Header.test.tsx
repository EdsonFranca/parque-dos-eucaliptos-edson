/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';

// Mock Router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}));

vi.mock('@/contexts/SearchContext', () => ({
  useSearch: vi.fn(() => ({
    searchTerm: '',
    setSearchTerm: vi.fn(),
    setIsSearching: vi.fn(),
  })),
}));

describe('Header', () => {
  it('deve renderizar o titular', () => {
    render(<Header title="Teste Header" />);
    expect(screen.getByText('Teste Header')).toBeTruthy();
  });
});
