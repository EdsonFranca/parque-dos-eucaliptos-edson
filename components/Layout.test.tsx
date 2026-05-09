/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import Layout from './Layout';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}));

describe('Layout', () => {
  it('renderiza os filhos', () => {
    const { getByText } = render(<Layout><div>Conteudo Layout</div></Layout>);
    expect(getByText('Conteudo Layout')).toBeTruthy();
  });
});
