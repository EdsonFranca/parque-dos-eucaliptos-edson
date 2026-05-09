/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import FaleComSindicoFloating from './FaleComSindicoFloating';

describe('FaleComSindicoFloating', () => {
  it('renderiza o botão flutuante', () => {
    const { container } = render(<FaleComSindicoFloating />);
    expect(container).toBeTruthy();
  });
});
