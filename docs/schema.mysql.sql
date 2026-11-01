-- =============================================================================
-- CUBEBOX ENTERPRISE - DDL SCHEMA PARA MYSQL 8.0+ (ORACLE CLOUD VPS)
-- =============================================================================
-- Codificação: UTF-8 (utf8mb4)
-- Engine Padrão: InnoDB (ACID Compliant)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS cubebox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cubebox;

-- 1. TABELA DE PRODUTOS (CATÁLOGO & ESTOQUE)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    preco_unitario DOUBLE NOT NULL,
    custo_unitario DOUBLE NOT NULL,
    estoque_atual INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 10,
    lead_time_dias INT NOT NULL DEFAULT 2,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    CONSTRAINT uq_products_sku UNIQUE (sku),
    CONSTRAINT chk_products_estoque_minimo CHECK (estoque_minimo >= 0),
    CONSTRAINT chk_products_estoque_atual CHECK (estoque_atual >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_products_categoria ON products (categoria);
CREATE INDEX idx_products_status ON products (status);

-- 2. TABELA DE CLIENTES (CRM DE BALCÃO E ENTREGAS)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf_cnpj VARCHAR(20) NULL,
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(120) NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    cep VARCHAR(10) NULL,
    logradouro VARCHAR(150) NULL,
    numero VARCHAR(20) NULL,
    complemento VARCHAR(50) NULL,
    bairro VARCHAR(80) NULL,
    cidade VARCHAR(80) NULL,
    estado VARCHAR(2) NULL,
    referencia VARCHAR(150) NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customers_cpf_cnpj UNIQUE (cpf_cnpj)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_customers_nome ON customers (nome);
CREATE INDEX idx_customers_telefone ON customers (telefone);

-- 3. TABELA DE ENDEREÇOS NORMALIZADOS
CREATE TABLE IF NOT EXISTS customer_addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    apelido VARCHAR(60) NOT NULL DEFAULT 'Principal',
    cep VARCHAR(10) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(50) NULL,
    bairro VARCHAR(80) NOT NULL,
    cidade VARCHAR(80) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    referencia VARCHAR(150) NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_addresses_customer FOREIGN KEY (customer_id) 
        REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses (customer_id);

-- 4. TABELA DE VENDAS (PEDIDOS / CUPONS FISCAIS)
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(50) NOT NULL,
    customer_id INT NULL,
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forma_pagamento VARCHAR(50) NOT NULL,
    subtotal DOUBLE NOT NULL,
    percentual_desconto DOUBLE NOT NULL DEFAULT 0.0,
    valor_desconto DOUBLE NOT NULL DEFAULT 0.0,
    valor_total DOUBLE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONCLUIDO',
    tipo_entrega VARCHAR(20) NOT NULL DEFAULT 'BALCAO',
    taxa_entrega DOUBLE NOT NULL DEFAULT 0.0,
    cpf_nota VARCHAR(20) NULL,
    endereco_entrega_snapshot TEXT NULL,
    CONSTRAINT uq_sales_numero_pedido UNIQUE (numero_pedido),
    CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) 
        REFERENCES customers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sales_dashboard_metrics ON sales (status, data_hora, valor_total);
CREATE INDEX idx_sales_customer_id ON sales (customer_id);
CREATE INDEX idx_sales_data_hora ON sales (data_hora);

-- 5. TABELA DE ITENS DA VENDA
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DOUBLE NOT NULL,
    subtotal DOUBLE NOT NULL,
    CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id) 
        REFERENCES sales (id) ON DELETE CASCADE,
    CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) 
        REFERENCES products (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sale_items_sale_id ON sale_items (sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items (product_id);

-- 6. TABELA DE PEDIDOS DE COMPRA / RESSUPRIMENTO
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    quantidade INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    data_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_recebimento DATETIME NULL,
    CONSTRAINT uq_purchase_orders_numero_pedido UNIQUE (numero_pedido),
    CONSTRAINT fk_purchase_orders_product FOREIGN KEY (product_id) 
        REFERENCES products (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_purchase_orders_product_id ON purchase_orders (product_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders (status);

-- 7. TABELA DE PERDAS / AVARIAS DE ESTOQUE
CREATE TABLE IF NOT EXISTS inventory_losses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantidade INT NOT NULL,
    motivo VARCHAR(50) NOT NULL,
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT NULL,
    CONSTRAINT fk_inventory_losses_product FOREIGN KEY (product_id) 
        REFERENCES products (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_inventory_losses_product_id ON inventory_losses (product_id);
CREATE INDEX idx_inventory_losses_date ON inventory_losses (data_hora);

