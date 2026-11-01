export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit_cost: number;
  unit_price: number;
  current_stock: number;
  min_stock: number;
  safety_stock: number;
  lead_time_days: number;
  is_active: boolean;
  status: 'ATIVO' | 'CONGELADO';
  profit_margin_pct?: number;
}

export interface ProductCreatePayload {
  sku: string;
  name: string;
  category: string;
  unit_cost: number;
  unit_price: number;
  current_stock: number;
  min_stock: number;
  lead_time_days: number;
  status?: 'ATIVO' | 'CONGELADO';
}

export interface ProductUpdatePayload {
  name?: string;
  category?: string;
  unit_cost?: number;
  unit_price?: number;
  current_stock?: number;
  min_stock?: number;
  lead_time_days?: number;
  status?: 'ATIVO' | 'CONGELADO';
}

export interface CustomerAddress {
  id: number;
  customer_id: number;
  apelido: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
  is_default: boolean;
  criado_em?: string;
}

export interface CustomerAddressCreatePayload {
  apelido?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
  is_default?: boolean;
}

export interface Customer {
  id: number;
  nome: string;
  cpf_cnpj?: string;
  telefone: string;
  email?: string;
  ativo: boolean;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  referencia?: string;
  criado_em: string;
  total_pedidos: number;
  total_gasto_ltv: number;
  enderecos?: CustomerAddress[];
}

export interface CustomerCreatePayload {
  nome: string;
  cpf_cnpj?: string;
  telefone: string;
  email?: string;
  ativo?: boolean;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  referencia?: string;
  enderecos?: CustomerAddressCreatePayload[];
}

export interface SaleItemCreate {
  product_id: number;
  quantity: number;
}

export interface SaleCreate {
  payment_method: 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | string;
  customer_id?: number;
  discount_percentage?: number;
  discount_amount?: number;
  tipo_entrega?: 'BALCAO' | 'ENTREGA';
  taxa_entrega?: number;
  cpf_nota?: string;
  endereco_entrega_snapshot?: string;
  notes?: string;
  items: SaleItemCreate[];
}

export interface SaleItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface SaleResponse {
  id: number;
  order_number: string;
  customer_id?: number;
  customer_nome?: string;
  sale_date: string;
  payment_method: string;
  gross_total: number;
  discount_percentage: number;
  discount_amount: number;
  taxa_entrega?: number;
  tipo_entrega?: string;
  cpf_nota?: string;
  endereco_entrega_snapshot?: string;
  net_total: number;
  status?: string;
  notes?: string;
  items: SaleItemResponse[];
}

export interface DashboardKPIs {
  net_revenue: number;
  total_orders: number;
  average_ticket: number;
  inventory_losses_total: number;
  critical_stock_count: number;
  daily_sales_trend: {
    date: string;
    sales_count: number;
    total_revenue: number;
  }[];
}

export interface ForecastResponse {
  product_id: number;
  sku: string;
  product_name: string;
  horizon_days: number;
  daily_forecast: {
    day_offset: number;
    forecasted_units: number;
  }[];
  total_forecasted_units: number;
  model_used: string;
}

export interface ReorderSuggestionItem {
  product_id: number;
  sku: string;
  product_name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  safety_stock: number;
  forecasted_demand_7d: number;
  recent_losses: number;
  suggested_reorder_qty: number;
  stockout_risk_level: 'ALTO' | 'MEDIO' | 'BAIXO';
  stockout_probability_pct: number;
  recommended_action: string;
}

export interface ClusterSummary {
  cluster_id: number;
  label: string;
  products_count: number;
  products: {
    product_id: number;
    sku: string;
    product_name: string;
    mean_daily_sales: number;
    sales_std: number;
    profit_margin_pct: number;
    cluster_label: string;
  }[];
}

export interface PurchaseOrder {
  id: number;
  order_number: string;
  product_id: number;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  supplier_name: string;
  status: 'PENDENTE' | 'RECEBIDO' | 'CANCELADO';
  created_at: string;
  received_at?: string;
  product?: Product;
}

export interface InventoryLossCreate {
  product_id: number;
  quantity: number;
  reason: 'VENCIMENTO' | 'AVARIA' | 'FURTO' | 'OUTRO';
  notes?: string;
}
