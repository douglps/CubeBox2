# 🖥️ GUIA EXECUTIVO DAS TELAS DO CUBEBOX MINI

> **Projeto:** CubeBox Mini - Sistema Preditivo Integrado de Compras e Vendas  
> **Interface:** Single Page Application (React 19, TypeScript, CSS Modules, Lucide-React, Recharts)  
> **Status:** Documentação Oficial de Telas  
> **Referências Arquiteturais:** [SDD-CBOX-UI-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-UI-V1.0.0.md) | [SDD-CBOX-API-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-API-V1.0.0.md)

---

## 🗺️ Mapa de Navegação da Aplicação

A interface possui navegação lateral contínua (*Sidebar Navigation*) com 4 telas principais projetadas para responder a todas as etapas operacionais e estratégicas da loja:

```
┌────────────────────────────────────────────────────────┐
│                        CUBEBOX                         │
├─────────────────┬──────────────────────────────────────┤
│ 📊 Dashboard    │ Painel Executivo de KPIs & Métricas  │
│ 🛒 Frente/Caixa │ Ponto de Venda (PDV) & Pedidos Saída │
│ 📦 Estoque      │ Catálogo, Níveis & Gestão de Quebras │
│ 🧠 Preditivo    │ Curvas ML & Pedidos de Compra        │
└─────────────────┴──────────────────────────────────────┘
```

---

## 1. 📊 Tela 1: Dashboard Executivo (`DashboardView`)

### 1.1 Objetivo
Fornecer ao lojista e ao gestor uma visão consolidada da saúde financeira e volumétrica do negócio em tempo real, integrando receitas, despesas por perda e riscos operacionais.

### 1.2 Componentes e Elementos Visuais
1. **Cards de Indicadores de Topo (KPIs):**
   - **Faturamento Líquido do Dia:** Total monetário consolidado das vendas finalizadas no caixa, já deduzidos eventuais descontos.
   - **Volume de Pedidos:** Contagem total de transações atendidas no balcão.
   - **Ticket Médio:** Razão entre o faturamento líquido e a quantidade de pedidos atendidos.
   - **Perdas por Quebras/Avarias:** Valor monetário acumulado de produtos descartados por validade vencida ou dano físico.
   - **Alerta de Estoque Crítico:** Número de SKUs que estão abaixo do estoque de segurança ou com risco iminente de ruptura.
2. **Gráfico Temporal de Vendas (Área/Linha):**
   - Visualização da evolução diária do faturamento e do volume vendido, permitindo identificar com clareza a sazonalidade semanal (picos de quinta a domingo típicos de conveniência).
3. **Painel de Ações Rápidas:**
   - Atalhos com um clique para abrir o Caixa (novo pedido) ou ir para a lista de compras recomendadas.

---

## 2. 🛒 Tela 2: Frente de Caixa / PDV (`PosView`)

### 2.1 Objetivo
Permitir a emissão rápida de **Pedidos de Venda (Saída)** no balcão, garantindo alta velocidade de atendimento e sincronização atômica imediata com o estoque e o financeiro.

### 2.2 Componentes e Regras Operacionais
1. **Catálogo de Balcão e Busca Dinâmica:**
   - Barra de pesquisa instantânea por código SKU ou nome do item (ex: Heineken, Red Bull).
   - Grade de produtos com cards clicáveis contendo: foto ilustrativa, nome, preço unitário e badge visual com o **Estoque Disponível**.
2. **🛡️ Bloqueio Estrito de Estoque Negativo:**
   - O sistema valida a quantidade disponível antes de permitir a adição ao carrinho.
   - Se o produto tiver saldo 0, o botão de adicionar fica desabilitado com o rótulo "Esgotado".
   - Não é permitido digitar ou incrementar quantidades que superem o saldo real em gôndola.
3. **Carrinho de Compras & Cálculo de Pedido:**
   - Lista de itens selecionados com ajuste de quantidade (+ / -) e remoção.
   - Cálculo automático do **Subtotal Bruto**.
4. **🧮 Motor de Desconto Bidirecional Sincronizado:**
   - Dois campos interligados: **Desconto (%)** e **Desconto (R$)**.
   - Ao digitar um percentual (ex: `10%`), o campo monetário preenche automaticamente o equivalente em reais.
   - Ao digitar um valor fixo (ex: `R$ 5,00`), o campo percentual calcula instantaneamente a respectiva alíquota sobre o subtotal.
   - Ambos os valores são validados em tempo real, impedindo descontos superiores a 100% ou valores negativos.
5. **Finalização do Pedido de Venda:**
   - Seleção da forma de liquidação: *Dinheiro*, *PIX*, *Cartão de Débito* ou *Cartão de Crédito*.
   - Botão **"Concluir Pedido"**: Dispara a transação atômica (`POST /api/sales`), gera o número identificador do pedido (ex: `PED-20261027-001`), abate o estoque e limpa o carrinho para o próximo atendimento.

---

## 3. 📦 Tela 3: Controle de Estoque & Gestão de Quebras (`InventoryView`)

### 3.1 Objetivo
Centralizar a auditoria de inventário físico, identificação de produtos críticos e registro formal de baixas por avarias, perdas e vencimentos.

### 3.2 Componentes e Regras Operacionais
1. **Tabela Geral de Inventário:**
   - Colunas: SKU, Nome do Produto, Categoria, Preço de Venda, Custo Unitário, Estoque Físico Atual, Estoque Mínimo e Lead Time de reposição.
   - **Indicador de Status de Estoque:** Badges coloridos automáticos:
     - 🟢 *Normal*: Saldo confortável acima do limite.
     - 🟡 *Atenção*: Próximo ao estoque de segurança.
     - 🔴 *Crítico*: Abaixo do estoque mínimo ou zerado.
2. **Badge de Cluster DBSCAN:**
   - Identificação do comportamento de liquidez gerado pelo algoritmo de Machine Learning: *Alto Giro*, *Giro Médio*, *Baixo Giro* ou *Anomalia/Outlier*.
3. **🚨 Modal de Registro de Quebras e Avarias (`InventoryLoss`):**
   - Botão "Registrar Perda / Quebra" por linha de item:
     - Campos: Quantidade Danificada/Vencida, Motivo (*Vencimento de Shelf Life*, *Quebra no Manuseio*, *Furto*, *Avaria de Transporte*) e Observações.
     - Ação: Envia requisição para `POST /api/inventory/loss`, reduzindo imediatamente o estoque físico e alimentando as estatísticas de perda para os cálculos de compras e dashboards.

---

## 4. 🧠 Tela 4: Central de Inteligência Preditiva & Compras (`PredictiveView`)

### 4.1 Objetivo
Transformar a ciência de dados em decisões práticas de abastecimento, permitindo ao lojista aprovar ordens de compra e registrar a entrada física das mercadorias na loja.

### 4.2 Componentes e Regras Operacionais
1. **Gráfico Interativo de Previsão de Demanda:**
   - Permite selecionar qualquer SKU da loja para visualizar a série temporal de vendas passadas dos últimos 30 dias versus a **Projeção Preditiva dos próximos 7 a 14 dias** gerada pelo modelo Random Forest Regressor.
2. **Tabela de Sugestões de Compra (Reorder Engine):**
   - Lista todos os SKUs com a fórmula de reposição calculada em tempo real:
     $$\text{Qtd Sugerida} = \max(0, \text{Demanda Prevista} + \text{Estoque de Segurança} + \text{Histórico de Quebras} - \text{Estoque Atual})$$
   - **Probabilidade de Ruptura (Naive Bayes):** Badge de risco dinâmico (*Alto Risco*, *Médio Risco*, *Baixo Risco*).
3. **Disparo e Aprovação de Pedidos de Compra (`PurchaseOrder`):**
   - O gestor pode ajustar manualmente a quantidade sugerida se desejar e clicar em **"Aprovar Pedido de Compra"**.
   - O pedido é gravado com status `PENDENTE` (`POST /api/purchases`) e enviado ao fornecedor.
4. **Painel de Recebimento de Mercadorias (Entrada de Estoque):**
   - Aba com os pedidos pendentes de entrega do fornecedor.
   - Ao descarregar as caixas na loja, o operador clica em **"Confirmar Recebimento Físico"** (`PATCH /api/purchases/{id}/receive`):
     - O sistema altera o status do pedido para `RECEBIDO`;
     - Credita automaticamente as unidades no `estoque_atual` do produto, fechando com total integridade todo o ciclo de compras, estoque e vendas.
