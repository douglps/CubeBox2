---
id: US-UI-10
title: Tooltip Compacto e Resiliente de Gráficos (Data Visualization)
bounded_context: 05-frontend-ui
complexity: Média
token_budget: 450
dependencies:
  sdd: docs/sdd/SDD-CBOX-UI-TOOLTIP-V1.0.0.md
  code_impacts:
    - frontend/src/components/common/CompactChartTooltip/CompactChartTooltip.tsx
    - frontend/src/components/common/CompactChartTooltip/CompactChartTooltip.module.css
    - frontend/src/components/common/CompactChartTooltip/CompactChartTooltip.types.ts
    - frontend/src/components/common/CompactChartTooltip/CompactChartTooltip.spec.tsx
    - frontend/src/components/common/CompactChartTooltip/index.ts
    - frontend/src/views/DashboardView.tsx
    - frontend/src/views/PredictiveView.tsx
---

# US-UI-10: Tooltip Compacto e Resiliente de Gráficos

## 1. Narrativa do Usuário
**Como** gestor ou operador de compras e estoque do CubeBox,  
**Quero** visualizar tooltips enxutos, hierarquizados e não intrusivos ao passar o cursor sobre os gráficos de tendência de vendas e projeções preditivas,  
**Para que** eu não sofra com cards gigantescos que encobrem as curvas visuais (*canvas occlusion*) e consiga ler instantaneamente os principais produtos sem sobrecarga cognitiva.

---

## 2. Critérios de Aceite (BDD)

### Cenário 1: Limitação em Top N e Agrupamento de Excedentes
- **Dado** que um gráfico renderiza múltiplas séries simultâneas (mais de 5 produtos);
- **Quando** o cursor do mouse navegar sobre um ponto temporal do eixo X;
- **Então** o tooltip deve ordenar decrescentemente os valores, exibir apenas os 5 maiores e agregar o restante em uma linha `Outros (N)` com a soma consolidada.

### Cenário 2: Foco na Série Ativa com Legend Hover
- **Dado** que o operador passa o mouse sobre uma série específica ou sua legenda no `PredictiveView`;
- **Quando** o estado `hoveredSeriesKey` for ativado;
- **Então** o tooltip deve destacar visualmente a série correspondente com background sutil e tipografia prioritária, sem perder o contexto temporal.

### Cenário 3: Alinhamento Tabular e Formatação Monetária/Unidades
- **Dado** que o gráfico exibe receita em reais (`DashboardView`) ou projeções em unidades (`PredictiveView`);
- **Quando** os valores forem renderizados;
- **Então** os números devem utilizar `font-variant-numeric: tabular-nums` (Geist Mono), com formatação monetária padrão BRL (`R$`) ou sufixo operacional (`un.`).

### Cenário 4: Resiliência e Prevenção de Bloqueio de Interação
- **Dado** que o tooltip acompanha a movimentação do cursor;
- **Quando** renderizado na tela;
- **Então** deve possuir `pointer-events: none` estrito para não bloquear eventos de mouse do gráfico e `aria-hidden` condicional para conformidade de acessibilidade.

---

## 3. Contrato de Fronteira & Schemas

```typescript
export interface CompactChartTooltipProps extends TooltipProps<ValueType, NameType> {
  maxVisibleItems?: number;
  currencyFormat?: boolean;
  unit?: string;
  hoveredSeriesKey?: string | null;
  focusHoveredOnly?: boolean;
  showTotal?: boolean;
  valueFormatter?: (value: number | string | undefined, name?: NameType) => string;
  minWidth?: number | string;
  maxWidth?: number | string;
}
```

---

## 4. Definition of Done (DoD)
- [x] Componente `CompactChartTooltip` isolado com CSS Modules e tokens W3C DTCG.
- [x] Função pura `resolveTooltipData` sem re-execuções desnecessárias para 60fps no mousemove.
- [x] Cobertura de testes unitários com Vitest superior a 80%.
- [x] Adoção completa no `DashboardView` e `PredictiveView`.
- [x] Build de produção (`tsc -b && vite build`) validado com zero erros de tipagem.
