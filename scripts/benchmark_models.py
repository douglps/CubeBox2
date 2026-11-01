"""
=============================================================================
BENCHMARK E COMPARAÇÃO COMPETITIVA DE ALGORITMOS DE IA
=============================================================================
Projeto: CubeBox Mini
Função no Negócio:
    Este script funciona como uma "banca examinadora" ou "torneio" entre diferentes
    algoritmos de Inteligência Artificial para escolher qual deles prevê com maior
    precisão o risco de uma prateleira ficar desabastecida (ruptura).

Por que ele existe e o que resolve:
    Evita adotar algoritmos às cegas sem comprovação científica. Compara Naive Bayes,
    Regressão Logística Multinomial e Random Forest Classifier, calculando a métrica
    F1-Score para eleger o modelo campeão que será colocado em produção.

Como funciona o fluxo:
    [Passo 1/4] Carrega a base histórica tratada e constrói as features temporais.
    [Passo 2/4] Simula os cenários de estoque para classificar os níveis de risco (Baixo, Médio, Alto).
    [Passo 3/4] Divide temporalmente o conjunto em treino e teste (sem contaminação).
    [Passo 4/4] Executa o benchmark e imprime o relatório comparativo de desempenho no terminal.
=============================================================================
"""
import sys
from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BACKEND_DIR))

from backend.app.ml.features import (
    build_daily_features,
    time_based_train_test_split,
    FEATURE_COLUMNS,
    TARGET_COLUMN
)

from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, f1_score

clean_path = BASE_DIR / "data/processed/vendas_conveniencia_clean.csv"
features_df = build_daily_features(clean_path)

np.random.seed(42)
df_nb = features_df.copy()
media = df_nb['media_movel_7d'].clip(lower=1.0)
df_nb['estoque_simulado'] = (media * np.random.uniform(0.3, 2.8, size=len(df_nb))).round(1)
ratio = df_nb['estoque_simulado'] / df_nb['vendas_dia'].clip(lower=0.5)

def define_risk(r):
    if r <= 1.0:
        return 'Alto Risco'
    elif r <= 2.0:
        return 'Medio Risco'
    else:
        return 'Baixo Risco'

df_nb['risco_ruptura'] = ratio.apply(define_risk)

feature_cols = ['estoque_simulado', 'media_movel_7d', 'dia_semana', 'is_fim_semana', 'vendas_lag_1']
X = df_nb[feature_cols]
y = df_nb['risco_ruptura']

split_idx = int(len(df_nb) * 0.8)
X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

# 1. Naive Bayes
nb = GaussianNB()
nb.fit(X_train, y_train)
y_pred_nb = nb.predict(X_test)

# 2. Regressao Logistica Multinomial
pipe_lr = Pipeline([
    ('scaler', StandardScaler()),
    ('lr', LogisticRegression(max_iter=1000, random_state=42))
])
pipe_lr.fit(X_train, y_train)
y_pred_lr = pipe_lr.predict(X_test)

# 3. Random Forest Classifier
rf_clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
rf_clf.fit(X_train, y_train)
y_pred_rf = rf_clf.predict(X_test)

print("="*65)
print("BENCHMARK DE MODELOS DE CLASSIFICAÇÃO DE RISCO")
print("="*65)
print(f"Total Amostras: {len(df_nb)} (Treino: {len(X_train)} | Teste: {len(X_test)})")
print(f"Distribuicao classes teste:\n{y_test.value_counts(normalize=True).round(3).to_dict()}\n")
print(f"{'Algoritmo':<25} | {'Accuracy':<10} | {'Macro F1':<10} | {'Weighted F1':<10}")
print("-"*65)
print(f"{'Gaussian Naive Bayes':<25} | {accuracy_score(y_test, y_pred_nb):<10.4f} | {f1_score(y_test, y_pred_nb, average='macro'):<10.4f} | {f1_score(y_test, y_pred_nb, average='weighted'):<10.4f}")
print(f"{'Logistic Regression':<25} | {accuracy_score(y_test, y_pred_lr):<10.4f} | {f1_score(y_test, y_pred_lr, average='macro'):<10.4f} | {f1_score(y_test, y_pred_lr, average='weighted'):<10.4f}")
print(f"{'Random Forest Clf':<25} | {accuracy_score(y_test, y_pred_rf):<10.4f} | {f1_score(y_test, y_pred_rf, average='macro'):<10.4f} | {f1_score(y_test, y_pred_rf, average='weighted'):<10.4f}")
print("="*65)

print("\n--- DETALHAMENTO REGRESSÃO LOGÍSTICA ---")
print(classification_report(y_test, y_pred_lr))

print("--- COEFICIENTES E ODDS RATIO (REGRESSÃO LOGÍSTICA) ---")
lr_step = pipe_lr.named_steps['lr']
for i, c in enumerate(lr_step.classes_):
    print(f"\n[Classe: {c}]")
    for feat, coef in zip(feature_cols, lr_step.coef_[i]):
        print(f"  {feat:<20}: Coef = {coef:+.4f} | Odds Ratio = {np.exp(coef):.4f}")
