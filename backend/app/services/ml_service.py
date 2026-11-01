"""
=============================================================================
SERVIÇO DE INTELIGÊNCIA ARTIFICIAL E PREVISÕES (ML SERVICE)
=============================================================================
Projeto: CubeBox Mini
Função no Negócio:
    Este arquivo é o "consultor experiente" ou o "gerente de compras virtual" da loja.
    Ele carrega na memória os modelos matemáticos já treinados e responde a perguntas
    críticas do dia a dia do comércio:
    1. "Quantas latas de cerveja ou refrigerante vão vender nos próximos 7 dias?"
    2. "Existe perigo de faltar produto na prateleira (ruptura de estoque)?"
    3. "Quais produtos vendem rápido juntos e quais são itens 'tartaruga' (encalhados)?"

Por que ele existe e o que resolve:
    Evita que o dono da loja trabalhe no "achismo". Comprar demais gasta dinheiro
    à toa e ocupa espaço físico (capital parado); comprar de menos faz o cliente ir embora
    de mãos vazias (venda perdida). O serviço entrega números confiáveis em milissegundos.

Como funciona o fluxo:
    1. [load_models]: Carrega os arquivos `.pkl` salvos na pasta `models/` (Random Forest,
       DBSCAN e Naive Bayes).
    2. [predict_demand_7d]: Faz a previsão diária para a próxima semana usando o Random Forest
       (analogia: funciona como um conselho de vários especialistas experientes que votam juntos).
    3. [predict_risk]: Avalia o risco de falta de produto na prateleira com o Naive Bayes.
    4. [get_clusters_summary]: Separa os produtos em grupos de comportamento similar com o DBSCAN.
=============================================================================
"""
from pathlib import Path
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Localização da pasta de modelos serializados (.pkl)
MODELS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "models"
if not MODELS_DIR.exists():
    MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "models"


class MLService:
    def __init__(self):
        # Dicionários em memória RAM para servir previsões sem lentidão
        self.rf_payload: Dict[str, Any] = {}
        self.dbscan_payload: Dict[str, Any] = {}
        self.risk_payload: Dict[str, Any] = {}
        self.is_loaded: bool = False

    def load_models(self):
        """
        [Passo 1/4] Carregamento dos modelos serializados (.pkl) na inicialização da loja.
        Carrega Random Forest (Demanda), DBSCAN (Clustering) e Logistic Regression (Risco de Ruptura).
        """
        rf_path = MODELS_DIR / "regressor_random_forest.pkl"
        dbscan_path = MODELS_DIR / "cluster_dbscan.pkl"
        risk_path = MODELS_DIR / "classifier_risk.pkl"
        legacy_nb_path = MODELS_DIR / "classifier_naive_bayes.pkl"

        if rf_path.exists():
            self.rf_payload = joblib.load(rf_path)
            # Fix para inferência de alta performance em single-core: evita overhead de thread-pool joblib
            if hasattr(self.rf_payload.get('model'), 'n_jobs'):
                self.rf_payload['model'].n_jobs = 1
        if dbscan_path.exists():
            self.dbscan_payload = joblib.load(dbscan_path)
        if risk_path.exists():
            self.risk_payload = joblib.load(risk_path)
        elif legacy_nb_path.exists():
            self.risk_payload = joblib.load(legacy_nb_path)

        self.is_loaded = bool(self.rf_payload and self.dbscan_payload and self.risk_payload)
        print(f"[SUCESSO] Modelos de Inteligencia Artificial carregados: {self.is_loaded}")

    def predict_demand_7d(self, sku: str, days: int = 7) -> List[Dict[str, Any]]:
        """
        [Passo 2/4] Previsão de demanda para os próximos dias (Random Forest).
        Analogia: O comitê de especialistas analisa o dia da semana, se é fim de semana
        ou feriado e o histórico recente para estimar quantas unidades sairão do estoque.
        """
        if not self.is_loaded:
            raise RuntimeError("Modelos de Machine Learning nao estao carregados.")

        model = self.rf_payload['model']
        feature_cols = self.rf_payload['feature_columns']

        # Descobre a média histórica básica deste item na loja
        sku_info = next((item for item in self.dbscan_payload.get('sku_clusters', []) if item['sku'] == sku), None)
        base_demand = sku_info['media_diaria'] if sku_info else 25.0

        today = datetime.now()
        dias_pt = {0: 'Segunda', 1: 'Terca', 2: 'Quarta', 3: 'Quinta', 4: 'Sexta', 5: 'Sabado', 6: 'Domingo'}

        forecasts = []
        cur_lag_1 = base_demand
        cur_lag_2 = base_demand
        cur_lag_7 = base_demand

        # Projeta dia a dia a estimativa de vendas
        for i in range(1, days + 1):
            future_date = today + timedelta(days=i)
            weekday = future_date.weekday()
            is_weekend = 1 if weekday in [4, 5, 6] else 0

            # Vetor com os dados do dia que o modelo precisa saber
            row = {
                'vendas_lag_1': cur_lag_1,
                'vendas_lag_2': cur_lag_2,
                'vendas_lag_7': cur_lag_7,
                'media_movel_7d': (cur_lag_1 + cur_lag_2 + cur_lag_7) / 3.0,
                'taxa_quebra_hist': 0.01,
                'dia_semana': weekday,
                'is_fim_semana': is_weekend
            }
            X = pd.DataFrame([row])[feature_cols]
            pred = float(model.predict(X)[0])
            pred_adjusted = max(0.0, round(pred, 1))

            forecasts.append({
                'data': future_date.strftime('%Y-%m-%d'),
                'dia_semana': dias_pt[weekday],
                'demanda_prevista': pred_adjusted
            })

            # Atualiza o histórico simulado para projetar o dia seguinte
            cur_lag_7 = cur_lag_2
            cur_lag_2 = cur_lag_1
            cur_lag_1 = pred_adjusted

        return forecasts

    def predict_risk(self, estoque_atual: int, media_movel: float, weekday: int) -> Dict[str, Any]:
        """
        [Passo 3/4] Avaliação de probabilidade e risco de ruptura (Regressão Logística / Pipeline).
        Retorna tanto a classe prevista ('Alto Risco', 'Medio Risco', 'Baixo Risco')
        quanto as probabilidades calibradas por classe via `predict_proba`.
        """
        if not self.is_loaded:
            return {
                'risco': 'Indefinido',
                'probabilidade_alto_risco': 0.0,
                'probabilidades': {}
            }

        risk_model = self.risk_payload['model']
        is_weekend = 1 if weekday in [4, 5, 6] else 0

        X = pd.DataFrame([{
            'estoque_simulado': float(estoque_atual),
            'media_movel_7d': float(media_movel),
            'dia_semana': weekday,
            'is_fim_semana': is_weekend,
            'vendas_lag_1': float(media_movel)
        }])

        pred_label = str(risk_model.predict(X)[0])
        probabilities = {}
        prob_alto = 0.0

        if hasattr(risk_model, "predict_proba"):
            probs = risk_model.predict_proba(X)[0]
            classes = list(self.risk_payload.get('classes', []))
            if not classes and hasattr(risk_model, 'classes_'):
                classes = list(risk_model.classes_)

            for cls_name, p in zip(classes, probs):
                probabilities[cls_name] = round(float(p) * 100, 1)

            prob_alto = probabilities.get('Alto Risco', 0.0)

        return {
            'risco': pred_label,
            'probabilidade_alto_risco': prob_alto,
            'probabilidades': probabilities
        }

    def get_clusters_summary(self) -> List[Dict[str, Any]]:
        """
        [Passo 4/4] Agrupamento inteligente de produtos (DBSCAN).
        Analogia: Organiza as prateleiras em 'Campeões de Venda' (alta rotatividade)
        e 'Itens de Nicho/Lentos', sem precisar de regras manuais engessadas.
        """
        return self.dbscan_payload.get('sku_clusters', [])


ml_service = MLService()

