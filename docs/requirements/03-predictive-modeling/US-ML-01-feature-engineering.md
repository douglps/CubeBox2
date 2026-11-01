---
id: US-ML-01
title: Engenharia de Features e Agregação Temporal Diária por SKU
bounded_context: 03-predictive-modeling
complexity: Média
token_budget: 450
dependencies:
  sdd: docs/sdd/SDD-CBOX-ML-V1.0.0.md
  target_files:
    - backend/ml/features.py
    - data/processed/vendas_conveniencia_clean.csv
---

# US-ML-01: Engenharia de Features Diárias e Lags Temporais

## 1. 📖 Narrativa da História
**Como** Desenvolvedor de Machine Learning do CubeBox Mini,  
**Quero** converter os registros transacionais em uma série temporal diária por SKU com enriquecimento de lags e médias móveis,  
**Para que** os modelos preditivos tenham atributos estruturados e sem vazamento de dados (*data leakage*).

---

## 2. 🧪 Cenários BDD (Dado-Quando-Então)

### Cenário 1: Construção de Lag Features e Janelas Móveis
- **Dado** o dataset de transações limpas,
- **Quando** executo o agrupamento diário por produto gerando lags em $D-1$, $D-2$, $D-7$ e média móvel de 7 dias,
- **Então** os valores passados de cada linha refletem exclusivamente instantes temporais anteriores, evitando vazamento de dados (*data leakage*).

### Cenário 2: Divisão Temporal Treino/Teste
- **Dado** o dataset enriquecido temporalmente,
- **Quando** aplico o split temporal (80% histórico para treino e 20% recente para teste),
- **Então** o conjunto de teste preserva a cronologia dos últimos 36 dias do histórico simulado.

---

## 3. 🛡️ Definition of Done (DoD)
- [ ] Pipeline de extração de features modular e reutilizável.
- [ ] Teste de sanidade validando ausência de NaNs não tratados resultantes de lags.
