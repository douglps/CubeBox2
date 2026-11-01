/**
 * =============================================================================
 * GESTÃO DE ESTOQUE & HUB DE CATEGORIAS (FASE 7.4 / US-UI-05) - CUBEBOX ENTERPRISE
 * =============================================================================
 * Projeto: CubeBox Enterprise
 * Função no Negócio:
 *     Navegação em dois níveis:
 *     1. Hub de Cards por Categoria com métricas consolidadas (Valor Investido,
 *        Alertas de Ruptura e Itens Críticos) + Card Master da Loja.
 *     2. Drilldown com filtros rápidos por status de estoque, busca em tempo real
 *        e baixa contábil de quebras/avarias físicas.
 * =============================================================================
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  PackageX, 
  Layers, 
  ArrowLeft,
  Download
} from 'lucide-react';
import { fetchProducts, recordInventoryLoss } from '../services/api';
import { Product, InventoryLossCreate } from '../types';
import { DataTable, Column, BatchAction } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { TextInput } from '../components/common/TextInput';
import { BankingNumberInput } from '../components/common/BankingNumberInput/BankingNumberInput';
import { InlineAlert } from '../components/common/InlineAlert';
import styles from './InventoryView.module.css';

type StockStatusFilter = 'ALL' | 'CRITICAL' | 'ALERT' | 'HEALTHY';

export const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stockStatusFilter, setStockStatusFilter] = useState<StockStatusFilter>('ALL');

  // Estados para lançamento de perdas/avarias
  const [selectedProductForLoss, setSelectedProductForLoss] = useState<Product | null>(null);
  const [lossQty, setLossQty] = useState<number>(1);
  const [lossReason, setLossReason] = useState<InventoryLossCreate['reason']>('AVARIA');
  const [lossNotes, setLossNotes] = useState<string>('');
  const [isSubmittingLoss, setIsSubmittingLoss] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<{ message: string; isTransient: boolean } | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: any) {
      setErrorNotice({
        message: err.message || 'Sem conexão com o sistema. Verifique a rede.',
        isTransient: err.isTransient ?? true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Métricas agregadas por Categoria
  const categoriesSummary = useMemo(() => {
    const map = new Map<string, { count: number; totalValue: number; alerts: number; critical: number }>();

    products.forEach((p) => {
      const cat = p.category || 'Geral';
      const existing = map.get(cat) || { count: 0, totalValue: 0, alerts: 0, critical: 0 };
      existing.count += 1;
      existing.totalValue += p.current_stock * p.unit_cost;
      if (p.current_stock === 0) existing.critical += 1;
      else if (p.current_stock <= p.min_stock) existing.alerts += 1;
      map.set(cat, existing);
    });

    return Array.from(map.entries()).map(([name, metrics]) => ({
      name,
      ...metrics,
    }));
  }, [products]);

  // Métricas consolidadas da Loja Inteira (Card Master)
  const masterMetrics = useMemo(() => {
    let totalValue = 0;
    let alerts = 0;
    let critical = 0;
    products.forEach((p) => {
      totalValue += p.current_stock * p.unit_cost;
      if (p.current_stock === 0) critical += 1;
      else if (p.current_stock <= p.min_stock) alerts += 1;
    });
    return {
      count: products.length,
      totalValue,
      alerts,
      critical,
    };
  }, [products]);

  // Produtos filtrados no Drilldown
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'TODAS' || !selectedCategory
          ? true
          : p.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (stockStatusFilter === 'CRITICAL') matchesStatus = p.current_stock === 0;
      else if (stockStatusFilter === 'ALERT') matchesStatus = p.current_stock > 0 && p.current_stock <= p.min_stock;
      else if (stockStatusFilter === 'HEALTHY') matchesStatus = p.current_stock > p.min_stock;

      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [products, selectedCategory, searchTerm, stockStatusFilter]);

  const handleOpenLossModal = (product: Product) => {
    setSelectedProductForLoss(product);
    setLossQty(1);
    setLossReason('AVARIA');
    setLossNotes('');
  };

  const handleConfirmLoss = async () => {
    if (!selectedProductForLoss || lossQty <= 0) return;
    setIsSubmittingLoss(true);
    setStatusFeedback(null);

    try {
      await recordInventoryLoss({
        product_id: selectedProductForLoss.id,
        quantity: lossQty,
        reason: lossReason,
        notes: lossNotes,
      });

      setStatusFeedback({
        type: 'success',
        message: `Baixa de ${lossQty} un de ${selectedProductForLoss.name} registrada com sucesso!`,
      });

      setSelectedProductForLoss(null);
      loadData();
    } catch (err: any) {
      setStatusFeedback({
        type: 'error',
        message: err.message || 'Falha ao registrar perda de estoque.',
      });
    } finally {
      setIsSubmittingLoss(false);
    }
  };

  const handleExportStockReport = (selected: Product[], clearSelection: () => void) => {
    const headers = ['SKU', 'Produto', 'Categoria', 'Saldo Atual', 'Estoque Minimo', 'Custo Unitario', 'Valor Total', 'Status'];
    const rows = selected.map((p) => {
      const status = p.current_stock === 0 ? 'ZERADO' : p.current_stock <= p.min_stock ? 'RUPTURA_IMINENTE' : 'NORMAL';
      return [
        p.sku,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.current_stock,
        p.min_stock,
        p.unit_cost,
        p.current_stock * p.unit_cost,
        status,
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_estoque_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    clearSelection();
    setStatusFeedback({ type: 'success', message: `${selected.length} produtos de estoque exportados para CSV com sucesso!` });
  };

  const inventoryBatchActions: BatchAction<Product>[] = [
    {
      id: 'export-stock-csv',
      label: 'Exportar Relatório CSV',
      icon: <Download size={14} />,
      variant: 'primary',
      onExecute: handleExportStockReport,
    },
  ];

  const columns: Column<Product>[] = [
    {
      key: 'sku',
      header: 'SKU',
      width: '110px',
      sortable: true,
      render: (p) => <span className={styles.skuBadge}>{p.sku}</span>,
    },
    {
      key: 'name',
      header: 'Produto / Descrição',
      sortable: true,
      render: (p) => (
        <div>
          <div className={styles.productName}>{p.name}</div>
          <div className={styles.productCategory}>{p.category}</div>
        </div>
      ),
    },
    {
      key: 'current_stock',
      header: 'Saldo Atual',
      width: '120px',
      align: 'right',
      sortable: true,
      render: (p) => {
        const isCritical = p.current_stock === 0;
        const isAlert = p.current_stock <= p.min_stock;
        return (
          <span
            className={`${styles.stockNumber} ${isCritical ? styles.stockCritical : ''}`}
            style={{ color: isAlert && !isCritical ? '#eab308' : undefined }}
          >
            {p.current_stock} un
          </span>
        );
      },
    },
    {
      key: 'min_stock',
      header: 'Mínimo',
      width: '90px',
      align: 'right',
      sortable: true,
      render: (p) => `${p.min_stock} un`,
    },
    {
      key: 'invested_value',
      header: 'Valor em Estoque',
      width: '140px',
      align: 'right',
      sortable: true,
      sortFn: (a, b) => (a.current_stock * a.unit_cost) - (b.current_stock * b.unit_cost),
      render: (p) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            p.current_stock * p.unit_cost
          )}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status de Estoque',
      width: '140px',
      align: 'center',
      sortable: true,
      render: (p) => {
        if (p.current_stock === 0) return <Badge variant="danger">Zerado</Badge>;
        if (p.current_stock <= p.min_stock) return <Badge variant="warning">Ruptura Iminente</Badge>;
        return <Badge variant="success">Normal</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      width: '140px',
      align: 'right',
      render: (p) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleOpenLossModal(p)}
          icon={<PackageX size={14} />}
        >
          Lançar Perda
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Estoque</h2>
          <p className={styles.subtitle}>
            Auditoria física de inventário, valor investido por seção e registro formal de avarias.
          </p>
        </div>
      </div>

      {errorNotice && (
        <InlineAlert
          variant="error"
          message={errorNotice.message}
          onRetry={errorNotice.isTransient ? () => loadData() : undefined}
          onDismiss={() => setErrorNotice(null)}
        />
      )}

      {statusFeedback && (
        <InlineAlert
          variant={statusFeedback.type === 'error' ? 'error' : 'info'}
          message={statusFeedback.message}
          onDismiss={() => setStatusFeedback(null)}
        />
      )}

      {/* Nível 1: Visão Geral de Categorias */}
      {selectedCategory === null ? (
        <div className={styles.categoryGrid}>
          {/* Card Master: Todas as Categorias */}
          <div
            className={`${styles.categoryCard} ${styles.categoryCardMaster}`}
            onClick={() => setSelectedCategory('TODAS')}
          >
            <div className={styles.categoryCardHeader}>
              <div>
                <div className={styles.categoryCardTitle} style={{ fontSize: '18px' }}>
                  🏬 Todas as Categorias (Consolidado)
                </div>
                <div className={styles.categoryCardCount}>
                  Inventário completo com {masterMetrics.count} produtos cadastrados
                </div>
              </div>
              <Badge variant="info">Ver Tudo</Badge>
            </div>
            <div className={styles.categoryMetrics}>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Valor Investido</span>
                <span className={styles.metricValue}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    masterMetrics.totalValue
                  )}
                </span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Alertas de Ruptura</span>
                <span className={`${styles.metricValue} ${styles.metricValueWarning}`}>
                  {masterMetrics.alerts} SKUs
                </span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Itens Zerados</span>
                <span className={`${styles.metricValue} ${styles.metricValueCritical}`}>
                  {masterMetrics.critical} SKUs
                </span>
              </div>
            </div>
          </div>

          {/* Cards Individuais por Categoria */}
          {categoriesSummary.map((cat) => (
            <div
              key={cat.name}
              className={styles.categoryCard}
              onClick={() => setSelectedCategory(cat.name)}
            >
              <div className={styles.categoryCardHeader}>
                <div>
                  <div className={styles.categoryCardTitle}>{cat.name}</div>
                  <div className={styles.categoryCardCount}>{cat.count} produtos vinculados</div>
                </div>
                <Layers size={20} style={{ color: 'var(--color-interactive-primary)' }} />
              </div>
              <div className={styles.categoryMetrics}>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Valor Estoque</span>
                  <span className={styles.metricValue}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      cat.totalValue
                    )}
                  </span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Alertas</span>
                  <span className={`${styles.metricValue} ${cat.alerts > 0 ? styles.metricValueWarning : ''}`}>
                    {cat.alerts}
                  </span>
                </div>
                <div className={styles.metricItem}>
                  <span className={styles.metricLabel}>Zerados</span>
                  <span className={`${styles.metricValue} ${cat.critical > 0 ? styles.metricValueCritical : ''}`}>
                    {cat.critical}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Nível 2: Drilldown na Categoria Selecionada */
        <div>
          <div className={styles.drilldownBar}>
            <div className={styles.drilldownInfo}>
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTerm('');
                  setStockStatusFilter('ALL');
                }}
              >
                Voltar às Categorias
              </Button>
              <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                Seção: {selectedCategory === 'TODAS' ? 'Todas as Categorias' : selectedCategory} ({filteredProducts.length} itens)
              </span>
            </div>

            <div className={styles.quickFilters}>
              <button
                className={`${styles.quickFilterBtn} ${stockStatusFilter === 'ALL' ? styles.quickFilterBtnActive : ''}`}
                onClick={() => setStockStatusFilter('ALL')}
              >
                Todos ({products.filter(p => selectedCategory === 'TODAS' || p.category === selectedCategory).length})
              </button>
              <button
                className={`${styles.quickFilterBtn} ${stockStatusFilter === 'CRITICAL' ? styles.quickFilterBtnActive : ''}`}
                onClick={() => setStockStatusFilter('CRITICAL')}
              >
                Zerados ({products.filter(p => (selectedCategory === 'TODAS' || p.category === selectedCategory) && p.current_stock === 0).length})
              </button>
              <button
                className={`${styles.quickFilterBtn} ${stockStatusFilter === 'ALERT' ? styles.quickFilterBtnActive : ''}`}
                onClick={() => setStockStatusFilter('ALERT')}
              >
                Abaixo do Mínimo ({products.filter(p => (selectedCategory === 'TODAS' || p.category === selectedCategory) && p.current_stock > 0 && p.current_stock <= p.min_stock).length})
              </button>
              <button
                className={`${styles.quickFilterBtn} ${stockStatusFilter === 'HEALTHY' ? styles.quickFilterBtnActive : ''}`}
                onClick={() => setStockStatusFilter('HEALTHY')}
              >
                Saudáveis ({products.filter(p => (selectedCategory === 'TODAS' || p.category === selectedCategory) && p.current_stock > p.min_stock).length})
              </button>
            </div>

            <div className={styles.searchBox}>
              <SearchInput
                placeholder="Buscar SKU ou produto nesta categoria..."
                value={searchTerm}
                onChange={setSearchTerm}
                onClear={() => setSearchTerm('')}
              />
            </div>
          </div>

          <div className={styles.tableCard}>
            <DataTable<Product>
              columns={columns}
              data={filteredProducts}
              keyExtractor={(p) => p.id}
              batchActions={inventoryBatchActions}
              pagination={true}
              defaultPageSize={25}
              isLoading={isLoading}
              emptyMessage="Nenhum produto atende aos critérios deste filtro de categoria."
            />
          </div>
        </div>
      )}

      {/* Modal de Lançamento de Quebra/Avaria */}
      {selectedProductForLoss && (
        <Modal
          isOpen={!!selectedProductForLoss}
          onClose={() => setSelectedProductForLoss(null)}
          title="Registrar Baixa de Estoque"
        >
          <div className={styles.modalContent}>
            <div className={styles.modalInfoBanner}>
              <strong>{selectedProductForLoss.name}</strong>
              <span>
                SKU: {selectedProductForLoss.sku} • Estoque Atual: {selectedProductForLoss.current_stock} un
              </span>
            </div>

            <div className={styles.formRow}>
              <label className={styles.fieldLabel}>Quantidade</label>
              <BankingNumberInput
                mode="integer"
                value={lossQty}
                onChange={(val) => setLossQty(Math.max(1, Math.min(val, selectedProductForLoss.current_stock)))}
                max={selectedProductForLoss.current_stock}
              />
            </div>

            <div className={styles.formRow}>
              <label className={styles.fieldLabel}>Motivo da Perda</label>
              <select
                className={styles.selectInput}
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value as any)}
              >
                <option value="AVARIA">Avaria Física / Quebra</option>
                <option value="VENCIMENTO">Produto Vencido</option>
                <option value="FURTO">Furto / Extravio</option>
                <option value="OUTRO">Outro / Ajuste de Inventário</option>
              </select>
            </div>

            <div className={styles.formRow}>
              <label className={styles.fieldLabel}>Observações (opcional)</label>
              <TextInput
                placeholder="Ex: Garrafa trincada no recebimento..."
                value={lossNotes}
                onChange={(e) => setLossNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setSelectedProductForLoss(null)} disabled={isSubmittingLoss}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                icon={<PackageX size={16} />}
                onClick={handleConfirmLoss}
                isLoading={isSubmittingLoss}
              >
                Confirmar Baixa
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InventoryView;
