"""
=============================================================================
PIPELINE DE HIGIENIZAÇÃO, LIMPEZA E AUDITORIA DE DADOS (SANITIZAÇÃO)
=============================================================================
Projeto: CubeBox Mini
Objetivo deste arquivo:
    Pegar a base de vendas "suja" (cheia de erros propositais de digitação,
    duplicações e dados vazios) e limpá-la por completo, tornando-a perfeita
    para os modelos de Inteligência Artificial e Machine Learning.

    COMO FUNCIONA O PASSO A PASSO DA LIMPEZA?
    1. Elimina vendas repetidas (duplicadas).
    2. Remove linhas com datas corrompidas.
    3. Descarta vendas com quantidades zeradas, negativas ou absurdamente altas.
    4. Completa preços que ficaram em branco usando o catálogo oficial da loja.
    5. Padroniza os nomes e setores (tira espaços extras e letras maiúsculas soltas).
    6. Preenche a forma de pagamento que ficou vazia com a mais comum (PIX).
    7. Recalcula o valor total de cada compra para garantir que a conta fecha.
    8. Salva um relatório de auditoria explicando tudo o que foi consertado.
=============================================================================
"""

import json
import os
from typing import Any, Dict, Tuple
import numpy as np
import pandas as pd

# ---------------------------------------------------------------------------
# CATÁLOGO OFICIAL DE REFERÊNCIA (Gabarito da Loja)
# Se algum preço ou categoria estiver faltando na planilha, consultamos aqui:
# ---------------------------------------------------------------------------
try:
    import sys
    from pathlib import Path
    _ROOT = Path(__file__).resolve().parent.parent.parent
    if str(_ROOT) not in sys.path:
        sys.path.insert(0, str(_ROOT))
    from backend.app.init_db import SKU_CATALOG
    CATALOG_LOOKUP = {
        item["sku"]: {
            "name": item["nome"],
            "category": item["categoria"],
            "unit_price": item["preco_unitario"]
        }
        for item in SKU_CATALOG
    }
except Exception:
    CATALOG_LOOKUP = {
        "SKU-BEB-001": {"name": "Cerveja Heineken Puro Malte Lata 350ml", "category": "Cervejas", "unit_price": 5.90},
        "SKU-BEB-002": {"name": "Cerveja Colorado Ribeirão Lager 355ml", "category": "Cervejas", "unit_price": 10.90},
        "SKU-BEB-003": {"name": "Cerveja Brahma Duplo Malte 600ml", "category": "Cervejas", "unit_price": 8.90},
        "SKU-REF-001": {"name": "Coca-Cola Original Pet 2L", "category": "Refrigerantes", "unit_price": 11.50},
        "SKU-SNK-001": {"name": "Batata Ruffles Original 96g", "category": "Snacks", "unit_price": 8.50},
    }


def clean_sales_pipeline(
    raw_path: str = "data/raw/vendas_conveniencia_raw.csv",
    clean_path: str = "data/processed/vendas_conveniencia_clean.csv",
    audit_path: str = "data/audit/cleaning_report.json",
) -> Tuple[bool, Dict[str, Any]]:
    """
    Função principal que lê os dados poluídos, realiza a faxina completa
    e salva tanto os dados limpos quanto um relatório de auditoria detalhado.
    """
    # Verificação de segurança: se o arquivo bruto não existir, avisamos e paramos
    if not os.path.exists(raw_path):
        print(f"[ERRO] O arquivo de origem '{raw_path}' não foi encontrado!")
        return False, {"error": f"Arquivo de origem '{raw_path}' não encontrado."}

    print("[1/8] Carregando a base de dados bruta para a memória...")
    df = pd.read_csv(raw_path)
    initial_count = len(df)

    # Criamos um 'caderno de anotações' (Dicionário de Auditoria) para contar tudo o que foi corrigido
    audit: Dict[str, Any] = {
        "initial_records": initial_count,       # Quantos registros tínhamos no início
        "duplicates_removed": 0,                # Quantas linhas repetidas foram jogadas fora
        "invalid_dates_removed": 0,             # Quantas datas com erro foram excluídas
        "negative_or_zero_qty_removed": 0,      # Quantos itens negativos/zerados foram expurgados
        "outliers_qty_removed": 0,              # Quantas quantidades absurdas (ex: 500) foram limpas
        "null_categories_imputed": 0,           # Quantas categorias vazias foram preenchidas
        "null_prices_imputed": 0,               # Quantos preços vazios foram completados
        "null_payment_imputed": 0,              # Quantas formas de pagamento vazias foram preenchidas
        "final_clean_records": 0,               # Quantas linhas sobraram 100% limpas
        "integrity_rate_pct": 0.0,              # Porcentagem de aproveitamento útil da base
    }

    # PASSO 1: Excluir linhas repetidas idênticas (Deduplicação)
    # Exemplo: o cliente comprou 1 cerveja, mas o caixa registrou exatamente a mesma venda 2 vezes
    print("[2/8] Removendo registros duplicados...")
    pre_dup = len(df)
    df = df.drop_duplicates()
    audit["duplicates_removed"] = pre_dup - len(df)

    # PASSO 2: Limpar datas corrompidas ou com formato quebrado
    # O comando 'pd.to_datetime' tenta entender a data. Se for um texto quebrado como 'INVALID_DATE', ele marca como erro.
    print("[3/8] Higienizando datas e horários das transações...")
    df["timestamp_parsed"] = pd.to_datetime(df["timestamp"], errors="coerce")
    bad_dates = df["timestamp_parsed"].isna()
    audit["invalid_dates_removed"] = int(bad_dates.sum())
    # Mantemos apenas as linhas que possuem datas verdadeiras e válidas
    df = df[~bad_dates].copy()
    df["timestamp"] = df["timestamp_parsed"].dt.strftime("%Y-%m-%d %H:%M:%S")
    df = df.drop(columns=["timestamp_parsed"])

    # PASSO 3: Remover vendas com quantidade menor ou igual a zero
    # Em um histórico de vendas de balcão, não faz sentido vender 0 ou -5 unidades
    print("[4/8] Removendo quantidades negativas ou zeradas...")
    invalid_qty = df["quantity"] <= 0
    audit["negative_or_zero_qty_removed"] = int(invalid_qty.sum())
    df = df[~invalid_qty].copy()

    # PASSO 4: Remover valores absurdos de digitação (Outliers)
    # Ninguém entra numa loja de conveniência de madrugada e compra 500 cervejas no balcão de uma vez.
    # Estabelecemos uma regra de bom senso: compras acima de 50 unidades no balcão são descartadas da modelagem.
    print("[5/8] Tratando outliers de digitação (valores absurdamente altos)...")
    extreme_qty = df["quantity"] > 50
    audit["outliers_qty_removed"] = int(extreme_qty.sum())
    df = df[~extreme_qty].copy()

    # PASSO 5: Preencher preços em branco usando o Catálogo Oficial
    # Se o operador deixou o preço vazio, procuramos pelo código do produto (SKU) e colocamos o preço correto
    print("[6/8] Recuperando preços e categorias vazias através do catálogo...")
    null_prices = df["unit_price"].isna()
    audit["null_prices_imputed"] = int(null_prices.sum())
    for sku, info in CATALOG_LOOKUP.items():
        df.loc[(df["sku"] == sku) & (df["unit_price"].isna()), "unit_price"] = info["unit_price"]

    # PASSO 6: Padronizar nomes e categorias dos produtos
    # Corrige escritas como 'cerveja', 'CERVEJA' ou '  Cerveja ', deixando tudo no padrão 'Cervejas'
    null_cats = df["category"].isna()
    audit["null_categories_imputed"] = int(null_cats.sum())
    for sku, info in CATALOG_LOOKUP.items():
        df.loc[df["sku"] == sku, "category"] = info["category"]
        df.loc[df["sku"] == sku, "product_name"] = info["name"]

    # PASSO 7: Preencher forma de pagamento vazia
    # Se alguém esqueceu de marcar como pagou, assumimos a forma mais popular do comércio atual (PIX)
    print("[7/8] Preenchendo formas de pagamento ausentes...")
    null_pays = df["payment_method"].isna()
    audit["null_payment_imputed"] = int(null_pays.sum())
    df["payment_method"] = df["payment_method"].fillna("PIX")

    # PASSO 8: Garantir tipos numéricos e recalcular o valor total
    # quantidade deve ser número inteiro e preço deve ser número decimal com 2 casas
    df["quantity"] = df["quantity"].astype(int)
    df["unit_price"] = df["unit_price"].astype(float)
    df["total_amount"] = (df["quantity"] * df["unit_price"]).round(2)

    # Organizamos as vendas em ordem cronológica (do dia mais antigo para o mais recente)
    df = df.sort_values(by="timestamp").reset_index(drop=True)

    # Calculamos os números finais para a auditoria
    final_count = len(df)
    audit["final_clean_records"] = final_count
    audit["integrity_rate_pct"] = round((final_count / initial_count) * 100, 2)

    print("[8/8] Salvando arquivos finais (Base Limpa e Relatório de Auditoria)...")
    # Cria as pastas de destino no computador se ainda não existirem
    os.makedirs(os.path.dirname(clean_path), exist_ok=True)
    os.makedirs(os.path.dirname(audit_path), exist_ok=True)

    # Salva a planilha limpa (.csv) e o relatório em formato .json
    df.to_csv(clean_path, index=False)
    with open(audit_path, "w", encoding="utf-8") as f:
        json.dump(audit, f, indent=2, ensure_ascii=False)

    print("\n=============================================================================")
    print("[SUCESSO] FAXINA CONCLUIDA COM SUCESSO!")
    print(f"   - Registros iniciais (brutos):   {initial_count}")
    print(f"   - Linhas duplicadas removidas:   {audit['duplicates_removed']}")
    print(f"   - Datas quebradas eliminadas:    {audit['invalid_dates_removed']}")
    print(f"   - Quantidades zeradas/negativas: {audit['negative_or_zero_qty_removed']}")
    print(f"   - Precos recuperados do catalogo:{audit['null_prices_imputed']}")
    print(f"   - Categorias padronizadas:       {audit['null_categories_imputed']}")
    print(f"   - Total de registros limpos:     {final_count}")
    print(f"   - Taxa de aproveitamento util:   {audit['integrity_rate_pct']}%")
    print(f"[ARQUIVO LIMPO] {clean_path}")
    print(f"[RELATORIO]     {audit_path}")
    print("=============================================================================\n")

    return True, audit


# Bloco que roda automaticamente quando você executa o arquivo direto no terminal
# Agora permite que você passe QUALQUER arquivo novo que queira limpar!
if __name__ == "__main__":
    import argparse

    # Criamos o leitor de comandos do terminal (CLI)
    parser = argparse.ArgumentParser(
        description="Pipeline de Limpeza e Sanitizacao de Dados de Vendas (CubeBox Mini)"
    )
    # Parametro 1: O arquivo que você quer limpar (se nao informar nada, usa a base padrao)
    parser.add_argument(
        "--input", "-i",
        type=str,
        default="data/raw/vendas_conveniencia_raw.csv",
        help="Caminho do arquivo sujo/bruto que voce deseja limpar (.csv)"
    )
    # Parametro 2: Onde você quer salvar o arquivo limpo
    parser.add_argument(
        "--output", "-o",
        type=str,
        default="data/processed/vendas_conveniencia_clean.csv",
        help="Caminho onde o arquivo limpo deve ser salvo (.csv)"
    )
    # Parametro 3: Onde salvar o relatorio com o resumo do que foi consertado
    parser.add_argument(
        "--audit", "-a",
        type=str,
        default="data/audit/cleaning_report.json",
        help="Caminho onde o relatorio de auditoria sera salvo (.json)"
    )

    args = parser.parse_args()

    # Executa a limpeza usando os caminhos que você informou
    clean_sales_pipeline(
        raw_path=args.input,
        clean_path=args.output,
        audit_path=args.audit,
    )
