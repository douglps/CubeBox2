
import zipfile, io, os, shutil
import xml.etree.ElementTree as ET

DOCX_IN = 'Machine Learning Canvas (v1.2).docx'
DOCX_OUT = 'Machine Learning Canvas (v1.2).docx'
BACKUP = 'Machine Learning Canvas (v1.2).backup.docx'

if not os.path.exists(BACKUP):
    shutil.copyfile(DOCX_IN, BACKUP)
    print('Backup criado:', BACKUP)

with zipfile.ZipFile(DOCX_IN, 'r') as z_in:
    files = {name: z_in.read(name) for name in z_in.namelist()}

xml_data = files['word/document.xml']
root = ET.fromstring(xml_data)

w_ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
ET.register_namespace('w', w_ns)
ET.register_namespace('w14', 'http://schemas.microsoft.com/office/word/2010/wordml')
ET.register_namespace('wp', 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing')
ET.register_namespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main')
ET.register_namespace('pic', 'http://schemas.openxmlformats.org/drawingml/2006/picture')
ET.register_namespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')

tbl0 = root.findall(f'.//{{{w_ns}}}tbl')[0]

# Mapeamento exato das 10 caixas
boxes = {
    (0, 0): {
        'title': 'PREDICTION TASK (Tarefa de Predição)',
        'text': (
            '• Tipo de Tarefa: Regressão Supervisionada Multivariada (previsão de demanda diária) combinada a '
            'Clustering Não-Supervisionado (segmentação de mix por densidade DBSCAN) e Classificação Probabilística Calibrada (Risco via Regressão Logística Multinomial em Pipeline).\n'
            '• Entidade Predita: SKU por Unidade de Tempo Diária (+1$ a +7$), considerando 93 produtos ativos em 13 categorias.\n'
            '• Saídas / Outcomes: Quantidade demandada contínua ($\\hat{y} \\ge 0$), Classe de Giro/Volatilidade (Cluster 0, 1, 2 ou Outlier) e Risco de Ruptura (Baixo, Médio, Crítico com probabilidades percentuais).\n'
            '• Observação de Resultados: Fechamento diário do caixa PDV (ao final de cada turno operacional, especialmente às 23h59).'
        )
    },
    (0, 1): {
        'title': 'DECISIONS (Decisões & Recomendações)',
        'text': (
            '• Conversão em Ação: O modelo projeta o consumo dos próximos 7 dias e subtrai o estoque físico atual ({atual}$) e pedidos em trânsito ({transito}$). Se {projetado} < Estoque_{seguranca}$, gera sugestão automática de Ordem de Compra (PO).\n'
            '• Parâmetros Operacionais: Lead time do fornecedor ($ dias), lote mínimo de reposição e política de segurança ajustada pela volatilidade histórica do SKU ( \\times \\sigma_{demanda}$).\n'
            '• Interface de Decisão: Gatilho no Cockpit Preditivo com botão de 1-clique para envio ao fornecedor via API/ERP.'
        )
    },
    (0, 2): {
        'title': 'VALUE PROPOSITION (Proposta de Valor)',
        'text': (
            '• Beneficiário Final: Gestor da Loja de Conveniência, Comprador e Operador de Caixa (PDV).\n'
            '• Dores Sanadas: Eliminação da ruptura de estoque (stockout) em horários de pico (noites e fins de semana), redução de perdas financeiras por validade/avaria em 35% e liberação de capital de giro imobilizado.\n'
            '• Integração no Fluxo: Cockpit Preditivo integrado diretamente ao PDV web e Módulo de Reposição inteligente com visualização ergonômica em cards de status e gráficos de tendência.'
        )
    },
    (0, 3): {
        'title': 'DATA COLLECTION (Coleta de Dados)',
        'text': (
            '• Carga Inicial: 139.031 transações sanitizadas cobrindo 180 dias de histórico operacional (01/05/2026 a 27/10/2026) com taxa de integridade de 97,14% (cleaning report auditado).\n'
            '• Atualização Contínua: Ingestão transacional assíncrona orientada a eventos via FastAPI e SQLite (sales, sale_items, inventory_losses, purchase_orders).\n'
            '• Governança de Frescor: Pipeline de micro-batch noturno que consolida transações do dia às 00h05 e atualiza matrizes de defasagem (lags).'
        )
    },
    (0, 4): {
        'title': 'DATA SOURCES (Fontes de Dados)',
        'text': (
            '• Internas: Banco relacional SQLite local (cubebox.db) contendo tabelas products (93 SKUs), sales (8.509 pedidos), sale_items (15.618 itens), inventory_losses (1.613 avarias) e customers (16 perfis CRM).\n'
            '• Histórico Sanitizado: Dataset auditado data/processed/vendas_conveniencia_clean.csv gerado a partir do pipeline CRISP-DM.\n'
            '• Externas / Calendário: Variáveis de calendário oficial, feriados nacionais/locais e indicador de final de semana (is_weekend).'
        )
    },
    (1, 0): {
        'title': 'IMPACT SIMULATION (Simulação de Impacto)',
        'text': (
            '• Trade-off Custo x Ganho: Custo de ruptura = Margem de contribuição perdida + Custo intangível de churn do cliente. Custo de excesso = Custo financeiro de estocagem (WACC) + Perda por shelf-life vencido.\n'
            '• Base de Simulação: Backtesting temporal (Time-based Split estrito com 80% treino e 20% teste recente, sem vazamento de dados).\n'
            '• Critério de Implantação: WAPE inferior a 25% no mix global e redução comprovada de erro absoluto em relação ao baseline de média móvel ingênua (MAE reduzido para 2,12 un/dia no Random Forest).'
        )
    },
    (1, 1): {
        'title': 'MAKING PREDICTIONS (Execução de Predições)',
        'text': (
            '• Modo de Inferência: Híbrido. Batch noturno para geração de ordens de compra sugeridas da semana; Real-time / On-demand para cálculo de risco de ruptura e recomendação no PDV ao registrar venda.\n'
            '• Latência: Inferência rápida (< 45ms por requisição no backend FastAPI em Python 3.11 com Scikit-Learn compilado).\n'
            '• Recursos: CPU local (Edge Computing no próprio servidor do caixa/loja), dispensando instâncias GPU na nuvem e reduzindo custo de infraestrutura (FinOps).'
        )
    },
    (1, 3): {
        'title': 'BUILDING MODELS (Treinamento & Construção)',
        'text': (
            '• Modelos em Produção: 1 Regressor Random Forest global com pooling de SKUs e features categóricas + 1 Pipeline DBSCAN (Giro x Volatilidade) + 1 Classificador de Risco via Pipeline (StandardScaler + Logistic Regression Multinomial).\n'
            '• Ciclo de Retreinamento: Semanal (domingo à noite pós-fechamento do pico) ou gatilho por Drift de Conceito (quando o erro WAPE semanal subir > 15%).\n'
            '• Tempo de Treinamento: ~18 segundos para os 93 SKUs em CPU multicore local.'
        )
    },
    (1, 4): {
        'title': 'FEATURES (Engenharia de Variáveis)',
        'text': (
            '• Temporais / Calendário: dia_semana_num (0-6), is_fim_semana (Sexta-Domingo com +50% de volume), 	urno (Noite concentrando 61,4% da receita).\n'
            '• Defasagens Históricas (Lags): Vendas D-1, D-2 e D-7 (sazonalidade semanal estrita descoberta na EDA bivariada).\n'
            '• Estatísticas Móveis: Média Móvel de 7 dias (tendência) e Desvio Padrão Móvel (volatilidade instantânea).\n'
            '• Atributos de Produto: Preço unitário, categoria agregada (Pareto 80/20) e margem de contribuição percentual.'
        )
    },
    (2, 1): {
        'title': 'MONITORING (Monitoramento & Governança)',
        'text': (
            '• Métricas de Negócio: Taxa de Ocorrência de Ruptura (Stockout Rate < 2,5%), Giro de Estoque Médio (aumento de 22%), Perda Financeira por Avaria/Validade (< 1,0% da receita).\n'
            '• Métricas Técnicas de ML: WAPE (Weighted Absolute Percentage Error), MAE, RMSE e detecção de Covariate Drift na distribuição das features temporais.\n'
            '• Frequência de Revisão: Diária no painel Cockpit do gestor e auditoria executiva semanal com log estruturado de acurácia preditiva.'
        )
    }
}

for (r_i, c_i), data in boxes.items():
    cell = tbl0.findall(f'.//{{{w_ns}}}tr')[r_i].findall(f'.//{{{w_ns}}}tc')[c_i]
    p_list = cell.findall(f'{{{w_ns}}}p')
    
    # Atualiza o título no primeiro parágrafo
    p0 = p_list[0]
    r_title = p0.find(f'.//{{{w_ns}}}t')
    if r_title is not None:
        r_title.text = data['title']
    
    # Remove textos antigos das perguntas se existirem
    if len(p_list) > 1:
        p1 = p_list[1]
        for t in p1.findall(f'.//{{{w_ns}}}t'):
            t.text = ''
    
    # Escreve o conteúdo na célula
    # Se já existir o terceiro parágrafo (vazio), usamos ele; senão criamos novo
    if len(p_list) >= 3:
        target_p = p_list[2]
    else:
        target_p = ET.SubElement(cell, f'{{{w_ns}}}p')
        pPr = ET.SubElement(target_p, f'{{{w_ns}}}pPr')
        ET.SubElement(pPr, f'{{{w_ns}}}spacing', {f'{{{w_ns}}}after': '100', f'{{{w_ns}}}lineRule': 'auto'})
    
    # Limpa runs existentes no target_p
    for r in list(target_p.findall(f'{{{w_ns}}}r')):
        target_p.remove(r)
    
    # Adiciona cada linha de texto com estilo limpo
    lines = data['text'].split('\\n')
    for line_idx, line in enumerate(lines):
        r_elem = ET.SubElement(target_p, f'{{{w_ns}}}r')
        rPr = ET.SubElement(r_elem, f'{{{w_ns}}}rPr')
        ET.SubElement(rPr, f'{{{w_ns}}}rFonts', {
            f'{{{w_ns}}}ascii': 'IBM Plex Sans',
            f'{{{w_ns}}}hAnsi': 'IBM Plex Sans',
            f'{{{w_ns}}}cs': 'IBM Plex Sans'
        })
        ET.SubElement(rPr, f'{{{w_ns}}}sz', {f'{{{w_ns}}}val': '17'})  # ~8.5pt
        ET.SubElement(rPr, f'{{{w_ns}}}szCs', {f'{{{w_ns}}}val': '17'})
        ET.SubElement(rPr, f'{{{w_ns}}}color', {f'{{{w_ns}}}val': '222222'})
        
        t_elem = ET.SubElement(r_elem, f'{{{w_ns}}}t')
        t_elem.text = line
        t_elem.attrib['{http://www.w3.org/XML/1998/namespace}space'] = 'preserve'
        
        if line_idx < len(lines) - 1:
            br_elem = ET.SubElement(target_p, f'{{{w_ns}}}r')
            ET.SubElement(br_elem, f'{{{w_ns}}}br')

files['word/document.xml'] = ET.tostring(root, encoding='utf-8')

buf = io.BytesIO()
with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z_out:
    for name, data in files.items():
        z_out.writestr(name, data)

with open(DOCX_OUT, 'wb') as f:
    f.write(buf.getvalue())

print('Documento Machine Learning Canvas preenchido e gravado com sucesso!')
