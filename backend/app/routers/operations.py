"""
Rotas REST para Produtos, Clientes (CRM), Vendas e Quebras de Estoque (PDV de Balcão).
Implementa bloqueio estrito de saldo negativo, congelamento preventivo de produtos,
gestao comercial completa e calculo de desconto bidirecional.
Atende a US-API-01, US-UI-04 e SDD-CBOX-UI-V2.0.0.
"""
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from backend.app.database import get_db
from backend.app.models import Product, Sale, SaleItem, InventoryLoss, Customer, PurchaseOrder, CustomerAddress
from backend.app.schemas import (
    ProductResponse,
    ProductCreate,
    ProductUpdate,
    ProductStatusUpdate,
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerAddressCreate,
    CustomerAddressResponse,
    SaleCreate,
    SaleResponse,
    InventoryLossCreate,
    InventoryLossResponse
)

router = APIRouter(prefix="/api", tags=["Operacional, PDV & Comercial"])


# ==========================================
# PRODUTOS (CATÁLOGO & GESTÃO COMERCIAL)
# ==========================================
@router.get("/products", response_model=List[ProductResponse])
def list_products(
    categoria: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """Lista produtos do catalogo com suporte a filtros por categoria e status (ATIVO/CONGELADO)."""
    query = db.query(Product)
    if categoria:
        query = query.filter(Product.categoria == categoria)
    if status_filter:
        query = query.filter(Product.status == status_filter.upper())
    return query.order_by(Product.categoria, Product.nome).all()


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Busca detalhes de um produto por ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto nao encontrado.")
    return product


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """
    Cadastra um novo produto no catalogo comercial:
    - Valida unicidade do SKU.
    - Persiste estoque inicial e precos.
    """
    existing_sku = db.query(Product).filter(Product.sku == product_in.sku.strip()).first()
    if existing_sku:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ja existe um produto com o SKU '{product_in.sku}'."
        )

    product = Product(
        sku=product_in.sku.strip(),
        nome=product_in.nome.strip(),
        categoria=product_in.categoria.strip(),
        preco_unitario=round(product_in.preco_unitario, 2),
        custo_unitario=round(product_in.custo_unitario, 2),
        estoque_atual=product_in.estoque_atual,
        estoque_minimo=product_in.estoque_minimo,
        lead_time_dias=product_in.lead_time_dias,
        status=product_in.status.upper() if product_in.status else "ATIVO"
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    """Atualiza dados cadastrais e operacionais de um produto existente."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto nao encontrado.")

    if product_in.nome is not None:
        product.nome = product_in.nome.strip()
    if product_in.categoria is not None:
        product.categoria = product_in.categoria.strip()
    if product_in.preco_unitario is not None:
        product.preco_unitario = round(product_in.preco_unitario, 2)
    if product_in.custo_unitario is not None:
        product.custo_unitario = round(product_in.custo_unitario, 2)
    if product_in.estoque_atual is not None:
        product.estoque_atual = product_in.estoque_atual
    if product_in.estoque_minimo is not None:
        product.estoque_minimo = product_in.estoque_minimo
    if product_in.lead_time_dias is not None:
        product.lead_time_dias = product_in.lead_time_dias
    if product_in.status is not None:
        product.status = product_in.status.upper()

    db.commit()
    db.refresh(product)
    return product


@router.patch("/products/{product_id}/status", response_model=ProductResponse)
def update_product_status(product_id: int, status_in: ProductStatusUpdate, db: Session = Depends(get_db)):
    """
    Alterna ou define o status de um produto (ATIVO ou CONGELADO).
    Produtos congelados tem venda bloqueada imediatamente no PDV sem corromper o historico.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto nao encontrado.")

    product.status = status_in.status
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """
    Exclui um produto do catalogo se e somente se nao houver vendas ou compras historicas.
    Caso haja registros vinculados, bloqueia a exclusao e instrui o congelamento do SKU.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto nao encontrado.")

    has_sales = db.query(SaleItem).filter(SaleItem.product_id == product_id).first() is not None
    has_purchases = db.query(PurchaseOrder).filter(PurchaseOrder.product_id == product_id).first() is not None
    has_losses = db.query(InventoryLoss).filter(InventoryLoss.product_id == product_id).first() is not None

    if has_sales or has_purchases or has_losses:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"O produto '{product.nome}' possui historico de movimentacoes (vendas, compras ou perdas). "
                   f"Para preservar a integridade dos dados, utilize a acao de CONGELAR o produto."
        )

    db.delete(product)
    db.commit()
    return None


# ==========================================
# CLIENTES & CRM DE BALCÃO
# ==========================================
@router.get("/customers", response_model=List[CustomerResponse])
def list_customers(q: Optional[str] = None, db: Session = Depends(get_db)):
    """Lista clientes cadastrados com calculo agregado de pedidos e Lifetime Value (LTV)."""
    query = db.query(Customer)
    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Customer.nome.ilike(search_pattern),
                Customer.cpf_cnpj.ilike(search_pattern),
                Customer.telefone.ilike(search_pattern)
            )
        )

    customers = query.order_by(Customer.nome.asc()).all()
    results = []

    for c in customers:
        # Calcular agregados
        sales_data = db.query(
            func.count(Sale.id).label("total_sales"),
            func.coalesce(func.sum(Sale.valor_total), 0.0).label("ltv")
        ).filter(Sale.customer_id == c.id, Sale.status == "CONCLUIDO").first()

        total_orders = sales_data.total_sales if sales_data else 0
        ltv = float(sales_data.ltv) if sales_data else 0.0

        # Carregar endereços associados (com ordenação de default no topo)
        addresses = db.query(CustomerAddress).filter(CustomerAddress.customer_id == c.id).order_by(CustomerAddress.is_default.desc(), CustomerAddress.id.asc()).all()
        addr_responses = [CustomerAddressResponse.model_validate(a) for a in addresses]

        # Priorizar dados do endereço padrão para os campos legados caso existam endereços
        default_addr = next((a for a in addresses if a.is_default), addresses[0] if addresses else None)

        results.append(
            CustomerResponse(
                id=c.id,
                nome=c.nome,
                cpf_cnpj=c.cpf_cnpj,
                telefone=c.telefone or "",
                email=c.email,
                ativo=c.ativo,
                cep=default_addr.cep if default_addr else c.cep,
                logradouro=default_addr.logradouro if default_addr else c.logradouro,
                numero=default_addr.numero if default_addr else c.numero,
                complemento=default_addr.complemento if default_addr else c.complemento,
                bairro=default_addr.bairro if default_addr else c.bairro,
                cidade=default_addr.cidade if default_addr else c.cidade,
                estado=default_addr.estado if default_addr else c.estado,
                referencia=default_addr.referencia if default_addr else c.referencia,
                criado_em=c.criado_em,
                total_pedidos=total_orders,
                total_gasto_ltv=round(ltv, 2),
                enderecos=addr_responses
            )
        )

    return results


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Busca detalhes de um cliente especifico com indicadores de consumo e endereco."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado.")

    sales_data = db.query(
        func.count(Sale.id).label("total_sales"),
        func.coalesce(func.sum(Sale.valor_total), 0.0).label("ltv")
    ).filter(Sale.customer_id == customer.id, Sale.status == "CONCLUIDO").first()

    addresses = db.query(CustomerAddress).filter(CustomerAddress.customer_id == customer.id).order_by(CustomerAddress.is_default.desc(), CustomerAddress.id.asc()).all()
    addr_responses = [CustomerAddressResponse.model_validate(a) for a in addresses]
    default_addr = next((a for a in addresses if a.is_default), addresses[0] if addresses else None)

    return CustomerResponse(
        id=customer.id,
        nome=customer.nome,
        cpf_cnpj=customer.cpf_cnpj,
        telefone=customer.telefone or "",
        email=customer.email,
        ativo=customer.ativo,
        cep=default_addr.cep if default_addr else customer.cep,
        logradouro=default_addr.logradouro if default_addr else customer.logradouro,
        numero=default_addr.numero if default_addr else customer.numero,
        complemento=default_addr.complemento if default_addr else customer.complemento,
        bairro=default_addr.bairro if default_addr else customer.bairro,
        cidade=default_addr.cidade if default_addr else customer.cidade,
        estado=default_addr.estado if default_addr else customer.estado,
        referencia=default_addr.referencia if default_addr else customer.referencia,
        criado_em=customer.criado_em,
        total_pedidos=sales_data.total_sales if sales_data else 0,
        total_gasto_ltv=round(float(sales_data.ltv), 2) if sales_data else 0.0,
        enderecos=addr_responses
    )


@router.get("/customers/{customer_id}/orders", response_model=List[SaleResponse])
def get_customer_orders(customer_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """Retorna historico de compras do cliente para permitir recompra com 2 cliques."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado.")

    sales = db.query(Sale).filter(Sale.customer_id == customer.id).order_by(Sale.data_hora.desc()).limit(limit).all()
    results = []
    for s in sales:
        results.append(
            SaleResponse(
                id=s.id,
                numero_pedido=s.numero_pedido,
                customer_id=s.customer_id,
                customer_nome=customer.nome,
                data_hora=s.data_hora,
                forma_pagamento=s.forma_pagamento,
                subtotal=s.subtotal,
                percentual_desconto=s.percentual_desconto,
                valor_desconto=s.valor_desconto,
                taxa_entrega=s.taxa_entrega if hasattr(s, "taxa_entrega") and s.taxa_entrega is not None else 0.0,
                tipo_entrega=s.tipo_entrega if hasattr(s, "tipo_entrega") and s.tipo_entrega else "BALCAO",
                cpf_nota=s.cpf_nota if hasattr(s, "cpf_nota") else None,
                endereco_entrega_snapshot=s.endereco_entrega_snapshot if hasattr(s, "endereco_entrega_snapshot") else None,
                valor_total=s.valor_total,
                status=s.status,
                items=[
                    {
                        "id": it.id,
                        "product_id": it.product_id,
                        "quantidade": it.quantidade,
                        "preco_unitario": it.preco_unitario,
                        "subtotal": it.subtotal,
                        "product_sku": it.product.sku if it.product else None,
                        "product_nome": it.product.nome if it.product else None
                    }
                    for it in s.items
                ]
            )
        )
    return results


@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db)):
    """
    Cadastra um novo cliente no CRM:
    - Telefone e Nome são estritamente obrigatórios.
    - Endereço é 100% opcional (0 ou N endereços).
    - Se cadastrar ao menos 1 endereço, o primeiro torna-se automaticamente default (is_default=True).
    """
    clean_phone = customer_in.telefone.strip() if customer_in.telefone else ""
    if not clean_phone or len(clean_phone) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="O telefone de contato do cliente é obrigatório."
        )

    if customer_in.cpf_cnpj:
        clean_cpf = customer_in.cpf_cnpj.strip()
        existing = db.query(Customer).filter(Customer.cpf_cnpj == clean_cpf).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ja existe um cliente cadastrado com o CPF/CNPJ '{clean_cpf}'."
            )

    customer = Customer(
        nome=customer_in.nome.strip(),
        cpf_cnpj=customer_in.cpf_cnpj.strip() if customer_in.cpf_cnpj else None,
        telefone=clean_phone,
        email=customer_in.email.strip() if customer_in.email else None,
        ativo=customer_in.ativo if customer_in.ativo is not None else True,
        cep=customer_in.cep.strip() if customer_in.cep else None,
        logradouro=customer_in.logradouro.strip() if customer_in.logradouro else None,
        numero=customer_in.numero.strip() if customer_in.numero else None,
        complemento=customer_in.complemento.strip() if customer_in.complemento else None,
        bairro=customer_in.bairro.strip() if customer_in.bairro else None,
        cidade=customer_in.cidade.strip() if customer_in.cidade else None,
        estado=customer_in.estado.strip().upper() if customer_in.estado else None,
        referencia=customer_in.referencia.strip() if customer_in.referencia else None
    )
    db.add(customer)
    db.flush()

    # Criação de endereços associados caso informados
    created_addresses = []
    if customer_in.enderecos and len(customer_in.enderecos) > 0:
        has_default_flag = any(addr.is_default for addr in customer_in.enderecos)
        for idx, addr_in in enumerate(customer_in.enderecos):
            # Se nenhum estiver marcado como default, o 1º (idx == 0) é o default
            is_def = addr_in.is_default if has_default_flag else (idx == 0)
            addr_obj = CustomerAddress(
                customer_id=customer.id,
                apelido=addr_in.apelido or f"Endereço {idx + 1}",
                cep=addr_in.cep.strip(),
                logradouro=addr_in.logradouro.strip(),
                numero=addr_in.numero.strip(),
                complemento=addr_in.complemento.strip() if addr_in.complemento else None,
                bairro=addr_in.bairro.strip(),
                cidade=addr_in.cidade.strip(),
                estado=addr_in.estado.strip().upper(),
                referencia=addr_in.referencia.strip() if addr_in.referencia else None,
                is_default=is_def
            )
            db.add(addr_obj)
            created_addresses.append(addr_obj)
    elif customer_in.logradouro and customer_in.bairro and customer_in.cidade:
        # Se preencheu os campos diretos de endereço, cria o 1º endereço como default
        addr_obj = CustomerAddress(
            customer_id=customer.id,
            apelido="Principal",
            cep=customer_in.cep.strip() if customer_in.cep else "01001-000",
            logradouro=customer_in.logradouro.strip(),
            numero=customer_in.numero.strip() if customer_in.numero else "S/N",
            complemento=customer_in.complemento.strip() if customer_in.complemento else None,
            bairro=customer_in.bairro.strip(),
            cidade=customer_in.cidade.strip(),
            estado=customer_in.estado.strip().upper() if customer_in.estado else "SP",
            referencia=customer_in.referencia.strip() if customer_in.referencia else None,
            is_default=True
        )
        db.add(addr_obj)
        created_addresses.append(addr_obj)

    db.commit()
    db.refresh(customer)

    addr_responses = [CustomerAddressResponse.model_validate(a) for a in created_addresses]
    default_addr = next((a for a in created_addresses if a.is_default), created_addresses[0] if created_addresses else None)

    return CustomerResponse(
        id=customer.id,
        nome=customer.nome,
        cpf_cnpj=customer.cpf_cnpj,
        telefone=customer.telefone or "",
        email=customer.email,
        ativo=customer.ativo,
        cep=default_addr.cep if default_addr else customer.cep,
        logradouro=default_addr.logradouro if default_addr else customer.logradouro,
        numero=default_addr.numero if default_addr else customer.numero,
        complemento=default_addr.complemento if default_addr else customer.complemento,
        bairro=default_addr.bairro if default_addr else customer.bairro,
        cidade=default_addr.cidade if default_addr else customer.cidade,
        estado=default_addr.estado if default_addr else customer.estado,
        referencia=default_addr.referencia if default_addr else customer.referencia,
        criado_em=customer.criado_em,
        total_pedidos=0,
        total_gasto_ltv=0.0,
        enderecos=addr_responses
    )


@router.put("/customers/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer_in: CustomerUpdate, db: Session = Depends(get_db)):
    """Atualiza cadastro de um cliente existente."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado.")

    if customer_in.cpf_cnpj and customer_in.cpf_cnpj.strip() != customer.cpf_cnpj:
        clean_cpf = customer_in.cpf_cnpj.strip()
        existing = db.query(Customer).filter(Customer.cpf_cnpj == clean_cpf).first()
        if existing and existing.id != customer.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"CPF/CNPJ '{clean_cpf}' ja pertence a outro cliente."
            )
        customer.cpf_cnpj = clean_cpf

    if customer_in.nome is not None:
        customer.nome = customer_in.nome.strip()
    if customer_in.telefone is not None:
        customer.telefone = customer_in.telefone.strip() if customer_in.telefone else None
    if customer_in.email is not None:
        customer.email = customer_in.email.strip() if customer_in.email else None
    if customer_in.ativo is not None:
        customer.ativo = customer_in.ativo
    if customer_in.cep is not None:
        customer.cep = customer_in.cep.strip() if customer_in.cep else None
    if customer_in.logradouro is not None:
        customer.logradouro = customer_in.logradouro.strip() if customer_in.logradouro else None
    if customer_in.numero is not None:
        customer.numero = customer_in.numero.strip() if customer_in.numero else None
    if customer_in.complemento is not None:
        customer.complemento = customer_in.complemento.strip() if customer_in.complemento else None
    if customer_in.bairro is not None:
        customer.bairro = customer_in.bairro.strip() if customer_in.bairro else None
    if customer_in.cidade is not None:
        customer.cidade = customer_in.cidade.strip() if customer_in.cidade else None
    if customer_in.estado is not None:
        customer.estado = customer_in.estado.strip().upper() if customer_in.estado else None
    if customer_in.referencia is not None:
        customer.referencia = customer_in.referencia.strip() if customer_in.referencia else None

    db.commit()
    db.refresh(customer)

    sales_data = db.query(
        func.count(Sale.id).label("total_sales"),
        func.coalesce(func.sum(Sale.valor_total), 0.0).label("ltv")
    ).filter(Sale.customer_id == customer.id, Sale.status == "CONCLUIDO").first()

    addresses = db.query(CustomerAddress).filter(CustomerAddress.customer_id == customer.id).order_by(CustomerAddress.is_default.desc(), CustomerAddress.id.asc()).all()
    addr_responses = [CustomerAddressResponse.model_validate(a) for a in addresses]
    default_addr = next((a for a in addresses if a.is_default), addresses[0] if addresses else None)

    return CustomerResponse(
        id=customer.id,
        nome=customer.nome,
        cpf_cnpj=customer.cpf_cnpj,
        telefone=customer.telefone or "",
        email=customer.email,
        ativo=customer.ativo,
        cep=default_addr.cep if default_addr else customer.cep,
        logradouro=default_addr.logradouro if default_addr else customer.logradouro,
        numero=default_addr.numero if default_addr else customer.numero,
        complemento=default_addr.complemento if default_addr else customer.complemento,
        bairro=default_addr.bairro if default_addr else customer.bairro,
        cidade=default_addr.cidade if default_addr else customer.cidade,
        estado=default_addr.estado if default_addr else customer.estado,
        referencia=default_addr.referencia if default_addr else customer.referencia,
        criado_em=customer.criado_em,
        total_pedidos=sales_data.total_sales if sales_data else 0,
        total_gasto_ltv=round(float(sales_data.ltv), 2) if sales_data else 0.0,
        enderecos=addr_responses
    )


# ==========================================
# ENDEREÇOS DE CLIENTES (CRM MULTI-ENDEREÇO)
# ==========================================
@router.post("/customers/{customer_id}/addresses", response_model=CustomerAddressResponse, status_code=status.HTTP_201_CREATED)
def add_customer_address(customer_id: int, addr_in: CustomerAddressCreate, db: Session = Depends(get_db)):
    """
    Cadastra um novo endereço para o cliente:
    - Se for o primeiro endereço, torna-se default automaticamente.
    - Se marcado como is_default=True, redefine os outros endereços para false atomicamente.
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente nao encontrado.")

    existing_count = db.query(CustomerAddress).filter(CustomerAddress.customer_id == customer_id).count()
    should_be_default = True if existing_count == 0 else bool(addr_in.is_default)

    if should_be_default and existing_count > 0:
        db.query(CustomerAddress).filter(CustomerAddress.customer_id == customer_id).update({"is_default": False})

    new_addr = CustomerAddress(
        customer_id=customer_id,
        apelido=addr_in.apelido or f"Endereço {existing_count + 1}",
        cep=addr_in.cep.strip(),
        logradouro=addr_in.logradouro.strip(),
        numero=addr_in.numero.strip(),
        complemento=addr_in.complemento.strip() if addr_in.complemento else None,
        bairro=addr_in.bairro.strip(),
        cidade=addr_in.cidade.strip(),
        estado=addr_in.estado.strip().upper(),
        referencia=addr_in.referencia.strip() if addr_in.referencia else None,
        is_default=should_be_default
    )
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)
    return CustomerAddressResponse.model_validate(new_addr)


@router.patch("/customers/{customer_id}/addresses/{address_id}/default", response_model=CustomerAddressResponse)
def set_default_address(customer_id: int, address_id: int, db: Session = Depends(get_db)):
    """
    Define um endereço específico como o default padrão do cliente,
    desmarcando atomicamente todos os outros.
    """
    addr = db.query(CustomerAddress).filter(CustomerAddress.id == address_id, CustomerAddress.customer_id == customer_id).first()
    if not addr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Endereço não encontrado para este cliente.")

    db.query(CustomerAddress).filter(CustomerAddress.customer_id == customer_id).update({"is_default": False})
    addr.is_default = True
    db.commit()
    db.refresh(addr)
    return CustomerAddressResponse.model_validate(addr)


@router.delete("/customers/{customer_id}/addresses/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer_address(customer_id: int, address_id: int, db: Session = Depends(get_db)):
    """Remove um endereço secundário do cliente. Se era o padrão, elege o mais recente."""
    addr = db.query(CustomerAddress).filter(CustomerAddress.id == address_id, CustomerAddress.customer_id == customer_id).first()
    if not addr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Endereço não encontrado para este cliente.")

    was_default = addr.is_default
    db.delete(addr)
    db.flush()

    if was_default:
        remaining = db.query(CustomerAddress).filter(CustomerAddress.customer_id == customer_id).order_by(CustomerAddress.id.desc()).first()
        if remaining:
            remaining.is_default = True

    db.commit()
    return None


# ==========================================
# REGISTRO DE VENDAS (PDV COM BLOQUEIO DE SALDO & CONGELAMENTO)
# ==========================================
@router.post("/sales", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(sale_in: SaleCreate, db: Session = Depends(get_db)):
    """
    Registra um pedido de venda no PDV de balcao:
    - Valida se o produto esta ATIVO (bloqueia produtos CONGELADOS).
    - Valida estoque suficiente para cada item (bloqueio estrito de saldo negativo).
    - Aplica calculo de desconto bidirecional (percentual ou valor fixo).
    - Executa baixa atomica de estoque.
    - Vincula cliente opcionalmente para CRM / LTV.
    """
    # 0. Validar cliente e endereço caso seja ENTREGA
    customer = None
    if sale_in.customer_id:
        customer = db.query(Customer).filter(Customer.id == sale_in.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cliente ID {sale_in.customer_id} nao encontrado."
            )

    # Invariante de Negócio: Se entrega, endereço é estritamente obrigatório
    if sale_in.tipo_entrega == "ENTREGA":
        if not (sale_in.endereco_entrega_snapshot and sale_in.endereco_entrega_snapshot.strip()):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Para vendas com modalidade 'ENTREGA', o endereço de entrega é obrigatório."
            )

    # 1. Validacao de Estoque e Status dos Produtos
    subtotal = 0.0
    products_to_update = []

    for item in sale_in.itens:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto ID {item.product_id} nao encontrado no catalogo."
            )

        if product.status == "CONGELADO":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"O produto '{product.nome}' (SKU: {product.sku}) está CONGELADO e nao pode ser comercializado no PDV."
            )

        if product.estoque_atual < item.quantidade:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Estoque insuficiente para o produto '{product.nome}' (SKU: {product.sku}). "
                       f"Saldo disponivel: {product.estoque_atual}, Solicitado: {item.quantidade}."
            )

        price = item.preco_unitario if (item.preco_unitario is not None and item.preco_unitario > 0) else product.preco_unitario
        item_subtotal = item.quantidade * price
        subtotal += item_subtotal
        products_to_update.append((product, item.quantidade, price, item_subtotal))

    # 2. Desconto Bidirecional
    percentual_desc = sale_in.percentual_desconto
    valor_desc = sale_in.valor_desconto

    if percentual_desc > 0 and valor_desc == 0:
        valor_desc = round(subtotal * (percentual_desc / 100.0), 2)
    elif valor_desc > 0 and percentual_desc == 0:
        percentual_desc = round((valor_desc / subtotal) * 100.0, 2) if subtotal > 0 else 0.0
    elif percentual_desc > 0 and valor_desc > 0:
        calc_valor = round(subtotal * (percentual_desc / 100.0), 2)
        if abs(calc_valor - valor_desc) > 0.05:
            valor_desc = calc_valor

    valor_produtos = max(0.0, round(subtotal - valor_desc, 2))
    taxa_entrega = round(sale_in.taxa_entrega or 0.0, 2) if sale_in.tipo_entrega == "ENTREGA" else 0.0
    valor_total = round(valor_produtos + taxa_entrega, 2)
    numero_pedido = f"PED-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

    # 3. Criar registro de venda
    sale = Sale(
        numero_pedido=numero_pedido,
        customer_id=customer.id if customer else None,
        forma_pagamento=sale_in.forma_pagamento,
        subtotal=round(subtotal, 2),
        percentual_desconto=round(percentual_desc, 2),
        valor_desconto=round(valor_desc, 2),
        tipo_entrega=sale_in.tipo_entrega or "BALCAO",
        taxa_entrega=taxa_entrega,
        cpf_nota=sale_in.cpf_nota.strip() if sale_in.cpf_nota else None,
        endereco_entrega_snapshot=sale_in.endereco_entrega_snapshot,
        valor_total=valor_total,
        status="CONCLUIDO"
    )
    db.add(sale)
    db.flush()

    # 4. Criar itens e decrementar estoque atomicamente
    for product, qty, price, item_sub in products_to_update:
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            quantidade=qty,
            preco_unitario=price,
            subtotal=item_sub
        )
        db.add(sale_item)
        product.estoque_atual -= qty

    db.commit()
    db.refresh(sale)

    # Formatar resposta completa
    return SaleResponse(
        id=sale.id,
        numero_pedido=sale.numero_pedido,
        customer_id=sale.customer_id,
        customer_nome=customer.nome if customer else None,
        data_hora=sale.data_hora,
        forma_pagamento=sale.forma_pagamento,
        subtotal=sale.subtotal,
        percentual_desconto=sale.percentual_desconto,
        valor_desconto=sale.valor_desconto,
        taxa_entrega=sale.taxa_entrega or 0.0,
        tipo_entrega=sale.tipo_entrega or "BALCAO",
        cpf_nota=sale.cpf_nota,
        endereco_entrega_snapshot=sale.endereco_entrega_snapshot,
        valor_total=sale.valor_total,
        status=sale.status,
        items=[
            {
                "id": it.id,
                "product_id": it.product_id,
                "quantidade": it.quantidade,
                "preco_unitario": it.preco_unitario,
                "subtotal": it.subtotal,
                "product_sku": it.product.sku if it.product else None,
                "product_nome": it.product.nome if it.product else None
            }
            for it in sale.items
        ]
    )


@router.get("/sales", response_model=List[SaleResponse])
def list_sales(limit: int = 50, db: Session = Depends(get_db)):
    """Retorna historico recente de vendas para auditoria do PDV e consulta de cupons."""
    sales = db.query(Sale).order_by(Sale.data_hora.desc()).limit(limit).all()
    results = []
    for s in sales:
        results.append(
            SaleResponse(
                id=s.id,
                numero_pedido=s.numero_pedido,
                customer_id=s.customer_id,
                customer_nome=s.customer.nome if s.customer else None,
                data_hora=s.data_hora,
                forma_pagamento=s.forma_pagamento,
                subtotal=s.subtotal,
                percentual_desconto=s.percentual_desconto,
                valor_desconto=s.valor_desconto,
                taxa_entrega=s.taxa_entrega if hasattr(s, "taxa_entrega") and s.taxa_entrega is not None else 0.0,
                tipo_entrega=s.tipo_entrega if hasattr(s, "tipo_entrega") and s.tipo_entrega else "BALCAO",
                cpf_nota=s.cpf_nota if hasattr(s, "cpf_nota") else None,
                endereco_entrega_snapshot=s.endereco_entrega_snapshot if hasattr(s, "endereco_entrega_snapshot") else None,
                valor_total=s.valor_total,
                status=s.status,
                items=[
                    {
                        "id": it.id,
                        "product_id": it.product_id,
                        "quantidade": it.quantidade,
                        "preco_unitario": it.preco_unitario,
                        "subtotal": it.subtotal,
                        "product_sku": it.product.sku if it.product else None,
                        "product_nome": it.product.nome if it.product else None
                    }
                    for it in s.items
                ]
            )
        )
    return results


@router.post("/sales/{sale_id}/cancel", response_model=SaleResponse)
def cancel_sale(sale_id: int, db: Session = Depends(get_db)):
    """
    Cancela um pedido de venda e executa estorno atomico de estoque:
    - Valida se a venda existe e se ainda nao esta cancelada.
    - Altera o status da venda para 'CANCELADO'.
    - Devolve atomicamente as quantidades de cada item ao estoque fisico.
    """
    sale = db.query(Sale).filter(Sale.id == sale_id).with_for_update().first()
    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Venda ID {sale_id} nao encontrada."
        )

    if sale.status == "CANCELADO":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"A venda '{sale.numero_pedido}' ja se encontra cancelada."
        )

    sale.status = "CANCELADO"

    # Estorno atomico das quantidades de volta ao estoque
    for it in sale.items:
        product = db.query(Product).filter(Product.id == it.product_id).with_for_update().first()
        if product:
            product.estoque_atual += it.quantidade

    db.commit()
    db.refresh(sale)

    return SaleResponse(
        id=sale.id,
        numero_pedido=sale.numero_pedido,
        customer_id=sale.customer_id,
        customer_nome=sale.customer.nome if sale.customer else None,
        data_hora=sale.data_hora,
        forma_pagamento=sale.forma_pagamento,
        subtotal=sale.subtotal,
        percentual_desconto=sale.percentual_desconto,
        valor_desconto=sale.valor_desconto,
        taxa_entrega=sale.taxa_entrega if hasattr(sale, "taxa_entrega") and sale.taxa_entrega is not None else 0.0,
        tipo_entrega=sale.tipo_entrega if hasattr(sale, "tipo_entrega") and sale.tipo_entrega else "BALCAO",
        cpf_nota=sale.cpf_nota if hasattr(sale, "cpf_nota") else None,
        endereco_entrega_snapshot=sale.endereco_entrega_snapshot if hasattr(sale, "endereco_entrega_snapshot") else None,
        valor_total=sale.valor_total,
        status=sale.status,
        items=[
            {
                "id": it.id,
                "product_id": it.product_id,
                "quantidade": it.quantidade,
                "preco_unitario": it.preco_unitario,
                "subtotal": it.subtotal,
                "product_sku": it.product.sku if it.product else None,
                "product_nome": it.product.nome if it.product else None
            }
            for it in sale.items
        ]
    )


# ==========================================
# QUEBRAS E AVARIAS DE ESTOQUE
# ==========================================
@router.post("/inventory/loss", response_model=InventoryLossResponse, status_code=status.HTTP_201_CREATED)
def record_inventory_loss(loss_in: InventoryLossCreate, db: Session = Depends(get_db)):
    """
    Registra formalmente uma perda fisica no estoque (avaria, vencimento, quebra).
    Baixa o saldo do estoque sem gerar receita no caixa.
    """
    product = db.query(Product).filter(Product.id == loss_in.product_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto nao encontrado.")

    if product.estoque_atual < loss_in.quantidade:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Saldo insuficiente para baixa de quebra. Estoque atual: {product.estoque_atual}, solicitado: {loss_in.quantidade}."
        )

    product.estoque_atual -= loss_in.quantidade
    loss = InventoryLoss(
        product_id=product.id,
        quantidade=loss_in.quantidade,
        motivo=loss_in.motivo.upper(),
        observacao=loss_in.observacao
    )
    db.add(loss)
    db.commit()
    db.refresh(loss)

    return InventoryLossResponse(
        id=loss.id,
        product_id=loss.product_id,
        quantidade=loss.quantidade,
        motivo=loss.motivo,
        data_hora=loss.data_hora,
        observacao=loss.observacao,
        product_sku=product.sku,
        product_nome=product.nome
    )
