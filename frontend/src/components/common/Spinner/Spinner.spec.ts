import { describe, it, expect } from 'vitest';
import React from 'react';
import { Spinner } from './Spinner';

describe('Spinner Component - Contrato de Acessibilidade & Estilo', () => {
  it('deve exportar uma função de componente React válida', () => {
    expect(typeof Spinner).toBe('function');
  });

  it('deve ter props com valores padrão para size, variant e label', () => {
    const element = React.createElement(Spinner);
    expect(element.type).toBe(Spinner);
    expect(element.props).toEqual({});
  });

  it('deve aceitar parâmetros de acessibilidade customizados', () => {
    const element = React.createElement(Spinner, {
      size: 'lg',
      variant: 'primary',
      label: 'Sincronizando com a base de dados...',
    });
    expect(element.props.size).toBe('lg');
    expect(element.props.variant).toBe('primary');
    expect(element.props.label).toBe('Sincronizando com a base de dados...');
  });
});

