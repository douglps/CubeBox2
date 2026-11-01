# 📐 SDD-CBOX-EDA-V1.0.0: Subsistema de Análise Exploratória de Dados (EDA)

> **Projeto:** CubeBox Mini - Sistema Preditivo Integrado de Compras e Vendas  
> **Módulo:** Análise Exploratória Univariada e Bivariada (CRISP-DM Fase 2)  
> **Versão:** 1.0.0  
> **Status:** Aprovado  
> **Padrão:** IEEE 1016 (Software Design Document)  
> **Data:** 2026-10-27  

---

## 1. 🎯 Identificação & Visão Geral (Overview)

### 1.1 Propósito
Padronizar a abordagem analítica e estatística para exploração dos dados sanitizados de vendas de conveniência (`data/processed/vendas_conveniencia_clean.csv`). Este documento orienta a implementação dos notebooks analíticos da Fase 2 do [ROADMAP.md](file:///c:/Dev/CubeBox2/ROADMAP.md):
- `notebooks/01_analise_univariada.ipynb`
- `notebooks/02_analise_bivariada.ipynb`

### 1.2 Relação com o Negócio & Léxico
Consome o entendimento documentado em [01-business-understanding.md](file:///c:/Dev/CubeBox2/docs/01-business-understanding.md) e os termos em [LEXICON.md](file:///c:/Dev/CubeBox2/LEXICON.md):
- **SKU:** Agrupamento por código de produto.
- **Ruptura de Estoque (Stockout):** Identificação de gaps de venda e volatilidade.
- **Venda por Impulso & Sazonalidade:** Concentração em fins de semana e períodos noturnos.

---

## 2. 🏛️ Princípios de Heurística & Design

- **KISS & Reprodutibilidade:** Visualizações limpas com `matplotlib` e `seaborn`, utilizando paleta padronizada e sementes fixadas.
- **Atomicidade Visual:** Gráficos interpretáveis com títulos descritivos, rótulos de eixos com unidades claras (R$, unidades, percentuais) e anotações dos achados de negócio (*Insights*).
- **Consistência Estatística:** Uso de medidas paramétricas (média, desvio padrão) e não-paramétricas (mediana, IQR, quantis) para lidar com assimetria de demanda de varejo.

---

## 3. 🔬 Especificação da Análise Univariada

Objetivo: compreender o comportamento isolado de cada atributo transacional.

### 3.1 Variáveis Numéricas (`quantidade`, `preco_unitario`, `valor_total`, `desconto_aplicado`)
1. **Métricas Centrais & Dispersão:** Média, mediana, desvio padrão, variância, IQR, mínimo, máximo, assimetria (*skewness*) e curtose (*kurtosis*).
2. **Distribuição de Densidade:** Histogramas com KDE (*Kernel Density Estimation*) para identificar concentração em compras de pequenas frações (1 a 3 unidades).
3. **Detecção de Dispersão:** Boxplots com indicação visual de quartis ($Q_1, Q_2, Q_3$) e limite de Tukey ($1.5 \times IQR$).

### 3.2 Variáveis Categóricas (`categoria`, `forma_pagamento`, `dia_semana`, `turno`)
1. **Frequência Absoluta e Relativa:** Gráficos de barras ordenadas por volume.
2. **Concentração de Mix (Pareto 80/20):** Identificação das categorias que concentram o faturamento da loja (Bebidas Alcoólicas, Cigarros/Tabacaria, Não Alcoólicos).

---

## 4. 📈 Especificação da Análise Bivariada

Objetivo: mapear relações de dependência, covariância e padrões temporais fundamentais para a posterior Engenharia de Features.

### 4.1 Relações Temporais & Sazonalidade
- **Vendas x Dia da Semana:** Avaliação do pico de demanda de conveniência de quinta a domingo.
- **Vendas x Turno/Hora:** Padrão diário de compras (tarde/noite).

### 4.2 Elasticidade & Correlação
- **Vendas x Preço Unitário:** Dispersão e correlação linear (Pearson) e monotônica (Spearman) para validar sensibilidade a preço e descontos.
- **Matriz de Correlação com Heatmap:** Identificação de colinearidade entre atributos numéricos contínuos.

### 4.3 Estoque x Velocidade de Saída
- **Dispersão Volume x Variabilidade:** Relação entre demanda média diária e desvio padrão por SKU (base para parametrização do DBSCAN).

---

## 5. 🛡️ Riscos Tecnológicos & Mitigações

| Risco | Impacto | Mitigação |
| :--- | :--- | :--- |
| **Interpretação errônea de outliers** | Descartar picos reais de consumo de sexta/sábado como erro. | Cruzar outliers de quantidade com `dia_semana` antes de qualquer truncamento. |
| **Overplotting em scatter plots** | Gráficos ilegíveis com 60k+ pontos sobrepostos. | Utilizar amostragem estratificada, transparência (`alpha=0.3`) e hexbin/KDE 2D. |
