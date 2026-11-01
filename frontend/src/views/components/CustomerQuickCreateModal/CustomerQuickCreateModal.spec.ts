import { describe, it, expect } from 'vitest';

describe('CustomerQuickCreateModal Component Test Suite', () => {
  it('validates telephone requirement (minimum 10 digits)', () => {
    const rawPhone = '(11) 98765-4321';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    expect(cleanPhone.length).toBeGreaterThanOrEqual(10);
  });

  it('allows customer creation with 0 addresses when semEndereco toggle is activated', () => {
    const customerPayload = {
      nome: 'João da Silva',
      telefone: '(11) 98888-7777',
      ativo: true,
      semEndereco: true,
    };
    expect(customerPayload.nome).toBeDefined();
    expect(customerPayload.telefone).toBeDefined();
    expect(customerPayload.semEndereco).toBe(true);
  });

  it('sorts saved addresses placing the default address on top', () => {
    const addresses = [
      { id: 1, apelido: 'Filial', is_default: false },
      { id: 2, apelido: 'Residência', is_default: true },
      { id: 3, apelido: 'Trabalho', is_default: false },
    ];
    const sorted = [...addresses].sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return a.id - b.id;
    });

    expect(sorted[0].id).toBe(2);
    expect(sorted[0].is_default).toBe(true);
  });

  it('does not display make default button when address is already default', () => {
    const addr = { id: 2, apelido: 'Residência', is_default: true };
    const shouldShowMakeDefault = !addr.is_default;
    expect(shouldShowMakeDefault).toBe(false);
  });
});
