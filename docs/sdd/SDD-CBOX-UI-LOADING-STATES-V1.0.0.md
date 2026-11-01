# 📐 SDD-CBOX-UI-LOADING-STATES-V1.0.0
## Software Design Document: Padrão Arquitetural de Estados de Carregamento & Performance Percebida

> **Status:** Ativo  
> **Versão:** 1.0.0  
> **Data:** 30/10/2026  
> **Autor:** Antigravity Architect  
> **Escopo:** Frontend (`frontend/src`) — CubeBox Enterprise Cockpit  
> **Norma:** IEEE 1016-2009 / WCAG 2.1 AA / Core Web Vitals  

---

## 1. Visão Geral & Objetivos

### 1.1 Contexto do Negócio & Psicologia da Espera
No ambiente operacional do CubeBox (Frente de Caixa/PDV, Gestão de Estoque Multi-Warehouse e Modelos Preditivos de Demanda), a latência de rede e o processamento de modelos estatísticos não podem bloquear a percepção de controle do operador.
Baseando-se na **Lei de Espera de David Maister (1985)** e no estudo de **HCI/ACM (Mejtoft et al., ECCE '18)**, este documento estabelece um padrão rígido e reutilizável para eliminação de telas em branco, mitigação do efeito "panela vigiada" (*watched pot effect*) e redução do *Cumulative Layout Shift* (CLS).

### 1.2 Os 5 Pilares de Carregamento
1. **Skeleton Loading (Skeleton Screen):** Espelhamento geométrico do layout final com animação de shimmer, preservando o espaço estrutural e reduzindo a percepção de tempo em até 30%.
2. **Spinner (Loading Spinner):** Micro-indicador restrito exclusivamente a operações assíncronas indeterminadas curtas (< 2 segundos), como clique em botões e mutações locais.
3. **Lazy Loading (Carregamento Preguiçoso):** Separação de código (*code-splitting*) via `React.lazy()` e `<Suspense>` por visão de negócio e deferimento de renderização via CSS `content-visibility: auto`.
4. **Loading Screen (Splash Screen Inicial):** Camada visual Zero-JS injetada diretamente no `index.html` para anular a tela branca durante o download e parseamento do bundle.
5. **Placeholders:** Elementos substitutos fixos com acessibilidade visual e fallback semântico.

---

## 2. Princípios de Engenharia & Heurística (SOLID, DRY, KISS)

- **Single Responsibility (SRP):** Componentes visuais de loading são puramente desacoplados de lógica de negócio e estados de API.
- **Composition over Inheritance:** `DataTable` e cards recebem estados `isLoading` e compõem internamente componentes de esqueleto (`SkeletonShimmer`).
- **Acessibilidade Inegociável (WCAG 2.1 AA):**
  - Skeletons possuem `aria-hidden="true"` obrigatório.
  - Áreas dinâmicas recebem `aria-busy="true"` enquanto carregam.
  - Spinners possuem `role="status"` e texto oculto para screen readers (`sr-only`).
  - Suporte total a `@media (prefers-reduced-motion: reduce)` desligando animações cíclicas.
- **Zero CLS (Cumulative Layout Shift = 0):** Todo placeholder e skeleton deve reservar 100% da dimensão nominal de renderização do componente final (altura, padding e grid).

---

## 3. Arquitetura e Diagrama de Fluxo

```mermaid
flowchart TD
    A["Navegador Acessa CubeBox"] --> B["index.html: Zero-JS Splash Screen (Instant FMP)"]
    B --> C["Download do Chunk Inicial do AppShell (< 250 KB)"]
    C --> D["AppShell Montado: Root Hydration Remove Splash"]
    D --> E{"Aba Ativa Selecionada"}
    
    E -->|Lazy Dynamic Import| F["React.lazy() Suspense Fallback (ViewFallbackSkeleton)"]
    F --> G["Chunk da Visão Carregado (PosView, PredictiveView, etc.)"]
    G --> H{"Dados da API em Trânsito?"}
    
    H -->|Sim (Initial Fetch)| I["Skeleton Screens Especializados (Tabelas / Grid Cards / KPIs)"]
    H -->|Não (Loaded)| J["Conteúdo Final Renderizado com Transição Fluida"]
    
    J --> K{"Mutação / Ação do Usuário (Salvar / Cancelar)"}
    K -->|Submissão < 2s| L["Micro-Spinner Inline no Botão (isBusy)"]
```

---

## 4. Contratos de Interface & Schemas de IO

### 4.1 Componente `SkeletonShimmer`
```typescript
export interface SkeletonShimmerProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  variant?: 'rect' | 'circle' | 'text';
  className?: string;
  animate?: boolean;
}
```

### 4.2 Componente `Spinner`
```typescript
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'neutral' | 'white';
  label?: string;
  className?: string;
}
```

### 4.3 Extensão do `DataTableProps`
```typescript
export interface DataTableProps<T> {
  // ... campos existentes
  isLoading?: boolean;
  loadingRows?: number; // padrão: 5
}
```

---

## 5. Rastreabilidade Bidirecional

| Requisito | Componente / Arquivo Impactado | Teste de Conformidade |
| :--- | :--- | :--- |
| `REQ-LOAD-01` (Zero-JS Splash) | `frontend/index.html` | First Meaningful Paint imediato (< 50ms) |
| `REQ-LOAD-02` (Code-Splitting) | `frontend/src/App.tsx` | Chunks individuais < 400 KB no build Vite |
| `REQ-LOAD-03` (Table Skeletons) | `DataTable.tsx`, `ProductsView`, `CustomersView`, `InventoryView`, `OrdersHistoryView` | Teste unitário de renderização de skeleton rows |
| `REQ-LOAD-04` (PDV Product Skeletons) | `PosView.tsx` | Grid com 8 cards de placeholder em fetch |
| `REQ-LOAD-05` (Dashboard KPIs) | `DashboardView.tsx` | Fim do macro-spinner bloqueante; 6 cards skeleton |
| `REQ-LOAD-06` (Predictive Chart) | `PredictiveView.tsx` | Container de 320px preservado com esqueleto de curva |
| `REQ-LOAD-07` (Acessibilidade Motion) | `SkeletonShimmer.module.css`, `Spinner.module.css` | `@media (prefers-reduced-motion)` verificado |

---

## 6. Observabilidade, APM & Métricas (SLIs / SLOs)

- **SLO LCP (Largest Contentful Paint):** $\le 1.8\text{s}$ em conexões 4G simuladas.
- **SLO CLS (Cumulative Layout Shift):** $\le 0.05$ na transição de skeleton para conteúdo populado.
- **SLO Bundle Inicial:** Redução de $1.020\text{ KB}$ para $\le 300\text{ KB}$ (corte de $> 70\%$).

---

## 7. Plano de Rollback & Contingência

Em caso de falha de carregamento dinâmico de chunks (`ChunkLoadError` por rede instável):
1. O `<ErrorBoundary>` encapsula cada `<Suspense>`, exibindo o card de erro com retry automatizado (*Smart Retry*).
2. Se necessário, os imports dinâmicos em `App.tsx` podem ser revertidos pontualmente para estáticos sem quebrar as props das visões.

