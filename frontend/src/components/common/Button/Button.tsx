/**
 * =============================================================================
 * BOTÃO PADRÃO DO SISTEMA (ATOMIC DESIGN - BUTTON)
 * =============================================================================
 * Projeto: CubeBox Mini
 * Função no Negócio:
 *     Elemento de clique essencial da interface. Funciona como as "teclas físicas"
 *     de uma máquina registradora ou os botões de confirmação no balcão de vendas.
 * 
 * Por que ele existe e o que resolve:
 *     Padroniza feedback tátil, estados de carregamento (loading spinner) e teclas
 *     de atalho (hotkeys como F2, F9, ESC), permitindo que o operador do PDV
 *     realize ações sem tirar a mão do teclado e sem cliques acidentais duplos.
 * =============================================================================
 */

import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  loadingText?: string;
  hotkey?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  loadingText,
  hotkey,
  icon,
  className = '',
  disabled,
  type = 'button',
  ...rest
}) => {
  const isBusy = isLoading || loading;
  const variantClass = styles[`btn_${variant}`] || styles.btn_primary;
  const sizeClass = styles[`btn_${size}`] || styles.btn_md;

  const content = (
    <button
      type={type}
      className={`${styles.button} ${variantClass} ${sizeClass} ${isBusy ? styles.loading : ''} ${className}`}
      disabled={disabled || isBusy}
      aria-keyshortcuts={hotkey}
      {...rest}
    >
      {isBusy ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );

  if (!hotkey) {
    return content;
  }

  return (
    <div className={styles.buttonWrapper}>
      {content}
      <div className={styles.floatingTooltip} role="tooltip">
        <span className={styles.tooltipLabel}>{typeof children === 'string' ? children : 'Ação'}</span>
        <kbd className={styles.tooltipKbd}>{hotkey}</kbd>
      </div>
    </div>
  );
};
