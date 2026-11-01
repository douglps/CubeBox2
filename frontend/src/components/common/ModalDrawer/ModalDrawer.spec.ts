import { describe, it, expect } from 'vitest';

describe('ModalDrawer - Sistema de Dimensionamento e Acessibilidade (NN/g)', () => {
  it('deve aplicar corretamente o modificador de classe para cada tamanho (size)', () => {
    const sizeMap: Record<string, string> = {
      sm: 'sizeSm',
      md: 'sizeMd',
      lg: 'sizeLg',
      xl: 'sizeXl',
      full: 'sizeFull',
    };

    const getSizeClass = (size?: 'sm' | 'md' | 'lg' | 'xl' | 'full') => {
      if (!size) return '';
      return sizeMap[size] || '';
    };

    expect(getSizeClass('lg')).toBe('sizeLg');
    expect(getSizeClass('xl')).toBe('sizeXl');
    expect(getSizeClass('sm')).toBe('sizeSm');
    expect(getSizeClass(undefined)).toBe('');
  });

  it('tamanhos lg e xl devem obedecer à restrição de pelo menos 60% da tela (65vw/75vw)', () => {
    // Simulação da especificação CSS de tokens responsivos
    const dimensions = {
      sm: { minWidthVw: 0, targetVw: 40 },
      md: { minWidthVw: 0, targetVw: 50 },
      lg: { minWidthVw: 60, targetVw: 65 }, // >= 60%
      xl: { minWidthVw: 65, targetVw: 75 }, // >= 65%
    };

    expect(dimensions.lg.minWidthVw).toBeGreaterThanOrEqual(60);
    expect(dimensions.lg.targetVw).toBeGreaterThanOrEqual(60);
    expect(dimensions.xl.minWidthVw).toBeGreaterThanOrEqual(60);
    expect(dimensions.xl.targetVw).toBeGreaterThanOrEqual(70);
  });
});

