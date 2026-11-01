import React, { useEffect, useState } from 'react';
import {
  Edit3,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  Star,
  Plus,
} from 'lucide-react';
import { Customer, SaleResponse } from '../../../types';
import { fetchCustomerOrders, setDefaultCustomerAddress } from '../../../services/api';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { ReceiptModal } from '../../../components/common/ReceiptModal';
import { maskPhone, maskCpfCnpj, maskCep } from '../../../utils/masks';
import styles from './CustomerDetailPane.module.css';

export interface CustomerDetailPaneProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer, initialShowAddress?: boolean) => void;
  onCustomerUpdated?: (customer: Customer) => void;
  isModal?: boolean;
}

export const CustomerDetailPane: React.FC<CustomerDetailPaneProps> = ({
  customer,
  onClose,
  onEdit,
  onCustomerUpdated,
  isModal = false,
}) => {
  const [orders, setOrders] = useState<SaleResponse[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<SaleResponse | null>(null);

  useEffect(() => {
    if (!customer) {
      setOrders([]);
      return;
    }

    let isMounted = true;
    setIsLoadingOrders(true);

    fetchCustomerOrders(customer.id)
      .then((data) => {
        if (isMounted) setOrders(data);
      })
      .catch((err) => {
        console.error('Falha ao carregar pedidos do cliente:', err);
        if (isMounted) setOrders([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingOrders(false);
      });

    return () => {
      isMounted = false;
    };
  }, [customer?.id]);

  if (!customer) return null;

  const initials = customer.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  const ticketMedio =
    customer.total_pedidos > 0
      ? customer.total_gasto_ltv / customer.total_pedidos
      : 0;

  const formattedAddress = [
    customer.logradouro ? `${customer.logradouro}, ${customer.numero || 'S/N'}` : '',
    customer.complemento ? `(${customer.complemento})` : '',
    customer.bairro ? customer.bairro : '',
    customer.cidade ? `${customer.cidade}/${customer.estado || 'SP'}` : '',
    customer.cep ? `CEP: ${maskCep(customer.cep)}` : '',
  ]
    .filter(Boolean)
    .join(' - ');

  return (
    <aside
      className={`${styles.pane} ${isModal ? styles.paneModal : ''}`}
      aria-label={`Detalhes de ${customer.nome}`}
    >
      {/* Cabeçalho de Identificação */}
      <div className={`${styles.header} ${isModal ? styles.headerModal : ''}`}>
        <div className={styles.identityGroup}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.titleArea}>
            <h3 className={styles.name} title={customer.nome}>
              {customer.nome}
            </h3>
            <div className={styles.metaRow}>
              <Badge
                label={customer.ativo ? 'ATIVO' : 'INATIVO'}
                variant={customer.ativo ? 'success' : 'neutral'}
                size="sm"
              />
              <span className={styles.idBadge}>ID #{customer.id}</span>
            </div>
          </div>
        </div>

        {!isModal && (
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar painel de detalhes"
          >
            ✕
          </button>
        )}
      </div>

      {/* Conteúdo com rolagem suave */}
      <div className={`${styles.content} ${isModal ? styles.contentModal : ''}`}>
        {/* Barra de Ações Rápidas */}
        <div className={styles.actionBar}>
          <Button
            variant="primary"
            size="sm"
            icon={<Edit3 size={14} />}
            onClick={() => onEdit(customer)}
          >
            Editar Cadastro
          </Button>
          {customer.telefone && (
            <a
              href={`https://wa.me/55${customer.telefone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="secondary" size="sm" icon={<MessageCircle size={14} />}>
                WhatsApp
              </Button>
            </a>
          )}
        </div>

        {/* Métricas Comerciais (RFM & LTV) */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricBlock}>
            <span className={styles.metricLabel}>Total Compras</span>
            <span className={styles.metricVal}>{customer.total_pedidos}</span>
          </div>
          <div className={styles.metricBlock}>
            <span className={styles.metricLabel}>LTV Acumulado</span>
            <span className={`${styles.metricVal} ${styles.metricValHighlight}`}>
              R$ {customer.total_gasto_ltv.toFixed(2)}
            </span>
          </div>
          <div className={styles.metricBlock}>
            <span className={styles.metricLabel}>Ticket Médio</span>
            <span className={styles.metricVal}>R$ {ticketMedio.toFixed(2)}</span>
          </div>
        </div>

        {/* Dados de Contato e Documento */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <ShoppingBag size={13} />
            <span>Documentação & Contato</span>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>CPF / CNPJ:</span>
              <span className={styles.infoVal}>
                {customer.cpf_cnpj ? maskCpfCnpj(customer.cpf_cnpj) : 'Não informado'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>
                <Phone size={12} /> Telefone:
              </span>
              <span className={styles.infoVal}>
                {customer.telefone ? maskPhone(customer.telefone) : '—'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>
                <Mail size={12} /> E-mail:
              </span>
              <span className={styles.infoVal}>{customer.email || '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoKey}>
                <Calendar size={12} /> Cadastro:
              </span>
              <span className={styles.infoVal}>
                {new Date(customer.criado_em).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Endereços de Entrega (Multi-Endereço com Definir Padrão e + Outro Endereço) */}
        <div className={styles.section}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div className={styles.sectionTitle} style={{ margin: 0 }}>
              <MapPin size={13} />
              <span>Endereço(s) de Entrega ({customer.enderecos?.length || (formattedAddress ? 1 : 0)})</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={12} />}
              onClick={() => onEdit(customer, true)}
            >
              + Outro Endereço
            </Button>
          </div>

          <div className={styles.infoCard}>
            {customer.enderecos && customer.enderecos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customer.enderecos.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: addr.is_default ? 'var(--bg-surface-elevated)' : 'transparent',
                      border: `1px solid ${addr.is_default ? 'var(--color-interactive-primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: '2px' }}>
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
                        onClick={async () => {
                          try {
                            await setDefaultCustomerAddress(customer.id, addr.id);
                            const updatedAddrs = customer.enderecos?.map((a) => ({
                              ...a,
                              is_default: a.id === addr.id,
                            }));
                            const updatedCust = {
                              ...customer,
                              enderecos: updatedAddrs,
                              logradouro: addr.logradouro,
                              numero: addr.numero,
                              bairro: addr.bairro,
                              cidade: addr.cidade,
                              estado: addr.estado,
                              cep: addr.cep,
                            };
                            if (onCustomerUpdated) onCustomerUpdated(updatedCust);
                          } catch (err) {
                            console.error('Falha ao definir default no CRM', err);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'transparent',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '10.5px',
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
            ) : formattedAddress ? (
              <p className={styles.addressText}>📍 {formattedAddress}</p>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>
                Nenhum endereço informado para delivery.
              </p>
            )}
            {customer.referencia && (
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <strong>Ref:</strong> {customer.referencia}
              </div>
            )}
          </div>
        </div>

        {/* Histórico Recente de Pedidos */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <FileText size={13} />
            <span>Últimos Pedidos ({orders.length})</span>
          </div>

          {isLoadingOrders ? (
            <div className={styles.emptyOrders}>Carregando histórico de pedidos...</div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyOrders}>Nenhum pedido anterior para este cliente.</div>
          ) : (
            <div className={styles.ordersList}>
              {orders.slice(0, 5).map((ord) => {
                const itemsSummary = ord.items
                  .map((it) => `${it.quantity}x ${it.product?.name || `Item #${it.product_id}`}`)
                  .join(', ');

                return (
                  <div key={ord.id} className={styles.orderCard}>
                    <div className={styles.orderCardHeader}>
                      <span className={styles.orderNumber}>{ord.order_number}</span>
                      <span className={styles.orderDate}>
                        {new Date(ord.sale_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className={styles.orderItems} title={itemsSummary}>
                      {itemsSummary || 'Itens diversos'}
                    </div>

                    <div className={styles.orderFooter}>
                      <span className={styles.orderTotal}>R$ {ord.net_total.toFixed(2)}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<ExternalLink size={12} />}
                        onClick={() => setSelectedOrderForReceipt(ord)}
                      >
                        Ver Nota
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cupom / Nota Fiscal do Pedido */}
      {selectedOrderForReceipt && (
        <ReceiptModal
          isOpen={!!selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
          sale={selectedOrderForReceipt}
        />
      )}
    </aside>
  );
};

