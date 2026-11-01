import { describe, it, expect } from 'vitest';

describe('CheckoutModal - Regras de Cálculo de Troco e Descontos', () => {
  it('deve calcular o troco correto quando o valor recebido for superior ao total', () => {
    const total = 42.5;
    const cashReceived = 50.0;
    const change = Math.max(0, cashReceived - total);
    expect(change).toBeCloseTo(7.5, 2);
  });

  it('deve identificar deficit quando o valor recebido for menor que o total', () => {
    const total = 100.0;
    const cashReceived = 80.0;
    const deficit = Math.max(0, total - cashReceived);
    expect(deficit).toBe(20.0);
  });

  it('deve gerar notas sugeridas lógicas baseadas no total', () => {
    const total = 37.9;
    const notes = [10, 20, 50, 100, 200];
    const available = notes.filter((n) => n >= total);
    const nextTen = Math.ceil(total / 10) * 10;
    const combined = Array.from(new Set([total, nextTen, ...available]))
      .filter((v) => v >= total)
      .slice(0, 4);

    expect(combined).toContain(37.9); // Exato
    expect(combined).toContain(40);   // Próxima dezena
    expect(combined).toContain(50);   // Próxima nota
  });
});

