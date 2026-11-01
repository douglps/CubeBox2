# 📐 Software Design Document (SDD) - Master-Detail, Modais Responsivos & Resumo de Vendas

> **Identificador:** SDD-CBOX-UI-V2.2.0  
> **Status:** Aprovado / Ativo  
> **Padrão:** IEEE 1016 & Governança Antigravity  
> **Versão:** 2.2.0  
> **Data:** 2026-10-29  
> **Autor:** Antigravity Architect Agent  

---

## 1. 🎯 Visão Geral & Objetivos

Este documento formaliza as decisões de arquitetura e design de interface (UI/UX) para o subsistema de **Gestão de Clientes, Catálogo Comercial e Frente de Caixa (PDV)** do CubeBox Enterprise:
1. **Modais Responsivos com Ampla Área Útil (>= 60% Viewport):**
   - Sistema padronizado de tokens dimensionais no componente `ModalDrawer` (`size="lg"` para >= 60% da largura da tela e `size="xl"` para >= 75%).
   - Aplicação nos modais de **Cadastro/Edição de Produtos** (`ProductsView`) e **Clientes** (`CustomersView`).
2. **Master-Detail (Split View) na Gestão de Clientes (`CustomersView`):**
   - Ao selecionar um cliente na tabela, a tela se divide lateralmente revelando o painel de detalhes (`CustomerDetailPane`), exibindo perfil, endereço completo de entrega, indicadores RFM (LTV, total de compras, ticket médio) e histórico de pedidos.
3. **Modal de Seleção de Cliente em 2 Colunas no PDV (`CustomerSelectModal`):**
   - Estrutura *Split-Pane* no PDV: busca e seleção rápida à esquerda; detalhes cadastrais, endereço e histórico de compras à direita.
   - Resumo breve de cada pedido com: nome comercial dos itens e quantidades, valor líquido, data/hora, número da comanda, forma de pagamento, endereço resumido e botão **"Ver Nota"**.
4. **Espelho de Cupom Térmico / Nota Fiscal Unificado (`ReceiptModal`):**
   - Componente isolado e reutilizável para emissão/conferência de pedidos em 80mm com impressão nativa (`window.print()`), cópia de resumo e acessibilidade integral.

---

## 2. 🏛️ Princípios Arquiteturais & Referências Acadêmicas (NN/g, SAP Fiori, WCAG)

* **Prevenção do Anti-Padrão *Pogo-Sticking* (Nielsen Norman Group):**
  Evita que o operador seja forçado a abrir e fechar janelas repetidamente para comparar ou consultar dados de clientes e comandas. A arquitetura *Master-Detail* e os modais divididos em 2 partes mantêm o contexto operacional vivo e imediatamente acessível.
* **Progressive Disclosure (Divulgação Progressiva):**
  Apresenta primeiramente as âncoras cognitivas prioritárias (número do pedido, data, valor, forma de pagamento, itens essenciais com nome comercial) e transfere o detalhamento tributário e fiscal completo para um clique sob demanda no botão **"Ver Nota"**.
* **SAP Fiori Flexible Column Layout (FCL):**
  Divisão harmônica da viewport (60/40 no desktop) com adaptação para pilha vertical em telas menores (<= 1024px), preservando a legibilidade e os contrastes.
* **WCAG 2.1 AA:**
  Gerenciamento de foco (*focus trap*), tecla `Escape` para descarte de painéis/modais, rotulagem via `aria-label`/`aria-labelledby`, e suporte a leitores de tela com `role="dialog"` e `aria-modal="true"`.

---

## 3. 📐 Especificação Técnica dos Subsistemas

### 3.1. Sistema de Tamanhos de Modal (`ModalDrawer`)
```typescript
export interface ModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type?: 'modal' | 'drawer';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
}
```
* `.sizeLg`: `width: min(95vw, 65vw); min-width: min(60vw, 100%); max-width: 1100px;` (Garante ocupação mínima de 60%).
* `.sizeXl`: `width: min(96vw, 75vw); min-width: min(65vw, 100%); max-width: 1300px;` (Utilizado para modais de duas colunas).

### 3.2. Painel Lateral de Detalhes (`CustomerDetailPane`)
- **Localização:** `frontend/src/views/components/CustomerDetailPane/`
- **Capacidades:**
  - Extração automática de iniciais com gradiente de alta fidelidade visual.
  - Endereço completo formatado com geolocalização textual e ponto de referência.
  - Indicadores calculados: LTV Acumulado, Total de Compras e Ticket Médio.
  - Histórico sob demanda via `fetchCustomerOrders(customerId)`.
  - Botão "Ver Nota" integrado ao `ReceiptModal`.

### 3.3. Modal de Seleção de Cliente e Recompra no PDV (`CustomerSelectModal`)
- **Localização:** `frontend/src/views/components/CustomerSelectModal/`
- **Layout:** Grid de 2 colunas (`44% 56%` no desktop com transição responsiva).
- **Coluna Esquerda:** Filtro reativo por Nome, CPF e Telefone; lista de clientes com badges de LTV e contagem de pedidos.
- **Coluna Direita:** Perfil condensado, endereço e lista de pedidos com resumo comercial de produtos (`Qtd x Nome Comercial`).

---

## 4. 🧪 Matriz de Testes & Rastreabilidade

| Caso de Teste | Arquivo de Teste | Status |
| :--- | :--- | :--- |
| Validação de Modificadores de Dimensão >= 60% | `ModalDrawer.spec.ts` | ✅ Passou |
| Resolução de Nomes Comerciais de SKUs e Formatação de Endereço | `CustomerSelectModal.spec.ts` | ✅ Passou |
| Cálculo de Iniciais, Ticket Médio e LTV | `CustomerDetailPane.spec.ts` | ✅ Passou |
| Paginação e Ordenação Tri-state na Tabela | `DataTable.spec.ts` | ✅ Passou |

