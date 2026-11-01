# 📚 Catálogo Mestre de Requisitos & User Stories - CubeBox Enterprise

> **Status:** Ativo  
> **Padrão:** Context-Budgeting Modular & Progressive Disclosure  
> **Referências Arquiteturais:**  
> - [SDD-CBOX-DATA-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-DATA-V1.0.0.md)  
> - [SDD-CBOX-EDA-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-EDA-V1.0.0.md)  
> - [SDD-CBOX-ML-V1.1.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-ML-V1.1.0.md) (Vigente - Regressão Logística Calibrada)  
> - [SDD-CBOX-ML-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-ML-V1.0.0.md) (Histórico)  
> - [SDD-CBOX-API-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-API-V1.0.0.md)  
> - [SDD-CBOX-UI-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-UI-V1.0.0.md)  
> - [SDD-CBOX-UI-V2.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-UI-V2.0.0.md)  
> - [SDD-CBOX-UI-V2.1.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-UI-V2.1.0.md)  
> - [SDD-CBOX-DESIGN-SYSTEM-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-DESIGN-SYSTEM-V1.0.0.md)  
> - [SDD-CBOX-DATA-CRM-PDV-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-DATA-CRM-PDV-V1.0.0.md)  
> - [SDD-CBOX-ERR-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-ERR-V1.0.0.md) (Resiliência e Tratamento de Erros)  
> - [SDD-CBOX-UI-LOADING-STATES-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-UI-LOADING-STATES-V1.0.0.md) (Padrão Arquitetural de Estados de Carregamento & Performance)  
> - [SDD-CBOX-UI-TOOLTIP-V1.0.0.md](file:///c:/Dev/CubeBox2/docs/sdd/SDD-CBOX-UI-TOOLTIP-V1.0.0.md) (Padrão de Tooltips Compactos e Resilientes para DataViz)  

---

## 🗂️ Módulos e Histórias de Usuário (JIT Routing)

| ID | Título da História | Bounded Context | Complexidade | Token Budget | Arquivo de Especificação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **US-DATA-01** | Geração Sintética de Base Histórica com Ruído e Poluição | `01-data-pipeline` | Média | ~400 tokens | [US-DATA-01-raw-synthetic-generator.md](file:///c:/Dev/CubeBox2/docs/requirements/01-data-pipeline/US-DATA-01-raw-synthetic-generator.md) |
| **US-DATA-02** | Pipeline de Limpeza, Deduplicação e Sanitização de Vendas | `01-data-pipeline` | Média | ~450 tokens | [US-DATA-02-data-cleaning-pipeline.md](file:///c:/Dev/CubeBox2/docs/requirements/01-data-pipeline/US-DATA-02-data-cleaning-pipeline.md) |
| **US-DATA-03** | Ingestão, Higienização e Sanitização de Clientes e Transações | `01-data-pipeline` | Média | ~400 tokens | [US-DATA-03-sanitization-pipeline.md](file:///c:/Dev/CubeBox2/docs/requirements/01-data-pipeline/US-DATA-03-sanitization-pipeline.md) |
| **US-EDA-01** | Execução e Visualização da Análise Univariada de Vendas | `02-exploratory-analysis` | Média | ~450 tokens | [US-EDA-01-univariate-analysis.md](file:///c:/Dev/CubeBox2/docs/requirements/02-exploratory-analysis/US-EDA-01-univariate-analysis.md) |
| **US-EDA-02** | Execução e Visualização da Análise Bivariada e Sazonalidade | `02-exploratory-analysis` | Média | ~450 tokens | [US-EDA-02-bivariate-analysis.md](file:///c:/Dev/CubeBox2/docs/requirements/02-exploratory-analysis/US-EDA-02-bivariate-analysis.md) |
| **US-ML-01** | Engenharia de Features e Agregação Temporal Diária por SKU | `03-predictive-modeling` | Média | ~450 tokens | [US-ML-01-feature-engineering.md](file:///c:/Dev/CubeBox2/docs/requirements/03-predictive-modeling/US-ML-01-feature-engineering.md) |
| **US-ML-02** | Treinamento Comparativo entre Árvore de Decisão e Random Forest | `03-predictive-modeling` | Média | ~450 tokens | [US-ML-02-demand-forecasting.md](file:///c:/Dev/CubeBox2/docs/requirements/03-predictive-modeling/US-ML-02-demand-forecasting.md) |
| **US-ML-03** | Segmentação Não-Supervisionada e Detecção de Anomalias com DBSCAN | `03-predictive-modeling` | Média | ~450 tokens | [US-ML-03-dbscan-clustering.md](file:///c:/Dev/CubeBox2/docs/requirements/03-predictive-modeling/US-ML-03-dbscan-clustering.md) |
| **US-ML-04** | Classificação de Probabilidade de Ruptura de Estoque Calibrada | `03-predictive-modeling` | Média | ~450 tokens | [US-ML-04-naive-bayes-risk.md](file:///c:/Dev/CubeBox2/docs/requirements/03-predictive-modeling/US-ML-04-naive-bayes-risk.md) |
| **US-API-01** | Modelos Relacionais e Endpoints CRUD de Vendas e Estoque | `04-backend-api` | Média | ~450 tokens | [US-API-01-crud-products-sales.md](file:///c:/Dev/CubeBox2/docs/requirements/04-backend-api/US-API-01-crud-products-sales.md) |
| **US-API-02** | Endpoints de Model Serving e Sugestão Preditiva de Compras | `04-backend-api` | Média | ~450 tokens | [US-API-02-model-serving-reorder.md](file:///c:/Dev/CubeBox2/docs/requirements/04-backend-api/US-API-02-model-serving-reorder.md) |
| **US-UI-01** | Interface Operacional de PDV e Dashboard de Indicadores | `05-frontend-ui` | Média | ~450 tokens | [US-UI-01-pos-and-dashboard.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-01-pos-and-dashboard.md) |
| **US-UI-02** | Cockpit Preditivo e Aprovação de Reposição | `05-frontend-ui` | Média | ~450 tokens | [US-UI-02-predictive-cockpit.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-02-predictive-cockpit.md) |
| **US-UI-03** | Layout Cinemático, Rail Colapsável e Clearable Inputs | `05-frontend-ui` | Média | ~450 tokens | [US-UI-03-layout-and-smart-inputs.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-03-layout-and-smart-inputs.md) |
| **US-UI-04** | Gestão de Produtos, Congelamento e CRM de Clientes | `05-frontend-ui` | Alta | ~500 tokens | [US-UI-04-products-and-customers-crm.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-04-products-and-customers-crm.md) |
| **US-UI-05** | Hub de Estoque por Categoria e Histórico de Pedidos | `05-frontend-ui` | Média | ~480 tokens | [US-UI-05-inventory-hub-and-orders-history.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-05-inventory-hub-and-orders-history.md) |
| **US-UI-06** | PDV Inteligente com Busca Modal e Repetição de Pedido | `05-frontend-ui` | Alta | ~450 tokens | [US-UI-05-pos-smart-crm.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-05-pos-smart-crm.md) |
| **US-UI-07** | Experiência Ergonômica Preditiva, Batch Actions e Otimização de PDV | `05-frontend-ui` | Média | ~450 tokens | [US-UI-07-ergonomics-predictive-pos.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-07-ergonomics-predictive-pos.md) |
| **US-UI-08** | Tratamento de Erros Resiliente e Notificações com Smart Retry | `05-frontend-ui` | Média | ~450 tokens | [US-UI-08-resilient-error-handling-smart-retry.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-08-resilient-error-handling-smart-retry.md) |
| **US-UI-09** | Estados de Carregamento Resilientes, Skeletons e Lazy Loading | `05-frontend-ui` | Alta | ~480 tokens | [US-UI-09-loading-states-and-performance.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-09-loading-states-and-performance.md) |
| **US-UI-10** | Tooltip Compacto e Resiliente de Gráficos (Data Visualization) | `05-frontend-ui` | Média | ~450 tokens | [US-UI-10-compact-chart-tooltip.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-10-compact-chart-tooltip.md) |
| **US-UI-11** | Cadastro Ágil de Clientes no PDV e Gestão Multi-Endereço com Invariante de Delivery | `05-frontend-ui` | Média | ~450 tokens | [US-UI-11-pos-quick-customer-addresses.md](file:///c:/Dev/CubeBox2/docs/requirements/05-frontend-ui/US-UI-11-pos-quick-customer-addresses.md) |

---
*Nota: Proibido carregar o corpo textual de todas as histórias em memória de forma cumulativa. Carregue estritamente a história ativa para a tarefa em execução.*
