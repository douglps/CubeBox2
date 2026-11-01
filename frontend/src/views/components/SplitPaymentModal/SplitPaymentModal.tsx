import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Banknote,
  CreditCard,
  QrCode,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { BankingNumberInput } from '../../../components/common/BankingNumberInput/BankingNumberInput';
import styles from './SplitPaymentModal.module.css';

export type PaymentMethodType = 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO';

export interface PaymentSplitItem {
  id: string;
  method: PaymentMethodType;
  amount: number;
  cashReceived?: number;
  change?: number;
  label: string;
}

export interface SplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  splits: PaymentSplitItem[];
  onConfirm: (splits: PaymentSplitItem[], summaryLabel: string, totalChange?: number) => void;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  splits: initialSplits,
  onConfirm,
}) => {
  const [splits, setSplits] = useState<PaymentSplitItem[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('CARTAO_CREDITO');
  const [inputAmount, setInputAmount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calcula total já adicionado e restante
  const totalPaid = useMemo(() => {
    return splits.reduce((acc, curr) => acc + curr.amount, 0);
  }, [splits]);

  const remaining = useMemo(() => {
    return Math.max(0, parseFloat((total - totalPaid).toFixed(2)));
  }, [total, totalPaid]);

  // Sempre inicia zerado e com foco ao abrir
  useEffect(() => {
    if (isOpen) {
      if (initialSplits && initialSplits.length > 0) {
        setSplits(initialSplits);
      } else {
        setSplits([]);
      }
      setInputAmount(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialSplits]);

  const formatBrl = (val: number) => {
    return (val ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getMethodLabel = (m: PaymentMethodType, indexInType: number) => {
    switch (m) {
      case 'PIX':
        return `PIX (${indexInType}º)`;
      case 'DINHEIRO':
        return `Dinheiro`;
      case 'CARTAO_DEBITO':
        return `Cartão Débito (${indexInType}º)`;
      case 'CARTAO_CREDITO':
        return `Cartão Crédito (${indexInType}º)`;
    }
  };

  const getMethodIcon = (m: PaymentMethodType) => {
    switch (m) {
      case 'PIX':
        return <QrCode size={13} />;
      case 'DINHEIRO':
        return <Banknote size={13} />;
      case 'CARTAO_DEBITO':
      case 'CARTAO_CREDITO':
        return <CreditCard size={13} />;
    }
  };

  // Próximas notas lógicas / sugestões baseadas no método de pagamento e restante
  const suggestedPills = useMemo(() => {
    if (remaining <= 0) return [];

    const realNotes = [2, 5, 10, 20, 50, 100, 200];

    if (selectedMethod === 'DINHEIRO') {
      // No dinheiro pode pagar com notas de valor acima do restante (pois há troco)
      const exactNotes = realNotes.filter((n) => n <= remaining);
      const higherNotes = realNotes.filter((n) => n > remaining);
      const nextTen = Math.ceil(remaining / 10) * 10;

      // Junta notas menores/iguais relevantes e a próxima nota maior ou próxima dezena
      const candidates = new Set<number>();
      exactNotes.forEach((n) => candidates.add(n));
      if (nextTen > remaining) candidates.add(nextTen);
      if (higherNotes.length > 0) candidates.add(higherNotes[0]); // Primeira nota imediatamente maior
      if (higherNotes.length > 1 && higherNotes[0] < 50) candidates.add(higherNotes[1]);

      return Array.from(candidates).sort((a, b) => a - b);
    } else {
      // Cartões e PIX: não permitem troco nem valores maiores que o restante a pagar
      return realNotes.filter((n) => n < remaining);
    }
  }, [remaining, selectedMethod]);

  // Calcula troco total acumulado das parcelas em dinheiro
  const totalChange = useMemo(() => {
    return splits.reduce((acc, curr) => acc + (curr.change || 0), 0);
  }, [splits]);

  const handleAddSplit = () => {
    if (inputAmount <= 0) return;
    const sameMethodCount = splits.filter((s) => s.method === selectedMethod).length + 1;

    let appliedAmount = inputAmount;
    let cashReceived: number | undefined = undefined;
    let change: number | undefined = undefined;

    if (selectedMethod === 'DINHEIRO') {
      if (inputAmount > remaining && remaining > 0) {
        appliedAmount = remaining;
        cashReceived = inputAmount;
        change = parseFloat((inputAmount - remaining).toFixed(2));
      } else {
        appliedAmount = inputAmount;
        cashReceived = inputAmount;
        change = 0;
      }
    } else {
      appliedAmount = Math.min(inputAmount, remaining > 0 ? remaining : inputAmount);
    }

    const newItem: PaymentSplitItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      method: selectedMethod,
      amount: appliedAmount,
      cashReceived,
      change,
      label: getMethodLabel(selectedMethod, sameMethodCount),
    };

    const nextSplits = [...splits, newItem];
    setSplits(nextSplits);

    // Reinicia o campo sempre zerado e com foco após cada inserção
    setInputAmount(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputAmount > 0) {
        handleAddSplit();
      }
    }
  };

  const handleRemoveSplit = (id: string) => {
    const nextSplits = splits.filter((s) => s.id !== id);
    setSplits(nextSplits);
    setInputAmount(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleConfirm = () => {
    if (remaining > 0.009 || splits.length === 0) return;
    // Monta rótulo informativo para exibição na comanda e cupom
    const summary = splits
      .map((s) => `${s.label}: ${formatBrl(s.amount)}${s.change && s.change > 0 ? ` (Recebido: ${formatBrl(s.cashReceived || 0)} | Troco: ${formatBrl(s.change)})` : ''}`)
      .join(' + ');

    onConfirm(splits, `MÚLTIPLO (${summary})`, totalChange);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Dividir Pagamento"
      footer={
        <div className={styles.footerActions}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            icon={<CheckCircle2 size={16} />}
            disabled={remaining > 0.009 || splits.length === 0}
            onClick={handleConfirm}
          >
            Confirmar Pagamento
          </Button>
        </div>
      }
    >
      <div className={styles.container}>
        {/* Coluna Esquerda: Edição e Inserção de Parcelas */}
        <div className={styles.leftColumn}>
          {remaining > 0.009 ? (
            <div className={styles.addSection}>
              <span className={styles.sectionTitle}>
                <span>Selecionar Forma de Pagamento</span>
              </span>

              <div className={styles.methodSelectorRow}>
                <button
                  type="button"
                  className={`${styles.methodBtn} ${
                    selectedMethod === 'CARTAO_CREDITO' ? styles.methodActive : ''
                  }`}
                  onClick={() => setSelectedMethod('CARTAO_CREDITO')}
                >
                  <CreditCard size={13} />
                  <span>Crédito</span>
                </button>

                <button
                  type="button"
                  className={`${styles.methodBtn} ${
                    selectedMethod === 'CARTAO_DEBITO' ? styles.methodActive : ''
                  }`}
                  onClick={() => setSelectedMethod('CARTAO_DEBITO')}
                >
                  <CreditCard size={13} />
                  <span>Débito</span>
                </button>

                <button
                  type="button"
                  className={`${styles.methodBtn} ${
                    selectedMethod === 'PIX' ? styles.methodActive : ''
                  }`}
                  onClick={() => setSelectedMethod('PIX')}
                >
                  <QrCode size={13} />
                  <span>PIX</span>
                </button>

                <button
                  type="button"
                  className={`${styles.methodBtn} ${
                    selectedMethod === 'DINHEIRO' ? styles.methodActive : ''
                  }`}
                  onClick={() => setSelectedMethod('DINHEIRO')}
                >
                  <Banknote size={13} />
                  <span>Dinheiro</span>
                </button>
              </div>

              <div className={styles.amountInputRow}>
                <div style={{ flex: 1 }}>
                  <BankingNumberInput
                    ref={inputRef}
                    mode="currency"
                    value={inputAmount}
                    onChange={setInputAmount}
                    onKeyDown={handleInputKeyDown}
                    min={0}
                    step={5}
                    autoFocus
                    label="Valor a Inserir"
                    helperText="Pressione [Enter] para registrar a parcela"
                  />
                </div>
                <button
                  type="button"
                  className={styles.fillRemainingBtn}
                  onClick={() => {
                    setInputAmount(remaining);
                    inputRef.current?.focus();
                  }}
                  title="Preencher com o saldo restante"
                >
                  Restante ({formatBrl(remaining)})
                </button>
              </div>

              {suggestedPills.length > 0 && (
                <div className={styles.shortcutsRow}>
                  <span className={styles.shortcutsLabel}>Notas / Atalhos:</span>
                  {suggestedPills.map((pillVal) => (
                    <button
                      key={pillVal}
                      type="button"
                      className={styles.notePill}
                      onClick={() => {
                        setInputAmount(pillVal);
                        inputRef.current?.focus();
                      }}
                    >
                      {formatBrl(pillVal)}
                    </button>
                  ))}
                </div>
              )}

              {/* Pré-visualização de troco instantâneo ao digitar dinheiro acima do restante */}
              {selectedMethod === 'DINHEIRO' && inputAmount > remaining && remaining > 0 && (
                <div className={styles.changeSummaryBox}>
                  <span className={styles.changeSummaryLabel}>Troco Estimado:</span>
                  <span className={styles.changeSummaryValue}>
                    {formatBrl(inputAmount - remaining)}
                  </span>
                </div>
              )}

              <div className={styles.addBtnRow}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Plus size={14} />}
                  disabled={inputAmount <= 0}
                  onClick={handleAddSplit}
                >
                  Inserir Parcela [Enter]
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.changeSummaryBox} style={{ justifyContent: 'center', padding: '16px' }}>
              <span className={styles.changeSummaryLabel} style={{ fontSize: '13px' }}>
                ✓ Saldo total 100% quitado! Clique em confirmar abaixo.
              </span>
            </div>
          )}
        </div>

        {/* Coluna Direita: Resumo Financeiro da Operação */}
        <div className={styles.rightColumn}>
          <div className={styles.statusHeader}>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>Total da Venda:</span>
              <span className={styles.totalValue}>{formatBrl(total)}</span>
            </div>
            <div className={styles.statusCard}>
              <span className={styles.statusLabel}>Restante a Pagar:</span>
              <span
                className={
                  remaining <= 0.009
                    ? styles.remainingValueZero
                    : styles.remainingValuePending
                }
              >
                {remaining <= 0.009 ? 'Quitado (R$ 0,00)' : formatBrl(remaining)}
              </span>
            </div>
          </div>

          {/* Troco Acumulado em Dinheiro */}
          {totalChange > 0 && (
            <div className={styles.changeSummaryBox}>
              <span className={styles.changeSummaryLabel}>Troco Total a Devolver:</span>
              <span className={styles.changeSummaryValue}>{formatBrl(totalChange)}</span>
            </div>
          )}

          {/* Lista de Parcelas Adicionadas */}
          <div className={styles.paymentsSection}>
            <div className={styles.sectionTitle}>
              <span>Formas Adicionadas ({splits.length}):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                Pago: {formatBrl(totalPaid)}
              </span>
            </div>

            <div className={styles.paymentsList}>
              {splits.length === 0 ? (
                <div className={styles.emptySplits}>
                  Nenhuma forma adicionada ainda.
                </div>
              ) : (
                splits.map((s) => (
                  <div key={s.id} className={styles.paymentRow}>
                    <div className={styles.paymentRowInfo}>
                      <div className={styles.paymentRowHeader}>
                        {getMethodIcon(s.method)}
                        <span className={styles.paymentRowMethod}>{s.label}</span>
                      </div>
                      {s.change && s.change > 0 ? (
                        <span className={styles.paymentRowChangeDetail}>
                          Recebido: {formatBrl(s.cashReceived || 0)} (Troco: {formatBrl(s.change)})
                        </span>
                      ) : null}
                    </div>
                    <div className={styles.paymentRowRight}>
                      <span className={styles.paymentRowAmount}>{formatBrl(s.amount)}</span>
                      <button
                        type="button"
                        className={styles.removeRowBtn}
                        onClick={() => handleRemoveSplit(s.id)}
                        title="Remover parcela"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

