# 🎓 GUIA DE APRESENTAÇÃO & DEFESA ACADÊMICA (CUBEBOX MINI)

> **Público-Alvo:** Professores, Banca Avaliadora e Stakeholders  
> **Duração Estimada:** 15 a 20 minutos  
> **Tema:** Sistema Preditivo Integrado de Compras e Vendas com Machine Learning e Full-Stack Moderno  

---

## ⏱️ Roteiro da Demonstração Prática

### 1. Abertura & Contextualização do Problema (2 min)
- Apresentar o dilema central do pequeno varejo de conveniência: ruptura de itens-chave vs. capital imobilizado e perda por validade/avaria.
- Explicar a metodologia adotada: **CRISP-DM** (do entendimento do negócio à implantação) orientado por **SDD (Spec-Driven Development)**.

### 2. Ciclo de Machine Learning & Serialização (4 min)
- **Regressão:** Comparar a Árvore de Decisão com o Random Forest ($WAPE$ reduzido de 24.47% para 23.64%), justificando a escolha pelo ganho de generalização.
- **DBSCAN:** Demonstrar a separação orgânica em 3 clusters de liquidez e detecção de anomalias (itens como Gelo/Carvão que comportam picos sazonais).
- **Risco de Ruptura (Classificação Calibrada):** Demonstrar o cálculo probabilístico da chance de ruptura em função de estoque atual, média móvel e lags temporais via **Regressão Logística Multinomial em Pipeline** (modelo de produção superior ao baseline acadêmico Naive Bayes por calibrar probabilidades contínuas com `predict_proba`).
- Apontar os arquivos serializados (`regressor_random_forest.pkl`, `cluster_dbscan.pkl`, `classifier_risk.pkl` e seu alias retrocompatível `classifier_naive_bayes.pkl`).

### 3. Tour pelo Cockpit SPA em Tempo Real (8 min)
1. **Dashboard Executivo:**
   - Exibir KPIs integrados: Faturamento líquido, total de pedidos, ticket médio, perdas por quebra e contagem de itens em risco.
   - Analisar o gráfico de tendência de vendas e alternar entre **Tema Cerúleo** e **Tema Grafite** demonstrando a ausência de cores berrantes (*Calm UI*).
2. **Frente de Caixa (PDV):**
   - Demonstrar o catálogo rápido com busca instantânea.
   - Tentar adicionar um produto esgotado ou acima do estoque: comprovar o **bloqueio estrito de estoque negativo**.
   - Mostrar a sincronização **bidirecional do desconto** (% para R$ e vice-versa).
   - Finalizar uma venda via PIX: demonstrar a emissão do número de pedido e a baixa imediata de estoque.
3. **Controle de Estoque & Quebras:**
   - Visualizar a tabela com os badges de clusters gerados pelo DBSCAN (*Alto Giro*, *Giro Médio*, *Baixo Giro*, *Outlier*).
   - Abrir o modal de baixa por quebra/avaria: registrar descarte de 2 unidades por vencimento e conferir o abatimento instantâneo no saldo.
4. **Inteligência Preditiva & Reposição:**
   - Selecionar um SKU (ex: Heineken Long Neck) e exibir a curva projetada de demanda para os próximos 7 dias.
   - Analisar a tabela de sugestão de reposição com probabilidade de ruptura calculada pelo modelo de risco.
   - Clicar em "Aprovar Pedido de Compra", emitir a ordem para a distribuidora e, na aba de pedidos emitidos, clicar em "Confirmar Entrega" para demonstrar o reabastecimento automático do estoque.

### 4. Arquitetura, Boas Práticas & Conclusão (3 min)
- Destacar a arquitetura desacoplada: **FastAPI** + **React 19 + TypeScript + Vite + CSS Modules**.
- Ressaltar os padrões corporativos seguidos: W3C DTCG Tokens, WCAG 2.1 AA, Result Pattern, testes automatizados e zero dependências obsoletas.
