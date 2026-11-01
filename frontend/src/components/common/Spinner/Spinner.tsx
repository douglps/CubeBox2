import React from 'react';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'neutral' | 'white';
  label?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  label = 'Carregando dados...',
  className = '',
}) => {
  return (
    <span
      className={`${styles.spinnerContainer} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`${styles.spinner} ${styles[size]} ${styles[variant]}`}
        aria-hidden="true"
      />
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
};

