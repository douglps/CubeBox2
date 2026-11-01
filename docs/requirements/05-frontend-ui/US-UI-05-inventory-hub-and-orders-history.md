---
id: US-UI-05
title: Hub de Estoque por Categoria, Histórico de Vendas com Cupom 80mm e Explicabilidade de IA
bounded_context: 05-frontend-ui
complexity: Alta
token_budget: 600
dependencies:
  sdd: docs/sdd/SDD-CBOX-UI-V2.0.0.md
  files:
    - backend/app/routers/operations.py
    - frontend/src/services/api.ts
    - frontend/src/views/InventoryView.tsx
    - frontend/src/views/OrdersHistoryView.tsx
    - frontend/src/views/PredictiveView.tsx
---

# US-UI-05: Hub de Estoque por Categoria, Histórico de Vendas e Explicabilidade de IA (XAI)

## 1. 📖 Narrativa da User Story
**Como** gestor operacional e operador de loja do CubeBox Enterprise,  
**Quero** navegar no estoque através de um Hub de Categorias com drilldown, consultar o histórico de vendas emitindo espelhos de cupom de 80mm com opção de cancelamento/estorno atômico, e entender claramente as previsões de demanda com explicabilidade de IA (XAI) e comparação multi-item,  
**Para que** eu tenha controle gerencial rápido do inventário, transparência total nas auditorias de vendas e confiança nas decisões automatizadas sugeridas pelos modelos preditivos.

## 2. 🧪 Critérios de Aceitação (BDD / Gherkin)

### Cenário 1: Navegação em Dois Níveis no Estoque (Hub de Categorias)
- **Dado** que acesso a aba de Estoque (`InventoryView`),
- **Quando** a visualização principal for carregada,
- **Então** devo visualizar um Grid com o Card Master "Todas as Categorias" e Cards individuais para cada Categoria do catálogo,
- **E** cada card deve exibir a quantidade de SKUs, valor investido em estoque (R$) e número de alertas de ruptura,
- **Quando** clico em um card de categoria específico ou no Card Master,
- **Então** o sistema realiza o drilldown para a visualização detalhada filtrando automaticamente os itens e exibindo a barra de retorno ("← Voltar para Categorias").

### Cenário 2: Consulta e Espelho de Impressão de Cupom 80mm
- **Dado** que acesso o Histórico de Vendas (`OrdersHistoryView`),
- **Quando** seleciono um pedido de venda na listagem,
- **Então** devo poder visualizar o modal com o espelho do cupom gerencial de 80mm contendo cabeçalho comercial, itens, valores unitários, descontos aplicados, forma de pagamento e identificação do cliente,
- **E** ao acionar "Imprimir Cupom", o sistema deve invocar a impressão do navegador otimizada para impressoras térmicas de 80mm.

### Cenário 3: Cancelamento e Estorno Atômico de Venda
- **Dado** que um pedido possui status `CONCLUIDO` no histórico de vendas,
- **Quando** o operador solicita o cancelamento da venda (`POST /api/sales/{id}/cancel`),
- **Então** o backend deve alterar o status da venda para `CANCELADO`,
- **E** estornar atomicamente todas as quantidades de produtos de volta aos estoques físicos correspondentes,
- **E** a tabela de pedidos deve refletir o novo status imediatamente.

### Cenário 4: Explicabilidade de Inteligência Artificial (XAI)
- **Dado** que estou no Cockpit Preditivo (`PredictiveView`),
- **Quando** observo as projeções de demanda e ressuprimento,
- **Então** o sistema deve exibir selos e badges de IA que ao passar o mouse ou focar exibem tooltips explicativos detalhando o modelo em uso (*Random Forest*, *Gaussian Naive Bayes*, *DBSCAN*), métricas de acurácia e variáveis consideradas,
- **E** disponibilizar um botão para abrir o Modal Comparador Multi-Item (permitindo comparar projeções diárias de até 5 SKUs simultâneos).

## 3. 📋 Definition of Done (DoD)
- Endpoint `POST /api/sales/{id}/cancel` implementado com estorno atômico de estoque e testes de integridade.
- Cliente frontend atualizado em `api.ts` com suporte à função `cancelSale()`.
- Tela `OrdersHistoryView.tsx` completa com busca, filtros, modal de cupom 80mm térmico, ação de estorno, ordenação tri-state, paginação e exportação CSV em lote.
- Tela `InventoryView.tsx` reestruturada com Hub de Categorias em dois níveis, drilldown com ordenação por valor/saldo, paginação e relatório CSV em lote.
- Tela `PredictiveView.tsx` enriquecida com badges de explicabilidade (XAI), consolidação geral, modal comparador multi-item, tabelas com ordenação e paginação.
