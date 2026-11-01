---
id: US-API-02
title: Endpoints de Model Serving e Sugestão Preditiva de Reabastecimento
bounded_context: 04-backend-api
complexity: Media
token_budget: 450
dependencies:
  - docs/sdd/SDD-CBOX-API-V1.0.0.md
  - docs/sdd/SDD-CBOX-ML-V1.0.0.md
  - backend/app/routers/ml.py
  - models/*.pkl
---

# 📖 US-API-02: Endpoints de Model Serving e Sugestão Preditiva de Compras

### 🎯 Narrativa do Usuário
**Como** gestor de compras da conveniência,  
**Quero** consultar projeções de vendas e sugestões automáticas de reposição pela API,  
**Para que** eu evite tanto a ruptura de estoque (falta de produto) quanto compras desnecessárias (capital parado).

---

### 🧪 Critérios de Aceite (BDD)

#### Cenário 1: Consulta de projeção de vendas futuras para um SKU
- **Dado** que os modelos serializados `.pkl` foram carregados na inicialização da API,
- **Quando** o cliente envia uma requisição `GET /api/ml/forecast?sku=CERV-HEIN-350&dias=7`,
- **Então** a resposta deve retornar HTTP 200 com a previsão diária estimada para os próximos 7 dias.

#### Cenário 2: Cálculo de sugestão de compra automatizada
- **Dado** que a demanda prevista total para 7 dias é de 60 unidades, o estoque de segurança é de 20 unidades e o estoque físico atual é de 30 unidades,
- **Quando** a rota `GET /api/ml/reorder-suggestions` for executada,
- **Então** o campo `quantidade_sugerida` deve retornar exatamente 50 unidades,
- **E** deve incluir a classificação probabilística de risco de ruptura (Alto, Médio, Baixo) fornecida pelo Naive Bayes.

---

### 🛡️ Contrato de Dados (Pydantic Schema)

```python
class ReorderSuggestionResponse(BaseModel):
    sku: str
    nome_produto: str
    estoque_atual: int
    estoque_minimo: int
    demanda_prevista_7d: float
    quantidade_sugerida: int
    risco_ruptura: str # 'BAIXO', 'MEDIO', 'ALTO'
    cluster_giro: str  # 'ALTO GIRO', 'MEDIO GIRO', etc.
```
