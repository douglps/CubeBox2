import React, { useId } from 'react';
import styles from './SearchInput.module.css';

export interface SearchInputProps {
  value?: string;
  onChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  onClear?: () => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Pesquisar por SKU, descrição ou código de barras...',
  label,
  disabled = false,
  className = '',
}) => {
  const generatedId = useId();

  const triggerChange = (rawVal: string, originalEvent?: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    const hybrid = new String(rawVal);
    (hybrid as any).target = originalEvent ? originalEvent.target : { value: rawVal };
    (hybrid as any).currentTarget = originalEvent ? originalEvent.currentTarget : { value: rawVal };
    (onChange as any)(hybrid);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      e.preventDefault();
      onSearch(value);
    }
    if (e.key === 'Escape' && value) {
      e.preventDefault();
      handleClear();
    }
  };

  const handleClear = () => {
    if (onClear) onClear();
    triggerChange('');
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label htmlFor={generatedId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.searchBox}>
        {/* Ícone Lucide Search */}
        <span className={styles.searchIcon} aria-hidden="true">
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          id={generatedId}
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => triggerChange(e.target.value, e)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />

        {/* Botão de Limpeza com Ícone Lucide X e Atalho Esc */}
        {value && !disabled && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            title="Limpar pesquisa (Esc)"
            aria-label="Limpar pesquisa (Esc)"
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
      </div>
    </div>
  );
};
