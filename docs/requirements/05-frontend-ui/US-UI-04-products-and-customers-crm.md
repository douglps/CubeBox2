---
id: US-UI-04
title: Gestão de Produtos, Congelamento e CRM de Clientes
bounded_context: 05-frontend-ui
complexity: Alta
token_budget: 500
dependencies:
  sdd: docs/sdd/SDD-CBOX-UI-V2.0.0.md
  files:
    - backend/app/models.py
    - backend/app/schemas.py
    - backend/app/routers/operations.py
    - frontend/src/views/ProductsView.tsx
    - frontend/src/views/CustomersView.tsx
    - frontend/src/views/PosView.tsx
---

# US-UI-04: Gestão de Produtos, Congelamento e CRM de Clientes

## 1. 📖 Narrativa da User Story
**Como** gerente comercial e operador de frente de caixa,  
**Quero** um catálogo completo de produtos com cálculo dinâmico de margem de lucro, opção de congelamento preventivo de itens no balcão e um CRM de clientes integrado ao PDV,  
**Para que** eu possa cadastrar produtos com precificação lucrativa, evitar a venda de itens indisponíveis sem corromper vendas passadas e fidelizar clientes identificando suas compras pelo CPF.

## 2. 🧪 Critérios de Aceitação (BDD / Gherkin)

### Cenário 1: Cadastro e Edição de Produto com Cálculo de Margem
- **Dado** que estou na tela de Catálogo de Produtos (`ProductsView`),
- **Quando** clico em "Novo Produto" e informo Custo Unitário de `R$ 10,00` e Preço de Venda de `R$ 20,00`,
- **Então** o sistema deve exibir dinamicamente a margem de lucro calculada como `50,00%` e markup de `100,00%`,
- **E** ao salvar, o novo produto deve ser persistido no banco e listado na tabela com status `ATIVO`.

### Cenário 2: Congelamento e Descongelamento Preventivo de SKU
- **Dado** que um produto está com status `ATIVO` na lista de produtos,
- **Quando** aciono o botão "Congelar",
- **Então** o status do produto deve transicionar para `CONGELADO`,
- **E** se um operador tentar adicionar ou faturar este produto no PDV (`/api/sales`),
- **Então** a venda deve ser rejeitada com código `422` e mensagem explicativa de que o produto está congelado,
- **E** o histórico de vendas anteriores desse produto não deve ser corrompido.

### Cenário 3: Exclusão com Salvaguarda de Integridade Referencial
- **Dado** que seleciono a ação de excluir um produto,
- **Quando** o produto possui vendas ou compras associadas no histórico,
- **Então** a exclusão física deve ser bloqueada orientando o usuário a congelar o produto,
- **E** se o produto não tiver movimentações, a exclusão física é concluída com sucesso.

### Cenário 4: Cadastro e Busca de Clientes no CRM
- **Dado** que acesso a tela de Clientes & Fidelidade (`CustomersView`),
- **Quando** pesquiso por parte do Nome, CPF ou Telefone no campo de busca,
- **Então** a listagem deve filtrar instantaneamente os clientes cadastrados exibindo seu total de pedidos e Lifetime Value (LTV).

### Cenário 5: Associação de Cliente no PDV
- **Dado** que estou finalizando uma venda no PDV (`PosView`),
- **Quando** informo o CPF ou seleciono o cliente cadastrado,
- **Então** o pedido gerado deve salvar o vínculo do `customer_id` na transação,
- **E** atualizar o LTV e histórico de compras do cliente no CRM.

## 3. 📋 Definition of Done (DoD)
- Endpoints REST funcionais: `POST /api/products`, `PUT /api/products/{id}`, `PATCH /api/products/{id}/status`, `DELETE /api/products/{id}`.
- Endpoints REST de clientes: `GET /api/customers`, `POST /api/customers`, `PUT /api/customers/{id}`.
- Bloqueio estrito no PDV para produtos com status `CONGELADO`.
- Interfaces completas `ProductsView.tsx` e `CustomersView.tsx` com estilo consistente do Design System e acessibilidade WCAG 2.1 AA.
- Paginação determinística (10/25 por página com seletor), ordenação tri-state nos cabeçalhos e ações em lote (congelamento, descontos e exportação CSV).
- Cobertura de testes automatizados com pytest validando as novas rotas.
