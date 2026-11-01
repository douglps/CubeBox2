"""
=============================================================================
GERADOR DE DADOS HISTÓRICOS DE VENDAS (COM ERROS E POLUIÇÃO PROPOSITAIS)
=============================================================================
Projeto: CubeBox Mini
Objetivo deste arquivo:
    Criar um histórico falso (porém muito realista) de 6 meses (180 dias)
    de vendas de uma loja de conveniência.

    POR QUE COLOCAMOS ERROS DE PROPÓSITO?
    Na vida real, sistemas de caixa (PDV) sofrem com falhas: operadores
    apertam o botão duas vezes, esquecem de preencher dados, digitam números
    errados ou o sistema falha ao registrar uma data. 
    Para demonstrar que nosso projeto sabe identificar e consertar esses 
    problemas (processo chamado de Limpeza e Sanitização), nós geramos uma
    base "suja" (raw).
=============================================================================
"""

import os
import random
import sys
import uuid
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
import pandas as pd

# Garantir imports do backend
_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from backend.app.init_db import SKU_CATALOG

# ---------------------------------------------------------------------------
# 1. CATÁLOGO EXPANDIDO DE PRODUTOS DA LOJA (70+ SKUs reais de varejo)
# ---------------------------------------------------------------------------
# Definimos médias diárias (daily_avg) calibradas pelo perfil de consumo do varejo brasileiro
CATEGORY_DAILY_AVG = {
    "Cervejas": 28,
    "Vinhos": 8,
    "Refrigerantes": 25,
    "Energéticos": 18,
    "Destilados": 7,
    "Tabacaria e Afins": 22,
    "Snacks": 16,
    "Congelados": 12,
    "Doces": 20,
    "Gelo e Carvão": 10,
    "Higiene Pessoal": 7,
    "Mercearia": 8,
    "Limpeza": 6,
}

PRODUCTS_CATALOG = []
for item in SKU_CATALOG:
    cat = item["categoria"]
    base_avg = CATEGORY_DAILY_AVG.get(cat, 10)
    # Calibrações específicas por perfil de produto
    if "Heineken" in item["nome"] or "Coca-Cola" in item["nome"]:
        daily_avg = int(base_avg * 1.5)
    elif "DV Catena" in item["nome"] or "Black Label" in item["nome"]:
        daily_avg = max(2, int(base_avg * 0.4))  # Item premium de nicho
    elif "Garoto" in item["nome"] or "Trident" in item["nome"] or "Halls" in item["nome"]:
        daily_avg = int(base_avg * 1.6)  # Compra de impulso no caixa
    elif "Marlboro" in item["nome"]:
        daily_avg = int(base_avg * 1.4)
    else:
        daily_avg = base_avg

    PRODUCTS_CATALOG.append({
        "sku": item["sku"],
        "name": item["nome"],
        "category": cat,
        "base_price": item["preco_unitario"],
        "daily_avg": daily_avg
    })

# Formas de pagamento estritamente aceitas no caixa / PDV
PAYMENT_METHODS = [
    "PIX",
    "Cartão Débito",
    "Cartão Crédito",
    "Dinheiro",
]
PAYMENT_WEIGHTS = [0.45, 0.25, 0.20, 0.10]


def generate_raw_dataset(
    start_date: str = "2026-05-01",
    days: int = 180,
    random_state: int = 42,
    output_path: str = "data/raw/vendas_conveniencia_raw.csv",
) -> pd.DataFrame:
    """
    Função principal que cria todo o histórico de vendas dia a dia e adiciona os erros.
    
    Explicação dos parâmetros:
    - start_date: Data do primeiro dia de vendas a ser simulado (Ex: 01 de Maio de 2026).
    - days: Quantos dias no total vamos criar (180 dias = 6 meses de histórico).
    - random_state: Número que 'trava' o sorteio para sempre gerar exatamente os mesmos
      resultados no computador de qualquer pessoa (Reprodutibilidade).
    - output_path: Onde salvar o arquivo de planilha final (.csv).
    """
    # Fixamos as sementes de sorteio (assim, quem rodar este código verá os mesmos números)
    np.random.seed(random_state)
    random.seed(random_state)

    base_dt = datetime.strptime(start_date, "%Y-%m-%d")
    records = []

    print(f"[1/4] Simulando vendas realistas com catálogo expandido ({len(PRODUCTS_CATALOG)} produtos) ao longo de {days} dias...")

    # Passamos por cada dia (do dia 0 até o dia days - 1)
    for day_offset in range(days):
        current_date = base_dt + timedelta(days=day_offset)
        
        # Descobrimos qual é o dia da semana:
        # 0 = Segunda-feira, 4 = Sexta-feira, 5 = Sábado, 6 = Domingo
        day_of_week = current_date.weekday()
        is_weekend = day_of_week in [4, 5, 6]

        # COMPORTAMENTO REAL DE CONVENIÊNCIA:
        # Sextas, Sábados e Domingos têm grande aumento em bebidas alcoólicas, gelo, carvão e petiscos.
        for prod in PRODUCTS_CATALOG:
            cat = prod["category"]
            mult = 1.0
            if is_weekend:
                if cat in ["Cervejas", "Destilados", "Vinhos", "Gelo e Carvão"]:
                    mult = 2.1
                elif cat in ["Snacks", "Refrigerantes"]:
                    mult = 1.4
            else:
                if cat in ["Mercearia", "Congelados", "Higiene Pessoal"]:
                    mult = 1.1

            # Distribuição de Poisson para volume diário realista
            lambda_val = max(1, int(prod["daily_avg"] * mult * 0.4))  # Calibrado para ~60k transações em 180d
            num_sales = np.random.poisson(lam=lambda_val)

            for _ in range(num_sales):
                # Sorteamos o horário em conformidade com o hábito de consumo:
                if cat in ["Congelados", "Mercearia"]:
                    # Refeições concentradas no almoço e jantar
                    sale_hour = np.random.choice(
                        [11, 12, 13, 14, 18, 19, 20, 21],
                        p=[0.15, 0.25, 0.20, 0.10, 0.10, 0.10, 0.05, 0.05]
                    )
                elif cat in ["Cervejas", "Destilados", "Gelo e Carvão"]:
                    # Bebidas e churrasco concentrados do fim da tarde à madrugada
                    sale_hour = np.random.choice(
                        [16, 17, 18, 19, 20, 21, 22, 23, 0, 1],
                        p=[0.06, 0.09, 0.15, 0.18, 0.18, 0.14, 0.10, 0.05, 0.03, 0.02]
                    )
                else:
                    # Distribuição geral ao longo do dia
                    sale_hour = np.random.choice(
                        [8, 10, 12, 14, 16, 18, 19, 20, 21, 22],
                        p=[0.05, 0.08, 0.12, 0.10, 0.10, 0.15, 0.15, 0.12, 0.08, 0.05]
                    )

                sale_minute = np.random.randint(0, 60)
                sale_second = np.random.randint(0, 60)
                tx_time = current_date.replace(hour=sale_hour, minute=sale_minute, second=sale_second)

                # =============================================================
                # ESTRUTURA REALISTA DE QUANTIDADES & OUTLIERS DE CONSUMO
                # =============================================================
                # Simula compras típicas (1 a 4 unidades) e outliers legítimos (festas, fardos, churrascos)
                is_real_outlier_sale = random.random() < 0.035  # ~3.5% são grandes compras
                price = prod["base_price"]

                if is_real_outlier_sale:
                    # Outliers legítimos de consumo em conveniência:
                    if cat == "Cervejas":
                        qty = random.choice([12, 18, 24])  # Fardo de cerveja
                    elif cat == "Gelo e Carvão":
                        qty = random.choice([3, 4, 5])     # Abastecimento de festa/churrasco
                    elif cat == "Refrigerantes":
                        qty = random.choice([4, 6, 8])     # Múltiplos pets
                    elif cat == "Tabacaria e Afins" and "Cigarro" in prod["name"]:
                        qty = random.choice([10, 20])      # Pacote fechado de cigarros
                    elif cat in ["Vinhos", "Destilados"]:
                        qty = random.choice([2, 3, 4])     # Garrafas premium para presente/evento
                    elif cat == "Congelados":
                        qty = random.choice([4, 6])        # Estoque doméstico de pizzas/lasanhas
                    else:
                        qty = random.choice([5, 8, 10])    # Pacote de snacks ou chocolates
                else:
                    # Venda comum de balcão (55% leva 1 unidade, 25% leva 2 unidades...)
                    if cat in ["Cervejas", "Refrigerantes", "Doces"]:
                        qty = np.random.choice([1, 2, 3, 4, 6], p=[0.55, 0.22, 0.11, 0.08, 0.04])
                    else:
                        qty = np.random.choice([1, 2, 3], p=[0.75, 0.20, 0.05])

                # Meio de pagamento estritamente aceito no PDV
                payment = np.random.choice(PAYMENT_METHODS, p=PAYMENT_WEIGHTS)

                # Montamos a linha da venda individual
                record = {
                    "transaction_id": str(uuid.uuid4())[:8],
                    "timestamp": tx_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "sku": prod["sku"],
                    "product_name": prod["name"],
                    "category": cat,
                    "quantity": int(qty),
                    "unit_price": price,
                    "total_amount": round(qty * price, 2),
                    "payment_method": payment,
                }
                records.append(record)

    df = pd.DataFrame(records)

    # =========================================================================
    # INJEÇÃO CONTROLADA DE ERROS E POLUIÇÃO OPERACIONAL
    # (Simulamos os problemas reais de um sistema de caixa de comércio)
    # =========================================================================
    print("[2/4] Injetando erros e falhas humanas propositais...")

    # ERRO 1: Vendas Duplicadas (~4% das linhas)
    # Ocorre quando o operador do caixa clica duas vezes no botão de 'Finalizar'
    # ou a internet oscila e o sistema envia a venda duas vezes.
    dup_sample = df.sample(frac=0.04, random_state=random_state)
    df = pd.concat([df, dup_sample], ignore_index=True)

    # ERRO 2: Escrita bagunçada em categorias (maiúsculas, minúsculas, espaços extras)
    # Exemplo: um atendente cadastra 'CERVEJA', outro 'cerveja' e outro '  Cerveja '
    for idx in df.sample(frac=0.05, random_state=random_state).index:
        cat = df.at[idx, "category"]
        if pd.notna(cat):
            variations = [cat.upper(), cat.lower(), f"  {cat} ", f"{cat}   "]
            df.at[idx, "category"] = random.choice(variations)

    # ERRO 3: Dados Faltantes / Nulos (Campos em branco)
    # Deixamos algumas categorias, formas de pagamento e preços vazios de propósito
    null_idx_cat = df.sample(frac=0.03, random_state=random_state).index
    df.loc[null_idx_cat, "category"] = None

    null_idx_pay = df.sample(frac=0.03, random_state=random_state + 1).index
    df.loc[null_idx_pay, "payment_method"] = None

    null_idx_price = df.sample(frac=0.02, random_state=random_state + 2).index
    df.loc[null_idx_price, "unit_price"] = np.nan

    # ERRO 4: Erro grosseiro de digitação no teclado (Outliers absurdos)
    # Exemplo: o atendente queria digitar 5 cervejas, mas o dedo escorregou e digitou 500
    outlier_idx = df.sample(n=15, random_state=random_state).index
    for idx in outlier_idx:
        df.at[idx, "quantity"] = random.choice([250, 500, 999, 1200])
        df.at[idx, "total_amount"] = round(df.at[idx, "quantity"] * (df.at[idx, "unit_price"] or 5.0), 2)

    # ERRO 5: Números Negativos ou Zerados
    # Simulam devoluções mal registradas ou testes de desenvolvedor no caixa da loja
    invalid_idx = df.sample(n=20, random_state=random_state).index
    for idx in invalid_idx:
        df.at[idx, "quantity"] = random.choice([-5, -1, 0])
        df.at[idx, "total_amount"] = -10.0

    # ERRO 6: Datas corrompidas / Texto inválido
    # Simula quando o relógio do sistema falhou e salvou texto onde deveria ser data
    bad_date_idx = df.sample(n=10, random_state=random_state).index
    for idx in bad_date_idx:
        df.at[idx, "timestamp"] = "INVALID_DATE_FORMAT"

    # Embaralhamos a tabela para parecer com a ordem real em que os dados chegam
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)

    print("[3/4] Salvando o arquivo de dados poluídos no disco...")
    # Criamos a pasta 'data/raw' se ela ainda não existir
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)

    print(f"[4/4] [OK] Base poluída gerada com sucesso em '{output_path}'.")
    print(f"      Total de linhas gravadas: {len(df)} registros.")
    return df


# Bloco que roda automaticamente quando você executa o arquivo direto no terminal
if __name__ == "__main__":
    generate_raw_dataset()
