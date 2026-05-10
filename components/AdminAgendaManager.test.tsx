/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import AdminAgendaManager from './AdminAgendaManager';

describe('AdminAgendaManager', () => {
  it('deve montar componente admin agenda', () => {
    // Rendemos sem dar crash
    const { container } = render(<AdminAgendaManager />);
    expect(container).toBeTruthy();
  });
});
