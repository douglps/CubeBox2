---
id: US-CRM-PDV-01
title: PDV Inteligente com Busca Modal de Clientes e Repetição de Pedido
bounded_context: Sales & CRM
complexity: High
token_budget: 110
dependencies:
  - docs/sdd/SDD-CBOX-DATA-CRM-PDV-V1.0.0.md
  - frontend/src/views/PosView.tsx
  - backend/app/routers/operations.py
---

# US-CRM-PDV-01: PDV Inteligente com Modal de Clientes e Repetição de Compras

## 1. 📖 Narrativa da História
**Como** operador de caixa do CubeBox,  
**Quero** buscar clientes por nome, telefone ou CPF via modal inteligente e poder repetir pedidos com 2 cliques,  
**Para que** o atendimento no balcão seja ágil, com dados higienizados e validação em tempo real de estoque disponível.

---

## 2. 🧪 Critérios de Aceite (BDD)

### Cenário 1: Busca de Cliente no PDV
- **Dado** que o operador está no PDV e clica em "Identificar Cliente" (ou atalho F7),
- **Quando** digita 3 ou mais caracteres no campo de busca,
- **Então** o sistema exibe os resultados com Nome, Telefone sanitizado, CPF mascarado e LTV.

### Cenário 2: Repetição de Compra com 2 Cliques
- **Dado** que um cliente foi selecionado e possui compras anteriores,
- **Quando** o operador clica no botão "Repetir Pedido" da compra histórica,
- **Então** o sistema valida os itens contra o estoque físico:
  - Se houver estoque total: com mais 1 clique confirma e joga os itens no carrinho, fechando o modal.
  - Se algum item tiver estoque parcial/zero: exibe aviso de ajuste de quantidade antes da confirmação.

### Cenário 3: Entrega com Taxa Default e Edição
- **Dado** que a venda é classificada como entrega,
- **Quando** o operador marca a opção "Entrega",
- **Então** o campo de taxa é exibido com o valor default de R$ 12,00, permitindo ajuste manual e somando ao valor final.

### Cenário 4: CPF na Nota com Toggle de Cadastro
- **Dado** que o cliente tem CPF validado no CRM,
- **Quando** a opção "CPF na Nota" está marcada,
- **Então** preenche automaticamente o documento, permitindo desvincular ou editar para o cupom sem alterar a base fixa.

---

## 3. 🛡️ Definition of Done (DoD)
- [ ] Modal de busca integrado no `PosView.tsx`.
- [ ] Validação de estoque físico antes de transferir itens para o carrinho.
- [ ] Adição da taxa de entrega e campo `cpf_nota` no payload de checkout.
- [ ] Testes unitários de validação de CPF e cálculo de taxa.
