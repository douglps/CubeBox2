import React, { useId, forwardRef } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { useCursorTooltip } from '../CursorTooltip';
import styles from './BankingNumberInput.module.css';

export type BankingInputMode = 'currency' | 'percent' | 'integer' | 'decimal';

export interface BankingNumberInputProps {
  /** Valor numérico real (ex: 12.50 para R$ 12,50, ou 10 para 10 unidades) */
  value: number;
  /** Callback acionado a cada alteração com o novo valor numérico real */
  onChange: (newValue: number) => void;
  /** Modo de operação que define prefixo, sufixo e comportamento da máscara */
  mode?: BankingInputMode;
  /** Quantidade de casas decimais (padrão: 2 para currency/percent/decimal, 0 para integer) */
  decimals?: number;
  /** Prefixo opcional (ex: 'R$', 'USD') */
  prefix?: string;
  /** Sufixo opcional (ex: '%', 'un', 'kg') */
  suffix?: string;
  /** Valor mínimo permitido (padrão: 0) */
  min?: number;
  /** Valor máximo permitido (opcional) */
  max?: number;
  /** Passo de incremento/decremento com setas ArrowUp/ArrowDown (padrão: 1 para integer/currency, 0.5 para percent) */
  step?: number;
  /** Rótulo superior do campo */
  label?: string;
  /** Texto auxiliar abaixo do campo */
  helperText?: string;
  /** Explicação detalhada exibida ao passar o mouse no ícone (?) */
  tooltip?: string;
  /** Mensagem de erro de validação */
  error?: string;
  /** Desabilita a interação */
  disabled?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Callback disparado ao limpar */
  onClear?: () => void;
  /** Callback acionado ao pressionar teclas específicas como Enter */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Ativa o foco automático no campo input ao montar */
  autoFocus?: boolean;
}

/**
 * BankingNumberInput (Padrão de UX Bancário / ATM Right-to-Left)
 * Campo numérico com preenchimento da direita para a esquerda,
 * completando gradualmente com a máscara adequada em tempo real.
 */
export const BankingNumberInput = forwardRef<HTMLInputElement, BankingNumberInputProps>(
  (
    {
      value,
      onChange,
      mode = 'currency',
      decimals,
      prefix,
      suffix,
      min = 0,
      max,
      step,
      label,
      helperText,
      tooltip,
      error,
      disabled = false,
      className = '',
      onClear,
      onKeyDown,
      autoFocus = false,
    },
    ref
  ) => {
  const generatedId = useId();

  // Determina número de casas decimais baseado no modo
  const effectiveDecimals =
    decimals !== undefined ? decimals : mode === 'integer' ? 0 : 2;

  // Determina prefixo e sufixo padrão
  const effectivePrefix =
    prefix !== undefined ? prefix : mode === 'currency' ? 'R$' : undefined;
  const effectiveSuffix =
    suffix !== undefined ? suffix : mode === 'percent' ? '%' : undefined;

  // Determina o passo padrão para setas
  const effectiveStep =
    step !== undefined ? step : mode === 'percent' ? 1 : mode === 'currency' ? 1 : 1;

  const multiplier = Math.pow(10, effectiveDecimals);

  // Converte o valor float para unidades inteiras discretas (ex: 12.50 * 100 = 1250)
  const currentRawUnits = Math.round((value || 0) * multiplier);

  // Formata a representação textual com separadores pt-BR (milhar '.' e decimal ',')
  const formatValue = (rawUnits: number): string => {
    if (effectiveDecimals === 0) {
      return rawUnits.toLocaleString('pt-BR');
    }

    const absUnits = Math.abs(rawUnits);
    const intPart = Math.floor(absUnits / multiplier);
    const decPart = (absUnits % multiplier).toString().padStart(effectiveDecimals, '0');
    const formattedInt = intPart.toLocaleString('pt-BR');
    return `${rawUnits < 0 ? '-' : ''}${formattedInt},${decPart}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (onKeyDown) {
      onKeyDown(e);
      if (e.defaultPrevented) return;
    }

    // Reset com tecla Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
      return;
    }

    // Tecla Delete: zera o valor
    if (e.key === 'Delete') {
      e.preventDefault();
      handleClear();
      return;
    }

    // Tecla Backspace: remove o último dígito à direita (divisão inteira por 10)
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newUnits = Math.floor(currentRawUnits / 10);
      const newVal = newUnits / multiplier;
      const clampedVal = Math.max(min, newVal);
      onChange(clampedVal);
      return;
    }

    // Navegação e incremento com setas ArrowUp / ArrowDown
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentStep = e.shiftKey ? effectiveStep * 10 : effectiveStep;
      let newVal = value + currentStep;
      if (max !== undefined) newVal = Math.min(max, newVal);
      onChange(parseFloat(newVal.toFixed(effectiveDecimals)));
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentStep = e.shiftKey ? effectiveStep * 10 : effectiveStep;
      let newVal = Math.max(min, value - currentStep);
      onChange(parseFloat(newVal.toFixed(effectiveDecimals)));
      return;
    }

    // Entrada de dígitos numéricos (0 a 9) estilo ATM bancário
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const digit = parseInt(e.key, 10);

      // Desloca para a esquerda (x10) e adiciona o novo dígito à direita
      const newUnits = currentRawUnits * 10 + digit;

      // Limite de segurança de 12 dígitos (R$ 999.999.999,99)
      if (newUnits > 999999999999) return;

      const newVal = newUnits / multiplier;

      // Verifica limite máximo se configurado
      if (max !== undefined && newVal > max) {
        return; // Bloqueia entrada acima do máximo estrito
      }

      onChange(parseFloat(newVal.toFixed(effectiveDecimals)));
    }
  };

  const { showTooltip, updatePosition, hideTooltip } = useCursorTooltip();

  const handleClear = () => {
    if (disabled) return;
    onChange(min);
    if (onClear) onClear();
  };

  const hasValue = value > min;

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <div className={styles.labelRow}>
          <label htmlFor={generatedId} className={styles.label}>
            {label}
          </label>
          {tooltip && (
            <button
              type="button"
              className={styles.helpButton}
              onMouseEnter={(e) => showTooltip(tooltip, undefined, e)}
              onMouseMove={updatePosition}
              onMouseLeave={hideTooltip}
              onFocus={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                showTooltip(tooltip, undefined, { clientX: rect.left, clientY: rect.bottom + 8 } as any);
              }}
              onBlur={hideTooltip}
              aria-label={`Ajuda sobre ${label}: ${tooltip}`}
            >
              <HelpCircle size={13} />
            </button>
          )}
        </div>
      )}

      <div
        className={`${styles.inputBox} ${error ? styles.hasError : ''} ${
          disabled ? styles.isDisabled : ''
        }`}
      >
        {effectivePrefix && <span className={styles.prefix}>{effectivePrefix}</span>}

        <input
          ref={ref}
          id={generatedId}
          type="text"
          inputMode="numeric"
          className={styles.input}
          value={formatValue(currentRawUnits)}
          onKeyDown={handleKeyDown}
          onChange={() => {}} // Preenchimento controlado 100% via keyDown bancário
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-label={label || 'Entrada numérico-bancária'}
        />

        {effectiveSuffix && <span className={styles.suffix}>{effectiveSuffix}</span>}

        {hasValue && !disabled && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            title="Limpar / Zerar valor (Esc)"
            aria-label="Limpar / Zerar valor (Esc)"
          >
            <X size={14} />
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
});

BankingNumberInput.displayName = 'BankingNumberInput';

export default BankingNumberInput;
