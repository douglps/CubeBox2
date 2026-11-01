"""
Rotas de Inteligência Preditiva e Sugestão de Compras (Model Serving).
Atende a US-API-02 e SDD-CBOX-API-V1.0.0:
- GET /api/ml/forecast (Projeção com Random Forest)
- GET /api/ml/reorder-suggestions (Fórmula de ressuprimento inteligente)
- GET /api/ml/clusters (Agrupamento e anomalias DBSCAN)
- POST /api/purchases (Emissão de ordens de compra)
- PATCH /api/purchases/{id}/receive (Confirmação de recebimento físico)
"""
import uuid
import time
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import Product, PurchaseOrder, InventoryLoss
from backend.app.schemas import (
    ForecastResponse,
    ForecastBatchRequest,
    ForecastBatchResponse,
    ReorderSuggestionResponse,
    ClusterProductInfo,
    PurchaseOrderCreate,
    PurchaseOrderResponse
)
from backend.app.services.ml_service import ml_service

router = APIRouter(prefix="/api", tags=["Inteligência Preditiva & Suprimentos"])


# ==========================================
# MODEL SERVING: PROJEÇÃO DE DEMANDA (RANDOM FOREST)
# ==========================================
@router.get("/ml/forecast", response_model=ForecastResponse)
def get_demand_forecast(
    sku: Optional[str] = None,
    product_id: Optional[int] = None,
    dias: int = 7,
    horizon_days: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Gera projeção diária de vendas para os próximos N dias usando o Random Forest."""
    eff_dias = horizon_days or dias
    if not sku and not product_id:
        raise HTTPException(status_code=400, detail="Parâmetro 'sku' ou 'product_id' é obrigatório.")

    if product_id:
        product = db.query(Product).filter(Product.id == product_id).first()
    else:
        product = db.query(Product).filter(Product.sku == sku).first()

    if not product:
        identifier = f"ID {product_id}" if product_id else f"SKU '{sku}'"
        raise HTTPException(status_code=404, detail=f"Produto com {identifier} não encontrado.")

    try:
        daily_proj = ml_service.predict_demand_7d(sku=product.sku, days=eff_dias)
        total_previsto = sum(item['demanda_prevista'] for item in daily_proj)

        return ForecastResponse(
            sku=product.sku,
            product_nome=product.nome,
            total_previsto_horizonte=round(total_previsto, 1),
            projecao_diaria=daily_proj
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))


@router.post("/ml/forecast/batch", response_model=ForecastBatchResponse)
def get_demand_forecast_batch(
    payload: ForecastBatchRequest,
    db: Session = Depends(get_db)
):
    """
    Gera projeções diárias em lote (Batch Forecasting) para múltiplos produtos em um único round-trip.
    Reduz overhead de rede e latência no comparador preditivo multi-SKU.
    """
    horizon = payload.horizon_days or 7
    query = db.query(Product)

    if payload.product_ids:
        products = query.filter(Product.id.in_(payload.product_ids)).all()
    elif payload.skus:
        products = query.filter(Product.sku.in_(payload.skus)).all()
    else:
        raise HTTPException(status_code=400, detail="Forneça ao menos 'product_ids' ou 'skus'.")

    forecasts: List[ForecastResponse] = []
    for prod in products:
        try:
            daily_proj = ml_service.predict_demand_7d(sku=prod.sku, days=horizon)
            total_previsto = sum(item['demanda_prevista'] for item in daily_proj)
            forecasts.append(ForecastResponse(
                sku=prod.sku,
                product_nome=prod.nome,
                total_previsto_horizonte=round(total_previsto, 1),
                projecao_diaria=daily_proj
            ))
        except Exception:
            # Fallback seguro caso falhe em um SKU isolado
            continue

    return ForecastBatchResponse(
        forecasts=forecasts,
        horizon_days=horizon
    )


# ==========================================
# MODEL SERVING: SUGESTÃO DE REABASTECIMENTO
# ==========================================
_REORDER_CACHE = {
    "timestamp": 0.0,
    "data": []
}


def update_cache_product_inventory(product_id: int, new_estoque: int):
    """Atualiza cirurgicamente o item afetado no cache em memória sem recalcular toda a IA."""
    global _REORDER_CACHE
    if not _REORDER_CACHE["data"]:
        return
    for item in _REORDER_CACHE["data"]:
        if item.product_id == product_id:
            item.estoque_atual = new_estoque
            taxa_quebra = item.taxa_quebra_hist or 0.01
            perdas = item.demanda_prevista_7d * taxa_quebra
            qtd = (item.demanda_prevista_7d + item.estoque_minimo + perdas) - new_estoque
            item.quantidade_sugerida = max(0, int(round(qtd)))
            break


def invalidate_reorder_cache():
    """Invalida o cache para forçar recálculo na próxima requisição ou após emissão de ordens."""
    global _REORDER_CACHE
    _REORDER_CACHE["timestamp"] = 0.0
    _REORDER_CACHE["data"] = []


@router.get("/ml/reorder-suggestions", response_model=List[ReorderSuggestionResponse])
def get_reorder_suggestions(force: bool = False, db: Session = Depends(get_db)):
    """
    Calcula sugestão automatizada de compras para todos os produtos:
    Qtd Compra = max(0, Demanda 7D + Estoque Minimo + Perdas Estimadas - Estoque Atual)
    Incorpora risco probabilístico pelo Gaussian Naive Bayes e cluster DBSCAN.
    Utiliza cache em memória com TTL de 5 minutos para performance sub-segundo.
    """
    global _REORDER_CACHE
    now = time.time()
    if not force and _REORDER_CACHE["data"] and (now - _REORDER_CACHE["timestamp"] < 300):
        return _REORDER_CACHE["data"]

    products = db.query(Product).all()
    suggestions = []
    today_weekday = datetime.now().weekday()

    # Busca todas as ordens de compra PENDENTES (em trânsito)
    pending_orders = db.query(PurchaseOrder.product_id, PurchaseOrder.quantidade).filter(
        PurchaseOrder.status == "PENDENTE"
    ).all()
    pending_map: dict[int, int] = {}
    for pid, qty in pending_orders:
        pending_map[pid] = pending_map.get(pid, 0) + qty

    clusters_data = {c['sku']: c for c in ml_service.get_clusters_summary()}

    for prod in products:
        c_info = clusters_data.get(prod.sku, {})
        media_diaria = c_info.get('media_diaria', 20.0)
        cluster_label = c_info.get('cluster_label', 'Giro Padrão')

        # Demanda prevista para 7 dias via Random Forest
        try:
            forecasts = ml_service.predict_demand_7d(sku=prod.sku, days=7)
            demanda_7d = sum(f['demanda_prevista'] for f in forecasts)
        except Exception:
            demanda_7d = media_diaria * 7.0

        # Risco de ruptura via Regressão Logística Multinomial Calibrada
        risk_result = ml_service.predict_risk(
            estoque_atual=prod.estoque_atual,
            media_movel=media_diaria,
            weekday=today_weekday
        )
        risco_label = risk_result.get('risco', 'Baixo Risco') if isinstance(risk_result, dict) else str(risk_result)
        prob_alto = risk_result.get('probabilidade_alto_risco', 0.0) if isinstance(risk_result, dict) else 0.0

        # Taxa de quebra estimada
        taxa_quebra = 0.01
        perdas_estimadas = demanda_7d * taxa_quebra

        # Fórmula de Ressuprimento Formal do SDD considerando ordens já emitidas em trânsito:
        # Qtd = max(0, Demanda + Estoque_Minimo + Perdas - (Estoque_Atual + Qtd_Pendente))
        qtd_pendente = pending_map.get(prod.id, 0)
        estoque_projetado = prod.estoque_atual + qtd_pendente
        qtd_necessaria = (demanda_7d + prod.estoque_minimo + perdas_estimadas) - estoque_projetado
        qtd_sugerida = max(0, int(round(qtd_necessaria)))

        # Se já existe ordem pendente suficiente para cobrir o risco ou se a quantidade necessária é zero,
        # o item não precisa mais de nova compra recomendada
        if qtd_pendente > 0 and qtd_sugerida == 0 and risco_label == 'Alto Risco':
            risco_label = 'Medio Risco'

        suggestions.append(ReorderSuggestionResponse(
            product_id=prod.id,
            sku=prod.sku,
            nome_produto=prod.nome,
            categoria=prod.categoria,
            estoque_atual=prod.estoque_atual,
            estoque_minimo=prod.estoque_minimo,
            demanda_prevista_7d=round(demanda_7d, 1),
            taxa_quebra_hist=taxa_quebra,
            quantidade_sugerida=qtd_sugerida,
            risco_ruptura=risco_label,
            probabilidade_ruptura_pct=round(prob_alto, 1),
            cluster_giro=cluster_label
        ))

    # Ordenar por prioridade: Alto Risco primeiro e maior quantidade sugerida
    order_map = {'Alto Risco': 0, 'Médio Risco': 1, 'Medio Risco': 1, 'Baixo Risco': 2}
    suggestions.sort(key=lambda s: (order_map.get(s.risco_ruptura, 3), -s.quantidade_sugerida))
    _REORDER_CACHE = {"timestamp": now, "data": suggestions}
    return suggestions


# ==========================================
# MODEL SERVING: SEGMENTAÇÃO DBSCAN
# ==========================================
@router.get("/ml/clusters", response_model=List[ClusterProductInfo])
def get_clusters():
    """Retorna o mapeamento de produtos por clusters e anomalias do DBSCAN."""
    clusters_raw = ml_service.get_clusters_summary()
    return [
        ClusterProductInfo(
            sku=c['sku'],
            product_name=c['product_name'],
            category=c['category'],
            media_diaria=round(c['media_diaria'], 2),
            volatilidade_demanda=round(c['volatilidade_demanda'], 2),
            cluster=c['cluster'],
            cluster_label=c['cluster_label']
        )
        for c in clusters_raw
    ]


# ==========================================
# ORDENS DE COMPRA & CONFIRMAÇÃO DE RECEBIMENTO
# ==========================================
@router.post("/purchases", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
def create_purchase_order(order_in: PurchaseOrderCreate, db: Session = Depends(get_db)):
    """Cria uma nova ordem de compra (aprovada no Cockpit Preditivo)."""
    product = db.query(Product).filter(Product.id == order_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado.")

    num_pedido = f"OC-{datetime.now().strftime('%Y%m%d%H%M')}-{uuid.uuid4().hex[:4].upper()}"
    po = PurchaseOrder(
        numero_pedido=num_pedido,
        product_id=product.id,
        quantidade=order_in.quantidade,
        status="PENDENTE"
    )
    db.add(po)
    db.commit()
    db.refresh(po)

    # Invalida o cache para que a linha com ordem emitida seja recalculada / atualizada na interface
    invalidate_reorder_cache()

    return PurchaseOrderResponse(
        id=po.id,
        numero_pedido=po.numero_pedido,
        product_id=po.product_id,
        quantidade=po.quantidade,
        status=po.status,
        data_pedido=po.data_pedido,
        data_recebimento=po.data_recebimento,
        product_sku=product.sku,
        product_nome=product.nome
    )


@router.get("/purchases", response_model=List[PurchaseOrderResponse])
def list_purchases(db: Session = Depends(get_db)):
    """Lista ordens de compra emitidas."""
    orders = db.query(PurchaseOrder).order_by(PurchaseOrder.data_pedido.desc()).all()
    res = []
    for o in orders:
        res.append(PurchaseOrderResponse(
            id=o.id,
            numero_pedido=o.numero_pedido,
            product_id=o.product_id,
            quantidade=o.quantidade,
            status=o.status,
            data_pedido=o.data_pedido,
            data_recebimento=o.data_recebimento,
            product_sku=o.product.sku if o.product else None,
            product_nome=o.product.nome if o.product else None
        ))
    return res


@router.patch("/purchases/{order_id}/receive", response_model=PurchaseOrderResponse)
def receive_purchase_order(order_id: int, db: Session = Depends(get_db)):
    """
    Confirma o recebimento fisico da mercadoria:
    - Altera o status para RECEBIDO.
    - Incrementa atomicamente o estoque fisico do SKU correspondente.
    """
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).with_for_update().first()
    if not po:
        raise HTTPException(status_code=404, detail="Ordem de compra nao encontrada.")

    if po.status == "RECEBIDO":
        raise HTTPException(status_code=400, detail="Esta ordem de compra ja foi recebida anteriormente.")

    po.status = "RECEBIDO"
    po.data_recebimento = datetime.now()

    # Incremento de estoque
    product = db.query(Product).filter(Product.id == po.product_id).with_for_update().first()
    if product:
        product.estoque_atual += po.quantidade
        update_cache_product_inventory(product.id, product.estoque_atual)

    db.commit()
    db.refresh(po)

    return PurchaseOrderResponse(
        id=po.id,
        numero_pedido=po.numero_pedido,
        product_id=po.product_id,
        quantidade=po.quantidade,
        status=po.status,
        data_pedido=po.data_pedido,
        data_recebimento=po.data_recebimento,
        product_sku=product.sku if product else None,
        product_nome=product.nome if product else None
    )
