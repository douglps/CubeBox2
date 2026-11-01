"""
=============================================================================
MAPA DAS TABELAS DO BANCO DE DADOS (MODELOS RELACIONAIS ORM)
=============================================================================
Projeto: CubeBox Mini
Função no Negócio:
    Este arquivo é o "esqueleto" ou a "planta baixa" de todos os dados da loja.
    Ele define a estrutura das prateleiras virtuais (produtos), do caderno de
    clientes (CRM), dos comprovantes de venda (pedidos) e dos registros de perdas (avarias).

Por que ele existe e o que resolve:
    Garante que nenhum dado seja salvo de forma bagunçada ou incompleta no banco
    de dados. Por exemplo, impede que uma venda seja registrada sem itens ou que
    um cliente exista sem um número de contato válido.

Como funciona a organização:
    1. [Product]: Catálogo com código SKU, saldo na prateleira, preço e status (ATIVO/CONGELADO).
    2. [Customer & CustomerAddress]: Ficha do cliente e múltiplos endereços para entregas/delivery.
    3. [Sale & SaleItem]: Cupom fiscal digital com itens, descontos e formas de pagamento.
    4. [PurchaseOrder]: Pedidos de ressuprimento feitos aos fornecedores.
    5. [InventoryLoss]: Livro de registro de garrafas quebradas, vencimentos ou avarias.
=============================================================================
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    cpf_cnpj = Column(String(20), unique=True, index=True, nullable=True)
    telefone = Column(String(30), nullable=False)
    email = Column(String(120), nullable=True)
    ativo = Column(Boolean, default=True, nullable=False)
    
    # Campos legados de endereço mantidos para compatibilidade retroativa
    cep = Column(String(10), nullable=True)
    logradouro = Column(String(150), nullable=True)
    numero = Column(String(20), nullable=True)
    complemento = Column(String(50), nullable=True)
    bairro = Column(String(80), nullable=True)
    cidade = Column(String(80), nullable=True)
    estado = Column(String(2), nullable=True)
    referencia = Column(String(150), nullable=True)

    criado_em = Column(DateTime, default=datetime.now, nullable=False)

    sales = relationship("Sale", back_populates="customer")
    addresses = relationship("CustomerAddress", back_populates="customer", cascade="all, delete-orphan", order_by="desc(CustomerAddress.is_default)")


class CustomerAddress(Base):
    __tablename__ = "customer_addresses"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    apelido = Column(String(60), default="Principal", nullable=False)
    cep = Column(String(10), nullable=False)
    logradouro = Column(String(150), nullable=False)
    numero = Column(String(20), nullable=False)
    complemento = Column(String(50), nullable=True)
    bairro = Column(String(80), nullable=False)
    cidade = Column(String(80), nullable=False)
    estado = Column(String(2), nullable=False)
    referencia = Column(String(150), nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    criado_em = Column(DateTime, default=datetime.now, nullable=False)

    customer = relationship("Customer", back_populates="addresses")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    nome = Column(String(150), nullable=False)
    categoria = Column(String(100), nullable=False)
    preco_unitario = Column(Float, nullable=False)
    custo_unitario = Column(Float, nullable=False)
    estoque_atual = Column(Integer, default=0, nullable=False)
    estoque_minimo = Column(Integer, default=10, nullable=False)
    lead_time_dias = Column(Integer, default=2, nullable=False)
    status = Column(String(20), default="ATIVO", nullable=False)  # ATIVO ou CONGELADO

    # Relacionamentos
    sale_items = relationship("SaleItem", back_populates="product")
    purchases = relationship("PurchaseOrder", back_populates="product")
    losses = relationship("InventoryLoss", back_populates="product")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    numero_pedido = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    data_hora = Column(DateTime, default=datetime.now, nullable=False)
    forma_pagamento = Column(String(50), nullable=False)
    subtotal = Column(Float, nullable=False)
    percentual_desconto = Column(Float, default=0.0, nullable=False)
    valor_desconto = Column(Float, default=0.0, nullable=False)
    valor_total = Column(Float, nullable=False)
    status = Column(String(20), default="CONCLUIDO", nullable=False)  # CONCLUIDO ou CANCELADO

    # Suporte a Entrega e Documento Fiscal (Fase 8.0)
    tipo_entrega = Column(String(20), default="BALCAO", nullable=False)  # BALCAO ou ENTREGA
    taxa_entrega = Column(Float, default=0.0, nullable=False)
    cpf_nota = Column(String(20), nullable=True)
    endereco_entrega_snapshot = Column(Text, nullable=True)

    customer = relationship("Customer", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantidade = Column(Integer, nullable=False)
    preco_unitario = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    numero_pedido = Column(String(50), unique=True, index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantidade = Column(Integer, nullable=False)
    status = Column(String(30), default="PENDENTE", nullable=False)  # PENDENTE, RECEBIDO, CANCELADO
    data_pedido = Column(DateTime, default=datetime.now, nullable=False)
    data_recebimento = Column(DateTime, nullable=True)

    product = relationship("Product", back_populates="purchases")


class InventoryLoss(Base):
    __tablename__ = "inventory_losses"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantidade = Column(Integer, nullable=False)
    motivo = Column(String(50), nullable=False)  # VENCIMENTO, AVARIA, FURTO, OUTRO
    data_hora = Column(DateTime, default=datetime.now, nullable=False)
    observacao = Column(Text, nullable=True)

    product = relationship("Product", back_populates="losses")
