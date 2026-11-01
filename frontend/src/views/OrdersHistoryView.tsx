/**
 * =============================================================================
 * HISTÓRICO DE PEDIDOS & CUPOM 80MM (FASE 7.4 / US-UI-05) - CUBEBOX ENTERPRISE
 * =============================================================================
 * Projeto: CubeBox Enterprise
 * Função no Negócio:
 *     Audita saídas de balcão, permite reemissão de cupom térmico (80mm) para
 *     o cliente e realiza cancelamento com estorno atômico de estoque.
 * =============================================================================
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Printer,
  RotateCcw, 
  AlertTriangle, 
  Download
} from 'lucide-react';
import { fetchSales, cancelSale } from '../services/api';
import { SaleResponse } from '../types';
import { DataTable, Column, BatchAction } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { ReceiptModal } from '../components/common/ReceiptModal';
import { InlineAlert } from '../components/common/InlineAlert';
import styles from './OrdersHistoryView.module.css';

export const OrdersHistoryView: React.FC = () => {
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Estados de Modais
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState<SaleResponse | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<SaleResponse | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<{ message: string; isTransient: boolean } | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadSalesHistory = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const data = await fetchSales(100);
      setSales(data);
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
    loadSalesHistory();
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        s.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.customer_nome && s.customer_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.items.some((it) => it.product?.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' || s.status === statusFilter;

      const pmUpper = (s.payment_method || '').toUpperCase();
      let matchesPayment = paymentFilter === 'ALL';
      if (!matchesPayment) {
        if (paymentFilter === 'MULTIPLO') {
          matchesPayment = pmUpper.startsWith('MÚLTIPLO') || pmUpper.startsWith('MULTIPLO');
        } else if (paymentFilter === 'PIX') {
          matchesPayment = pmUpper === 'PIX';
        } else if (paymentFilter === 'CREDITO') {
          matchesPayment = pmUpper.includes('CRÉDITO') || pmUpper.includes('CREDITO');
        } else if (paymentFilter === 'DEBITO') {
          matchesPayment = pmUpper.includes('DÉBITO') || pmUpper.includes('DEBITO');
        } else if (paymentFilter === 'DINHEIRO') {
          matchesPayment = pmUpper.includes('DINHEIRO');
        } else if (paymentFilter === 'VR_VA') {
          matchesPayment = pmUpper.includes('VALE') || pmUpper.includes('REFEI') || pmUpper.includes('VR');
        } else if (paymentFilter === 'CARTEIRA_DIGITAL') {
          matchesPayment = pmUpper.includes('CARTEIRA') || pmUpper.includes('DIGITAL');
        } else {
          matchesPayment = s.payment_method === paymentFilter;
        }
      }

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [sales, searchTerm, statusFilter, paymentFilter]);

  const handleConfirmCancel = async () => {
    if (!saleToCancel) return;
    setIsCancelling(true);
    setActionFeedback(null);
    try {
      await cancelSale(saleToCancel.id);
      setActionFeedback({
        type: 'success',
        message: `Pedido ${saleToCancel.order_number} cancelado e itens estornados ao estoque!`,
      });
      setSaleToCancel(null);
      await loadSalesHistory();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Falha ao estornar pedido de venda.',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleExportSales = (selected: SaleResponse[], clearSelection: () => void) => {
    const headers = ['Pedido', 'Data', 'Cliente', 'CPF Nota', 'Modalidade', 'Pagamento', 'Itens Qtd', 'Total Liquido', 'Status'];
    const rows = selected.map((s) => [
      `"${s.order_number}"`,
      `"${s.sale_date}"`,
      `"${(s.customer_nome || 'Consumidor Final').replace(/"/g, '""')}"`,
      `"${s.cpf_nota || ''}"`,
      s.tipo_entrega || 'BALCAO',
      s.payment_method,
      s.items.reduce((acc, it) => acc + it.quantity, 0),
      s.net_total,
      s.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vendas_cubebox_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    clearSelection();
    setActionFeedback({ type: 'success', message: `${selected.length} vendas exportadas para CSV com sucesso!` });
  };

  const salesBatchActions: BatchAction<SaleResponse>[] = [
    {
      id: 'export-sales-csv',
      label: 'Exportar Vendas CSV',
      icon: <Download size={14} />,
      variant: 'primary',
      onExecute: handleExportSales,
    },
  ];

  const columns: Column<SaleResponse>[] = [
    {
      key: 'order_number',
      header: 'Pedido',
      width: '160px',
      sortable: true,
      render: (s) => (
        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
          {s.order_number}
        </span>
      ),
    },
    {
      key: 'sale_date',
      header: 'Data / Hora',
      width: '150px',
      sortable: true,
      render: (s) => (
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {new Date(s.sale_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      ),
    },
    {
      key: 'customer_nome',
      header: 'Cliente / Modalidade',
      sortable: true,
      render: (s) => (
        <div>
          <span style={{ color: s.customer_nome ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {s.customer_nome || 'Consumidor Final'}
          </span>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {s.tipo_entrega === 'ENTREGA' ? '🛵 Entrega' : '🏪 Balcão'}
            {s.cpf_nota ? ` • CPF: ${s.cpf_nota}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'payment_method',
      header: 'Pagamento',
      width: '180px',
      sortable: true,
      render: (s) => {
        const labels: Record<string, string> = {
          DINHEIRO: 'Dinheiro',
          CREDITO: 'Crédito',
          DEBITO: 'Débito',
          PIX: 'PIX',
          'CARTAO CREDITO': 'Crédito',
          'CARTAO DEBITO': 'Débito',
          'CARTÃO CRÉDITO': 'Crédito',
          'CARTÃO DÉBITO': 'Débito',
          'VALE REFEICAO': 'VR/VA',
          'VALE ALIMENTACAO': 'VR/VA',
          'VALE REFEIÇÃO': 'VR/VA',
          'VALE ALIMENTAÇÃO': 'VR/VA',
          'VALE REFEICAO / ALIMENTACAO': 'VR/VA',
          'VALE REFEIÇÃO / ALIMENTAÇÃO': 'VR/VA',
          'CARTEIRA DIGITAL': 'Carteira Digital',
        };

        const raw = s.payment_method?.trim() || '';
        const isMultiple = raw.toUpperCase().startsWith('MÚLTIPLO') || raw.toUpperCase().startsWith('MULTIPLO');

        if (isMultiple) {
          // Extrai conteúdo mais externo de MÚLTIPLO (...)
          const outerContent = raw.slice(raw.indexOf('(') + 1, raw.lastIndexOf(')'));
          const types: string[] = [];

          if (outerContent) {
            // Divide as parcelas por " + "
            const parts = outerContent.split(/\s+\+\s+/);
            parts.forEach((p) => {
              // Remove possíveis dados de troco e valores (ex: "(1º)", "(Recebido...)", ": R$ 50,00", "R$ 50.00")
              let name = p.replace(/\(.*?\)/g, '');
              name = name.split(/[:\d]|R\$/)[0].trim();

              if (name) {
                const normalizedKey = name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const formattedName =
                  labels[name.toUpperCase()] ||
                  labels[normalizedKey] ||
                  name;

                if (!types.includes(formattedName)) {
                  types.push(formattedName);
                }
              }
            });
          }

          if (types.length > 0) {
            return (
              <div className={styles.paymentBadgesList}>
                {types.map((type, idx) => (
                  <Badge key={`${type}-${idx}`} variant="neutral" size="sm">
                    {type}
                  </Badge>
                ))}
              </div>
            );
          }

          return <Badge variant="neutral">Múltiplo</Badge>;
        }

        return <Badge variant="neutral">{labels[s.payment_method] || s.payment_method}</Badge>;
      },
    },
    {
      key: 'items',
      header: 'Itens',
      width: '80px',
      align: 'right',
      sortable: true,
      sortFn: (a, b) => {
        const countA = a.items.reduce((acc, it) => acc + it.quantity, 0);
        const countB = b.items.reduce((acc, it) => acc + it.quantity, 0);
        return countA - countB;
      },
      render: (s) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {s.items.reduce((acc, it) => acc + it.quantity, 0)} un
        </span>
      ),
    },
    {
      key: 'net_total',
      header: 'Total Líquido',
      width: '130px',
      align: 'right',
      sortable: true,
      render: (s) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.net_total)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      align: 'center',
      sortable: true,
      render: (s) => {
        const isCancelled = s.status === 'CANCELADO';
        return (
          <Badge variant={isCancelled ? 'danger' : 'success'}>
            {isCancelled ? 'Cancelado' : 'Concluído'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      width: '180px',
      align: 'right',
      render: (s) => (
        <div className={styles.actionsCell}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSaleForReceipt(s)}
            title="Ver Cupom"
            icon={<Printer size={15} />}
          >
            Cupom
          </Button>
          {s.status !== 'CANCELADO' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setSaleToCancel(s)}
              title="Cancelar Venda"
              icon={<RotateCcw size={15} />}
            >
              Estornar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Histórico de Vendas</h2>
          <p className={styles.subtitle}>
            Auditoria de cupons fiscais/gerenciais, reimpressão térmica (80mm) e cancelamento com estorno.
          </p>
        </div>
      </div>

      {errorNotice && (
        <InlineAlert
          variant="error"
          message={errorNotice.message}
          onRetry={errorNotice.isTransient ? () => loadSalesHistory() : undefined}
          onDismiss={() => setErrorNotice(null)}
        />
      )}

      {actionFeedback && (
        <InlineAlert
          variant={actionFeedback.type === 'error' ? 'error' : 'info'}
          message={actionFeedback.message}
          onDismiss={() => setActionFeedback(null)}
        />
      )}

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <SearchInput
            placeholder="Buscar por número do pedido, SKU ou cliente..."
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos os Status</option>
            <option value="CONCLUIDO">Concluídos</option>
            <option value="CANCELADO">Cancelados</option>
          </select>

          <select
            className={styles.select}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="ALL">Todas as Formas</option>
            <option value="MULTIPLO">Múltiplo</option>
            <option value="PIX">PIX</option>
            <option value="CREDITO">Cartão Crédito</option>
            <option value="DEBITO">Cartão Débito</option>
            <option value="DINHEIRO">Dinheiro</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <DataTable<SaleResponse>
          columns={columns}
          data={filteredSales}
          keyExtractor={(s) => s.id}
          batchActions={salesBatchActions}
          pagination={true}
          defaultPageSize={10}
          isLoading={isLoading}
          emptyMessage="Nenhuma venda localizada para os filtros selecionados."
        />
      </div>

      {/* Modal de Espelho de Cupom 80mm */}
      <ReceiptModal
        isOpen={!!selectedSaleForReceipt}
        onClose={() => setSelectedSaleForReceipt(null)}
        sale={selectedSaleForReceipt}
      />

      {/* Modal de Confirmação de Estorno */}
      {saleToCancel && (
        <Modal
          isOpen={!!saleToCancel}
          onClose={() => setSaleToCancel(null)}
          title="Cancelar Venda"
        >
          <div style={{ padding: '8px 0' }}>
            <p style={{ color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Tem certeza que deseja estornar o pedido <strong>{saleToCancel.order_number}</strong> no valor de{' '}
              <strong>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saleToCancel.net_total)}
              </strong>?
            </p>
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
              }}
            >
              <AlertTriangle size={20} style={{ color: 'var(--color-feedback-error)', flexShrink: 0 }} />
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Esta operação irá devolver automaticamente <strong>{saleToCancel.items.reduce((acc, it) => acc + it.quantity, 0)} unidades</strong> ao
                estoque físico dos produtos correspondentes.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setSaleToCancel(null)} disabled={isCancelling}>
                Voltar
              </Button>
              <Button
                variant="danger"
                icon={<RotateCcw size={16} />}
                onClick={handleConfirmCancel}
                isLoading={isCancelling}
              >
                Confirmar Estorno
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersHistoryView;
