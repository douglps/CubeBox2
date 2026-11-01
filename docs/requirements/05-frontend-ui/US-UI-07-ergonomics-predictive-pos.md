---
id: US-UI-07
title: Experiência Ergonômica Preditiva, Batch Actions e Otimização de PDV
bounded_context: 05-frontend-ui
complexity: Média
token_budget: 450
dependencies:
  sdd: docs/sdd/SDD-CBOX-UI-V2.1.0.md
  files:
    - frontend/src/components/layout/AppShell.tsx
    - frontend/src/components/common/DataTable/DataTable.tsx
    - frontend/src/views/PredictiveView.tsx
    - frontend/src/views/PosView.tsx
    - frontend/src/views/ProductsView.tsx
---

# US-UI-07: Experiência Ergonômica Preditiva, Batch Actions e Otimização de PDV

## 1. 📖 Narrativa da User Story
**Como** gestor de suprimentos e operador de caixa da loja,  
**Quero** selecionar produtos no cockpit preditivo via modal de cards visuais com datas reais no gráfico, acionar ações em lote em tabelas selecionadas, visualizar telemetria e hora no rodapé fixo e ter maior espaço útil no carrinho do PDV com destaque para pedidos do cliente,  
**Para que** minhas decisões de compra sejam rápidas, sem sobrecarga cognitiva e as operações de balcão sejam eficientes.

## 2. 🧪 Critérios de Aceitação (BDD / Gherkin)

### Cenário 1: Seleção por Modal de Cards Expandido, Datas Reais e Foco Cognitivo no Gráfico Preditivo
- **Dado** que acesso a tela de Projeção Preditiva de Demanda,
- **Quando** clico em "Selecionar Produtos para Análise",
- **Então** abre-se um modal de área útil expandida ocupando aproximadamente 80% da viewport (`width: 82vw`, `height: 82vh`, `max-width: 1560px`, `max-height: 880px`) com grid fluido e scroll responsivo,
- **E** ao selecionar mais de 1 produto, o botão "Desmarcar Todos" torna-se visível para reset rápido da seleção,
- **E** as legendas do gráfico e as tags de produto exibem estritamente os nomes comerciais dos produtos sem o prefixo de SKU,
- **E** ao passar o mouse sobre um produto (na legenda, nas tags ou na linha), a linha correspondente é iluminada (`strokeWidth: 4`, opacidade 100%) enquanto as demais recebem fade atenuado (opacidade 25%),
- **E** o tooltip renderiza apenas a métrica isolada da linha em foco, eliminando ruído comparativo desnecessário,
- **E** o gráfico renderiza as datas reais dos próximos 7 dias (ex: `Qua, 28/10`, `Qui, 29/10`) no eixo X.

### Cenário 2: Ações em Lote no DataTable
- **Dado** que estou visualizando uma tabela (`DataTable`),
- **Quando** seleciono um ou mais registros através dos checkboxes,
- **Então** uma barra contextual de ações em lote surge no rodapé da tabela,
- **E** exibe a contagem de itens selecionados e os botões de ação permitidos para aquela tela.

### Cenário 3: Telemetria e Relógio no Rodapé Fixo
- **Dado** que estou em qualquer tela da aplicação,
- **Quando** olho para a barra de rodapé (`footerHud`) à direita,
- **Então** o indicador de latência (`XXms`) e a data com hora (`DD/MM/YYYY HH:MM`) devem ser exibidos de forma discreta e atualizada,
- **E** o cabeçalho superior deve ficar limpo, sem o badge de latência.

### Cenário 4: Microcopy Humanizada e Dica Contextual `(?)`
- **Dado** que estou cadastrando ou editando um produto,
- **Quando** interajo com campos numéricos de preço,
- **Então** o texto de ajuda deve ser acolhedor e próximo do cotidiano do lojista,
- **E** campos com regras de sistema devem conter ícone `(?)` com explicação ao passar o mouse.

### Cenário 5: Ergonomia do Carrinho e Histórico do Cliente no PDV
- **Dado** que estou na Frente de Caixa (`PosView`),
- **Quando** seleciono um cliente cadastrado,
- **Então** o total de compras/pedidos históricos do cliente deve ser exibido com destaque visual,
- **E** o painel da comanda deve priorizar o espaço vertical dos itens adicionados.
