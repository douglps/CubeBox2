# 🗺️ ROADMAP DETALHADO - CUBEBOX MINI

> **Projeto:** CubeBox Mini - Sistema Preditivo Integrado de Compras e Vendas  
> **Metodologia Central:** CRISP-DM + Spec-Driven Development (SDD)  
> **Objetivo:** Sistema enxuto de conveniência/varejo integrando Árvore de Decisão, Random Forest, DBSCAN, Naive Bayes e Serialização `.pkl` em arquitetura Full-Stack (FastAPI + React).

---

## 📅 Visão Geral das Fases

```
[FASE 1: Setup & Extração da Base] ──▶ [FASE 2: CRISP-DM EDA (Univariada/Bivariada)]
                  │                                             │
                  ▼                                             ▼
[FASE 3: Engenharia de Features & ML] ──▶ [FASE 4: Backend FastAPI & Model Serving]
                  │                                             │
                  ▼                                             ▼
[FASE 5: Frontend Cockpit SPA (React)] ──▶ [FASE 6: Validação, Testes & Defesa 360°]
                                                                │
                                                                ▼
                                              [FASE 7: CubeBox 2.0 Enterprise UX & Expansão]
```


---

## 🚀 FASE 1: Setup do Projeto & Extração de Dados
- [x] **1.1 Estrutura do Monorepo & Documentação Base:**
  - Inicializar estrutura de pastas: `backend/`, `frontend/`, `data/`, `notebooks/`, `docs/`.
  - Configurar governança com SDD formal ([SDD-CBOX-DATA-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-DATA-V1.0.0.md)), catálogo de requisitos BDD ([README.md](file:///c:/Dev/CubeBox2/docs/requirements/README.md)) e User Stories modulares ([US-DATA-01](file:///c:/Dev/CubeBox2/docs/requirements/01-data-pipeline/US-DATA-01-raw-synthetic-generator.md), [US-DATA-02](file:///c:/Dev/CubeBox2/docs/requirements/01-data-pipeline/US-DATA-02-data-cleaning-pipeline.md)).
  - Configurar ambiente virtual Python (`requirements.txt`).
- [x] **1.2 Extração, Poluição e Limpeza da Base de Dados:**
  - Catálogo de conveniência com 20 SKUs representativos (Cervejas, Energéticos, Refrigerantes, Snacks, Doces, Gelo/Carvão, Tabacaria, Higiene).
  - Geração de base sintética deliberadamente poluída com 180 dias de histórico temporal (`data/raw/vendas_conveniencia_raw.csv` com 63.646 registros).
  - Execução do pipeline de sanitização e auditoria (`data/processed/vendas_conveniencia_clean.csv` com 61.873 registros e relatório em `data/audit/cleaning_report.json`).

---

## 🔬 FASE 2: Ciclo CRISP-DM - Entendimento dos Dados (EDA)
- [x] **2.1 Documento de Entendimento do Negócio & Especificação da EDA:**
  - `docs/01-business-understanding.md`: formulação do trade-off entre ruptura de estoque e custo de capital parado. *(Concluído)*
  - Especificação Técnica: [SDD-CBOX-EDA-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-EDA-V1.0.0.md) *(Concluído)*
  - Requisitos BDD: [US-EDA-01](file:///c:/Dev/CubeBox2/docs/requirements/02-exploratory-analysis/US-EDA-01-univariate-analysis.md) e [US-EDA-02](file:///c:/Dev/CubeBox2/docs/requirements/02-exploratory-analysis/US-EDA-02-bivariate-analysis.md) *(Concluído)*
- [x] **2.2 Notebook de Análise Univariada:**
  - `notebooks/01_analise_univariada.ipynb`:
    - Medidas resumo (média, mediana, desvio padrão, assimetria, curtose).
    - Histogramas e gráficos de densidade (KDE) da quantidade vendida por transação.
    - Boxplots para identificação visual de dispersão e outliers.
    - Distribuição de frequência das categorias e formas de pagamento. *(Concluído e executado)*
- [x] **2.3 Notebook de Análise Bivariada:**
  - `notebooks/02_analise_bivariada.ipynb`:
    - Vendas x Dia da Semana (captura do efeito fim de semana / sazonalidade de conveniência).
    - Vendas x Preço Unitário (elasticidade simples / correlação de Pearson e Spearman).
    - Matriz de Correlação com Heatmap entre variáveis numéricas.
    - Gráfico de dispersão (*Scatter Plot*) entre estoque atual e velocidade de saída. *(Concluído e executado)*

---

## 🧠 FASE 3: Modelagem de Machine Learning & Serialização (`.pkl`)
- [x] **3.0 Especificação Técnica e Requisitos de ML:**
  - Arquitetura & Heurística de Modelagem: [SDD-CBOX-ML-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-ML-V1.0.0.md) *(Concluído)*
  - Requisitos BDD: [US-ML-01](file:///c:/Dev/CubeBox2/docs/requirements/03-predictive-modeling/US-ML-01-feature-engineering.md) (Features), [US-ML-02](file:///c:/Dev/CubeBox2/docs/requirements/03-predictive-modeling/US-ML-02-demand-forecasting.md) (Regressão), [US-ML-03](file:///c:/Dev/CubeBox2/docs/requirements/03-predictive-modeling/US-ML-03-dbscan-clustering.md) (DBSCAN) e [US-ML-04](file:///c:/Dev/CubeBox2/docs/requirements/03-predictive-modeling/US-ML-04-naive-bayes-risk.md) (Naive Bayes) *(Concluído)*
- [x] **3.1 Preparação dos Dados (Data Preparation):**
  - Criação de agregados diários por SKU.
  - Engenharia de *Lag Features*: Vendas em $D-1$, $D-2$, $D-7$ e média móvel dos últimos 7 dias.
  - Separação treino/teste temporal (*Time-based Split*, 80% passado para treino, 20% recente para teste) em [features.py](file:///c:/Dev/CubeBox2/backend/app/ml/features.py). *(Concluído)*
- [x] **3.2 Modelos Supervisionados de Regressão (Previsão de Demanda):**
  - **Árvore de Decisão (DecisionTreeRegressor):** Treinamento, baseline e avaliação de erro.
  - **Random Forest (RandomForestRegressor):** Treinamento e redução de variância.
  - Comparativo acadêmico formal entre Árvore vs. Random Forest usando $MAE$, $RMSE$ e $WAPE$ ($WAPE$ reduzido de 24.47% para 23.64%). *(Concluído)*
- [x] **3.3 Modelo Não-Supervisionado de Segmentação (DBSCAN):**
  - Aplicação do **DBSCAN** com variáveis: *Média de Vendas Diárias*, *Volatilidade (Desvio Padrão)* e *Margem de Lucro*.
  - Identificação de clusters de giro e detecção de anomalias/outliers (3 clusters e 3 outliers identificados). *(Concluído)*
- [x] **3.4 Modelo de Classificação de Risco (Naive Bayes):**
  - Aplicação de **Gaussian Naive Bayes** para prever a probabilidade de ruptura (*Risco Alto*, *Médio* ou *Baixo*). *(Concluído)*
- [x] **3.5 Serialização dos Modelos:**
  - Exportação dos modelos campeões via `joblib.dump`:
    - `models/regressor_random_forest.pkl`
    - `models/cluster_dbscan.pkl`
    - `models/classifier_naive_bayes.pkl`
    - `models/metadata.json` *(Concluído)*

---

## ⚡ FASE 4: Backend FastAPI & Model Serving
- [x] **4.0 Especificação Técnica e Requisitos da API:**
  - Arquitetura & Contratos REST: [SDD-CBOX-API-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-API-V1.0.0.md) *(Concluído)*
  - Requisitos BDD: [US-API-01](file:///c:/Dev/CubeBox2/docs/requirements/04-backend-api/US-API-01-crud-products-sales.md) (Operacional, Bloqueio de Estoque Negativo & Desconto Bidirecional) e [US-API-02](file:///c:/Dev/CubeBox2/docs/requirements/04-backend-api/US-API-02-model-serving-reorder.md) (Model Serving & Compras) *(Concluído)*
- [x] **4.1 Banco de Dados Relacional Enxuto (SQLite / SQLAlchemy):**
  - Modelos canônicos: `Product` (catálogo, estoque atual, mínimo, lead time), `Sale` e `SaleItem` (pedidos de saída de balcão), `PurchaseOrder` (pedidos de compra e recebimento de fornecedor) e `InventoryLoss` (registro de quebras, avarias e vencimentos). *(Concluído em [models.py](file:///c:/Dev/CubeBox2/backend/app/models.py) e seed em [init_db.py](file:///c:/Dev/CubeBox2/backend/app/init_db.py))*
- [x] **4.2 Endpoints CRUD Operacionais & Regras Rígidas:**
  - `/api/products`: listagem e consulta de estoque.
  - `/api/sales`: registro de pedido de venda com bloqueio rígido de saldo negativo e cálculo atômico de desconto bidirecional.
  - `/api/inventory/loss`: baixa formal de estoque por quebra/avaria sem faturamento.
  - `/api/purchases`: emissão e confirmação de recebimento de ordens de compra.
  - `/api/dashboard/kpis`: KPIs agregados (faturamento líquido, pedidos, perdas por quebras, produtos em estoque crítico). *(Concluído e 100% testado)*
- [x] **4.3 Endpoints Preditivos & Inteligência (Model Serving):**
  - Carregamento na inicialização da API dos arquivos `.pkl` salvos via Lifespan.
  - `/api/ml/forecast`: inferência com o Random Forest para previsão dos próximos 7/14 dias.
  - `/api/ml/reorder-suggestions`: cálculo da fórmula de sugestão de compra incorporando histórico de quebras.
  - `/api/ml/clusters`: retorno dos clusters e anomalias calculados pelo DBSCAN.
  - `/api/ml/risk`: probabilidade de ruptura calculada pelo Naive Bayes. *(Concluído e 100% testado)*

---

## 💻 FASE 5: Frontend Cockpit SPA & Design System Enterprise (React + TypeScript + Vite)
- [x] **5.0 Especificação Técnica, Telas e Design System:**
  - Arquitetura de Interface & Componentes: [SDD-CBOX-UI-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-UI-V1.0.0.md) *(Concluído)*
  - Especificação Formal do Design System (IEEE 1016): [SDD-CBOX-DESIGN-SYSTEM-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-DESIGN-SYSTEM-V1.0.0.md) *(Concluído)*
  - Matriz de Maturidade do Design System: [DESIGN-SYSTEM-MATURITY.md](file:///c:/Dev/CubeBox2/docs/DESIGN-SYSTEM-MATURITY.md) *(Concluído)*
  - Guia Completo das Telas: [02-telas-cockpit-guia.md](file:///c:/Dev/CubeBox2/docs/02-telas-cockpit-guia.md) *(Concluído)*
  - Requisitos BDD: [US-UI-01](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-01-pos-and-dashboard.md) (PDV/Dashboard) e [US-UI-02](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-02-predictive-cockpit.md) (Cockpit Preditivo) *(Concluído)*
- [x] **5.1 Infraestrutura de Design Tokens W3C DTCG & Dual-Theme:**
  - Tokens fundacionais implantados em [variables.css](file:///c:/Dev/CubeBox2/frontend/src/styles/variables.css).
  - Tema Claro Cerúleo (`#E1EEF3` fundo, `#EDF5F8` superfície) e Tema Escuro Grafite (`#181818` canvas, `#242424` superfícies), sem preto/branco absolutos (`#000`/`#FFF`).
  - Escala geométrica base-4/8, stacking context (`--z-index`), halos de foco e opacidades semânticas.
  - Tipografia Quiet Luxury (*Instrument Serif*, *Geist*, *Geist Mono* com `tabular-nums`).
  - Curvas de aceleração de hardware e desativação com `@media (prefers-reduced-motion: reduce)`.
- [x] **5.2 Setup da Aplicação Frontend:**
  - Inicialização Vite + React 19 + TypeScript + CSS Modules puros. *(Concluído)*
  - Ícones com Lucide-React e gráficos analíticos com Recharts. *(Concluído)*
- [x] **5.3 Biblioteca de Componentes Atômicos & Operacionais (UI/DS):**
  - Botões ([Button.tsx](file:///c:/Dev/CubeBox2/frontend/src/components/common/Button.tsx) com variantes, loading, hotkeys operacionais). *(Concluído)*
  - Badges semânticos anti-pânico com borda lateral de 4px ([Badge.tsx](file:///c:/Dev/CubeBox2/frontend/src/components/common/Badge.tsx)). *(Concluído)*
  - Campos de entrada monetária e busca instantânea ([TextInput.tsx](file:///c:/Dev/CubeBox2/frontend/src/components/common/TextInput.tsx), [SearchInput.tsx](file:///c:/Dev/CubeBox2/frontend/src/components/common/SearchInput.tsx), [CurrencyInput.tsx](file:///c:/Dev/CubeBox2/frontend/src/components/common/CurrencyInput.tsx)). *(Concluído)*
  - Tabelas de alta densidade com cabeçalho fixo ([DataTable.tsx](file:///c:/Dev/CubeBox2/frontend/src/components/common/DataTable.tsx)). *(Concluído)*
  - Shell da aplicação ([AppShell.tsx](file:///c:/Dev/CubeBox2/frontend/src/components/layout/AppShell.tsx), [Modal.tsx](file:///c:/Dev/CubeBox2/frontend/src/components/common/Modal.tsx)). *(Concluído)*
- [x] **5.4 Tela 1: Dashboard Executivo:**
  - Cards de KPIs (Faturamento Líquido, Total de Pedidos, Perdas por Avaria, Itens em Risco de Ruptura).
  - Gráfico de área/linha temporal com histórico de vendas. *(Concluído em [DashboardView.tsx](file:///c:/Dev/CubeBox2/frontend/src/views/DashboardView.tsx))*
- [x] **5.5 Tela 2: PDV / Caixa (Pedidos de Saída):**
  - Interface ágil com validação visual de saldo (bloqueio rígido de estoque negativo).
  - Motor de cálculo bidirecional de desconto (%) <-> (R$). *(Concluído em [PosView.tsx](file:///c:/Dev/CubeBox2/frontend/src/views/PosView.tsx))*
- [x] **5.6 Tela 3: Controle de Estoque & Gestão de Quebras:**
  - Tabela com estoque físico atual, custo e badge de cluster gerado pelo DBSCAN.
  - Modal de registro de quebras e avarias com impacto imediato no estoque. *(Concluído em [InventoryView.tsx](file:///c:/Dev/CubeBox2/frontend/src/views/InventoryView.tsx))*
- [x] **5.7 Tela 4: Central de Inteligência Preditiva & Compras:**
  - Gráfico interativo com Linha Real vs. Projeção do Random Forest.
  - Tabela de Sugestão de Compra com indicação da Probabilidade de Ruptura (Naive Bayes).
  - Botão "Aprovar Pedido de Compra" e aba de "Confirmar Recebimento Físico" da mercadoria. *(Concluído em [PredictiveView.tsx](file:///c:/Dev/CubeBox2/frontend/src/views/PredictiveView.tsx))*

---

## 🎓 FASE 6: Relatórios, Documentação & Defesa 360°
- [x] **6.1 Relatório Final do CRISP-DM:**
  - Documentação completa em [CRISP-DM-RELATORIO.md](file:///c:/Dev/CubeBox2/docs/CRISP-DM-RELATORIO.md) cobrindo as 6 etapas formais. *(Concluído)*
- [x] **6.2 Guia de Apresentação & Defesa Acadêmica:**
  - Roteiro passo a passo com minutagem e pontos-chave para demonstração perante a banca em [GUIA-APRESENTACAO.md](file:///c:/Dev/CubeBox2/docs/GUIA-APRESENTACAO.md). *(Concluído)*
- [x] **6.3 Scripts de Inicialização Automática:**
  - Script para rodar backend e frontend simultaneamente em [start.bat](file:///c:/Dev/CubeBox2/start.bat). *(Concluído)*

---

## 💎 FASE 7: CubeBox 2.0 Enterprise UX & Expansão Comercial (Nível Ouro/Diamante)

> **Documento Diretor de Arquitetura:** [SDD-CBOX-UI-V2.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-UI-V2.0.0.md)  
> **Requisitos Ativos:** [US-UI-03](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-03-layout-and-smart-inputs.md), [US-UI-04](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-04-products-and-customers-crm.md), [US-UI-05](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-05-inventory-hub-and-orders-history.md)

- [x] **7.1 Layout Cinemático, Rail Colapsável & Ergonomia Global (US-UI-03):**
  - Header 100% full-width com comportamento *Smart Sticky* (oculta suavemente ao rolar para baixo, reaparece ao rolar para cima).
  - Identidade visual com Logotipo e Nome fixados à esquerda do Header.
  - Alternador único de Tema Dark/Light no Header (eliminação de redundâncias no Aside e rodapé).
  - Sidebar Aside 100% de altura com modo Rail colapsável (68px).
  - Padrão de Ergonomia Visual para Atalhos: atalhos de teclado são exibidos estritamente em **tooltips flutuantes** ao passar o cursor ou focar pelo teclado (`Alt+1..7`, atalhos de botões e seletores), eliminando poluição visual estática dos rótulos principais.
  - Remoção de link de Design System da navegação de produção e eliminação do seletor de densidade.
  - Componente de inputs com botão `X` de limpeza e atalho `[Esc]` universal.
  - Suporte a `ArrowUp` e `ArrowDown` em inputs numéricos.
  - Campos numéricos com digitação à direita e máscara dinâmica gradual estilo bancário/ATM (`BankingNumberInput`).
  - Tabelas e listas com cor de fundo intercalada suave (*Zebra Striping* WCAG 2.1 AA). *(Concluído)*

- [x] **7.2 Catálogo de Produtos Expandido & Gestão Comercial (US-UI-04):**
  - Expansão do banco de dados com marcas reais e consagradas do varejo brasileiro (Coca-Cola, Heineken, Camil, Omo, Nestlé, Red Bull, etc.) e auto-migração de schema SQLite.
  - Endpoints REST completos no FastAPI: `POST /api/products`, `PUT /api/products/{id}`, `PATCH /api/products/{id}/status`, `DELETE /api/products/{id}` com salvaguarda de integridade referencial.
  - Nova Tela Dedicada: **Catálogo de Produtos (`ProductsView.tsx`)**:
    - Cadastro e edição com cálculo dinâmico de margem de lucro, markup e lucro bruto unitário em tempo real.
    - Ação de **Congelar / Descongelar** produto (bloqueia no PDV sem corromper vendas históricas).
    - Tabela de alta densidade com busca em tempo real e filtros de categoria e status. *(Concluído)*

- [x] **7.3 CRM de Clientes & Integração no Balcão (US-UI-04):**
  - Modelo relacional `Customer` e migração no SQLite/SQLAlchemy.
  - Endpoints REST no FastAPI: `GET /api/customers`, `POST /api/customers`, `PUT /api/customers/{id}` com cálculo agregado de Lifetime Value (LTV).
  - Nova Tela Dedicada: **Clientes & Fidelidade (`CustomersView.tsx`)**:
    - Gestão de clientes com busca por CPF, Nome e Telefone.
    - Histórico de pedidos e indicador de Lifetime Value (LTV).
  - Integração no PDV (`PosView.tsx`):
    - Campo de identificação de cliente na venda com vínculo de CRM no cupom fiscal.
    - Digitação direta de quantidade no PDV e bloqueio visual/operacional imediato de produtos congelados. *(Concluído)*

- [x] **7.3.1 Refinamento de Layout Cinemático, Rodapé Fixo & Tooltips de Atalhos (US-UI-03):**
  - Eliminação da faixa vazia no recolhimento do Header Smart Sticky através de colapso de margem sincronizado (`margin-top: -60px`), permitindo que a view ocupe 100% da viewport.
  - Rodapé Fixed HUD Dock ancorado permanentemente na base da tela com scroll exclusivo na view de conteúdo.
  - Política de Atalhos em Tooltips Flutuantes: remoção de atalhos estáticos poluindo a interface (`Alt+1..7`, `Alt+T`) e exibição estrita em tooltips contextuais com camada elevada (`z-index: 1200`) e proteção contra corte por overflow. *(Concluído)*

- [x] **7.4 Hub de Estoque por Categoria, Histórico de Vendas & Explicabilidade de IA (US-UI-05):**
  - Reestruturação do Estoque em dois níveis:
    - Grid de **Cards por Categoria** com métricas consolidadas (Valor Investido, Alertas de Ruptura, Itens Críticos).
    - Card Master em destaque: **"Todas as Categorias"**.
    - Tela de Drilldown com filtros rápidos por status de estoque e ações em lote.
  - Nova Tela Dedicada: **Histórico de Pedidos de Venda (`OrdersHistoryView.tsx`)**:
    - Tabela de vendas com detalhes dos itens, forma de pagamento e descontos.
    - Impressão/espelho de cupom de 80mm formatado para impressora térmica/PDF.
    - Ação de cancelamento e estorno atômico com devolução ao estoque (`POST /api/sales/{id}/cancel`).
  - Central Preditiva 2.0 & Explicabilidade de IA (XAI):
    - Projeção de demanda consolidada geral da loja.
    - Modal comparador de projeções multi-item (até 5 produtos simultâneos).
    - Selo/Ícone de IA (`XaiBadge`) com tooltip explicativo detalhando: modelo em uso (*Random Forest*, *Naive Bayes*, *DBSCAN*), métricas de acurácia e variáveis consideradas. *(Concluído)*
  - Shell & UX Motion Resiliente:
    - Eliminação de tremor (*jitter/flicker*) no recolhimento do Smart Sticky Header com histerese direcional, trava de fim de página (*bottom boundary guard*) e transição suave sem saltos de layout. *(Concluído)*

- [x] **8.0 Higienização de Dados, CRM com Endereçamento & PDV Inteligente (US-DATA-03 / US-UI-06):**
  - **Pipeline de Ingestão e Tratamento de Dados (Data Cleansing):**
    - Saneamento de falhas importadas intencionalmente (CPFs corrompidos, nomes em caixa alta arbitrária, telefones sem DDD).
    - Canonicidade no armazenamento (apenas dígitos numéricos para documentos e telefones).
    - Validador oficial de Módulo 11 para CPF/CNPJ e formatação de saída.
  - **CRM Enriquecido com Endereçamento para Entrega:**
    - Expansão da tabela `customers` com campos de endereço (CEP, logradouro, número, complemento, bairro, cidade, UF, referência).
    - Integração de busca automática por CEP (ViaCEP).
  - **PDV com Modal de Busca & Fidelização:**
    - Substituição do seletor estático por modal de busca rápida (Nome, Telefone, Documento com debounce de 250ms e atalho `F7`).
    - Card de perfil com LTV, indicadores de compras e histórico de pedidos pregressos.
    - **Repetição de Compra com 2 Cliques:** Seleção da compra histórica, verificação de saldo em estoque físico em tempo real (aviso caso estoque seja inferior ou insuficiente) e transferência instantânea para o carrinho fechando o modal.
  - **Módulo de Entrega e Taxa:**
    - Alternador de modalidade (*Retirada no Balcão* vs. *Entrega*).
    - Taxa de entrega automática com default de R$ 12,00 e possibilidade de edição manual.
  - **Emissão com CPF na Nota:**
    - Toggle para emissão com documento fiscal. Puxa do cadastro ativo se higienizado, com liberdade para alteração/digitação avulsa no momento da venda.
  - **Série Temporal Realista (90 Dias):**
    - Geração sintética contínua de 90 dias com sazonalidade para municiar a Central Preditiva e aprendizado de máquina.
  - **Segurança & Formulários:**
    - Máscaras reativas no frontend, regex defensivo, sanitização contra XSS e ajuste dos checkboxes nas tabelas (desativar `selectable` padrão desnecessário). *(Concluído)*


