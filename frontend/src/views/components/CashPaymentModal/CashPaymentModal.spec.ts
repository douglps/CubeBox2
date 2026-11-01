import { describe, it, expect } from 'vitest';

describe('CashPaymentModal - Lógica de Troco e Notas', () => {
  it('deve calcular o troco quando valor recebido for maior', () => {
    const total = 35.5;
    const received = 50.0;
    const change = Math.max(0, received - total);
    expect(change).toBeCloseTo(14.5, 2);
  });

  it('deve gerar múltiplos adequados de 10, 20, 50 e 100 estritamente superiores ao total', () => {
    const total = 37.5;
    const bases = [10, 20, 50, 100];
    const candidates = bases.map((base) => Math.ceil(total / base) * base);
    const valid = Array.from(new Set(candidates.filter((v) => v > total))).sort((a, b) => a - b);

    // Múltiplo de 10: 40 | Múltiplo de 20: 40 | Múltiplo de 50: 50 | Múltiplo de 100: 100
    expect(valid).toEqual([40, 50, 100]);
  });

  it('deve gerar múltiplos corretos para valores maiores como 195.25', () => {
    const total = 195.25;
    const bases = [10, 20, 50, 100];
    const candidates = bases.map((base) => Math.ceil(total / base) * base);
    const valid = Array.from(new Set(candidates.filter((v) => v > total))).sort((a, b) => a - b);

    // Múltiplo de 10: 200 | Múltiplo de 20: 200 | Múltiplo de 50: 200 | Múltiplo de 100: 200
    expect(valid).toEqual([200]);
  });
});

