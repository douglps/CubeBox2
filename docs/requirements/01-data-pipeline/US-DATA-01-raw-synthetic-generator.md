---
id: US-DATA-01
title: Geração Sintética de Base Histórica com Ruído e Poluição
bounded_context: 01-data-pipeline
complexity: medium
token_budget: 400
dependencies:
  sdd: docs/sdd/SDD-CBOX-DATA-V1.0.0.md
  impacted_files:
    - backend/scripts/generate_raw_data.py
    - data/raw/vendas_conveniencia_raw.csv
---

# 📖 US-DATA-01: Geração Sintética de Base Histórica com Ruído e Poluição

## 1. 🎯 Narrativa do Usuário
**Como** Engenheiro de Dados / Cientista de Dados do CubeBox Mini,  
**Eu quero** gerar programaticamente uma base histórica de transações de conveniência com 180 dias de histórico contendo vícios operacionais realistas (duplicidades, campos nulos, outliers de digitação, caixas altas/baixas e valores inválidos),  
**Para que** a equipe de Ciência de Dados possa demonstrar as etapas práticas de auditoria, limpeza e pré-processamento no ciclo CRISP-DM.

---

## 2. 🧪 Critérios de Aceite (BDD - Dado / Quando / Então)

### Cenário 1: Geração volumétrica e temporal
- **Dado** que o script gerador de dados brutos é executado com catálogo de ~20 SKUs de conveniência,
- **Quando** o processo de simulação de 180 dias for finalizado,
- **Então** deve ser criado o arquivo `data/raw/vendas_conveniencia_raw.csv` contendo no mínimo 5.000 transações brutas com colunas de identificador, data/hora, SKU, descrição, categoria, quantidade, preço unitário e forma de pagamento.

### Cenário 2: Injeção controlada de poluição e ruído
- **Dado** que a taxa de poluição está configurada para simulação realista de balcão de loja,
- **Quando** inspecionadas as estatísticas da base gerada,
- **Então** o arquivo deve conter intencionalmente:
  1. ~3% a 5% de transações estritamente duplicadas;
  2. ~4% a 6% de valores ausentes/nulos em `category`, `payment_method` ou `unit_price`;
  3. Pelo menos 1% de discrepâncias de grafia/espaçamento (ex: `cerveja `, `CERVEJA`);
  4. Pelo menos 0.5% de outliers extremos (ex: quantidades > 200 ou valores negativos de teste/devolução não tratada).

---

## 3. 🛡️ Definition of Done (DoD)
- [ ] Script Python determinístico com semente pseudoaleatória (`random_state=42`) em `backend/scripts/generate_raw_data.py`.
- [ ] Dataset salvo na pasta `data/raw/vendas_conveniencia_raw.csv`.
- [ ] Teste ou validação rápida comprovando a presença das falhas intencionais.
