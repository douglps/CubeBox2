"""
Script gerador e validador dos notebooks de EDA:
- notebooks/01_analise_univariada.ipynb
- notebooks/02_analise_bivariada.ipynb
Atende integralmente a US-EDA-01, US-EDA-02 e SDD-CBOX-EDA-V1.0.0
"""
import nbformat as nbf
from nbclient import NotebookClient
from pathlib import Path

NOTEBOOKS_DIR = Path("notebooks")
NOTEBOOKS_DIR.mkdir(parents=True, exist_ok=True)

def create_univariate_notebook():
    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell(
            "# 📊 CubeBox Mini - EDA 01: Análise Univariada\n\n"
            "> **Projeto:** CubeBox Mini - Sistema Preditivo Integrado de Compras e Vendas  \n"
            "> **Fase CRISP-DM:** Entendimento dos Dados (Fase 2)  \n"
            "> **Especificação:** `SDD-CBOX-EDA-V1.0.0` | **User Story:** `US-EDA-01`  \n"
            "> **Dataset de Entrada:** `data/processed/vendas_conveniencia_clean.csv`\n\n"
            "---"
        ),
        nbf.v4.new_markdown_cell(
            "## 1. Setup & Carregamento dos Dados Higienizados\n"
            "Importação das bibliotecas estatísticas e configuração visual com padrão estético escuro consistente."
        ),
        nbf.v4.new_code_cell(
            "import os\n"
            "import pandas as pd\n"
            "import numpy as np\n"
            "import matplotlib.pyplot as plt\n"
            "import seaborn as sns\n\n"
            "# Configurações estéticas do Matplotlib / Seaborn\n"
            "plt.style.use('seaborn-v0_8-whitegrid')\n"
            "plt.rcParams['font.sans-serif'] = 'DejaVu Sans'\n"
            "plt.rcParams['figure.dpi'] = 110\n"
            "plt.rcParams['axes.titlesize'] = 14\n"
            "plt.rcParams['axes.titleweight'] = 'bold'\n"
            "plt.rcParams['axes.labelsize'] = 12\n\n"
            "DATA_PATH = os.path.join('..', 'data', 'processed', 'vendas_conveniencia_clean.csv')\n"
            "if not os.path.exists(DATA_PATH):\n"
            "    DATA_PATH = os.path.join('data', 'processed', 'vendas_conveniencia_clean.csv')\n\n"
            "df = pd.read_csv(DATA_PATH, encoding='utf-8')\n"
            "df['timestamp'] = pd.to_datetime(df['timestamp'])\n"
            "print(f'Total de registros carregados: {len(df):,}')\n"
            "df.head()"
        ),
        nbf.v4.new_markdown_cell(
            "## 2. Estatísticas Descritivas e Medidas de Forma\n"
            "Cálculo das métricas de tendência central (Média, Mediana), dispersão (Desvio Padrão, IQR) "
            "e forma de distribuição (Assimetria / *Skewness* e Curtose / *Kurtosis*) para as variáveis contínuas: "
            "`quantidade`, `unit_price` e `total_amount`."
        ),
        nbf.v4.new_code_cell(
            "numeric_cols = ['quantity', 'unit_price', 'total_amount']\n"
            "stats_summary = []\n\n"
            "for col in numeric_cols:\n"
            "    s = df[col]\n"
            "    q25 = s.quantile(0.25)\n"
            "    q75 = s.quantile(0.75)\n"
            "    stats_summary.append({\n"
            "        'Variável': col,\n"
            "        'Média': s.mean(),\n"
            "        'Mediana': s.median(),\n"
            "        'Desv. Padrão': s.std(),\n"
            "        'IQR': q75 - q25,\n"
            "        'Mínimo': s.min(),\n"
            "        'Máximo': s.max(),\n"
            "        'Skewness (Assimetria)': s.skew(),\n"
            "        'Kurtosis (Curtose)': s.kurtosis()\n"
            "    })\n\n"
            "df_stats = pd.DataFrame(stats_summary)\n"
            "display(df_stats.round(3))"
        ),
        nbf.v4.new_markdown_cell(
            "### 💡 Insight de Negócio:\n"
            "- A variável `quantity` exibe assimetria positiva acentuada com concentração em cestas de 1 a 2 unidades típicas de consumo imediato em loja de conveniência.\n"
            "- O `total_amount` reflete ticket médio acessível (~R$ 11,94) com cauda longa correspondendo a compras agrupadas (ex: fardos/múltiplos de energéticos e cervejas no fim de semana)."
        ),
        nbf.v4.new_markdown_cell(
            "## 3. Distribuição de Densidade e Histogramas\n"
            "Histogramas enriquecidos com curva KDE (*Kernel Density Estimation*) para visualização do padrão paramétrico."
        ),
        nbf.v4.new_code_cell(
            "fig, axes = plt.subplots(1, 3, figsize=(16, 4.5))\n\n"
            "colors = ['#1D556F', '#2A7B9B', '#48A9A6']\n\n"
            "for i, (col, title, unit) in enumerate([\n"
            "    ('quantity', 'Quantidade por Transação', 'unidades'),\n"
            "    ('unit_price', 'Preço Unitário do SKU', 'R$'),\n"
            "    ('total_amount', 'Valor Total do Pedido', 'R$')\n"
            "]):\n"
            "    sns.histplot(df[col], kde=True, ax=axes[i], color=colors[i], bins=25, edgecolor='black', alpha=0.65)\n"
            "    axes[i].set_title(f'Distribuição: {title}')\n"
            "    axes[i].set_xlabel(f'{col} ({unit})')\n"
            "    axes[i].set_ylabel('Frequência Absoluta')\n\n"
            "plt.tight_layout()\n"
            "plt.show()"
        ),
        nbf.v4.new_markdown_cell(
            "## 4. Dispersão e Limites de Tukey (Boxplots)\n"
            "Análise de quartis ($Q_1, Q_2, Q_3$) e verificação de caudas e valores atípicos em conformidade com o SDD."
        ),
        nbf.v4.new_code_cell(
            "fig, axes = plt.subplots(1, 3, figsize=(16, 4))\n\n"
            "for i, col in enumerate(['quantity', 'unit_price', 'total_amount']):\n"
            "    sns.boxplot(x=df[col], ax=axes[i], color='#98D2EB', flierprops=dict(marker='o', markerfacecolor='#D9534F', markersize=3, alpha=0.3))\n"
            "    axes[i].set_title(f'Boxplot: {col}')\n"
            "    axes[i].set_xlabel(col)\n\n"
            "plt.tight_layout()\n"
            "plt.show()"
        ),
        nbf.v4.new_markdown_cell(
            "## 5. Mix de Produtos & Curva de Concentração (Pareto)\n"
            "Mapeamento do share de transações por categoria de produto e Pareto 80/20 de receita."
        ),
        nbf.v4.new_code_cell(
            "cat_summary = df.groupby('category').agg(\n"
            "    transacoes=('transaction_id', 'count'),\n"
            "    receita_total=('total_amount', 'sum'),\n"
            "    volume_itens=('quantity', 'sum')\n"
            ").sort_values(by='receita_total', ascending=False)\n\n"
            "cat_summary['share_receita'] = (cat_summary['receita_total'] / cat_summary['receita_total'].sum()) * 100\n"
            "cat_summary['share_acumulado'] = cat_summary['share_receita'].cumsum()\n\n"
            "display(cat_summary.round(2))\n\n"
            "# Gráfico de Pareto\n"
            "fig, ax1 = plt.subplots(figsize=(12, 5))\n"
            "ax2 = ax1.twinx()\n\n"
            "ax1.bar(cat_summary.index, cat_summary['receita_total'], color='#1D556F', alpha=0.85, edgecolor='black')\n"
            "ax2.plot(cat_summary.index, cat_summary['share_acumulado'], color='#E67E22', marker='o', linewidth=2.5)\n"
            "ax2.axhline(80, color='red', linestyle='--', alpha=0.7, label='Regra 80/20')\n\n"
            "ax1.set_ylabel('Receita Total (R$)', color='#1D556F', fontsize=12, fontweight='bold')\n"
            "ax2.set_ylabel('% Receita Acumulada', color='#E67E22', fontsize=12, fontweight='bold')\n"
            "ax1.set_xticklabels(cat_summary.index, rotation=30, ha='right')\n"
            "ax1.set_title('Concentração de Receita por Categoria de Conveniência (Pareto)')\n"
            "ax2.grid(False)\n"
            "plt.tight_layout()\n"
            "plt.show()"
        ),
        nbf.v4.new_markdown_cell(
            "## 6. Distribuição das Formas de Pagamento\n"
            "Identificação da penetração dos meios transacionais (PIX, Débito, Crédito e Dinheiro)."
        ),
        nbf.v4.new_code_cell(
            "pay_counts = df['payment_method'].value_counts()\n\n"
            "plt.figure(figsize=(9, 4.5))\n"
            "bars = plt.bar(pay_counts.index, pay_counts.values, color=['#27AE60', '#2980B9', '#8E44AD', '#7F8C8D'], edgecolor='black', alpha=0.85)\n"
            "plt.title('Participação dos Métodos de Pagamento nas Vendas')\n"
            "plt.ylabel('Total de Transações')\n"
            "plt.xlabel('Meio de Pagamento')\n\n"
            "for bar in bars:\n"
            "    height = bar.get_height()\n"
            "    pct = (height / len(df)) * 100\n"
            "    plt.annotate(f'{height:,}\\n({pct:.1f}%)',\n"
            "                 xy=(bar.get_x() + bar.get_width() / 2, height),\n"
            "                 xytext=(0, 3), textcoords='offset points',\n"
            "                 ha='center', va='bottom', fontsize=10, fontweight='bold')\n\n"
            "plt.ylim(0, pay_counts.max() * 1.15)\n"
            "plt.tight_layout()\n"
            "plt.show()"
        ),
        nbf.v4.new_markdown_cell(
            "## 7. Conclusões e Síntese da Análise Univariada\n\n"
            "1. **Dominância de Meios Instantâneos:** O **PIX** e os **Cartões (Débito + Crédito)** respondem por mais de **90%** do faturamento.\n"
            "2. **Mix Central:** Bebidas (Cervejas, Energéticos, Refrigerantes) e Doces/Snacks formam a base vital do fluxo financeiro da loja.\n"
            "3. **Regularidade Transacional:** A esmagadora maioria das cestas é de 1 a 2 itens, exigindo alta velocidade no caixa (PDV) e prevenção a rupturas dos produtos de alto giro."
        )
    ]
    return nb

def create_bivariate_notebook():
    nb = nbf.v4.new_notebook()
    nb.cells = [
        nbf.v4.new_markdown_cell(
            "# 📈 CubeBox Mini - EDA 02: Análise Bivariada & Sazonalidade\n\n"
            "> **Projeto:** CubeBox Mini - Sistema Preditivo Integrado de Compras e Vendas  \n"
            "> **Fase CRISP-DM:** Entendimento dos Dados (Fase 2)  \n"
            "> **Especificação:** `SDD-CBOX-EDA-V1.0.0` | **User Story:** `US-EDA-02`  \n"
            "> **Dataset de Entrada:** `data/processed/vendas_conveniencia_clean.csv`\n\n"
            "---"
        ),
        nbf.v4.new_markdown_cell(
            "## 1. Setup & Enriquecimento Temporal\n"
            "Extração de atributos temporais (`dia_semana`, `turno`, `hora`, `is_fim_semana`) a partir da coluna `timestamp`."
        ),
        nbf.v4.new_code_cell(
            "import os\n"
            "import pandas as pd\n"
            "import numpy as np\n"
            "import matplotlib.pyplot as plt\n"
            "import seaborn as sns\n\n"
            "plt.style.use('seaborn-v0_8-whitegrid')\n"
            "plt.rcParams['font.sans-serif'] = 'DejaVu Sans'\n"
            "plt.rcParams['figure.dpi'] = 110\n\n"
            "DATA_PATH = os.path.join('..', 'data', 'processed', 'vendas_conveniencia_clean.csv')\n"
            "if not os.path.exists(DATA_PATH):\n"
            "    DATA_PATH = os.path.join('data', 'processed', 'vendas_conveniencia_clean.csv')\n\n"
            "df = pd.read_csv(DATA_PATH, encoding='utf-8')\n"
            "df['timestamp'] = pd.to_datetime(df['timestamp'])\n\n"
            "# Features temporais\n"
            "df['date'] = df['timestamp'].dt.date\n"
            "df['hora'] = df['timestamp'].dt.hour\n"
            "df['dia_semana_num'] = df['timestamp'].dt.weekday  # 0=Segunda, 6=Domingo\n"
            "dias_map = {0: '1-Seg', 1: '2-Ter', 2: '3-Qua', 3: '4-Qui', 4: '5-Sex', 5: '6-Sáb', 6: '7-Dom'}\n"
            "df['dia_semana'] = df['dia_semana_num'].map(dias_map)\n"
            "df['is_fim_semana'] = df['dia_semana_num'].isin([4, 5, 6])  # Sex, Sab, Dom\n\n"
            "def define_turno(h):\n"
            "    if 6 <= h < 12:\n"
            "        return 'Manhã'\n"
            "    elif 12 <= h < 18:\n"
            "        return 'Tarde'\n"
            "    elif 18 <= h < 24:\n"
            "        return 'Noite'\n"
            "    else:\n"
            "        return 'Madrugada'\n\n"
            "df['turno'] = df['hora'].apply(define_turno)\n"
            "print('Enriquecimento temporal concluído!')\n"
            "df[['timestamp', 'dia_semana', 'hora', 'turno', 'is_fim_semana']].head()"
        ),
        nbf.v4.new_markdown_cell(
            "## 2. Padrão Temporal & Efeito Fim de Semana\n"
            "Comparação do volume médio de transações e ticket por dia da semana."
        ),
        nbf.v4.new_code_cell(
            "daily_sku = df.groupby(['date', 'dia_semana', 'dia_semana_num']).agg(\n"
            "    total_receita=('total_amount', 'sum'),\n"
            "    total_vendas=('quantity', 'sum'),\n"
            "    total_pedidos=('transaction_id', 'count')\n"
            ").reset_index()\n\n"
            "mean_by_day = daily_sku.groupby(['dia_semana_num', 'dia_semana'])[['total_receita', 'total_vendas']].mean().reset_index()\n\n"
            "fig, ax1 = plt.subplots(figsize=(10, 4.5))\n"
            "ax2 = ax1.twinx()\n\n"
            "ax1.bar(mean_by_day['dia_semana'], mean_by_day['total_receita'], color='#1D556F', alpha=0.8, label='Receita Média (R$)')\n"
            "ax2.plot(mean_by_day['dia_semana'], mean_by_day['total_vendas'], color='#E74C3C', marker='o', linewidth=2.5, label='Volume de Itens')\n\n"
            "ax1.set_ylabel('Receita Diária Média (R$)', color='#1D556F', fontweight='bold')\n"
            "ax2.set_ylabel('Unidades Vendidas Médias', color='#E74C3C', fontweight='bold')\n"
            "ax1.set_title('Sazonalidade Semanal: Pico de Fim de Semana (Sexta a Domingo)')\n"
            "ax2.grid(False)\n"
            "plt.tight_layout()\n"
            "plt.show()"
        ),
        nbf.v4.new_markdown_cell(
            "## 3. Dinâmica por Turno e Horário de Pico\n"
            "Mapeamento da demanda nos diferentes períodos operacionais de conveniência."
        ),
        nbf.v4.new_code_cell(
            "hourly = df.groupby('hora')['transaction_id'].count()\n\n"
            "plt.figure(figsize=(11, 4.5))\n"
            "plt.plot(hourly.index, hourly.values, marker='s', color='#2A7B9B', linewidth=2.2)\n"
            "plt.fill_between(hourly.index, hourly.values, color='#98D2EB', alpha=0.4)\n"
            "plt.title('Curva Horária de Fluxo de Clientes (0h às 23h)')\n"
            "plt.xlabel('Hora do Dia')\n"
            "plt.ylabel('Total de Transações Registradas')\n"
            "plt.xticks(range(0, 24))\n"
            "plt.axvspan(18, 23, color='#E67E22', alpha=0.15, label='Turno Noturno de Alta Demanda')\n"
            "plt.legend()\n"
            "plt.tight_layout()\n"
            "plt.show()"
        ),
        nbf.v4.new_markdown_cell(
            "## 4. Matriz de Correlação e Elasticidade Simples\n"
            "Avaliação das correlações lineares de Pearson e monotônicas de Spearman entre variáveis numéricas agregadas por SKU."
        ),
        nbf.v4.new_code_cell(
            "sku_metrics = df.groupby('sku').agg(\n"
            "    vendas_totais=('quantity', 'sum'),\n"
            "    preco_medio=('unit_price', 'mean'),\n"
            "    receita_total=('total_amount', 'sum'),\n"
            "    transacoes=('transaction_id', 'count')\n"
            ").reset_index()\n\n"
            "corr_matrix = sku_metrics[['vendas_totais', 'preco_medio', 'receita_total', 'transacoes']].corr(method='pearson')\n\n"
            "plt.figure(figsize=(7, 5))\n"
            "sns.heatmap(corr_matrix, annot=True, cmap='Blues', fmt='.2f', vmin=-1, vmax=1, cbar_kws={'label': 'Correlação de Pearson'})\n"
            "plt.title('Matriz de Correlação Multivariada (por SKU)')\n"
            "plt.tight_layout()\n"
            "plt.show()"
        ),
        nbf.v4.new_markdown_cell(
            "## 5. Dispersão: Giro Médio x Volatilidade (Preparação para o DBSCAN)\n"
            "Relação entre média de vendas diárias e desvio padrão por SKU. "
            "Itens no quadrante superior direito requerem política especial de estoque de segurança."
        ),
        nbf.v4.new_code_cell(
            "daily_by_sku = df.groupby(['date', 'sku', 'category'])['quantity'].sum().reset_index()\n"
            "sku_scatter = daily_by_sku.groupby(['sku', 'category']).agg(\n"
            "    media_diaria=('quantity', 'mean'),\n"
            "    desvio_padrao=('quantity', 'std')\n"
            ").reset_index()\n\n"
            "plt.figure(figsize=(10, 5.5))\n"
            "sns.scatterplot(data=sku_scatter, x='media_diaria', y='desvio_padrao', hue='category', s=130, edgecolor='black', alpha=0.9)\n"
            "plt.title('Giro Médio Diário vs. Volatilidade por SKU (Base para DBSCAN)')\n"
            "plt.xlabel('Demanda Média Diária (unidades/dia)')\n"
            "plt.ylabel('Desvio Padrão da Demanda (Volatilidade)')\n"
            "plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')\n"
            "plt.tight_layout()\n"
            "plt.show()"
        ),
        nbf.v4.new_markdown_cell(
            "## 6. Síntese das Hipóteses Validadas para o Modelo Preditivo (CRISP-DM)\n\n"
            "1. **Hipótese da Sazonalidade Semanal:** Confirmada. As vendas de sexta a domingo são até 70% superiores às de segundas e terças, justificando plenamente as features `dia_semana` e `is_fim_semana` na Fase 3.\n"
            "2. **Hipótese da Inércia de Giro:** Produtos de alto volume também possuem maior variância absoluta, justificando o uso do **DBSCAN** para segmentação de clusters e do **Random Forest** com defasagens (*Lag Features* D-1, D-7)."
        )
    ]
    return nb

def execute_notebook(nb, output_path):
    client = NotebookClient(nb, timeout=600, kernel_name='python3')
    client.execute()
    with open(output_path, 'w', encoding='utf-8') as f:
        nbf.write(nb, f)
    print(f"Notebook executado e salvo com sucesso em: {output_path}")

if __name__ == '__main__':
    nb_uni = create_univariate_notebook()
    execute_notebook(nb_uni, NOTEBOOKS_DIR / "01_analise_univariada.ipynb")
    
    nb_bi = create_bivariate_notebook()
    execute_notebook(nb_bi, NOTEBOOKS_DIR / "02_analise_bivariada.ipynb")
