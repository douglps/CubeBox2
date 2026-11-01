# 📐 SDD-CBOX-API-V1.0.0: Subsistema de Backend FastAPI e Model Serving

> **Projeto:** CubeBox Mini - Sistema Preditivo Integrado de Compras e Vendas  
> **Módulo:** Backend REST API, Model Serving e Persistência Operacional (Fase 4)  
> **Versão:** 1.0.0  
> **Status:** Aprovado  
> **Padrão:** IEEE 1016 (Software Design Document)  
> **Data:** 2026-10-27  

---

## 1. 🎯 Identificação & Visão Geral (Overview)

### 1.1 Propósito
Definir a arquitetura técnica, contratos de API, persistência relacional de dados (MySQL em VPS Oracle Cloud para Produção / SQLite para Desenvolvimento Local via SQLAlchemy) e estratégia de inferência para o backend em FastAPI do CubeBox Enterprise.

O subsistema atende a duas vertentes fundamentais:
1. **Operacional (Core Retail):** Gestão de catálogo de produtos, controle de estoque físico e registro de vendas de balcão (PDV).
2. **Inteligência Preditiva (Model Serving):** Carregamento em memória (`Lifespan`) dos modelos serializados (`.pkl`) gerados na Fase 3 para fornecer previsões de demanda, agrupamento por DBSCAN, classificação de risco por Naive Bayes e cálculo automatizado de ordens de reposição.

### 1.2 Relação com o Negócio & Léxico
Consome as definições de [01-business-understanding.md](file:///c:/Dev/CubeBox2/docs/01-business-understanding.md) e a linguagem ubíqua estabelecida em [LEXICON.md](file:///c:/Dev/CubeBox2/LEXICON.md):
- **Estoque Mínimo / Estoque de Segurança ($ES$):** Limite de tolerância operacional.
- **Ruptura de Estoque (Stockout):** Situação de demanda reprimida por indisponibilidade física.
- **Sugestão de Compra:** Quantidade calculada para manter a continuidade das vendas.

---

## 2. 🏛️ Princípios de Heurística & Arquitetura

- **Arquitetura 12-Factor & Persistência Híbrida (MySQL / SQLite):** Configuração externa via `.env` gerenciada por `backend/app/config.py`. Em produção (VPS Oracle Cloud), utiliza **MySQL 8.0+** com pool de conexões gerenciado (`pool_pre_ping=True`, `pool_recycle=3600`), garantindo suporte a múltiplos caixas e concorrência sem bloqueio de escrita. Em desenvolvimento local, mantém fallback para SQLite (`data/cubebox.db`).
- **Clean Architecture & Separação por Domínio:** 
  - `backend/app/models/`: Entidades relacionais do SQLAlchemy.
  - `backend/app/schemas/`: Contratos de entrada e saída validados com Pydantic v2.
  - `backend/app/routers/`: Controladores REST desacoplados (`products.py`, `sales.py`, `dashboard.py`, `ml.py`).
  - `backend/app/services/`: Lógica de negócio e orquestração de inferência de ML.
- **Lifecycle Optimization (Model Caching):** Modelos `.pkl` são instanciados uma única vez no evento de inicialização da aplicação (`asynccontextmanager` / Lifespan), evitando overhead de I/O em cada requisição.
- **Result Pattern & HTTP Restful:** Respostas com status code semântico (200, 201, 400, 404, 422) e payloads tipados.

---

## 3. 🗄️ Modelagem Relacional de Dados (MySQL / SQLite via SQLAlchemy)

```
┌─────────────────────────┐         ┌─────────────────────────┐
│         Product         │1       *│          Sale           │
├─────────────────────────┼─────────┼─────────────────────────┤
│ id: int [PK]            │         │ id: int [PK]            │
│ sku: str [Unique]       │         │ numero_pedido: str      │
│ nome: str               │         │ data_hora: datetime     │
│ categoria: str          │         │ forma_pagamento: str    │
│ preco_unitario: float   │         │ subtotal: float         │
│ custo_unitario: float   │         │ percentual_desconto: flt│
│ estoque_atual: int      │         │ valor_desconto: float   │
│ estoque_minimo: int     │         │ valor_total: float      │
│ lead_time_dias: int     │         └───────────┬─────────────┘
└───────────┬─────────────┘                     │ 1
            │ 1                                 │
            │                                   │ *
            │                       ┌───────────┴─────────────┐
            │                       │        SaleItem         │
            │                       ├─────────────────────────┤
            │                      *│ id: int [PK]            │
            ├───────────────────────┤ sale_id: int [FK]       │
            │                       │ product_id: int [FK]    │
            │                       │ quantidade: int         │
            │                       │ preco_unitario: float   │
            │                       │ subtotal: float         │
            │                       └─────────────────────────┘
            │ 1
            │
            │ *                     ┌─────────────────────────┐
            ├───────────────────────┤      PurchaseOrder      │
            │                       ├─────────────────────────┤
            │                       │ id: int [PK]            │
            │                       │ numero_pedido: str      │
            │                       │ product_id: int [FK]    │
            │                       │ quantidade: int         │
            │                       │ status: str             │ # PENDENTE, RECEBIDO, CANCELADO
            │                       │ data_pedido: datetime   │
            │                       │ data_recebimento: dt    │
            │                       └─────────────────────────┘
            │ 1
            │
            │ *                     ┌─────────────────────────┐
            └───────────────────────┤     InventoryLoss       │ (Quebras/Avarias)
                                    ├─────────────────────────┤
                                    │ id: int [PK]            │
                                    │ product_id: int [FK]    │
                                    │ quantidade: int         │
                                    │ motivo: str             │ # VENCIMENTO, AVARIA, FURTO, OUTRO
                                    │ data_hora: datetime     │
                                    │ observacao: str         │
                                    └─────────────────────────┘
```

---

## 4. 🔌 Especificação dos Contratos de API (Endpoints)

### 4.1 Módulo Operacional (Vendas, Caixa & Estoque)
- `GET /api/products`: Lista produtos cadastrados e respectivos níveis de estoque.
- `GET /api/products/{id}`: Detalhes de um produto específico.
- `POST /api/sales`: Registra uma nova venda/pedido de saída no PDV:
  - **Bloqueio de Estoque Negativo:** Valida se `estoque_atual >= quantidade`. Caso insuficiente, rejeita a transação com `HTTP 422 Unprocessable Entity` e mensagem detalhada do SKU indisponível.
  - **Desconto Bidirecional:** Aceita `percentual_desconto` ou `valor_desconto`. O backend recalcula e valida a equivalência matemática garantindo integridade contábil.
  - Executa baixa atômica no estoque físico dentro da mesma transação de banco.
- `GET /api/sales`: Histórico paginado de saídas / pedidos de balcão para auditoria de caixa.
- `POST /api/inventory/loss`: Registra quebra/avaria/perda física:
  - Valida se `estoque_atual >= quantidade`.
  - Abate o saldo físico de estoque sem contabilizar receita no caixa.
  - Marca a ocorrência como perda operacional para análise de margem e ajuste nos modelos de demanda.
- `GET /api/dashboard/kpis`: Retorna faturamento líquido acumulado, total de pedidos, ticket médio, quantidade de produtos em situação crítica e perdas por quebra.

### 4.2 Módulo de Compras & Reabastecimento (Supply Chain)
- `GET /api/purchases`: Lista ordens de compra emitidas e status de entrega.
- `POST /api/purchases`: Cria um pedido de compra a partir de aprovação da sugestão de reposição da IA.
- `PATCH /api/purchases/{id}/receive`: Confirma o recebimento físico da mercadoria:
  - Altera status para `RECEBIDO`.
  - Incrementa atomicamente o `estoque_atual` do respectivo SKU.

### 4.3 Módulo de Inteligência Preditiva (Model Serving)
- `GET /api/ml/forecast?sku={sku}&dias=7`:
  - Utiliza o regressor campeão (`regressor_random_forest.pkl`).
  - Projeta as vendas diárias para o horizonte solicitado com base nas últimas observações e features de calendário.
- `GET /api/ml/reorder-suggestions`:
  - Avalia o catálogo contra a demanda prevista:
    $$\text{Qtd Compra} = \max(0, \text{Demanda Prevista} + \text{Estoque Segurança} + \text{Taxa Histórica de Quebra} - \text{Estoque Atual})$$
  - Inclui a probabilidade de ruptura prevista pelo modelo Naive Bayes.
- `GET /api/ml/clusters`:
  - Retorna o agrupamento atual de todos os SKUs via `cluster_dbscan.pkl` (Alto Giro, Giro Médio, Baixo Giro, Ruído/Outlier).

---

## 5. 🛡️ Tratamento de Erros e Resiliência
- **Erro de Saldo (Estoque Insuficiente):** Retorno `422 Unprocessable Entity` com payload `{"detail": "Estoque insuficiente para o produto SKU: ... Saldo disponível: X, Solicitado: Y"}`.
- **Degradação Graciosa de ML:** Se algum arquivo `.pkl` não estiver disponível no diretório `models/`, o módulo preditivo retorna código `503 Service Unavailable` com mensagem amigável e instrutiva, sem interromper as operações do PDV e cadastro de produtos.
