# 📐 SDD-CBOX-ML-V1.1.0: Subsistema de Modelagem Preditiva e Machine Learning

> **Projeto:** CubeBox Mini - Sistema Preditivo Integrado de Compras e Vendas  
> **Módulo:** Engenharia de Features, Modelos Preditivos e Serialização (CRISP-DM Fase 3)  
> **Versão:** 1.1.0  
> **Status:** Aprovado & Validado por Dados  
> **Padrão:** IEEE 1016 (Software Design Document)  
> **Data:** 2026-10-29  

---

## 1. 🎯 Identificação & Visão Geral (Overview)

### 1.1 Propósito
Definir a arquitetura técnica, pipeline de treinamento, métricas de avaliação e contratos de serialização para os algoritmos de Machine Learning do CubeBox Mini:
1. **Regressão Supervisionada (Demanda):** Comparativo entre Árvore de Decisão (`DecisionTreeRegressor`) e Random Forest (`RandomForestRegressor`).
2. **Segmentação Não-Supervisionada (Curva de Giro e Anomalias):** Agrupamento com `DBSCAN`.
3. **Classificação Supervisionada (Risco de Ruptura Calibrado):** Classificador probabilístico multiclasse via `LogisticRegression` (Multinomial com `StandardScaler`), substituindo o baseline `GaussianNB` com ganho comprovado de +20.3% em Macro F1-Score.
4. **Serialização de Artefatos:** Persistência dos modelos em `models/*.pkl` via `joblib`.

### 1.2 Relação com o Negócio & Léxico
Documenta formalmente a inteligência que alimenta as decisões operacionais definidas em [01-business-understanding.md](file:///c:/Dev/CubeBox2/docs/01-business-understanding.md) e [LEXICON.md](file:///c:/Dev/CubeBox2/LEXICON.md).

---

## 2. 🏛️ Princípios de Heurística & Arquitetura

- **Prevenção de Data Leakage:** Separação treino/teste baseada estritamente em linha temporal (*Time-based Split*, 80% passado para treino, 20% recente para teste).
- **Contrato de Serialização Limpo:** Cada artefato serializado contém pipeline com normalizador, estimador treinado, classes e coeficientes explicáveis.
- **Interpretabilidade Matemática:** Explicabilidade via Razão de Chances (*Odds Ratio*) para justificar à operação os motivos determinantes de cada risco de ruptura.
- **Métricas Orientadas ao Negócio:** Adoção de $WAPE$ (*Weighted Absolute Percentage Error*) para vendas e Macro/Weighted F1-score balanceado para classes de risco.

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
- **Baseline:** `DecisionTreeRegressor(max_depth=5, random_state=42)` ($MAE = 7.60$, $WAPE = 24.47\%$).
- **Modelo Campeão:** `RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)` ($MAE = 7.35$, $WAPE = 23.64\%$).
- **Métricas de Validação:**
  $$MAE = \frac{1}{n}\sum |y_i - \hat{y}_i|, \quad RMSE = \sqrt{\frac{1}{n}\sum (y_i - \hat{y}_i)^2}, \quad WAPE = \frac{\sum |y_i - \hat{y}_i|}{\sum y_i}$$

### 4.2 Modelo de Segmentação de Produtos (DBSCAN)
- **Features de Entrada (Normalizadas via `StandardScaler`):**
  1. Demanda Média Diária por SKU
  2. Volatilidade da Demanda (Desvio Padrão)
  3. Margem Média Unitária
- **Hiperparâmetros:** `eps=0.85` e `min_samples=2`.
- **Saída:** 3 Clusters orgânicos (Giro Estável, Alto Giro/Fim de Semana, Baixo Giro) e 3 Outliers isolados (`-1`: Gelo, Carvão e Energético Tropical).

### 4.3 Modelo de Risco de Ruptura (Regressão Logística Multinomial)
- **Algoritmo Atual:** `Pipeline([('scaler', StandardScaler()), ('lr', LogisticRegression(max_iter=1000, random_state=42))])`.
- **Justificativa da Migração:**
  - `Gaussian Naive Bayes` (Baseline): Acurácia 48.84%, Macro F1 44.31%.
  - `Logistic Regression` (Atual): **Acurácia 64.02%, Macro F1 64.57%, Weighted F1 63.96%**.
  - Precisão em Alto Risco de 71% com Recall de 76% (F1 = 0.73).
- **Target Categórico:** `Alto Risco` ($\text{ratio} \le 1.0$), `Médio Risco` ($1.0 < \text{ratio} \le 2.0$), `Baixo Risco` ($\text{ratio} > 2.0$).
- **Odds Ratio e Coeficientes Chave:**
  - `estoque_simulado`: Coef $-4.2869$ ($\text{Odds Ratio} = 0.0137$).
  - `media_movel_7d`: Coef $+1.7988$ ($\text{Odds Ratio} = 6.0425$).
  - `is_fim_semana`: Coef $+0.8792$ ($\text{Odds Ratio} = 2.4091$).

---

## 5. 📦 Especificação de Serialização & Artefatos

Diretório alvo: `models/`
1. `models/regressor_random_forest.pkl`: Pipeline e estimador de regressão.
2. `models/cluster_dbscan.pkl`: Pipeline com StandardScaler e modelo DBSCAN ajustado.
3. `models/classifier_risk.pkl`: Pipeline StandardScaler + LogisticRegression multinomial calibrada.
4. `models/classifier_naive_bayes.pkl`: Mantido para retrocompatibilidade de payload.
5. `models/metadata.json`: Metadados consolidados com schema version `1.1.0`.

