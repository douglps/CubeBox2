import React from 'react';
import styles from './ExpirationGuardBadge.module.css';

export type ExpirationScope = 'batch' | 'product' | 'quote' | 'reservation' | 'license';

export interface ExpirationGuardBadgeProps {
  /** Escopo da validade: lote, produto unitário, orçamento/comanda, reserva ou licença/contrato */
  scope?: ExpirationScope;
  /** Identificador do item (ex: Lote 2026-A1, SKU-1040, Orçamento #582) */
  identifier?: string;
  /** Dias restantes até a expiração (negativo = expirado) */
  daysRemaining: number;
  /** Data formatada para tooltip/exibição */
  dateFormatted?: string;
}

export const ExpirationGuardBadge: React.FC<ExpirationGuardBadgeProps> = ({
  scope = 'batch',
  identifier,
  daysRemaining,
  dateFormatted,
}) => {
  let status: 'fresh' | 'warning' | 'critical' | 'expired';
  let statusLabel: string;

  if (daysRemaining < 0) {
    status = 'expired';
    statusLabel = 'VENCIDO';
  } else if (daysRemaining <= 7) {
    status = 'critical';
    statusLabel = `${daysRemaining}d (CRÍTICO)`;
  } else if (daysRemaining <= 15) {
    status = 'warning';
    statusLabel = `${daysRemaining}d (ATENÇÃO)`;
  } else {
    status = 'fresh';
    statusLabel = `${daysRemaining}d (OK)`;
  }

  const scopeLabels: Record<ExpirationScope, { icon: string; prefix: string }> = {
    batch: { icon: '🏷️', prefix: 'Lote' },
    product: { icon: '📦', prefix: 'Validade' },
    quote: { icon: '📄', prefix: 'Orçamento' },
    reservation: { icon: '⏱️', prefix: 'Reserva' },
    license: { icon: '🔑', prefix: 'Certidão/Alvará' },
  };

  const { icon, prefix } = scopeLabels[scope] || scopeLabels.batch;
  const statusClass = styles[`status_${status}`];

  return (
    <div
      className={`${styles.container} ${statusClass}`}
      title={dateFormatted ? `Expiração: ${dateFormatted}` : undefined}
    >
      <span className={styles.scopeIcon} aria-hidden="true">{icon}</span>
      <span className={styles.identifierText}>
        {prefix}{identifier ? `: ${identifier}` : ''}
      </span>
      <span className={styles.divider}>•</span>
      <span className={styles.badgePill}>{statusLabel}</span>
    </div>
  );
};
