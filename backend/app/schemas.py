"""
Schemas Pydantic v2 para Validacao de Contratos de Entrada e Saida.
Atende a US-API-01, US-API-02, US-UI-04 e SDD-CBOX-UI-V2.0.0.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator, ConfigDict


# ==========================================
# PRODUTOS (CATÁLOGO & ESTOQUE)
# ==========================================
class ProductBase(BaseModel):
    sku: str = Field(..., max_length=50)
    nome: str = Field(..., max_length=150)
    categoria: str = Field(..., max_length=100)
    preco_unitario: float = Field(..., gt=0.0)
    custo_unitario: float = Field(..., gt=0.0)
    estoque_atual: int = Field(default=0, ge=0)
    estoque_minimo: int = Field(default=10, ge=0)
    lead_time_dias: int = Field(default=2, gt=0)
    status: Optional[str] = Field(default="ATIVO", description="ATIVO ou CONGELADO")


class ProductCreate(BaseModel):
    sku: str = Field(..., max_length=50)
    nome: str = Field(..., max_length=150)
    categoria: str = Field(..., max_length=100)
    preco_unitario: float = Field(..., gt=0.0)
    custo_unitario: float = Field(..., gt=0.0)
    estoque_atual: int = Field(default=0, ge=0)
    estoque_minimo: int = Field(default=10, ge=0)
    lead_time_dias: int = Field(default=2, gt=0)
    status: Optional[str] = Field(default="ATIVO")


class ProductUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, max_length=150)
    categoria: Optional[str] = Field(default=None, max_length=100)
    preco_unitario: Optional[float] = Field(default=None, gt=0.0)
    custo_unitario: Optional[float] = Field(default=None, gt=0.0)
    estoque_atual: Optional[int] = Field(default=None, ge=0)
    estoque_minimo: Optional[int] = Field(default=None, ge=0)
    lead_time_dias: Optional[int] = Field(default=None, gt=0)
    status: Optional[str] = None


class ProductStatusUpdate(BaseModel):
    status: str = Field(..., description="ATIVO ou CONGELADO")

    @model_validator(mode="after")
    def validate_status(self):
        upper_status = self.status.upper()
        if upper_status not in ["ATIVO", "CONGELADO"]:
            raise ValueError("O status deve ser estritamente 'ATIVO' ou 'CONGELADO'.")
        self.status = upper_status
        return self


class ProductResponse(ProductBase):
    id: int
    status: str
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# CLIENTES & CRM DE BALCÃO
# ==========================================
class CustomerAddressBase(BaseModel):
    apelido: Optional[str] = Field(default="Principal", max_length=60)
    cep: str = Field(..., max_length=10)
    logradouro: str = Field(..., min_length=1, max_length=150)
    numero: str = Field(..., min_length=1, max_length=20)
    complemento: Optional[str] = Field(default=None, max_length=50)
    bairro: str = Field(..., min_length=1, max_length=80)
    cidade: str = Field(..., min_length=1, max_length=80)
    estado: str = Field(..., min_length=2, max_length=2)
    referencia: Optional[str] = Field(default=None, max_length=150)
    is_default: Optional[bool] = Field(default=False)


class CustomerAddressCreate(CustomerAddressBase):
    pass


class CustomerAddressResponse(CustomerAddressBase):
    id: int
    customer_id: int
    is_default: bool
    criado_em: datetime
    model_config = ConfigDict(from_attributes=True)


class CustomerBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=150)
    cpf_cnpj: Optional[str] = Field(default=None, max_length=20)
    telefone: Optional[str] = Field(default=None, max_length=30)
    email: Optional[str] = Field(default=None, max_length=120)
    ativo: Optional[bool] = Field(default=True)
    
    # Endereço opcional no cadastro do cliente (se fornecido, vira o 1º endereço default)
    cep: Optional[str] = Field(default=None, max_length=10)
    logradouro: Optional[str] = Field(default=None, max_length=150)
    numero: Optional[str] = Field(default=None, max_length=20)
    complemento: Optional[str] = Field(default=None, max_length=50)
    bairro: Optional[str] = Field(default=None, max_length=80)
    cidade: Optional[str] = Field(default=None, max_length=80)
    estado: Optional[str] = Field(default=None, max_length=2)
    referencia: Optional[str] = Field(default=None, max_length=150)


class CustomerCreate(CustomerBase):
    enderecos: Optional[List[CustomerAddressBase]] = None


class CustomerUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=2, max_length=150)
    cpf_cnpj: Optional[str] = Field(default=None, max_length=20)
    telefone: Optional[str] = Field(default=None, min_length=10, max_length=30)
    email: Optional[str] = Field(default=None, max_length=120)
    ativo: Optional[bool] = None
    cep: Optional[str] = Field(default=None, max_length=10)
    logradouro: Optional[str] = Field(default=None, max_length=150)
    numero: Optional[str] = Field(default=None, max_length=20)
    complemento: Optional[str] = Field(default=None, max_length=50)
    bairro: Optional[str] = Field(default=None, max_length=80)
    cidade: Optional[str] = Field(default=None, max_length=80)
    estado: Optional[str] = Field(default=None, max_length=2)
    referencia: Optional[str] = Field(default=None, max_length=150)


class CustomerResponse(CustomerBase):
    id: int
    criado_em: datetime
    total_pedidos: int = 0
    total_gasto_ltv: float = 0.0
    enderecos: List[CustomerAddressResponse] = []
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# ITENS E PEDIDOS DE VENDA (PDV DE BALCÃO)
# ==========================================
class SaleItemCreate(BaseModel):
    product_id: int = Field(..., description="ID do produto no banco")
    quantidade: int = Field(..., gt=0, description="Quantidade de itens vendida")
    preco_unitario: Optional[float] = Field(default=None, description="Preço unitário aplicado (se omitido, usa catálogo)")


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantidade: int
    preco_unitario: float
    subtotal: float
    product_sku: Optional[str] = None
    product_nome: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class SaleCreate(BaseModel):
    forma_pagamento: str = Field(..., description="PIX, Cartão Débito, Cartão Crédito, Dinheiro")
    customer_id: Optional[int] = Field(default=None, description="ID do cliente para fidelização/CRM")
    percentual_desconto: float = Field(default=0.0, ge=0.0, le=100.0)
    valor_desconto: float = Field(default=0.0, ge=0.0)
    itens: List[SaleItemCreate] = Field(..., min_length=1, description="Lista de produtos do pedido")

    # Entrega & Emissão com CPF (Fase 8.0)
    tipo_entrega: Optional[str] = Field(default="BALCAO", description="BALCAO ou ENTREGA")
    taxa_entrega: Optional[float] = Field(default=0.0, ge=0.0)
    cpf_nota: Optional[str] = Field(default=None, max_length=20)
    endereco_entrega_snapshot: Optional[str] = None

    @model_validator(mode="after")
    def validate_discount_and_items(self):
        if not self.itens:
            raise ValueError("O pedido deve conter pelo menos um item.")
        if self.tipo_entrega:
            self.tipo_entrega = self.tipo_entrega.upper()
            if self.tipo_entrega not in ["BALCAO", "ENTREGA"]:
                raise ValueError("O tipo de entrega deve ser 'BALCAO' ou 'ENTREGA'.")
            if self.tipo_entrega == "ENTREGA" and not (self.endereco_entrega_snapshot and self.endereco_entrega_snapshot.strip()):
                raise ValueError("Para pedidos na modalidade ENTREGA, é obrigatório informar o endereço de entrega.")
        return self


class SaleResponse(BaseModel):
    id: int
    numero_pedido: str
    customer_id: Optional[int] = None
    customer_nome: Optional[str] = None
    data_hora: datetime
    forma_pagamento: str
    subtotal: float
    percentual_desconto: float
    valor_desconto: float
    taxa_entrega: float = 0.0
    tipo_entrega: str = "BALCAO"
    cpf_nota: Optional[str] = None
    endereco_entrega_snapshot: Optional[str] = None
    valor_total: float
    status: str = "CONCLUIDO"
    items: List[SaleItemResponse]
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# QUEBRAS E AVARIAS DE ESTOQUE
# ==========================================
class InventoryLossCreate(BaseModel):
    product_id: int = Field(..., description="ID do produto avariado")
    quantidade: int = Field(..., gt=0, description="Quantidade perdida/quebrada")
    motivo: str = Field(..., description="VENCIMENTO, AVARIA, FURTO, OUTRO")
    observacao: Optional[str] = None


class InventoryLossResponse(BaseModel):
    id: int
    product_id: int
    quantidade: int
    motivo: str
    data_hora: datetime
    observacao: Optional[str]
    product_sku: Optional[str] = None
    product_nome: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# ORDENS DE COMPRA (SUPPLY CHAIN)
# ==========================================
class PurchaseOrderCreate(BaseModel):
    product_id: int
    quantidade: int = Field(..., gt=0)


class PurchaseOrderResponse(BaseModel):
    id: int
    numero_pedido: str
    product_id: int
    quantidade: int
    status: str
    data_pedido: datetime
    data_recebimento: Optional[datetime]
    product_sku: Optional[str] = None
    product_nome: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# KPIS DO DASHBOARD EXECUTIVO
# ==========================================
class DailySalesTrendItem(BaseModel):
    date: str
    sales_count: int
    total_revenue: float


class DashboardKPIs(BaseModel):
    faturamento_liquido: float
    total_pedidos: int
    ticket_medio: float
    total_perdas_avarias: float
    itens_em_risco_ruptura: int
    total_itens_estoque: int
    daily_sales_trend: List[DailySalesTrendItem] = Field(default_factory=list)


# ==========================================
# MODEL SERVING & SUGESTÕES PREDITIVAS
# ==========================================
class ForecastDay(BaseModel):
    data: str
    dia_semana: str
    demanda_prevista: float


class ForecastResponse(BaseModel):
    sku: str
    product_nome: str
    total_previsto_horizonte: float
    projecao_diaria: List[ForecastDay]


class ForecastBatchRequest(BaseModel):
    product_ids: Optional[List[int]] = Field(default=None, description="Lista de IDs de produtos")
    skus: Optional[List[str]] = Field(default=None, description="Lista de SKUs")
    horizon_days: int = Field(default=7, ge=1, le=30, description="Horizonte de projeção em dias")


class ForecastBatchResponse(BaseModel):
    forecasts: List[ForecastResponse]
    horizon_days: int


class ReorderSuggestionResponse(BaseModel):
    product_id: Optional[int] = None
    sku: str
    nome_produto: str
    categoria: str
    estoque_atual: int
    estoque_minimo: int
    demanda_prevista_7d: float
    taxa_quebra_hist: float
    quantidade_sugerida: int
    risco_ruptura: str  # 'Alto Risco', 'Médio Risco', 'Baixo Risco'
    probabilidade_ruptura_pct: Optional[float] = 0.0
    cluster_giro: str   # 'Giro Estável / Consistente', etc.


class ClusterProductInfo(BaseModel):
    sku: str
    product_name: str
    category: str
    media_diaria: float
    volatilidade_demanda: float
    cluster: int
    cluster_label: str
