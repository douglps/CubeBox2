---
id: US-DATA-02
title: Pipeline de Limpeza, Deduplicação e Sanitização de Vendas
bounded_context: 01-data-pipeline
complexity: medium
token_budget: 450
dependencies:
  sdd: docs/sdd/SDD-CBOX-DATA-V1.0.0.md
  impacted_files:
    - backend/scripts/clean_data_pipeline.py
    - data/processed/vendas_conveniencia_clean.csv
    - data/audit/cleaning_report.json
---

# 📖 US-DATA-02: Pipeline de Limpeza, Deduplicação e Sanitização de Vendas

## 1. 🎯 Narrativa do Usuário
**Como** Cientista de Dados do CubeBox Mini,  
**Eu quero** executar um pipeline automatizado de higienização sobre a base bruta de vendas,  
**Para que** tenhamos um dataset consistente, sem duplicatas, sem valores negativos/absurdos e com categorias padronizadas, pronto para análises exploratórias e treinamento dos modelos preditivos.

---

## 2. 🧪 Critérios de Aceite (BDD - Dado / Quando / Então)

### Cenário 1: Deduplicação e expurgo de anomalias absurdas
- **Dado** o arquivo bruto `data/raw/vendas_conveniencia_raw.csv` contendo registros duplicados e quantidades extremas/negativas,
- **Quando** o script de sanitização for executado,
- **Então** todas as duplicatas idênticas devem ser eliminadas, transações com quantidade <= 0 ou > 50 unidades de balcão devem ser descartadas/tratadas, e o dataset resultante deve possuir apenas valores válidos.

### Cenário 2: Imputação e padronização categórica
- **Dado** campos com texto irregular (`cerveja `, `CERVEJA`) ou categorias e preços ausentes,
- **Quando** o pipeline aplicar o mapeamento canônico e lookup de SKU,
- **Então** todas as categorias devem estar em Title Case padronizado (`Cervejas`, `Energéticos`, etc.), os preços ausentes devem ser recuperados pelo catálogo mestre e nenhuma coluna essencial deve conter valores nulos.

### Cenário 3: Auditoria estruturada (Observabilidade)
- **Dado** o processamento completo do dataset,
- **Quando** o pipeline finalizar com sucesso,
- **Então** deve ser gravado o arquivo `data/audit/cleaning_report.json` contendo a contagem de registros iniciais, duplicatas removidas, outliers expurgados, nulos corrigidos e o total de registros limpos exportados para `data/processed/vendas_conveniencia_clean.csv`.

---

## 3. 🛡️ Definition of Done (DoD)
- [ ] Script Python `backend/scripts/clean_data_pipeline.py` implementando Result Pattern.
- [ ] Exportação do dataset limpo `data/processed/vendas_conveniencia_clean.csv`.
- [ ] Geração do relatório `data/audit/cleaning_report.json`.
- [ ] Teste unitário de integridade em `backend/tests/test_data_pipeline.py`.
