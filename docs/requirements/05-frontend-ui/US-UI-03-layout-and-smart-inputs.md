---
id: US-UI-03
title: Layout Cinemático, Rail Colapsável e Clearable Inputs
bounded_context: 05-frontend-ui
complexity: Média
token_budget: 450
dependencies:
  sdd: docs/sdd/SDD-CBOX-UI-V2.0.0.md
  files:
    - frontend/src/components/layout/AppShell.tsx
    - frontend/src/components/layout/AppShell.module.css
    - frontend/src/components/common/ClearableInput.tsx
---

# US-UI-03: Layout Cinemático, Rail Colapsável e Clearable Inputs

## 1. 📖 Narrativa da User Story
**Como** operador de caixa e gestor da loja,  
**Quero** um layout com header dinâmico que libere espaço ao rolar, menu lateral recolhível em modo rail com tooltips flutuantes, botão único de tema no header e campos com limpeza via `[Esc]` ou clique em `X`,  
**Para que** eu tenha foco total na tarefa operacional sem poluição visual ou redundâncias.

## 2. 🧪 Critérios de Aceitação (BDD / Gherkin)

### Cenário 1: Header dinâmico Smart Sticky sem Faixa Residual
- **Dado** que estou visualizando qualquer página com rolagem longa,
- **Quando** rolo a página para baixo (`scroll down`),
- **Então** o header deve se ocultar suavemente para cima com transição fluida,
- **E** o espaço ocupado pelo header deve colapsar simultaneamente (`margin-top: -60px`), fazendo o conteúdo expandir e ocupar 100% da altura da viewport sem deixar faixa vazia,
- **E** quando rolo a página para cima (`scroll up`),
- **Então** o header deve reaparecer imediatamente no topo fixo reajustando suavemente o layout.

### Cenário 2: Alternância de Tema Única no Header com Tooltip Flutuante
- **Dado** que visualizo a interface,
- **Quando** inspeciono os controles de tema,
- **Então** deve existir exatamente um único botão de alternância no Header (lado direito),
- **E** ao passar o mouse ou focar no botão, deve surgir um tooltip flutuante exibindo a ação com o atalho `<kbd>Alt+T</kbd>`,
- **E** não deve existir botão de tema na barra lateral nem no rodapé.

### Cenário 3: Aside, Menus e Ações com Atalhos Exclusivos em Tooltips Flutuantes
- **Dado** que estou navegando pelo sistema (com o menu lateral em modo rail ou expandido, botões de ação ou seletores de pagamento),
- **Quando** visualizo a interface em repouso,
- **Então** os rótulos, botões e o rodapé não devem exibir badges ou marcações estáticas de atalhos poluindo a tela,
- **E** quando passo o mouse ou foco via teclado em um elemento com atalho associado (`Alt+1..7`, `Alt+T`, atalhos de botões ou seletores),
- **Então** deve surgir um tooltip flutuante (`z-index: 1200` garantido contra cortes de overflow) exibindo o nome/ação acompanhado da tecla de atalho.

### Cenário 4: Rodapé Estritamente Fixo (Fixed HUD Dock)
- **Dado** que estou navegando em qualquer view do sistema independente do tamanho do conteúdo,
- **Quando** visualizo a base da janela,
- **Então** o rodapé (`footerHud`) deve permanecer estritamente fixo na base da tela sem rolar com a página,
- **E** a rolagem vertical deve ocorrer exclusivamente dentro da área da view (`viewContent`).

### Cenário 5: Limpeza rápida de inputs com `X` ou `Esc`
- **Dado** que estou digitando em um campo de texto ou busca,
- **Quando** o campo possui texto,
- **Então** deve exibir um botão `X` à direita para limpar imediatamente,
- **E** se eu pressionar a tecla `Esc`, o campo deve ser limpo e desmarcado.

### Cenário 6: Digitação Gradual à Direita com Máscara Dinâmica (Estilo Bancário / ATM)
- **Dado** que estou interagindo com um campo numérico (moeda, percentual ou quantidade inteira),
- **Quando** digito algarismos de `0` a `9`,
- **Então** os dígitos devem ser inseridos à direita deslocando os anteriores para a esquerda (`text-align: right`),
- **E** a máscara deve ser completada gradualmente em tempo real com separadores pt-BR (`.` para milhares e `,` para decimais),
- **E** a tecla `Backspace` deve remover o último dígito à direita recalculando a máscara instantaneamente,
- **E** as teclas `ArrowUp` e `ArrowDown` devem incrementar/decrementar pelo passo configurado.

## 3. 📋 Definition of Done (DoD)
- Header 100% full-width com colapso de espaço físico sem faixa vazia sob scroll down.
- Rodapé estritamente fixo na base da tela (fixed dock HUD).
- Atalhos `Alt+...` estritamente contidos em tooltips flutuantes acessíveis (`z-index: 1200`).
- Sem redundância de alternador de tema ou botão de densidade.
- Componente `BankingNumberInput` com digitação da direita para a esquerda e máscara dinâmica gradual.
- Acessibilidade WCAG 2.1 AA e navegação fluida por teclado.

