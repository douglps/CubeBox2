---
id: US-UI-08
title: Tratamento de Erros Resiliente e Notificações com Smart Retry
bounded_context: 05-frontend-ui
complexity: Média
token_budget: 450
dependencies:
  - docs/sdd/SDD-CBOX-ERR-V1.0.0.md
  - frontend/src/components/common/InlineAlert/InlineAlert.tsx
  - frontend/src/services/api.ts
  - backend/app/main.py
---

# US-UI-08: Tratamento de Erros Resiliente e Notificações com Smart Retry

## 1. 📖 Narrativa da História
Como **operador de caixa ou estoquista do CubeBox**,
Quero **receber mensagens claras e diretas de uma linha quando ocorrer um problema no sistema**,
Para que **eu compreenda imediatamente o que aconteceu e possa tentar novamente com um clique em caso de falha transitória, sem perder os dados preenchidos na tela.**

---

## 2. 📋 Critérios de Aceitação (BDD - Dado-Quando-Então)

### Cenário 1: Falha Transitória de Rede ou Servidor com Smart Retry
* **Dado** que o operador executa uma ação no PDV ou Estoque e a central de dados está inacessível (Network Error ou HTTP 500),
* **Quando** o sistema falha ao comunicar com o servidor,
* **Então** o sistema deve exibir a mensagem `"Sem conexão com o sistema. Verifique a rede."` ou `"Não foi possível concluir. Nenhuma alteração foi salva."`,
* **E** deve exibir o botão `[ Tentar novamente ]`,
* **E** ao ser clicado, o botão deve alternar para `"Tentando..."` e reexecutar a chamada sem perder o estado da tela.

### Cenário 2: Erro de Regra Comercial Sem Falso Retry
* **Dado** que o operador tenta faturar um item com saldo insuficiente ou produto congelado,
* **Quando** o backend retorna erro de regra comercial (HTTP 422/409),
* **Então** o sistema deve exibir a mensagem direta orientando o operador (ex.: `"Estoque insuficiente: há apenas {saldo} un deste item."`),
* **E** NÃO deve exibir botão de retry, prevenindo cliques repetidos em vão (*Rage Clicks*).

---

## 3. 🎯 Definition of Done (DoD)
- [x] SDD `SDD-CBOX-ERR-V1.0.0.md` criado e indexado.
- [x] Backend FastAPI com Global Exception Handlers e rollback transacional.
- [x] Componente `InlineAlert` acessível (WCAG 2.1 AA) com debounce e estado de retry.
- [x] Cliente HTTP `api.ts` com normalização de erros RFC 7807 e detecção de falha transitória.
