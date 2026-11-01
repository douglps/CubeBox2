/**
 * =============================================================================
 * PAINEL PREDITIVO & EXPLICABILIDADE DE IA (FASE 7.4 / US-UI-05) - CUBEBOX
 * =============================================================================
 * Projeto: CubeBox Enterprise
 * Função no Negócio:
 *     - Projeção de demanda com Random Forest (individual e consolidada geral).
 *     - Modal comparador multi-item (até 5 SKUs simultâneos).
 *     - Explicabilidade de IA (XAI) para Random Forest, Regressão Logística e DBSCAN.
 *     - Gestão e aprovação de ressuprimento com ordens de compra.
 * =============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  CheckCircle2,
  Truck,
  Box,
  BrainCircuit,
  Layers,
  Search,
  Check,
  X,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  fetchProducts,
  fetchForecastBatch,
  fetchReorderSuggestions,
  fetchPurchases,
  createPurchaseOrder,
  receivePurchaseOrder,
} from '../services/api';
import {
  Product,
  ReorderSuggestionItem,
  PurchaseOrder,
} from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { TextInput } from '../components/common/TextInput';
import { BankingNumberInput } from '../components/common/BankingNumberInput/BankingNumberInput';
import { XaiBadge } from '../components/common/XaiBadge/XaiBadge';
import { Spinner } from '../components/common/Spinner/Spinner';
import { CompactChartTooltip } from '../components/common/CompactChartTooltip';
import { InlineAlert } from '../components/common/InlineAlert';
import styles from './PredictiveView.module.css';

const MULTI_PALETTE = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const CONSOLIDATED_LINE_COLOR = '#38bdf8'; // Ciano / Azul vibrante destacado para a linha geral consolidada

// SKUs com maior precisão na relação acurácia x f1 score (Regressão Logística & Random Forest no dataset empírico):
// 1. SKU-DOC-003 (Bombom Serenata) - Acc: 82.7%, F1: 82.4% (Score: 82.5%)
// 2. SKU-DOC-002 (Trident Menta)   - Acc: 81.5%, F1: 81.5% (Score: 81.5%)
// 3. SKU-BEB-001 (Heineken 350ml)  - Acc: 79.2%, F1: 79.1% (Score: 79.1%)
// 4. SKU-ENG-001 (Red Bull Trop.)  - Acc: 76.9%, F1: 76.8% (Score: 76.8%)
// 5. SKU-BEB-003 (Brahma D. Malte) - Acc: 76.3%, F1: 76.1% (Score: 76.2%)
const DEFAULT_TOP5_ACC_F1_SKUS = [
  'SKU-DOC-003',
  'SKU-DOC-002',
  'SKU-BEB-001',
  'SKU-ENG-001',
  'SKU-BEB-003',
];

export const PredictiveView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  // IDs dos produtos selecionados para o gráfico (vazio por padrão quando em modo Geral Consolidado)
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  // Modo de visualização: 'consolidated' (padrão loja) | 'individual' (produtos específicos)
  const [viewMode, setViewMode] = useState<'consolidated' | 'individual'>('consolidated');
  const [chartData, setChartData] = useState<Record<string, any>[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);

  // Destaque de Série por Hover (Redução de Carga Cognitiva & Focus State)
  const [hoveredSeriesKey, setHoveredSeriesKey] = useState<string | null>(null);

  // Modal de Seleção de Produtos em Cards
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [cardSearchTerm, setCardSearchTerm] = useState('');

  const [suggestions, setSuggestions] = useState<ReorderSuggestionItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'orders'>('suggestions');

  // Modal de Compra
  const [purchaseModalItem, setPurchaseModalItem] = useState<ReorderSuggestionItem | null>(null);
  const [orderQty, setOrderQty] = useState<number>(0);
  const [supplierName, setSupplierName] = useState('Distribuidora Central SP');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [processingProductIds, setProcessingProductIds] = useState<number[]>([]);
  const [errorNotice, setErrorNotice] = useState<{ message: string; isTransient: boolean } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Função auxiliar para calcular data real futura formatada (ex: "Qua, 29/10")
  const getFutureDateLabel = (dayOffset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const dayMonth = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dayMonth}`;
  };

  const loadData = async () => {
    setIsLoadingInitial(true);
    setErrorNotice(null);
    try {
      const [prods, suggs, purch] = await Promise.all([
        fetchProducts(),
        fetchReorderSuggestions(),
        fetchPurchases(),
      ]);
      setProducts(prods);
      setSuggestions(suggs);
      setPurchases(purch);
    } catch (err: any) {
      setErrorNotice({
        message: err.message || 'Sem conexão com o sistema preditivo. Verifique a rede.',
        isTransient: err.isTransient ?? true,
      });
    } finally {
      setIsLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recalcula o gráfico separando estritamente: Geral Consolidado (padrão) vs Produtos Selecionados
  useEffect(() => {
    if (viewMode === 'consolidated') {
      // Modo Padrão: Apenas linha do Geral Consolidado da Loja
      const totalUnits = suggestions.reduce((acc, s) => acc + s.forecasted_demand_7d, 0);
      const dailyAverage = totalUnits / 7;
      const days = [1, 2, 3, 4, 5, 6, 7].map((day) => {
        const factor = day === 6 || day === 7 ? 1.4 : 0.85;
        return {
          day_offset: day,
          dateLabel: getFutureDateLabel(day),
          'Geral Consolidado': Math.round(dailyAverage * factor),
        };
      });
      setChartData(days);
      return;
    }

    // Modo Individual: Apenas produtos selecionados
    if (selectedProductIds.length === 0) {
      setChartData([]);
      return;
    }

    setIsLoadingChart(true);
    fetchForecastBatch(selectedProductIds, 7)
      .then((forecasts) => {
        const daysMap: Record<number, Record<string, any>> = {};
        for (let d = 1; d <= 7; d++) {
          daysMap[d] = {
            day_offset: d,
            dateLabel: getFutureDateLabel(d),
          };
        }

        forecasts.forEach((f) => {
          if (!f) return;
          const prod = products.find((p) => p.sku === f.sku || p.name === f.product_name);
          const seriesKey = prod ? prod.name : f.product_name;
          f.daily_forecast.forEach((df) => {
            if (daysMap[df.day_offset]) {
              daysMap[df.day_offset][seriesKey] = df.forecasted_units;
            }
          });
        });

        setChartData(Object.values(daysMap));
      })
      .finally(() => setIsLoadingChart(false));
  }, [viewMode, selectedProductIds, suggestions, products]);

  // Alterna seleção de produto no modal de cards
  const toggleProductCardSelection = (prodId: number) => {
    setViewMode('individual');
    if (selectedProductIds.includes(prodId)) {
      if (selectedProductIds.length > 1) {
        setSelectedProductIds(selectedProductIds.filter((id) => id !== prodId));
      } else {
        // Se desmarcar o último, volta para o padrão Geral Consolidado
        handleSelectConsolidated();
      }
    } else {
      setSelectedProductIds([...selectedProductIds, prodId]);
    }
  };

  const handleSelectAllProducts = () => {
    setViewMode('individual');
    setSelectedProductIds(products.map((p) => p.id));
  };

  const handleSelectTop5Precision = () => {
    setViewMode('individual');
    const top5 = products.filter((p) => DEFAULT_TOP5_ACC_F1_SKUS.includes(p.sku));
    if (top5.length > 0) {
      setSelectedProductIds(top5.map((p) => p.id));
    } else {
      setSelectedProductIds(products.slice(0, 5).map((p) => p.id));
    }
    setIsSelectorModalOpen(false);
  };

  const handleDeselectAllProducts = () => {
    handleSelectConsolidated();
  };

  const handleSelectConsolidated = () => {
    setViewMode('consolidated');
    setSelectedProductIds([]);
    setIsSelectorModalOpen(false);
  };

  const handleOpenPurchaseModal = (item: ReorderSuggestionItem) => {
    if (processingProductIds.includes(item.product_id)) return;
    setPurchaseModalItem(item);
    setOrderQty(item.suggested_reorder_qty > 0 ? item.suggested_reorder_qty : 20);
    setSupplierName('Distribuidora Central SP');
  };

  const handleConfirmPurchaseOrder = async () => {
    if (!purchaseModalItem || orderQty <= 0 || isSubmittingOrder) return;
    const targetProductId = purchaseModalItem.product_id;
    const targetProductName = purchaseModalItem.product_name;
    const qty = orderQty;
    const supplier = supplierName;

    setIsSubmittingOrder(true);
    setFeedback(null);
    setProcessingProductIds((prev) => (prev.includes(targetProductId) ? prev : [...prev, targetProductId]));

    try {
      await createPurchaseOrder({
        product_id: targetProductId,
        quantity: qty,
        supplier_name: supplier,
      });

      setFeedback({
        type: 'success',
        message: `Pedido de compra de ${qty} un. para ${targetProductName} emitido com status PENDENTE.`,
      });
      setPurchaseModalItem(null);
      // Atualiza pedidos, estoque e sugestões recalculadas enquanto a linha do item exibe spinner de load
      const [updatedPurchases, updatedProds, updatedSuggs] = await Promise.all([
        fetchPurchases(),
        fetchProducts(),
        fetchReorderSuggestions(),
      ]);
      setPurchases(updatedPurchases);
      setProducts(updatedProds);
      setSuggestions(updatedSuggs);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: (err as Error).message || 'Erro ao emitir ordem de compra.',
      });
    } finally {
      setIsSubmittingOrder(false);
      setProcessingProductIds((prev) => prev.filter((id) => id !== targetProductId));
    }
  };

  const handleReceiveOrder = async (orderId: number) => {
    setFeedback(null);
    try {
      await receivePurchaseOrder(orderId);
      setFeedback({
        type: 'success',
        message: `Recebimento confirmado! As unidades foram integradas e creditadas no estoque físico.`,
      });
      // Atualiza pedidos, produtos e sugestões sem disparar skeleton shimmer bloqueante
      const [updatedPurchases, updatedProds, updatedSuggs] = await Promise.all([
        fetchPurchases(),
        fetchProducts(),
        fetchReorderSuggestions(),
      ]);
      setPurchases(updatedPurchases);
      setProducts(updatedProds);
      setSuggestions(updatedSuggs);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: (err as Error).message || 'Erro ao confirmar entrega física.',
      });
    }
  };

  const suggestionColumns: Column<ReorderSuggestionItem>[] = [
    {
      key: 'sku',
      header: 'SKU',
      width: '100px',
      sortable: true,
      render: (item) => <span className={styles.skuBadge}>{item.sku}</span>,
    },
    {
      key: 'product_name',
      header: 'Produto / Categoria',
      sortable: true,
      render: (item) => {
        const isProcessing = processingProductIds.includes(item.product_id);
        return (
          <div className={styles.productCell}>
            <div className={styles.productNameRow}>
              <div className={styles.productName}>{item.product_name}</div>
              {isProcessing && (
                <span
                  className={styles.processingBadge}
                  role="status"
                  aria-live="polite"
                  aria-label={`Processando aprovação de compra para ${item.product_name}`}
                >
                  <Spinner size="sm" variant="primary" label="Emitindo ordem de compra" />
                  <span>Processando...</span>
                </span>
              )}
            </div>
            <div className={styles.productCategory}>{item.category}</div>
          </div>
        );
      },
    },
    {
      key: 'current_stock',
      header: 'Estoque Atual',
      align: 'center',
      sortable: true,
      render: (item) => <span className="tabular">{item.current_stock} un.</span>,
    },
    {
      key: 'forecasted_demand_7d',
      header: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          Demanda 7d
          <XaiBadge modelType="RANDOM_FOREST" size="sm" label="RF" alignTooltip="center" />
        </span>
      ),
      align: 'center',
      sortable: true,
      render: (item) => (
        <span className="tabular" style={{ fontWeight: 600 }}>
          {item.forecasted_demand_7d} un.
        </span>
      ),
    },
    {
      key: 'suggested_reorder_qty',
      header: 'Sugestão Compra',
      align: 'center',
      sortable: true,
      render: (item) => (
        <span
          className={`tabular ${
            item.suggested_reorder_qty > 0 ? styles.reorderHighlight : ''
          }`}
        >
          {item.suggested_reorder_qty} un.
        </span>
      ),
    },
    {
      key: 'stockout_risk_level',
      header: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          Risco Ruptura
          <XaiBadge modelType="LOGISTIC_REGRESSION" size="sm" label="LogReg" alignTooltip="center" />
        </span>
      ),
      align: 'center',
      sortable: true,
      render: (item) => {
        let variant: 'danger' | 'warning' | 'success' = 'success';
        if (item.stockout_risk_level === 'ALTO') variant = 'danger';
        if (item.stockout_risk_level === 'MEDIO') variant = 'warning';

        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Badge
              label={`${item.stockout_risk_level} (${item.stockout_probability_pct}%)`}
              variant={variant}
              size="sm"
            />
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ação Recomendada',
      align: 'right',
      render: (item) => {
        const isProcessing = processingProductIds.includes(item.product_id);
        return (
          <Button
            variant={item.suggested_reorder_qty > 0 ? 'primary' : 'secondary'}
            size="sm"
            icon={isProcessing ? undefined : <ShoppingCart size={14} />}
            loading={isProcessing}
            loadingText="Processando..."
            disabled={isProcessing}
            onClick={() => handleOpenPurchaseModal(item)}
            title={isProcessing ? 'Ordem de compra em processamento...' : undefined}
          >
            {item.suggested_reorder_qty > 0 ? 'Aprovar Compra' : 'Comprar Extra'}
          </Button>
        );
      },
    },
  ];

  const purchaseColumns: Column<PurchaseOrder>[] = [
    {
      key: 'order_number',
      header: 'Pedido #',
      sortable: true,
      render: (po) => <span className={styles.skuBadge}>{po.order_number}</span>,
    },
    {
      key: 'supplier_name',
      header: 'Fornecedor',
      sortable: true,
      render: (po) => <span>{po.supplier_name}</span>,
    },
    {
      key: 'quantity',
      header: 'Qtd Solicitada',
      align: 'center',
      sortable: true,
      render: (po) => <span className="tabular">{po.quantity} un.</span>,
    },
    {
      key: 'status',
      header: 'Status da Ordem',
      align: 'center',
      sortable: true,
      render: (po) => (
        <Badge
          label={po.status === 'PENDENTE' ? 'Aguardando Entrega' : 'Recebido / No Estoque'}
          variant={po.status === 'PENDENTE' ? 'warning' : 'success'}
          size="sm"
        />
      ),
    },
    {
      key: 'actions',
      header: 'Recebimento Físico',
      align: 'right',
      render: (po) =>
        po.status === 'PENDENTE' ? (
          <Button
            variant="success"
            size="sm"
            icon={<Truck size={14} />}
            onClick={() => handleReceiveOrder(po.id)}
          >
            Confirmar Entrega
          </Button>
        ) : (
          <span className={styles.receivedNotice}>
            <CheckCircle2 size={14} /> Entregue
          </span>
        ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Top Section: Forecast Graph & SKU Selector */}
      <div className={styles.forecastCard}>
        <div className={styles.forecastHeader}>
          <div className={styles.forecastTitleBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div className={styles.aiBadge}>
                <BrainCircuit size={16} />
                <span>Machine Learning Serving</span>
              </div>
              <XaiBadge modelType="RANDOM_FOREST" confidence={94} />
            </div>
            <h2 className={styles.forecastTitle}>
              Projeção Preditiva de Demanda (7 Dias)
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className={styles.skuSelector}>
              <span className={styles.selectLabel}>Produtos em Análise:</span>
              <button
                type="button"
                className={styles.productSelectorBtn}
                onClick={() => setIsSelectorModalOpen(true)}
              >
                <div className={styles.productSelectorLabel}>
                  <Layers size={16} color="var(--color-interactive-primary)" />
                  <span>
                    {viewMode === 'consolidated'
                      ? 'Geral Consolidado (Padrão)'
                      : selectedProductIds.length === 5 &&
                        DEFAULT_TOP5_ACC_F1_SKUS.every((sku) =>
                          products.some((p) => p.sku === sku && selectedProductIds.includes(p.id))
                        )
                      ? 'Top 5 Precisão (Acurácia x F1)'
                      : selectedProductIds.length === 1
                      ? products.find((p) => p.id === selectedProductIds[0])?.name || '1 Produto Selecionado'
                      : `${selectedProductIds.length} Produtos Selecionados`}
                  </span>
                </div>
                <span className={styles.productSelectorBadge}>
                  {viewMode === 'consolidated' ? 'GERAL' : selectedProductIds.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tags de Séries Ativas no Gráfico */}
        <div className={styles.selectedTagsRow}>
          {viewMode === 'consolidated' ? (
            <div
              className={`${styles.selectedTagItem} ${styles.consolidatedTag} ${
                hoveredSeriesKey === 'Geral Consolidado' ? styles.selectedTagHighlighted : ''
              }`}
              onMouseEnter={() => setHoveredSeriesKey('Geral Consolidado')}
              onMouseLeave={() => setHoveredSeriesKey(null)}
              title="Linha do Geral Consolidado da Loja (soma agregada de demanda de todos os produtos)"
            >
              <span
                className={styles.selectedTagColor}
                style={{ backgroundColor: CONSOLIDATED_LINE_COLOR }}
              />
              <strong>Geral Consolidado (Loja Toda)</strong>
            </div>
          ) : (
            selectedProductIds.map((pId, idx) => {
              const p = products.find((item) => item.id === pId);
              if (!p) return null;
              const color = MULTI_PALETTE[idx % MULTI_PALETTE.length];
              const isHovered = hoveredSeriesKey === p.name;
              const isAnyHovered = hoveredSeriesKey !== null;

              return (
                <div
                  key={p.id}
                  className={`${styles.selectedTagItem} ${
                    isHovered ? styles.selectedTagHighlighted : isAnyHovered ? styles.selectedTagDimmed : ''
                  }`}
                  onMouseEnter={() => setHoveredSeriesKey(p.name)}
                  onMouseLeave={() => setHoveredSeriesKey(null)}
                  title={`Focar na linha preditiva de ${p.name}`}
                >
                  <span className={styles.selectedTagColor} style={{ backgroundColor: color }} />
                  <span>{p.name}</span>
                  {selectedProductIds.length > 1 && (
                    <button
                      type="button"
                      className={styles.selectedTagRemove}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProductCardSelection(p.id);
                      }}
                      title="Remover do gráfico"
                      aria-label={`Remover ${p.name}`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })
          )}

          {viewMode === 'individual' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSelectConsolidated}
              title="Voltar ao modo padrão com apenas o Geral Consolidado"
            >
              Voltar ao Geral Consolidado
            </Button>
          )}
        </div>

        {/* Gráfico Preditivo com Datas Futuras Reais e Altura Dinâmica para Evitar Compressão */}
        {(() => {
          // Altura dinâmica: 280px para consolidado ou gradual para múltiplos itens
          const seriesCount = viewMode === 'consolidated' ? 1 : selectedProductIds.length;
          const dynamicChartHeight = Math.min(560, Math.max(280, 260 + seriesCount * 26));

          return (
            <div className={styles.chartWrapper}>
              <div className={styles.forecastMetrics}>
                <div className={styles.metricItem}>
                  <span>Modo Atual:</span>
                  <strong>
                    {viewMode === 'consolidated'
                      ? 'Geral Consolidado da Loja (Projeção Agregada 7 Dias)'
                      : `${selectedProductIds.length} SKU(s) em Análise Comparativa`}
                  </strong>
                </div>
                <div className={styles.metricItem}>
                  <span>Modelo em Produção:</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <code>RandomForestRegressor (Ensemble Serializado)</code>
                    <XaiBadge modelType="RANDOM_FOREST" size="sm" alignTooltip="right" />
                  </div>
                </div>
              </div>

              {isLoadingChart ? (
                <div
                  className={styles.chartSkeletonContainer}
                  style={{ height: dynamicChartHeight }}
                  role="status"
                  aria-busy="true"
                  aria-label="Calculando projeções em tempo real"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Spinner size="sm" variant="primary" />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Carregando modelo Random Forest...
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      Horizonte 7 Dias
                    </span>
                  </div>
                  <div className={styles.chartSkeletonWave}>
                    {[40, 65, 50, 85, 60, 92, 75].map((val, idx) => (
                      <div
                        key={idx}
                        className={styles.chartSkeletonColumn}
                        style={{ height: `${val}%`, animationDelay: `${idx * 0.12}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={dynamicChartHeight}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis
                      dataKey="dateLabel"
                      stroke="var(--text-tertiary)"
                      tickLine={false}
                      style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    />
                    <YAxis
                      stroke="var(--text-tertiary)"
                      tickLine={false}
                      style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                    />
                    <Tooltip
                      content={
                        <CompactChartTooltip
                          unit="un."
                          maxVisibleItems={5}
                          hoveredSeriesKey={hoveredSeriesKey}
                        />
                      }
                      isAnimationActive={false}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '10px', fontSize: '12px', cursor: 'pointer' }}
                      onMouseEnter={(o) => {
                        if (o && o.dataKey) {
                          setHoveredSeriesKey(String(o.dataKey));
                        }
                      }}
                      onMouseLeave={() => setHoveredSeriesKey(null)}
                    />
                    {viewMode === 'consolidated' ? (
                      <Line
                        type="monotone"
                        dataKey="Geral Consolidado"
                        name="Geral Consolidado"
                        stroke={CONSOLIDATED_LINE_COLOR}
                        strokeWidth={hoveredSeriesKey === 'Geral Consolidado' ? 4 : 3}
                        dot={{ r: 4, fill: CONSOLIDATED_LINE_COLOR }}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                        onMouseEnter={() => setHoveredSeriesKey('Geral Consolidado')}
                        onMouseLeave={() => setHoveredSeriesKey(null)}
                      />
                    ) : (
                      selectedProductIds.map((pId, idx) => {
                        const prod = products.find((p) => p.id === pId);
                        const seriesKey = prod ? prod.name : `Produto ${pId}`;
                        const color = MULTI_PALETTE[idx % MULTI_PALETTE.length];
                        const isHovered = hoveredSeriesKey === seriesKey;
                        const isAnyHovered = hoveredSeriesKey !== null;

                        return (
                          <Line
                            key={pId}
                            type="monotone"
                            dataKey={seriesKey}
                            name={seriesKey}
                            stroke={color}
                            strokeWidth={isHovered ? 4 : isAnyHovered ? 1.5 : 2.5}
                            strokeOpacity={isHovered ? 1 : isAnyHovered ? 0.25 : 1}
                            dot={{
                              r: isHovered ? 6 : 4,
                              fill: color,
                              fillOpacity: isHovered ? 1 : isAnyHovered ? 0.3 : 1,
                            }}
                            activeDot={{
                              r: 7,
                              stroke: '#fff',
                              strokeWidth: 2,
                            }}
                            onMouseEnter={() => setHoveredSeriesKey(seriesKey)}
                            onMouseLeave={() => setHoveredSeriesKey(null)}
                          />
                        );
                      })
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Nenhum produto selecionado para projeção.
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {errorNotice && (
        <InlineAlert
          variant="error"
          message={errorNotice.message}
          onRetry={errorNotice.isTransient ? () => loadData() : undefined}
          onDismiss={() => setErrorNotice(null)}
        />
      )}

      {feedback && (
        <InlineAlert
          variant={feedback.type === 'error' ? 'error' : 'info'}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Tabs: Reorder Suggestions vs Purchase Orders History */}
      <div className={styles.tabsSection}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'suggestions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            <TrendingUp size={16} />
            <span>Sugestões de Compra ({suggestions.filter((s) => s.suggested_reorder_qty > 0).length})</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Box size={16} />
            <span>Pedidos de Compra ({purchases.length})</span>
          </button>
        </div>

        <div className={styles.tabContent}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Modelos de IA:</span>
            <XaiBadge modelType="LOGISTIC_REGRESSION" confidence={94} />
            <XaiBadge modelType="DBSCAN" confidence={88} />
          </div>

          {activeTab === 'suggestions' ? (
            <DataTable
              columns={suggestionColumns}
              data={suggestions.filter((s) => s.suggested_reorder_qty > 0)}
              keyExtractor={(s) => s.product_id}
              pagination={true}
              defaultPageSize={10}
              isLoading={isLoadingInitial}
              emptyMessage="Nenhuma sugestão de reposição no momento. Todos os estoques estão protegidos!"
            />
          ) : (
            <DataTable
              columns={purchaseColumns}
              data={purchases}
              keyExtractor={(p) => p.id}
              pagination={true}
              defaultPageSize={10}
              isLoading={isLoadingInitial}
              emptyMessage="Nenhuma ordem de compra cadastrada."
            />
          )}
        </div>
      </div>

      {/* Modal com Cards Selecionáveis para Escolha de Produtos (1 ou Muitos) */}
      {isSelectorModalOpen && (
        <Modal
          isOpen={isSelectorModalOpen}
          onClose={() => setIsSelectorModalOpen(false)}
          title="Selecionar Produtos para Projeção Preditiva (Machine Learning)"
          width="82vw"
          maxWidth="1560px"
          height="82vh"
          maxHeight="880px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {viewMode === 'consolidated' ? (
                  <strong>🏬 Modo Geral Consolidado (Padrão) ativo</strong>
                ) : (
                  <span>
                    <strong>{selectedProductIds.length}</strong> produto(s) marcado(s) para exibição individual
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" onClick={() => setIsSelectorModalOpen(false)}>
                  Concluir e Exibir Gráfico
                </Button>
              </div>
            </div>
          }
        >
          <div className={styles.cardsModalBody}>
            {/* Header com Busca e Filtros */}
            <div className={styles.cardsModalHeader}>
              <div className={styles.cardsSearchInput}>
                <TextInput
                  placeholder="Filtrar por nome do produto ou SKU..."
                  value={cardSearchTerm}
                  onChange={(e) => setCardSearchTerm(e.target.value)}
                  leftIcon={<Search size={14} />}
                />
              </div>

              <div className={styles.cardsSelectionActions}>
                <Button
                  size="sm"
                  variant={viewMode === 'consolidated' ? 'primary' : 'secondary'}
                  onClick={handleSelectConsolidated}
                  title="Restaurar padrão: exibir apenas a projeção do Geral Consolidado da loja"
                >
                  🏬 Geral Consolidado (Padrão)
                </Button>
                <Button
                  size="sm"
                  variant={
                    viewMode === 'individual' &&
                    selectedProductIds.length === 5 &&
                    DEFAULT_TOP5_ACC_F1_SKUS.every((sku) =>
                      products.some((p) => p.sku === sku && selectedProductIds.includes(p.id))
                    )
                      ? 'primary'
                      : 'secondary'
                  }
                  onClick={handleSelectTop5Precision}
                  title="Selecionar os 5 produtos de maior precisão (Acurácia x F1 Score)"
                >
                  ⭐ Top 5 Precisão
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSelectAllProducts}
                  title="Selecionar todos os cards individuais"
                >
                  Marcar Todos
                </Button>
                {viewMode === 'individual' && selectedProductIds.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDeselectAllProducts}
                    title="Desmarcar seleção e voltar ao Geral Consolidado"
                  >
                    Limpar Seleção
                  </Button>
                )}
              </div>
            </div>

            {/* Grid com Cards Selecionáveis */}
            <div className={styles.cardsGrid}>
              {products
                .filter((p) => {
                  const matchSearch =
                    !cardSearchTerm.trim() ||
                    p.name.toLowerCase().includes(cardSearchTerm.toLowerCase()) ||
                    p.sku.toLowerCase().includes(cardSearchTerm.toLowerCase());
                  return matchSearch;
                })
                .map((p) => {
                  const isSelected = viewMode === 'individual' && selectedProductIds.includes(p.id);
                  const isTop5Precision = DEFAULT_TOP5_ACC_F1_SKUS.includes(p.sku);
                  const paletteIdx = selectedProductIds.indexOf(p.id);
                  const productColor =
                    paletteIdx !== -1 ? MULTI_PALETTE[paletteIdx % MULTI_PALETTE.length] : undefined;

                  return (
                    <div
                      key={p.id}
                      className={`${styles.productCardSelectable} ${
                        isSelected ? styles.productCardActive : ''
                      }`}
                      onClick={() => toggleProductCardSelection(p.id)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleProductCardSelection(p.id);
                        }
                      }}
                    >
                      <div className={styles.cardHead}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className={styles.cardSku}>{p.sku}</span>
                          {isTop5Precision && (
                            <span
                              style={{
                                fontSize: '9px',
                                padding: '1px 4px',
                                borderRadius: '4px',
                                background: 'rgba(56, 189, 248, 0.15)',
                                color: '#38bdf8',
                                fontWeight: 600,
                              }}
                              title="Produto de alta precisão (Acurácia x F1 Score)"
                            >
                              Top Precisão
                            </span>
                          )}
                        </div>
                        <div
                          className={styles.cardCheck}
                          style={isSelected && productColor ? { backgroundColor: productColor, borderColor: productColor } : undefined}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>
                      </div>

                      <div className={styles.cardName}>{p.name}</div>
                      <div className={styles.cardCategory}>{p.category}</div>

                      <div className={styles.cardFooter}>
                        <span className={styles.cardStock}>Estoque: {p.current_stock} un.</span>
                        <Badge
                          label={p.status === 'ATIVO' ? 'Ativo' : 'Congelado'}
                          variant={p.status === 'ATIVO' ? 'success' : 'neutral'}
                          size="sm"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </Modal>
      )}

      {/* Purchase Modal */}
      <Modal
        isOpen={!!purchaseModalItem}
        onClose={() => {
          if (!isSubmittingOrder) {
            setPurchaseModalItem(null);
          }
        }}
        title="Aprovar Emissão de Pedido de Compra"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setPurchaseModalItem(null)}
              disabled={isSubmittingOrder}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              loading={isSubmittingOrder}
              loadingText="Emitindo Ordem..."
              disabled={
                isSubmittingOrder ||
                orderQty <= 0 ||
                (purchaseModalItem ? processingProductIds.includes(purchaseModalItem.product_id) : false)
              }
              onClick={handleConfirmPurchaseOrder}
            >
              Confirmar Emissão da Ordem
            </Button>
          </>
        }
      >
        {purchaseModalItem && (
          <div className={styles.modalBody}>
            <div className={styles.orderSummary}>
              <strong>{purchaseModalItem.product_name}</strong>
              <div className={styles.orderGridInfo}>
                <span>Estoque Atual: {purchaseModalItem.current_stock} un.</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Demanda Projetada: {purchaseModalItem.forecasted_demand_7d} un.
                  <XaiBadge modelType="RANDOM_FOREST" size="sm" label="RF" alignTooltip="right" />
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Risco: {purchaseModalItem.stockout_risk_level} ({purchaseModalItem.stockout_probability_pct}%)
                  <XaiBadge modelType="LOGISTIC_REGRESSION" size="sm" label="LogReg" alignTooltip="right" />
                </span>
              </div>
            </div>

            <BankingNumberInput
              mode="integer"
              suffix="un"
              min={1}
              disabled={isSubmittingOrder}
              label="Quantidade do Pedido de Compra (Unidades)"
              value={orderQty}
              onChange={(val) => setOrderQty(Math.max(1, val))}
            />

            <TextInput
              label="Nome do Fornecedor / Distribuidor"
              value={supplierName}
              disabled={isSubmittingOrder}
              onChange={(e) => setSupplierName(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PredictiveView;
