import React from 'react';
import type { NameType } from 'recharts/types/component/DefaultTooltipContent';
import styles from './CompactChartTooltip.module.css';
import type { CompactChartTooltipProps } from './CompactChartTooltip.types';

export interface ResolvedTooltipData {
  visibleItems: any[];
  othersCount: number;
  othersSum: number;
  totalSum: number;
}

/**
 * Função pura para processamento, ordenação e consolidação (Top N + Outros) dos dados do tooltip.
 */
export function resolveTooltipData(
  payload: any[] | undefined,
  maxVisibleItems: number = 5,
  hoveredSeriesKey?: string | null,
  focusHoveredOnly: boolean = false
): ResolvedTooltipData {
  if (!payload || payload.length === 0) {
    return { visibleItems: [], othersCount: 0, othersSum: 0, totalSum: 0 };
  }

  const validEntries = payload.filter(
    (entry) => entry && entry.value !== undefined && entry.value !== null
  );

  if (focusHoveredOnly && hoveredSeriesKey) {
    const focused = validEntries.filter(
      (entry) => entry.name === hoveredSeriesKey || entry.dataKey === hoveredSeriesKey
    );
    if (focused.length > 0) {
      return {
        visibleItems: focused,
        othersCount: 0,
        othersSum: 0,
        totalSum: Number(focused[0].value) || 0,
      };
    }
  }

  // Ordenação decrescente por valor numérico
  const sorted = [...validEntries].sort((a, b) => {
    const valA = Number(a.value) || 0;
    const valB = Number(b.value) || 0;
    return valB - valA;
  });

  const total = sorted.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  // Se houver mais itens que o limite, segmenta em Top N + Outros
  if (sorted.length > maxVisibleItems) {
    const top = sorted.slice(0, maxVisibleItems);
    const rest = sorted.slice(maxVisibleItems);
    const restSum = rest.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

    return {
      visibleItems: top,
      othersCount: rest.length,
      othersSum: restSum,
      totalSum: total,
    };
  }

  return {
    visibleItems: sorted,
    othersCount: 0,
    othersSum: 0,
    totalSum: total,
  };
}

export const CompactChartTooltip: React.FC<CompactChartTooltipProps> = ({
  active,
  payload,
  label,
  maxVisibleItems = 5,
  currencyFormat = false,
  unit,
  hoveredSeriesKey,
  focusHoveredOnly = false,
  showTotal = false,
  valueFormatter,
  minWidth = 180,
  maxWidth = 300,
}) => {
  // Guarda de renderização para hover inativo ou ausência de payload
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const { visibleItems, othersCount, othersSum, totalSum } = resolveTooltipData(
    payload,
    maxVisibleItems,
    hoveredSeriesKey,
    focusHoveredOnly
  );

  if (visibleItems.length === 0) {
    return null;
  }

  const formatDisplayValue = (val: number | string | undefined, name?: NameType): string => {
    if (valueFormatter) {
      return valueFormatter(val, name);
    }

    const num = Number(val);
    if (isNaN(num)) {
      return String(val ?? '-');
    }

    if (currencyFormat) {
      return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const formatted = num.toLocaleString('pt-BR');
    return unit ? `${formatted} ${unit}` : formatted;
  };

  return (
    <div
      className={styles.tooltipContainer}
      style={{ minWidth, maxWidth }}
      role="tooltip"
      aria-hidden={!active}
    >
      {label && <div className={styles.header}>{label}</div>}

      <ul className={styles.itemsList}>
        {visibleItems.map((entry, index) => {
          const isHighlighted =
            Boolean(hoveredSeriesKey) &&
            (entry.name === hoveredSeriesKey || entry.dataKey === hoveredSeriesKey);

          const dotColor =
            entry.color || entry.stroke || entry.fill || 'var(--color-interactive-primary, #3b82f6)';
          const itemKey = `item-${entry.dataKey || entry.name || index}`;

          return (
            <li
              key={itemKey}
              className={`${styles.itemRow} ${isHighlighted ? styles.itemRowHighlighted : ''}`}
            >
              <div className={styles.itemInfo}>
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: dotColor }}
                  aria-hidden="true"
                />
                <span
                  className={styles.itemLabel}
                  title={String(entry.name || entry.dataKey || '')}
                >
                  {entry.name || entry.dataKey}
                </span>
              </div>
              <span className={styles.itemValue}>
                {formatDisplayValue(entry.value, entry.name)}
              </span>
            </li>
          );
        })}

        {othersCount > 0 && (
          <li className={styles.othersRow}>
            <span>Outros ({othersCount})</span>
            <span className={styles.itemValue}>
              {formatDisplayValue(othersSum)}
            </span>
          </li>
        )}

        {showTotal && (
          <li className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>
              {formatDisplayValue(totalSum)}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};
