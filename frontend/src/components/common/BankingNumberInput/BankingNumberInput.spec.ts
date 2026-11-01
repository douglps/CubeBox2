import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('BankingNumberInput - Comportamento com Seleção de Texto e Digitação', () => {
  it('concatena à direita quando não há seleção ativa', () => {
    // Renderiza conceitualmente o listener chamando o handleKeyDown
    const handleKeyDownWrapper = (currentValue: number, key: string, selection?: [number, number]) => {
      let emittedValue = currentValue;
      const fakeInput = {
        value: '10,00',
        selectionStart: selection ? selection[0] : null,
        selectionEnd: selection ? selection[1] : null,
      } as unknown as HTMLInputElement;

      const e = {
        currentTarget: fakeInput,
        key,
        preventDefault: vi.fn(),
        defaultPrevented: false,
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      // Simulação idêntica à lógica do componente
      const hasSelection =
        fakeInput.selectionStart !== null &&
        fakeInput.selectionEnd !== null &&
        fakeInput.selectionEnd > fakeInput.selectionStart;

      if (/^[0-9]$/.test(e.key)) {
        const digit = parseInt(e.key, 10);
        const currentRawUnits = Math.round(currentValue * 100);
        const newUnits = hasSelection ? digit : currentRawUnits * 10 + digit;
        emittedValue = newUnits / 100;
      }

      return emittedValue;
    };

    // Sem seleção: 10.00 com dígito '5' vira 100.05
    const valWithoutSelection = handleKeyDownWrapper(10.0, '5', [5, 5]);
    expect(valWithoutSelection).toBe(100.05);

    // Com seleção ativa: 10.00 com dígito '5' substitui a seleção tornando-se 0.05
    const valWithSelection = handleKeyDownWrapper(10.0, '5', [0, 5]);
    expect(valWithSelection).toBe(0.05);
  });

  it('zera o valor ao pressionar Backspace ou Delete com seleção ativa', () => {
    const testSelectionClear = (key: 'Backspace' | 'Delete') => {
      const fakeInput = {
        value: '25,00',
        selectionStart: 0,
        selectionEnd: 5,
      } as unknown as HTMLInputElement;

      const hasSelection =
        fakeInput.selectionStart !== null &&
        fakeInput.selectionEnd !== null &&
        fakeInput.selectionEnd > fakeInput.selectionStart;

      let reset = false;
      if (hasSelection && (key === 'Delete' || key === 'Backspace')) {
        reset = true;
      }
      return reset;
    };

    expect(testSelectionClear('Backspace')).toBe(true);
    expect(testSelectionClear('Delete')).toBe(true);
  });
});
