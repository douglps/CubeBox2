# 📊 Panorama Executivo: Ciência de Dados Aplicada no CubeBox Mini
> **Documento de Apresentação & Divulgação de Resultados**  
> **Público-alvo:** Gestores, Lojistas e Stakeholders (Linguagem Acessível / Leiga) com Fundamentação Técnica  
> **Metodologia de Referência:** CRISP-DM (*Cross-Industry Standard Process for Data Mining*)  
> **Status:** Modelos Treinados, Validados e Integrados em Produção  

---

## 🎯 1. O Problema do Mundo Real: O Dilema da Loja de Conveniência

Imagine que você administra uma loja de conveniência ou um minimercado de bairro:
- Se você comprar **pouca cerveja, gelo ou carvão** na sexta-feira à tarde, o cliente que chega para o churrasco encontra a geladeira vazia (**falta de produto / ruptura**). Ele fica insatisfeito e vai comprar no concorrente, gerando faturamento perdido imediato.
- Por outro lado, se você comprar **leite, salgados ou chocolates demais** na segunda-feira, esses produtos ficam parados no depósito, ocupam espaço, trancam o seu dinheiro (**capital imobilizado**) e acabam vencendo na prateleira (**perdas por quebra/validade**).

💡 **A Proposta da Ciência de Dados no CubeBox:**  
Em vez de tomar decisões baseadas no "achismo" ou na intuição do gerente, transformamos **139.031 vendas reais** do caixa em um **assistente preditivo inteligente** que prevê as vendas da semana, avisa quando o estoque vai acabar antes que aconteça e calcula a quantidade exata a ser reposta.

---

## 🧭 2. Linha do Tempo: Como os Dados Viraram Inteligência (Ciclo CRISP-DM)

Seguimos a metodologia internacional **CRISP-DM** em 6 etapas:

```
  ┌───────────────────────┐        ┌───────────────────────┐        ┌───────────────────────┐
  │ 1. Entendimento do    │        │ 2. Entendimento dos   │        │ 3. Preparação dos     │
  │    Negócio (Dilema)   │ ─────► │    Dados (Raio-X/EDA) │ ─────► │    Dados (Tratamento) │
  └───────────────────────┘        └───────────────────────┘        └───────────────────────┘
                                                                                │
                                                                                ▼
  ┌───────────────────────┐        ┌───────────────────────┐        ┌───────────────────────┐
  │ 6. Implantação        │        │ 5. Avaliação de       │        │ 4. Criação dos        │
  │    (Cockpit / Telas)  │ ◄───── │    Negócio (Métricas) │ ◄───── │    Modelos de IA (ML) │
  └───────────────────────┘        └───────────────────────┘        └───────────────────────┘
```

---

## 🔍 3. As Grandes Descobertas nos Dados (O "Raio-X" da Operação)

Antes de criar qualquer algoritmo inteligente, analisamos a fundo o histórico de 180 dias de operação:

### 3.1 Comportamento da Cesta de Compras
* **O que acontece no caixa:** A grande maioria das compras é pontual e de consumo rápido: 1 refrigerante gelado, 1 chiclete ou 1 maço de cigarro (a quantidade típica é de apenas 1 item por cliente). O gasto típico fica em torno de **R$ 11,50**.
* **O cliente do churrasco:** Em contrapartida, esporadicamente entram compras coletivas com fardos de bebidas e destilados, atingindo tíquetes de até **R$ 759,60**.
* ⚙️ *Gancho Técnico:* A distribuição de frequência é fortemente assimétrica à direita (*skewness* de $+6,20$ e curtose de $60,52$). Por não seguir uma curva normal ("gaussiana"), modelos matemáticos tradicionais lineares simples (como regressão linear por mínimos quadrados) falham. Isso exigiu o uso de algoritmos modernos baseados em conjuntos de árvores.

### 3.2 Onde está o Faturamento? A Regra de Ouro (80/20)
* Das 13 categorias da loja, apenas **6 categorias concentram 80% de todo o dinheiro que entra**:
  1. **Cervejas:** 21,73% da receita
  2. **Refrigerantes:** 16,37%
  3. **Vinhos:** 13,89%
  4. **Destilados:** 10,30%
  5. **Tabacaria:** 9,73%
  6. **Doces & Chocolates:** 8,06%
* As demais 7 categorias (congelados, snacks, energéticos, carvão/gelo, higiene e limpeza) funcionam como conveniência de apoio.
* Além disso, mais de **90% dos pagamentos são imediatos** (PIX com 46,7% e Cartões com 43,6%), permitindo atualizar o saldo de estoque e caixa no mesmo segundo.

### 3.3 A Explosão do Fim de Semana e da Noite
* **Dias de Pico:** De segunda a quinta-feira a loja fatura em média R$ 13.100/dia. De sexta a domingo, o faturamento salta para **R$ 19.670/dia (+50% de aumento)**.
* **Horário Chave:** O período da noite (das 18h às 23h59) sozinho é responsável por **61,4% de toda a receita** da loja.
* 💡 *Lição para a Reposição:* O caminhão do distribuidor não pode descarregar mercadorias às 19h. O abastecimento dos freezers precisa estar 100% pronto antes das 17h para capturar o pico sem faltar cerveja gelada.

---

## 🤖 4. Os 3 Motores de Inteligência Artificial Construídos

Para atender o comerciante, desenvolvemos 3 modelos especializados que trabalham de forma coordenada:

```
                      ┌────────────────────────────────────────┐
                      │    CATÁLOGO DE PRODUTOS & VENDAS       │
                      └──────────────────┬─────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
 ┌───────────────┐               ┌───────────────┐               ┌───────────────┐
 │   MOTOR 1:    │               │   MOTOR 2:    │               │   MOTOR 3:    │
 │ Previsão de   │               │ Separação por │               │ Semáforo de   │
 │ Demanda Diária│               │ Perfil / Giro │               │ Risco Ruptura │
 └───────┬───────┘               └───────┬───────┘               └───────┬───────┘
         │                               │                               │
         │ "Quantas unidades vão         │ "Qual o comportamento de      │ "Qual a chance de faltar  │
         │  vender na semana?"           │  giro e margem do produto?"   │  produto nas próximas 48h?"│
         │                               │                               │
         └───────────────────────────────┼───────────────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │     REORDER ENGINE (Sugestão de        │
                      │    Compra e Reposição em 1 Clique)     │
                      └────────────────────────────────────────┘
```

---

### 🔮 Motor 1: Previsor de Vendas Futuras (Regressão Supervisionada)
* **Em palavras simples:** Funciona como uma "previsão do tempo" para as vendas. O algoritmo analisa como o produto vendeu ontem, anteontem, na mesma sexta-feira da semana passada e se estamos no final de semana, projetando quantos itens sairão nos próximos 7 dias.
* **Quem ganhou a disputa?** Comparamos uma *Árvore de Decisão Simples* contra uma floresta de árvores (*Random Forest*). O Random Forest foi o campeão com menor taxa de erro.
* ⚙️ *Gancho Técnico:* Utilizou-se o algoritmo `RandomForestRegressor` com validação temporal (*Time-based Split* 80/20) para evitar vazamento de dados futuros (*data leakage*). O modelo obteve um erro percentual ponderado ($WAPE$) significativamente menor e erro absoluto médio ($MAE$) em torno de 2 a 5 unidades por dia dependendo da volatilidade do item.

---

### 🏷️ Motor 2: Agrupador de Produtos por Perfil de Giro (Clusterização)
* **Em palavras simples:** O lojista não deve tratar uma cerveja da mesma forma que trata uma garrafa de vinho caro ou um saco de carvão. Este motor separou automaticamente os 93 produtos em grupos com personalidades parecidas:
  1. *Grupo 0 — Alta Rotatividade:* Bebidas e cervejas que vendem todo santo dia;
  2. *Grupo 1 — Giro Constante:* Salgadinhos, refrigerantes e balas;
  3. *Grupo 2 — Margem Alta e Giro Baixo:* Destilados finos e vinhos;
  4. *Grupo de Picos:* Gelo e Carvão (ficam calmos na terça-feira e explodem no sábado de sol).
* ⚙️ *Gancho Técnico:* Em vez do tradicional $K\text{-Means}$ (que força grupos esféricos e sofre com valores extremos), adotamos o algoritmo **DBSCAN** (*Density-Based Spatial Clustering of Applications with Noise*). Ele agrupa dados por aglomeração espacial em densidade contínua e consegue isolar comportamentos anômalos sem distorcer os grupos regulares.

---

### 🚦 Motor 3: Semáforo de Risco de Falta de Estoque (Classificação Probabilística)
* **Em palavras simples:** Um alerta preventivo colorido no painel do gerente. Em vez de esperar o cliente avisar que o produto acabou, o sistema calcula a probabilidade (de 0% a 100%) daquele item faltar nas próximas 48 horas levando em conta o estoque atual, a velocidade de venda e o dia da semana.
  - 🟢 **Baixo Risco:** Estoque suficiente e tranquilo.
  - 🟡 **Médio Risco:** Ficar atento, produto em velocidade acelerada.
  - 🔴 **Alto Risco:** Pedir agora ao fornecedor para evitar gôndola vazia.
* ⚙️ *Gancho Técnico:* Implementado através de **Regressão Logística Multinomial** em pipeline escalonado (`StandardScaler`), gerando probabilidades calibradas via `predict_proba`. Superou o baseline ingênuo de *Gaussian Naive Bayes* por lidar adequadamente com a correlação existente entre estoque remanescente e sazonalidade de calendário.

---

## 📈 5. O Resultado Prático: Do Algoritmo para a Tela do Lojista

Toda essa matemática pesada roda de forma imperceptível nos bastidores (tempo de resposta inferior a 45 milissegundos). Na tela do gerente (**Cockpit Web**), ela se traduz em facilidades imediatas:

1. **Sugestão de Compra em 1 Clique:**  
   O sistema combina a *Demanda Projetada* pelo Random Forest + *Margem de Segurança* contra imprevistos + *Histórico de Quebras* e desconta o *Estoque Atual*. O gerente revisa e clica em **"Aprovar Pedido de Compra"**.
2. **Caixa Blindado (PDV):**  
   Não permite vender o que não existe no estoque físico (bloqueio estrito de estoque negativo).
3. **Controle de Desperdício (Avarias):**  
   Registro de garrafas quebradas ou vencidas com impacto em tempo real no cálculo do risco de estoque.

---

## 📋 Resumo em Uma Tabela

| Pergunta do Lojista (Leigo) | O que a Ciência de Dados Responde? | Técnica Matemática / Algoritmo |
| :--- | :--- | :--- |
| *"O que realmente dá lucro e vende na minha loja?"* | 6 categorias respondem por 80% da receita; fins de semana vendem 50% mais. | Análise Univariada, Bivariada e Curva de Pareto. |
| *"Quantos fardos vão sair na semana que vem?"* | Projeção numérica diária para os próximos 7 dias. | Regressão com Florestas Aleatórias (*Random Forest*). |
| *"Como organizar o catálogo por comportamento?"* | Agrupamento em perfis de alto giro, margem ou sazonais. | Agrupamento Espacial por Densidade (*DBSCAN*). |
| *"Qual produto vai me deixar na mão amanhã?"* | Cálculo da chance percentual de ruptura nas próximas 48h. | Classificação Probabilística (*Regressão Logística Multinomial*). |
| *"Quanto comprar do distribuidor hoje?"* | Sugestão automática de reposição sem excesso nem falta. | Fórmula de Reabastecimento Integrada (*Reorder Engine*). |

---
*Documento elaborado para fins de comunicação executiva, defesas técnicas e demonstrações do CubeBox Mini.*
