---
id: US-UI-01
title: Interface de Ponto de Venda (PDV Balcão) e Dashboard de KPIs
bounded_context: 05-frontend-ui
complexity: Media
token_budget: 450
dependencies:
  - docs/sdd/SDD-CBOX-UI-V1.0.0.md
  - frontend/src/views/PosView.tsx
  - frontend/src/views/DashboardView.tsx
---

# 📖 US-UI-01: Interface Operacional de PDV e Dashboard de Indicadores

### 🎯 Narrativa do Usuário
**Como** operador de caixa e atendente da conveniência,  
**Quero** selecionar produtos rapidamente, lançar itens no carrinho e concluir a venda com baixa imediata,  
**Para que** o atendimento seja ágil e o estoque permaneça sempre sincronizado.

---

### 🧪 Critérios de Aceite (BDD)

#### Cenário 1: Conclusão de venda rápida de balcão
- **Dado** que o operador está na tela de PDV,
- **Quando** ele busca um produto, define a quantidade, clica em "Adicionar" e finaliza informando a forma de pagamento,
- **Então** o sistema envia a transação para o backend, emite feedback visual de sucesso e limpa o carrinho para a próxima venda.

#### Cenário 2: Visualização de alertas no Dashboard
- **Dado** que itens atingiram níveis abaixo do estoque mínimo,
- **Quando** o usuário acessa o Dashboard,
- **Então** um card de alerta deve exibir em destaque o total de itens em situação crítica.
