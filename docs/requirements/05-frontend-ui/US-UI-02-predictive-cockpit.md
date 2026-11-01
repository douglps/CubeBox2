---
id: US-UI-02
title: Cockpit de Inteligência Preditiva e Aprovação de Pedidos de Compra
bounded_context: 05-frontend-ui
complexity: Media
token_budget: 450
dependencies:
  - docs/sdd/SDD-CBOX-UI-V1.0.0.md
  - frontend/src/views/PredictiveView.tsx
  - frontend/src/views/InventoryView.tsx
---

# 📖 US-UI-02: Cockpit Preditivo e Aprovação de Reposição

### 🎯 Narrativa do Usuário
**Como** comprador da conveniência,  
**Quero** visualizar a curva de projeção de vendas dos produtos e uma lista de pedidos recomendados pela IA,  
**Para que** eu possa aprovar compras com embasamento estatístico claro e sem risco de ruptura.

---

### 🧪 Critérios de Aceite (BDD)

#### Cenário 1: Inspeção do gráfico preditivo
- **Dado** que um produto foi selecionado na tela de Inteligência Preditiva,
- **Quando** o gráfico for carregado,
- **Então** ele deve plotar a série temporal histórica recente e a curva projetada de demanda futura para os próximos 7 dias.

#### Cenário 2: Aprovação de sugestão de compra
- **Dado** que a tabela recomenda comprar 50 unidades de um item com risco alto de ruptura,
- **Quando** o gestor clica no botão "Aprovar Compra",
- **Então** o sistema exibe confirmação visual da ordem e atualiza a projeção de abastecimento.
