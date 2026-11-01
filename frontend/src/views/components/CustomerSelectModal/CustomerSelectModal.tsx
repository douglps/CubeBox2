import React, { useState, useMemo, useEffect } from 'react';
import {
  Phone,
  MapPin,
  FileText,
  RotateCcw,
  CheckCircle2,
  Users,
  UserPlus,
  Star,
  Edit3,
} from 'lucide-react';
import { Customer, SaleResponse, Product } from '../../../types';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { SearchInput } from '../../../components/common/SearchInput';
import { Badge } from '../../../components/common/Badge';
import { ReceiptModal } from '../../../components/common/ReceiptModal';
import { CustomerQuickCreateModal } from '../CustomerQuickCreateModal/CustomerQuickCreateModal';
import { setDefaultCustomerAddress } from '../../../services/api';
import { maskPhone, maskCpfCnpj, maskCep } from '../../../utils/masks';
import styles from './CustomerSelectModal.module.css';

export interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  products: Product[];
  selectedCustomerId: number | null;
  activeCustomerOrders: SaleResponse[];
  isLoadingOrders: boolean;
  onSelectCustomer: (cust: Customer) => void;
  onClearCustomer: () => void;
  onRepeatOrder: (ord: SaleResponse) => void;
  onConfirm: () => void;
  onCustomerCreated?: (newCustomer: Customer) => void;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen,
  onClose,
  customers,
  products,
  selectedCustomerId,
  activeCustomerOrders,
  isLoadingOrders,
  onSelectCustomer,
  onClearCustomer,
  onRepeatOrder,
  onConfirm,
  onCustomerCreated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCustId, setActiveCustId] = useState<number | null>(selectedCustomerId);
  const [orderForReceipt, setOrderForReceipt] = useState<SaleResponse | null>(null);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [customerBeingEdited, setCustomerBeingEdited] = useState<Customer | null>(null);
  const [initialShowAddressInModal, setInitialShowAddressInModal] = useState(false);

  // Sincroniza seleção com a prop selecionada externamente
  useEffect(() => {
    if (selectedCustomerId !== null && selectedCustomerId !== undefined) {
      setActiveCustId(selectedCustomerId);
    } else {
      setActiveCustId(null);
    }
  }, [selectedCustomerId]);

  const productsMap = useMemo(() => {
    const map = new Map<number, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const currentSelectedId = activeCustId ?? selectedCustomerId;

  const selectedCustomer = useMemo(() => {
    if (!currentSelectedId) return null;
    return customers.find((c) => Number(c.id) === Number(currentSelectedId)) || null;
  }, [customers, currentSelectedId]);

  const searchedCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (c.cpf_cnpj && c.cpf_cnpj.toLowerCase().includes(q)) ||
        (c.telefone && c.telefone.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  const formatAddress = (c: Customer) => {
    const street = [c.logradouro, c.numero ? `nº ${c.numero}` : ''].filter(Boolean).join(', ');
    const complement = c.complemento ? `(${c.complemento})` : '';
    const neighborhood = c.bairro ? `Bairro ${c.bairro}` : '';
    const cityUf = [c.cidade, c.estado || 'SP'].filter(Boolean).join('/');
    const cep = c.cep ? `CEP ${maskCep(c.cep)}` : '';
    const parts = [street, complement, neighborhood, cityUf, cep].filter(Boolean);
    return parts.length > 0 ? parts.join(' • ') : 'Endereço não informado para entregas.';
  };

  const formatBrl = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatSaleDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const formatPaymentLabel = (method: string) => {
    switch (method) {
      case 'PIX':
        return '⚡ PIX';
      case 'DINHEIRO':
        return '💵 Dinheiro';
      case 'CARTAO_CREDITO':
        return '💳 Crédito';
      case 'CARTAO_DEBITO':
        return '💳 Débito';
      default:
        return `💳 ${method}`;
    }
  };

  const handleCardClick = (cust: Customer) => {
    setActiveCustId(cust.id);
    onSelectCustomer(cust);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        height="88vh"
        maxHeight="920px"
        title="Identificar Cliente"
        footer={
          <div className={styles.modalFooterContent}>
            <div>
              {selectedCustomer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveCustId(null);
                    onClearCustomer();
                  }}
                >
                  Desvincular Cliente
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button variant="secondary" onClick={onClose}>
                Fechar
              </Button>
              {selectedCustomer && (
                <Button
                  variant="primary"
                  icon={<CheckCircle2 size={15} />}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  Confirmar Cliente
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className={styles.splitLayout}>
          {/* Coluna 1 (Esquerda): Busca e Lista de Clientes */}
          <div className={styles.leftPane}>
            <div className={styles.searchHeader}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <div style={{ flex: 1 }}>
                  <SearchInput
                    placeholder="Buscar por Nome, Telefone ou CPF..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<UserPlus size={14} />}
                  onClick={() => {
                    setCustomerBeingEdited(null);
                    setInitialShowAddressInModal(false);
                    setIsQuickCreateOpen(true);
                  }}
                  title="Cadastrar novo cliente rapidamente"
                >
                  Novo
                </Button>
              </div>
              <span className={styles.resultsCount}>
                {searchedCustomers.length} cliente(s) cadastrado(s)
              </span>
            </div>

            <div className={styles.customerList}>
              {searchedCustomers.length === 0 ? (
                <div className={styles.emptySelection} style={{ height: 'auto', padding: '24px' }}>
                  <p className={styles.emptyDesc}>Nenhum cliente com este critério.</p>
                </div>
              ) : (
                searchedCustomers.map((cust) => {
                  const isSelected = Number(currentSelectedId) === Number(cust.id);
                  const formattedPhone = cust.telefone ? maskPhone(cust.telefone) : 'Sem telefone';
                  const formattedDoc = cust.cpf_cnpj ? maskCpfCnpj(cust.cpf_cnpj) : '';

                  return (
                    <div
                      key={cust.id}
                      className={`${styles.customerCard} ${
                        isSelected ? styles.customerCardSelected : ''
                      }`}
                      onClick={() => handleCardClick(cust)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCardClick(cust);
                        }
                      }}
                      aria-label={`Selecionar cliente ${cust.nome}`}
                    >
                      <div className={styles.customerMainInfo}>
                        <span className={styles.customerName}>{cust.nome}</span>
                        <span className={styles.customerSub}>
                          {formattedPhone} {formattedDoc ? `• CPF: ${formattedDoc}` : ''}
                        </span>
                        {cust.logradouro && (
                          <span
                            className={styles.customerAddressPreview}
                            title={`${cust.logradouro}, ${cust.numero || 'S/N'}`}
                          >
                            📍 {cust.logradouro}, {cust.numero || 'S/N'} ({cust.cidade || 'SP'})
                          </span>
                        )}
                      </div>

                      <div className={styles.customerLtvBadge}>
                        <span className={styles.ltvVal}>{formatBrl(cust.total_gasto_ltv)}</span>
                        <span className={styles.ordersCount}>{cust.total_pedidos} compras</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Coluna 2 (Direita): Detalhes do Cliente Selecionado & Pedidos */}
          <div className={styles.rightPane}>
            {!selectedCustomer ? (
              <div className={styles.emptySelection}>
                <div className={styles.emptyIcon}>
                  <Users size={32} />
                </div>
                <h4 className={styles.emptyTitle}>Selecione um cliente ao lado</h4>
                <p className={styles.emptyDesc}>
                  Clique em um cliente na lista à esquerda para carregar o cadastro completo, telefone,
                  documento, endereço de entrega e histórico de compras com opção de recompra e cupom fiscal.
                </p>
              </div>
            ) : (
              <>
                {/* TOPO FIXO: Dados Completos do Cliente com Formatação Legível */}
                <div className={styles.customerFixedHeader}>
                  <div className={styles.profileHeaderCard}>
                    {/* Linha 1: Avatar, Nome Completo, ID e Situação */}
                    <div className={styles.profileTopRow}>
                      <div className={styles.profileIdentity}>
                        <div className={styles.profileAvatar}>
                          {selectedCustomer.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 className={styles.profileName} title={selectedCustomer.nome}>
                            {selectedCustomer.nome}
                          </h4>
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-tertiary)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            ID #{selectedCustomer.id} • Cadastrado no CRM
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Edit3 size={13} />}
                          onClick={() => {
                            setCustomerBeingEdited(selectedCustomer);
                            setInitialShowAddressInModal(false);
                            setIsQuickCreateOpen(true);
                          }}
                          title="Editar dados cadastrais deste cliente"
                        >
                          Editar Cliente
                        </Button>
                        <Badge
                          label={selectedCustomer.ativo ? 'ATIVO' : 'INATIVO'}
                          variant={selectedCustomer.ativo ? 'success' : 'neutral'}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Linha 2: Telefone e Documento Formatados (Padrão PT-BR) */}
                    <div className={styles.contactChipsGrid}>
                      <div
                        className={styles.contactChip}
                        title="Telefone / WhatsApp"
                      >
                        <Phone size={12} color="var(--color-interactive-primary)" />
                        <span>Tel:</span>
                        <span className={styles.contactChipValue}>
                          {selectedCustomer.telefone
                            ? maskPhone(selectedCustomer.telefone)
                            : 'Sem telefone'}
                        </span>
                      </div>

                      <div
                        className={styles.contactChip}
                        title="CPF / CNPJ"
                      >
                        <span style={{ fontWeight: 'bold', fontSize: '10px' }}>DOC:</span>
                        <span className={styles.contactChipValue}>
                          {selectedCustomer.cpf_cnpj
                            ? maskCpfCnpj(selectedCustomer.cpf_cnpj)
                            : 'Não informado'}
                        </span>
                      </div>

                      {selectedCustomer.email && (
                        <div className={styles.contactChip} title="E-mail">
                          <span>✉️</span>
                          <span className={styles.contactChipValue}>
                            {selectedCustomer.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Linha 3: Endereços de Entrega (Multi-Endereço com Seleção de Default) */}
                    <div className={styles.addressCard}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MapPin size={13} color="var(--color-interactive-primary)" />
                          <span>Endereço(s) de Entrega (Delivery):</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {selectedCustomer.enderecos && selectedCustomer.enderecos.length > 0 && (
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                              {selectedCustomer.enderecos.length} cadastrado(s)
                            </span>
                          )}
                        </div>
                      </div>

                      {selectedCustomer.enderecos && selectedCustomer.enderecos.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                          {selectedCustomer.enderecos.map((addr) => (
                            <div
                              key={addr.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 8px',
                                background: addr.is_default ? 'var(--bg-surface-elevated)' : 'transparent',
                                border: `1px solid ${addr.is_default ? 'var(--color-interactive-primary)' : 'var(--border-subtle)'}`,
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '12px',
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <strong style={{ color: addr.is_default ? 'var(--color-interactive-primary)' : 'var(--text-primary)' }}>
                                    {addr.apelido || 'Endereço'}
                                  </strong>
                                  {addr.is_default && (
                                    <Badge label="PADRÃO" variant="success" size="sm" />
                                  )}
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                                  {addr.logradouro}, nº {addr.numero} {addr.complemento ? `(${addr.complemento})` : ''} • {addr.bairro} - {addr.cidade}/{addr.estado} • CEP {maskCep(addr.cep)}
                                </span>
                              </div>

                              {!addr.is_default && (
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await setDefaultCustomerAddress(selectedCustomer.id, addr.id);
                                      // Atualizar localmente
                                      const updatedAddresses = selectedCustomer.enderecos?.map((a) => ({
                                        ...a,
                                        is_default: a.id === addr.id,
                                      }));
                                      const updatedCust = {
                                        ...selectedCustomer,
                                        enderecos: updatedAddresses,
                                        logradouro: addr.logradouro,
                                        numero: addr.numero,
                                        bairro: addr.bairro,
                                        cidade: addr.cidade,
                                        estado: addr.estado,
                                        cep: addr.cep,
                                      };
                                      onSelectCustomer(updatedCust);
                                    } catch (err) {
                                      console.error('Falha ao definir default', err);
                                    }
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'transparent',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    fontSize: '10px',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                  }}
                                  title="Tornar este o endereço padrão"
                                >
                                  <Star size={11} /> Definir Padrão
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 0' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {formatAddress(selectedCustomer)}
                          </span>
                          <div style={{ display: 'flex' }}>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<MapPin size={13} />}
                              onClick={() => {
                                setCustomerBeingEdited(selectedCustomer);
                                setInitialShowAddressInModal(true);
                                setIsQuickCreateOpen(true);
                              }}
                            >
                              + Cadastrar Endereço de Entrega
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Linha 4: Fita de Indicadores Comerciais */}
                    <div className={styles.metricsBar}>
                      <div className={styles.metricItem}>
                        <span className={styles.metricItemLabel}>Total Pedidos</span>
                        <span className={styles.metricItemVal}>
                          {selectedCustomer.total_pedidos} compras
                        </span>
                      </div>
                      <div className={styles.metricItem}>
                        <span className={styles.metricItemLabel}>LTV Acumulado</span>
                        <span
                          className={styles.metricItemVal}
                          style={{ color: 'var(--color-interactive-primary)' }}
                        >
                          {formatBrl(selectedCustomer.total_gasto_ltv)}
                        </span>
                      </div>
                      <div className={styles.metricItem}>
                        <span className={styles.metricItemLabel}>Ticket Médio</span>
                        <span className={styles.metricItemVal}>
                          {formatBrl(
                            selectedCustomer.total_pedidos > 0
                              ? selectedCustomer.total_gasto_ltv / selectedCustomer.total_pedidos
                              : 0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ÁREA ROLÁVEL: Histórico de Pedidos com Resumo Comercial */}
                <div className={styles.ordersScrollSection}>
                  <div className={styles.ordersSectionHeader}>
                    <span className={styles.ordersSectionTitle}>
                      <FileText size={13} />
                      <span>
                        Histórico de Pedidos de {selectedCustomer.nome} ({activeCustomerOrders.length})
                      </span>
                    </span>
                    {isLoadingOrders && (
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Carregando pedidos...
                      </span>
                    )}
                  </div>

                  {activeCustomerOrders.length === 0 ? (
                    <div
                      className={styles.emptySelection}
                      style={{ height: 'auto', padding: '24px' }}
                    >
                      <p className={styles.emptyDesc}>
                        Nenhum pedido anterior registrado para este cliente.
                      </p>
                    </div>
                  ) : (
                    activeCustomerOrders.map((ord) => {
                      const addressSummary =
                        ord.endereco_entrega_snapshot ||
                        formatAddress(selectedCustomer) ||
                        'Retirada no Balcão';

                      return (
                        <div key={ord.id} className={styles.orderCard}>
                          {/* Cabeçalho do Pedido: Número, Data Formatada e Forma de Pagamento */}
                          <div className={styles.orderCardHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={styles.orderNumber}>{ord.order_number}</span>
                              <span style={{ color: 'var(--text-tertiary)' }}>
                                {formatSaleDate(ord.sale_date)}
                              </span>
                            </div>
                            <span className={styles.orderPaymentBadge}>
                              {formatPaymentLabel(ord.payment_method)}
                            </span>
                          </div>

                          {/* Endereço Resumido */}
                          <div className={styles.orderAddressRow}>
                            <MapPin size={11} />
                            <span title={addressSummary}>{addressSummary}</span>
                          </div>

                          {/* Resumo Comercial dos Itens com Quantidade */}
                          <div className={styles.orderItemsSummary}>
                            {ord.items.map((it, idx) => {
                              const prodName =
                                it.product?.name ||
                                productsMap.get(it.product_id)?.name ||
                                `Produto #${it.product_id}`;

                              return (
                                <div key={idx} className={styles.orderItemLine}>
                                  <div>
                                    <span className={styles.itemQty}>{it.quantity}x</span>
                                    <span className={styles.itemCommercialName}>
                                      {prodName}
                                    </span>
                                  </div>
                                  <span
                                    style={{
                                      color: 'var(--text-secondary)',
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '11px',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {formatBrl(it.total_price)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Rodapé do Pedido: Total Líquido e Ações */}
                          <div className={styles.orderCardFooter}>
                            <div>
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  color: 'var(--text-tertiary)',
                                  display: 'block',
                                }}
                              >
                                Total Pago
                              </span>
                              <span className={styles.orderTotalAmount}>
                                {formatBrl(ord.net_total)}
                              </span>
                            </div>

                            <div className={styles.orderButtons}>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={<FileText size={13} />}
                                onClick={() => setOrderForReceipt(ord)}
                              >
                                Ver Nota
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                icon={<RotateCcw size={13} />}
                                onClick={() => onRepeatOrder(ord)}
                              >
                                Repetir
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Espelho / Cupom Fiscal da Nota */}
      {orderForReceipt && (
        <ReceiptModal
          isOpen={!!orderForReceipt}
          onClose={() => setOrderForReceipt(null)}
          sale={orderForReceipt}
          products={products}
        />
      )}

      {/* Modal de Ação Rápida: Novo Cliente ou Edição Rápida */}
      <CustomerQuickCreateModal
        isOpen={isQuickCreateOpen}
        customerToEdit={customerBeingEdited}
        initialShowAddress={initialShowAddressInModal}
        onClose={() => {
          setIsQuickCreateOpen(false);
          setCustomerBeingEdited(null);
          setInitialShowAddressInModal(false);
        }}
        onSuccess={(created) => {
          setIsQuickCreateOpen(false);
          setCustomerBeingEdited(null);
          setInitialShowAddressInModal(false);
          setActiveCustId(created.id);
          onSelectCustomer(created);
          if (onCustomerCreated) onCustomerCreated(created);
        }}
      />
    </>
  );
};
