import React from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';
import styles from './XaiBadge.module.css';

export interface XaiBadgeProps {
  modelType: 'RANDOM_FOREST' | 'NAIVE_BAYES' | 'LOGISTIC_REGRESSION' | 'DBSCAN';
  confidence?: number;
  label?: string;
  size?: 'sm' | 'md';
  alignTooltip?: 'center' | 'left' | 'right';
}

export const XaiBadge: React.FC<XaiBadgeProps> = ({
  modelType,
  confidence = 94,
  label,
  size = 'md',
  alignTooltip = 'center',
}) => {
  const modelConfig = {
    RANDOM_FOREST: {
      name: 'Random Forest Regressor',
      badgeLabel: 'IA: Random Forest',
      task: 'Regressão de Demanda 7D',
      accuracy: 'WAPE: 23.64% • MAE: 7.35 un',
      features: 'Lags D-1/D-2/D-7, Média Móvel 7D, Dia da Semana, Fim de Semana',
    },
    LOGISTIC_REGRESSION: {
      name: 'Multinomial Logistic Regression',
      badgeLabel: 'IA: Regressão Logística',
      task: 'Classificação Calibrada de Risco de Ruptura',
      accuracy: 'F1-Score: 64.6% (+20.3% vs Bayes) • Acurácia: 64.0%',
      features: 'Estoque Simulado (Odds 0.01x), Média Móvel 7D (Odds 6.04x), Fim de Semana (Odds 2.41x)',
    },
    NAIVE_BAYES: {
      name: 'Gaussian Naive Bayes (Baseline)',
      badgeLabel: 'IA: Naive Bayes',
      task: 'Classificação de Risco de Ruptura (Legado)',
      accuracy: 'Acurácia: 48.8% • Macro F1: 44.3%',
      features: 'Saldo em Estoque, Velocidade Média, Dia da Semana',
    },
    DBSCAN: {
      name: 'DBSCAN Clustering',
      badgeLabel: 'IA: DBSCAN',
      task: 'Segmentação & Detecção de Anomalias',
      accuracy: '3 Clusters + 3 Outliers Isolados (eps=0.85)',
      features: 'Média Diária, Volatilidade (Desvio Padrão), Margem Unitária',
    },
  }[modelType];

  const tooltipAlignClass =
    alignTooltip === 'right'
      ? styles.tooltipRight
      : alignTooltip === 'left'
      ? styles.tooltipLeft
      : styles.tooltipCenter;

  return (
    <div
      className={`${styles.xaiBadgeWrapper} ${size === 'sm' ? styles.wrapperSm : ''}`}
      tabIndex={0}
      role="region"
      aria-label={`Explicabilidade do modelo ${modelConfig.name}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className={`${styles.xaiBadge} ${size === 'sm' ? styles.badgeSm : ''}`}>
        <Sparkles size={size === 'sm' ? 11 : 13} />
        <span>{label || modelConfig.badgeLabel}</span>
      </span>

      <div className={`${styles.tooltip} ${tooltipAlignClass}`} role="tooltip">
        <div className={styles.tooltipHeader}>
          <span>{modelConfig.name}</span>
          <BrainCircuit size={14} />
        </div>
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipLabel}>Finalidade:</span>
          <span className={styles.tooltipValue}>{modelConfig.task}</span>
        </div>
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipLabel}>Performance:</span>
          <span className={styles.tooltipValue}>{modelConfig.accuracy}</span>
        </div>
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipLabel}>Confiança:</span>
          <span className={styles.tooltipValue}>{confidence}%</span>
        </div>
        <div className={styles.tooltipFeatures}>
          <strong>Variáveis Consideradas:</strong> {modelConfig.features}
        </div>
      </div>
    </div>
  );
};

export default XaiBadge;
