/**
 * =============================================================================
 * COMPONENTE ATÔMICO DE ALERTA RESILIENTE COM SMART RETRY - CUBEBOX ENTERPRISE
 * =============================================================================
 * Padrão: RFC 7807, Jakob Nielsen #9, Apple HIG & WCAG 2.1 AA
 * Função:
 *   Exibe mensagens operacionais diretas de 1 linha.
 *   Exibe o botão 'Tentar novamente' exclusivamente quando onRetry é fornecido
 *   (falhas transitórias). Implementa proteção contra rage clicks com spinner.
 * =============================================================================
 */

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, RefreshCw, X } from 'lucide-react';
import styles from './InlineAlert.module.css';

export interface InlineAlertProps {
  message: string;
  variant?: 'error' | 'warning' | 'info';
  onRetry?: () => Promise<void> | void;
  onDismiss?: () => void;
  className?: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  message,
  variant = 'error',
  onRetry,
  onDismiss,
  className = '',
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'warning':
        return styles.variantWarning;
      case 'info':
        return styles.variantInfo;
      case 'error':
      default:
        return styles.variantError;
    }
  };

  const renderIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle size={18} className={styles.icon} />;
      case 'info':
        return <Info size={18} className={styles.icon} />;
      case 'error':
      default:
        return <AlertCircle size={18} className={styles.icon} />;
    }
  };

  return (
    <div
      className={`${styles.alertContainer} ${getVariantClass()} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.contentWrapper}>
        {renderIcon()}
        <span className={styles.message}>{message}</span>
      </div>

      <div className={styles.actions}>
        {onRetry && (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className={styles.retryBtn}
            aria-label="Tentar novamente"
          >
            <RefreshCw size={12} className={isRetrying ? styles.spin : ''} />
            <span>{isRetrying ? 'Tentando...' : 'Tentar novamente'}</span>
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={styles.closeBtn}
            aria-label="Fechar aviso"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
