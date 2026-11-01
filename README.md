# 📦 CubeBox Mini — Sistema Preditivo Integrado de Compras e Vendas

> **Trabalho Aplicado de Curso:** Ciência de Dados & Desenvolvimento Full-Stack  
> **Metodologia:** CRISP-DM (*Cross-Industry Standard Process for Data Mining*) + SDD (*Spec-Driven Development*)  
> **Stack:** React 19 + TypeScript + FastAPI + SQLAlchemy (MySQL em Produção na Oracle Cloud / SQLite Local) + Scikit-Learn + Joblib

---

## 🎯 Objetivo do Projeto
Resolver o principal desafio de gestão em comércios de conveniência: **o equilíbrio entre a ruptura de estoque (falta de produto na gôndola) e o custo de capital parado (excesso de compras)**.

O sistema integra em uma única solução:
1. **Operação Básica & Catálogo Realista Expandido (93 SKUs em 13 Categorias):**
   - Catálogo cobrindo linhas completas de **Cervejas**, **Vinhos & Espumantes**, **Refrigerantes & Bebidas**, **Energéticos & Isotônicos**, **Destilados & Drinks Prontos**, **Tabacaria & Cigarros**, **Snacks & Salgados**, **Congelados & Refeições Rápidas**, **Doces & Chocolates**, **Gelo e Carvão (Churrasco)**, **Higiene Pessoal**, **Mercearia Express** e **Limpeza**.
   - Formas de pagamento estritamente alinhadas ao PDV: **PIX**, **Cartão Débito**, **Cartão Crédito**, **Dinheiro** e **Pagamentos Múltiplos (Splits no Caixa)**.
   - Dinâmica de consumo real com **Outliers de Ticket e Cesta**: cestas de churrasco, confraternizações corporativas, adega VIP e compras de impulso (tickets de R$ 1,53 a R$ 983,40).
2. **Ciclo CRISP-DM Completo:**
   - **Análise Univariada:** Distribuição de vendas, medidas estatísticas, dispersão e assimetria.
   - **Análise Bivariada:** Relação com dia da semana, elasticidade preço-volume e matriz de correlação.
   - **Modelagem Preditiva:**
     - **Árvore de Decisão** vs. **Random Forest** (Regressão para previsão numérica de demanda, modelo campeão com WAPE 23.64%).
     - **DBSCAN** (Agrupamento não-supervisionado para classificação de giro e detecção de anomalias/outliers).
     - **Regressão Logística Multinomial** (Classificação calibrada de risco de ruptura, F1-Score 64.57%, elevando o baseline Naive Bayes).
   - **Serialização (`.pkl`):** Persistência dos modelos treinados com `joblib`.
3. **Serviço de Inteligência, Ergonomia Operacional & Master-Detail (v2.2.0):**
   - **Modais com Área Útil Expandida (>= 60%):** Sistema de dimensionamento no `ModalDrawer` (`size="lg"` ocupando ~65% e `size="xl"` ~75%), garantindo preenchimento confortável de cadastros de produtos e clientes.
   - **Master-Detail em Clientes:** Ao selecionar um cliente na tabela, a tela divide-se lateralmente para apresentar dados cadastrais, endereço completo, métricas de RFM/LTV e histórico de pedidos no `CustomerDetailPane`.
   - **Modal de Identificação & Recompra no PDV em 2 Colunas:** Busca instantânea à esquerda e painel de histórico de compras à direita no `CustomerSelectModal`, exibindo resumo com nomes comerciais, quantidades, data, forma de pagamento, endereço resumido e botão **"Ver Nota"** com espelho de cupom 80mm unificado (`ReceiptModal`).
   - **Projeção Preditiva Multi-Item:** Seleção de produtos via modal com cards visuais ricos e eixo temporal com datas do calendário real futuro e linhas individuais por SKU com diferenciação cromática acessível (WCAG 2.1 AA).
   - **Barra de Ações em Lote (Batch Actions):** Docking contextual acionado ao selecionar linhas em tabelas (`DataTable`), permitindo congelamento, ativação e exportações em lote com contadores.
   - **Telemetria de Sistema & Relógio HUD:** Latência e data/hora (`HH:MM`) em tempo real no rodapé fixo (`footerHud`), liberando o cabeçalho.
   - **Humanização de Microcopy & Progressive Disclosure:** Explicações claras e ícones de ajuda `(?)` com tooltips orientados ao lojista.
   - **Visualização de Dados com Tooltips Compactos e Resilientes (`CompactChartTooltip`):** Resolução para gráficos de séries temporais com Progressive Disclosure (Top N ordenado decrescentemente + consolidação de excedentes em linha de "Outros"), destaque contextual na série em foco (`hoveredSeriesKey`), alinhamento numérico tabular (`tabular-nums`) e zero oclusão da área de plotagem.
   - **PDV Otimizado & CRM Ágil Multi-Endereço:** Comanda alargada para `420px`, botão de ação rápida `+ Novo` no cabeçalho de clientes com formulário enxuto *in-place*, obrigatoriedade de telefone (mínimo 10 dígitos), suporte a $0$ ou múltiplos endereços por cliente com definição dinâmica do endereço padrão (`is_default`), e validação estrita que bloqueia pedidos de entrega sem endereço associado.

---

## 💡 Diretriz de Código: Documentação Didática (Para Leigos)
Todo código deste repositório (scripts, notebooks, endpoints FastAPI e componentes React) segue a regra de **explicação acessível para leigos**, conforme definido em [.agents/rules/didactic-code-comments.md](file:///c:/Dev/CubeBox2/.agents/rules/didactic-code-comments.md):
- **Cabeçalho explicativo:** contextualiza a utilidade prática do arquivo no negócio.
- **Passo a passo numerado:** divide tarefas complexas em etapas simples.
- **Analogias do cotidiano:** traduz termos técnicos para situações reais de comércio e varejo.


---

## 📂 Estrutura do Projeto

```text
CubeBox2/
├── .gitignore
├── README.md                      # Documento principal
├── ROADMAP.md                     # Cronograma e checklist detalhado de entrega
├── LEXICON.md                     # Dicionário de termos do negócio e dados
├── data/                          # Datasets limpos e prontos para treino e simulação
├── docs/                          # Documentação das fases do CRISP-DM
│   ├── 01-business-understanding.md
│   ├── analise_univariada.md
│   ├── analise_bivariada.md
│   └── CRISP-DM-RELATORIO.md
├── notebooks/                     # Notebooks Jupyter das etapas de Ciência de Dados
│   ├── 01_analise_univariada.ipynb
│   ├── 02_analise_bivariada.ipynb
│   └── 03_modelagem_e_serializacao.ipynb
├── models/                        # Artefatos .pkl serializados para produção
│   ├── regressor_random_forest.pkl
│   ├── cluster_dbscan.pkl
│   ├── classifier_risk.pkl
│   ├── classifier_naive_bayes.pkl (retrocompatibilidade)
│   └── metadata.json
├── backend/                       # API REST FastAPI + Banco de Dados Híbrido (MySQL/SQLite)
│   ├── app/
│   │   ├── config.py              # Gerenciador de Variáveis de Ambiente (.env)
│   │   ├── main.py
│   │   ├── database.py            # Engine SQLAlchemy (MySQL Oracle / SQLite)
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routers/
│   └── requirements.txt
├── .env.example                   # Template oficial de variáveis de ambiente
└── frontend/                      # Interface SPA React + TypeScript + CubeBox Design System
    ├── src/
    │   ├── styles/
    │   │   └── variables.css      # Design Tokens W3C DTCG & Dual-Theme (Cerúleo / Grafite)
    │   ├── components/
    │   └── views/
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Como Executar o Projeto

### ⚡ Modo Laboratório Completo (Recomendado)
Para derrubar processos antigos nas portas 8000 e 5173, validar o build do frontend, verificar o banco de dados SQLite e subir o sistema completo com interface amigável:

```bash
npm run lab
```

> **Dica:** Para subir sem recompilar o frontend (inicialização instantânea), use:
> ```bash
> npm run lab:fast
> ```

---

### 1. Ambiente Virtual Python (Backend & ML)
```bash
# Ativar o ambiente virtual
# No Windows PowerShell:
.\backend\.venv\Scripts\Activate.ps1

# Executar a geração e atualização dos notebooks de EDA:
python backend/scripts/generate_eda_notebooks.py

# Treinar e serializar os modelos de Machine Learning (.pkl):
python backend/scripts/train_ml_pipeline.py
```

### 2. Notebooks Interativos (Jupyter)
```bash
jupyter lab notebooks/
```
- [01_analise_univariada.ipynb](file:///c:/Dev/CubeBox2/notebooks/01_analise_univariada.ipynb): Estatísticas descritivas, densidade KDE, Tukey e Pareto.
- [02_analise_bivariada.ipynb](file:///c:/Dev/CubeBox2/notebooks/02_analise_bivariada.ipynb): Sazonalidade temporal, correlação multivariada e giro vs. volatilidade.

---

## 📚 Documentação Técnica & Arquitetura (SDD)
Consulte as especificações formais em [`docs/sdd/`](file:///c:/Dev/CubeBox2/docs/sdd/):
- [SDD-CBOX-CLASS-MODEL-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-CLASS-MODEL-V1.0.0.md): **Modelagem Orientada a Objetos e Diagrama de Classes UML (IEEE 1016)**.
- [SDD-CBOX-API-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-API-V1.0.0.md): Backend FastAPI, Model Serving e Persistência Híbrida (MySQL na Oracle Cloud / SQLite local).
- [SDD-CBOX-CRM-PDV-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-CRM-PDV-V1.0.0.md): Arquitetura do CRM e PDV Multi-Endereço.


