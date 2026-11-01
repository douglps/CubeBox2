/**
 * =============================================================================
 * FRENTE DE CAIXA E TERMINAL PDV (PONTO DE VENDA) - CUBEBOX ENTERPRISE
 * =============================================================================
 * Projeto: CubeBox Enterprise
 * Módulo: Fase 7.3 / US-UI-04
 * Função no Negócio:
 *     Esta tela é o "caixa registrador" da loja de conveniência/varejo.
 *     Permite atendimento ágil, busca rápida de produtos de grandes marcas,
 *     identificação opcional de cliente para fidelização/CRM (LTV),
 *     bloqueio rígido de produtos CONGELADOS e saldo negativo,
 *     desconto bidirecional (% <-> R$) e conclusão atômica com baixa de estoque.
 * =============================================================================
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  Layers,
  UserCheck,
  Edit3,
  MapPin,
} from 'lucide-react';
import { fetchProducts, fetchCustomers, createSale, fetchCustomerOrders } from '../services/api';
import { Product, Customer, SaleResponse } from '../types';
import { Button } from '../components/common/Button';
import { SearchInput } from '../components/common/SearchInput';
import { BankingNumberInput } from '../components/common/BankingNumberInput/BankingNumberInput';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { InlineAlert } from '../components/common/InlineAlert';
import { CustomerSelectModal } from './components/CustomerSelectModal/CustomerSelectModal';
import { CashPaymentModal } from './components/CashPaymentModal/CashPaymentModal';
import { SplitPaymentModal, PaymentSplitItem } from './components/SplitPaymentModal/SplitPaymentModal';
import { useCursorTooltip } from '../components/common/CursorTooltip';
import { SkeletonShimmer } from '../components/common/SkeletonShimmer/SkeletonShimmer';
import { CustomerQuickCreateModal } from './components/CustomerQuickCreateModal/CustomerQuickCreateModal';
import { maskCpfCnpj } from '../utils/masks';
import styles from './PosView.module.css';

interface CartItem {
  product: Product;
  quantity: number;
}

export const PosView: React.FC = () => {
  const { showTooltip, updatePosition, hideTooltip } = useCursorTooltip();
  // Catálogo de produtos
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  // Clientes para CRM no balcão e Modal de Busca
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [activeCustomerOrders, setActiveCustomerOrders] = useState<SaleResponse[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Módulo de Entrega e Opções Fiscais (Fase 8.0)
  const [deliveryType, setDeliveryType] = useState<'BALCAO' | 'ENTREGA'>('BALCAO');
  const [deliveryFee, setDeliveryFee] = useState<number>(12.00);
  const [enableCpfNota, setEnableCpfNota] = useState(false);
  const [cpfNota, setCpfNota] = useState('');

  // Comanda do cliente (carrinho)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    'DINHEIRO' | 'PIX' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | null
  >(null);

  // Modal de Dinheiro & Troco
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);

  // Pagamento Múltiplo / Dividido
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splits, setSplits] = useState<PaymentSplitItem[]>([]);
  const [splitChange, setSplitChange] = useState<number>(0);

  // Estados de confirmação
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [successSale, setSuccessSale] = useState<SaleResponse | null>(null);
  const [errorNotice, setErrorNotice] = useState<{ message: string; isTransient: boolean } | null>(null);

  // Modal de Edição Rápida de Cliente a partir da Comanda
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [initialShowAddressInQuickEdit, setInitialShowAddressInQuickEdit] = useState(false);

  // Helper unificado para definir avisos diretos de validação/regra
  const setDirectNotice = (msg: string | null) => {
    if (!msg) {
      setErrorNotice(null);
    } else {
      setErrorNotice({ message: msg, isTransient: false });
    }
  };

  // Carregar produtos e clientes
  const loadData = async () => {
    setIsLoadingProducts(true);
    try {
      const [prods, custs] = await Promise.all([fetchProducts(), fetchCustomers()]);
      setProducts(prods);
      setCustomers(custs);
      setErrorNotice(null);
    } catch (err: any) {
      setErrorNotice({
        message: err.message || 'Sem conexão com o sistema. Verifique a rede.',
        isTransient: err.isTransient ?? true,
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Sincronizar CPF na nota quando cliente é selecionado
  useEffect(() => {
    if (selectedCustomer && enableCpfNota) {
      if (selectedCustomer.cpf_cnpj) {
        setCpfNota(selectedCustomer.cpf_cnpj);
      }
    }
  }, [selectedCustomer, enableCpfNota]);

  // Carregar histórico de compras do cliente quando selecionado
  const loadCustomerOrders = async (custId: number) => {
    setIsLoadingOrders(true);
    try {
      const orders = await fetchCustomerOrders(custId);
      setActiveCustomerOrders(orders);
    } catch (err) {
      console.error(err);
      setActiveCustomerOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomerId(cust.id);
    if (enableCpfNota && cust.cpf_cnpj) {
      setCpfNota(cust.cpf_cnpj);
    }
    loadCustomerOrders(cust.id);
  };

  const handleClearCustomer = () => {
    setSelectedCustomerId(null);
    setActiveCustomerOrders([]);
    if (enableCpfNota) {
      setCpfNota('');
    }
  };

  // Repetição de pedido em 2 cliques
  const handleRepeatOrder = (order: SaleResponse) => {
    setDirectNotice(null);
    const missingOrInsufficient: string[] = [];
    const newItems: CartItem[] = [];

    for (const orderItem of order.items) {
      const prod = products.find((p) => p.id === orderItem.product_id);
      if (!prod) {
        missingOrInsufficient.push(`Item ID ${orderItem.product_id} não encontrado no catálogo.`);
        continue;
      }
      if (prod.status === 'CONGELADO') {
        missingOrInsufficient.push(`'${prod.name}' está CONGELADO e não pode ser comercializado.`);
        continue;
      }
      if (prod.current_stock < orderItem.quantity) {
        if (prod.current_stock > 0) {
          missingOrInsufficient.push(`'${prod.name}': pedido anterior tinha ${orderItem.quantity} un, mas estoque físico atual possui apenas ${prod.current_stock} un (saldo ajustado).`);
          newItems.push({ product: prod, quantity: prod.current_stock });
        } else {
          missingOrInsufficient.push(`'${prod.name}' está com estoque zerado e não foi adicionado.`);
        }
      } else {
        newItems.push({ product: prod, quantity: orderItem.quantity });
      }
    }

    if (newItems.length > 0) {
      setCart((prev) => {
        const updated = [...prev];
        for (const it of newItems) {
          const existingIdx = updated.findIndex((x) => x.product.id === it.product.id);
          if (existingIdx >= 0) {
            updated[existingIdx].quantity = Math.min(it.product.current_stock, updated[existingIdx].quantity + it.quantity);
          } else {
            updated.push(it);
          }
        }
        return updated;
      });
      setIsCustomerModalOpen(false);
    }

    if (missingOrInsufficient.length > 0) {
      setDirectNotice(`Itens ajustados pelo estoque atual: ${missingOrInsufficient.join(', ')}.`);
    }
  };

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['TODAS', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'TODAS' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.unit_price * item.quantity, 0);
  }, [cart]);

  // Sincronização bidirecional de desconto
  const handleDiscountPercentChange = (p: number) => {
    const clampedP = Math.min(100, Math.max(0, p));
    setDiscountPercent(clampedP);
    const calculatedValue = (subtotal * clampedP) / 100;
    setDiscountValue(parseFloat(calculatedValue.toFixed(2)));
  };

  const handleDiscountValueChange = (v: number) => {
    const clampedV = Math.min(subtotal, Math.max(0, v));
    setDiscountValue(clampedV);
    const calculatedPercent = subtotal > 0 ? (clampedV / subtotal) * 100 : 0;
    setDiscountPercent(parseFloat(calculatedPercent.toFixed(2)));
  };

  const total = useMemo(() => {
    const totalProdutos = Math.max(0, subtotal - discountValue);
    const taxa = deliveryType === 'ENTREGA' ? deliveryFee : 0;
    return parseFloat((totalProdutos + taxa).toFixed(2));
  }, [subtotal, discountValue, deliveryType, deliveryFee]);

  // Operações do carrinho com trava de estoque e bloqueio de congelamento
  const addToCart = (product: Product) => {
    if (product.status === 'CONGELADO') {
      setDirectNotice(`Este produto está bloqueado para venda pela gerência.`);
      return;
    }
    if (product.current_stock <= 0) return;

    setDirectNotice(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.current_stock) {
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > product.current_stock) {
      setDirectNotice(`Estoque insuficiente: há apenas ${product.current_stock} un deste item.`);
      return;
    }

    setDirectNotice(null);
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!paymentMethod && splits.length === 0) {
      setDirectNotice('Selecione uma forma de pagamento para concluir a venda.');
      return;
    }

    setIsSubmitting(true);
    setDirectNotice(null);

    let enderecoSnapshot: string | undefined = undefined;
    if (deliveryType === 'ENTREGA') {
      if (!selectedCustomer) {
        setDirectNotice('Para pedidos com entrega, é obrigatório selecionar um cliente cadastrado.');
        setIsSubmitting(false);
        return;
      }
      const defaultAddr = selectedCustomer.enderecos?.find((a) => a.is_default) || selectedCustomer.enderecos?.[0];
      const logradouro = defaultAddr?.logradouro || selectedCustomer.logradouro;
      if (!logradouro || !logradouro.trim()) {
        setDirectNotice(`O cliente '${selectedCustomer.nome}' não possui endereço cadastrado. Cadastre um endereço para entrega.`);
        setIsSubmitting(false);
        return;
      }
      enderecoSnapshot = `${logradouro}, ${defaultAddr?.numero || selectedCustomer.numero || 'S/N'} - ${defaultAddr?.bairro || selectedCustomer.bairro || ''}, ${defaultAddr?.cidade || selectedCustomer.cidade || ''}/${defaultAddr?.estado || selectedCustomer.estado || ''}`;
    }

    try {
      const effectivePaymentMethod =
        splits.length > 0
          ? `MÚLTIPLO (${splits.map((s) => `${s.label} R$ ${s.amount.toFixed(2)}`).join(' + ')})`
          : (paymentMethod as string);

      const res = await createSale({
        payment_method: effectivePaymentMethod,
        customer_id: selectedCustomerId || undefined,
        discount_percentage: discountPercent,
        discount_amount: discountValue,
        tipo_entrega: deliveryType,
        taxa_entrega: deliveryType === 'ENTREGA' ? deliveryFee : 0,
        cpf_nota: enableCpfNota && cpfNota.trim() ? cpfNota.trim() : undefined,
        endereco_entrega_snapshot: enderecoSnapshot,
        items: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      });

      setSuccessSale(res);
      setCart([]);
      setDiscountPercent(0);
      setDiscountValue(0);
      setPaymentMethod(null);
      setCashReceived(0);
      setSplits([]);
      setSplitChange(0);
      setErrorNotice(null);
      loadData();
    } catch (err: any) {
      setErrorNotice({
        message: err.message || 'Não foi possível concluir a venda.',
        isTransient: err.isTransient ?? false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atalhos de Teclado no PDV (F1: PIX, F2: Dinheiro, F3: Débito, F4: Crédito, F7: Cliente, F10: Concluir)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evita disparar se estiver digitando em campo de texto
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'F10') {
          e.preventDefault();
          if (cart.length > 0 && !isSubmitting) {
            handleCheckout();
          }
        }
        return;
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          setPaymentMethod('PIX');
          break;
        case 'F2':
          e.preventDefault();
          setPaymentMethod('DINHEIRO');
          setIsCashModalOpen(true);
          break;
        case 'F3':
          e.preventDefault();
          setPaymentMethod('CARTAO_DEBITO');
          break;
        case 'F4':
          e.preventDefault();
          setPaymentMethod('CARTAO_CREDITO');
          break;
        case 'F5':
          e.preventDefault();
          setIsSplitModalOpen(true);
          break;
        case 'F7':
          e.preventDefault();
          setIsCustomerModalOpen(true);
          break;
        case 'F10':
          e.preventDefault();
          if (cart.length > 0 && !isSubmitting) {
            handleCheckout();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isSubmitting, paymentMethod]);

  return (
    <div className={styles.container}>
      {/* Coluna do Catálogo de Produtos */}
      <div className={styles.catalogSection}>
        <div className={styles.catalogFilter}>
          <SearchInput
            placeholder="Buscar por código de barras, nome ou marca..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <div className={styles.categoryPills}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryPill} ${
                  selectedCategory === cat ? styles.categoryActive : ''
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.productGrid} aria-busy={isLoadingProducts}>
          {isLoadingProducts ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={`pos-skeleton-${idx}`}
                className={styles.productCard}
                aria-hidden="true"
                style={{ cursor: 'default' }}
              >
                <div className={styles.productCardTop}>
                  <SkeletonShimmer variant="text" width={50} height={12} />
                  <SkeletonShimmer variant="rect" width={56} height={18} borderRadius="var(--radius-full)" />
                </div>
                <div style={{ margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <SkeletonShimmer variant="text" width="90%" height={16} />
                  <SkeletonShimmer variant="text" width="55%" height={12} />
                </div>
                <div className={styles.productPriceRow} style={{ marginTop: 'auto' }}>
                  <SkeletonShimmer variant="text" width={75} height={20} />
                  <SkeletonShimmer variant="circle" width={28} height={28} />
                </div>
              </div>
            ))
          ) : (
            filteredProducts.map((p) => {
              const isFrozen = p.status === 'CONGELADO';
              const isOutOfStock = p.current_stock <= 0;
              const inCartQty = cart.find((i) => i.product.id === p.id)?.quantity || 0;
              const availableToTake = p.current_stock - inCartQty;

              return (
                <div
                  key={p.id}
                  className={`${styles.productCard} ${
                    isFrozen ? styles.productFrozen : isOutOfStock ? styles.outOfStock : ''
                  }`}
                  onClick={() => !isFrozen && !isOutOfStock && availableToTake > 0 && addToCart(p)}
                >
                  <div className={styles.productCardTop}>
                    <span className={styles.productSku}>{p.sku}</span>
                    <Badge
                      label={
                        isFrozen
                          ? 'Congelado'
                          : isOutOfStock
                          ? 'Esgotado'
                          : availableToTake === 0
                          ? 'Limite no Caixa'
                          : `${availableToTake} un.`
                      }
                      variant={
                        isFrozen
                          ? 'info'
                          : isOutOfStock
                          ? 'danger'
                          : availableToTake <= p.min_stock
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    />
                  </div>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productCategory}>{p.category}</div>
                  <div className={styles.productPriceRow}>
                    <span className={styles.productPrice}>
                      {(p.unit_price ?? 0).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                    <button
                      className={styles.addBtn}
                      disabled={isFrozen || isOutOfStock || availableToTake <= 0}
                      aria-label={`Adicionar ${p.name}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Painel da Comanda / Caixa */}
      <div className={styles.cartSection}>
        <div className={styles.cartHeader}>
          <h3 className={styles.cartTitle}>Comanda / Balcão</h3>
          <span className={styles.cartCount}>
            {cart.reduce((a, b) => a + b.quantity, 0)} itens
          </span>
        </div>

        {/* Identificação de Cliente para CRM e LTV */}
        <div className={styles.customerBar}>
          <div className={styles.customerHeader}>
            <span className={styles.customerLabel}>
              <UserCheck size={14} color="var(--color-interactive-primary)" />
              Cliente:
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>Atalho: F7</span>
          </div>

          {selectedCustomer ? (
            <div
              className={styles.customerActiveCard}
              onClick={() => setIsCustomerModalOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsCustomerModalOpen(true);
                }
              }}
              title="Clique para trocar ou consultar cliente"
              aria-label={`Cliente selecionado: ${selectedCustomer.nome}. Clique para trocar ou consultar`}
            >
              <div className={styles.customerActiveInfo}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span className={styles.customerActiveName}>{selectedCustomer.nome}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '11px',
                        padding: '1px 4px',
                        borderRadius: 'var(--radius-xs)',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInitialShowAddressInQuickEdit(false);
                        setIsQuickEditOpen(true);
                      }}
                      title="Editar dados cadastrais do cliente"
                      aria-label="Editar cliente"
                    >
                      <Edit3 size={12} />
                      <span>Editar</span>
                    </button>
                    <span className={styles.customerOrdersBadge}>
                      🛍️ {selectedCustomer.total_pedidos} {selectedCustomer.total_pedidos === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  </div>
                </div>
                <span className={styles.customerActiveMeta}>
                  {selectedCustomer.cpf_cnpj ? `CPF: ${selectedCustomer.cpf_cnpj} • ` : ''}
                  Tel: {selectedCustomer.telefone || 'Sem tel'} • LTV: R$ {selectedCustomer.total_gasto_ltv.toFixed(2)}
                </span>
                {selectedCustomer.logradouro ? (
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    📍 {selectedCustomer.logradouro}, {selectedCustomer.numero || 'S/N'} - {selectedCustomer.bairro || ''}
                  </span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--status-warning, #eab308)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      ⚠️ Sem endereço
                    </span>
                    <button
                      type="button"
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        border: '1px dashed var(--color-interactive-primary)',
                        color: 'var(--color-interactive-primary)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '1px 6px',
                        fontSize: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInitialShowAddressInQuickEdit(true);
                        setIsQuickEditOpen(true);
                      }}
                      title="Cadastrar endereço de entrega para este cliente"
                    >
                      <MapPin size={10} /> + Cadastrar Endereço
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                className={styles.customerRemoveBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearCustomer();
                }}
                title="Remover cliente"
                aria-label="Remover cliente da venda"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <button
              className={styles.customerIdentifyBtn}
              onClick={() => setIsCustomerModalOpen(true)}
            >
              <span>Identificar Cliente</span>
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>[F7]</span>
            </button>
          )}
        </div>

        {/* Módulo de Modalidade de Venda (Balcão vs Entrega) e CPF na Nota */}
        <div className={styles.deliveryBar}>
          <div className={styles.deliveryToggles}>
            <button
              className={`${styles.deliveryToggleBtn} ${
                deliveryType === 'BALCAO' ? styles.deliveryToggleActive : ''
              }`}
              onClick={() => setDeliveryType('BALCAO')}
            >
              Balcão
            </button>
            <button
              className={`${styles.deliveryToggleBtn} ${
                deliveryType === 'ENTREGA' ? styles.deliveryToggleActive : ''
              }`}
              onClick={() => setDeliveryType('ENTREGA')}
            >
              Entrega
            </button>
          </div>

          <div className={styles.cpfNotaRow}>
            <div
              className={styles.cpfToggleWrapper}
              onClick={() => {
                const nextVal = !enableCpfNota;
                setEnableCpfNota(nextVal);
                if (nextVal && selectedCustomer?.cpf_cnpj) {
                  setCpfNota(maskCpfCnpj(selectedCustomer.cpf_cnpj));
                }
              }}
              role="switch"
              aria-checked={enableCpfNota}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const nextVal = !enableCpfNota;
                  setEnableCpfNota(nextVal);
                  if (nextVal && selectedCustomer?.cpf_cnpj) {
                    setCpfNota(maskCpfCnpj(selectedCustomer.cpf_cnpj));
                  }
                }
              }}
            >
              <div className={`${styles.toggleSwitch} ${enableCpfNota ? styles.toggleSwitchActive : ''}`}>
                <div className={styles.toggleThumb} />
              </div>
              <span className={styles.cpfToggleLabel}>CPF na Nota</span>
            </div>
            {enableCpfNota && (
              <input
                type="text"
                placeholder="000.000.000-00 ou CNPJ"
                className={styles.cpfNotaInput}
                value={cpfNota}
                onChange={(e) => setCpfNota(maskCpfCnpj(e.target.value))}
              />
            )}
          </div>
        </div>

        {errorNotice && (
          <InlineAlert
            message={errorNotice.message}
            onRetry={errorNotice.isTransient ? () => (cart.length > 0 ? handleCheckout() : loadData()) : undefined}
            onDismiss={() => setErrorNotice(null)}
          />
        )}

        {/* Lista de Itens no Carrinho */}
        <div className={styles.cartList}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <Layers size={36} color="var(--text-tertiary)" />
              <p>O carrinho está vazio.</p>
              <span>Clique nos produtos da vitrine para adicionar ao cupom.</span>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className={styles.cartItem}>
                <div className={styles.cartItemDetails}>
                  <span className={styles.cartItemName}>{item.product.name}</span>
                  <span className={styles.cartItemPrice}>
                    {(item.product.unit_price ?? 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}{' '}
                    / un
                  </span>
                </div>

                <div className={styles.cartItemQty}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={item.product.current_stock}
                    className={styles.qtyInputDirect}
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) updateQuantity(item.product.id, val);
                    }}
                  />
                  <button
                    className={styles.qtyBtn}
                    disabled={item.quantity >= item.product.current_stock}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span className={styles.cartItemTotal}>
                  {((item.product.unit_price ?? 0) * item.quantity).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>

                <button
                  className={styles.removeBtn}
                  onClick={() => removeFromCart(item.product.id)}
                  aria-label="Remover item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Rodapé de Desconto e Fechamento */}
        <div className={styles.checkoutFooter}>
          <div className={styles.subtotalRow}>
            <span>Subtotal Bruto</span>
            <span className="tabular">
              {(subtotal ?? 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>

          {deliveryType === 'ENTREGA' && (
            <div className={styles.deliveryFeeRow}>
              <span>Taxa de Entrega:</span>
              <div className={styles.deliveryFeeInputWrapper}>
                <BankingNumberInput
                  mode="currency"
                  value={deliveryFee}
                  onChange={(val) => setDeliveryFee(val)}
                  min={0}
                  step={1}
                />
              </div>
            </div>
          )}

          {/* Destaque Financeiro de Pagamento Múltiplo / Dividido */}
          {splits.length > 0 && (
            <div className={styles.splitInfoBlock}>
              <div className={styles.splitInfoHeader}>
                <span>Pagamento Dividido ({splits.length} formas):</span>
                <button
                  type="button"
                  className={styles.splitClearBtn}
                  onClick={() => {
                    setSplits([]);
                    setSplitChange(0);
                  }}
                  title="Limpar divisão e voltar a forma única"
                >
                  Desfazer
                </button>
              </div>
              <div className={styles.splitPillsRow}>
                {splits.map((s) => (
                  <span key={s.id} className={styles.splitPill}>
                    {s.label}: <strong>R$ {s.amount.toFixed(2)}</strong>
                    {s.change && s.change > 0 ? ` (Troco R$ ${s.change.toFixed(2)})` : ''}
                  </span>
                ))}
              </div>
              {splitChange > 0 && (
                <div className={styles.cashInfoChange} style={{ marginTop: '4px' }}>
                  <span className={styles.cashChangeLabel}>Troco Total a Devolver:</span>
                  <span className={styles.cashChangeVal}>
                    {splitChange.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Destaque Financeiro de Dinheiro & Troco se aprovado */}
          {paymentMethod === 'DINHEIRO' && cashReceived > 0 && splits.length === 0 && (
            <div className={styles.cashInfoBlock}>
              <div className={styles.cashInfoRow}>
                <span>Valor Recebido (Dinheiro):</span>
                <span className="tabular" style={{ fontWeight: 600 }}>
                  {cashReceived.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className={styles.cashInfoChange}>
                <span className={styles.cashChangeLabel}>Troco a Devolver:</span>
                <span className={styles.cashChangeVal}>
                  {Math.max(0, cashReceived - total).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
            </div>
          )}

          <div className={styles.discountBlock}>
            <span className={styles.discountLabel}>Desconto Concedido:</span>
            <div className={styles.discountInputs}>
              <div style={{ flex: 1 }}>
                <BankingNumberInput
                  mode="percent"
                  value={discountPercent}
                  onChange={handleDiscountPercentChange}
                  max={100}
                  step={1}
                />
              </div>
              <span className={styles.syncSymbol}>⇄</span>
              <div style={{ flex: 1.2 }}>
                <BankingNumberInput
                  mode="currency"
                  value={discountValue}
                  onChange={handleDiscountValueChange}
                  max={subtotal}
                  step={1}
                />
              </div>
            </div>
          </div>

          <div className={styles.totalRow}>
            <span>Total a Pagar</span>
            <span className={styles.totalAmount}>
              {(total ?? 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>

          <div className={styles.paymentMethods}>
            <button
              className={`${styles.payBtn} ${
                paymentMethod === 'PIX' && splits.length === 0 ? styles.payActive : ''
              }`}
              onClick={() => {
                setSplits([]);
                setPaymentMethod('PIX');
              }}
              onMouseEnter={(e) => showTooltip('PIX', 'F1', e)}
              onMouseMove={updatePosition}
              onMouseLeave={hideTooltip}
              aria-label="PIX (Atalho: F1)"
            >
              <QrCode size={14} />
              <span>PIX</span>
            </button>

            <button
              className={`${styles.payBtn} ${
                paymentMethod === 'DINHEIRO' && splits.length === 0 ? styles.payActive : ''
              }`}
              onClick={() => {
                setSplits([]);
                setPaymentMethod('DINHEIRO');
                setIsCashModalOpen(true);
              }}
              onMouseEnter={(e) => showTooltip('Dinheiro & Troco', 'F2', e)}
              onMouseMove={updatePosition}
              onMouseLeave={hideTooltip}
              aria-label="Dinheiro e Troco (Atalho: F2)"
            >
              <Banknote size={14} />
              <span>Dinheiro</span>
            </button>

            <button
              className={`${styles.payBtn} ${
                paymentMethod === 'CARTAO_DEBITO' && splits.length === 0 ? styles.payActive : ''
              }`}
              onClick={() => {
                setSplits([]);
                setPaymentMethod('CARTAO_DEBITO');
              }}
              onMouseEnter={(e) => showTooltip('Débito', 'F3', e)}
              onMouseMove={updatePosition}
              onMouseLeave={hideTooltip}
              aria-label="Débito (Atalho: F3)"
            >
              <CreditCard size={14} />
              <span>Débito</span>
            </button>

            <button
              className={`${styles.payBtn} ${
                paymentMethod === 'CARTAO_CREDITO' && splits.length === 0 ? styles.payActive : ''
              }`}
              onClick={() => {
                setSplits([]);
                setPaymentMethod('CARTAO_CREDITO');
              }}
              onMouseEnter={(e) => showTooltip('Crédito', 'F4', e)}
              onMouseMove={updatePosition}
              onMouseLeave={hideTooltip}
              aria-label="Crédito (Atalho: F4)"
            >
              <CreditCard size={14} />
              <span>Crédito</span>
            </button>

            <button
              className={`${styles.payBtn} ${
                splits.length > 0 ? styles.payActive : ''
              }`}
              onClick={() => setIsSplitModalOpen(true)}
              onMouseEnter={(e) => showTooltip('Múltiplas Formas / Dividir', 'F5', e)}
              onMouseMove={updatePosition}
              onMouseLeave={hideTooltip}
              aria-label="Múltiplas Formas ou Cartões (Atalho: F5)"
            >
              <span>Dividir</span>
            </button>
          </div>

          <Button
            variant="primary"
            loading={isSubmitting}
            disabled={cart.length === 0 || (!paymentMethod && splits.length === 0)}
            onClick={handleCheckout}
            onMouseEnter={(e) => showTooltip('Concluir Venda', 'F10', e)}
            onMouseMove={updatePosition}
            onMouseLeave={hideTooltip}
            className={styles.checkoutBtn}
          >
            Concluir Venda [F10]
          </Button>
        </div>
      </div>

      {/* Modal de Dinheiro & Troco */}
      <CashPaymentModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        total={total}
        cashReceived={cashReceived}
        onConfirm={(received) => {
          setCashReceived(received);
          setPaymentMethod('DINHEIRO');
        }}
      />

      {/* Modal de Pagamento Múltiplo / Dividir Formas */}
      <SplitPaymentModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        total={total}
        splits={splits}
        onConfirm={(newSplits, _summary, totalChange) => {
          setSplits(newSplits);
          setSplitChange(totalChange || 0);
        }}
      />

      {/* Modal de Busca de Clientes & Repetição de Pedidos */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        products={products}
        selectedCustomerId={selectedCustomerId}
        activeCustomerOrders={activeCustomerOrders}
        isLoadingOrders={isLoadingOrders}
        onSelectCustomer={handleSelectCustomer}
        onClearCustomer={handleClearCustomer}
        onRepeatOrder={handleRepeatOrder}
        onConfirm={() => setIsCustomerModalOpen(false)}
        onCustomerCreated={(newCust) => {
          setCustomers((prev) => [newCust, ...prev.filter((c) => c.id !== newCust.id)]);
          handleSelectCustomer(newCust);
        }}
      />

      {/* Modal de Edição Rápida de Cliente a partir do Card do PDV */}
      {selectedCustomer && (
        <CustomerQuickCreateModal
          isOpen={isQuickEditOpen}
          customerToEdit={selectedCustomer}
          initialShowAddress={initialShowAddressInQuickEdit}
          onClose={() => {
            setIsQuickEditOpen(false);
            setInitialShowAddressInQuickEdit(false);
          }}
          onSuccess={(updatedCust) => {
            setIsQuickEditOpen(false);
            setInitialShowAddressInQuickEdit(false);
            setCustomers((prev) => [updatedCust, ...prev.filter((c) => c.id !== updatedCust.id)]);
            handleSelectCustomer(updatedCust);
          }}
        />
      )}

      {/* Modal de Sucesso */}
      <Modal
        isOpen={!!successSale}
        onClose={() => setSuccessSale(null)}
        title="Venda Concluída com Sucesso!"
      >
        {successSale && (
          <div className={styles.successModalBody}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={48} color="var(--status-success)" />
            </div>
            <p className={styles.successOrderNum}>{successSale.order_number}</p>
            <p className={styles.successSub}>
              Baixa de estoque e faturamento registrados no banco com integridade transacional.
            </p>
            <div className={styles.successDetails}>
              <div>
                <span>Cliente:</span>
                <strong>
                  {successSale.customer_nome ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <UserCheck size={14} color="var(--color-interactive-primary)" />
                      {successSale.customer_nome}
                    </span>
                  ) : (
                    'Consumidor Final'
                  )}
                </strong>
              </div>
              <div>
                <span>Modalidade:</span>
                <strong>{successSale.tipo_entrega === 'ENTREGA' ? 'Entrega em Domicílio' : 'Retirada no Balcão'}</strong>
              </div>
              {successSale.taxa_entrega ? (
                <div>
                  <span>Taxa de Entrega:</span>
                  <strong>R$ {successSale.taxa_entrega.toFixed(2)}</strong>
                </div>
              ) : null}
              {successSale.cpf_nota ? (
                <div>
                  <span>CPF na Nota:</span>
                  <strong>{successSale.cpf_nota}</strong>
                </div>
              ) : null}
              <div>
                <span>Total Líquido:</span>
                <strong>
                  {(successSale.net_total ?? 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>
              </div>
              <div>
                <span>Forma de Pagamento:</span>
                <strong>{successSale.payment_method}</strong>
              </div>
              <div>
                <span>Qtd de Itens:</span>
                <strong>
                  {successSale.items.reduce((acc, i) => acc + i.quantity, 0)} un.
                </strong>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setSuccessSale(null)}
              style={{ width: '100%', marginTop: 'var(--space-4)' }}
            >
              Iniciar Próximo Atendimento
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PosView;
