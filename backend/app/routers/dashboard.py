"""
Rotas para Métricas e Indicadores Consolidados do Dashboard Executivo.
Atende a US-API-01, US-UI-01 e SDD-CBOX-API-V1.0.0.
Permite filtragem temporal flexível (30d, mês, trimestre, semestre, 1 ano, tudo)
e comutação de inclusão de pedidos cancelados.
"""
from datetime import datetime, timedelta
from typing import Optional, Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database import get_db
from backend.app.models import Product, Sale, InventoryLoss
from backend.app.schemas import DashboardKPIs, DailySalesTrendItem

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Executivo"])

PeriodType = Literal["30d", "mes", "trimestre", "semestre", "1ano", "tudo"]


def calculate_start_date(period: PeriodType) -> Optional[datetime]:
    """Calcula a data/hora inicial de acordo com a janela temporal selecionada."""
    now = datetime.now()
    today_start = datetime(now.year, now.month, now.day)

    if period == "30d":
        return today_start - timedelta(days=29)
    elif period == "mes":
        return datetime(now.year, now.month, 1)
    elif period == "trimestre":
        return today_start - timedelta(days=90)
    elif period == "semestre":
        return today_start - timedelta(days=180)
    elif period == "1ano":
        return today_start - timedelta(days=365)
    elif period == "tudo":
        return None
    return today_start - timedelta(days=29)


@router.get("/kpis", response_model=DashboardKPIs)
def get_dashboard_kpis(
    period: PeriodType = Query("30d", description="Janela temporal: 30d, mes, trimestre, semestre, 1ano, tudo"),
    include_canceled: bool = Query(True, description="Se True, computa todas as vendas incluindo CANCELADO"),
    db: Session = Depends(get_db)
):
    """
    Retorna faturamento líquido, volume de pedidos, ticket médio, perdas
    e tendência agregada conforme o período selecionado.
    """
    start_dt = calculate_start_date(period)

    # 1. Agregação de Vendas (inclui vendas canceladas por padrão)
    sales_query = db.query(
        func.sum(Sale.valor_total).label("total_faturamento"),
        func.count(Sale.id).label("total_vendas")
    )
    if not include_canceled:
        sales_query = sales_query.filter(Sale.status != "CANCELADO")
    if start_dt:
        sales_query = sales_query.filter(Sale.data_hora >= start_dt)

    sales_agg = sales_query.first()
    total_faturamento = float(sales_agg.total_faturamento or 0.0) if sales_agg else 0.0
    total_pedidos = int(sales_agg.total_vendas or 0) if sales_agg else 0
    ticket_medio = round(total_faturamento / total_pedidos, 2) if total_pedidos > 0 else 0.0

    # 2. Total de perdas financeiras por quebras/avarias no período
    losses_query = db.query(InventoryLoss, Product).join(Product, InventoryLoss.product_id == Product.id)
    if start_dt:
        losses_query = losses_query.filter(InventoryLoss.data_hora >= start_dt)
    losses = losses_query.all()
    total_perdas = sum(loss.quantidade * prod.custo_unitario for loss, prod in losses)

    # 3. Produtos em estoque crítico (fotografia pontual em tempo real)
    criticos_count = db.query(Product).filter(Product.estoque_atual <= Product.estoque_minimo).count()
    total_itens = db.query(Product).count()

    # 4. Tendência de vendas agregada por período
    trend_sales_query = db.query(Sale)
    if not include_canceled:
        trend_sales_query = trend_sales_query.filter(Sale.status != "CANCELADO")
    if start_dt:
        trend_sales_query = trend_sales_query.filter(Sale.data_hora >= start_dt)

    sales_in_range = trend_sales_query.order_by(Sale.data_hora.asc()).all()

    # Granularidade dinâmica: agrupamento por dia (para <=90 dias) ou por mês (para semestres/ano)
    daily_trend = []
    if period in ["semestre", "1ano", "tudo"]:
        grouped = {}
        for s in sales_in_range:
            m_key = s.data_hora.strftime("%m/%Y")
            if m_key not in grouped:
                grouped[m_key] = {"count": 0, "rev": 0.0}
            grouped[m_key]["count"] += 1
            grouped[m_key]["rev"] += s.valor_total

        for m_key, data in grouped.items():
            daily_trend.append(DailySalesTrendItem(
                date=m_key,
                sales_count=data["count"],
                total_revenue=round(data["rev"], 2)
            ))
    else:
        # Agrupamento dia a dia
        sales_by_day = {}
        for s in sales_in_range:
            d_str = s.data_hora.strftime("%d/%m")
            if d_str not in sales_by_day:
                sales_by_day[d_str] = {"count": 0, "rev": 0.0}
            sales_by_day[d_str]["count"] += 1
            sales_by_day[d_str]["rev"] += s.valor_total

        # Preenche os dias contínuos se houver start_dt
        if start_dt:
            now_dt = datetime.now()
            num_days = (now_dt.date() - start_dt.date()).days + 1
            for day_i in range(max(1, min(num_days, 100))):
                curr_d = start_dt.date() + timedelta(days=day_i)
                d_str = curr_d.strftime("%d/%m")
                day_data = sales_by_day.get(d_str, {"count": 0, "rev": 0.0})
                daily_trend.append(DailySalesTrendItem(
                    date=d_str,
                    sales_count=day_data["count"],
                    total_revenue=round(day_data["rev"], 2)
                ))
        else:
            for d_str, day_data in sales_by_day.items():
                daily_trend.append(DailySalesTrendItem(
                    date=d_str,
                    sales_count=day_data["count"],
                    total_revenue=round(day_data["rev"], 2)
                ))

    return DashboardKPIs(
        faturamento_liquido=round(total_faturamento, 2),
        total_pedidos=total_pedidos,
        ticket_medio=ticket_medio,
        total_perdas_avarias=round(total_perdas, 2),
        itens_em_risco_ruptura=criticos_count,
        total_itens_estoque=total_itens,
        daily_sales_trend=daily_trend
    )
