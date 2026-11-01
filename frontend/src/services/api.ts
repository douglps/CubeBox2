/**
 * =============================================================================
 * CLIENTE DE COMUNICAÇÃO HTTP (API CLIENT) - CUBEBOX ENTERPRISE
 * =============================================================================
 * Projeto: CubeBox Enterprise
 * Função no Negócio:
 *     Centraliza todas as chamadas de rede REST com o backend FastAPI.
 *     Gerencia Produtos (CRUD & Congelamento), Clientes (CRM), Vendas (PDV)
 *     e Inferência dos Modelos de Inteligência Artificial.
 * =============================================================================
 */

import {
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
  Customer,
  CustomerCreatePayload,
  SaleCreate,
  SaleResponse,
  DashboardKPIs,
  ForecastResponse,
  ReorderSuggestionItem,
  ClusterSummary,
  PurchaseOrder,
  InventoryLossCreate,
} from '../types';

const BASE_URL = '/api';

/**
 * Normaliza erros da API seguindo RFC 7807 e diretrizes de usabilidade Nielsen #9.
 * Retorna mensagem amigável de 1 linha e sinalizador de falha transitória (passível de retry).
 */
export interface NormalizedApiError {
  message: string;
  isTransient: boolean;
  status: number;
}

export function normalizeError(err: unknown, fallbackMessage = 'Não foi possível concluir a ação.'): NormalizedApiError {
  if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
    return {
      message: 'Sem conexão com o sistema. Verifique a rede.',
      isTransient: true,
      status: 0,
    };
  }

  if (typeof err === 'object' && err !== null && 'message' in err) {
    const rawMsg = String((err as any).message || '');
    const status = Number((err as any).status || 0);

    // Detecção de falhas transitórias de infraestrutura
    if (status === 0 || status === 500 || status === 502 || status === 503 || status === 504) {
      return {
        message: status === 503 ? 'Cálculo de previsão temporariamente indisponível.' : 'Não foi possível concluir. Nenhuma alteração foi salva.',
        isTransient: true,
        status,
      };
    }

    // Regras de negócio limpas
    if (rawMsg.includes('CONGELADO')) {
      return { message: 'Este produto está bloqueado para venda pela gerência.', isTransient: false, status: 422 };
    }
    if (rawMsg.toLowerCase().includes('estoque insuficiente') || rawMsg.toLowerCase().includes('saldo insuficiente')) {
      return { message: rawMsg, isTransient: false, status: 422 };
    }
    if (rawMsg.includes('CPF/CNPJ') || rawMsg.includes('cliente cadastrado')) {
      return { message: 'Este CPF já pertence a outro cliente cadastrado.', isTransient: false, status: 409 };
    }
    if (rawMsg.includes('SKU')) {
      return { message: 'Já existe um produto cadastrado com este SKU.', isTransient: false, status: 409 };
    }

    return {
      message: rawMsg || fallbackMessage,
      isTransient: status >= 500,
      status,
    };
  }

  return {
    message: fallbackMessage,
    isTransient: false,
    status: 500,
  };
}

export async function requestJson<T>(url: string, init?: RequestInit, fallbackError = 'Falha na requisição'): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err: unknown) {
    const norm = normalizeError(err, 'Sem conexão com o sistema. Verifique a rede.');
    const error: any = new Error(norm.message);
    error.isTransient = norm.isTransient;
    error.status = norm.status;
    throw error;
  }

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body.detail || body.title || body.message || '';
    } catch {
      // Ignora erro de parse caso retorno não seja json
    }

    const norm = normalizeError({ message: detail, status: res.status }, fallbackError);
    const error: any = new Error(norm.message);
    error.isTransient = norm.isTransient;
    error.status = norm.status;
    throw error;
  }

  return res.json();
}

// ==========================================
// PRODUTOS & CATÁLOGO COMERCIAL
// ==========================================
export async function fetchProducts(categoria?: string, status?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (categoria) params.append('categoria', categoria);
  if (status) params.append('status', status);

  const url = `${BASE_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;
  const data = await requestJson<any[]>(url, undefined, 'Não foi possível carregar os produtos.');

  return (data || []).map((p: any) => {
    const unitPrice = p.preco_unitario ?? p.unit_price ?? 0;
    const unitCost = p.custo_unitario ?? p.unit_cost ?? 0;
    const margin = unitPrice > 0 ? ((unitPrice - unitCost) / unitPrice) * 100 : 0;

    return {
      id: p.id,
      sku: p.sku,
      name: p.nome || p.name || '',
      category: p.categoria || p.category || '',
      unit_cost: unitCost,
      unit_price: unitPrice,
      current_stock: p.estoque_atual ?? p.current_stock ?? 0,
      min_stock: p.estoque_minimo ?? p.min_stock ?? 0,
      safety_stock: Math.round((p.estoque_minimo ?? p.min_stock ?? 10) * 1.5),
      lead_time_days: p.lead_time_dias ?? p.lead_time_days ?? 2,
      is_active: p.status !== 'CONGELADO',
      status: (p.status || 'ATIVO') as 'ATIVO' | 'CONGELADO',
      profit_margin_pct: Math.round(margin * 10) / 10,
    };
  });
}

export async function createProduct(payload: ProductCreatePayload): Promise<Product> {
  const backendPayload = {
    sku: payload.sku,
    nome: payload.name,
    categoria: payload.category,
    preco_unitario: payload.unit_price,
    custo_unitario: payload.unit_cost,
    estoque_atual: payload.current_stock,
    estoque_minimo: payload.min_stock,
    lead_time_dias: payload.lead_time_days,
    status: payload.status || 'ATIVO',
  };

  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendPayload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Falha ao cadastrar novo produto');
  }
  const p = await res.json();
  const margin = p.preco_unitario > 0 ? ((p.preco_unitario - p.custo_unitario) / p.preco_unitario) * 100 : 0;

  return {
    id: p.id,
    sku: p.sku,
    name: p.nome,
    category: p.categoria,
    unit_cost: p.custo_unitario,
    unit_price: p.preco_unitario,
    current_stock: p.estoque_atual,
    min_stock: p.estoque_minimo,
    safety_stock: Math.round(p.estoque_minimo * 1.5),
    lead_time_days: p.lead_time_dias,
    is_active: p.status !== 'CONGELADO',
    status: p.status as 'ATIVO' | 'CONGELADO',
    profit_margin_pct: Math.round(margin * 10) / 10,
  };
}

export async function updateProduct(id: number, payload: ProductUpdatePayload): Promise<Product> {
  const backendPayload: any = {};
  if (payload.name !== undefined) backendPayload.nome = payload.name;
  if (payload.category !== undefined) backendPayload.categoria = payload.category;
  if (payload.unit_price !== undefined) backendPayload.preco_unitario = payload.unit_price;
  if (payload.unit_cost !== undefined) backendPayload.custo_unitario = payload.unit_cost;
  if (payload.current_stock !== undefined) backendPayload.estoque_atual = payload.current_stock;
  if (payload.min_stock !== undefined) backendPayload.estoque_minimo = payload.min_stock;
  if (payload.lead_time_days !== undefined) backendPayload.lead_time_dias = payload.lead_time_days;
  if (payload.status !== undefined) backendPayload.status = payload.status;

  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendPayload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Falha ao atualizar dados do produto');
  }
  const p = await res.json();
  const margin = p.preco_unitario > 0 ? ((p.preco_unitario - p.custo_unitario) / p.preco_unitario) * 100 : 0;

  return {
    id: p.id,
    sku: p.sku,
    name: p.nome,
    category: p.categoria,
    unit_cost: p.custo_unitario,
    unit_price: p.preco_unitario,
    current_stock: p.estoque_atual,
    min_stock: p.estoque_minimo,
    safety_stock: Math.round(p.estoque_minimo * 1.5),
    lead_time_days: p.lead_time_dias,
    is_active: p.status !== 'CONGELADO',
    status: p.status as 'ATIVO' | 'CONGELADO',
    profit_margin_pct: Math.round(margin * 10) / 10,
  };
}

export async function toggleProductStatus(id: number, status: 'ATIVO' | 'CONGELADO'): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Falha ao alterar status do produto');
  }
  const p = await res.json();
  const margin = p.preco_unitario > 0 ? ((p.preco_unitario - p.custo_unitario) / p.preco_unitario) * 100 : 0;

  return {
    id: p.id,
    sku: p.sku,
    name: p.nome,
    category: p.categoria,
    unit_cost: p.custo_unitario,
    unit_price: p.preco_unitario,
    current_stock: p.estoque_atual,
    min_stock: p.estoque_minimo,
    safety_stock: Math.round(p.estoque_minimo * 1.5),
    lead_time_days: p.lead_time_dias,
    is_active: p.status !== 'CONGELADO',
    status: p.status as 'ATIVO' | 'CONGELADO',
    profit_margin_pct: Math.round(margin * 10) / 10,
  };
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Falha ao excluir produto');
  }
}

// ==========================================
// CLIENTES (CRM DE BALCÃO)
// ==========================================
export async function fetchCustomers(query?: string): Promise<Customer[]> {
  const url = query ? `${BASE_URL}/customers?q=${encodeURIComponent(query)}` : `${BASE_URL}/customers`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao carregar lista de clientes');
  return res.json();
}

export async function createCustomer(payload: CustomerCreatePayload): Promise<Customer> {
  const res = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Falha ao cadastrar cliente');
  }
  return res.json();
}

export async function updateCustomer(id: number, payload: Partial<CustomerCreatePayload>): Promise<Customer> {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Falha ao atualizar cliente');
  }
  return res.json();
}

export async function addCustomerAddress(customerId: number, payload: any) {
  const res = await fetch(`${BASE_URL}/customers/${customerId}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Falha ao adicionar endereço ao cliente');
  }
  return res.json();
}

export async function setDefaultCustomerAddress(customerId: number, addressId: number) {
  const res = await fetch(`${BASE_URL}/customers/${customerId}/addresses/${addressId}/default`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Falha ao definir endereço padrão');
  }
  return res.json();
}

export async function deleteCustomerAddress(customerId: number, addressId: number) {
  const res = await fetch(`${BASE_URL}/customers/${customerId}/addresses/${addressId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Falha ao remover endereço');
  }
}

export async function fetchCustomerOrders(customerId: number, limit = 10): Promise<SaleResponse[]> {
  const res = await fetch(`${BASE_URL}/customers/${customerId}/orders?limit=${limit}`);
  if (!res.ok) throw new Error('Falha ao carregar histórico de pedidos do cliente');
  const data = await res.json();
  return (data || []).map((s: any) => ({
    id: s.id,
    order_number: s.numero_pedido || '',
    customer_id: s.customer_id,
    customer_nome: s.customer_nome,
    sale_date: s.data_hora || '',
    payment_method: s.forma_pagamento || '',
    gross_total: s.subtotal ?? 0,
    discount_percentage: s.percentual_desconto ?? 0,
    discount_amount: s.valor_desconto ?? 0,
    taxa_entrega: s.taxa_entrega ?? 0,
    tipo_entrega: s.tipo_entrega || 'BALCAO',
    cpf_nota: s.cpf_nota,
    endereco_entrega_snapshot: s.endereco_entrega_snapshot,
    net_total: s.valor_total ?? 0,
    status: s.status || 'CONCLUIDO',
    items: (s.items || []).map((it: any) => ({
      id: it.id,
      product_id: it.product_id,
      quantity: it.quantidade ?? 0,
      unit_price: it.preco_unitario ?? 0,
      total_price: it.subtotal ?? 0,
      product: it.product_sku
        ? {
            id: it.product_id,
            sku: it.product_sku,
            name: it.product_nome || '',
            category: '',
            unit_cost: 0,
            unit_price: it.preco_unitario ?? 0,
            current_stock: 0,
            min_stock: 0,
            safety_stock: 0,
            lead_time_days: 0,
            is_active: true,
            status: 'ATIVO',
          }
        : undefined,
    })),
  }));
}

// ==========================================
// VENDAS (PDV DE BALCÃO)
// ==========================================
export async function createSale(payload: SaleCreate): Promise<SaleResponse> {
  const backendPayload = {
    forma_pagamento: payload.payment_method,
    customer_id: payload.customer_id,
    percentual_desconto: payload.discount_percentage || 0,
    valor_desconto: payload.discount_amount || 0,
    tipo_entrega: payload.tipo_entrega || 'BALCAO',
    taxa_entrega: payload.taxa_entrega || 0,
    cpf_nota: payload.cpf_nota,
    endereco_entrega_snapshot: payload.endereco_entrega_snapshot,
    itens: payload.items.map((i) => ({
      product_id: i.product_id,
      quantidade: i.quantity,
    })),
  };

  const data = await requestJson<any>(
    `${BASE_URL}/sales`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
    },
    'Não foi possível concluir a venda.'
  );
  return {
    id: data.id,
    order_number: data.numero_pedido || data.order_number || '',
    customer_id: data.customer_id,
    customer_nome: data.customer_nome,
    sale_date: data.data_hora || data.sale_date || '',
    payment_method: data.forma_pagamento || data.payment_method || '',
    gross_total: data.subtotal ?? data.gross_total ?? 0,
    discount_percentage: data.percentual_desconto ?? data.discount_percentage ?? 0,
    discount_amount: data.valor_desconto ?? data.discount_amount ?? 0,
    taxa_entrega: data.taxa_entrega ?? 0,
    tipo_entrega: data.tipo_entrega || 'BALCAO',
    cpf_nota: data.cpf_nota,
    endereco_entrega_snapshot: data.endereco_entrega_snapshot,
    net_total: data.valor_total ?? data.net_total ?? 0,
    status: data.status || 'CONCLUIDO',
    notes: data.observacao || data.notes || '',
    items: (data.items || []).map((it: any) => ({
      id: it.id,
      product_id: it.product_id,
      quantity: it.quantidade ?? it.quantity ?? 0,
      unit_price: it.preco_unitario ?? it.unit_price ?? 0,
      total_price: it.subtotal ?? it.total_price ?? 0,
    })),
  };
}

export async function fetchSales(limit = 50): Promise<SaleResponse[]> {
  const res = await fetch(`${BASE_URL}/sales?limit=${limit}`);
  if (!res.ok) throw new Error('Falha ao carregar histórico de vendas');
  const data = await res.json();
  return (data || []).map((s: any) => ({
    id: s.id,
    order_number: s.numero_pedido || '',
    customer_id: s.customer_id,
    customer_nome: s.customer_nome,
    sale_date: s.data_hora || '',
    payment_method: s.forma_pagamento || '',
    gross_total: s.subtotal ?? 0,
    discount_percentage: s.percentual_desconto ?? 0,
    discount_amount: s.valor_desconto ?? 0,
    net_total: s.valor_total ?? 0,
    status: s.status || 'CONCLUIDO',
    items: (s.items || []).map((it: any) => ({
      id: it.id,
      product_id: it.product_id,
      quantity: it.quantidade ?? 0,
      unit_price: it.preco_unitario ?? 0,
      total_price: it.subtotal ?? 0,
      product: it.product_sku
        ? {
            id: it.product_id,
            sku: it.product_sku,
            name: it.product_nome || '',
            category: '',
            unit_cost: 0,
            unit_price: it.preco_unitario ?? 0,
            current_stock: 0,
            min_stock: 0,
            safety_stock: 0,
            lead_time_days: 2,
            is_active: true,
            status: 'ATIVO' as const,
          }
        : undefined,
    })),
  }));
}

export async function cancelSale(saleId: number): Promise<SaleResponse> {
  const res = await fetch(`${BASE_URL}/sales/${saleId}/cancel`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Falha ao estornar pedido de venda');
  }
  const data = await res.json();
  return {
    id: data.id,
    order_number: data.numero_pedido || '',
    customer_id: data.customer_id,
    customer_nome: data.customer_nome,
    sale_date: data.data_hora || '',
    payment_method: data.forma_pagamento || '',
    gross_total: data.subtotal ?? 0,
    discount_percentage: data.percentual_desconto ?? 0,
    discount_amount: data.valor_desconto ?? 0,
    net_total: data.valor_total ?? 0,
    status: data.status || 'CANCELADO',
    notes: data.observacao || '',
    items: (data.items || []).map((it: any) => ({
      id: it.id,
      product_id: it.product_id,
      quantity: it.quantidade ?? 0,
      unit_price: it.preco_unitario ?? 0,
      total_price: it.subtotal ?? 0,
      product: it.product_sku
        ? {
            id: it.product_id,
            sku: it.product_sku,
            name: it.product_nome || '',
            category: '',
            unit_cost: 0,
            unit_price: it.preco_unitario ?? 0,
            current_stock: 0,
            min_stock: 0,
            safety_stock: 0,
            lead_time_days: 2,
            is_active: true,
            status: 'ATIVO' as const,
          }
        : undefined,
    })),
  };
}

// ==========================================
// DASHBOARD & PREDIÇÕES (MODEL SERVING)
// ==========================================
export type DashboardPeriod = '30d' | 'mes' | 'trimestre' | 'semestre' | '1ano' | 'tudo';

export async function fetchDashboardKPIs(
  period: DashboardPeriod = '30d',
  includeCanceled = true
): Promise<DashboardKPIs> {
  const params = new URLSearchParams({
    period,
    include_canceled: String(includeCanceled),
  });
  const res = await fetch(`${BASE_URL}/dashboard/kpis?${params.toString()}`);
  if (!res.ok) throw new Error('Falha ao carregar KPIs do dashboard');
  const raw = await res.json();
  return {
    net_revenue: raw.faturamento_liquido ?? raw.net_revenue ?? 0,
    total_orders: raw.total_pedidos ?? raw.total_orders ?? 0,
    average_ticket: raw.ticket_medio ?? raw.average_ticket ?? 0,
    inventory_losses_total: raw.total_perdas_avarias ?? raw.inventory_losses_total ?? 0,
    critical_stock_count: raw.itens_em_risco_ruptura ?? raw.critical_stock_count ?? 0,
    daily_sales_trend: (raw.daily_sales_trend || []).map((d: any) => ({
      date: d.date,
      sales_count: d.sales_count ?? 0,
      total_revenue: d.total_revenue ?? 0,
    })),
  };
}

export async function fetchForecast(productId: number, horizonDays = 7): Promise<ForecastResponse> {
  const res = await fetch(`${BASE_URL}/ml/forecast?product_id=${productId}&horizon_days=${horizonDays}`);
  if (!res.ok) throw new Error('Falha ao obter previsão de demanda');
  const raw = await res.json();
  return {
    product_id: productId,
    sku: raw.sku,
    product_name: raw.product_nome || raw.product_name || '',
    horizon_days: horizonDays,
    daily_forecast: (raw.projecao_diaria || []).map((d: any, index: number) => ({
      day_offset: index + 1,
      forecasted_units: Math.round(d.demanda_prevista ?? d.forecasted_units ?? 0),
    })),
    total_forecasted_units: raw.total_previsto_horizonte ?? 0,
    model_used: 'RandomForestRegressor (regressor_random_forest.pkl)',
  };
}

export async function fetchReorderSuggestions(): Promise<ReorderSuggestionItem[]> {
  const res = await fetch(`${BASE_URL}/ml/reorder-suggestions`);
  if (!res.ok) throw new Error('Falha ao obter sugestões de reposição');
  const raw = await res.json();
  return (raw || []).map((s: any) => {
    let riskLevel: 'ALTO' | 'MEDIO' | 'BAIXO' = 'BAIXO';
    const rLower = (s.risco_ruptura || '').toLowerCase();
    if (rLower.includes('alto')) riskLevel = 'ALTO';
    else if (rLower.includes('médio') || rLower.includes('medio')) riskLevel = 'MEDIO';

    // Probabilidade calibrada diretamente da Regressão Logística (com fallback suave caso nulo)
    const prob = typeof s.probabilidade_ruptura_pct === 'number' && s.probabilidade_ruptura_pct > 0
      ? s.probabilidade_ruptura_pct
      : (riskLevel === 'ALTO' ? 76.0 : riskLevel === 'MEDIO' ? 53.0 : 14.0);

    return {
      product_id: s.product_id ?? 0,
      sku: s.sku,
      product_name: s.nome_produto || s.product_name || '',
      category: s.categoria || s.category || '',
      current_stock: s.estoque_atual ?? s.current_stock ?? 0,
      min_stock: s.estoque_minimo ?? s.min_stock ?? 0,
      safety_stock: Math.round((s.estoque_minimo ?? 10) * 1.5),
      forecasted_demand_7d: s.demanda_prevista_7d ?? s.forecasted_demand_7d ?? 0,
      recent_losses: 0,
      suggested_reorder_qty: s.quantidade_sugerida ?? s.suggested_reorder_qty ?? 0,
      stockout_risk_level: riskLevel,
      stockout_probability_pct: Math.round(prob),
      recommended_action: s.quantidade_sugerida > 0 ? 'Aprovar Compra' : 'Estoque Regular',
    };
  });
}

export async function fetchClusters(): Promise<ClusterSummary[]> {
  const res = await fetch(`${BASE_URL}/ml/clusters`);
  if (!res.ok) throw new Error('Falha ao carregar clusters DBSCAN');
  const rawList = await res.json();

  const clusterMap = new Map<number, ClusterSummary>();

  for (const item of (rawList || [])) {
    const cId = item.cluster ?? 0;
    if (!clusterMap.has(cId)) {
      clusterMap.set(cId, {
        cluster_id: cId,
        label: item.cluster_label || `Cluster ${cId}`,
        products_count: 0,
        products: [],
      });
    }
    const group = clusterMap.get(cId)!;
    group.products_count += 1;
    group.products.push({
      product_id: item.product_id ?? 0,
      sku: item.sku,
      product_name: item.product_name,
      mean_daily_sales: item.media_diaria ?? 0,
      sales_std: item.volatilidade_demanda ?? 0,
      profit_margin_pct: 0,
      cluster_label: item.cluster_label,
    });
  }

  return Array.from(clusterMap.values());
}

export async function fetchPurchases(): Promise<PurchaseOrder[]> {
  const res = await fetch(`${BASE_URL}/purchases`);
  if (!res.ok) throw new Error('Falha ao carregar pedidos de compra');
  const raw = await res.json();
  return (raw || []).map((o: any) => ({
    id: o.id,
    order_number: o.numero_pedido || o.order_number || '',
    product_id: o.product_id,
    quantity: o.quantidade ?? o.quantity ?? 0,
    unit_cost: 0,
    total_cost: 0,
    supplier_name: 'Distribuidora Central SP',
    status: o.status || 'PENDENTE',
    created_at: o.data_pedido || o.created_at || '',
    received_at: o.data_recebimento || o.received_at || undefined,
    product: o.product_sku
      ? {
          id: o.product_id,
          sku: o.product_sku,
          name: o.product_nome || '',
          category: '',
          unit_cost: 0,
          unit_price: 0,
          current_stock: 0,
          min_stock: 0,
          safety_stock: 0,
          lead_time_days: 2,
          is_active: true,
          status: 'ATIVO' as const,
        }
      : undefined,
  }));
}

export async function createPurchaseOrder(payload: {
  product_id: number;
  quantity: number;
  supplier_name?: string;
}): Promise<PurchaseOrder> {
  const res = await fetch(`${BASE_URL}/purchases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: payload.product_id,
      quantidade: payload.quantity,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Falha ao emitir pedido de compra');
  }
  const o = await res.json();
  return {
    id: o.id,
    order_number: o.numero_pedido || o.order_number || '',
    product_id: o.product_id,
    quantity: o.quantidade ?? o.quantity ?? 0,
    unit_cost: 0,
    total_cost: 0,
    supplier_name: payload.supplier_name || 'Distribuidora Central SP',
    status: o.status || 'PENDENTE',
    created_at: o.data_pedido || o.created_at || '',
    received_at: o.data_recebimento || o.received_at || undefined,
  };
}

export async function receivePurchaseOrder(orderId: number): Promise<PurchaseOrder> {
  const res = await fetch(`${BASE_URL}/purchases/${orderId}/receive`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Falha ao confirmar recebimento físico');
  }
  const o = await res.json();
  return {
    id: o.id,
    order_number: o.numero_pedido || o.order_number || '',
    product_id: o.product_id,
    quantity: o.quantidade ?? o.quantity ?? 0,
    unit_cost: 0,
    total_cost: 0,
    supplier_name: 'Distribuidora Central SP',
    status: o.status || 'RECEBIDO',
    created_at: o.data_pedido || o.created_at || '',
    received_at: o.data_recebimento || o.received_at || undefined,
  };
}

export async function recordInventoryLoss(payload: InventoryLossCreate): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/inventory/loss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: payload.product_id,
      quantidade: payload.quantity,
      motivo: payload.reason,
      observacao: payload.notes,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Falha ao registrar perda de estoque');
  }
  return { success: true, message: 'Perda de estoque registrada com sucesso' };
}
