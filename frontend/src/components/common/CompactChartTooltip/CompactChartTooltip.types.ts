import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

export interface CompactChartTooltipProps extends TooltipProps<ValueType, NameType> {
  /**
   * Quantidade máxima de itens individuais exibidos antes de agrupar em 'Outros'.
   * @default 5
   */
  maxVisibleItems?: number;

  /**
   * Se verdadeiro, formata números automaticamente como moeda Brasileira (R$).
   * @default false
   */
  currencyFormat?: boolean;

  /**
   * Sufixo de unidade a ser anexado ao valor (ex: 'un.', 'kg', 'cx').
   */
  unit?: string;

  /**
   * Chave da série atualmente em foco no cursor (hover).
   * Se fornecida, prioriza ou destaca visualmente a série correspondente.
   */
  hoveredSeriesKey?: string | null;

  /**
   * Se verdadeiro, exibe exclusivamente a série em foco (hoveredSeriesKey), se ativa.
   * @default false
   */
  focusHoveredOnly?: boolean;

  /**
   * Se verdadeiro, exibe uma linha de rodapé com o Somatório Total.
   * @default false
   */
  showTotal?: boolean;

  /**
   * Função customizada para formatação de valores.
   */
  valueFormatter?: (value: number | string | undefined, name?: NameType) => string;

  /**
   * Largura mínima do container do tooltip.
   */
  minWidth?: number | string;

  /**
   * Largura máxima do container do tooltip.
   */
  maxWidth?: number | string;
}
