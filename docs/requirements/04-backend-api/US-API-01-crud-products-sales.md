---
id: US-API-01
title: Estrutura Base de Modelos e Endpoints Operacionais de Produtos e Vendas
bounded_context: 04-backend-api
complexity: Media
token_budget: 450
dependencies:
  - docs/sdd/SDD-CBOX-API-V1.0.0.md
  - backend/app/models/
  - backend/app/routers/
---

# 📖 US-API-01: Modelos Relacionais e Endpoints CRUD de Vendas e Estoque

### 🎯 Narrativa do Usuário
**Como** operador de conveniência ou gerente da loja,  
**Quero** consultar produtos cadastrados e registrar vendas de balcão via API,  
**Para que** o estoque seja decrementado de forma consistente e os KPIs operacionais sejam atualizados.

---

### 🧪 Critérios de Aceite (BDD)

#### Cenário 1: Consulta de catálogo e níveis de estoque
- **Dado** que a base de dados SQLite foi inicializada com o catálogo de 20 SKUs,
- **Quando** o cliente envia uma requisição `GET /api/products`,
- **Então** a resposta deve retornar HTTP 200 com a lista completa contendo `sku`, `nome`, `preco_unitario`, `estoque_atual` e `estoque_minimo`.

#### Cenário 2: Registro de venda com baixa atômica de estoque
- **Dado** que o produto "CERV-HEIN-350" possui 50 unidades em estoque,
- **Quando** o caixa envia uma requisição `POST /api/sales` contendo 3 unidades desse item,
- **Então** o registro de venda deve ser persistido com status HTTP 201 e número de pedido gerado,
- **E** o `estoque_atual` do produto na base deve ser atualizado para 47 unidades.

#### Cenário 3: Bloqueio estrito de estoque negativo
- **Dado** que o produto "ENERG-RED-250" possui apenas 2 unidades em estoque,
- **Quando** o caixa tenta registrar um pedido de venda solicitando 5 unidades,
- **Então** o sistema rejeita a operação com status HTTP 422 Unprocessable Entity,
- **E** nenhuma alteração de saldo nem gravação de venda deve ocorrer no banco.

#### Cenário 4: Aplicação de desconto bidirecional (percentual ou valor fixo)
- **Dado** que o subtotal do carrinho é de R$ 100,00,
- **Quando** o operador insere 10% no percentual de desconto OU R$ 10,00 no valor fixo,
- **Então** a API valida a paridade matemática, calcula o total líquido como R$ 90,00 e persiste ambos os valores.

---

### 🛡️ Contrato de Dados (Pydantic Schema)

```python
class SaleItemCreate(BaseModel):
    product_id: int
    quantidade: int = Field(gt=0, description="Quantidade vendida")
    preco_unitario: float = Field(gt=0)

class SaleCreate(BaseModel):
    forma_pagamento: str # DINHEIRO, PIX, CARTAO_CREDITO, CARTAO_DEBITO
    percentual_desconto: float = Field(default=0.0, ge=0.0, le=100.0)
    valor_desconto: float = Field(default=0.0, ge=0.0)
    itens: list[SaleItemCreate]

    @model_validator(mode="after")
    def validate_discount_and_items(self):
        if not self.itens:
            raise ValueError("O pedido deve conter pelo menos um item.")
        return self
```
