---
id: US-ML-03
title: Segmentação Não-Supervisionada e Detecção de Anomalias com DBSCAN
bounded_context: 03-predictive-modeling
complexity: Média
token_budget: 450
dependencies:
  sdd: docs/sdd/SDD-CBOX-ML-V1.0.0.md
  target_files:
    - backend/ml/models/clustering.py
    - models/cluster_dbscan.pkl
---

# US-ML-03: Segmentação de Produtos e Identificação de Anomalias via DBSCAN

## 1. 📖 Narrativa da História
**Como** Gestor de Suprimentos do CubeBox Mini,  
**Quero** classificar os produtos por similaridade de giro, volatilidade e margem sem depender de regras manuais estáticas,  
**Para que** o sistema isole itens de giro ultra-rápido, itens estáveis e capture anomalias de estoque/venda (outliers rotulados como `-1`).

---

## 2. 🧪 Cenários BDD (Dado-Quando-Então)

### Cenário 1: Ajuste de Densidade com DBSCAN
- **Dado** o perfil de cada SKU agregado por demanda média diária, volatilidade e margem unitária normalizadas,
- **Quando** executo o DBSCAN com raio de vizinhança calibrado via gráfico de k-distância,
- **Então** os SKUs são agrupados em clusters densos de comportamento similar.

### Cenário 2: Identificação de Ruído e Anomalias
- **Dado** produtos com comportamento atípico de vendas ou volatilidade extrema,
- **Quando** o modelo finaliza a classificação,
- **Então** esses itens recebem o cluster `-1`, permitindo sinalização de auditoria prioritária no cockpit.

---

## 3. 🛡️ Definition of Done (DoD)
- [ ] Pipeline com `StandardScaler` e `DBSCAN` serializado em `models/cluster_dbscan.pkl`.
- [ ] Mapeamento claro dos clusters gerados integrado ao relatório de auditoria.
