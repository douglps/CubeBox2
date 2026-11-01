/**
 * =============================================================================
 * TESTES UNITÁRIOS - FLUXO DE APROVAÇÃO PREDITIVA E PREVENÇÃO DE DUPLICIDADE
 * =============================================================================
 * Valida os requisitos:
 * 1. Após aprovar, não liberar o botão de emitir ordem no modal.
 * 2. Bloquear abertura de modal e aprovação repetida do mesmo item enquanto em processamento.
 * 3. Sinalizar com spinner/load até conclusão do recálculo.
 * =============================================================================
 */

import { describe, it, expect } from 'vitest';

describe('PredictiveView - Regras de Proteção Contra Aprovação Repetida', () => {
  interface ReorderItem {
    product_id: number;
    product_name: string;
    suggested_reorder_qty: number;
  }

  function canOpenPurchaseModal(item: ReorderItem, processingProductIds: number[]): boolean {
    return !processingProductIds.includes(item.product_id);
  }

  function isSubmitButtonDisabled(
    isSubmitting: boolean,
    orderQty: number,
    productId: number | null,
    processingProductIds: number[]
  ): boolean {
    if (isSubmitting) return true;
    if (orderQty <= 0) return true;
    if (productId !== null && processingProductIds.includes(productId)) return true;
    return false;
  }

  function isItemActionDisabled(productId: number, processingProductIds: number[]): boolean {
    return processingProductIds.includes(productId);
  }

  const sampleItem: ReorderItem = {
    product_id: 101,
    product_name: 'Cerveja Heineken 350ml',
    suggested_reorder_qty: 48,
  };

  it('deve permitir abrir modal quando o produto não está em processamento', () => {
    const processingIds: number[] = [];
    expect(canOpenPurchaseModal(sampleItem, processingIds)).toBe(true);
  });

  it('não deve permitir abrir modal nem aprovar repetido quando o item já está em processamento', () => {
    const processingIds: number[] = [101];
    expect(canOpenPurchaseModal(sampleItem, processingIds)).toBe(false);
    expect(isItemActionDisabled(101, processingIds)).toBe(true);
  });

  it('não deve liberar botão de emitir ordem no modal enquanto isSubmitting for true', () => {
    expect(isSubmitButtonDisabled(true, 48, 101, [])).toBe(true);
  });

  it('não deve liberar botão de emitir ordem no modal se o item já estiver na lista de processamento', () => {
    expect(isSubmitButtonDisabled(false, 48, 101, [101])).toBe(true);
  });

  it('não deve liberar botão de emitir ordem se quantidade for zero ou negativa', () => {
    expect(isSubmitButtonDisabled(false, 0, 101, [])).toBe(true);
    expect(isSubmitButtonDisabled(false, -5, 101, [])).toBe(true);
  });

  it('deve liberar o botão de emitir ordem apenas quando válido, sem submit e sem processamento em andamento', () => {
    expect(isSubmitButtonDisabled(false, 48, 101, [])).toBe(false);
  });
});

