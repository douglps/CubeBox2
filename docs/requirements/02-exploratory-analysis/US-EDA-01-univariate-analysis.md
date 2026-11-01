---
id: US-EDA-01
title: Execução e Visualização da Análise Univariada de Vendas
bounded_context: 02-exploratory-analysis
complexity: Média
token_budget: 450
dependencies:
  sdd: docs/sdd/SDD-CBOX-EDA-V1.0.0.md
  target_files:
    - notebooks/01_analise_univariada.ipynb
    - data/processed/vendas_conveniencia_clean.csv
---

# US-EDA-01: Análise Univariada de Dados Transacionais de Conveniência

## 1. 📖 Narrativa da História
**Como** Analista de Dados e Cientista de Machine Learning do CubeBox Mini,  
**Quero** executar a análise univariada das variáveis numéricas e categóricas do dataset limpo,  
**Para que** eu compreenda a distribuição, assimetria, medidas de tendência central e frequência do mix de produtos antes da modelagem preditiva.

---

## 2. 🧪 Cenários BDD (Dado-Quando-Então)

### Cenário 1: Estatísticas Descritivas e Distribuição Numérica
- **Dado** que o arquivo sanitizado `data/processed/vendas_conveniencia_clean.csv` está disponível e íntegro,
- **Quando** executo as células de cálculo descritivo no notebook `notebooks/01_analise_univariada.ipynb`,
- **Então** o sistema deve calcular e exibir para as variáveis numéricas (`quantidade`, `preco_unitario`, `valor_total`): média, mediana, desvio padrão, mínimo, máximo, IQR, assimetria (*skewness*) e curtose,
- **E** plotar histogramas com curva KDE e boxplots elucidando os limites de Tukey.

### Cenário 2: Análise de Frequência do Mix Categórico
- **Dado** o conjunto de transações com as categorias e formas de pagamento padronizadas,
- **Quando** ploto os gráficos de barras de frequência e a curva de Pareto,
- **Então** visualizo com precisão os grupos dominantes de receita (ex: Cervejas, Energéticos, Tabacaria) em relação a itens de conveniência esporádica.

---

## 3. 🛡️ Definition of Done (DoD)
- [ ] Notebook `notebooks/01_analise_univariada.ipynb` executável de ponta a ponta sem erros.
- [ ] Gráficos estilizados com títulos, labels nos eixos e paleta consistente.
- [ ] Células em markdown com conclusões e insights analíticos direcionados ao negócio.
