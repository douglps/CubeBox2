import React from 'react';
import styles from './StockLevelBar.module.css';

export interface StockTrendPoint {
  dayLabel: string;
  stock: number;
  isForecast?: boolean;
  isToday?: boolean;
}

export interface StockLevelBarProps {
  currentStock: number;
  ropStock: number; // Ponto de Reposição
  maxStock: number; // Capacidade Máxima
  uom?: string;
  trendData?: StockTrendPoint[];
}

export const StockLevelBar: React.FC<StockLevelBarProps> = ({
  currentStock,
  ropStock,
  maxStock,
  uom = 'UN',
  trendData,
}) => {
  const percent = Math.min(100, Math.max(0, (currentStock / (maxStock || 100)) * 100));
  const isBelowRop = currentStock <= ropStock;
  const isCritical = currentStock <= ropStock * 0.4;

  const statusColor = isCritical
    ? 'var(--status-danger)'
    : isBelowRop
    ? 'var(--status-warning)'
    : 'var(--status-success)';

  const statusLabel = isCritical
    ? 'CRÍTICO'
    : isBelowRop
    ? 'ABAIXO DO ROP'
    : 'ESTOQUE SEGURO';

  // Geometria do velocímetro semi-círculo (raio 40, arco de 180 graus de -180 a 0)
  const strokeDashoffset = 125.66 - (125.66 * percent) / 100;
  const needleAngle = -90 + (percent / 100) * 180;

  // Série temporal padrão: 3 dias passados, Hoje, 3 dias futuros (previsão por taxa de consumo)
  const dailyRunRate = Math.max(4, Math.round(currentStock * 0.12));
  const defaultTrend: StockTrendPoint[] = trendData || [
    { dayLabel: 'D-3', stock: Math.min(maxStock, currentStock + dailyRunRate * 3) },
    { dayLabel: 'D-2', stock: Math.min(maxStock, currentStock + dailyRunRate * 2) },
    { dayLabel: 'D-1', stock: Math.min(maxStock, currentStock + dailyRunRate) },
    { dayLabel: 'Hoje', stock: currentStock, isToday: true },
    { dayLabel: 'D+1', stock: Math.max(0, currentStock - dailyRunRate), isForecast: true },
    { dayLabel: 'D+2', stock: Math.max(0, currentStock - dailyRunRate * 2), isForecast: true },
    { dayLabel: 'D+3', stock: Math.max(0, currentStock - dailyRunRate * 3), isForecast: true },
  ];

  // Coordenadas SVG para o Gráfico de Tendência (Largura 210, Altura 70, Margens 15/10)
  const chartW = 210;
  const chartH = 68;
  const padX = 18;
  const padY = 12;
  const usableW = chartW - padX * 2;
  const usableH = chartH - padY * 2;
  const maxVal = Math.max(maxStock, ...defaultTrend.map(d => d.stock));

  const points = defaultTrend.map((d, i) => {
    const x = padX + (i / (defaultTrend.length - 1)) * usableW;
    const y = chartH - padY - (d.stock / (maxVal || 1)) * usableH;
    return { ...d, x, y };
  });

  // Dividir caminho em: Histórico (índice 0 a 3) e Previsão (índice 3 a 6)
  const historyPath = points.slice(0, 4).reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const forecastPath = points.slice(3).reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');

  // Coordenada Y da Linha de ROP
  const ropY = chartH - padY - (ropStock / (maxVal || 1)) * usableH;

  return (
    <div className={styles.container}>
      {/* Coluna 1: Velocímetro de Nível Físico */}
      <div className={styles.gaugeSection}>
        <div className={styles.gaugeWrapper}>
          <svg viewBox="0 0 100 56" className={styles.gaugeSvg} aria-hidden="true">
            {/* Trilha de Fundo */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="var(--bg-inset)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Arco Colorido Dinâmico */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke={statusColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="125.66"
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset var(--transition-normal), stroke var(--transition-normal)' }}
            />
            {/* Marcador do Ponto de Reposição (ROP) */}
            <circle
              cx={50 - 40 * Math.cos(((ropStock / maxStock) * Math.PI))}
              cy={50 - 40 * Math.sin(((ropStock / maxStock) * Math.PI))}
              r="2.5"
              fill="var(--text-primary)"
            />
          </svg>

          {/* Agulha / Ponteiro Minimalista */}
          <div
            className={styles.needle}
            style={{ transform: `rotate(${needleAngle}deg)` }}
          />
          <div className={styles.needlePivot} />
        </div>

        {/* Valor do Saldo Físico & Status */}
        <div className={styles.mainValueRow}>
          <span className={styles.currentVal}>{currentStock}</span>
          <span className={styles.uomText}>{uom}</span>
          <span className={styles.statusPill} style={{ backgroundColor: 'var(--bg-surface-elevated)', color: statusColor, borderColor: statusColor }}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Coluna 2: Gráfico em Linha (Histórico D-3 a Hoje + Previsão D+1 a D+3) */}
      <div className={styles.trendSection}>
        <div className={styles.trendHeader}>
          <span className={styles.trendTitle}>Histórico &amp; Projeção</span>
          <div className={styles.trendLegend}>
            <span className={styles.legendHistory}>● Histórico</span>
            <span className={styles.legendForecast}>┄ Previsão</span>
          </div>
        </div>

        <div className={styles.trendSvgWrapper}>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className={styles.trendSvg}>
            {/* Linha de Referência ROP */}
            <line
              x1={padX}
              y1={ropY}
              x2={chartW - padX}
              y2={ropY}
              stroke="var(--status-warning)"
              strokeDasharray="3 3"
              strokeWidth="1"
              opacity="0.7"
            />
            <text
              x={chartW - padX + 2}
              y={ropY + 3}
              fill="var(--status-warning)"
              fontSize="8"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              ROP
            </text>

            {/* Linha Sólida: Histórico D-3 a Hoje */}
            <path
              d={historyPath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Linha Tracejada: Previsão D+1 a D+3 */}
            <path
              d={forecastPath}
              fill="none"
              stroke="var(--status-info)"
              strokeWidth="2.2"
              strokeDasharray="4 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pontos Interativos com Valores */}
            {points.map((p, idx) => {
              const isPtBelowRop = p.stock <= ropStock;
              const ptColor = p.isToday
                ? statusColor
                : p.isForecast
                ? isPtBelowRop ? 'var(--status-danger)' : 'var(--status-info)'
                : 'var(--primary)';

              return (
                <g key={idx} className={styles.chartPointGroup}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.isToday ? 4 : 3}
                    fill="var(--bg-surface-elevated)"
                    stroke={ptColor}
                    strokeWidth={p.isToday ? 2.5 : 1.8}
                  />
                  {/* Label do Dia */}
                  <text
                    x={p.x}
                    y={chartH - 1}
                    textAnchor="middle"
                    fill={p.isToday ? 'var(--text-primary)' : 'var(--text-muted)'}
                    fontSize="8.5"
                    fontWeight={p.isToday ? '700' : '500'}
                    fontFamily="var(--font-mono)"
                  >
                    {p.dayLabel}
                  </text>
                  {/* Tooltip SVG sutil com valor */}
                  <title>{`${p.dayLabel}: ${p.stock} ${uom} ${p.isForecast ? '(Previsão)' : ''}`}</title>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Rodapé Resumo ROP */}
        <div className={styles.trendSummary}>
          <span>ROP: <strong>{ropStock} {uom}</strong></span>
          <span>•</span>
          <span>Capacidade: <strong>{maxStock} {uom}</strong></span>
          <span>•</span>
          <span>Ocupação: <strong>{Math.round(percent)}%</strong></span>
        </div>
      </div>
    </div>
  );
};
