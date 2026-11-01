import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLDivElement>(null);

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

  const updatePosition = () => {
    if (!badgeRef.current) return;
    const rect = badgeRef.current.getBoundingClientRect();
    const tooltipWidth = Math.min(320, window.innerWidth - 32);
    const tooltipHeight = 180; // altura aproximada máxima do card

    // Posicionamento horizontal inteligente com clamp na viewport
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (alignTooltip === 'right') {
      left = rect.right - tooltipWidth;
    } else if (alignTooltip === 'left') {
      left = rect.left;
    }

    // Clamp para não vazar a tela (mínimo 16px das bordas)
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    // Posicionamento vertical: se não couber embaixo, exibe acima
    let top = rect.bottom + 8;
    if (top + tooltipHeight > window.innerHeight && rect.top - tooltipHeight - 8 > 0) {
      top = rect.top - tooltipHeight - 8;
    }

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible) return;
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isVisible]);

  return (
    <div
      ref={badgeRef}
      className={`${styles.xaiBadgeWrapper} ${size === 'sm' ? styles.wrapperSm : ''}`}
      tabIndex={0}
      role="region"
      aria-label={`Explicabilidade do modelo ${modelConfig.name}`}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      <span className={`${styles.xaiBadge} ${size === 'sm' ? styles.badgeSm : ''}`}>
        <Sparkles size={size === 'sm' ? 11 : 13} />
        <span>{label || modelConfig.badgeLabel}</span>
      </span>

      {isVisible && typeof document !== 'undefined' &&
        createPortal(
          <div
            className={styles.tooltipPortal}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            role="tooltip"
          >
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default XaiBadge;
