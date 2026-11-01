# 🧠 Dossiê Estratégico de Machine Learning — CubeBox Mini

> Documentação oficial de governança, características, trade-offs e embasamento empírico de modelos preditivos.

Para a visualização do dossiê estratégico detalhado contendo a análise para gestores e leigos, formulações matemáticas, benchmark com dados reais e conexões de arquitetura, consulte o documento:

👉 **[DOSSIE-ESTRATEGIA-MACHINE-LEARNING.md](file:///C:/Users/dougl/.gemini/antigravity/brain/c8867402-76d5-4ef6-a9cf-d2f0bba766d8/DOSSIE-ESTRATEGIA-MACHINE-LEARNING.md)**

---

## 📌 Resumo dos Pontos Principais

1. **Previsão de Demanda (Random Forest):** 
   - Projeta o volume de vendas diário para os próximos 7 dias.
   - Modelo campeão com $WAPE = 23.64\%$, superando a Árvore de Decisão simples.
2. **Segmentação de Catálogo (DBSCAN):** 
   - Agrupa produtos por velocidade de saída e margem bruta.
   - Isola itens de pico de final de semana (ex.: gelo e carvão) como anomalias úteis (cluster `-1`).
3. **Classificação de Risco de Ruptura (Naive Bayes vs. Regressão Logística):**
   - **Estudo Empírico Realizado:** A Regressão Logística Multinomial elevou o **Macro F1 de 44.31% para 64.57% (+20.26 p.p.)** e a precisão em *Alto Risco* para **71%** (com 76% de recall).
   - **Recomendação Apoiada em Dados:** Evoluir o estimador de risco para **Regressão Logística**, pois além de empatar com modelos complexos de floresta aleatória, oferece **Odds Ratio explicável** e probabilidades perfeitamente calibradas para a tela de alertas.

