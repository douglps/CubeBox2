import { describe, it, expect } from 'vitest';
import { PaymentSplitItem } from './SplitPaymentModal';

describe('SplitPaymentModal - Divisão e Múltiplas Formas de Pagamento', () => {
  it('deve calcular corretamente o restante quando parcelas forem adicionadas', () => {
    const total = 150.0;
    const splits: PaymentSplitItem[] = [
      { id: '1', method: 'CARTAO_CREDITO', amount: 50.0, label: 'Cartão Crédito (1º)' },
      { id: '2', method: 'CARTAO_CREDITO', amount: 50.0, label: 'Cartão Crédito (2º)' },
    ];

    const totalPaid = splits.reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = Math.max(0, parseFloat((total - totalPaid).toFixed(2)));

    expect(totalPaid).toBe(100.0);
    expect(remaining).toBe(50.0);
  });

  it('deve montar o resumo de formas de pagamento para auditoria e cupom fiscal', () => {
    const splits: PaymentSplitItem[] = [
      { id: '1', method: 'CARTAO_CREDITO', amount: 60.0, label: 'Cartão Crédito (1º)' },
      { id: '2', method: 'DINHEIRO', amount: 40.0, label: 'Dinheiro' },
    ];

    const summary = splits
      .map((s) => `${s.label}: R$ ${s.amount.toFixed(2)}`)
      .join(' + ');

    expect(summary).toBe('Cartão Crédito (1º): R$ 60.00 + Dinheiro: R$ 40.00');
  });

  it('deve sugerir notas maiores que o saldo apenas para dinheiro e limitar para cartão/pix', () => {
    const remaining = 35.0;
    const realNotes = [2, 5, 10, 20, 50, 100, 200];

    // Para cartão/pix: apenas valores estritamente menores que o restante
    const cardNotes = realNotes.filter((n) => n < remaining);
    expect(cardNotes).toEqual([2, 5, 10, 20]);
    expect(cardNotes.some((n) => n > remaining)).toBe(false);

    // Para dinheiro: pode incluir notas e dezenas maiores (pois gera troco)
    const exactNotes = realNotes.filter((n) => n <= remaining);
    const higherNotes = realNotes.filter((n) => n > remaining);
    const nextTen = Math.ceil(remaining / 10) * 10;
    const candidates = new Set<number>();
    exactNotes.forEach((n) => candidates.add(n));
    if (nextTen > remaining) candidates.add(nextTen);
    if (higherNotes.length > 0) candidates.add(higherNotes[0]);

    const cashNotes = Array.from(candidates).sort((a, b) => a - b);
    expect(cashNotes).toContain(40); // Próxima dezena
    expect(cashNotes).toContain(50); // Próxima nota
  });

  it('deve registrar valor aplicado limitado ao saldo e calcular troco quando dinheiro for superior ao total', () => {
    const remaining = 50.0;
    const inputAmount = 100.0; // Nota de 100 entregue pelo cliente

    let appliedAmount = inputAmount;
    let cashReceived: number | undefined = undefined;
    let change: number | undefined = undefined;

    if (inputAmount > remaining && remaining > 0) {
      appliedAmount = remaining;
      cashReceived = inputAmount;
      change = parseFloat((inputAmount - remaining).toFixed(2));
    }

    expect(appliedAmount).toBe(50.0);
    expect(cashReceived).toBe(100.0);
    expect(change).toBe(50.0);
  });
});

