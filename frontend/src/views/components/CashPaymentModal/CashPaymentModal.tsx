import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { BankingNumberInput } from '../../../components/common/BankingNumberInput/BankingNumberInput';
import styles from './CashPaymentModal.module.css';

export interface CashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  cashReceived: number;
  onConfirm: (received: number) => void;
}

export const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  cashReceived: _initialReceived,
  onConfirm,
}) => {
  // Preenchimento inicial vazio (0) para digitação ágil imediata
  const [received, setReceived] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setReceived(0);
    }
  }, [isOpen]);

  const change = useMemo(() => {
    return Math.max(0, received - total);
  }, [received, total]);

  const deficit = useMemo(() => {
    return Math.max(0, total - received);
  }, [received, total]);

  // Próximos múltiplos adequados de 10, 20, 50 e 100 acima do total
  const suggestedMultiples = useMemo(() => {
    if (total <= 0) return [];
    const bases = [10, 20, 50, 100];
    const candidates = bases.map((base) => Math.ceil(total / base) * base);
    // Filtrar apenas valores estritamente maiores que o total (evitando redundância com Exato)
    const valid = Array.from(new Set(candidates.filter((v) => v > total))).sort((a, b) => a - b);
    return valid;
  }, [total]);

  const formatBrl = (val: number) => {
    return (val ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleConfirm = () => {
    if (deficit > 0.009) return;
    onConfirm(received);
    onClose();
  };

  // Tecla Enter para confirmar se o valor for suficiente
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'BUTTON') {
          e.preventDefault();
          if (deficit <= 0.009) {
            handleConfirm();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, deficit, received]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Pagamento em Dinheiro"
      footer={
        <div className={styles.footerActions}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={<CheckCircle2 size={16} />}
            disabled={deficit > 0.009}
            onClick={handleConfirm}
          >
            Confirmar Pagamento
          </Button>
        </div>
      }
    >
      <div className={styles.container}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total da Venda:</span>
          <div className={styles.totalRight}>
            <span className={styles.totalValue}>{formatBrl(total)}</span>
            <button
              type="button"
              className={styles.exactBtn}
              onClick={() => setReceived(total)}
              title="Preencher com o valor exato"
            >
              Exato
            </button>
          </div>
        </div>

        <div className={styles.inputSection}>
          <span className={styles.inputLabel}>Valor Recebido:</span>
          <BankingNumberInput
            mode="currency"
            value={received}
            onChange={setReceived}
            min={0}
            step={5}
            autoFocus
          />

          {suggestedMultiples.length > 0 && (
            <div className={styles.shortcutsRow}>
              <span className={styles.shortcutsLabel}>Próximos Valores:</span>
              {suggestedMultiples.map((mult) => (
                <button
                  key={mult}
                  type="button"
                  className={styles.notePill}
                  onClick={() => setReceived(mult)}
                >
                  {formatBrl(mult)}
                </button>
              ))}
            </div>
          )}
        </div>

        {deficit > 0.009 ? (
          <div className={`${styles.changeBox} ${styles.changeDeficit}`}>
            <span className={styles.changeLabel}>Falta Pagar:</span>
            <span className={styles.deficitAmount}>{formatBrl(deficit)}</span>
          </div>
        ) : (
          <div className={`${styles.changeBox} ${styles.changeSuccess}`}>
            <span className={styles.changeLabel}>Troco a Devolver:</span>
            <span className={styles.changeAmount}>{formatBrl(change)}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
