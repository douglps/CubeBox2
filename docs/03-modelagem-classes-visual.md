# 🗺️ GUIA VISUAL DE CLASSES & ARQUITETURA DE DADOS

> **Projeto:** CubeBox Mini  
> **Status:** Ativo  
> **Referência Técnica:** [`SDD-CBOX-CLASS-MODEL-V1.0.0.md`](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-CLASS-MODEL-V1.0.0.md)  
> **Código de Origem:** [`backend/app/models.py`](file:///c:/Dev/CubeBox2/backend/app/models.py) | [`backend/app/schemas.py`](file:///c:/Dev/CubeBox2/backend/app/schemas.py)

---

## 🧭 Visão Panorâmica do Domínio (Mapa Visual ASCII)

```
                       [ 👤 Customer ] (CRM)
                              │
            ┌─────────────────┴─────────────────┐
            │ 1:N (Composição)                   │ 0..1:N (Associação)
            ▼                                   ▼
  [ 📍 CustomerAddress ]                  [ 🧾 Sale ] (Cupom Fiscal)
  - Endereços de Entrega                  - Total, Desconto, Snapshot
                                                │
                                                │ 1:N (Composição)
                                                ▼
                                          [ 📦 SaleItem ]
                                                │
       ┌────────────────────────────────────────┤
       │ N:1 (Referência SKU)                   │
       ▼                                        ▼
 [ 🏷️ Product ] (Catálogo/Estoque) <───── (Preço Unitário Congelado)
       │
       ├─────────────────────────────────┐
       │ 1:N (Ressuprimento)             │ 1:N (Avarias)
       ▼                                 ▼
 [ 🚚 PurchaseOrder ]             [ ⚠️ InventoryLoss ]
 - Ordens de Compra               - Quebras, Vencimentos, Perdas
```

---

## 📊 Diagrama UML Detalhado com Tipagem e Cardinalidades

```mermaid
classDiagram
    direction TB

    class Customer {
        <<Entity / CRM>>
        +int id [PK]
        +string nome
        +string cpf_cnpj [Unique]
        +string telefone [Obrigatório]
        +string email
        +bool ativo [Default True]
        +datetime criado_em
        +get_default_address()
    }

    class CustomerAddress {
        <<Sub-Entity / Delivery>>
        +int id [PK]
        +int customer_id [FK]
        +string apelido
        +string cep
        +string logradouro
        +string numero
        +string bairro
        +string cidade
        +string estado
        +bool is_default
    }

    class Product {
        <<Core Entity / Catálogo>>
        +int id [PK]
        +string sku [Unique]
        +string nome
        +string categoria
        +float preco_unitario
        +float custo_unitario
        +int estoque_atual
        +int estoque_minimo
        +int lead_time_dias
        +string status [ATIVO/CONGELADO]
        +is_reorder_needed()
    }

    class Sale {
        <<Aggregate Root / PDV>>
        +int id [PK]
        +string numero_pedido [Unique]
        +int customer_id [FK, Nullable]
        +datetime data_hora
        +string forma_pagamento
        +float subtotal
        +float percentual_desconto
        +float valor_total
        +string tipo_entrega [BALCAO/ENTREGA]
        +string endereco_entrega_snapshot
        +calculate_totals()
    }

    class SaleItem {
        <<Item / Value Object>>
        +int id [PK]
        +int sale_id [FK]
        +int product_id [FK]
        +int quantidade
        +float preco_unitario [Congelado]
        +float subtotal
    }

    class PurchaseOrder {
        <<Operation / Compras>>
        +int id [PK]
        +string numero_pedido [Unique]
        +int product_id [FK]
        +int quantidade
        +string status [PENDENTE/RECEBIDO]
        +datetime data_pedido
        +datetime data_recebimento
    }

    class InventoryLoss {
        <<Audit / Perdas>>
        +int id [PK]
        +int product_id [FK]
        +int quantidade
        +string motivo [AVARIA/VENCIMENTO]
        +datetime data_hora
    }

    %% Conexões com multiplicidade
    Customer "1" *-- "0..*" CustomerAddress : múltiplos endereços
    Customer "0..1" <-- "0..*" Sale : cliente associado
    Sale "1" *-- "1..*" SaleItem : itens do cupom
    Product "1" <-- "0..*" SaleItem : produto vendido
    Product "1" <-- "0..*" PurchaseOrder : ordens de compra
    Product "1" <-- "0..*" InventoryLoss : registro de perdas
```

---

## 🎨 Tabela Visual de Cores e Responsabilidades de Domínio

| Domínio | Entidades | Cor Conceitual | Função Prática no Negócio |
| :--- | :--- | :--- | :--- |
| **CRM / Clientes** | `Customer`, `CustomerAddress` | 🟣 Roxo / Índigo | Gestão da carteira de compradores, histórico de contato e múltiplos pontos de entrega. |
| **PDV / Vendas** | `Sale`, `SaleItem` | 🔵 Azul / Ciano | Caixa registrador, emissão de cupons, descontos e rastreabilidade fiscal imutável. |
| **Estoque Central** | `Product` | 🟢 Esmeralda / Verde | Catálogo com saldo em gôndola, preços, margem e ponto de ressuprimento. |
| **Suprimentos / IA** | `PurchaseOrder` | 🟡 Âmbar / Dourado | Pedidos de compra sugeridos pela IA (Machine Learning) para evitar ruptura. |
| **Auditoria / Avarias** | `InventoryLoss` | 🔴 Rosa / Vermelho | Controle de perdas líquidas por garrafas quebradas, validade ou extravios. |

