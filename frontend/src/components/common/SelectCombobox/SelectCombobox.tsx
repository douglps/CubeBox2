import React from 'react';
import styles from './SelectCombobox.module.css';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
}

export interface SelectComboboxProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  disabled?: boolean;
}

export const SelectCombobox: React.FC<SelectComboboxProps> = ({
  label,
  options,
  value,
  onChange,
  helperText,
  disabled = false,
}) => {
  return (
    <div className={styles.container}>
      <label htmlFor="select-combobox-field" className={styles.label}>
        {label}
      </label>
      <div className={styles.selectWrapper}>
        <select
          id="select-combobox-field"
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} {opt.badge ? `(${opt.badge})` : ''}
            </option>
          ))}
        </select>
        <span className={styles.arrowIcon} aria-hidden="true">
          ▾
        </span>
      </div>
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
};
