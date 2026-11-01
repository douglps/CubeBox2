# 🎓 Da Exploração Estatística à Modelagem Preditiva: Guia Acadêmico e Executivo

> **Projeto:** CubeBox Mini — Sistema Preditivo Integrado de Compras e Vendas  
> **Ciclo Metodológico:** CRISP-DM (Cross-Industry Standard Process for Data Mining)  
> **Finalidade:** Apresentação Acadêmica & Defesa Técnica (Abordagem Dual: Rigor Científico e Explicação Conceitual)  
> **Data:** 31 de Outubro de 2026  
> **Base Analítica Auditada:** 139.031 transações | 93 SKUs | 13 categorias | 180 dias de histórico contínuo  

---

## 🧭 Resumo Executivo & Metáfora Central

> **Para o Leigo:**  
> Imagine administrar uma mercearia ou loja de conveniência de bairro. Se você comprar cerveja, gelo e carvão de menos na sexta-feira, o cliente que chega para o churrasco encontra prateleira vazia (*ruptura*), fica chateado e compra no concorrente. Se você comprar queijos, frios ou leites demais na segunda-feira, esses produtos vencem na prateleira (*avaria*) e você perde dinheiro.  
> As **Análises Univariada e Bivariada** funcionam como os **óculos de raio-X do lojista**: antes de colocar qualquer robô ou inteligência artificial para adivinhar o futuro, nós primeiro limpamos e examinamos cada detalhe do passado. Elas nos mostram *como* as pessoas compram, *quando* compram e *quanto* gastam, evitando palpites e ensinando aos algoritmos matemáticos exatamente o que esperar.

> **Para a Banca Acadêmica:**  
> A presente monografia técnica documenta a transição metodológica da **Fase 2 (Data Understanding)** para as **Fases 3 e 4 (Data Preparation & Modeling)** do modelo CRISP-DM. Demonstra-se empiricamente como a inferência descritiva univariada e a análise de covariância/sazonalidade bivariada fundamentam a **Engenharia de Recursos (*Feature Engineering*)**, mitigam o **Viés Estatístico (*Sample Bias*)** e determinam os hiperparâmetros de regressores baseados em árvores (*Random Forest*), algoritmos de agrupamento espacial por densidade (*DBSCAN*) e estimadores de risco multivariados (*Regressão Logística Multinomial Calibrada* com benchmark em *Naive Bayes*).

---

## 1. 🔬 Análise Univariada: A Anatomia Isolada dos Dados

A análise univariada investiga **uma variável de cada vez**. Seu objetivo é compreender as medidas de tendência central, a dispersão, a presença de caudas longas (assimetria) e a morfologia de distribuição dos atributos.

```
       [ Histograma & Densidade ]               [ Boxplot Tukey ]
         ▲                                   Min      Q1    Q2    Q3     Max   Outliers
         │       ╭───╮                        ├───────[  |  |   ]───────┤     ●  ●●
       F ├──────╭╯   ╰╮──────╮               └───────────────────────────────┘
         │     ╭╯     ╰╮     ╰╮              ◄── IQR ──►
         └─────┴───────┴──────┴────►             50% central
                 Cesta / Preço
```

### 1.1 Variáveis Numéricas Analisadas

A base sanitizada de 139.031 transações gerou a seguinte matriz paramétrica e não-paramétrica:

| Atributo | Média | Mediana ($Q_2$) | Desv. Padrão | IQR ($Q_3 - Q_1$) | Mínimo | Máximo | Assimetria (*Skewness*) | Curtose (*Kurtosis*) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`quantity`** (Cesta) | 1,920 un | 1,000 un | 2,128 un | 1,000 un | 1,00 un | 24,00 un | **+5,787** | **46,236** |
| **`unit_price`** (Preço) | R\$ 11,929 | R\$ 7,900 | R\$ 16,964 | R\$ 7,800 | R\$ 1,70 | R\$ 189,90 | **+6,187** | **48,323** |
| **`total_amount`** (Ticket) | R\$ 20,661 | R\$ 11,500 | R\$ 32,281 | R\$ 12,700 | R\$ 1,70 | R\$ 759,60 | **+6,196** | **60,516** |

#### Explicação Didática (Leigo):
* **Cesta Pequena, Consumo Imediato:** A mediana da quantidade é 1. Isso significa que a maioria esmagadora das pessoas entra na loja apenas para comprar uma água, um chiclete, um maço de cigarro ou uma latinha gelada.
* **A Curva do Fim de Semana:** A média (1,92) é maior que a mediana (1,00) e o valor máximo atinge 24 unidades com assimetria de $+5,79$. Isso acontece porque, de vez em quando, entra um cliente comprando 2 fardos de cerveja para uma festa. O modelo de inteligência artificial não pode se confundir achando que a média diária normal é alta; ele precisa saber separar o dia a dia pacato da compra em fardo.

#### Rigor Metodológico (Acadêmico):
* **Não-Gaussianidade Estrita:** Os coeficientes de *Skewness* (> 5) e *Kurtosis* (> 45) refutam peremptoriamente a hipótese de normalidade pelo teste de D'Agostino-Pearson ($p < 0,001$).
* **Implicação Algorítmica:** O uso ingênuo de Regressão Linear Clássica por Mínimos Quadrados (OLS) resultaria em resíduos heterocedásticos e instabilidade numérica frente aos valores extremos da cauda longa. Isso justificou o descarte da regressão linear simples em favor de regressores não-paramétricos baseados em árvores de decisão particionadas por redução de variância (*Decision Tree* e *Random Forest*).

---

### 1.2 Variáveis Categóricas e a Curva de Concentração de Pareto (80/20)

O mapeamento das categorias transacionadas revelou a concentração de faturamento da operação:

```
 Receita (R$)                                                    % Acumulado
  ▲                                                                 ▲
  │ █                                                            100% ───────
  │ █   █                                                           │   ╭─●──
  │ █   █   █   █                                                80%├──╭╯ (Corte 80/20)
  │ █   █   █   █   █   █   █   ▄   ▄   ▄   .   .   .               │╭╯
  └─┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───────────────┴─┴───────►
   Cerv Ref Vnh Dst Tab Doc Cng Snk Eng Gel Hig Mrc Lim
```

1. **Cervejas:** 21,73% da receita global (R\$ 624.286,90)
2. **Refrigerantes:** 16,37% (R\$ 470.209,00)
3. **Vinhos:** 13,89% (R\$ 399.079,00)
4. **Destilados:** 10,30% (R\$ 295.948,00)
5. **Tabacaria e Afins:** 9,73% (R\$ 279.417,50)
6. **Doces:** 8,06% (R\$ 231.542,90)
* **Subtotal do Bloco Dominante:** **80,08%** do faturamento total reside em apenas 6 das 13 categorias. As outras 7 categorias (Congelados, Snacks, Energéticos, Gelo/Carvão, Higiene, Mercearia e Limpeza) compõem os 19,92% restantes de conveniência complementar.

#### Penetração dos Meios de Pagamento:
* **PIX:** 46,67% (64.889 vendas)
* **Cartão de Débito:** 24,31% (33.798 vendas)
* **Cartão de Crédito:** 19,28% (26.812 vendas)
* **Dinheiro em Espécie:** 9,73% (13.532 vendas)
* *Conclusão:* Mais de 90,2% das transações são digitais imediatas, permitindo sincronização em tempo real de liquidez e reconciliação financeira do estoque.

---

## 2. 📈 Análise Bivariada: Padrões Cruzados e Dinâmica Temporal

A análise bivariada investiga a **relação conjunta entre duas variáveis**. É aqui que surgem as perguntas essenciais: o dia da semana afeta o faturamento? Em que horário os clientes aparecem? Se o preço for alto, as pessoas compram menos?

```
               [ Sazonalidade Semanal ]                       [ Ciclo Horário ]
     R$/dia                                         Transações
     20k ├─                 ╭───────╮               90k ├─                 ╭───────╮
         │                  │ Fim de│                   │                  │ Turno │
     13k ├─ ╭─────────────╮ │ Semana│               40k ├─         ╭───────╯ Noite │
         │  │ Seg - Qui   │ │(+50%) │                   │          │ Tarde │(61,4%)│
         └──┴─────────────┴─┴───────┴──►            13k ├─ ╭───────╯       ╰───────╯
                                                        └──┴───────────────────────────►
                                                           Manhã   Tarde     Noite
```

### 2.1 Efeito Fim de Semana (Calendar Seasonality)

| Dia da Semana | Faturamento Médio Diário (R\$) | Volume Médio de Itens Vendidos | Número Médio de Transações |
| :--- | :---: | :---: | :---: |
| **Segunda-feira** | R\$ 13.015,37 | 1.232 un | 658 vendas |
| **Terça-feira** | R\$ 13.386,13 | 1.263 un | 664 vendas |
| **Quarta-feira** | R\$ 13.116,41 | 1.250 un | 657 vendas |
| **Quinta-feira** | R\$ 12.942,88 | 1.243 un | 665 vendas |
| **Sexta-feira** | **R\$ 19.870,29** | **1.786 un** | **913 vendas** |
| **Sábado** | **R\$ 19.728,52** | **1.792 un** | **924 vendas** |
| **Domingo** | **R\$ 19.425,80** | **1.797 un** | **918 vendas** |

* **Dias Úteis (Segunda a Quinta):** Média de R\$ 13.116,87/dia e 661 transações/dia.
* **Fim de Semana (Sexta a Domingo):** Média de **R\$ 19.674,87/dia** e 918 transações/dia.
* **Incremento Médio:** **$+50,00\%$** em faturamento financeiro e $+43,70\%$ em volume de itens físicos.

---

### 2.2 Padrão de Fluxo Operacional por Turno

* **Turno Noturno (18h às 23h59):** 84.384 transações (**60,69%**) | R\$ 1.764.552,50 (**61,43% da receita**).
* **Turno Vespertino (12h às 17h59):** 39.572 transações (**28,46%**) | R\$ 806.832,00 (**28,09% da receita**).
* **Turno Matutino (06h às 11h59):** 12.954 transações (**9,32%**) | R\$ 246.123,30 (**8,57% da receita**).
* **Turno da Madrugada (00h às 05h59):** 2.121 transações (**1,53%**) | R\$ 55.053,10 (**1,92% da receita**).

#### O que isso ensina ao negócio?
A loja de conveniência vive de compras noturnas e de fins de semana. Um modelo preditivo que recomende reposição de prateleiras às 19h chegará atrasado; o abastecimento precisa ser concluído antes das 17h para garantir a disponibilidade de gelados durante o pico.

---

## 3. 🧠 Como a EDA Constrói e Governa os Modelos de Machine Learning

Existe uma regra de ouro em Ciência de Dados: **"Garbage In, Garbage Out"** (Entra Lixo, Sai Lixo). Sem a análise prévia, o modelo tenta encontrar correlações às cegas. Abaixo está a ponte técnica mostrando como cada achado da EDA virou uma engrenagem matemática dos nossos três modelos:

```
  ┌─────────────────────────────────┐           ┌───────────────────────────────────┐
  │   DESCOBERTA NA EDA (FASE 2)    │           │    DECISÃO DE ML (FASES 3 E 4)    │
  ├─────────────────────────────────┤           ├───────────────────────────────────┤
  │ Pico de +50% no Fim de Semana   │ ────────► │ Criação da Feature 'is_weekend'   │
  │ Concentração 18h-23h (61,4%)    │ ────────► │ Feature 'turno_noite' & Reposição │
  │ Dependência de Ciclos Semanais  │ ────────► │ Lags Temporais (D-1, D-2 e D-7)   │
  │ Alta Assimetria e Não-Linear    │ ────────► │ Random Forest em vez de Reg Linear│
  │ SKUs de Alto Giro vs. Sazonais  │ ────────► │ Clusterização DBSCAN (Giro x Vol) │
  │ Risco de Ruptura nos Horários   │ ────────► │ Classificador Naive Bayes (Risco) │
  └─────────────────────────────────┘           └───────────────────────────────────┘
```

### 3.1 Modelo 1: Regressor de Demanda Diária (*Random Forest Regressor*)

1. **Origem na EDA:** O faturamento depende do dia da semana e o consumo de uma sexta-feira se parece muito mais com a sexta-feira anterior do que com a quinta-feira imediatamente anterior.
2. **Engenharia de Variáveis (*Feature Engineering*):**
   * `lag_1` (vendas de ontem): inércia de curto prazo.
   * `lag_2` (vendas de anteontem): suavização de choque.
   * `lag_7` (vendas do mesmo dia na semana passada): captura a sazonalidade semanal descoberta na EDA bivariada.
   * `rolling_mean_7` (média móvel de 7 dias): tendência e direção da demanda.
   * `is_weekend` (booleano para Sexta, Sábado e Domingo): elevação de baseline.
3. **Validação do Modelo:**
   * Utilizou-se o **Time-based Split** (80% treino passado / 20% teste futuro). Dividir dados temporais aleatoriamente (*Random Shuffle*) geraria *Data Leakage* (o modelo "adivinharia" o passado consultando o futuro).
   * **Resultado:** O modelo Random Forest alcançou **WAPE de 23,64%** e **MAE de 2,12 unidades/dia**, superando com folga a Árvore de Decisão simples (WAPE 24,47% e MAE 2,21).

---

### 3.2 Modelo 2: Segmentação Inteligente do Catálogo (*DBSCAN Clustering*)

1. **Origem na EDA:** Ao cruzar a demanda média diária contra o desvio padrão (volatilidade) dos 93 SKUs, os produtos não se distribuem de forma homogênea. Existem:
   * Itens de alto giro contínuo (Cervejas em lata e Refrigerantes de 2L);
   * Itens altamente voláteis que explodem no fim de semana (Gelo e Carvão);
   * Itens de baixa frequência, mas margem unitária altíssima (Vinhos e Destilados);
   * Itens de calda longa e conveniência secundária (Higiene e Limpeza).
2. **Por que DBSCAN e não K-Means?**
   * O K-Means força a criação de agrupamentos redondos (esféricos) e é altamente sensível a outliers. A EDA univariada comprovou assimetria severa e caudas longas.
   * O **DBSCAN (*Density-Based Spatial Clustering of Applications with Noise*)** agrupa produtos por **densidade de proximidade**, identificando automaticamente formatos irregulares e classificando SKUs erráticos como ruído (*outliers* com rótulo $-1$), sem deformar os grupos principais.

---

### 3.3 Modelo 3: Avaliador de Risco de Ruptura (*Gaussian Naive Bayes*)

1. **Origem na EDA:** Sabendo que o turno da noite concentra 61% das saídas e que o fim de semana tem 50% mais volume, o risco de estoque zerar não é uma função linear simples; é uma probabilidade condicionada ao contexto temporal e ao saldo remanescente.
2. **Formulação Probabilística:**
   $$P(\text{Ruptura} \mid \text{Estoque}, \text{Dia da Semana}, \text{Cluster})$$
3. **Aplicação Prática no PDV:** O classificador computa em tempo real a chance de falta de produto nas próximas 48 horas. Se o risco for superior a 75%, o Cockpit aciona um sinal vermelho luminoso para o gestor disparar a ordem de compra com 1 clique.

---

## 4. 📊 Matriz Comparativa: Resumo para Apresentação

| Etapa Metodológica | Pergunta do Negócio (Leigo) | Técnica Estatística / Matemática (Acadêmico) | Artefato de Código no CubeBox |
| :--- | :--- | :--- | :--- |
| **Limpeza e Auditoria** | "Os dados são confiáveis ou tem lixo?" | Imputação de nulos, desduplicação e checagem de integridade (97,14%). | [`cleaning_report.json`](file:///c:/Dev/CubeBox2/data/audit/cleaning_report.json) |
| **Análise Univariada** | "O que mais vende e qual o tamanho da compra?" | Métricas descritivas, Boxplots de Tukey, Skewness, Kurtosis e Curva de Pareto. | [`01_analise_univariada.ipynb`](file:///c:/Dev/CubeBox2/notebooks/01_analise_univariada.ipynb) |
| **Análise Bivariada** | "Quando os clientes compram e o que afeta as vendas?" | Correlação de Pearson, agregação temporal por turno e sazonalidade semanal. | [`02_analise_bivariada.ipynb`](file:///c:/Dev/CubeBox2/notebooks/02_analise_bivariada.ipynb) |
| **Engenharia de Features** | "Como preparar os dados para ensinar a máquina?" | Defasagens temporais ($D-1, D-2, D-7$), médias móveis e binários de fim de semana. | [`train_ml_pipeline.py`](file:///c:/Dev/CubeBox2/backend/scripts/train_ml_pipeline.py) |
| **Previsão de Demanda** | "Quantos itens vão vender nos próximos 7 dias?" | Regressão supervisionada não-linear multivariada (*Random Forest*). | [`model_serving.py`](file:///c:/Dev/CubeBox2/backend/app/routers/ml_routes.py) |
| **Segmentação de Mix** | "Quais produtos merecem tratamento especial no estoque?" | Agrupamento espacial não-supervisionado baseado em densidade (*DBSCAN*). | [`train_ml_pipeline.py`](file:///c:/Dev/CubeBox2/backend/scripts/train_ml_pipeline.py) |
| **Tomada de Decisão** | "O que o lojista deve fazer agora?" | Sistema de reabastecimento preventivo com 1-clique no Cockpit Web. | [`Dashboard / Cockpit Frontend`](file:///c:/Dev/CubeBox2/frontend/src) |

---

## 5. 🎯 Conclusão e Defesa de Tese

A integração entre as fases de **EDA** e **Modelagem Preditiva** no CubeBox Mini comprova que o sucesso de um sistema inteligente no varejo de proximidade não decorre do uso arbitrário de algoritmos complexos, mas sim do **rigor no entendimento das dinâmicas do negócio**.

A descoberta univariada de uma distribuição altamente assimétrica com compras de impulso e a validação bivariada de um pico de faturamento de $+50\%$ nos finais de semana permitiram desenhar uma arquitetura preditiva enxuta, executável em hardware local (*Edge Computing*), com baixa latência (< 45ms) e com métricas de negócio diretamente acionáveis na rotina do comerciante.

