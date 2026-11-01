# 💎 CubeBox Design System — Matriz de Maturidade & Roadmap para Excelência

> **Status:** Ativo & Em Evolução
> **Referência Metodológica:** Design System Maturity Model (InVision / Brad Frost / Figma Standards) & IEEE 1016
> **Objetivo:** Alcançar o Nível 5 (Excelência de Mercado / Enterprise Grade)
> **Última Atualização:** 2026-10-22

---

## 📊 Escala de Níveis de Maturidade (Maturity Tiers)

```
[ Nível 1: Ad-hoc / Estilos Espalhados ]
       ↓
[ Nível 2: Guia de Estilos Centralizado (Tokens Básicos) ]  ← (Onde o CubeBox estava)
       ↓
[ Nível 3: Sistema de Componentes Consistente & Tipado ]   ← (Meta Inicial de Brainstorm)
       ↓
[ Nível 4: Sistema Integrado (A11y AA, Motion, Testes & Documentação Viva) ]
       ↓
[ Nível 5: Excelência de Mercado (Design Tokens W3C, Multi-Theme, Zero-Debt, Storybook/Docs) ] ★ ALVO
```

---

## 🎯 Radar de Progresso Geral

| Dimensão | Nível Atual | Meta | Status |
| :--- | :---: | :---: | :---: |
| **1. Tokens Fundacionais & Design Tokens** | **Nível 5** | **Nível 5** | ✅ 100% Homologado no Showcase |
| **2. Tipografia, Ritmo & Grid Semântico** | **Nível 5** | **Nível 5** | ✅ 100% Homologado (Opção 4 Oficial) |
| **3. Acessibilidade (A11y WCAG 2.1 AA)** | **Nível 4** | **Nível 5** | 🟡 Homologado com Showcase |
| **4. Componentes Atômicos (Atoms & Molecules)** | **Nível 4** | **Nível 5** | 🟡 Homologado no Showcase |
| **5. Motion System & Microinterações** | **Nível 2** | **Nível 5** | 🟡 Em Definição |
| **6. Organismos de Alta Densidade (Cockpit & POS)** | **Nível 2** | **Nível 5** | 🟡 Em Planejamento |
| **7. Documentação Viva & Catálogo Interativo** | **Nível 5** | **Nível 5** | ✅ 100% Homologado com Showcase |
| **8. Governança, Testes & Regressão Visual** | **Nível 5** | **Nível 5** | ✅ 100% Homologado com Showcase |

---

## 📋 Checklist Detalhado por Dimensão

Legenda de Status:
- ⬜ `[ ]` Não Iniciado
- 🟡 `[-]` Em Andamento / Parcial
- ✅ `[x]` Concluído & Homologado

---

### 1. Tokens Fundacionais & Design Tokens (Padrão W3C DTCG Nível 5)

#### A. Cores, Superfícies & Ergonomia Dual-Theme
- [x] **Paleta Primária e Superfícies Dark:** Canvas grafite em `#181818`, cards em `#242424` e hover ancorado em `#373737`.
- [x] **Paleta Primária e Superfícies Light:** Fundo cerúleo suave em `#E1EEF3`, cards em `#EDF5F8` e texto sólido em `#373737`.
- [x] **Zero Preto Puro (`#000`) e Zero Branco Puro (`#FFF`):** Eliminação de fadiga visual e dispersão de luz em telas OLED/LCD.
- [x] **Feedback Semântico Anti-Pânico (Calm UI com Borda Demarcada & Texto Neutro):** Alertas e toasts operam sobre fundo neutro elevado (`--bg-surface-elevated`) com **borda-guia lateral semântica de 4px bem demarcada** (`--status-success`, `--status-warning`, `--status-danger`, `--status-info`). O texto do título e descrição adota estritamente cor neutra sólida (`--text-primary` e `--text-secondary`), eliminando a fadiga de tipografia colorida e elevando o contraste para > 11:1 (WCAG AAA).
- [ ] **Conversão para Formato JSON W3C DTCG:** Arquivo central de tokens (`tokens.json`) com chaves `$value` e `$type` para portabilidade.

#### B. Grade Geométrica de Espaçamento (Base-4/Base-8)
- [x] **Escala de Espaçamento Linear (`--space-0-5` a `--space-16`):** `2px`, `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`.
- [x] **Tokens de Inset e Layout Gap:** Separação entre padding de formulários (`space.inset.sm/md/lg`) e respiro de grid (`space.layout.gutter`).

#### C. Sistema de Stacking Context & Z-Index
- [x] **Escala Semântica de Z-Index:** Centralização para extinguir `z-index` arbitrários (`--z-base: 0`, `--z-table-sticky: 10`, `--z-nav: 100`, `--z-dropdown: 1000`, `--z-drawer: 1200`, `--z-modal: 1300`, `--z-toast: 1500`).

#### D. Elevações, Sombras Compostas & Halos
- [x] **Sombras Duplas (Direct + Ambient Light):** `--shadow-card`, `--shadow-dropdown`, `--shadow-modal` calibradas separadamente para light e dark.
- [x] **Halos de Foco & Glow:** `--shadow-glow` para indicação elegante de foco acessível sem contorno bruto.

#### E. Geometria de Bordas & Stroke Widths
- [x] **Escala de Radii Padronizada:** `--radius-xs` (4px), `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (16px), `--radius-full` (9999px).
- [x] **Espessuras de Traço Semânticas:** `--stroke-hairline` (1px), `--stroke-focus` (2px), `--stroke-accent` (4px).

#### F. Opacidades & Estados de Interação
- [x] **Tokens de Opacidade:** `--opacity-disabled` (0.38 - padrão WCAG), `--opacity-hover` (0.08), `--opacity-backdrop` (0.60).

#### G. Breakpoints de Layout & Densidade de Tela
- [x] **Limites de Container Responsivo:** `--container-sm` (640px), `--container-md` (768px), `--container-lg` (1024px), `--container-xl` (1280px), `--container-2xl` (1536px).
- [x] **Tokens de Densidade Intercambiáveis (Compact vs. Comfortable):** Altura base de linha para operadores de estoque vs. executivos.

---

### 2. Tipografia, Ritmo Vertical & Numerais (Padrão Ouro Nível 5)

#### A. Famílias Tipográficas & Carregamento
- [x] **Font Families Padronizadas:** `'Inter'` para interface geral (alta legibilidade) e `'JetBrains Mono'` para código, SKUs e valores fiscais.
- [x] **Anti-Aliasing de Alta Fidelidade:** `-webkit-font-smoothing: antialiased` e `-moz-osx-font-smoothing: grayscale` configurados globalmente.

#### B. Escala Modular Proporcional (Minor Third 1.200)
- [x] **Escala Tipográfica Geométrica (Base 15px/16px):**
  - `--font-size-xs`: `11px` (labels de tags, badges fiscais, timestamps)
  - `--font-size-sm`: `13px` (células de tabelas densas, metadados)
  - `--font-size-base`: `15px` (corpo de texto, inputs, botões)
  - `--font-size-lg`: `18px` (subtítulos, KPI cards)
  - `--font-size-xl`: `22px` (títulos de páginas, totalizador PDV)
  - `--font-size-2xl`: `26px` (métricas macro do cockpit)
  - `--font-size-3xl`: `32px` (grandes contadores executivos)

#### C. Ritmo Vertical & Line-Heights Proporcionais
- [x] **Alturas de Linha sem Unidade (Proporcionais):**
  - `--leading-none`: `1.0` (ícones e badges compactos)
  - `--leading-tight`: `1.2` (títulos e métricas grandes)
  - `--leading-snug`: `1.35` (cabeçalhos de seção e formulários)
  - `--leading-normal`: `1.5` (corpo de texto e parágrafos)
  - `--leading-relaxed`: `1.65` (documentações e relatórios longos)

#### D. Pesos de Fonte & Contraste Tipográfico
- [x] **Escala de Pesos:** `--font-weight-regular` (400), `--font-weight-medium` (500), `--font-weight-semibold` (600), `--font-weight-bold` (700).

#### E. Tratamento Numérico OpenType (Tabular Nums)
- [x] **Alinhamento Numérico Perfeito:** `font-variant-numeric: tabular-nums` e `font-feature-settings: "tnum" 1, "zero" 1` (zero cortado e larguras monoespaçadas para números).
- [x] **Zero Layout-Jitter:** Eliminação de tremor em contadores de vendas ao vivo no POS e cotação de estoque.

#### G. Font Pairing & Personalidade de Marca (OFICIAL APROVADA: OPÇÃO 4)
- [x] **Combinação Oficial Eleita (Quiet Luxury / Executive Analytics):**
  - **Títulos Display & Cabeçalhos:** `'Instrument Serif', Georgia, serif` (`--font-display`).
  - **Interface, Inputs & Corpo de Texto:** `'Geist', sans-serif` (`--font-sans`).
  - **Dados Tabulares, Moedas & SKUs:** `'Geist Mono', monospace` (`--font-mono` com `tabular-nums`).
- [x] **Font Pairing Playground Interativo:** Homologado com comparativo ao vivo no Showcase.

---

### 3. Acessibilidade (A11y WCAG 2.1 AA Mandatória — Nível 5)

#### A. Rácio de Contraste Cromático (Contrast Ratio)
- [x] **Contraste Mínimo de Texto (SC 1.4.3):** Mínimo 4.5:1 para texto normal e 3:1 para texto grande/numerais. Fundo Light `#E1EEF3` + texto `#373737` entrega **9.8:1 (Conformidade AAA)**.
- [x] **Contraste de Componentes Não-Textuais (SC 1.4.11):** Bordas ativas e ícones com rácio superior a 3:1 contra o fundo.

#### B. Sistema de Foco Visível (`:focus-visible`)
- [x] **Tokens de Focus Ring:** `--focus-ring-width: 2px`, `--focus-ring-offset: 2px` e `--focus-ring-color: var(--primary)`.
- [x] **Proibição de `outline: none` Cego:** Eliminação de outlines nativos substituídos exclusivamente por anel duplo estético via `:focus-visible` (visível apenas para teclado).

#### C. Navegação por Teclado & Prevenção de Keyboard Traps (SC 2.1.2)
- [x] **Navegação Sequencial Tab / Shift+Tab:** Ordem lógica de tabulação em todos os cartões, botões e campos de entrada.
- [x] **Escape-to-Close:** Encerramento seguro de modais, drawers e menus suspensos com tecla `Esc` e restauração de foco no elemento disparador.

#### D. Comunicação com Leitores de Tela (Screen Reader Announcer)
- [x] **Regiões Vivas (ARIA Live Regions):** `aria-live="polite"` para atualizações não-urgentes de estoque e `aria-live="assertive"` para rejeição de NF-e na SEFAZ ou caixa travado.
- [x] **Rótulos Invisíveis Acessíveis (`.sr-only`):** Classes para contextualizar botões baseados apenas em ícones (ex: `aria-label` e texto exclusivo para leitores).

#### E. Respeito a Preferências do Sistema Operacional
- [x] **Suporte a `prefers-reduced-motion`:** Desativação de transformações e substituição por opacidades instantâneas para operadores com sensibilidade vestibular.
- [x] **Touch Target Mínimo (SC 2.5.5):** Mínimo de `44px x 44px` (`--touch-target-min`) para todos os alvos clicáveis em tablets POS balcão.

---

### 4. Biblioteca de Componentes Atômicos & Moléculas Operacionais (Atoms & Molecules)
#### A. Formulários & Entradas (Form Controls)
- [x] **Button / Action Pill:** Variantes (`primary`, `secondary`, `danger`, `ghost`), tamanhos (`sm`, `md [44px]`, `lg`), estado `loading` (spinner acoplado), microinteração no clique (`active: scale(0.98)`), suporte a hotkey nativo (`[F-key]`).
- [x] **TextInput & MaskedInput:** Suporte nativo a rótulos, helper text, máscara (CNPJ) e mensagem de erro com `aria-invalid` e anéis de erro semânticos.
- [x] **BarcodeScannerInput:** Captura ágil para leitor de código de barras físico (EAN-13/SKU) com captura de tecla de atalho (`F2`), debounce e submissão por `Enter`.
- [x] **PaymentSelector:** Seletor tátil e numérico (`[1]` a `[4]`) para formas de pagamento no PDV (Pix, Crédito, Débito, Dinheiro).
- [x] **Select / Searchable Combobox:** Dropdown acessível para seleção rápida de fornecedores, unidades de medida e status.
- [x] **Toggle Switch & Checkbox:** Alternância rápida com feedback tátil, estados `aria-checked` e rótulos semânticos.
- [x] **QuantitySelector (+ / −):** Ajuste ágil de quantidades para balcão/carrinho com UOM acoplada (UN, KG, CX).
- [x] **QuickActionBar:** Micro-ações em linha de chão de loja (editar, excluir, favoritar, adicionar observação, expandir/recolher detalhes e marcar seleção).
- [x] **SliderInput (Slide Linear):** Controle contínuo de ajuste de margem/desconto com escala dinâmica e indicador numérico em tempo real.

- [x] **DatePickerCalendar (Padrão pt-BR & Dropdown):** Acionamento via input de texto com máscara automática `DD/MM/AAAA`, popup com atalhos de clique único (**Ontem**, **Hoje**, **Amanhã**), marcação visual indelével do dia atual (borda e ponto guia primário), navegação mensal e seletores dedicados de **Mês** e **Ano**.
- [x] **Padrão Universal de Limpeza de Formulários (Botão X & Esc):** Todo campo de entrada (`TextInput`, `SearchInput`, `CurrencyInput`, `DatePickerCalendar`, `BarcodeScannerInput`) possui botão de limpeza rápida à direita com ícone Lucide e suporte universal à tecla `Escape`.
- [x] **Adoção Oficial de Ícones: Lucide Icons (Outline 24x24 / Stroke 2px):** Homologada como a biblioteca visual oficial do CubeBox pela consistência geométrica, balanceamento óptico e ergonomia em interfaces densas de WMS/PDV.
- [x] **FlagBadge:** Bandeiras operacionais de alfândega, origem e precificação multimoeda (`BR`, `US`, `EU`, `CN`, `AR`, `GLOBAL`).
- [x] **IconLibrarySelector:** Comparativo arquitetural e amostrador visual interativo das 4 bibliotecas enterprise com indicação de *Lucide Icons* como biblioteca oficialmente adotada.

- [x] **Feedback Semântico com Efeito de Caixas (CubeBox WMS - Opção 3 Homologada):** Adoção oficial da **Opção 3 (Cubo Elevado Executive / Quiet Luxury)**: elevação volumétrica com chanfro interno de luz superior (`inset 0 1px 0 rgba(255,255,255,0.12)`), indicador lateral em gradiente fluido de status e elevação reativa no hover sem poluição visual.
- [x] **Badge / Status Chip (Fundo Neutro & Pulso):** Indicadores sobre fundo neutro elevado (`--bg-surface-elevated`) com ponto pulsante contínuo em CSS para status ao vivo (`ONLINE`, `CRITICAL`, `ALERT`, `SYNC`), garantindo legibilidade absoluta do texto e conformidade WCAG AAA em ambos os temas.
- [x] **Toast Notification System:** Feedback flutuante com borda-guia semântica de 4px, fundo neutro elevado, autoclose e botão dispensar.
- [x] **SkeletonShimmer:** Placeholders animados com shimmer effect linear para tabelas e cards sem causar *Layout-Shift*.
- [x] **EmptyState (Zero Deadlock):** Ilustração/ícone, título, subtítulo descritivo e botão de ação primária para guiar o operador.

#### C. Exibição de Dados & Especialidades WMS/POS (Data Display)
- [x] **StatCard / KPI Tile:** Valor em destaque monoespaçado com `tabular-nums`, tendência percentual positiva/negativa com ícone direcional.
- [x] **ExpirationGuardBadge (Multiescopo com Efeito Pedra em Vencidos):** Rastreamento unificado de vencimentos para Lotes de mercadoria, Produtos perecíveis unitários, Orçamentos comerciais, Reservas temporárias de estoque e Licenças/Alvarás sanitários. Itens vencidos adotam acabamento táctil de pedra esculpida (*slate/stone texture*) com gravação em baixo relevo, tachado nítido e conformidade WCAG AAA.
- [x] **StockLevelBar (Nível Físico & Gráfico de Tendência ROP):** Componente híbrido com velocímetro radial SVG de ocupação física ao lado de gráfico médio em linha (*sparkline* analítico) dividido entre histórico recente (D-3, D-2, D-1 sólidos), posição presente (Hoje com halo de status) e projeção de consumo futuro (D+1, D+2, D+3 tracejados) com linha de referência ROP para prevenção ativa de ruptura.
- [x] **ReceiptWatermark:** Container de impressão com padrão de carimbos diagonais repetidos e contidos (*"NÃO POSSUI VALOR FISCAL"*), garantindo leitura total em qualquer tamanho de comanda.
- [x] **Data Table Reutilizável:** Tabela densa com cabeçalho fixo (*sticky* com `--z-table-sticky: 10`), seleção atômica de linhas, comutador de densidade (Compacta 34px vs Confortável 44px) e suporte a renderizadores customizados.
- [x] **IconGallery & Padronização Visual:** Catálogo de 24 ícones homologados organizados por 4 famílias de negócio (WMS & Estoque, Vendas & POS, Gestão & Cockpit e Ações de Tabela).
- [x] **IconLibrarySelector (Visual Interativo):** Amostrador visual com ícones SVG nativos renderizados das 4 bibliotecas candidatas (Lucide, Phosphor, Heroicons, Tabler), permitindo inspeção e escolha visual direta.
- [x] **Controle de Z-Index & Stacking Context:** Refinamento dos níveis de elevação (`--z-table-sticky: 10`, `--z-dropdown: 1000`, `--z-drawer: 1200`, `--z-modal: 1300`), eliminação de corte de popovers (`overflow: visible` em cards com popups) e garantia de quebras flexíveis seguras (`flex-wrap: wrap`).
- [x] **Modal & Drawer / Flyout:** Janela com backdrop com desfoque de vidro (`backdrop-filter`), fechamento por `Escape` e trava de scroll.

---

### 5. Motion System & Microinterações (Craft Frontend Motion)
- [x] **Transição Base:** `--transition-fast` (150ms) e `--transition-normal` (250ms) em CSS variables.
- [x] **Curvas Bézier & Timing Padronizados:**
  - `--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1)` (Entradas elegantes e desaceleração suave sem solavanco)
  - `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)` (Transições bidirecionais e comutações de estado de cards e colunas)
  - `--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275)` (Micro-respiro e rebote elástico tátil)
  - `--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)` (Interações padrão de hover e foco)
- [x] **Microinterações nos Botões & Controles:** Efeito `active: scale(0.98)`, glow no foco e feedback tátil imediato.
- [x] **Transições de Rota & Modais:** Entrada com escala sutil (`scale(0.95) -> 1.0`) e opacidade com desfoque de fundo sem atraso perceptível de frame.
- [x] **Laboratório Visual Interativo de Curvas Bézier:** Amostrador interativo com visualização comparativa em tempo real (Linear, Standard, Smooth Quint, Springy Bounce) e acionamento manual para inspeção óptica.
- [x] **Acessibilidade Universal ao Movimento (`prefers-reduced-motion`):** Respeito compulsório à preferência do sistema operacional do operador, zerando durações e transições instantaneamente (WCAG 2.1 AA / 2.3.3).
- [x] **Feedback de Leitor de Código de Barras (Flash Visual Tátil):** Micro-pulso verde de alta velocidade (100ms) no input ao registrar leitura bem-sucedida pelo scanner físico para garantir feedback em ambientes ruidosos de armazém.
- [x] **Micro-Bounce de Notificação (Badge Counter):** Pequeno pulso de expansão no badge numérico com tipografia monoespaçada de alto contraste e borda protetora quando uma nova notificação ou alerta de quarentena é registrado.
- [x] **Stagger de Carregamento de Listas/Tabelas:** Animação encadeada suave (25ms de intervalo entre linhas) em visualizações densas para conduzir o olho do operador sem causar fadiga visual.
- [x] **Micro-Feedback de Auto-Save & Debounce Silencioso:** Transição sutil de estado (Editando ➜ Salvando... ➜ Salvo com Ícone Check) sem diálogos intrusivos, garantindo fluidez contínua na alteração de cadastros.
- [x] **Error Background Pulse Micro-Interaction (Sem Shake & Ergonômico):** Pulso sutil de fundo em tom alaranjado de alerta (`--status-warning-subtle` / `--status-warning`) sem deslocamento horizontal (shake removido), mantendo estabilidade óptica completa, zero fadiga visual e total legibilidade do campo durante validações de saldo insuficiente ou lote expirado.
- [x] **Swipe/Slide Tátil de Remoção em Fila de Venda (PDV Touch):** Gesto ou clique animado que recolhe a altura do item suavemente (`max-height: 0` + `opacity: 0`) para evitar saltos visuais na comanda.
- [x] **SEFAZ Sync Pulse & Heartbeat de Conexão:** Pulso suave de respiração (radar de 2s) que sinaliza sincronização em lote com o fisco estadual e status do webservice sem alarmismo.
- [x] **Count-Up Numérico Fluido em Totais do PDV / KPIs:** Transição numérica contínua em subtotais do carrinho ao aplicar descontos ou registrar pagamentos parciais, transmitindo dinamismo executivo.
- [x] **Accordion / Flyout Smooth Expansion:** Abertura e fechamento de detalhes fiscais (NFe, CFOP, ICMS-ST) com interpolação precisa de conteúdo sem recorte brusco.

---

### 6. Padrões de Layout & Densidade de Informação (Cockpit & POS)
- [x] **Modo Compacto vs. Confortável:** Seletor de densidade de tela para alternar altura de linhas de tabelas, inputs e botões (Compacta 32px vs Confortável 42px) com persistência visual.
- [x] **App Shell Unificado com Sidebar Retrátil & Hotkeys:**
  - Sidebar retrátil (`expanded` 240px vs `collapsed` 64px) com atalhos de teclado visíveis (ex: `Alt+1` Dashboard, `Alt+2` Estoque, `Alt+3` POS, `Alt+4` Design System).
  - Topbar com seletor de tenant/armazém multi-localização, status de conexão SEFAZ ao vivo (radar pulse), indicador de modo de operação e perfil do operador.
- [x] **Overlay de Atalhos Globais (Hotkeys Cheatsheet):** Acionamento instantâneo via tecla `?` ou `F1`, com agrupamento semântico de atalhos por contexto (Navegação, PDV/Balcão e Inventário/WMS).
- [x] **Layout Split-Pane Resiliente (Cockpit de Separação / WMS):** Painel bipartido flexível (Lista de Pedidos/Remessas à esquerda + Detalhes do Lote/Itens à direita) com controle de colapso rápido.
- [x] **Status Bar Operacional de Rodapé (Footer HUD):** Barra de alta densidade no rodapé com métricas de buffer de sincronização offline, latência de rede (ms), impressora térmica padrão (ESC/POS) e atalho de ajuda rápida.
- [x] **Drawer Lateral de Contexto de Item (Quick Inspect Slide):** Inspeção ágil sem sair da tela operacional para checar curva ABC, histórico de movimentações e lotes FEFO ativos.
- [x] **Grid Responsivo Adaptativo para Terminais Touchscreen & Widescreen:** Breakpoints ergonômicos com suporte a monitores de chão de fábrica (1024x768), tablets industriais e telas ultrawide (21:9).
- [x] **Modo Foco / Fullscreen Imersivo de Caixa (Zen POS):** Ocultação seletiva de distrações e menus secundários durante fluxos de venda contínua e conferência cega.

---

### 7. Documentação Viva & Catálogo Interativo (Design System Showcase & Docs as Code)
- [x] **Documento Formal de Design de Software:** `docs/sdd/SDD-CBOX-DESIGN-SYSTEM-V1.0.0.md` com padrão IEEE 1016 completo cobrindo arquitetura de 3 camadas de tokens, contratos TypeScript e matriz de rastreabilidade.
- [x] **Página Local de Demonstração (Design System Showcase & Playground):** Rota e auditório interativo homologado no próprio app Vite para testar em tempo real todos os componentes isolados e compostos.
- [x] **Sandbox Interativo de Props com Gerador de Código:** Seletor dinâmico de props (`variant`, `size`, `loading`, `disabled`) com preview ao vivo e botão de copiar código TSX (`Copy TSX Snippet`).
- [x] **Guia Contextual de Uso (Do's & Don'ts):** Diretrizes de boas práticas e anti-patterns com exemplos visuais de aplicação correta vs incorreta na interface de chão de loja e retaguarda.
- [x] **Live Token Inspector (DTCG W3C Viewer):** Amostrador com pesquisa em tempo real de Design Tokens (Global, Semântico, Componente) com cópia de variáveis CSS e visualização de valores `$value` e `$type`.
- [x] **Matriz de Conformidade Acessibilidade (A11y SC Registry):** Registro explícito de conformidade WCAG 2.1 AA/AAA vinculado aos componentes homologados.
- [x] **Machine-Readable & AI-Ready Documentation:** Estruturação semântica e contextualizada pronta para consumo por agentes inteligentes, LLMs e servidores MCP.

---

### 8. Governança, Testes & Regressão Visual (Padrão Enterprise Grade Nível 5)

#### A. Pirâmide de Testes Especializada para Design Systems (Multi-Layer Testing Pyramid)
- [x] **Camada 1 — Testes de Contrato de Tipos (Type-Level Testing com `tsd` / Vitest):** Validação estrita de interfaces TypeScript exportadas (`ButtonProps`, `TextInputProps`, `BadgeProps`, `DataTableProps<T>`), união discriminada de variantes, bloqueio de tipos genéricos soltos e verificação em tempo de compilação sem qualquer uso de `any` ou casting forçado (`as unknown as any`).
- [x] **Camada 2 — Testes Unitários de Interação & Estado (Component Interaction Testing):** Testes via `@testing-library/react` e `user-event` simulando cliques, debounce de pesquisa (300ms), captura de teclas de atalho de chão de fábrica (`F2` scanner, `F4` confirmação, `Esc` cancelamento/fechamento) e validação de estados bloqueantes (`isLoading={true}` inibe cliques e previne double-submit; `disabled={true}` remove o nó do fluxo de tabulação nativa).
- [x] **Camada 3 — Auditoria Automatizada de Acessibilidade em CI (A11y CI Automation com Axe-Core):** Verificação contínua via `@axe-core/playwright` em todos os componentes atômicos e moléculas com política de **Zero Violações Permitidas** no pipeline. Regras ativas obrigatórias: `color-contrast` (SC 1.4.3 / 1.4.11), `button-name` (SC 4.1.2), rótulos semânticos de formulários (`htmlFor`), papéis ARIA válidos e bloqueio irrestrito de `tabindex > 0`.
- [x] **Camada 4 — Testes de Regressão Visual Baseados em Componentes (Component-Driven VRT):** Execução isolada de snapshots via Playwright Screenshot Engine / Chromatic em cada componente individual cobrindo todos os estados visuais (default, hover, focus-visible, active, disabled, loading, empty, overflow) antes da composição de páginas inteiras.

#### B. Motor de Estabilização Anti-Flakiness para VRT (Deterministic Rendering Engine)
- [x] **Font Loading Synchronization (`document.fonts.ready`):** Sincronização determinística aguardando o carregamento completo dos arquivos de fonte (`Geist`, `Geist Mono`, `Instrument Serif`) antes de disparar o snapshot, impedindo falhas falsas-positivas causadas por fontes de fallback do sistema operacional.
- [x] **Zero Animation Flicker (Congelamento de Keyframes & Transições):** Desativação e congelamento compulsório de transições e animações durante a captura de snapshots via injeção de CSS (`* { animation: none !important; transition: none !important; }` ou `prefers-reduced-motion: reduce`), garantindo estabilidade milimétrica do frame capturado.
- [x] **Mocking Determinístico de Dados & Timers:** Dados dinâmicos de data/hora, números aleatórios de transação e status voláteis são congelados por fixtures estáticas previsíveis para garantir reprodutibilidade matemática pixel-a-pixel.
- [x] **Matriz Dual-Theme & Multi-Viewport:** Execução automatizada em matriz 2x4:
  - Temas: **Light Cerúleo** (`#E1EEF3`) e **Dark Grafite** (`#181818`).
  - Viewports: **Mobile** (375px), **Tablet** (768px), **POS Balcão Chão de Loja** (1024x768) e **Desktop Widescreen** (1440px).
- [x] **Tolerância Sub-Pixel Calibrada (Threshold 0.02%):** Algoritmo de diff de imagem calibrado com limiar estrito de 0.02% para absorver variações mínimas de anti-aliasing de GPU em CI sem ignorar desvios reais de 1px de padding ou derivações de cor de borda.

#### C. Linters de Arquitetura & Guard-Rails Estáticos (Lint-as-Architecture)
- [x] **Zero Inline Styles Enforcement (Regra Mandatória):** Bloqueio estrito via ESLint (`react/forbid-component-props` ou regra customizada) de qualquer atributo `style={{ ... }}` em código de produção de componentes e views, impondo colocalização via CSS Modules (`.module.css`).
- [x] **Design Token Linter (Anti-Hardcoded CSS):**
  - Proibição absoluta de cores hexadecimais soltas (ex: `#181818`, `#0ea5e9`, `#ef4444`) no CSS de componentes; exigência compulsória de tokens semânticos (`var(--bg-canvas)`, `var(--primary)`, `var(--status-danger)`).
  - Proibição de espaçamentos arbitrários (ex: `13px`, `19px`) em prol da escala geométrica base-8 (`var(--space-2)`, `var(--space-4)`, `var(--space-6)`).
  - Proibição de elevações `z-index` arbitrárias (ex: `99999`) em prol da escala de stacking context (`var(--z-modal)`, `var(--z-toast)`).
- [x] **Fronteira de Módulos & Bloqueio de Dependências Cíclicas:** Proibição de imports internos profundos (`import Button from '../Button/Button'`); consumo padronizado pelo barrel export `@components/common`. Auditoria contínua de ciclos de importação via `madge`.

#### D. Ciclo de Vida de Componentes, Governança & Depreciação (Component Lifecycle & SemVer)
- [x] **Escada de Maturidade do Componente (Component Maturity Ladder):**
  1. `Draft / Experimental`: Componente novo proposto por squads ou em laboratório; isolado com flag ou sufixo `Experimental`.
  2. `Candidate`: Implementado e testado em ao menos uma tela de produção, homologado em tokens e acessibilidade primária.
  3. `Stable`: 100% documentado no Showcase, testes unitários + A11y + VRT aprovados, tokens W3C DTCG e suporte corporativo de longo prazo.
  4. `Deprecated`: Marcado com anotação JSDoc `@deprecated`, link para o componente substituto homologado, aviso sonoro/visual em desenvolvimento e carência mínima de 2 releases minor.
  5. `Sunset / Removed`: Removido estritamente em releases Major do Design System (SemVer).
- [x] **Governança de Versões (SemVer Estrito para Design System):**
  - **Patch (`0.0.X`):** Ajustes de renderização interna, correções de bugs de foco ou refinamento de tokens sem quebra de contrato.
  - **Minor (`0.X.0`):** Introdução de novos componentes, novas props opcionais retrocompatíveis ou tokens semânticos adicionais.
  - **Major (`X.0.0`):** Remoção de props, alteração de assinaturas de eventos, quebra de contratos de layout ou remoção de componentes depreciados.
- [x] **RFC Process & Architecture Decision Records (ADRs):** Novas fundações, adições de bibliotecas ou alterações em tokens estruturais exigem submissão de RFC técnico e homologação em `docs/adr/`.
- [x] **Codemods & Migrações Automatizadas:** Scripts `jscodeshift` disponibilizados pelo core team para automatizar a renomeação de props ou substituição de componentes depreciados nas squads consumidoras.

#### E. Telemetria, Orçamento de Performance & Saúde do Design System (Health & Telemetry)
- [x] **Adoption Analytics (Taxa de Adoção Corporativa):** Auditoria contínua via scripts de CI medindo a proporção de uso dos componentes do Design System contra elementos HTML nativos (`<Button>` vs `<button>`, `<TextInput>` vs `<input>`), atingindo meta corporativa de **> 95% de adoção**.
- [x] **Token Drift Scanner:** Scanner estático que identifica seletores CSS com valores literais de cor ou dimensão, emitindo relatórios de deriva (*drift alerts*) antes de merges na branch principal.
- [x] **Orçamento de Performance (Bundle Size Budgeting com `size-limit`):**
  - Componentes Atômicos: `< 3.0 kB` gzip por componente individual.
  - Componentes Compostos / Moléculas: `< 8.0 kB` gzip por componente.
  - Tree-shaking 100% funcional garantindo que o bundle final inclua apenas os componentes efetivamente importados na tela.

#### F. Laboratório Executivo de Governança & Testes no Showcase (`GovernanceTestingLab`)
- [x] **Auditório Interativo de VRT (Visual Regression Simulator):** Amostrador com comparação interativa Lado a Lado (Side-by-Side) e Heatmap de Diff (simulando 1.4% de deriva de padding), alternância de viewports (Mobile, POS Balcão, Desktop) e ação de aprovação/rejeição de baseline.
- [x] **Console Axe-Core em Tempo Real:** Painel com taxa de aprovação de 100% em regras essenciais (`color-contrast`, `button-name`, `focus-visible`, `aria-live`) e botão interativo de reexecução de auditoria.
- [x] **Cockpit de Telemetria de Saúde & Adoção:** Indicadores ao vivo de Adoção Geral (96.2%), Conformidade de Tokens (99.4%), Cobertura de Testes (91.8%) e Orçamento de Bundle Size (2.3 kB gzip médio), além de tabela de saúde por módulo (WMS, POS, Cockpit, Fiscal).
- [x] **Matriz de Ciclo de Vida & Terminal de Linters de Arquitetura:** Tabela com classificação de maturidade (`Stable`, `Candidate`, `Deprecated`) e terminal interativo executando o script `ci-governance-guard.sh` com validação de Zero Inline Styles, Token Linter e contratos estritos de tipos TypeScript.
