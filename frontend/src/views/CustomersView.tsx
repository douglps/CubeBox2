/**
 * =============================================================================
 * GESTÃO DE CLIENTES & CRM DE BALCÃO - CUBEBOX ENTERPRISE
 * =============================================================================
 * Projeto: CubeBox Enterprise
 * Módulo: Fase 7.3 / US-UI-04
 * Função no Negócio:
 *     Fidelização de clientes e gestão de relacionamento de frente de caixa.
 *     Permite cadastro rápido de clientes, busca instantânea por CPF/Nome,
 *     acompanhamento de frequência de compra e cálculo de Lifetime Value (LTV).
 * =============================================================================
 */

import React, { useEffect, useState } from 'react';
import { UserPlus, Edit3, Download } from 'lucide-react';
import { fetchCustomers } from '../services/api';
import { Customer } from '../types';
import { DataTable, Column, BatchAction } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { InlineAlert } from '../components/common/InlineAlert';
import { Modal } from '../components/common/Modal';
import { CustomerDetailPane } from './components/CustomerDetailPane/CustomerDetailPane';
import { CustomerQuickCreateModal } from './components/CustomerQuickCreateModal/CustomerQuickCreateModal';
import styles from './CustomersView.module.css';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);

  // Estados de feedback
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Breakpoint responsivo para alternar exibição: à direita em telas grandes (>=1634px), modal em menores (<1634px)
  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(min-width: 1634px)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(min-width: 1634px)');
    const updateMatch = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsLargeScreen(e.matches);
    };

    updateMatch(mediaQuery);

    const listener = (e: MediaQueryListEvent) => updateMatch(e);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    }
  }, []);

  // Estados do Modal Unificado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [initialShowAddress, setInitialShowAddress] = useState(false);

  const loadCustomers = async (query?: string) => {
    setIsLoading(true);
    try {
      const data = await fetchCustomers(query);
      setCustomers(data);
    } catch (err: unknown) {
      console.error(err);
      setStatusFeedback({ type: 'error', message: (err as Error).message || 'Falha ao carregar clientes.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(searchTerm);
  }, [searchTerm]);

  const handleOpenNewModal = () => {
    setCustomerToEdit(null);
    setInitialShowAddress(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer, showAddress = false) => {
    setCustomerToEdit(c);
    setInitialShowAddress(showAddress);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedCustomer: Customer) => {
    setIsModalOpen(false);
    setCustomerToEdit(null);
    setInitialShowAddress(false);

    // Atualiza lista local
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === savedCustomer.id);
      if (exists) {
        return prev.map((c) => (c.id === savedCustomer.id ? savedCustomer : c));
      }
      return [savedCustomer, ...prev];
    });

    // Se estiver detalhando esse cliente, atualiza
    if (selectedCustomerForDetail?.id === savedCustomer.id) {
      setSelectedCustomerForDetail(savedCustomer);
    }

    setStatusFeedback({
      type: 'success',
      message: `Cliente ${savedCustomer.nome} ${customerToEdit ? 'atualizado' : 'cadastrado'} com sucesso!`,
    });
  };

  const handleExportCsv = (selected: Customer[], clearSelection: () => void) => {
    const headers = ['ID', 'Nome', 'CPF/CNPJ', 'Email', 'Telefone', 'Total Pedidos', 'LTV', 'Ativo'];
    const rows = selected.map((c) => [
      c.id,
      `"${c.nome.replace(/"/g, '""')}"`,
      `"${c.cpf_cnpj || ''}"`,
      `"${c.email || ''}"`,
      `"${c.telefone || ''}"`,
      c.total_pedidos,
      c.total_gasto_ltv,
      c.ativo ? 'SIM' : 'NÃO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clientes_cubebox_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    clearSelection();
    setStatusFeedback({ type: 'success', message: `${selected.length} clientes exportados para CSV com sucesso!` });
  };

  const customerBatchActions: BatchAction<Customer>[] = [
    {
      id: 'export-csv',
      label: 'Exportar CSV',
      icon: <Download size={14} />,
      variant: 'primary',
      onExecute: handleExportCsv,
    },
  ];

  const columns: Column<Customer>[] = [
    {
      key: 'nome',
      header: 'Cliente / E-mail',
      sortable: true,
      render: (c) => (
        <div>
          <div className={styles.customerName}>{c.nome}</div>
          <div className={styles.customerEmail}>{c.email || 'Sem e-mail cadastrado'}</div>
        </div>
      ),
    },
    {
      key: 'cpf_cnpj',
      header: 'CPF / CNPJ',
      sortable: true,
      render: (c) => (
        <span className={styles.documentCell}>
          {c.cpf_cnpj ? c.cpf_cnpj : <span className={styles.emptyVal}>Não informado</span>}
        </span>
      ),
    },
    {
      key: 'telefone',
      header: 'Telefone',
      render: (c) => <span>{c.telefone || '—'}</span>,
    },
    {
      key: 'total_pedidos',
      header: 'Pedidos',
      sortable: true,
      align: 'right',
      render: (c) => (
        <span className={styles.metricVal}>
          {c.total_pedidos} {c.total_pedidos === 1 ? 'pedido' : 'pedidos'}
        </span>
      ),
    },
    {
      key: 'total_gasto_ltv',
      header: 'LTV Acumulado',
      sortable: true,
      align: 'right',
      render: (c) => (
        <span className={styles.ltvHighlight}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.total_gasto_ltv)}
        </span>
      ),
    },
    {
      key: 'ativo',
      header: 'Status',
      sortable: true,
      render: (c) => (
        <Badge
          label={c.ativo ? 'ATIVO' : 'INATIVO'}
          variant={c.ativo ? 'success' : 'neutral'}
          size="sm"
        />
      ),
    },
    {
      key: 'id',
      header: 'Ações',
      align: 'right',
      render: (c) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <Button
            variant={selectedCustomerForDetail?.id === c.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCustomerForDetail((prev) => (prev?.id === c.id ? null : c));
            }}
          >
            {selectedCustomerForDetail?.id === c.id && isLargeScreen ? 'Fechar' : 'Detalhes'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit3 size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(c);
            }}
            title="Editar cadastro"
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Clientes</h2>
          <p className={styles.subtitle}>
            Cadastro ágil para fidelização, histórico de consumo e identificação de clientes no PDV.
          </p>
        </div>
        <div>
          <Button variant="primary" icon={<UserPlus size={16} />} onClick={handleOpenNewModal}>
            Cadastrar Cliente
          </Button>
        </div>
      </div>

      {statusFeedback && (
        <InlineAlert
          variant={statusFeedback.type === 'error' ? 'error' : 'info'}
          message={statusFeedback.message}
          onDismiss={() => setStatusFeedback(null)}
        />
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchInput
            placeholder="Buscar por nome, telefone ou CPF..."
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
          />
        </div>
      </div>

      <div className={styles.masterDetailLayout}>
        <div className={styles.tableSection}>
          <DataTable
            data={customers}
            columns={columns}
            keyExtractor={(c) => c.id}
            isLoading={isLoading}
            selectable
            batchActions={customerBatchActions}
            emptyMessage={
              searchTerm
                ? `Nenhum cliente encontrado para "${searchTerm}".`
                : 'Nenhum cliente cadastrado no CRM até o momento.'
            }
          />
        </div>

        {/* Em telas grandes: exibe painel fixado à direita */}
        {isLargeScreen && selectedCustomerForDetail && (
          <div className={styles.detailsSection}>
            <CustomerDetailPane
              customer={selectedCustomerForDetail}
              onClose={() => setSelectedCustomerForDetail(null)}
              onEdit={(c, showAddr) => handleOpenEditModal(c, showAddr)}
              onCustomerUpdated={(updated) => {
                setSelectedCustomerForDetail(updated);
                setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
              }}
            />
          </div>
        )}
      </div>

      {/* Em telas menores (< 1634px): exibe os detalhes em Modal */}
      {!isLargeScreen && selectedCustomerForDetail && (
        <Modal
          isOpen={Boolean(selectedCustomerForDetail)}
          onClose={() => setSelectedCustomerForDetail(null)}
          title={`Detalhes: ${selectedCustomerForDetail.nome}`}
          size="lg"
        >
          <CustomerDetailPane
            customer={selectedCustomerForDetail}
            onClose={() => setSelectedCustomerForDetail(null)}
            onEdit={(c, showAddr) => handleOpenEditModal(c, showAddr)}
            onCustomerUpdated={(updated) => {
              setSelectedCustomerForDetail(updated);
              setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            }}
            isModal
          />
        </Modal>
      )}

      {/* Modal Unificado Oficial de Cadastro / Edição de Cliente e Endereços */}
      <CustomerQuickCreateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCustomerToEdit(null);
          setInitialShowAddress(false);
        }}
        onSuccess={handleModalSuccess}
        customerToEdit={customerToEdit}
        initialShowAddress={initialShowAddress}
      />
    </div>
  );
};

export default CustomersView;
