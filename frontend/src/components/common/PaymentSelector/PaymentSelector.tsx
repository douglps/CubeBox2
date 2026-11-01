import React from 'react';
import styles from './PaymentSelector.module.css';

export type PaymentType = 'PIX' | 'CREDIT' | 'DEBIT' | 'CASH';

export interface PaymentSelectorProps {
  selected: PaymentType;
  onSelect: (type: PaymentType) => void;
  disabled?: boolean;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  selected,
  onSelect,
  disabled = false,
}) => {
  const options: { id: PaymentType; label: string; icon: string; shortcut: string }[] = [
    { id: 'PIX', label: 'Pix', icon: '⚡', shortcut: '1' },
    { id: 'CREDIT', label: 'Crédito', icon: '💳', shortcut: '2' },
    { id: 'DEBIT', label: 'Débito', icon: '🏧', shortcut: '3' },
    { id: 'CASH', label: 'Dinheiro', icon: '💵', shortcut: '4' },
  ];

  return (
    <div className={styles.container} role="radiogroup" aria-label="Forma de Pagamento">
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <div key={opt.id} className={styles.cardWrapper}>
            <button
              type="button"
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => onSelect(opt.id)}
              disabled={disabled}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${opt.label} (Atalho: ${opt.shortcut})`}
            >
              <span className={styles.icon}>{opt.icon}</span>
              <div className={styles.info}>
                <span className={styles.label}>{opt.label}</span>
              </div>
            </button>
            <div className={styles.floatingTooltip} role="tooltip">
              <span className={styles.tooltipLabel}>{opt.label}</span>
              <kbd className={styles.tooltipKbd}>{opt.shortcut}</kbd>
            </div>
          </div>
        );
      })}
    </div>
  );
};
