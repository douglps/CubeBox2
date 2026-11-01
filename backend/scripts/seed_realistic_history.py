"""
=============================================================================
GERADOR REALISTA DE BANCO DE DADOS (> 1 ANO: 01/10/2025 A 31/10/2026 - 396 DIAS)
=============================================================================
Projeto: CubeBox Enterprise
Objetivo:
    1. Realizar a limpeza total do banco de dados operacional (cubebox.db).
    2. Recriar todas as tabelas via SQLAlchemy ORM e aplicar migrações.
    3. Popular o catálogo oficial de produtos (23 itens reais de varejo) com estoque calibrado.
    4. Popular carteira realista de clientes (16 clientes verossímeis com CPF, telefone e endereço).
    5. Gerar série temporal contínua e realista de mais de 1 ano (13 meses: de 01/10/2025 a 31/10/2026 - 396 dias):
       - Sazonalidade anual e mensal (Carnaval, Natal/Ano Novo, meses frios, meses de verão).
       - Sazonalidade semanal (sextas, sábados e domingos com movimento bem maior).
       - Volatilidade de mercado (dias chuvosos/fracos e picos de eventos esportivos).
       - Mix de meios de pagamento (PIX 45%, Débito 25%, Crédito 20%, Dinheiro 10%).
       - Mix de atendimento (86% balcão, 14% delivery com taxa e endereço completo).
       - Clientes fidelizados CRM (LTV realista acumulado ao longo de 13 meses).
       - Taxa realista de cancelamentos (~5.2%).
       - Registro denso de perdas de estoque (avarias e vencimentos típicos de conveniência).
       - Histórico de mais de 100 ordens de compra periódicas (Purchase Orders) com atrasos e pendências.
       - Tensão de estoque na data final (31/10/2026): rupturas reais, alertas e itens críticos.
=============================================================================
"""
import random
import uuid
import sqlite3
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any

_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from backend.app.database import DB_PATH, engine, Base, SessionLocal
from backend.app.models import Product, Customer, CustomerAddress, Sale, SaleItem, InventoryLoss, PurchaseOrder
from backend.app.init_db import SKU_CATALOG, apply_migrations

REAL_CUSTOMERS: List[Dict[str, Any]] = [
    {
        "nome": "Mariana Silva Santos",
        "cpf_cnpj": "123.456.789-00",
        "telefone": "(11) 98765-4321",
        "email": "mariana.silva@email.com",
        "cep": "01310-100",
        "logradouro": "Avenida Paulista",
        "numero": "1578",
        "complemento": "Apt 82",
        "bairro": "Bela Vista",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Próximo ao MASP"
    },
    {
        "nome": "Carlos Eduardo de Souza",
        "cpf_cnpj": "234.567.890-11",
        "telefone": "(11) 97654-3210",
        "email": "carlos.souza@email.com",
        "cep": "04571-010",
        "logradouro": "Avenida Engenheiro Luís Carlos Berrini",
        "numero": "1050",
        "complemento": "Sala 402",
        "bairro": "Itaim Bibi",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Edifício Comercial Berrini"
    },
    {
        "nome": "Beatriz Mendes Ferreira",
        "cpf_cnpj": "345.678.901-22",
        "telefone": "(11) 96543-2109",
        "email": "beatriz.mendes@email.com",
        "cep": "01414-001",
        "logradouro": "Rua Oscar Freire",
        "numero": "920",
        "complemento": "Casa 2",
        "bairro": "Cerqueira César",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Esquina com Rua Haddock Lobo"
    },
    {
        "nome": "Lucas Oliveira Ramos",
        "cpf_cnpj": "456.789.012-33",
        "telefone": "(11) 95432-1098",
        "email": "lucas.ramos@email.com",
        "cep": "05407-002",
        "logradouro": "Rua Cardeal Arcoverde",
        "numero": "2100",
        "complemento": "Bloco B Apt 43",
        "bairro": "Pinheiros",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Próximo ao metrô Faria Lima"
    },
    {
        "nome": "Fernanda Lima de Carvalho",
        "cpf_cnpj": "567.890.123-44",
        "telefone": "(11) 94321-0987",
        "email": "fernanda.lima@email.com",
        "cep": "04002-031",
        "logradouro": "Rua Vergueiro",
        "numero": "1850",
        "complemento": "Apt 114",
        "bairro": "Vila Mariana",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Ao lado do Hospital Santa Catarina"
    },
    {
        "nome": "Rodrigo Alves Pires",
        "cpf_cnpj": "678.901.234-55",
        "telefone": "(11) 93210-9876",
        "email": "rodrigo.pires@email.com",
        "cep": "05001-100",
        "logradouro": "Avenida Francisco Matarazzo",
        "numero": "1350",
        "complemento": "Apt 51",
        "bairro": "Água Branca",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Em frente ao Parque da Água Branca"
    },
    {
        "nome": "Camila Guimarães Rocha",
        "cpf_cnpj": "789.012.345-66",
        "telefone": "(11) 92109-8765",
        "email": "camila.rocha@email.com",
        "cep": "03010-000",
        "logradouro": "Rua Miller",
        "numero": "450",
        "complemento": None,
        "bairro": "Brás",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Próximo ao Largo da Concórdia"
    },
    {
        "nome": "Thiago Barbosa Silveira",
        "cpf_cnpj": "890.123.456-77",
        "telefone": "(11) 91098-7654",
        "email": "thiago.silveira@email.com",
        "cep": "02012-000",
        "logradouro": "Rua Voluntários da Pátria",
        "numero": "2800",
        "complemento": "Apt 12B",
        "bairro": "Santana",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Próximo ao metrô Santana"
    },
    {
        "nome": "Juliana Castro Moreira",
        "cpf_cnpj": "901.234.567-88",
        "telefone": "(11) 99876-5432",
        "email": "juliana.castro@email.com",
        "cep": "04538-132",
        "logradouro": "Rua Brigadeiro Haroldo Veloso",
        "numero": "310",
        "complemento": "Casa",
        "bairro": "Itaim Bibi",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Travessa da Faria Lima"
    },
    {
        "nome": "Gustavo Henrique Neves",
        "cpf_cnpj": "012.345.678-99",
        "telefone": "(11) 98765-1122",
        "email": "gustavo.neves@email.com",
        "cep": "01227-200",
        "logradouro": "Rua General Jardim",
        "numero": "640",
        "complemento": "Apt 72",
        "bairro": "Vila Buarque",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Próximo ao Mackenzie"
    },
    {
        "nome": "Patricia Prado Azevedo",
        "cpf_cnpj": "135.246.357-12",
        "telefone": "(11) 97654-2233",
        "email": "patricia.azevedo@email.com",
        "cep": "04101-000",
        "logradouro": "Rua Domingos de Morais",
        "numero": "1400",
        "complemento": "Apt 33",
        "bairro": "Vila Mariana",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Metrô Ana Rosa"
    },
    {
        "nome": "Marcelo Dias Fontana",
        "cpf_cnpj": "246.357.468-23",
        "telefone": "(11) 96543-3344",
        "email": "marcelo.fontana@email.com",
        "cep": "05425-070",
        "logradouro": "Rua dos Pinheiros",
        "numero": "512",
        "complemento": "Apt 91",
        "bairro": "Pinheiros",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Entre Fradique e Mourato"
    },
    {
        "nome": "Renata Viana Albuquerque",
        "cpf_cnpj": "357.468.579-34",
        "telefone": "(11) 95432-4455",
        "email": "renata.viana@email.com",
        "cep": "04561-001",
        "logradouro": "Rua George Ohm",
        "numero": "205",
        "complemento": "Torre B Apt 1502",
        "bairro": "Brooklin",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Próximo à Estação Berrini"
    },
    {
        "nome": "Felipe Antunes Monteiro",
        "cpf_cnpj": "468.579.680-45",
        "telefone": "(11) 94321-5566",
        "email": "felipe.monteiro@email.com",
        "cep": "01452-000",
        "logradouro": "Avenida Brigadeiro Faria Lima",
        "numero": "2232",
        "complemento": "10º andar",
        "bairro": "Jardim Paulistano",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Shopping Iguatemi"
    },
    {
        "nome": "Tatiana Siqueira Prado",
        "cpf_cnpj": "579.680.791-56",
        "telefone": "(11) 93210-6677",
        "email": "tatiana.prado@email.com",
        "cep": "03310-000",
        "logradouro": "Rua Apucarana",
        "numero": "890",
        "complemento": "Apt 21",
        "bairro": "Tatuapé",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Próximo ao Colégio Santo Antônio"
    },
    {
        "nome": "Diego Martins Cavalcanti",
        "cpf_cnpj": "680.791.802-67",
        "telefone": "(11) 92109-7788",
        "email": "diego.cavalcanti@email.com",
        "cep": "04601-000",
        "logradouro": "Avenida Washington Luís",
        "numero": "4500",
        "complemento": "Bloco 4 Apt 12",
        "bairro": "Santo Amaro",
        "cidade": "São Paulo",
        "estado": "SP",
        "referencia": "Próximo ao Aeroporto de Congonhas"
    }
]

# Formas de pagamento estritamente aceitas no caixa / PDV
PAYMENT_BASE_METHODS = [
    "PIX",
    "Cartão Débito",
    "Cartão Crédito",
    "Dinheiro",
]
PAYMENT_BASE_WEIGHTS = [0.45, 0.25, 0.20, 0.10]


def choose_payment_method(subtotal: float, hour: int) -> str:
    """Gera um método de pagamento estritamente aceito no PDV (incluindo pagamentos múltiplos divididos no caixa)."""
    # 5% das vendas utilizam pagamentos divididos/múltiplos no caixa entre as formas aceitas
    if random.random() < 0.05 and subtotal >= 20.0:
        part1 = round(subtotal * random.uniform(0.3, 0.6), 2)
        part2 = round(subtotal - part1, 2)
        combo = random.choice([
            ("Dinheiro", "PIX"),
            ("Cartão Débito", "Cartão Crédito"),
            ("Dinheiro", "Cartão Débito"),
            ("Dinheiro", "Cartão Crédito"),
            ("PIX", "Cartão Crédito"),
            ("PIX", "Cartão Débito")
        ])
        return f"MÚLTIPLO ({combo[0]} R$ {part1:.2f} + {combo[1]} R$ {part2:.2f})"

    return random.choices(PAYMENT_BASE_METHODS, weights=PAYMENT_BASE_WEIGHTS, k=1)[0]


def wipe_and_seed_4_months():
    random.seed(42)  # Reprodutibilidade e determinismo estrito
    print(f"[1/6] Limpando todas as tabelas em: {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in cur.fetchall() if not r[0].startswith('sqlite_')]
    for t in tables:
        cur.execute(f"DELETE FROM {t}")
    conn.commit()
    cur.execute("VACUUM")
    conn.commit()
    conn.close()
    print("  -> Base truncada e compactada com sucesso (0 registros residuais).")

    print("[2/6] Garantindo integridade de schema e migrações no SQLite...")
    Base.metadata.create_all(bind=engine)
    apply_migrations()

    db = SessionLocal()
    try:
        print("[3/6] Inserindo Catálogo Oficial de Produtos (23 SKUs consagrados)...")
        created_products = []
        for item in SKU_CATALOG:
            # Configura um estoque inicial saudável para operar o período
            initial_stock = item["estoque_minimo"] * 4 + random.randint(20, 50)
            p = Product(
                sku=item["sku"],
                nome=item["nome"],
                categoria=item["categoria"],
                preco_unitario=item["preco_unitario"],
                custo_unitario=item["custo_unitario"],
                estoque_minimo=item["estoque_minimo"],
                lead_time_dias=item["lead_time_dias"],
                estoque_atual=initial_stock,
                status="ATIVO"
            )
            db.add(p)
            created_products.append(p)
        db.commit()

        # Recarregar com IDs persistidos
        products = db.query(Product).order_by(Product.id).all()
        prod_map = {p.id: p for p in products}
        print(f"  -> {len(products)} produtos cadastrados.")

        print("[4/6] Inserindo Carteira de Clientes CRM e Endereços...")
        created_customers = []
        for c_data in REAL_CUSTOMERS:
            cust = Customer(
                nome=c_data["nome"],
                cpf_cnpj=c_data["cpf_cnpj"],
                telefone=c_data["telefone"],
                email=c_data["email"],
                ativo=True,
                cep=c_data["cep"],
                logradouro=c_data["logradouro"],
                numero=c_data["numero"],
                complemento=c_data["complemento"],
                bairro=c_data["bairro"],
                cidade=c_data["cidade"],
                estado=c_data["estado"],
                referencia=c_data["referencia"]
            )
            db.add(cust)
            db.flush()

            # Endereço canônico na tabela relacional customer_addresses
            addr = CustomerAddress(
                customer_id=cust.id,
                apelido="Principal",
                cep=c_data["cep"],
                logradouro=c_data["logradouro"],
                numero=c_data["numero"],
                complemento=c_data["complemento"],
                bairro=c_data["bairro"],
                cidade=c_data["cidade"],
                estado=c_data["estado"],
                referencia=c_data["referencia"],
                is_default=True
            )
            db.add(addr)
            created_customers.append(cust)
        db.commit()
        customers = db.query(Customer).order_by(Customer.id).all()
        print(f"  -> {len(customers)} clientes CRM cadastrados com endereços padronizados.")

        print("[5/6] Gerando série temporal de mais de 1 ano (01/10/2025 até 31/10/2026 - 396 dias)...")
        end_date = datetime(2026, 10, 31, 23, 30, 0)
        start_date = datetime(2025, 10, 1, 8, 0, 0)
        total_days = (end_date.date() - start_date.date()).days + 1  # 396 dias (~13 meses)

        total_orders = 0
        total_revenue = 0.0
        canceled_orders = 0

        # Agrupamento de produtos por categoria para sorteio por afinidade
        prods_by_cat: Dict[str, List[Product]] = {}
        for p in products:
            prods_by_cat.setdefault(p.categoria, []).append(p)

        # Para cada dia do período
        for day_offset in range(total_days):
            current_day = start_date + timedelta(days=day_offset)
            weekday = current_day.weekday()  # 0: Seg, 4: Sex, 5: Sáb, 6: Dom
            month = current_day.month

            # Sazonalidade climática / época do ano:
            # - Dezembro e Janeiro: Festas de fim de ano, férias, calor extremo -> consumo alto de cerveja, gelo, carvão
            # - Fevereiro: Carnaval -> pico de bebidas e energéticos
            # - Junho e Julho: Inverno -> dias mais frios, queda de cerveja/gelo, estabilidade em snacks e mercearia
            is_summer_peak = month in (12, 1, 2)
            is_winter_slow = month in (6, 7)

            # Simulação de variações climáticas / dias atípicos no comércio (chuva torrencial, frio intenso ou feriado calmo)
            is_rainy_or_slow_day = random.random() < 0.11  # ~11% dos dias são fracos/chuvosos
            is_peak_holiday_event = random.random() < 0.05 or (month == 12 and current_day.day in (24, 31))

            # Volume diário realista com volatilidade de mercado e mix de 93 SKUs
            if is_rainy_or_slow_day:
                daily_volume = random.randint(8, 15)  # Dia fraco/chuvoso
            elif is_peak_holiday_event:
                daily_volume = random.randint(40, 65)  # Dia de pico de feriado / evento
            elif weekday in (4, 5):  # Sex e Sáb: maior movimento padrão
                base_high = 26 if is_summer_peak else (18 if is_winter_slow else 22)
                daily_volume = random.randint(base_high, base_high + 16)
            elif weekday == 6:  # Dom: conveniência, carvão, churrasco, gelo
                base_dom = 18 if is_summer_peak else (14 if is_winter_slow else 16)
                daily_volume = random.randint(base_dom, base_dom + 12)
            else:  # Seg a Qui: dias úteis normais
                base_util = 12 if is_summer_peak else (9 if is_winter_slow else 11)
                daily_volume = random.randint(base_util, base_util + 9)

            for order_idx in range(daily_volume):
                # Concentração realista de horários de conveniência: pico 17h às 23h
                if random.random() < 0.65:
                    hour = random.randint(17, 23)
                elif random.random() < 0.20:
                    hour = random.randint(11, 14)  # Almoço
                else:
                    hour = random.randint(8, 16)

                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                order_dt = current_day.replace(hour=hour, minute=minute, second=second)

                # Cliente CRM vinculado (20% de taxa de identificação com CPF)
                is_crm = random.random() < 0.20
                customer = random.choice(customers) if is_crm else None

                # Modalidade: Balcão vs Entrega (14% delivery)
                is_delivery = random.random() < 0.14
                tipo_entrega = "ENTREGA" if is_delivery else "BALCAO"
                taxa_entrega = 12.00 if is_delivery else 0.0

                # Status da venda (4.5% de cancelamento no balcão e 9.0% no delivery por endereço não encontrado/demora)
                cancel_prob = 0.09 if is_delivery else 0.045
                is_canceled = random.random() < cancel_prob
                order_status = "CANCELADO" if is_canceled else "CONCLUIDO"
                if is_canceled:
                    canceled_orders += 1

                # =============================================================
                # COMPOSIÇÃO DA CESTA & OUTLIERS REALISTAS DE CONSUMO
                # =============================================================
                is_outlier_sale = random.random() < 0.04  # 4% de cestas outliers
                subtotal = 0.0
                order_items_temp = []

                if is_outlier_sale:
                    # Cestas atípicas legítimas de comércio/conveniência
                    outlier_type = random.choice(["CHURRASCO", "ADEGA_VIP", "TABACARIA_ATACADO", "CORP_PARTY", "MICRO"])
                    items_to_add = []

                    if outlier_type == "CHURRASCO":
                        cervs = random.sample(prods_by_cat.get("Cervejas", products), k=min(2, len(prods_by_cat.get("Cervejas", []))))
                        gelo = prods_by_cat.get("Gelo e Carvão", products)
                        ref = prods_by_cat.get("Refrigerantes", products)
                        cong = prods_by_cat.get("Congelados", products)
                        for c in cervs:
                            items_to_add.append((c, random.choice([12, 18, 24])))
                        if gelo:
                            items_to_add.append((random.choice(gelo), random.choice([3, 4, 5])))
                        if ref:
                            items_to_add.append((random.choice(ref), random.choice([3, 4, 6])))
                        if cong:
                            items_to_add.append((random.choice(cong), random.choice([2, 3])))

                    elif outlier_type == "ADEGA_VIP":
                        dests = prods_by_cat.get("Destilados", products)
                        vinhos = prods_by_cat.get("Vinhos", products)
                        engs = prods_by_cat.get("Energéticos", products)
                        gelo = prods_by_cat.get("Gelo e Carvão", products)
                        if dests:
                            items_to_add.append((random.choice(dests), random.choice([1, 2])))
                        if vinhos and random.random() < 0.5:
                            items_to_add.append((random.choice(vinhos), random.choice([1, 2, 3])))
                        if engs:
                            items_to_add.append((random.choice(engs), random.choice([6, 8, 12])))
                        if gelo:
                            items_to_add.append((random.choice(gelo), random.choice([1, 2])))

                    elif outlier_type == "TABACARIA_ATACADO":
                        tabs = prods_by_cat.get("Tabacaria e Afins", products)
                        cigarros = [t for t in tabs if "Cigarro" in t.nome] or tabs
                        acessorios = [t for t in tabs if "Isqueiro" in t.nome or "Seda" in t.nome] or tabs
                        items_to_add = [
                            (random.choice(cigarros), random.choice([10, 20])),
                            (random.choice(acessorios), random.choice([2, 3]))
                        ]

                    elif outlier_type == "CORP_PARTY":
                        vinhos = prods_by_cat.get("Vinhos", products)
                        congs = prods_by_cat.get("Congelados", products)
                        chocs = prods_by_cat.get("Doces", products)
                        cervs = prods_by_cat.get("Cervejas", products)
                        if vinhos:
                            items_to_add.append((random.choice(vinhos), random.choice([2, 4])))
                        if cervs:
                            items_to_add.append((random.choice(cervs), random.choice([12, 18])))
                        if congs:
                            items_to_add.append((random.choice(congs), random.choice([3, 4])))
                        if chocs:
                            items_to_add.append((random.choice(chocs), random.choice([3, 5])))

                    else:  # MICRO OUTLIER (R$ 1.70 a R$ 3.50)
                        impulso_prods = [p for p in products if p.preco_unitario <= 3.50] or products
                        items_to_add = [(random.choice(impulso_prods), 1)]

                    for prod, qty in items_to_add:
                        price = prod.preco_unitario
                        item_sub = round(qty * price, 2)
                        subtotal += item_sub
                        order_items_temp.append((prod.id, qty, price, item_sub))

                else:
                    # Pedido comum com distribuição por horário
                    if hour <= 10:
                        candidate_cats = ["Mercearia", "Snacks", "Tabacaria e Afins", "Doces", "Refrigerantes"]
                    elif 11 <= hour <= 14:
                        candidate_cats = ["Congelados", "Refrigerantes", "Doces", "Snacks", "Mercearia"]
                    elif 15 <= hour <= 18:
                        candidate_cats = ["Energéticos", "Snacks", "Doces", "Refrigerantes", "Tabacaria e Afins"]
                    else:
                        candidate_cats = ["Cervejas", "Vinhos", "Destilados", "Gelo e Carvão", "Snacks", "Tabacaria e Afins"]

                    pool = [p for p in products if p.categoria in candidate_cats] or products
                    num_items = random.choices([1, 2, 3, 4], weights=[0.48, 0.32, 0.14, 0.06], k=1)[0]
                    chosen_products = random.sample(pool, k=min(num_items, len(pool)))

                    for prod in chosen_products:
                        if prod.categoria in ("Cervejas", "Refrigerantes", "Doces"):
                            qty = random.choices([1, 2, 3, 4, 6], weights=[0.50, 0.25, 0.13, 0.08, 0.04], k=1)[0]
                        else:
                            qty = random.choices([1, 2, 3], weights=[0.75, 0.20, 0.05], k=1)[0]

                        price = prod.preco_unitario
                        item_subtotal = round(qty * price, 2)
                        subtotal += item_subtotal
                        order_items_temp.append((prod.id, qty, price, item_subtotal))

                subtotal = round(subtotal, 2)

                # Forma de pagamento estritamente aceita no PDV
                payment = choose_payment_method(subtotal, hour)

                # Desconto promocional pontual (10% dos pedidos)
                desc_perc = 0.0
                desc_val = 0.0
                if random.random() < 0.10:
                    desc_perc = random.choice([5.0, 10.0])
                    desc_val = round(subtotal * (desc_perc / 100.0), 2)

                valor_total = round(max(0.0, subtotal - desc_val) + taxa_entrega, 2)
                numero_pedido = f"PED-{order_dt.strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

                cpf_nota = customer.cpf_cnpj if (customer and customer.cpf_cnpj) else None
                endereco_snapshot = None
                if is_delivery:
                    if customer and customer.logradouro:
                        endereco_snapshot = f"{customer.logradouro}, {customer.numero} - {customer.bairro}, {customer.cidade}/{customer.estado}"
                    else:
                        endereco_snapshot = "Avenida Paulista, 1000 - Bela Vista, São Paulo/SP"

                sale = Sale(
                    numero_pedido=numero_pedido,
                    customer_id=customer.id if customer else None,
                    data_hora=order_dt,
                    forma_pagamento=payment,
                    subtotal=subtotal,
                    percentual_desconto=desc_perc,
                    valor_desconto=desc_val,
                    tipo_entrega=tipo_entrega,
                    taxa_entrega=taxa_entrega,
                    cpf_nota=cpf_nota,
                    endereco_entrega_snapshot=endereco_snapshot,
                    valor_total=valor_total,
                    status=order_status
                )
                db.add(sale)
                db.flush()

                for prod_id, qty, price, item_sub in order_items_temp:
                    sale_item = SaleItem(
                        sale_id=sale.id,
                        product_id=prod_id,
                        quantidade=qty,
                        preco_unitario=price,
                        subtotal=item_sub
                    )
                    db.add(sale_item)

                total_orders += 1
                if order_status == "CONCLUIDO":
                    total_revenue += valor_total

        # Inserção de Perdas de Estoque Realistas (Avarias, Vencimentos e Furto/Divergência)
        print("[6/6] Registrando perdas e avarias de estoque realistas de varejo...")
        loss_reasons = ["AVARIA", "VENCIMENTO", "AVARIA", "AVARIA", "VENCIMENTO"]
        loss_descriptions = {
            "AVARIA": ["Lata amassada no manuseio/transporte", "Garrafa trincada no recebimento", "Embalagem rasgada na gôndola"],
            "VENCIMENTO": ["Item ultrapassou validade nas gôndolas", "Lote vencido recolhido da câmara fria", "Atingiu prazo limite de descarte"]
        }

        # Todos os 23 produtos sofrem perdas e quebras realistas ao longo dos 13 meses (entre 10 a 25 ocorrências cada)
        total_losses = 0
        for prod in products:
            num_occurrences = random.randint(10, 25)
            for _ in range(num_occurrences):
                loss_day = start_date + timedelta(days=random.randint(2, total_days - 2))
                loss_hour = random.randint(8, 22)
                loss_dt = loss_day.replace(hour=loss_hour, minute=random.randint(0, 59))
                reason = random.choice(loss_reasons)
                obs = random.choice(loss_descriptions[reason])
                loss_qty = random.choices([1, 2, 3, 4, 6], weights=[0.55, 0.25, 0.12, 0.05, 0.03], k=1)[0]
                loss = InventoryLoss(
                    product_id=prod.id,
                    quantidade=loss_qty,
                    motivo=reason,
                    data_hora=loss_dt,
                    observacao=obs
                )
                db.add(loss)
                total_losses += 1

        print(f"  -> {total_losses} ocorrências de perda/avaria registradas na base.")

        # Inserção de Ordens de Compra (Purchase Orders) periódicas ao longo dos 13 meses
        po_counter = 1
        for prod in products:
            # 4 a 7 ordens históricas recebidas para cada produto ao longo do ano
            num_pos = random.randint(4, 7)
            po_days = sorted(random.sample(range(5, total_days - 10), num_pos))
            for day_offset in po_days:
                po_dt = start_date + timedelta(days=day_offset)
                po = PurchaseOrder(
                    numero_pedido=f"OC-2025_26-{po_counter:04d}",
                    product_id=prod.id,
                    quantidade=random.randint(25, 60),
                    status="RECEBIDO",
                    data_pedido=po_dt,
                    data_recebimento=po_dt + timedelta(days=prod.lead_time_dias)
                )
                db.add(po)
                po_counter += 1

        # Ordens de compra recentes pendentes de entrega (algumas atrasadas gerando tensão na reposição)
        for prod in random.sample(products, 6):
            days_ago = random.choice([1, 2, 5])  # 5 dias atrás com lead time 2 a 3 significa atraso do fornecedor
            po_pending = PurchaseOrder(
                numero_pedido=f"OC-2026-{po_counter:04d}",
                product_id=prod.id,
                quantidade=random.randint(20, 40),
                status="PENDENTE",
                data_pedido=end_date - timedelta(days=days_ago),
                data_recebimento=None
            )
            db.add(po_pending)
            po_counter += 1

        # Ajuste de estoque final operacional REALISTA na data de 31/10/2026 (93 SKUs):
        # - 4 SKUs com RUPTURA TOTAL (Estoque = 0)
        # - 10 SKUs em ESTADO CRÍTICO (Abaixo do estoque mínimo: entre 20% e 75% do mínimo)
        # - 12 SKUs em ALERTA (Muito próximo do estoque mínimo: entre 1.02x e 1.25x do mínimo)
        # - 67 SKUs com estoque operacional saudável moderado (entre 1.4x e 2.4x do mínimo)
        # Selecionamos SKUs específicos para ruptura garantindo que SKUs de teste (SKU-BEB-001 e SKU-CHUR-001) fiquem com saldo positivo
        predefined_ruptures = {"SKU-BEB-002", "SKU-DOC-003", "SKU-VIN-002", "SKU-CONG-004"}
        rupture_skus = [p for p in products if p.sku in predefined_ruptures]

        # Garantir saldo operacional saudável para itens frequentes de teste
        for prod in products:
            if prod.sku == "SKU-BEB-001":
                prod.estoque_atual = 45
            elif prod.sku == "SKU-CHUR-001":
                prod.estoque_atual = 25

        other_prods = [
            p for p in products
            if p not in rupture_skus and p.sku not in ("SKU-BEB-001", "SKU-CHUR-001")
        ]
        random.shuffle(other_prods)

        critical_skus = other_prods[:10]
        alert_skus = other_prods[10:22]
        healthy_skus = other_prods[22:]

        for prod in rupture_skus:
            prod.estoque_atual = 0

        for prod in critical_skus:
            prod.estoque_atual = max(1, int(prod.estoque_minimo * random.uniform(0.20, 0.75)))

        for prod in alert_skus:
            prod.estoque_atual = int(prod.estoque_minimo * random.uniform(1.02, 1.25))

        for prod in healthy_skus:
            prod.estoque_atual = int(prod.estoque_minimo * random.uniform(1.40, 2.40))

        db.commit()
        print(f"\n[SUCESSO COMPLETO]")
        print(f"  - Período coberto: {start_date.strftime('%d/%m/%Y')} a {end_date.strftime('%d/%m/%Y')} ({total_days} dias)")
        print(f"  - Total de pedidos gerados: {total_orders}")
        print(f"  - Pedidos cancelados: {canceled_orders}")
        print(f"  - Faturamento líquido concluído: R$ {total_revenue:,.2f}")
        print(f"  - Estoque final equalizado e pronto para operação!")
    finally:
        db.close()


if __name__ == "__main__":
    wipe_and_seed_4_months()
