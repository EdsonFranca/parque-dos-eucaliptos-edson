/**
 * @vitest-environment jsdom
 */
import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

test('Verifica se o teste está funcionando', () => {
  render(<h1>Olá Vitest</h1>)
  const elemento = screen.getByText(/Olá Vitest/i)
  expect(elemento).toBeDefined()
})
