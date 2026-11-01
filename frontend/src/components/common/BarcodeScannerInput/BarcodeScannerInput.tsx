import React, { useEffect, useRef } from 'react';
import styles from './BarcodeScannerInput.module.css';

export interface BarcodeScannerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (barcode: string) => void;
  placeholder?: string;
  hotkey?: string;
  label?: string;
  disabled?: boolean;
}

export const BarcodeScannerInput: React.FC<BarcodeScannerInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Bipar código de barras (EAN-13 / SKU)...',
  hotkey = 'F2',
  label = 'Captura de Código de Barras / SKU',
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === hotkey) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkey]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && value) {
      e.preventDefault();
      onChange('');
      return;
    }

    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      onSubmit(value.trim());
    }
  };

  return (
    <div className={styles.container}>
      {label && (
        <div className={styles.header}>
          <label htmlFor="barcode-scanner-field" className={styles.label}>
            {label}
          </label>
          <span className={styles.hotkeyHint}>Pressione [{hotkey}] para focar</span>
        </div>
      )}

      <div className={styles.scannerBox}>
        {/* Ícone Lucide ScanBarcode */}
        <span className={styles.barcodeIcon} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <path d="M8 7v10" />
            <path d="M12 7v10" />
            <path d="M16 7v10" />
          </svg>
        </span>
        <input
          id="barcode-scanner-field"
          ref={inputRef}
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />

        {/* Botão de Limpeza com Ícone Lucide X e Atalho Esc */}
        {value && !disabled && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onChange('')}
            title="Limpar leitor (Esc)"
            aria-label="Limpar leitor (Esc)"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
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

        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => value.trim() && onSubmit(value.trim())}
          disabled={!value.trim() || disabled}
          aria-label="Registrar código lido"
        >
          Enter ↵
        </button>
      </div>
    </div>
  );
};
