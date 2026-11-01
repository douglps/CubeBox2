# 📐 Software Design Document (SDD) - Módulo UI & Ergonomia Operacional Enterprise

> **Identificador:** SDD-CBOX-UI-V2.1.0  
> **Status:** Aprovado / Ativo  
> **Padrão:** IEEE 1016 & Governança Antigravity  
> **Versão:** 2.1.0  
> **Data:** 2026-10-28  
> **Autor:** Antigravity Architect Agent

---

## 1. 🎯 Visão Geral & Objetivos

Este documento especifica as melhorias de experiência de usuário (UX/UI), ergonomia operacional e arquitetura de componentes do CubeBox Enterprise 2.0:
1. **Módulo Preditivo Avançado (`PredictiveView`):** Substituição do dropdown seletor de SKU por Modal com cards visuais selecionáveis (seleção única ou múltipla). Eixo temporal com datas do calendário real futuro e linhas diferenciadas por SKU com paleta de alto contraste acessível (WCAG 2.1 AA).
2. **Barra Contextual de Ações em Lote (`DataTable`):** Floating/Sticky Batch Action Bar ativada ao marcar linhas em tabelas de dados, permitindo execuções em lote com contadores e feedback imediato.
3. **Telemetria de Sistema & Relógio HUD (`AppShell`):** Transferência ergonômica da latência em milissegundos e da data do cabeçalho para o rodapé fixo direito (`footerHud`), agregando relógio em tempo real (`HH:MM`).
4. **Humanização da Comunicação e Microcopy:** Substituição de jargões técnicos de regras de entrada (ex: "Preenchimento gradual à direita") por instruções amigáveis com *Progressive Disclosure* via ícone `(?)` e tooltip.
5. **Ergonomia do PDV / Balcão (`PosView`):** Maximização da área útil da lista de produtos na comanda, condensação de cabeçalhos e destaque imediato do total de pedidos históricos do cliente no CRM.

---

## 2. 🏛️ Princípios Arquiteturais & Heurística (Pilares IEEE 1016)

* **Heurística:** `KISS` na interface, `DRY` no compartilhamento de batch actions e `SOLID` na composição de modais e componentes de tabela.
* **Acessibilidade:** Conformidade estrita com **WCAG 2.1 AA** (diferenciação não apenas por cor, mas por rótulos, ícones e formas; navegação completa por teclado).
* **Performance:** Renderização sem re-renders redundantes; atualização temporal desacoplada (timer de 1 minuto no rodapé).

---

## 3. 📐 Especificação Técnica dos Subsistemas

### 3.1. Projeção Preditiva Multi-Item com Modal de Cards & Foco Cognitivo
* **Componente Modal:**
  * Modal responsivo com área útil expandida ocupando ~80% da viewport (`width: 82vw`, `height: 82vh`, `max-width: 1560px`, `max-height: 880px`) e grid fluido com cards de produtos (`minmax(210px, 1fr)`).
  * Permite seleção única ou múltipla.
  * Ações contextuais de cabeçalho: "Consolidado Geral", "Marcar Todos" e **"Desmarcar Todos"** (habilitado condicionalmente quando `selectedProductIds.length > 1`).
* **Ergonomia e Redução de Carga Cognitiva no Gráfico (Data-Ink Ratio / Tufte & Few):**
  * **Nomes Comerciais Limpos:** Legendas e tags não usam códigos de SKU repetitivos, exibindo estritamente o nome comercial do produto.
  * **Focus State & Destaque por Hover (Fitts / Gestalt):** Ao passar o mouse sobre um produto (na legenda, nas tags superiores ou na própria linha), o estado `hoveredSeriesKey` destaca a linha correspondente (`strokeWidth: 4`, opacidade 1.0) e atenua as demais (`strokeOpacity: 0.25`, dot fillOpacity 0.3).
  * **Isolated Tooltip Filtering:** Quando em hover/foco de uma série, o tooltip renderiza unicamente os dados da série em foco, eliminando sobrecarga e confusão visual na inspeção de valores.
  * O eixo X renderiza datas reais futuras (`Qua, 28/10`, etc.).

### 3.2. Batch Action Bar no `DataTable`
* **Interface de Props:**
  ```typescript
  export interface BatchAction<T> {
    id: string;
    label: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    onExecute: (selectedItems: T[], clearSelection: () => void) => void;
  }
  ```
* **Layout:** Barra flutuante ou docking sticky no rodapé da tabela com:
  * Badge com contagem: `N selecionados`
  * Botão "Desmarcar todos"
  * Botões de ação contextual configurados pela view consumidora.

### 3.3. Ergonomia do Rodapé Fixo (`AppShell`)
* Realocação do indicador de latência:
  ```tsx
  <div className={styles.telemetryBadge}>
    <Activity size={13} className={styles.pulseIcon} />
    <span className="tabular">{latencyMs}ms</span>
  </div>
  ```
* Relógio em tempo real com hora e minuto:
  ```tsx
  <div className={styles.systemClockBadge}>
    <Clock size={12} />
    <span>{currentDateTime}</span>
  </div>
  ```

### 3.4. PDV Inteligente (`PosView`)
* Redimensionamento do grid para `1fr 420px`, garantindo que os itens do cupom tenham 100% de legibilidade e espaço vertical expandido (`cartList` com `flex: 1`).
* Card de cliente ativo com badge destacado:
  `Badge: "{total_pedidos} compras realizadas"` com visual premium.

---

## 4. 🔄 Rastreabilidade Bidirecional

| Requisito | User Story Impactada | Componentes Impactados |
| :--- | :--- | :--- |
| Seleção por Cards e Eixo de Datas | `US-UI-02` | `PredictiveView.tsx`, `PredictiveView.module.css` |
| Batch Actions em Listas | `US-UI-04`, `US-UI-05` | `DataTable.tsx`, `DataTable.module.css`, `ProductsView.tsx` |
| Rodapé HUD com Latência e Hora | `US-UI-03` | `AppShell.tsx`, `AppShell.module.css` |
| Humanização de Microcopy & `(?)` | `US-UI-04` | `ProductsView.tsx`, `BankingNumberInput.tsx` |
| Layout de Comanda e Total de Pedidos | `US-UI-06` | `PosView.tsx`, `PosView.module.css` |
