/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import AdminTransparenciaManager from './AdminTransparenciaManager';

describe('AdminTransparenciaManager', () => {
  it('deve montar componente admin transparencia', () => {
    const { container } = render(<AdminTransparenciaManager />);
    expect(container).toBeTruthy();
  });
});
