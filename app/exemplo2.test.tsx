/**
 * @vitest-environment jsdom
 */
import { expect, vi, describe, it } from 'vitest'




// 1. Mock do módulo do Supabase antes de importar o componente
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  })),
}))

// 2. Mock do seu arquivo de lib (opcional se o de cima funcionar)
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) }
  }
}))

// 3. Mock do Router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

import { render, screen } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);


import Login from './membros/login/page'

describe('Login component', () => {
  it('renders the title correctly', () => {
    render(<Login />)

    const titleElement = screen.getByRole('heading', { name: /Acesso Morador/i })

    expect(titleElement).toBeDefined() // O Vitest entende o toBeDefined por padrão
expect(titleElement).toHaveTextContent(/Acesso Morador/i)
  })
})