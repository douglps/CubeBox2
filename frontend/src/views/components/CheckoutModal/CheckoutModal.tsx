import React, { useState, useEffect, useMemo } from 'react';
import {
  Banknote,
  CreditCard,
  QrCode,
  Truck,
  Store,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Customer, Product } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { BankingNumberInput } from '../../../components/common/BankingNumberInput/BankingNumberInput';
import { maskCpfCnpj } from '../../../utils/masks';
import styles from './CheckoutModal.module.css';

export interface CheckoutModalItem {
  product: Product;
  quantity: number;
}

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CheckoutModalItem[];
  subtotal: number;
  total: number;
  selectedCustomer: Customer | null;
  // Estados vinculados
  deliveryType: 'BALCAO' | 'ENTREGA';
  setDeliveryType: (val: 'BALCAO' | 'ENTREGA') => void;
  deliveryFee: number;
  setDeliveryFee: (val: number) => void;
  discountPercent: number;
  discountValue: number;
  onDiscountPercentChange: (val: number) => void;
  onDiscountValueChange: (val: number) => void;
  paymentMethod: 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | null;
  setPaymentMethod: (val: 'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | null) => void;
  enableCpfNota: boolean;
  setEnableCpfNota: (val: boolean) => void;
  cpfNota: string;
  setCpfNota: (val: string) => void;
  // Ações
  isSubmitting: boolean;
  onConfirmCheckout: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  subtotal,
  total,
  selectedCustomer,
  deliveryType,
  setDeliveryType,
  deliveryFee,
  setDeliveryFee,
  discountPercent,
  discountValue,
  onDiscountPercentChange,
  onDiscountValueChange,
  paymentMethod,
  setPaymentMethod,
  enableCpfNota,
  setEnableCpfNota,
  cpfNota,
  setCpfNota,
  isSubmitting,
  onConfirmCheckout,
}) => {
  // Dinheiro recebido para cálculo de troco instantâneo
  const [cashReceived, setCashReceived] = useState<number>(total);

  // Mantém cashReceived alinhado ou sincronizado inicialmente ao total
  useEffect(() => {
    if (isOpen) {
      setCashReceived(total);
    }
  }, [isOpen, total]);

  // Cálculo de troco
  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'DINHEIRO') return 0;
    return Math.max(0, cashReceived - total);
  }, [cashReceived, total, paymentMethod]);

  const deficitAmount = useMemo(() => {
    if (paymentMethod !== 'DINHEIRO') return 0;
    return Math.max(0, total - cashReceived);
  }, [cashReceived, total, paymentMethod]);

  // Sugestões de notas inteligentes baseadas no total
  const suggestedNotes = useMemo(() => {
    if (total <= 0) return [];
    const notes = [10, 20, 50, 100, 200];
    const available = notes.filter((n) => n >= total);
    // Adiciona a nota de teto arredondado caso não esteja exata
    const nextTen = Math.ceil(total / 10) * 10;
    const combined = Array.from(new Set([total, nextTen, ...available]))
      .filter((v) => v >= total)
      .slice(0, 4);
    return combined;
  }, [total]);

  // Teclas de atalho no modal: F1, F2, F3, F4, Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setPaymentMethod('PIX');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setPaymentMethod('DINHEIRO');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setPaymentMethod('CARTAO_DEBITO');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setPaymentMethod('CARTAO_CREDITO');
      } else if (e.key === 'Enter' && !isSubmitting) {
        const target = e.target as HTMLElement;
        // Permite se não for um botão com foco específico
        if (target.tagName !== 'BUTTON') {
          e.preventDefault();
          onConfirmCheckout();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, setPaymentMethod, onConfirmCheckout]);

  const formatBrl = (val: number) => {
    return (val ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Fechamento de Venda & Pagamento"
      footer={
        <div className={styles.modalFooterContent}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Voltar à Comanda
          </Button>
          <Button
            variant="primary"
            icon={<CheckCircle2 size={16} />}
            loading={isSubmitting}
            disabled={cart.length === 0 || (paymentMethod === 'DINHEIRO' && deficitAmount > 0.009)}
            onClick={onConfirmCheckout}
          >
            Confirmar e Concluir Venda (Enter)
          </Button>
        </div>
      }
    >
      <div className={styles.modalSplitLayout}>
        {/* Painel Esquerdo: Resumo da Venda */}
        <div className={styles.summaryPane}>
          <div className={styles.paneTitle}>Resumo do Pedido</div>

          {selectedCustomer ? (
            <div className={styles.customerBox}>
              <span className={styles.customerBoxName}>
                <UserCheck size={13} color="var(--color-interactive-primary)" />
                {selectedCustomer.nome}
              </span>
              <span className={styles.customerBoxSub}>
                {selectedCustomer.cpf_cnpj ? `CPF: ${maskCpfCnpj(selectedCustomer.cpf_cnpj)} • ` : ''}
                {selectedCustomer.telefone || 'Sem tel'}
              </span>
              {deliveryType === 'ENTREGA' && selectedCustomer.logradouro && (
                <span className={styles.customerBoxSub} style={{ color: 'var(--text-secondary)' }}>
                  📍 {selectedCustomer.logradouro}, {selectedCustomer.numero || 'S/N'}
                </span>
              )}
            </div>
          ) : (
            <div className={styles.customerBox} style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
              Consumidor Final (Sem cadastro)
            </div>
          )}

          <div className={styles.itemsSummary}>
            {cart.map((item) => (
              <div key={item.product.id} className={styles.summaryItemRow}>
                <span className={styles.summaryItemName} title={item.product.name}>
                  {item.quantity}x {item.product.name}
                </span>
                <span className={styles.summaryItemVal}>
                  {formatBrl((item.product.unit_price ?? 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.financialSummary}>
            <div className={financeRowClass(styles.financeRow)}>
              <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} itens):</span>
              <span className={styles.financeRowVal}>{formatBrl(subtotal)}</span>
            </div>
            {discountValue > 0 && (
              <div className={styles.financeRow} style={{ color: 'var(--status-danger)' }}>
                <span>Desconto ({discountPercent.toFixed(1)}%):</span>
                <span className={styles.financeRowVal}>- {formatBrl(discountValue)}</span>
              </div>
            )}
            {deliveryType === 'ENTREGA' && deliveryFee > 0 && (
              <div className={styles.financeRow}>
                <span>Taxa de Entrega:</span>
                <span className={styles.financeRowVal}>+ {formatBrl(deliveryFee)}</span>
              </div>
            )}
          </div>

          <div className={styles.totalHighlightBox}>
            <span className={styles.totalHighlightLabel}>Total a Pagar</span>
            <span className={styles.totalHighlightAmount}>{formatBrl(total)}</span>
          </div>
        </div>

        {/* Painel Direito: Condições e Forma de Pagamento */}
        <div className={styles.controlsPane}>
          {/* Modalidade */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>Modalidade da Venda</span>
            <div className={styles.modalDeliveryToggles}>
              <button
                type="button"
                className={`${styles.modalDeliveryBtn} ${
                  deliveryType === 'BALCAO' ? styles.modalDeliveryActive : ''
                }`}
                onClick={() => setDeliveryType('BALCAO')}
              >
                <Store size={14} />
                Retirada no Balcão
              </button>
              <button
                type="button"
                className={`${styles.modalDeliveryBtn} ${
                  deliveryType === 'ENTREGA' ? styles.modalDeliveryActive : ''
                }`}
                onClick={() => setDeliveryType('ENTREGA')}
              >
                <Truck size={14} />
                Entrega em Domicílio
              </button>
            </div>

            {deliveryType === 'ENTREGA' && (
              <div className={styles.deliveryFeeInline}>
                <span className={styles.deliveryFeeLabel}>Taxa de Entrega:</span>
                <div style={{ width: '130px' }}>
                  <BankingNumberInput
                    mode="currency"
                    value={deliveryFee}
                    onChange={setDeliveryFee}
                    min={0}
                    step={1}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Desconto */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>Desconto Concedido</span>
            <div className={styles.discountCompactRow}>
              <div style={{ flex: 1 }}>
                <BankingNumberInput
                  mode="percent"
                  value={discountPercent}
                  onChange={onDiscountPercentChange}
                  max={100}
                  step={1}
                />
              </div>
              <span className={styles.syncIcon}>⇄</span>
              <div style={{ flex: 1.2 }}>
                <BankingNumberInput
                  mode="currency"
                  value={discountValue}
                  onChange={onDiscountValueChange}
                  max={subtotal}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>Forma de Pagamento</span>
            <div className={styles.modalPaymentGrid}>
              <button
                type="button"
                className={`${styles.modalPayBtn} ${
                  paymentMethod === 'PIX' ? styles.modalPayActive : ''
                }`}
                onClick={() => setPaymentMethod('PIX')}
              >
                <QrCode size={18} />
                <span>PIX [F1]</span>
              </button>

              <button
                type="button"
                className={`${styles.modalPayBtn} ${
                  paymentMethod === 'DINHEIRO' ? styles.modalPayActive : ''
                }`}
                onClick={() => setPaymentMethod('DINHEIRO')}
              >
                <Banknote size={18} />
                <span>Dinheiro [F2]</span>
              </button>

              <button
                type="button"
                className={`${styles.modalPayBtn} ${
                  paymentMethod === 'CARTAO_DEBITO' ? styles.modalPayActive : ''
                }`}
                onClick={() => setPaymentMethod('CARTAO_DEBITO')}
              >
                <CreditCard size={18} />
                <span>Débito [F3]</span>
              </button>

              <button
                type="button"
                className={`${styles.modalPayBtn} ${
                  paymentMethod === 'CARTAO_CREDITO' ? styles.modalPayActive : ''
                }`}
                onClick={() => setPaymentMethod('CARTAO_CREDITO')}
              >
                <CreditCard size={18} />
                <span>Crédito [F4]</span>
              </button>
            </div>
          </div>

          {/* Bloco Contextual de Dinheiro e Troco */}
          {paymentMethod === 'DINHEIRO' && (
            <div className={styles.cashPanel}>
              <span className={styles.sectionLabel}>Cálculo de Dinheiro & Troco</span>
              <div className={styles.cashRow}>
                <div style={{ flex: 1 }}>
                  <BankingNumberInput
                    mode="currency"
                    value={cashReceived}
                    onChange={setCashReceived}
                    min={0}
                    step={5}
                    label="Valor Entregue pelo Cliente"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Atalhos:</span>
                  <div className={styles.quickNotes}>
                    <button
                      type="button"
                      className={styles.notePill}
                      onClick={() => setCashReceived(total)}
                    >
                      Exato
                    </button>
                    {suggestedNotes.map((note) => (
                      <button
                        key={note}
                        type="button"
                        className={styles.notePill}
                        onClick={() => setCashReceived(note)}
                      >
                        {formatBrl(note)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {deficitAmount > 0.009 ? (
                <div className={`${styles.changeDisplay} ${styles.changeDeficit}`}>
                  <span className={styles.changeLabel}>Valor insuficiente:</span>
                  <span className={styles.changeDeficitAmount}>
                    Faltam {formatBrl(deficitAmount)}
                  </span>
                </div>
              ) : (
                <div className={`${styles.changeDisplay} ${styles.changeSuccess}`}>
                  <span className={styles.changeLabel}>Troco a Devolver:</span>
                  <span className={styles.changeAmount}>{formatBrl(changeAmount)}</span>
                </div>
              )}
            </div>
          )}

          {/* CPF na Nota */}
          <div className={styles.modalCpfRow}>
            <label className={styles.cpfCheckbox}>
              <input
                type="checkbox"
                checked={enableCpfNota}
                onChange={(e) => {
                  setEnableCpfNota(e.target.checked);
                  if (e.target.checked && selectedCustomer?.cpf_cnpj) {
                    setCpfNota(maskCpfCnpj(selectedCustomer.cpf_cnpj));
                  }
                }}
              />
              <span>Emitir CPF na Nota Fiscal</span>
            </label>
            {enableCpfNota && (
              <input
                type="text"
                placeholder="000.000.000-00"
                className={styles.modalCpfInput}
                value={cpfNota}
                onChange={(e) => setCpfNota(maskCpfCnpj(e.target.value))}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

function financeRowClass(cls: string): string {
  return cls;
}
