---
id: US-ML-04
title: Classificação de Probabilidade de Ruptura de Estoque Calibrada
bounded_context: 03-predictive-modeling
complexity: Média
token_budget: 450
dependencies:
  sdd: docs/sdd/SDD-CBOX-ML-V1.1.0.md
  target_files:
    - backend/scripts/train_ml_pipeline.py
    - backend/app/services/ml_service.py
    - models/classifier_risk.pkl
---

# US-ML-04: Classificação de Risco de Ruptura via Regressão Logística Multinomial

## 1. 📖 Narrativa da História
**Como** Operador de Compras do CubeBox Mini,  
**Quero** obter a probabilidade estatística calibrada de ruptura de estoque para cada SKU nas próximas 24h a 48h,  
**Para que** eu possa priorizar pedidos de compra com alta precisão e transparência antes que o estoque atinja o nível crítico de desabastecimento.

---

## 2. 🧪 Cenários BDD (Dado-Quando-Então)

### Cenário 1: Treinamento e Inferência Calibrada com Pipeline
- **Dado** o histórico contendo a relação multivariada entre estoque remanescente, velocidade média móvel e efeito de final de semana,
- **Quando** ajusto o classificador `LogisticRegression` multinomial sob pipeline com `StandardScaler`,
- **Então** o modelo classifica os itens nas categorias (`Baixo Risco`, `Médio Risco` ou `Alto Risco`) com Macro F1 superior a 64% (+20.3% sobre o baseline de Naive Bayes).

### Cenário 2: Exportação da Distribuição de Probabilidades e Odds Ratio
- **Dado** um SKU consultado na rota `/api/ml/reorder-suggestions`,
- **Quando** a inferência é disparada via método `predict_proba()`,
- **Então** o estimador retorna a probabilidade real de alto risco (`probabilidade_ruptura_pct`), permitindo exibir barras percentuais confiáveis no cockpit web com auditoria de coeficientes.

---

## 3. 🛡️ Definition of Done (DoD)
- [x] Pipeline treinado e serializado em `models/classifier_risk.pkl`.
- [x] Relatório de classificação (Precision 71%, Recall 76%, F1-Score 73% em Alto Risco) gerado e validado.
- [x] Endpoints e serviços atualizados sem quebra de contrato.
