---
id: US-CRM-01
title: Gestão de Clientes Multi-Endereço, Cadastro Ágil no PDV e Invariante de Delivery
bounded_context: CRM & Ponto de Venda (PDV)
complexity: Média
token_budget: 110 linhas
dependencies:
  - docs/sdd/SDD-CBOX-CRM-PDV-V1.0.0.md
  - backend/app/models.py
  - backend/app/schemas.py
  - backend/app/routers/operations.py
  - frontend/src/views/components/CustomerSelectModal/CustomerSelectModal.tsx
---

# User Story: US-CRM-01 - Cadastro Ágil no PDV e Múltiplos Endereços

## 1. Narrativa do Usuário
**Como** operador de caixa do PDV,  
**Quero** ter um botão de ação rápida para cadastrar um novo cliente diretamente no modal de seleção, podendo cadastrar seu telefone obrigatoriamente e 0 ou vários endereços com definição de padrão,  
**Para que** o atendimento no balcão seja instantâneo e entregas em domicílio tenham endereço validado sem interrupção de fluxo.

---

## 2. Critérios de Aceite (BDD)

### Cenário 1: Cadastro no PDV e CRM com Toggle Sem Endereço
- **Dado** que o operador abre o modal unificado de cadastro de cliente,
- **Quando** a opção *"Cliente sem endereço (apenas balcão / sem entrega)"* estiver marcada,
- **E** informa Nome e Telefone válido (mínimo 10 dígitos),
- **Então** o cliente é cadastrado sem endereço e selecionado no caixa do PDV ou CRM.

### Cenário 2: Endereço Obrigatório por Padrão e Definição de Padrão
- **Dado** que a opção sem endereço está desmarcada,
- **Quando** o operador preenche os campos de endereço obrigatórios (CEP, Logradouro, Número, Bairro, Cidade/UF),
- **Então** o endereço é cadastrado e definido como padrão (`is_default = true`).

### Cenário 3: Bloco de Endereços Salvos e Alternância de Padrão
- **Dado** que o cliente possui endereços já cadastrados,
- **Quando** o modal de edição é aberto,
- **Então** os endereços são exibidos em bloco compacto com o endereço padrão sempre no topo,
- **E** o botão *"Tornar Padrão"* aparece apenas nos endereços secundários (oculto no padrão).

### Cenário 4: Bloqueio de Venda para Entrega sem Endereço
- **Dado** que o operador finaliza uma venda com modalidade `ENTREGA`,
- **Quando** não houver endereço associado ou o snapshot de entrega estiver vazio,
- **Então** o sistema bloqueia a conclusão da venda e emite alerta visual exigindo a seleção/cadastro de endereço.
