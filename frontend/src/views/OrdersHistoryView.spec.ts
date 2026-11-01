import { describe, it, expect } from 'vitest';

export function parsePaymentBadges(paymentMethod: string): string[] {
  const labels: Record<string, string> = {
    DINHEIRO: 'Dinheiro',
    CREDITO: 'Crédito',
    DEBITO: 'Débito',
    PIX: 'PIX',
    'CARTAO CREDITO': 'Crédito',
    'CARTAO DEBITO': 'Débito',
    'CARTÃO CRÉDITO': 'Crédito',
    'CARTÃO DÉBITO': 'Débito',
  };

  const raw = paymentMethod?.trim() || '';
  const isMultiple = raw.toUpperCase().startsWith('MÚLTIPLO') || raw.toUpperCase().startsWith('MULTIPLO');

  if (!isMultiple) {
    return [labels[raw.toUpperCase()] || raw];
  }

  const outerContent = raw.slice(raw.indexOf('(') + 1, raw.lastIndexOf(')'));
  const types: string[] = [];

  if (outerContent) {
    const parts = outerContent.split(/\s+\+\s+/);
    parts.forEach((p) => {
      let name = p.replace(/\(.*?\)/g, '');
      name = name.split(/[:\d]|R\$/)[0].trim();

      if (name) {
        const normalizedKey = name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const formattedName =
          labels[name.toUpperCase()] ||
          labels[normalizedKey] ||
          name;

        if (!types.includes(formattedName)) {
          types.push(formattedName);
        }
      }
    });
  }

  return types.length > 0 ? types : ['Múltiplo'];
}

describe('OrdersHistory - parsePaymentBadges', () => {
  it('deve extrair tipos de pagamento lado a lado quando for múltiplo com formato padrão', () => {
    const raw = 'MÚLTIPLO (Dinheiro R$ 10.00 + PIX R$ 20.00)';
    const result = parsePaymentBadges(raw);
    expect(result).toEqual(['Dinheiro', 'PIX']);
  });

  it('deve extrair tipos quando vier com número ordinal como Cartão Crédito (1º)', () => {
    const raw = 'MÚLTIPLO (Dinheiro: R$ 50,00 + Cartão Crédito (1º): R$ 124,40)';
    const result = parsePaymentBadges(raw);
    expect(result).toEqual(['Dinheiro', 'Crédito']);
  });

  it('deve extrair tipos quando vier com dois pontos e troco', () => {
    const raw = 'MÚLTIPLO (Dinheiro: R$ 50,00 (Recebido: R$ 100,00 | Troco: R$ 50,00) + Cartão Crédito (1º): R$ 30,00)';
    const result = parsePaymentBadges(raw);
    expect(result).toEqual(['Dinheiro', 'Crédito']);
  });

  it('deve retornar forma simples quando não for múltiplo', () => {
    expect(parsePaymentBadges('PIX')).toEqual(['PIX']);
    expect(parsePaymentBadges('DINHEIRO')).toEqual(['Dinheiro']);
    expect(parsePaymentBadges('CREDITO')).toEqual(['Crédito']);
  });

  it('deve deduplicar tipos repetidos no mesmo rateio', () => {
    const raw = 'MÚLTIPLO (PIX (1º) R$ 10.00 + PIX (2º) R$ 20.00)';
    const result = parsePaymentBadges(raw);
    expect(result).toEqual(['PIX']);
  });
});
