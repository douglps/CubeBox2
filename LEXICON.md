# 📖 LEXICON & LINGUAGEM UBÍQUA - CUBEBOX ENTERPRISE

> **Projeto:** CubeBox Enterprise - Sistema Preditivo de Compras e Vendas para Comércio/Conveniência  
> **Versão:** 1.1.0  
> **Status:** Ativo  

---

## ☁️ Termos de Infraestrutura & Banco de Dados (Cloud & Production)

| Termo (PT-BR) | Termo Técnico (EN) | Definição Metodológica / Operacional |
| :--- | :--- | :--- |
| **Banco de Dados Híbrido** | Hybrid Database Setup | Arquitetura de persistência que opera com MySQL em produção na Oracle Cloud e mantém compatibilidade nativa com SQLite para desenvolvimento local. |
| **Pool de Conexões** | Connection Pooling | Gerenciador de conexões persistentes pré-alocadas (`pool_size`, `max_overflow`, `pool_recycle`), otimizando latência e prevenindo saturação no MySQL. |
| **Servidor Privado Virtual (VPS)** | Virtual Private Server (VPS) | Máquina virtual dedicada (ex: Ubuntu 24.04 LTS na Oracle Cloud) para hospedagem da API FastAPI e do banco MySQL. |
| **Variáveis de Ambiente** | Environment Variables (`.env`) | Parâmetros de configuração desacoplados do código-fonte (12-Factor App) para controle de credenciais, portas e origens de CORS. |


> **Projeto:** CubeBox Mini - Sistema Preditivo de Compras e Vendas para Comércio/Conveniência  
> **Versão:** 1.0.0  
> **Status:** Ativo  

---

## 📌 Termos de Negócio (Varejo & Conveniência)

| Termo (PT-BR) | Termo Técnico (EN) | Definição Operacional |
| :--- | :--- | :--- |
| **Ponto de Venda (PDV)** | Point of Sale (POS) | Interface de atendimento de balcão onde são registradas as saídas/vendas ao consumidor final. |
| **Pedido de Venda (Saída)** | Sales Order / Checkout | Registro formal da transação de saída comercial, com validação de saldo físico, baixa atômica e liquidação financeira. |
| **Pedido de Compra (Entrada)** | Purchase Order (PO) | Ordem de compra enviada ao fornecedor a partir de sugestões de IA, cujo recebimento incrementa o estoque físico. |
| **Giro de Estoque** | Inventory Turnover | Taxa na qual o estoque de um produto é vendido e reposto ao longo de determinado período. |
| **Ruptura de Estoque** | Stockout | Situação na qual um produto tem procura de compra, mas não há unidades disponíveis na loja para venda. |
| **Quebra / Avaria / Perda** | Shrinkage / Inventory Loss | Perdas físicas decorrentes de avaria, vencimento, quebra no manuseio ou furto, que exigem baixa de inventário sem receita associada. |
| **Desconto Bidirecional** | Bidirectional Discount | Cálculo automático e sincronizado onde a digitação do percentual calcula o valor monetário ou a digitação do valor calcula o percentual. |
| **Estoque Negativo (Bloqueio)** | Negative Stock Prevention | Regra rígida de integridade que impede a conclusão de saídas caso a quantidade demandada supere o estoque real disponível. |
| **Estoque de Segurança** | Safety Stock | Volume de estoque mantido como margem de proteção contra variabilidade da demanda ou atraso de fornecedor. |
| **Lead Time** | Lead Time | Tempo decorrido entre o disparo do pedido de compra ao fornecedor e a chegada física da mercadoria na loja. |
| **Sugestão de Compra** | Reorder Recommendation | Quantidade de unidades recomendada para pedido ao fornecedor baseada na projeção de vendas e estoque de segurança. |
| **SKU / Código do Item** | Stock Keeping Unit (SKU) | Identificador único de produto (código de barras ou identificador alfanumérico). |

---

## 🤖 Termos de Ciência de Dados & CRISP-DM

| Termo (PT-BR) | Termo Técnico (EN) | Definição Metodológica |
| :--- | :--- | :--- |
| **CRISP-DM** | CRISP-DM | *Cross-Industry Standard Process for Data Mining*: Metodologia em 6 fases para projetos de mineração de dados e ML. |
| **Análise Univariada** | Univariate Analysis | Análise exploratória de uma única variável por vez (medidas de tendência central, dispersão, histograma, boxplot). |
| **Análise Bivariada** | Bivariate Analysis | Análise exploratória da relação ou dependência entre duas variáveis (correlação, dispersão, tabelas cruzadas). |
| **Atributos de Defasagem** | Lag Features | Criação de colunas com valores passados da série temporal (ex: $D-1$, $D-7$) para uso em modelos tabulares. |
| **Árvore de Decisão** | Decision Tree Regressor | Algoritmo supervisionado baseado em regras hierárquicas de partição (*if/else* nos nós de decisão). |
| **Random Forest** | Random Forest Regressor | Método *ensemble* (comitê) baseado em *Bagging* de múltiplas árvores de decisão não correlacionadas. |
| **DBSCAN** | DBSCAN | *Density-Based Spatial Clustering of Applications with Noise*: Agrupamento por densidade e detetor de anomalias/outliers. |
| **Naive Bayes** | Gaussian/Categorical Naive Bayes | Classificador supervisionado fundamentado no Teorema de Bayes com suposição de independência condicional dos atributos. |
| **Serialização PKL** | Model Pickling (`.pkl`) | Persistência binária do modelo treinado em disco para reutilização em APIs de produção via `joblib` ou `pickle`. |
| **WAPE / MAE** | WAPE / MAE | Métricas de avaliação de erro: *Weighted Absolute Percentage Error* e *Mean Absolute Error*. |

---

## 🎨 Termos de Design System & Ergonomia Visual (W3C DTCG)

| Termo (PT-BR) | Termo Técnico (EN) | Definição Metodológica / Visual |
| :--- | :--- | :--- |
| **Design Tokens W3C** | W3C DTCG Design Tokens | Variáveis padronizadas em 3 camadas (Global/Primitivo, Semântico/Alias e Componente) para desacoplar e unificar o design. |
| **Dual-Theme Cerúleo/Grafite** | Dual-Theme Cerulean/Graphite | Sistema de temas sem preto e branco puros (`#000`/`#FFF`), com Modo Claro em `#E1EEF3` e Modo Escuro em `#181818`. |
| **Feedback Sem Pânico** | Anti-Panic Calm UI | Notificações com superfície neutra elevada (`--bg-surface-elevated`), borda semântica de 4px e texto de alto contraste (> 9.5:1 WCAG AAA). |
| **Tipografia Quiet Luxury** | Quiet Luxury Typography | Combinação oficial: *Instrument Serif* (Display/Títulos), *Geist* (Interface) e *Geist Mono* (Numerais/Tabelas com `tabular-nums`). |
| **Alinhamento Numérico Tabular** | Tabular Numbers (`tabular-nums`) | Alinhamento monoespaçado de dígitos para tabelas financeiras e de estoque, evitando tremor visual em atualizações. |
| **Halo de Foco** | Accessible Focus Ring | Indicação tátil de foco com anel duplo através de `:focus-visible` sem uso de `outline: none` desprotegido. |
