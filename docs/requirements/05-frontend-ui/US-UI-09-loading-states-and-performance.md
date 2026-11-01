---
id: US-UI-09
title: Estados de Carregamento Resilientes, Skeletons e Lazy Loading
bounded_context: 05-frontend-ui
complexity: Alta
token_budget: 480
dependencies:
  sdd: docs/sdd/SDD-CBOX-UI-LOADING-STATES-V1.0.0.md
  code_impacts:
    - frontend/index.html
    - frontend/src/App.tsx
    - frontend/src/components/common/Spinner/Spinner.tsx
    - frontend/src/components/common/SkeletonShimmer/SkeletonShimmer.tsx
    - frontend/src/components/common/DataTable/DataTable.tsx
    - frontend/src/views/DashboardView.tsx
    - frontend/src/views/PosView.tsx
    - frontend/src/views/InventoryView.tsx
    - frontend/src/views/OrdersHistoryView.tsx
    - frontend/src/views/PredictiveView.tsx
---

# US-UI-09: Estados de Carregamento Resilientes, Skeletons e Lazy Loading

## 1. Narrativa do Usuário
**Como** operador de caixa ou gerente de suprimentos do CubeBox,  
**Quero** que a navegação entre módulos e a carga de tabelas, KPIs e catálogos apresentem esqueletos visuais (Skeletons) e transições instantâneas,  
**Para que** eu não sofra com telas em branco, falsos avisos de "sem dados" ou quebras de layout (*CLS*) durante requisições de rede.

---

## 2. Critérios de Aceite (BDD)

### Cenário 1: Zero-JS Splash Screen no Carregamento Inicial
- **Dado** que o operador abre a aplicação CubeBox no navegador pela primeira vez;
- **Quando** o arquivo HTML principal for processado pelo browser;
- **Então** um splash screen estilizado com a identidade isométrica do CubeBox deve ser renderizado instantaneamente (< 50ms) antes do download do script JavaScript.

### Cenário 2: Lazy Loading de Abas e Code-Splitting
- **Dado** que o operador navega entre abas (Dashboard, PDV, Estoque, Preditivo);
- **Quando** alternar para uma visão ainda não carregada;
- **Então** o chunk correspondente deve ser carregado sob demanda via `React.lazy()` e `<Suspense>`, exibindo o `ViewFallbackSkeleton` sem travar a thread principal.

### Cenário 3: Skeleton Rows na Tabela de Dados (`DataTable`)
- **Dado** que qualquer tela (Produtos, Clientes, Estoque ou Pedidos) dispara uma requisição de busca/listagem;
- **Quando** `isLoading` for `true`;
- **Então** a `DataTable` deve renderizar linhas cinzas pulsantes (*shimmer*) espelhando o número de colunas, e nunca a mensagem de "Nenhum registro encontrado".

### Cenário 4: Prevenção de CLS no Gráfico Preditivo e Dashboard
- **Dado** que o painel preditivo ou dashboard executivo está calculando métricas e projeções;
- **Quando** a requisição estiver pendente;
- **Então** um container com a mesma altura do elemento final (320px no gráfico e cards de 128px nos KPIs) deve ser mantido como esqueleto.

---

## 3. Contrato de Fronteira & Schemas

```typescript
export interface SpinnerContract {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'neutral' | 'white';
  label?: string;
}

export interface SkeletonContract {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  variant?: 'rect' | 'circle' | 'text';
  animate?: boolean;
}
```

---

## 4. Definition of Done (DoD)

- [x] Zero-JS Splash Screen implementado no `index.html`.
- [x] Chunk principal inicial do Vite reduzido para menos de 400 KB via `React.lazy()`.
- [x] Componentes primitivos `Spinner` e `SkeletonShimmer` acessíveis (`aria-hidden`, `aria-busy`, WCAG 2.1).
- [x] `DataTable` atualizada com suporte nativo a `isLoading` e skeleton rows.
- [x] Eliminação de falsos estados vazios em Estoque, Pedidos, Produtos e PDV.
- [x] Suporte a `prefers-reduced-motion` em animações de carregamento.
- [x] 100% dos testes unitários do Vitest passando com cobertura de novos componentes.

