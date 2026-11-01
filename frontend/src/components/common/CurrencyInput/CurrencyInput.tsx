import React, { useId } from 'react';
import styles from './CurrencyInput.module.css';

export interface CurrencyInputProps {
  label?: string;
  /** Valor armazenado em centavos inteiros (ex: 1250 = R$ 12,50) */
  valueCents?: number;
  /** Callback com o valor em centavos */
  onChangeCents?: (newCents: number) => void;
  /** Valor numérico real em Reais (ex: 12.50 = R$ 12,50) */
  value?: number;
  /** Callback com o valor numérico real */
  onChange?: (newValue: number) => void;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label = 'Valor Monetário (BRL)',
  valueCents,
  onChangeCents,
  value,
  onChange,
  helperText = 'Digite os algarismos para preenchimento natural da direita para a esquerda (Esc para zerar)',
  error,
  disabled = false,
}) => {
  const generatedId = useId();

  // Compatibilidade unificada: resolve valor em centavos
  const effectiveCents =
    valueCents !== undefined
      ? valueCents
      : value !== undefined
      ? Math.round(value * 100)
      : 0;

  const notifyChange = (newCents: number) => {
    if (onChangeCents) onChangeCents(newCents);
    if (onChange) onChange(newCents / 100);
  };

  // Formata os centavos inteiros para exibição no padrão bancário brasileiro: R$ 0,00
  const formatBRL = (cents: number): string => {
    const absCents = Math.abs(cents);
    const reais = Math.floor(absCents / 100);
    const centavos = absCents % 100;
    const formattedReais = reais.toLocaleString('pt-BR');
    const formattedCents = centavos.toString().padStart(2, '0');
    return `${cents < 0 ? '-' : ''}${formattedReais},${formattedCents}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      notifyChange(0);
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      // Remove o último dígito à direita (divisão inteira por 10)
      notifyChange(Math.floor(effectiveCents / 10));
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      notifyChange(0);
      return;
    }

    // Incremento/decremento com ArrowUp e ArrowDown (R$ 1,00 ou R$ 10,00 com Shift)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const step = e.shiftKey ? 1000 : 100;
      notifyChange(Math.min(99999999, effectiveCents + step));
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const step = e.shiftKey ? 1000 : 100;
      notifyChange(Math.max(0, effectiveCents - step));
      return;
    }

    // Se for um dígito numérico (0-9)
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const digit = parseInt(e.key, 10);
      // Desloca para a esquerda multiplicando por 10 e adiciona o novo dígito à direita
      const newCents = effectiveCents * 10 + digit;
      // Limite de segurança de 99 milhões de centavos (R$ 999.999,99)
      if (newCents <= 99999999) {
        notifyChange(newCents);
      }
    }
  };

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={generatedId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={`${styles.inputBox} ${error ? styles.hasError : ''} ${disabled ? styles.isDisabled : ''}`}>
        <span className={styles.currencyPrefix} aria-hidden="true">
          R$
        </span>
        <input
          id={generatedId}
          type="text"
          inputMode="numeric"
          className={styles.input}
          value={formatBRL(effectiveCents)}
          onKeyDown={handleKeyDown}
          onChange={() => {}} // Controle total via keyDown para comportamento bancário estrito
          disabled={disabled}
          aria-invalid={!!error}
        />
        {effectiveCents > 0 && !disabled && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => notifyChange(0)}
            title="Zerar valor (Esc)"
            aria-label="Zerar valor (Esc)"
          >
            {/* Ícone Lucide X */}
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
      </div>

      {error ? (
        <span className={styles.errorText}>{error}</span>
      ) : helperText ? (
        <span className={styles.helperText}>{helperText}</span>
      ) : null}
    </div>
  );
};
