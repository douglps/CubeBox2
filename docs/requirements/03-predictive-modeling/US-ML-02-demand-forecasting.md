---
id: US-ML-02
title: Treinamento Comparativo entre Árvore de Decisão e Random Forest
bounded_context: 03-predictive-modeling
complexity: Média
token_budget: 450
dependencies:
  sdd: docs/sdd/SDD-CBOX-ML-V1.0.0.md
  target_files:
    - backend/ml/models/forecaster.py
    - models/regressor_random_forest.pkl
---

# US-ML-02: Previsão de Demanda com Comparativo Acadêmico (Árvore vs Random Forest)

## 1. 📖 Narrativa da História
**Como** Cientista de Dados do CubeBox Mini,  
**Quero** treinar e comparar uma Árvore de Decisão com um Random Forest Regressor para prever a demanda diária,  
**Para que** o sistema selecione o modelo campeão avaliado por MAE, RMSE e WAPE, disponibilizando a exportação `.pkl`.

---

## 2. 🧪 Cenários BDD (Dado-Quando-Então)

### Cenário 1: Treinamento e Avaliação Comparativa
- **Dado** o conjunto de treino temporal com as features preditivas calculadas,
- **Quando** ajusto `DecisionTreeRegressor` e `RandomForestRegressor`,
- **Então** o sistema computa $MAE$, $RMSE$ e $WAPE$ em dados de teste, confirmando a superioridade do modelo ensemble (Random Forest) na redução de variância.

### Cenário 2: Serialização do Modelo Campeão
- **Dado** o Random Forest validado,
- **Quando** executo o comando de persistência,
- **Então** o pipeline completo é salvo em `models/regressor_random_forest.pkl` com seus metadados.

---

## 3. 🛡️ Definition of Done (DoD)
- [ ] Tabela comparativa formal com métricas $MAE$, $RMSE$ e $WAPE$.
- [ ] Artefato serializado funcional capaz de responder a chamadas `.predict()`.
