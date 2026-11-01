/**
 * =============================================================================
 * PAINEL GERAL DE INDICADORES (DASHBOARD COCKPIT) - CUBEBOX MINI
 * =============================================================================
 * Projeto: CubeBox Mini
 * Função no Negócio:
 *     Este componente é o "painel de instrumentos do dono da loja".
 *     Em uma única tela, ele resume a saúde financeira e operacional do comércio:
 *     - Quanto entrou de dinheiro hoje (Faturamento Bruto e Líquido).
 *     - Quantas pessoas compraram (Total de Vendas / Comandas fechadas).
 *     - Quanto foi dado em descontos promocionais.
 *     - Quais produtos estão acabando na prateleira (Risco de Ruptura Crítico).
 * 
 * Por que ele existe e o que resolve:
 *     O comerciante não tem tempo para abrir planilhas complexas no meio do dia.
 *     Ele precisa bater o olho e saber imediatamente se a loja está lucrando
 *     e se precisa repor algum item com urgência antes do pico da noite.
 * 
 * Como funciona o fluxo de dados:
 *     [Passo 1] Consulta à API: Ao carregar a tela, dispara `fetchDashboardKPIs()`.
 *     [Passo 2] Cards de KPIs: Renderiza 4 cartões de impacto visual (Receita, Vendas, Descontos, Alertas).
 *     [Passo 3] Gráfico de Faturamento Diário: Apresenta a evolução das vendas dos últimos 7 dias.
 *     [Passo 4] Ações Rápidas: Atalhos diretos para abrir o Caixa (PDV) ou encomendar mercadoria (Previsões).
 * =============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingDown,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { fetchDashboardKPIs, DashboardPeriod } from '../services/api';
import { DashboardKPIs } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { XaiBadge } from '../components/common/XaiBadge/XaiBadge';
import { SkeletonShimmer } from '../components/common/SkeletonShimmer/SkeletonShimmer';
import { CompactChartTooltip } from '../components/common/CompactChartTooltip';
import styles from './DashboardView.module.css';

interface DashboardViewProps {
  onNavigateToPos: () => void;
  onNavigateToPredictive: () => void;
}

const PERIOD_OPTIONS: { label: string; value: DashboardPeriod }[] = [
  { label: '30 Dias', value: '30d' },
  { label: 'Mês Atual', value: 'mes' },
  { label: 'Trimestre', value: 'trimestre' },
  { label: 'Semestre', value: 'semestre' },
  { label: '1 Ano', value: '1ano' },
  { label: 'Histórico Completo', value: 'tudo' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToPos,
  onNavigateToPredictive,
}) => {
  // [Passo 1/4] Estados de dados dos indicadores financeiros e filtro temporal
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('30d');

  const loadDashboard = (period = selectedPeriod) => {
    setLoading(true);
    setError(null);
    fetchDashboardKPIs(period, true)
      .then((data) => {
        setKpis(data);
      })
      .catch((err) => {
        setError(err.message || 'Sem conexão com o sistema. Verifique a rede.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard(selectedPeriod);
  }, [selectedPeriod]);

  if (error || (!loading && !kpis)) {
    return (
      <div className={styles.errorContainer}>
        <AlertTriangle size={32} color="var(--status-danger)" />
        <p>{error || 'Não foi possível obter os dados do painel.'}</p>
        <Button
          variant="primary"
          icon={<RotateCcw size={16} />}
          onClick={() => loadDashboard(selectedPeriod)}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Quick Action Ribbon */}
      <div className={styles.actionBar}>
        <div>
          <h2 className={styles.sectionTitle}>Visão Geral do Varejo</h2>
          <p className={styles.sectionSubtitle}>
            Consolidação em tempo real do faturamento líquido, volume e saúde de estoque.
          </p>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onNavigateToPredictive}>
            Previsão de Demanda
          </Button>
          <Button
            variant="primary"
            icon={<ArrowUpRight size={16} />}
            onClick={onNavigateToPos}
          >
            Abrir Caixa (PDV)
          </Button>
        </div>
      </div>

      {/* Dynamic Filter Ribbon */}
      <div className={styles.filterBar} role="region" aria-label="Filtro de Período do Dashboard">
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>
            <Calendar size={14} />
            Período:
          </span>
          <div className={styles.periodPills} role="radiogroup" aria-label="Selecione a janela temporal">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selectedPeriod === opt.value}
                className={`${styles.periodButton} ${
                  selectedPeriod === opt.value ? styles.periodButtonActive : ''
                }`}
                onClick={() => setSelectedPeriod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid} aria-busy={loading}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`kpi-skeleton-${i}`} className={styles.kpiCard} aria-hidden="true">
              <div className={styles.kpiHeader}>
                <SkeletonShimmer variant="text" width="60%" height={14} />
                <SkeletonShimmer variant="circle" width={28} height={28} />
              </div>
              <div className={styles.kpiValue} style={{ margin: '12px 0' }}>
                <SkeletonShimmer variant="text" width="75%" height={32} />
              </div>
              <div className={styles.kpiSub}>
                <SkeletonShimmer variant="text" width="45%" height={12} />
              </div>
            </div>
          ))
        ) : kpis ? (
          <>
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Faturamento Líquido</span>
                <div className={`${styles.iconWrap} ${styles.blue}`}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div className={styles.kpiValue}>
                <span className="tabular">
                  {(kpis.net_revenue ?? 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              <div className={styles.kpiSub}>
                Faturamento bruto deduzido de descontos de balcão
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Volume de Pedidos</span>
                <div className={`${styles.iconWrap} ${styles.purple}`}>
                  <ShoppingBag size={18} />
                </div>
              </div>
              <div className={styles.kpiValue}>
                <span className="tabular">{kpis.total_orders ?? 0}</span>
              </div>
              <div className={styles.kpiSub}>
                Total de pedidos registrados no caixa
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Ticket Médio</span>
                <div className={`${styles.iconWrap} ${styles.emerald}`}>
                  <Receipt size={18} />
                </div>
              </div>
              <div className={styles.kpiValue}>
                <span className="tabular">
                  {(kpis.average_ticket ?? 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              <div className={styles.kpiSub}>Média por pedido no período selecionado</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Perdas & Avarias</span>
                <div className={`${styles.iconWrap} ${styles.orange}`}>
                  <TrendingDown size={18} />
                </div>
              </div>
              <div className={styles.kpiValue}>
                <span className="tabular">
                  {(kpis.inventory_losses_total ?? 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              <div className={styles.kpiSub}>Custo de quebras/vencimentos do período</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={styles.kpiLabel}>Risco de Ruptura</span>
                  <XaiBadge modelType="LOGISTIC_REGRESSION" size="sm" label="IA" alignTooltip="right" />
                </div>
                <div className={`${styles.iconWrap} ${styles.red}`}>
                  <AlertTriangle size={18} />
                </div>
              </div>
              <div className={styles.kpiValue}>
                <span className="tabular">{kpis.critical_stock_count ?? 0}</span>
                <span className={styles.kpiUnit}>SKUs</span>
              </div>
              <div className={styles.kpiSub}>
                <Badge
                  label={
                    (kpis.critical_stock_count ?? 0) > 0 ? 'Atenção Necessária' : 'Estoque Saudável'
                  }
                  variant={(kpis.critical_stock_count ?? 0) > 0 ? 'warning' : 'success'}
                  size="sm"
                />
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Chart Section */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>
              Evolução de Vendas ({PERIOD_OPTIONS.find((o) => o.value === selectedPeriod)?.label})
            </h3>
            <span className={styles.chartSubtitle}>
              Identificação visual da sazonalidade de fluxo no período
            </span>
          </div>
        </div>
        <div className={styles.chartContent} aria-busy={loading}>
          {loading ? (
            <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
              <SkeletonShimmer variant="rect" width="100%" height={300} borderRadius="var(--radius-sm)" />
            </div>
          ) : kpis ? (
            <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={kpis.daily_sales_trend || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-interactive-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-interactive-primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--text-tertiary)"
                tickLine={false}
                style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
              />
              <YAxis
                stroke="var(--text-tertiary)"
                tickLine={false}
                style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickFormatter={(val) => `R$${val}`}
              />
              <Tooltip
                content={<CompactChartTooltip currencyFormat />}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="total_revenue"
                stroke="var(--color-interactive-primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
          ) : null}
        </div>
      </div>
    </div>
  );
};
