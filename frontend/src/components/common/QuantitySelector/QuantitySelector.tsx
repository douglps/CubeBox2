import React from 'react';
import styles from './QuantitySelector.module.css';

export interface QuantitySelectorProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  uom?: string;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 9999,
  step = 1,
  uom = 'UN',
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (value - step >= min && !disabled) {
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (value + step <= max && !disabled) {
      onChange(Math.min(max, value + step));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.stepBtn}
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Diminuir quantidade"
      >
        −
      </button>

      <div className={styles.inputWrapper}>
        <input
          type="number"
          className={styles.input}
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
        {uom && <span className={styles.uomBadge}>{uom}</span>}
      </div>

      <button
        type="button"
        className={styles.stepBtn}
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  );
};
