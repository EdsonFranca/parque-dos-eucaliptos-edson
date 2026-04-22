import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card'
import React from 'react'

describe('Card Component', () => {
  it('deve renderizar o título, descrição e a imagem corretamente', () => {
    const props = {
      title: 'Título de Teste',
      desc: 'Descrição de Teste do Card',
      img: 'https://via.placeholder.com/150'
    }

    render(<Card {...props} />)

    expect(screen.getByText('Título de Teste')).toBeInTheDocument()
    expect(screen.getByText('Descrição de Teste do Card')).toBeInTheDocument()
    
    const imgElement = screen.getByRole('img')
    expect(imgElement).toHaveAttribute('src', props.img)
  })
})
