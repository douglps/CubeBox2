# 📐 SDD-CBOX-UI-V2.0.0: Subsistema Frontend & Cockpit Operacional 2.0 (React + TypeScript)

> **Projeto:** CubeBox Enterprise - Sistema Preditivo Integrado de Compras e Vendas  
> **Módulo:** Cockpit Operacional, Comercial e Analítico SPA (Evolução v2.0)  
> **Versão:** 2.0.0  
> **Status:** Aprovado  
> **Padrão:** IEEE 1016 (Software Design Document)  
> **Data:** 2026-10-27  

---

## 1. 🎯 Identificação & Visão Geral (Overview)

### 1.1 Propósito
Este documento formaliza a reestruturação arquitetural de interface e experiência de usuário (UI/UX) do **CubeBox 2.0**, elevando o sistema para nível Ouro/Diamante de maturidade heurística, estética, acessibilidade (WCAG 2.1 AA) e conformidade estrita com o manifesto didático (`@didactic-code-comments.md`).

A evolução contempla:
1. **Layout Cinemático e Sem Ruídos:** Header 100% full-width com comportamento inteligente *Smart Sticky* (recolhe ao rolar para baixo, ressurge ao rolar para cima); Sidebar Aside 100% altura com modo Rail colapsável; Alternador único de Tema Dark/Light no Header (sem redundâncias); **Exibição de atalhos de teclado estritamente sob demanda em tooltips flutuantes** (menu Aside, botões de ação e seletores de pagamento), mantendo a interface despoluída;
2. **Sessão Exclusiva de Produtos:** Catálogo comercial completo com CRUD, cálculo de margem, histórico e ação de **Congelamento/Descongelamento** preventivo;
3. **Sessão Exclusiva de Clientes:** CRM de balcão integrado, busca por CPF/Nome, histórico de compras e integração direta com o PDV;
4. **Hub de Estoque por Categorias:** Navegação em dois níveis (Cards de Resumo por Categoria + Card Consolidado "Todas as Categorias" com drilldown para visualização filtrada e acionável);
5. **Histórico de Pedidos de Venda:** Visualização de auditoria, reemissão/impressão de espelho de venda de 80mm e rotina de cancelamento/estorno;
6. **Ergonomia de Formulários & Inputs Numéricos:** Botão `X` de limpeza e atalho `[Esc]` em todos os campos, navegação com setas em inputs numéricos, zebra striping suave para tabelas, e **Padrão Bancário de Entrada Numérica (ATM / Banking Right-to-Left)** com alinhamento à direita (`tabular-nums`) e preenchimento gradual da direita para a esquerda com máscara dinâmica em tempo real (moeda `R$`, percentual `%` e quantidades inteiras);
7. **Explicabilidade de IA (XAI):** Selo/Ícone de IA com tooltip contextual detalhando o modelo ativo (*Random Forest*, *DBSCAN*, *Naive Bayes*), confiança e métricas, além de projeção preditiva geral e comparador multi-item via modal;
8. **Catálogo de Alta Variedade:** Expansão da base para produtos reais de grandes marcas do varejo brasileiro.

---

## 2. 🏛️ Princípios Heurísticos e Não-Funcionais

- **H1 - Visibilidade do Estado do Sistema:** O operador de caixa e o gestor têm percepção instantânea da telemetria e das previsões sem ruídos visuais.
- **H2 - Correspondência com o Mundo Real:** Uso de nomes e marcas reais de mercado (Coca-Cola, Heineken, Camil, Omo), regras de balcão e analogias de varejo/bancárias (digitação de valores similar a caixas eletrônicos e terminais POS).
- **H3 - Controle e Liberdade do Usuário:** Tecla `[Esc]` limpa campos instantaneamente; cancelamento de pedidos com retorno atômico ao estoque; congelamento de itens sem quebra de integridade referencial.
- **H4 - Consistência e Padrões:** Apenas um botão de alternância de tema no Header; conformidade DTCG e paleta Cerúleo / Grafite calibrada; todos os campos numéricos compartilham o mesmo comportamento de entrada à direita.
- **H5 - Prevenção de Erros:** Bloqueio de vendas sem saldo; confirmação tátil ao congelar produto ou estornar pedido; máscara dinâmica gradual que impede caracteres inválidos em campos numéricos.
- **WCAG 2.1 AA:** Contraste mínimo de 4.5:1 para texto normal e 3:1 para componentes de UI; respeito a `prefers-reduced-motion`.

---

## 3. 📐 Arquitetura de Navegação, Layout & Camadas (Z-Index)

```
+----------------------------------------------------------------------------------------------------+
| [LOGO CubeBox]   Busca Global Rápida                                   [Online 14ms] [🌙/☀️ Tema]  | <- Header 100% (Smart Sticky, recolhe com margin-top: -60px)
+----------------------------------------------------------------------------------------------------+
|  A  |                                                                                              |
|  S  |  Conteúdo Principal da View Ativa (Scroll Independente)                                      |
|  I  |                                                                                              |
|  D  |  [Dashboard] [PDV] [Estoque] [Produtos] [Clientes] [Pedidos] [Inteligência ML]              |
|  E  |                                                                                              |
|     |  Tooltips Flutuantes (z-index: 1200, atalhos Alt+1..7 sob hover/focus, sem corte overflow)   |
| (R) |                                                                                              |
| (A) |                                                                                              |
| (I) |                                                                                              |
| (L) |                                                                                              |
+-----+----------------------------------------------------------------------------------------------+
| [CubeBox Enterprise v2.0 • WCAG 2.1 AA]                                          [FastAPI ML Online] | <- Rodapé Fixo (Fixed Dock HUD)
+----------------------------------------------------------------------------------------------------+
```

### 3.1 Camadas do Layout & Diretrizes de Interação
1. **Header Smart Sticky (0px - 60px):** Oculta no scroll descendente colapsando espaço físico (`margin-top: -60px`) para permitir que a área principal ocupe 100% da viewport sem deixar faixa vazia residual.
2. **Rodapé Fixo (Fixed Dock HUD):** Ancorado permanentemente na base da aplicação (`flex-shrink: 0`), mantendo status do sistema e telemetria sempre visíveis, sem atalhos estáticos poluindo a interface.
3. **Atalhos Estritamente em Tooltips Flutuantes:** Todos os atalhos (`Alt+1..7`, `Alt+T`, botões de ação e seletores de pagamento) são renderizados exclusivamente em tooltips flutuantes acessíveis via mouse hover ou teclado focus (`role="tooltip"`), operando na camada de z-index elevado (`z-index: 1200`) para sobrepor cards e modais.

### 3.2 Rotas e Abas Ativas (`NavTab`)
```typescript
export type NavTab = 
  | 'dashboard'   // Painel Executivo (Alt+1)
  | 'pos'         // PDV / Frente de Caixa (Alt+2)
  | 'inventory'   // Controle de Estoque & Categorias (Alt+3)
  | 'products'    // Catálogo & Gestão de Produtos (Alt+4)
  | 'customers'   // Gestão de Clientes & CRM (Alt+5)
  | 'orders'      // Histórico de Vendas & Pedidos (Alt+6)
  | 'predictive'; // Inteligência Preditiva & Compras (Alt+7)
```

---

## 4. 🗄️ Modelagem de Dados & Schemas (Backend)

### 4.1 Entidade Customer (`customers`)
```python
class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    cpf_cnpj = Column(String(20), unique=True, index=True, nullable=True)
    telefone = Column(String(30), nullable=True)
    email = Column(String(120), nullable=True)
    ativo = Column(Boolean, default=True, nullable=False)
    criado_em = Column(DateTime, default=datetime.now, nullable=False)
```

### 4.2 Evolução da Entidade Product (`products`)
* Inclusão do campo `ativo: bool = True` ou `status: str = 'ATIVO' | 'CONGELADO'`.
* Suporte a rotas:
  * `POST /api/products` (Criação)
  * `PUT /api/products/{id}` (Edição completa)
  * `PATCH /api/products/{id}/status` (Congelar / Descongelar)
  * `DELETE /api/products/{id}` (Exclusão se não houver histórico)

### 4.3 Evolução da Entidade Sale (`sales`)
* Adição de `customer_id: Optional[int]` com chave estrangeira para `customers.id`.
* Rota de cancelamento com estorno: `POST /api/sales/{id}/cancel`.

---

## 5. 🖥️ Especificação Detalhada das Telas

### 5.1 `ProductsView` (Gestão de Produtos)
- Tabela intercalada com busca em tempo real e filtros de categoria e status.
- Drawer/Modal de cadastro/edição com cálculo dinâmico de margem (`(Venda - Custo) / Venda`).
- Botão "Congelar": Desativa o item no PDV preservando o histórico de faturamento.

### 5.2 `CustomersView` (CRM de Balcão)
- Grid/Tabela com busca por nome, CPF e telefone.
- Modal de cadastro rápido.
- Histórico de pedidos do cliente com total acumulado (LTV).

### 5.3 `OrdersHistoryView` (Histórico de Vendas)
- Tabela com filtros de período e forma de pagamento.
- Visualizador de cupom (espelho de venda de 80mm formatado com botão Imprimir).
- Botão "Estornar Pedido" com retorno atômico ao estoque.

### 5.4 `InventoryView` 2.0 (Hub de Categorias)
- Visão inicial com cards por categoria + card master "Todas as Categorias".
- Visão de detalhe por categoria com filtros de status e ações rápidas.

### 5.5 `PredictiveView` 2.0 & Selo XAI
- Gráfico consolidado da loja e modal de multi-seleção de produtos.
- Badge `AIIcon` com tooltip detalhando: Modelo (`Random Forest / Naive Bayes / DBSCAN`), acurácia e variáveis consideradas.

---

## 6. 🛡️ Plano de Implementação Modular

1. **Fase 1 (Layout & Inputs Core):** Header Smart Sticky com logo, Aside Rail expansível/recolhível, botão único de tema no Header, componente `ClearableInput` com botão `X` e atalho `Esc`, zebra striping global.
2. **Fase 2 (Catálogo Real & CRUD Produtos):** Expansão do banco para marcas reais brasileiras, endpoints e tela completa `ProductsView`.
3. **Fase 3 (CRM Clientes & Histórico de Pedidos):** Modelo e rotas de Clientes, tela `CustomersView`, integração no PDV e tela `OrdersHistoryView`.
4. **Fase 4 (Estoque Hub & XAI Preditivo):** Reestruturação do Estoque com cards de categoria e drilldown, projeção geral com modal multi-item e selos explicativos de IA.
