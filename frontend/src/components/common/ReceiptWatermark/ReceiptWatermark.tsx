import React from 'react';
import styles from './ReceiptWatermark.module.css';

export interface ReceiptWatermarkProps {
  children: React.ReactNode;
  orderNumber?: string;
  timestamp?: string;
  operatorName?: string;
}

export const ReceiptWatermark: React.FC<ReceiptWatermarkProps> = ({
  children,
  orderNumber = '001',
  timestamp = new Date().toLocaleTimeString('pt-BR'),
  operatorName = 'Operador Caixa',
}) => {
  return (
    <div className={styles.receiptContainer}>
      {/* Faixa Superior de Isenção Fiscal */}
      <div className={styles.headerAlert}>
        ⚠️ DOCUMENTO OPERACIONAL DE CONTROLE INTERNO
      </div>

      {/* Padrão Repetido de Carimbos em Posições Variadas para Legibilidade Total */}
      <div className={styles.watermarkPattern} aria-hidden="true">
        <span className={styles.stamp}>NÃO POSSUI VALOR FISCAL</span>
        <span className={styles.stamp}>NÃO POSSUI VALOR FISCAL</span>
        <span className={styles.stamp}>NÃO POSSUI VALOR FISCAL</span>
        <span className={styles.stamp}>NÃO POSSUI VALOR FISCAL</span>
      </div>

      {/* Conteúdo do Comprovante */}
      <div className={styles.receiptBody}>
        <div className={styles.receiptMeta}>
          <span>Comanda #{orderNumber}</span>
          <span>{timestamp}</span>
        </div>
        <div className={styles.receiptContent}>{children}</div>
        <div className={styles.receiptFooter}>
          <span>Atendente: {operatorName}</span>
          <span className={styles.legalNotice}>
            Para emissão de documento fiscal regular, utilize o software emissor oficial credenciado.
          </span>
        </div>
      </div>
    </div>
  );
};
