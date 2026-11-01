---
id: US-EDA-02
title: Execução e Visualização da Análise Bivariada e Sazonalidade
bounded_context: 02-exploratory-analysis
complexity: Média
token_budget: 450
dependencies:
  sdd: docs/sdd/SDD-CBOX-EDA-V1.0.0.md
  target_files:
    - notebooks/02_analise_bivariada.ipynb
    - data/processed/vendas_conveniencia_clean.csv
---

# US-EDA-02: Análise Bivariada, Correlações e Dinâmica de Sazonalidade

## 1. 📖 Narrativa da História
**Como** Cientista de Machine Learning do CubeBox Mini,  
**Quero** correlacionar variáveis de tempo, preço e volume transacionado,  
**Para que** eu identifique padrões sazonais (fins de semana, turnos) e valide dependências multivariadas essenciais para a engenharia de features dos regressores.

---

## 2. 🧪 Cenários BDD (Dado-Quando-Então)

### Cenário 1: Variação Temporal e Efeito Fim de Semana
- **Dado** o histórico temporal de transações limpas,
- **Quando** agrego a média de faturamento e volume por `dia_semana` e `turno`,
- **Então** visualizo o aumento de demanda nas sextas, sábados e domingos em comparação aos dias úteis.

### Cenário 2: Matriz de Correlação e Elasticidade
- **Dado** as métricas numéricas agregadas por SKU e transação,
- **Quando** gero a matriz de correlação de Pearson/Spearman com heatmap,
- **Então** observo a correlação entre preço unitário e volume de vendas, e verifico a ausência de multicolinearidade extrema não intencional.

---

## 3. 🛡️ Definition of Done (DoD)
- [ ] Notebook `notebooks/02_analise_bivariada.ipynb` gerado e testado.
- [ ] Heatmap de correlação e gráficos de sazonalidade com anotações claras.
- [ ] Síntese das hipóteses validadas registrada no notebook.
