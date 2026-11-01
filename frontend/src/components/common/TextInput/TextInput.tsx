import React, { useId } from 'react';
import { MaskType, applyInputMask } from '../../../utils/masks';
import styles from './TextInput.module.css';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
  mask?: MaskType | ((val: string) => string);
  onClear?: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightElement,
  prefixNode,
  suffixNode,
  mask,
  id,
  className = '',
  disabled,
  value,
  onChange,
  onClear,
  onKeyDown,
  ...rest
}) => {
  const effectiveLeftIcon = leftIcon || prefixNode;
  const effectiveRightElement = rightElement || suffixNode;
  const generatedId = useId();
  const inputId = id || generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const displayValue =
    mask && value !== undefined && value !== null
      ? applyInputMask(String(value), mask)
      : value;

  const hasValue = displayValue !== undefined && displayValue !== null && String(displayValue).length > 0;

  const handleClear = () => {
    if (disabled) return;
    if (onClear) {
      onClear();
    } else if (onChange) {
      // Dispara evento sintético de limpeza
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mask) {
      const masked = applyInputMask(e.target.value, mask);
      e.target.value = masked;
    }
    if (onChange) {
      onChange(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && hasValue) {
      e.preventDefault();
      handleClear();
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''} ${disabled ? styles.isDisabled : ''}`}>
        {effectiveLeftIcon && <span className={styles.leftIcon}>{effectiveLeftIcon}</span>}
        <input
          id={inputId}
          className={styles.input}
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...rest}
        />

        {/* Botão de Limpeza Rápida com Ícone Lucide e Atalho Esc */}
        {hasValue && !disabled && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            title="Limpar campo (Esc)"
            aria-label="Limpar campo (Esc)"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {effectiveRightElement && <div className={styles.rightElement}>{effectiveRightElement}</div>}
      </div>

      {error ? (
        <span id={errorId} className={styles.errorText} role="alert">
          {error}
        </span>
      ) : helperText ? (
        <span id={helperId} className={styles.helperText}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
