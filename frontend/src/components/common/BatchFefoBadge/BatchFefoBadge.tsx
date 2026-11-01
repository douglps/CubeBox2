import React from 'react';
import styles from './BatchFefoBadge.module.css';

export interface BatchFefoBadgeProps {
  batchNumber: string;
  daysToExpiration: number;
  expirationDate: string;
}

export const BatchFefoBadge: React.FC<BatchFefoBadgeProps> = ({
  batchNumber,
  daysToExpiration,
  expirationDate,
}) => {
  let status: 'fresh' | 'warning' | 'critical' | 'expired';
  let label: string;

  if (daysToExpiration < 0) {
    status = 'expired';
    label = 'VENCIDO';
  } else if (daysToExpiration <= 7) {
    status = 'critical';
    label = `${daysToExpiration}d (CRÍTICO)`;
  } else if (daysToExpiration <= 15) {
    status = 'warning';
    label = `${daysToExpiration}d (ATENÇÃO)`;
  } else {
    status = 'fresh';
    label = `${daysToExpiration}d (OK)`;
  }

  const statusClass = styles[`fefo_${status}`];

  return (
    <div className={`${styles.container} ${statusClass}`} title={`Validade: ${expirationDate}`}>
      <span className={styles.batchId}>Lote: {batchNumber}</span>
      <span className={styles.divider}>•</span>
      <span className={styles.daysBadge}>{label}</span>
    </div>
  );
};
