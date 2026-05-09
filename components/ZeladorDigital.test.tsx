/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import ZeladorDigital from './ZeladorDigital';

describe('ZeladorDigital', () => {
  it('deve renderizar o assistente', () => {
    const { container } = render(<ZeladorDigital />);
    expect(container).toBeTruthy();
  });
});
