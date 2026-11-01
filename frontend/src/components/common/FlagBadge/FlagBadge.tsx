import React from 'react';
import styles from './FlagBadge.module.css';

export type FlagCountry = 'BR' | 'US' | 'EU' | 'CN' | 'AR' | 'GLOBAL';

export interface FlagBadgeProps {
  country: FlagCountry;
  label?: string;
  sublabel?: string;
}

export const FlagBadge: React.FC<FlagBadgeProps> = ({
  country,
  label,
  sublabel,
}) => {
  const flagsMap: Record<FlagCountry, { emoji: string; defaultLabel: string; currency: string }> = {
    BR: { emoji: '🇧🇷', defaultLabel: 'Brasil', currency: 'BRL (R$)' },
    US: { emoji: '🇺🇸', defaultLabel: 'Estados Unidos', currency: 'USD ($)' },
    EU: { emoji: '🇪🇺', defaultLabel: 'União Europeia', currency: 'EUR (€)' },
    CN: { emoji: '🇨🇳', defaultLabel: 'China', currency: 'CNY (¥)' },
    AR: { emoji: '🇦🇷', defaultLabel: 'Argentina (Mercosul)', currency: 'ARS ($)' },
    GLOBAL: { emoji: '🌐', defaultLabel: 'Global / Internacional', currency: 'Multimoeda' },
  };

  const info = flagsMap[country] || flagsMap.BR;

  return (
    <div className={styles.flagCard} title={`${info.defaultLabel} • Moeda: ${info.currency}`}>
      <span className={styles.flagEmoji} aria-hidden="true">
        {info.emoji}
      </span>
      <div className={styles.metaCol}>
        <span className={styles.countryLabel}>{label || info.defaultLabel}</span>
        <span className={styles.currencyCode}>{sublabel || info.currency}</span>
      </div>
    </div>
  );
};
