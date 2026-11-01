# 📐 SDD-CBOX-UI-V1.0.0: Subsistema Frontend Cockpit SPA (React)

> **Projeto:** CubeBox Mini - Sistema Preditivo Integrado de Compras e Vendas  
> **Módulo:** Cockpit Operacional e Analítico SPA (Fase 5)  
> **Versão:** 1.0.0  
> **Status:** Aprovado  
> **Padrão:** IEEE 1016 (Software Design Document)  
> **Data:** 2026-10-27  

---

## 1. 🎯 Identificação & Visão Geral (Overview)

### 1.1 Propósito
Definir a arquitetura técnica, árvore de componentes, estratégia de gerenciamento de estado e design system para o frontend Single Page Application (SPA) do CubeBox Mini construído em React 19, TypeScript e Vite.

A interface tem dois objetivos centrais:
1. **Agilidade Operacional no Caixa (PDV):** Interface simplificada para registrar saídas de produtos com feedback imediato de baixa em estoque.
2. **Cockpit Executivo & Preditivo:** Visualização intuitiva para o tomador de decisão, destacando riscos de ruptura (Naive Bayes), projeções de demanda (Random Forest) e clusters de giro de mercadorias (DBSCAN).

### 1.2 Relação com o Negócio & Léxico
Conecta as operações diárias aos conceitos consolidados em [01-business-understanding.md](file:///c:/Dev/CubeBox2/docs/01-business-understanding.md) e [LEXICON.md](file:///c:/Dev/CubeBox2/LEXICON.md):
- **Dashboard:** Visão holística de métricas financeiras e volumétricas.
- **Sugestão de Reposição:** Tabela acionável com aprovação de pedidos de compra.
- **Cluster de Giro:** Badges informativos visuais (Alto, Médio, Baixo, Outlier).

---

## 2. 🏛️ Princípios de Heurística & Arquitetura

- **Design System & W3C DTCG Tokens:** Conformidade integral com o [SDD-CBOX-DESIGN-SYSTEM-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-DESIGN-SYSTEM-V1.0.0.md), utilizando variáveis CSS em `src/styles/variables.css`.
- **Dual-Theme Cerúleo / Grafite:** Alternância instantânea (<16ms) entre Tema Claro Cerúleo (`#E1EEF3`) e Tema Escuro Grafite (`#181818`), eliminando preto e branco puros (`#000`/`#FFF`) para reduzir fadiga visual.
- **Tipografia Quiet Luxury:** Hierarquia oficial com *Instrument Serif* (Display/Títulos executivos), *Geist* (Interface/Rótulos) e *Geist Mono* (Numerais/Tabelas com `tabular-nums`).
- **Feedback Sem Pânico (Anti-Panic Calm UI):** Alertas e indicadores sobre fundo neutro elevado com borda-guia lateral demarcada de 4px e texto de alto contraste (> 9.5:1 WCAG AAA).
- **Colocalização (Data Locality):** Cada componente reside em sua respectiva pasta com seu CSS Module (`.module.css`), tipagens (`.types.ts`) e testes (`.spec.tsx`).
- **Acessibilidade & A11y (WCAG 2.1 AA/AAA):** Rótulos ARIA para leitores de tela, navegação completa por teclado no PDV, `:focus-visible` com anel duplo e suporte a `prefers-reduced-motion`.
- **KISS & Pure Client State:** Gerenciamento de estado nativo (`useState`, `useContext`) para fluxos de checkout e cache de requisições via hooks desacoplados.

---

## 3. 🖥️ Arquitetura de Telas & Componentes

```
┌────────────────────────────────────────────────────────┐
│                      App Layout                        │
│ ┌────────────────┐ ┌─────────────────────────────────┐ │
│ │  Sidebar Nav   │ │           View Router           │ │
│ │  - Dashboard   │ │                                 │ │
│ │  - PDV         │ │  1. DashboardView (KPIs+Linhas) │ │
│ │  - Estoque     │ │  2. PosView (Caixa / Checkout)  │ │
│ │  - Previsão ML │ │  3. InventoryView (Catálogo)    │ │
│ └────────────────┘ │  4. PredictiveView (Sugestões)  │ │
│                    └─────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 3.1 Especificação das Views Principais
1. **DashboardView:**
   - Cards de Resumo: Faturamento Líquido do Dia, Quantidade de Pedidos, Perdas por Quebra e Itens em Estoque Crítico.
   - Gráfico de Tendência (Recharts): Vendas históricas agregadas por dia.
2. **PosView (PDV / Caixa & Pedidos de Saída):**
   - Catálogo rápido com busca por SKU ou Nome e feedback visual do saldo em estoque.
   - **Prevenção de Estoque Negativo:** O seletor de quantidade bloqueia adição além do `estoque_atual`, desabilitando o botão de checkout se algum item não possuir saldo suficiente.
   - Carrinho de compras com cálculo automático de subtotal.
   - **Desconto Bidirecional Sincronizado:** O operador pode digitar a porcentagem (ex: `10%`) e o campo monetário calcula `R$ X,XX` automaticamente, ou digitar o valor monetário e o campo percentual calcula a respectiva fatia sem disparidades.
   - Seleção de forma de pagamento (Dinheiro, PIX, Cartão Débito, Cartão Crédito) com registro do número do pedido.
3. **InventoryView (Gestão de Estoque & Quebras):**
   - Tabela com estoque físico atual, custo unitário, estoque de segurança e badge de cluster DBSCAN.
   - **Ação de Registro de Quebra/Avaria:** Botão para abrir modal de perda física, registrando motivo (Vencimento, Avaria, Furto), quantidade e justificativa para baixa de estoque.
4. **PredictiveView (Inteligência Preditiva & Pedidos de Compra):**
   - Gráfico interativo com Linha Real vs. Projeção do Random Forest para os próximos 7 dias.
   - Tabela de Sugestão de Compra com indicação da Probabilidade de Ruptura (Naive Bayes).
   - **Gestão de Pedidos de Compra:** Botão "Aprovar Pedido de Compra" que emite a ordem para fornecedor e aba para confirmar o "Recebimento Físico", incrementando o estoque no ato da entrega.
