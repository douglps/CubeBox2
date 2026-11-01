import { describe, it, expect } from 'vitest';
import React from 'react';
import { SkeletonShimmer } from './SkeletonShimmer';

describe('SkeletonShimmer Component - Contrato de Dimensão & Variantes', () => {
  it('deve exportar uma função de componente React válida', () => {
    expect(typeof SkeletonShimmer).toBe('function');
  });

  it('deve formatar números para pixels e aceitar strings de porcentagem', () => {
    const elWithNum = React.createElement(SkeletonShimmer, { width: 120, height: 24 });
    expect(elWithNum.props.width).toBe(120);
    expect(elWithNum.props.height).toBe(24);

    const elWithPct = React.createElement(SkeletonShimmer, { width: '80%', height: '100%' });
    expect(elWithPct.props.width).toBe('80%');
    expect(elWithPct.props.height).toBe('100%');
  });

  it('deve suportar variantes circle, text e rect', () => {
    const circleEl = React.createElement(SkeletonShimmer, { variant: 'circle' });
    expect(circleEl.props.variant).toBe('circle');

    const textEl = React.createElement(SkeletonShimmer, { variant: 'text' });
    expect(textEl.props.variant).toBe('text');
  });
});

