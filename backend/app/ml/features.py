"""
=============================================================================
ENGENHARIA DE CARACTERÍSTICAS PREDITIVAS (FEATURE ENGINEERING)
=============================================================================
Projeto: CubeBox Mini
Função no Negócio:
    Este arquivo ensina a Inteligência Artificial a "olhar para trás para enxergar o futuro".
    Ele transforma a lista bruta de cupons fiscais em pistas numéricas inteligentes
    (ex: quanto vendeu ontem, quanto vendeu na mesma sexta-feira da semana passada
    e qual é a média móvel dos últimos 7 dias).

Por que ele existe e o que resolve:
    Modelos de Machine Learning não entendem texto puro ou cupons soltos; eles precisam
    de variáveis organizadas no tempo. Este módulo gera indicadores matemáticos
    sem "olhar para a frente" (evitando vazamento de dados ou data leakage), simulando
    com precisão o raciocínio de um comerciante experiente.

Como funciona o fluxo:
    1. Agrupa os cupons por dia e por produto (SKU).
    2. [vendas_lag_1, lag_2, lag_7]: Cria colunas com as vendas de dias anteriores.
    3. [media_movel_7d]: Calcula o ritmo médio semanal de giro do item.
    4. [dia_semana & is_fim_semana]: Adiciona sinais de sazonalidade (fins de semana vendem mais).
=============================================================================
"""
from typing import Tuple, List
import pandas as pd
import numpy as np


FEATURE_COLUMNS = [
    'vendas_lag_1',
    'vendas_lag_2',
    'vendas_lag_7',
    'media_movel_7d',
    'taxa_quebra_hist',
    'dia_semana',
    'is_fim_semana'
]

TARGET_COLUMN = 'vendas_dia'


def build_daily_features(clean_sales_path: str) -> pd.DataFrame:
    """
    Agrupa transações de conveniência em séries diárias por SKU e constrói
    lag features, janelas móveis e flags sazonais estritamente sem data leakage.
    """
    df = pd.read_csv(clean_sales_path, encoding='utf-8')
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['date'] = df['timestamp'].dt.date

    # Agregação diária por SKU
    daily = df.groupby(['date', 'sku', 'category', 'product_name']).agg(
        vendas_dia=('quantity', 'sum'),
        faturamento_dia=('total_amount', 'sum'),
        preco_medio=('unit_price', 'mean')
    ).reset_index()

    # Garantir grade completa de datas para todos os SKUs (evitar buracos de dias sem vendas)
    all_dates = pd.date_range(daily['date'].min(), daily['date'].max(), freq='D').date
    all_skus = daily[['sku', 'category', 'product_name']].drop_duplicates()

    full_grid = []
    for _, sku_row in all_skus.iterrows():
        temp_df = pd.DataFrame({'date': all_dates})
        temp_df['sku'] = sku_row['sku']
        temp_df['category'] = sku_row['category']
        temp_df['product_name'] = sku_row['product_name']
        full_grid.append(temp_df)

    grid_df = pd.concat(full_grid, ignore_index=True)
    merged = pd.merge(grid_df, daily, on=['date', 'sku', 'category', 'product_name'], how='left')
    merged['vendas_dia'] = merged['vendas_dia'].fillna(0.0)
    merged['faturamento_dia'] = merged['faturamento_dia'].fillna(0.0)
    merged['preco_medio'] = merged.groupby('sku')['preco_medio'].transform(lambda s: s.ffill().bfill())

    merged = merged.sort_values(by=['sku', 'date']).reset_index(drop=True)

    # Engenharia de Lags e Médias Móveis por SKU
    merged['vendas_lag_1'] = merged.groupby('sku')['vendas_dia'].shift(1)
    merged['vendas_lag_2'] = merged.groupby('sku')['vendas_dia'].shift(2)
    merged['vendas_lag_7'] = merged.groupby('sku')['vendas_dia'].shift(7)
    merged['media_movel_7d'] = merged.groupby('sku')['vendas_dia'].shift(1).rolling(window=7, min_periods=1).mean()

    # Taxa histórica de quebra aproximada por categoria (SDC/SDD: não infla regressão de venda)
    # Taxas padrão empíricas de conveniência: bebidas=0.5%, alimentos/snacks=1.5%, gelo=3.0%
    quebra_map = {
        'Cervejas': 0.008,
        'Vinhos': 0.004,
        'Refrigerantes': 0.006,
        'Energéticos': 0.005,
        'Destilados': 0.003,
        'Tabacaria e Afins': 0.003,
        'Snacks': 0.020,
        'Congelados': 0.025,
        'Doces': 0.015,
        'Gelo e Carvão': 0.035,
        'Higiene Pessoal': 0.002,
        'Mercearia': 0.010,
        'Limpeza': 0.005
    }
    merged['taxa_quebra_hist'] = merged['category'].map(lambda c: quebra_map.get(c, 0.01))

    # Atributos de Calendário e Sazonalidade
    date_series = pd.to_datetime(merged['date'])
    merged['dia_semana'] = date_series.dt.weekday  # 0=Segunda, 6=Domingo
    merged['is_fim_semana'] = merged['dia_semana'].isin([4, 5, 6]).astype(int)  # Sex, Sab, Dom

    # Descarte das primeiras linhas com NaN resultantes da janela de lag 7
    features_df = merged.dropna(subset=['vendas_lag_7']).reset_index(drop=True)
    return features_df


def time_based_train_test_split(
    df: pd.DataFrame,
    test_ratio: float = 0.20
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Realiza a divisão temporal entre treino e teste preservando a cronologia
    (80% passado para treino, 20% recente para teste).
    """
    unique_dates = sorted(df['date'].unique())
    split_idx = int(len(unique_dates) * (1.0 - test_ratio))
    split_date = unique_dates[split_idx]

    train_df = df[df['date'] < split_date].copy()
    test_df = df[df['date'] >= split_date].copy()

    return train_df, test_df
