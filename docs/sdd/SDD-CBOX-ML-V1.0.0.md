# 📐 SDD-CBOX-ML-V1.0.0: Subsistema de Modelagem Preditiva e Machine Learning

> **Projeto:** CubeBox Mini - Sistema Preditivo Integrado de Compras e Vendas  
> **Módulo:** Engenharia de Features, Modelos Preditivos e Serialização (CRISP-DM Fase 3)  
> **Versão:** 1.0.0 (Legada - Consulte SDD-CBOX-ML-V1.1.0 para a versão vigente com Regressão Logística)  
> **Status:** Obsoleto / Substituído por V1.1.0  
> **Padrão:** IEEE 1016 (Software Design Document)  
> **Data:** 2026-10-27  

---

## 1. 🎯 Identificação & Visão Geral (Overview)

### 1.1 Propósito
Definir a arquitetura técnica, pipeline de treinamento, métricas de avaliação e contratos de serialização para os 4 algoritmos de Machine Learning do CubeBox Mini:
1. **Regressão Supervisionada (Demanda):** Comparativo entre Árvore de Decisão (`DecisionTreeRegressor`) e Random Forest (`RandomForestRegressor`).
2. **Segmentação Não-Supervisionada (Curva de Giro e Anomalias):** Agrupamento com `DBSCAN`.
3. **Classificação Supervisionada (Risco de Ruptura):** Probabilidade de desabastecimento com `GaussianNB` (Naive Bayes).
4. **Serialização de Artefatos:** Persistência dos modelos em `models/*.pkl` via `joblib`.

### 1.2 Relação com o Negócio & Léxico
Documenta formalmente a inteligência que alimenta as decisões operacionais definidas em [01-business-understanding.md](file:///c:/Dev/CubeBox2/docs/01-business-understanding.md) e [LEXICON.md](file:///c:/Dev/CubeBox2/LEXICON.md).

---

## 2. 🏛️ Princípios de Heurística & Arquitetura

- **Prevenção de Data Leakage:** Separação treino/teste baseada estritamente em linha temporal (*Time-based Split*, 80% passado para treino, 20% recente para teste).
- **Contrato de Serialização Limpo:** Cada artefato serializado conterá o modelo treinado, scaler/pipeline correspondente e metadados de versão (`schema_version`, features esperadas).
- **Métricas Orientadas ao Negócio:** Além de $MAE$ e $RMSE$, adoção do $WAPE$ (*Weighted Absolute Percentage Error*) para mitigar distorções de itens de baixo volume.

---

## 3. ⚙️ Engenharia de Features (Feature Engineering)

Agrupamento temporal diário por SKU com enriquecimento preditivo:

```
[Vendas Diárias por SKU] ──▶ [Lag Features: D-1, D-2, D-7] ──▶ [Média Móvel 7D] ──▶ [Sazonalidade: DiaSemana, FimSemana]
```

| Atributo / Feature | Tipo | Origem / Cálculo | Justificativa de Negócio |
| :--- | :--- | :--- | :--- |
| `vendas_lag_1` | Numérica | $Vendas_{t-1}$ | Inércia imediata de demanda. |
| `vendas_lag_2` | Numérica | $Vendas_{t-2}$ | Tendência de curto prazo. |
| `vendas_lag_7` | Numérica | $Vendas_{t-7}$ | Captura de sazonalidade semanal específica. |
| `media_movel_7d` | Numérica | Média móvel janela 7 dias | Nivelamento de ruídos esporádicos. |
| `taxa_quebra_hist` | Numérica | Média móvel de avarias/vencimento | Ajuste do estoque de segurança para não subestimar perda física. |
| `dia_semana` | Categórica | 0 (Segunda) a 6 (Domingo) | Efeito de pico de final de semana em conveniência. |
| `is_fim_semana` | Booleana | Binário (Sexta a Domingo = 1) | Diferenciação de padrão de consumo e impulso. |

> [!IMPORTANT]
> **Tratamento de Quebras e Avarias nos Modelos:**
> Ocorrências de quebras registradas no estoque são tratadas separadamente da demanda de vendas:
> 1. Para o modelo de regressão (vendas puras), a quebra não é somada como venda para evitar inflar artificialmente o comportamento de compra do consumidor.
> 2. Para a política de ressuprimento (`reorder-suggestions`), a taxa histórica de quebras do SKU é somada como parcela de reposição necessária ao estoque de segurança.

---

## 4. 🤖 Especificação dos Modelos

### 4.1 Modelos de Previsão de Demanda (Árvore de Decisão vs Random Forest)
- **Baseline:** `DecisionTreeRegressor(max_depth=5, random_state=42)` para interpretabilidade direta e exportação visual do gráfico de árvore.
- **Modelo Campeão:** `RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)`.
- **Métricas Obrigatórias de Comparativo:**
  $$MAE = \frac{1}{n}\sum |y_i - \hat{y}_i|, \quad RMSE = \sqrt{\frac{1}{n}\sum (y_i - \hat{y}_i)^2}, \quad WAPE = \frac{\sum |y_i - \hat{y}_i|}{\sum y_i}$$

### 4.2 Modelo de Segmentação de Produtos (DBSCAN)
- **Features de Entrada (Normalizadas via `StandardScaler`):**
  1. Demanda Média Diária por SKU
  2. Volatilidade da Demanda (Desvio Padrão)
  3. Margem Média Unitária
- **Hiperparâmetros:** `eps` determinado via método do joelho (*k-distance graph*) e `min_samples=2`.
- **Saída:** Clusters (0: Alta Saída/Estável, 1: Volátil de Final de Semana, 2: Baixo Giro) e Rótulo `-1` para Anomalias/Itens Especiais.

### 4.3 Modelo de Risco de Ruptura (Naive Bayes)
- **Algoritmo:** `GaussianNB()`.
- **Target Categórico de Treinamento:**
  - `Alto Risco`: Estoque Atual $\le 1.0 \times \text{Demanda Prevista}$
  - `Médio Risco`: $1.0 < \text{Estoque Atual} \le 2.0 \times \text{Demanda Prevista}$
  - `Baixo Risco`: $\text{Estoque Atual} > 2.0 \times \text{Demanda Prevista}$
- **Saída em Inferência:** Distribuição de probabilidade por classe (`predict_proba`).

---

## 5. 📦 Especificação de Serialização & Artefatos

Diretório alvo: `models/`
1. `models/regressor_random_forest.pkl`: Pipeline com encoder/scaler e estimador floresta aleatória.
2. `models/cluster_dbscan.pkl`: Pipeline com StandardScaler e modelo DBSCAN ajustado.
3. `models/classifier_naive_bayes.pkl`: Pipeline com estimador Gaussian Naive Bayes.
4. `models/metadata.json`: Metadados com data de treino, métricas de validação e lista ordenada de features de entrada.
