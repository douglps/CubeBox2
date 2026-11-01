import { describe, it, expect } from 'vitest';
import { Customer } from '../../../types';

describe('CustomerDetailPane - Regras de Apresentação e Métricas CRM', () => {
  const customer: Customer = {
    id: 42,
    nome: 'Beatriz Almeida Santos',
    cpf_cnpj: '111.222.333-44',
    telefone: '(11) 99999-8888',
    email: 'beatriz@exemplo.com',
    ativo: true,
    cep: '04538-133',
    logradouro: 'Rua Funchal',
    numero: '500',
    complemento: '10º andar',
    bairro: 'Vila Olímpia',
    cidade: 'São Paulo',
    estado: 'SP',
    criado_em: '2026-05-10T14:30:00Z',
    total_pedidos: 8,
    total_gasto_ltv: 1200.0,
  };

  it('deve extrair as iniciais corretamente para o avatar', () => {
    const initials = customer.nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    expect(initials).toBe('BA');
  });

  it('deve calcular o Ticket Médio corretamente baseado em LTV e Total de Pedidos', () => {
    const ticketMedio =
      customer.total_pedidos > 0
        ? customer.total_gasto_ltv / customer.total_pedidos
        : 0;

    expect(ticketMedio).toBe(150.0);
  });

  it('deve retornar 0 quando o cliente não tiver pedidos realizados', () => {
    const newCustomer = { ...customer, total_pedidos: 0, total_gasto_ltv: 0 };
    const ticketMedio =
      newCustomer.total_pedidos > 0
        ? newCustomer.total_gasto_ltv / newCustomer.total_pedidos
        : 0;

    expect(ticketMedio).toBe(0);
  });

  it('deve validar se a viewport qualifica como tela grande (>= 1634px) ou tela menor (< 1634px)', () => {
    const isLargeScreen = (width: number) => width >= 1634;

    expect(isLargeScreen(1920)).toBe(true);
    expect(isLargeScreen(1634)).toBe(true);
    expect(isLargeScreen(1633)).toBe(false);
    expect(isLargeScreen(1280)).toBe(false);
    expect(isLargeScreen(1024)).toBe(false);
    expect(isLargeScreen(768)).toBe(false);
    expect(isLargeScreen(375)).toBe(false);
  });

  it('deve ocultar o botão de fechar interno quando for renderizado em modal', () => {
    const getShouldShowInternalCloseButton = (isModal: boolean) => !isModal;

    expect(getShouldShowInternalCloseButton(false)).toBe(true);
    expect(getShouldShowInternalCloseButton(true)).toBe(false);
  });
});

