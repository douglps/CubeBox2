# 📊 Documento de Entendimento do Negócio (Business Understanding) - CubeBox Mini

> **Versão:** 1.0.0  
> **Status:** Ativo  
> **Metodologia:** CRISP-DM - Fase 1 (Business Understanding / Entendimento do Negócio)  
> **Sistema:** CubeBox Mini - Sistema Preditivo Integrado de Compras e Vendas  
> **Léxico de Referência:** [LEXICON.md](file:///c:/Dev/CubeBox2/LEXICON.md)  

---

## 1. 🎯 Contexto e Visão Geral do Negócio

O comércio de conveniência e varejo de proximidade opera com características dinâmicas:
- **Área física reduzida:** Capacidade limitada de armazenamento físico (gôndolas e câmara fria / *walk-in cooler*).
- **Sazonalidade acentuada:** Picos de demanda concentrados em dias específicos (quintas, sextas, sábados e domingos), eventos esportivos e variações climáticas.
- **Mix de produtos heterogêneo:** Categorias com comportamentos distintos (bebidas de alto giro, tabacaria de margem reduzida, snacks de impulso, itens de conveniência emergencial com giro esporádico como carvão e gelo).

Historicamente, o processo de reposição e compras em pequenos comércios é realizado de forma empírica ou reativa, baseando-se na intuição do operador (*gut feeling*), o que acarreta perdas financeiras recorrentes.

---

## 2. ⚖️ O Dilema Central: O Trade-Off de Gestão de Estoque

A gestão de suprimentos do CubeBox Mini equilibra duas forças antagônicas:

```
                  ┌────────────────────────────────────────┐
                  │          EQUILÍBRIO DE ESTOQUE         │
                  └───────────────────┬────────────────────┘
                                      │
             ┌────────────────────────┴────────────────────────┐
             ▼                                                 ▼
┌─────────────────────────┐                       ┌─────────────────────────┐
│   RUPTURA DE ESTOQUE    │                       │  CAPITAL PARADO/PERDAS  │
│       (Stockout)        │                       │    (Overstocking)       │
├─────────────────────────┤                       ├─────────────────────────┤
│ • Venda perdida direta  │                       │ • Custo de oportunidade │
│ • Migração p/ concorrente│                      │ • Risco de vencimento   │
│ • Deterioração da marca │                       │ • Restrição de espaço   │
└─────────────────────────┘                       └─────────────────────────┘
```

### 2.1 Custo da Ruptura de Estoque (*Cost of Stockout*)
- **Perda de Receita Imediata:** Não atendimento do cliente no momento da compra por impulso.
- **Dano à Fidelização:** Em conveniência, a conveniência reside na disponibilidade instantânea. A falta de itens âncora (ex: cerveja gelada no fim de semana) induz o consumidor a buscar o concorrente imediato.
- **Margem de Contribuição Negativa:** Custos fixos da loja permanecem inalterados enquanto a receita potencial é frustrada.

### 2.2 Custo de Excesso de Estoque e Capital Imobilizado (*Cost of Overstocking*)
- **Custo de Oportunidade do Capital:** Dinheiro estagnado em estoque poderia estar rendendo ou financiando categorias de maior margem e giro.
- **Perdas por Validade (*Shelf Life* e Avaria):** Produtos perecíveis ou com embalagens frágeis sofrem depreciação e descarte.
- **Estrangulamento do Espaço Físico:** Lojas de conveniência possuem alto custo por metro quadrado; mercadorias paradas bloqueiam a exposição de itens de alto giro.

---

## 3. 🎯 Objetivos de Negócio (Business Goals)

1. **Minimizar Rupturas (*Reduce Stockouts*):** Reduzir incidentes de ruptura nas categorias críticas para menos de **3%** das solicitações.
2. **Otimizar Capital de Giro (*Working Capital Optimization*):** Reduzir o volume médio de itens retidos em estoque sem comprometer a taxa de serviço.
3. **Automatizar Sugestões de Compra (*Reorder Automation*):** Substituir pedidos manuais intuitivos por recomendações calculadas a partir de previsões preditivas embasadas em dados históricos.
4. **Visibilidade Operacional em Tempo Real (*Actionable Visibility*):** Disponibilizar ao lojista um cockpit gerencial com indicadores-chave (faturamento, estoque crítico, velocidade de saída e risco de ruptura).

---

## 4. 🔬 Objetivos de Mineração de Dados & Machine Learning (Data Mining Goals)

Para atingir as metas do negócio, o CubeBox Mini adota uma abordagem analítica tripartite estruturada em modelos supervisionados e não-supervisionados:

| Frente Analítica | Algoritmo Escolhido | Objetivo Técnico de Mineração de Dados | Métrica de Sucesso |
| :--- | :--- | :--- | :--- |
| **Previsão de Demanda** | **Random Forest Regressor** (vs. Decision Tree) | Prever a quantidade diária demandada de cada SKU para um horizonte de 7 a 14 dias com base em histórico temporal e sazonalidade. | $\text{WAPE} \le 18\%$, $\text{MAE}$ inferior à média histórica da Árvore de Decisão isolada. |
| **Segmentação de Giro** | **DBSCAN** (Clustering Espacial) | Agrupar SKUs por volume de vendas, volatilidade e margem de contribuição, isolando itens *outliers* ou de demanda anômala sem forçar contagem prévia de clusters ($k$). | Identificação nítida de grupos de alta liquidez vs. baixa liquidez com isolamento consistente de ruídos/anomalias. |
| **Classificação de Risco** | **Gaussian Naive Bayes** | Calcular a probabilidade *a posteriori* de um produto sofrer ruptura nos próximos 3 dias dado o estoque físico atual e a velocidade de saída. | $\text{Acurácia} \ge 85\%$, $\text{Recall (Classe Ruptura)} \ge 90\%$ (prioridade em evitar falsos negativos). |

---

## 5. 🧮 Formulação Matemática da Sugestão de Compra

A recomendação automática de reposição gerada pelo sistema para o fornecedor é expressa pela equação:

$$\text{Qtd Compra}_{i} = \max\left(0, \hat{D}_{i, [t, t+L_i]} + \text{SS}_{i} - E_{i}\right)$$

Onde:
- $\hat{D}_{i, [t, t+L_i]}$: Demanda total prevista pelo modelo de Machine Learning para o produto $i$ ao longo da janela do *Lead Time* ($L_i$).
- $\text{SS}_{i}$: Estoque de Segurança (*Safety Stock*) dimensionado a partir da variabilidade das vendas e nível de serviço desejado ($Z \times \sigma_d \times \sqrt{L_i}$).
- $E_{i}$: Estoque físico disponível na loja no instante da inferência.

---

## 6. 📋 Critérios de Aceite e Avaliação do Negócio

A solução será considerada validada academicamente e operacionalmente se cumprir:
1. **Consistência Ponta a Ponta:** Toda previsão gerada pelo pipeline de ML e persistida em `.pkl` deve ser consumida e renderizada na API FastAPI e na interface gráfica React.
2. **Tempo de Resposta de Inferência:** Resposta do endpoint preditivo em tempo inferior a **150ms** para a base de 20 SKUs.
3. **Transparência para o Usuário:** O operador deve visualizar o racional da sugestão de compra (Estoque Atual + Venda Prevista - Segurança = Pedido Recomendado).
