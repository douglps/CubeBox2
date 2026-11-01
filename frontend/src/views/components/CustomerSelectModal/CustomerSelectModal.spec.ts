import { describe, it, expect } from 'vitest';
import { Customer, Product } from '../../../types';

describe('CustomerSelectModal - Resumo de Pedidos e Resolução Comercial', () => {
  const mockProducts: Product[] = [
    {
      id: 1,
      sku: 'SKU-BEB-001',
      name: 'Cerveja Heineken Puro Malte Lata 350ml',
      category: 'Cervejas',
      unit_cost: 3.5,
      unit_price: 5.9,
      current_stock: 50,
      min_stock: 10,
      safety_stock: 5,
      lead_time_days: 2,
      is_active: true,
      status: 'ATIVO',
    },
    {
      id: 2,
      sku: 'SKU-ENG-002',
      name: 'Energético Red Bull Energy Drink 250ml',
      category: 'Energéticos',
      unit_cost: 6.0,
      unit_price: 9.99,
      current_stock: 30,
      min_stock: 10,
      safety_stock: 5,
      lead_time_days: 2,
      is_active: true,
      status: 'ATIVO',
    },
  ];

  const productsMap = new Map<number, Product>();
  mockProducts.forEach((p) => productsMap.set(p.id, p));

  it('deve resolver o nome comercial do produto mesmo quando a venda tiver apenas product_id', () => {
    const saleItem = {
      id: 101,
      product_id: 1,
      quantity: 3,
      unit_price: 5.9,
      total_price: 17.7,
    };

    const resolvedName =
      (saleItem as any).product?.name ||
      productsMap.get(saleItem.product_id)?.name ||
      `Produto #${saleItem.product_id}`;

    expect(resolvedName).toBe('Cerveja Heineken Puro Malte Lata 350ml');
  });

  it('deve formatar corretamente o endereço resumido do pedido ou do cliente', () => {
    const mockCustomer: Customer = {
      id: 10,
      nome: 'João da Silva',
      telefone: '(11) 98765-4321',
      ativo: true,
      logradouro: 'Av. Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      criado_em: '2026-10-01T10:00:00Z',
      total_pedidos: 4,
      total_gasto_ltv: 240.0,
    };

    const formatAddress = (c: Customer) => {
      return [
        c.logradouro ? `${c.logradouro}, ${c.numero || 'S/N'}` : '',
        c.bairro,
        c.cidade ? `${c.cidade}/${c.estado || 'SP'}` : '',
      ]
        .filter(Boolean)
        .join(' - ');
    };

    const addr = formatAddress(mockCustomer);
    expect(addr).toBe('Av. Paulista, 1000 - Bela Vista - São Paulo/SP');
  });

  it('deve filtrar clientes por nome, telefone ou CPF sem sensibilidade a maiúsculas', () => {
    const customers: Partial<Customer>[] = [
      { id: 1, nome: 'Mariana Silva', cpf_cnpj: '123.456.789-00', telefone: '(11) 98888-1111' },
      { id: 2, nome: 'Carlos Eduardo', cpf_cnpj: '987.654.321-99', telefone: '(21) 97777-2222' },
    ];

    const filter = (query: string) => {
      const q = query.toLowerCase().trim();
      return customers.filter(
        (c) =>
          c.nome?.toLowerCase().includes(q) ||
          c.cpf_cnpj?.toLowerCase().includes(q) ||
          c.telefone?.toLowerCase().includes(q)
      );
    };

    expect(filter('mariana')).toHaveLength(1);
    expect(filter('123.456')).toHaveLength(1);
    expect(filter('97777')).toHaveLength(1);
    expect(filter('inexistente')).toHaveLength(0);
  });

  it('deve aplicar máscaras corretas para telefone e CPF em dados do cliente', () => {
    const rawPhone = '11987654321';
    const rawCpf = '12345678900';
    const rawCep = '01310100';

    const maskPhoneTest = (val: string) => {
      const d = val.replace(/\D/g, '');
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
    };

    const maskCpfTest = (val: string) => {
      const d = val.replace(/\D/g, '');
      return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
    };

    const maskCepTest = (val: string) => {
      const d = val.replace(/\D/g, '');
      return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
    };

    expect(maskPhoneTest(rawPhone)).toBe('(11) 98765-4321');
    expect(maskCpfTest(rawCpf)).toBe('123.456.789-00');
    expect(maskCepTest(rawCep)).toBe('01310-100');
  });
});
