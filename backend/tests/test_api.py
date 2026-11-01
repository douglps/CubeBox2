"""
Suite de Testes Automatizados para a API FastAPI do CubeBox Enterprise.
Cobre:
1. Listagem de produtos e marcas reais (US-API-01, US-UI-04)
2. Registro de venda com baixa atomica de estoque (US-API-01)
3. Bloqueio estrito de estoque negativo (US-API-01)
4. Desconto bidirecional (US-API-01)
5. Previsao de demanda via Random Forest (US-API-02)
6. Sugestoes de reabastecimento com risco Naive Bayes (US-API-02)
7. Clusters e anomalias do DBSCAN (US-API-02)
8. Registro de perdas/quebras de estoque (US-API-01)
9. CRUD comercial de produtos e status ATIVO/CONGELADO (US-UI-04)
10. Bloqueio estrito de venda no PDV para produtos CONGELADOS (US-UI-04)
11. Salvaguarda de integridade referencial na exclusao de produtos (US-UI-04)
12. CRM de Clientes e associacao no PDV com calculo de LTV (US-UI-04)
"""
import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import Base, engine, SessionLocal
from backend.app.models import Product, Customer
from backend.app.services.ml_service import ml_service
from backend.app.init_db import apply_migrations

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_models_and_db():
    """Garante que as migrações, modelos .pkl e tabelas estejam carregados antes dos testes."""
    apply_migrations()
    Base.metadata.create_all(bind=engine)
    ml_service.load_models()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ml_models_loaded"] is True


def test_list_products():
    response = client.get("/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 20
    assert any(p["sku"] == "SKU-BEB-001" for p in products)
    assert all("status" in p for p in products)


def test_successful_sale_decrements_stock():
    # Buscar produto com saldo e ativo
    prod_res = client.get("/api/products")
    product = next(p for p in prod_res.json() if p["sku"] == "SKU-BEB-001" and p["status"] == "ATIVO")
    initial_stock = product["estoque_atual"]

    # Realizar venda de 2 unidades
    sale_payload = {
        "forma_pagamento": "PIX",
        "percentual_desconto": 0.0,
        "valor_desconto": 0.0,
        "itens": [
            {
                "product_id": product["id"],
                "quantidade": 2,
                "preco_unitario": product["preco_unitario"]
            }
        ]
    }
    sale_res = client.post("/api/sales", json=sale_payload)
    assert sale_res.status_code == 201
    sale_data = sale_res.json()
    assert sale_data["numero_pedido"].startswith("PED-")
    assert sale_data["valor_total"] == round(2 * product["preco_unitario"], 2)

    # Verificar saldo decrementado
    updated_prod = client.get(f"/api/products/{product['id']}").json()
    assert updated_prod["estoque_atual"] == initial_stock - 2


def test_negative_stock_rejection():
    # Buscar produto
    prod_res = client.get("/api/products")
    product = next(p for p in prod_res.json() if p["sku"] == "SKU-CHUR-001")
    current_stock = product["estoque_atual"]

    # Tentar vender mais do que o estoque disponivel
    excess_qty = current_stock + 100
    sale_payload = {
        "forma_pagamento": "Cartão Débito",
        "percentual_desconto": 0.0,
        "valor_desconto": 0.0,
        "itens": [
            {
                "product_id": product["id"],
                "quantidade": excess_qty,
                "preco_unitario": product["preco_unitario"]
            }
        ]
    }
    sale_res = client.post("/api/sales", json=sale_payload)
    assert sale_res.status_code == 422
    assert "Estoque insuficiente" in sale_res.json()["detail"]


def test_bidirectional_discount():
    prod_res = client.get("/api/products")
    product = next(p for p in prod_res.json() if p["estoque_atual"] >= 2 and p["status"] == "ATIVO")

    # Venda com 10% de desconto
    sale_payload = {
        "forma_pagamento": "Dinheiro",
        "percentual_desconto": 10.0,
        "valor_desconto": 0.0,
        "itens": [
            {
                "product_id": product["id"],
                "quantidade": 1,
                "preco_unitario": 100.0
            }
        ]
    }
    sale_res = client.post("/api/sales", json=sale_payload)
    assert sale_res.status_code == 201
    data = sale_res.json()
    assert data["subtotal"] == 100.0
    assert data["valor_desconto"] == 10.0
    assert data["valor_total"] == 90.0


def test_ml_demand_forecast():
    response = client.get("/api/ml/forecast?sku=SKU-BEB-001&dias=7")
    assert response.status_code == 200
    data = response.json()
    assert data["sku"] == "SKU-BEB-001"
    assert len(data["projecao_diaria"]) == 7
    assert data["total_previsto_horizonte"] > 0


def test_ml_reorder_suggestions():
    response = client.get("/api/ml/reorder-suggestions")
    assert response.status_code == 200
    suggestions = response.json()
    assert len(suggestions) >= 20
    first = suggestions[0]
    assert "quantidade_sugerida" in first
    assert "risco_ruptura" in first
    assert first["risco_ruptura"] in ["Alto Risco", "Médio Risco", "Medio Risco", "Baixo Risco"]
    assert "probabilidade_ruptura_pct" in first
    assert isinstance(first["probabilidade_ruptura_pct"], (int, float))


def test_ml_clusters_dbscan():
    response = client.get("/api/ml/clusters")
    assert response.status_code == 200
    clusters = response.json()
    assert len(clusters) >= 20
    # Validar presença de outliers rotulados com -1
    assert any(c["cluster"] == -1 for c in clusters)


def test_inventory_loss_registration():
    prod_res = client.get("/api/products")
    product = next(p for p in prod_res.json() if p["estoque_atual"] >= 2)
    initial_stock = product["estoque_atual"]

    loss_payload = {
        "product_id": product["id"],
        "quantidade": 1,
        "motivo": "AVARIA",
        "observacao": "Lata amassada no transporte"
    }
    loss_res = client.post("/api/inventory/loss", json=loss_payload)
    assert loss_res.status_code == 201

    updated_prod = client.get(f"/api/products/{product['id']}").json()
    assert updated_prod["estoque_atual"] == initial_stock - 1


def test_dashboard_kpis():
    response = client.get("/api/dashboard/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "faturamento_liquido" in data
    assert "total_pedidos" in data
    assert "total_perdas_avarias" in data


# =============================================================================
# NOVOS TESTES: GESTÃO DE PRODUTOS, CONGELAMENTO & CRM (US-UI-04)
# =============================================================================
def test_product_crud_and_status_freezing():
    unique_suffix = uuid.uuid4().hex[:6].upper()
    sku = f"SKU-TEST-{unique_suffix}"

    # 1. Criar novo produto
    create_payload = {
        "sku": sku,
        "nome": "Produto Teste Automatizado",
        "categoria": "Testes",
        "preco_unitario": 20.0,
        "custo_unitario": 10.0,
        "estoque_atual": 15,
        "estoque_minimo": 5,
        "lead_time_dias": 2,
        "status": "ATIVO"
    }
    res_create = client.post("/api/products", json=create_payload)
    assert res_create.status_code == 201
    prod_data = res_create.json()
    prod_id = prod_data["id"]
    assert prod_data["sku"] == sku
    assert prod_data["status"] == "ATIVO"

    # 2. Atualizar produto
    update_payload = {
        "nome": "Produto Teste Atualizado",
        "preco_unitario": 25.0
    }
    res_update = client.put(f"/api/products/{prod_id}", json=update_payload)
    assert res_update.status_code == 200
    assert res_update.json()["nome"] == "Produto Teste Atualizado"
    assert res_update.json()["preco_unitario"] == 25.0

    # 3. Congelar produto
    res_freeze = client.patch(f"/api/products/{prod_id}/status", json={"status": "CONGELADO"})
    assert res_freeze.status_code == 200
    assert res_freeze.json()["status"] == "CONGELADO"

    # 4. Tentar vender produto congelado no PDV -> Deve falhar com 422
    sale_payload = {
        "forma_pagamento": "PIX",
        "percentual_desconto": 0.0,
        "valor_desconto": 0.0,
        "itens": [
            {
                "product_id": prod_id,
                "quantidade": 1,
                "preco_unitario": 25.0
            }
        ]
    }
    res_sale_blocked = client.post("/api/sales", json=sale_payload)
    assert res_sale_blocked.status_code == 422
    assert "CONGELADO" in res_sale_blocked.json()["detail"]

    # 5. Descongelar produto
    res_unfreeze = client.patch(f"/api/products/{prod_id}/status", json={"status": "ATIVO"})
    assert res_unfreeze.status_code == 200
    assert res_unfreeze.json()["status"] == "ATIVO"

    # 6. Agora a venda deve ser concluida com sucesso
    res_sale_ok = client.post("/api/sales", json=sale_payload)
    assert res_sale_ok.status_code == 201


def test_product_deletion_integrity():
    unique_suffix = uuid.uuid4().hex[:6].upper()
    sku = f"SKU-DEL-{unique_suffix}"

    # 1. Criar produto sem nenhuma movimentacao
    res_create = client.post("/api/products", json={
        "sku": sku,
        "nome": "Produto Sem Historico",
        "categoria": "Testes",
        "preco_unitario": 15.0,
        "custo_unitario": 8.0,
        "estoque_atual": 10,
        "estoque_minimo": 2,
        "lead_time_dias": 1,
        "status": "ATIVO"
    })
    prod_id = res_create.json()["id"]

    # 2. Excluir com sucesso (204)
    res_del = client.delete(f"/api/products/{prod_id}")
    assert res_del.status_code == 204

    # 3. Tentar excluir produto que tem venda (ex: SKU-BEB-001) -> Deve dar 409
    prod_res = client.get("/api/products")
    active_prod = next(p for p in prod_res.json() if p["sku"] == "SKU-BEB-001")
    res_del_conflict = client.delete(f"/api/products/{active_prod['id']}")
    assert res_del_conflict.status_code == 409
    assert "CONGELAR" in res_del_conflict.json()["detail"]


def test_customers_crm_and_pos_association():
    unique_doc = f"111.{uuid.uuid4().hex[:3]}.{uuid.uuid4().hex[:3]}-99"

    # 1. Cadastrar cliente no CRM
    cust_payload = {
        "nome": "Cliente VIP Teste",
        "cpf_cnpj": unique_doc,
        "telefone": "(11) 99999-8888",
        "email": "vip.teste@exemplo.com",
        "ativo": True
    }
    res_cust = client.post("/api/customers", json=cust_payload)
    assert res_cust.status_code == 201
    cust_data = res_cust.json()
    cust_id = cust_data["id"]
    assert cust_data["total_pedidos"] == 0
    assert cust_data["total_gasto_ltv"] == 0.0

    # 2. Listar clientes e filtrar pelo documento
    res_list = client.get(f"/api/customers?q={unique_doc}")
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1

    # 3. Realizar venda vinculada ao cliente
    prod_res = client.get("/api/products")
    product = next(p for p in prod_res.json() if p["estoque_atual"] >= 2 and p["status"] == "ATIVO")

    sale_payload = {
        "forma_pagamento": "Cartão Crédito",
        "customer_id": cust_id,
        "percentual_desconto": 0.0,
        "valor_desconto": 0.0,
        "itens": [
            {
                "product_id": product["id"],
                "quantidade": 1,
                "preco_unitario": product["preco_unitario"]
            }
        ]
    }
    res_sale = client.post("/api/sales", json=sale_payload)
    assert res_sale.status_code == 201
    sale_data = res_sale.json()
    assert sale_data["customer_id"] == cust_id
    assert sale_data["customer_nome"] == "Cliente VIP Teste"

    # 4. Checar que o LTV e total de pedidos do cliente foram atualizados
    res_cust_updated = client.get(f"/api/customers/{cust_id}")
    assert res_cust_updated.status_code == 200
    cust_after = res_cust_updated.json()
    assert cust_after["total_pedidos"] >= 1
    assert cust_after["total_gasto_ltv"] >= product["preco_unitario"]


def test_sale_cancellation_and_inventory_refund():
    # 1. Buscar produto ativo com saldo
    prod_res = client.get("/api/products")
    product = next(p for p in prod_res.json() if p["estoque_atual"] >= 5 and p["status"] == "ATIVO")
    stock_before = product["estoque_atual"]
    prod_id = product["id"]

    # 2. Realizar venda de 3 unidades
    sale_payload = {
        "forma_pagamento": "PIX",
        "percentual_desconto": 0.0,
        "valor_desconto": 0.0,
        "itens": [
            {
                "product_id": prod_id,
                "quantidade": 3,
                "preco_unitario": product["preco_unitario"]
            }
        ]
    }
    res_sale = client.post("/api/sales", json=sale_payload)
    assert res_sale.status_code == 201
    sale_data = res_sale.json()
    sale_id = sale_data["id"]

    # 3. Validar decremento do estoque
    prod_after_sale = next(p for p in client.get("/api/products").json() if p["id"] == prod_id)
    assert prod_after_sale["estoque_atual"] == stock_before - 3

    # 4. Cancelar a venda e estornar ao estoque
    res_cancel = client.post(f"/api/sales/{sale_id}/cancel")
    assert res_cancel.status_code == 200
    cancel_data = res_cancel.json()
    assert cancel_data["status"] == "CANCELADO"

    # 5. Validar que as 3 unidades foram restituídas ao estoque
    prod_after_cancel = next(p for p in client.get("/api/products").json() if p["id"] == prod_id)
    assert prod_after_cancel["estoque_atual"] == stock_before

    # 6. Rejeição de segundo cancelamento (idempotência/integridade)
    res_second_cancel = client.post(f"/api/sales/{sale_id}/cancel")
    assert res_second_cancel.status_code == 422


# =============================================================================
# NOVOS TESTES: HIGIENIZAÇÃO DE DADOS, ENDEREÇO & TAXA DE ENTREGA (US-DATA-03 / US-UI-06)
# =============================================================================
def test_data_sanitization_and_module_11():
    # 1. Validação de Documento em tempo real via endpoint
    res_valid_cpf = client.get("/api/data/validate-doc?doc=52998224725")
    assert res_valid_cpf.status_code == 200
    assert res_valid_cpf.json()["valido"] is True

    res_invalid_cpf = client.get("/api/data/validate-doc?doc=11122233344")
    assert res_invalid_cpf.status_code == 200
    assert res_invalid_cpf.json()["valido"] is False

    # 2. Cadastrar cliente com dados desformatados para teste de higienização
    unique_num = uuid.uuid4().hex[:4]
    dirty_customer = {
        "nome": f"JOÃO   DA   SILVA  {unique_num}",
        "cpf_cnpj": "111.222.333-44", # CPF matematicamente inválido
        "telefone": "(11) 98765-4321",
        "cep": "01310-100",
        "logradouro": "Avenida Paulista",
        "numero": "1000",
        "bairro": "Bela Vista",
        "cidade": "São Paulo",
        "estado": "sp"
    }
    create_res = client.post("/api/customers", json=dirty_customer)
    assert create_res.status_code == 201
    cust_id = create_res.json()["id"]

    # 3. Disparar sanitização em lote
    sanitize_res = client.post("/api/data/sanitize/customers")
    assert sanitize_res.status_code == 200
    sanitize_data = sanitize_res.json()
    assert sanitize_data["status"] == "success"
    assert sanitize_data["total_registros_avaliados"] >= 1

    # 4. Validar que o registro do cliente foi higienizado
    cleaned_cust = client.get(f"/api/customers/{cust_id}").json()
    # Nome deve estar em Title Case com 'da' minúsculo
    assert "da Silva" in cleaned_cust["nome"]
    # CPF inválido deve ter sido removido do campo canônico
    assert cleaned_cust["cpf_cnpj"] is None
    # Telefone e CEP canônicos (apenas dígitos)
    assert cleaned_cust["telefone"] == "11987654321"
    assert cleaned_cust["cep"] == "01310100"
    assert cleaned_cust["estado"] == "SP"


def test_pos_delivery_sale_and_repeat_order():
    # 1. Obter produto com saldo
    prod_res = client.get("/api/products")
    product = next(p for p in prod_res.json() if p["estoque_atual"] >= 10 and p["status"] == "ATIVO")
    prod_id = product["id"]

    # 2. Criar cliente com endereço completo
    cust_payload = {
        "nome": "Mariana Santos Entrega",
        "telefone": "11988887777",
        "cep": "04571010",
        "logradouro": "Avenida Engenheiro Luís Carlos Berrini",
        "numero": "500",
        "bairro": "Itaim Bibi",
        "cidade": "São Paulo",
        "estado": "SP"
    }
    cust_res = client.post("/api/customers", json=cust_payload)
    assert cust_res.status_code == 201
    cust_id = cust_res.json()["id"]

    # 3. Realizar venda na modalidade ENTREGA com taxa default de R$ 12,00 e CPF na nota
    sale_payload = {
        "forma_pagamento": "PIX",
        "customer_id": cust_id,
        "percentual_desconto": 0.0,
        "valor_desconto": 0.0,
        "tipo_entrega": "ENTREGA",
        "taxa_entrega": 12.00,
        "cpf_nota": "52998224725",
        "endereco_entrega_snapshot": "Av. Eng. Luís Carlos Berrini, 500 - Itaim Bibi, SP",
        "itens": [
            {
                "product_id": prod_id,
                "quantidade": 2,
                "preco_unitario": product["preco_unitario"]
            }
        ]
    }
    sale_res = client.post("/api/sales", json=sale_payload)
    assert sale_res.status_code == 201
    sale_data = sale_res.json()

    assert sale_data["tipo_entrega"] == "ENTREGA"
    assert sale_data["taxa_entrega"] == 12.00
    assert sale_data["cpf_nota"] == "52998224725"
    expected_total = round(2 * product["preco_unitario"] + 12.00, 2)
    assert sale_data["valor_total"] == expected_total

    # 4. Consultar histórico de compras do cliente via /api/customers/{id}/orders
    cust_orders_res = client.get(f"/api/customers/{cust_id}/orders")
    assert cust_orders_res.status_code == 200
    orders = cust_orders_res.json()
    assert len(orders) >= 1
    last_order = orders[0]
    assert last_order["id"] == sale_data["id"]
    assert len(last_order["items"]) == 1
    assert last_order["items"][0]["product_id"] == prod_id
    assert last_order["items"][0]["quantidade"] == 2

