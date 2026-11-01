---
id: US-DATA-CLEAN-01
title: Ingestão, Higienização e Sanitização de Clientes e Transações
bounded_context: Data & Governance
complexity: Medium
token_budget: 100
dependencies:
  - docs/sdd/SDD-CBOX-DATA-CRM-PDV-V1.0.0.md
  - backend/app/models.py
  - backend/app/schemas.py
---

# US-DATA-CLEAN-01: Higienização de Dados e Normalização de Documentos/Endereços

## 1. 📖 Narrativa da História
**Como** analista de dados e gestor do CubeBox,  
**Quero** um pipeline de higienização que trate dados importados ou existentes com falhas propositais,  
**Para que** a base cadastral de clientes e vendas atenda aos padrões oficiais (Módulo 11, E.164, CEP) sem dados corrompidos.

---

## 2. 🧪 Critérios de Aceite (BDD)

### Cenário 1: Validação e Higienização de CPF/CNPJ
- **Dado** uma massa de clientes importada contendo formatos inconsistentes (pontos, traços, caracteres espúrios),
- **Quando** o processo de higienização é acionado,
- **Então** extrai estritamente os dígitos, valida o Módulo 11 e armazena o valor canônico (11 dígitos para CPF, 14 para CNPJ).
- **E** marca registros matematicamente inválidos com alerta de inconsistência.

### Cenário 2: Normalização de Telefones e Nomes
- **Dado** telefones cadastrados sem padrão,
- **Quando** higienizados,
- **Então** remove caracteres não-numéricos, padroniza com DDD e aplica título adequado nos nomes sem caixa alta arbitrária.

### Cenário 3: Estruturação de Endereços
- **Dado** que um cliente necessita de entrega,
- **Quando** seu cadastro é preenchido ou importado,
- **Então** campos canônicos (CEP, logradouro, número, bairro, cidade, UF) são persistidos e validados.

---

## 3. 🛡️ Definition of Done (DoD)
- [ ] Schema Pydantic v2 com validação rigorosa de CPF/CNPJ e CEP.
- [ ] Script ou endpoint de sanitização em lote com relatório de auditoria (`cleaning_report.json`).
- [ ] Migração do banco SQLite com colunas de endereço em `customers`.
