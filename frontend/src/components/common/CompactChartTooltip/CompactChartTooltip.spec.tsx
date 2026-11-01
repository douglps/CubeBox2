import React from 'react';
import { describe, it, expect } from 'vitest';
import { CompactChartTooltip, resolveTooltipData } from './CompactChartTooltip';

describe('CompactChartTooltip - Componente de Tooltip Resiliente e Compacto', () => {
  describe('resolveTooltipData (Função Pura de Agregação)', () => {
    it('deve retornar valores zerados quando payload for indefinido ou vazio', () => {
      const undefinedResult = resolveTooltipData(undefined);
      expect(undefinedResult.visibleItems).toEqual([]);
      expect(undefinedResult.othersCount).toBe(0);
      expect(undefinedResult.othersSum).toBe(0);
      expect(undefinedResult.totalSum).toBe(0);

      const emptyResult = resolveTooltipData([]);
      expect(emptyResult.visibleItems).toEqual([]);
      expect(emptyResult.totalSum).toBe(0);
    });

    it('deve filtrar entradas nulas ou com valores indefinidos', () => {
      const payloadWithNulls = [
        { name: 'Item A', value: 100 },
        null,
        { name: 'Item B', value: undefined },
        { name: 'Item C', value: 200 },
      ];

      const result = resolveTooltipData(payloadWithNulls as any, 5);
      expect(result.visibleItems).toHaveLength(2);
      expect(result.totalSum).toBe(300);
      expect(result.visibleItems[0].name).toBe('Item C');
      expect(result.visibleItems[1].name).toBe('Item A');
    });

    it('deve limitar a Top N e agregar corretamente outros', () => {
      const payloadMock = [
        { name: 'A', value: 50 },
        { name: 'B', value: 40 },
        { name: 'C', value: 30 },
        { name: 'D', value: 20 },
        { name: 'E', value: 10 },
      ];

      const result = resolveTooltipData(payloadMock, 2);
      expect(result.visibleItems).toHaveLength(2);
      expect(result.visibleItems[0].name).toBe('A');
      expect(result.visibleItems[1].name).toBe('B');
      expect(result.othersCount).toBe(3);
      expect(result.othersSum).toBe(60); // 30 + 20 + 10
      expect(result.totalSum).toBe(150);
    });

    it('deve isolar a série ativa quando focusHoveredOnly for true', () => {
      const payloadMock = [
        { name: 'Série 1', value: 100 },
        { name: 'Série 2', value: 250 },
      ];

      const result = resolveTooltipData(payloadMock, 5, 'Série 2', true);
      expect(result.visibleItems).toHaveLength(1);
      expect(result.visibleItems[0].name).toBe('Série 2');
      expect(result.othersCount).toBe(0);
      expect(result.totalSum).toBe(250);
    });
  });

  describe('CompactChartTooltip (Renderizador JSX)', () => {
    it('deve retornar null se active for falso ou payload estiver vazio', () => {
      const inactiveResult = CompactChartTooltip({
        active: false,
        payload: [{ name: 'Vendas', value: 100 }],
      });
      expect(inactiveResult).toBeNull();

      const emptyResult = CompactChartTooltip({
        active: true,
        payload: [],
      });
      expect(emptyResult).toBeNull();
    });

    it('deve renderizar elemento JSX quando active for verdadeiro e houver payload válido', () => {
      const result = CompactChartTooltip({
        active: true,
        label: '2026-10-30',
        payload: [
          { name: 'Série A', value: 150, color: '#3b82f6' },
          { name: 'Série B', value: 200, color: '#10b981' },
        ],
      });

      expect(result).not.toBeNull();
      if (React.isValidElement(result)) {
        const el = result as React.ReactElement<any>;
        expect(el.props.role).toBe('tooltip');
        expect(el.props['aria-hidden']).toBe(false);
      }
    });

    it('deve segmentar itens em Top N e somar o excedente na linha Outros', () => {
      const payloadMock = [
        { name: 'Prod 1', value: 100 },
        { name: 'Prod 2', value: 90 },
        { name: 'Prod 3', value: 80 },
        { name: 'Prod 4', value: 70 },
        { name: 'Prod 5', value: 60 },
        { name: 'Prod 6', value: 50 },
      ];

      const result = CompactChartTooltip({
        active: true,
        label: '30/10',
        maxVisibleItems: 3,
        payload: payloadMock as any,
      });

      expect(result).not.toBeNull();
      if (React.isValidElement(result)) {
        const el = result as React.ReactElement<any>;
        const itemsList = el.props.children[1];
        const listChildren = itemsList.props.children;
        const visibleItemsList = listChildren[0];
        const othersRow = listChildren[1];

        expect(visibleItemsList).toHaveLength(3);
        expect(othersRow).toBeTruthy();
        const othersText = othersRow.props.children[0].props.children;
        expect(othersText).toContain(3);
      }
    });

    it('deve utilizar custom valueFormatter quando fornecido', () => {
      const customFormatter = (val: number | string | undefined) => `Custom: ${val} pts`;

      const result = CompactChartTooltip({
        active: true,
        label: '30/10',
        valueFormatter: customFormatter,
        payload: [{ name: 'Pontuação', value: 42 }] as any,
      });

      expect(result).not.toBeNull();
      if (React.isValidElement(result)) {
        const el = result as React.ReactElement<any>;
        const itemsList = el.props.children[1];
        const firstItem = itemsList.props.children[0][0];
        const itemValueSpan = firstItem.props.children[1];
        expect(itemValueSpan.props.children).toBe('Custom: 42 pts');
      }
    });

    it('deve formatar moeda brasileira quando currencyFormat for true', () => {
      const result = CompactChartTooltip({
        active: true,
        currencyFormat: true,
        payload: [{ name: 'Receita', value: 1250.5 }] as any,
      });

      expect(result).not.toBeNull();
      if (React.isValidElement(result)) {
        const el = result as React.ReactElement<any>;
        const itemsList = el.props.children[1];
        const firstItem = itemsList.props.children[0][0];
        const itemValueSpan = firstItem.props.children[1];
        expect(itemValueSpan.props.children).toContain('R$');
        expect(itemValueSpan.props.children).toContain('1.250,50');
      }
    });

    it('deve formatar com sufixo de unidade quando unit for fornecido', () => {
      const result = CompactChartTooltip({
        active: true,
        unit: 'un.',
        payload: [{ name: 'Demanda', value: 45 }] as any,
      });

      expect(result).not.toBeNull();
      if (React.isValidElement(result)) {
        const el = result as React.ReactElement<any>;
        const itemsList = el.props.children[1];
        const firstItem = itemsList.props.children[0][0];
        const itemValueSpan = firstItem.props.children[1];
        expect(itemValueSpan.props.children).toBe('45 un.');
      }
    });

    it('deve exibir linha de total quando showTotal for true', () => {
      const payloadMock = [
        { name: 'Item 1', value: 10 },
        { name: 'Item 2', value: 25 },
      ];

      const result = CompactChartTooltip({
        active: true,
        label: 'Total Test',
        showTotal: true,
        payload: payloadMock as any,
      });

      expect(result).not.toBeNull();
      if (React.isValidElement(result)) {
        const el = result as React.ReactElement<any>;
        const itemsList = el.props.children[1];
        const totalRow = itemsList.props.children[2];
        expect(totalRow).toBeTruthy();
        const totalValueSpan = totalRow.props.children[1];
        expect(totalValueSpan.props.children).toBe('35');
      }
    });
  });
});
