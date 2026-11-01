# 📊 RELATÓRIO DO CICLO CRISP-DM — CUBEBOX MINI

> **Projeto:** CubeBox Mini — Sistema Preditivo Integrado de Compras e Vendas  
> **Status:** Concluído e Validado  
> **Metodologia:** Cross-Industry Standard Process for Data Mining (CRISP-DM)  
> **Data:** 2026-10-31  

---

## 1. 🎯 Entendimento do Negócio (Business Understanding)

### 1.1 Problema Central
No segmento de conveniência e varejo de proximidade, o lojista enfrenta um trade-off crítico diário:
- **Custo de Ruptura (Stockout):** A falta de produtos de impulso (cervejas, energéticos, gelo, carvão) resulta em perda imediata de faturamento e frustração do consumidor, que migra para o concorrente.
- **Custo de Excesso & Quebra:** A superestocagem imobiliza capital de giro e potencializa perdas por shelf life vencido e avarias no manuseio.

### 1.2 Objetivos do Sistema
1. Automatizar a projeção de demanda diária para o horizonte de reposição (7 dias à frente).
2. Segmentar o catálogo por velocidade de saída e margem de lucro.
3. Quantificar a probabilidade de ruptura por SKU para tomada de decisão preventiva.
4. Unificar caixa (PDV), controle de avarias e emissão de ordens de compra em um único Cockpit.

---

## 2. 🔍 Entendimento dos Dados (Data Understanding)

### 2.1 Coleta e Auditoria da Base
- Histórico temporal de 180 dias de operações de conveniência gerado e higienizado:
  - Base bruta com 143.118 transações (`data/raw/vendas_conveniencia_raw.csv`);
  - Base tratada, sanitizada e auditada com **139.031 registros** válidos (`data/processed/vendas_conveniencia_clean.csv`, taxa de integridade de 97,14%);
  - Banco operacional transacional com 8.509 vendas consolidadas e 15.618 itens em `data/cubebox.db`.
- **93 SKUs** ativos distribuídos em 13 categorias de produtos: Cervejas, Refrigerantes, Vinhos, Destilados, Tabacaria e Afins, Doces, Congelados, Snacks, Energéticos, Gelo e Carvão, Higiene Pessoal, Mercearia e Limpeza.

### 2.2 Descobertas da Análise Exploratória (EDA)
- **Análise Univariada:**
  - Ticket médio de R$ 20,66 (mediana de R$ 11,50) e cauda longa com valor máximo de R$ 759,60 em compras coletivas (*skewness* de +6,20 e curtose de 60,52).
  - Concentração de Pareto (80/20): As categorias Cervejas (21,73%), Refrigerantes (16,37%), Vinhos (13,89%), Destilados (10,30%), Tabacaria (9,73%) e Doces (8,06%) concentram 80% do faturamento da loja.
  - Meios de pagamento instantâneos dominam a operação: PIX (46,67%) e Cartões (43,59%) somam mais de 90% das transações.
- **Análise Bivariada:**
  - **Sazonalidade Semanal:** Média diária de R$ 13.116,87 de segunda a quinta vs. R$ 19.674,87 de sexta a domingo (+50,0% de incremento nos fins de semana).
  - **Padrão Horário e Turnos:** O turno noturno (18h às 23h) concentra 60,69% de todas as transações e 61,43% do faturamento total.
  - **Giro Médio x Volatilidade:** Dispersão mapeada entre os 93 SKUs separando claramente itens de alta densidade e estabilidade (cervejas em lata) de itens com forte volatilidade de fim de semana (gelo e carvão) e itens de alto valor unitário e baixa frequência (vinhos e destilados).

---

## 3. 🧪 Preparação dos Dados (Data Preparation)

- Agregação por SKU e data com regularização de grade temporal diária.
- **Engenharia de Features:**
  - *Lags temporais*: $D-1$, $D-2$, $D-7$;
  - *Média Móvel de 7 dias*;
  - *Variáveis de calendário*: Dia da semana (0-6) e indicador binário de final de semana (`is_weekend`).
- Separação estrita temporal (*Time-based Split*): 80% passado para treinamento e 20% recente para validação, impedindo vazamento de dados (*data leakage*).

---

## 4. 🧠 Modelagem de Machine Learning (Modeling)

### 4.1 Previsão de Demanda (Regressão Supervisionada)
- Modelos avaliados: **Árvore de Decisão** (`DecisionTreeRegressor`) vs. **Random Forest** (`RandomForestRegressor`).
- Redução de variância comprovada pelo Random Forest:
  - **WAPE:** Reduzido de 24.47% (Árvore) para **23.64% (Random Forest)**;
  - **MAE:** Reduzido de 2.21 para **2.12 unidades/dia**.

### 4.2 Segmentação de Catálogo (DBSCAN Não-Supervisionado)
- Features: Média de Vendas Diárias, Desvio Padrão (Volatilidade) e Margem de Lucro Bruta.
- Agrupamentos identificados:
  - Cluster 0: *Alto Giro & Alta Frequência* (Cervejas e Energéticos);
  - Cluster 1: *Giro Médio & Margem Estável* (Snacks e Refrigerantes);
  - Cluster 2: *Baixo Giro & Margem Elevada* (Itens de emergência/higiene);
  - Anomalias / Outliers (Cluster -1): Gelo e Carvão com picos de alta volatilidade.

### 4.3 Risco de Ruptura (Classificação Probabilística Calibrada)
- Classificador **Regressão Logística Multinomial** com normalização (`StandardScaler`) treinado para estimar a probabilidade de risco de ruptura (*Alto*, *Médio* ou *Baixo Risco*) em função de estoque atual, média móvel recente, vendas com lag e indicador de fim de semana.
- A Regressão Logística Multinomial em Pipeline foi adotada em produção em substituição ao baseline inicial (Gaussian Naive Bayes) por gerar probabilidades calibradas (`predict_proba`) mais estáveis e aderentes, sem a restrição de independência estrita de variáveis correlacionadas. A compatibilidade com pipelines legados foi mantida no serviço com fallback transparente.

---

## 5. ⚖️ Avaliação e Validação de Negócio (Evaluation)

- Os modelos foram serializados via `joblib` nos artefatos `models/*.pkl` e validados via suíte de testes de integração da API (`pytest`).
- A fórmula do Reorder Engine foi calibrada para mitigar quebras sem onerar o capital de giro:
  $$\text{Qtd Sugerida} = \max(0, \text{Demanda Prevista (RF)} + \text{Estoque de Segurança} + \text{Quebras Recentes} - \text{Estoque Atual})$$

---

## 6. 🚀 Implantação e Operação (Deployment)

- **Backend API:** FastAPI com arquitetura limpa, tipagem estrita com Pydantic v2 e carregamento de modelos via Lifespan.
- **Frontend SPA:** Interface em React 19, TypeScript e Vite com Design System dual-theme (Cerúleo e Grafite) e acessibilidade WCAG 2.1 AA/AAA.
- **Rastreabilidade e Governança:** Documentação padronizada IEEE 1016 (SDDs), contratos BDD e Conventional Commits.
