/**
 * =============================================================================
 * CATÁLOGO DE PRODUTOS & GESTÃO COMERCIAL (FASTAPI + REACT)
 * =============================================================================
 * Projeto: CubeBox Enterprise
 * Módulo: Fase 7.2 / US-UI-04
 * Função no Negócio:
 *     Central de cadastro comercial de produtos do varejo.
 *     Permite inclusão e edição cadastral, precificação com telemetria de margem
 *     de lucro e markup em tempo real, além de congelamento preventivo de SKUs
 *     para bloquear saídas no PDV preservando o histórico de vendas.
 * =============================================================================
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Snowflake, Play, Edit3, Trash2, Download } from 'lucide-react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct
} from '../services/api';
import { Product, ProductCreatePayload, ProductUpdatePayload } from '../types';
import { DataTable, Column, BatchAction } from '../components/common/DataTable';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { Modal } from '../components/common/Modal';
import { TextInput } from '../components/common/TextInput';
import { BankingNumberInput } from '../components/common/BankingNumberInput/BankingNumberInput';
import { InlineAlert } from '../components/common/InlineAlert';
import styles from './ProductsView.module.css';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Estado de feedback
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados do Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Cervejas');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(10.0);
  const [formUnitCost, setFormUnitCost] = useState<number>(6.0);
  const [formStock, setFormStock] = useState<number>(20);
  const [formMinStock, setFormMinStock] = useState<number>(10);
  const [formLeadTime, setFormLeadTime] = useState<number>(2);
  const [formStatus, setFormStatus] = useState<'ATIVO' | 'CONGELADO'>('ATIVO');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar produtos da API
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: unknown) {
      console.error(err);
      setStatusFeedback({ type: 'error', message: (err as Error).message || 'Falha ao carregar produtos.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Categorias únicas presentes nos produtos
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtro composto (busca textual + categoria + status)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Abertura do Modal para Novo Produto
  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormSku(`SKU-PROD-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormCategory(categoriesList[0] || 'Cervejas');
    setFormUnitPrice(10.0);
    setFormUnitCost(6.0);
    setFormStock(20);
    setFormMinStock(10);
    setFormLeadTime(2);
    setFormStatus('ATIVO');
    setIsModalOpen(true);
  };

  // Abertura do Modal para Edição
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormUnitPrice(p.unit_price);
    setFormUnitCost(p.unit_cost);
    setFormStock(p.current_stock);
    setFormMinStock(p.min_stock);
    setFormLeadTime(p.lead_time_days);
    setFormStatus(p.status);
    setIsModalOpen(true);
  };

  // Congelar / Descongelar produto
  const handleToggleStatus = async (p: Product) => {
    const newStatus = p.status === 'ATIVO' ? 'CONGELADO' : 'ATIVO';
    try {
      await toggleProductStatus(p.id, newStatus);
      setStatusFeedback({
        type: 'success',
        message: `Produto '${p.name}' ${newStatus === 'CONGELADO' ? 'congelado no PDV' : 'descongelado e liberado'} com sucesso.`,
      });
      loadProducts();
    } catch (err: unknown) {
      setStatusFeedback({
        type: 'error',
        message: (err as Error).message || 'Falha ao alterar status do produto.',
      });
    }
  };

  // Excluir produto com validação
  const handleDeleteProduct = async (p: Product) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir o produto '${p.name}' (${p.sku})?\n\nCaso o produto possua vendas ou movimentações passadas, a exclusão será bloqueada para preservar o histórico.`
    );
    if (!confirmed) return;

    try {
      await deleteProduct(p.id);
      setStatusFeedback({
        type: 'success',
        message: `Produto '${p.name}' excluído com sucesso.`,
      });
      loadProducts();
    } catch (err: unknown) {
      setStatusFeedback({
        type: 'error',
        message: (err as Error).message || 'Falha ao excluir produto.',
      });
    }
  };

  // Submissão do formulário de criação/edição
  const handleSaveProduct = async () => {
    if (!formName.trim() || !formSku.trim()) {
      setStatusFeedback({ type: 'error', message: 'Preencha o Nome e o SKU do produto.' });
      return;
    }
    if (formUnitPrice <= 0 || formUnitCost <= 0) {
      setStatusFeedback({ type: 'error', message: 'Preço de venda e custo unitário devem ser maiores que zero.' });
      return;
    }

    setIsSubmitting(true);
    setStatusFeedback(null);

    try {
      if (editingProduct) {
        const payload: ProductUpdatePayload = {
          name: formName.trim(),
          category: formCategory.trim(),
          unit_price: formUnitPrice,
          unit_cost: formUnitCost,
          current_stock: formStock,
          min_stock: formMinStock,
          lead_time_days: formLeadTime,
          status: formStatus,
        };
        await updateProduct(editingProduct.id, payload);
        setStatusFeedback({ type: 'success', message: `Produto '${formName}' atualizado com sucesso.` });
      } else {
        const payload: ProductCreatePayload = {
          sku: formSku.trim(),
          name: formName.trim(),
          category: formCategory.trim(),
          unit_price: formUnitPrice,
          unit_cost: formUnitCost,
          current_stock: formStock,
          min_stock: formMinStock,
          lead_time_days: formLeadTime,
          status: formStatus,
        };
        await createProduct(payload);
        setStatusFeedback({ type: 'success', message: `Novo produto '${formName}' cadastrado com sucesso.` });
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err: unknown) {
      setStatusFeedback({
        type: 'error',
        message: (err as Error).message || 'Erro ao salvar produto.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculos dinâmicos de Margem e Markup para o Modal
  const calculatedMargin = useMemo(() => {
    if (formUnitPrice <= 0) return 0;
    return ((formUnitPrice - formUnitCost) / formUnitPrice) * 100;
  }, [formUnitPrice, formUnitCost]);

  const calculatedMarkup = useMemo(() => {
    if (formUnitCost <= 0) return 0;
    return ((formUnitPrice - formUnitCost) / formUnitCost) * 100;
  }, [formUnitPrice, formUnitCost]);

  const calculatedProfit = useMemo(() => {
    return Math.max(0, formUnitPrice - formUnitCost);
  }, [formUnitPrice, formUnitCost]);

  // Colunas da Tabela DataTable
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
      header: 'Produto / Categoria',
      sortable: true,
      render: (p) => (
        <div className={p.status === 'CONGELADO' ? styles.frozenRow : undefined}>
          <div className={styles.productName}>{p.name}</div>
          <div className={styles.productCategory}>{p.category}</div>
        </div>
      ),
    },
    {
      key: 'unit_price',
      header: 'Preço Venda',
      align: 'right',
      sortable: true,
      render: (p) => (
        <span className="tabular">
          {p.unit_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      ),
    },
    {
      key: 'unit_cost',
      header: 'Custo Médio',
      align: 'right',
      sortable: true,
      render: (p) => (
        <span className="tabular">
          {p.unit_cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      ),
    },
    {
      key: 'profit_margin_pct',
      header: 'Margem %',
      align: 'right',
      sortable: true,
      render: (p) => {
        const margin = p.profit_margin_pct ?? 0;
        const colorClass =
          margin >= 40 ? styles.marginHigh : margin >= 20 ? styles.marginMedium : styles.marginLow;
        return <span className={`${styles.marginIndicator} ${colorClass}`}>{margin.toFixed(1)}%</span>;
      },
    },
    {
      key: 'current_stock',
      header: 'Estoque Físico',
      align: 'center',
      sortable: true,
      render: (p) => (
        <span className="tabular">
          <strong>{p.current_stock}</strong> un.
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status PDV',
      align: 'center',
      sortable: true,
      render: (p) => {
        const isFrozen = p.status === 'CONGELADO';
        return (
          <Badge
            label={isFrozen ? 'CONGELADO' : 'ATIVO'}
            variant={isFrozen ? 'info' : 'success'}
            size="sm"
          />
        );
      },
    },
    {
      key: 'actions',
      header: 'Ações Comerciais',
      align: 'right',
      render: (p) => {
        const isFrozen = p.status === 'CONGELADO';
        return (
          <div className={styles.actionsCell}>
            <Button
              variant={isFrozen ? 'primary' : 'secondary'}
              size="sm"
              icon={isFrozen ? <Play size={13} /> : <Snowflake size={13} />}
              onClick={() => handleToggleStatus(p)}
              title={isFrozen ? 'Descongelar produto para venda no PDV' : 'Congelar produto no PDV'}
            >
              {isFrozen ? 'Descongelar' : 'Congelar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit3 size={14} />}
              onClick={() => handleOpenEditModal(p)}
              title="Editar dados do produto"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => handleDeleteProduct(p)}
              title="Excluir produto (se sem movimentação)"
            />
          </div>
        );
      },
    },
  ];

  // Ações em lote para produtos selecionados
  const productBatchActions: BatchAction<Product>[] = [
    {
      id: 'batch-freeze',
      label: 'Congelar Selecionados',
      icon: <Snowflake size={14} />,
      variant: 'secondary',
      onExecute: async (items, clearSelection) => {
        const toFreeze = items.filter((p) => p.status === 'ATIVO');
        if (toFreeze.length === 0) {
          setStatusFeedback({ type: 'error', message: 'Todos os produtos selecionados já estão congelados.' });
          return;
        }
        for (const item of toFreeze) {
          await toggleProductStatus(item.id, 'CONGELADO');
        }
        clearSelection();
        loadProducts();
        setStatusFeedback({ type: 'success', message: `${toFreeze.length} produto(s) congelado(s) com sucesso.` });
      },
    },
    {
      id: 'batch-activate',
      label: 'Descongelar / Ativar',
      icon: <Play size={14} />,
      variant: 'primary',
      onExecute: async (items, clearSelection) => {
        const toActivate = items.filter((p) => p.status === 'CONGELADO');
        if (toActivate.length === 0) {
          setStatusFeedback({ type: 'error', message: 'Todos os produtos selecionados já estão ativos.' });
          return;
        }
        for (const item of toActivate) {
          await toggleProductStatus(item.id, 'ATIVO');
        }
        clearSelection();
        loadProducts();
        setStatusFeedback({ type: 'success', message: `${toActivate.length} produto(s) ativado(s) no PDV com sucesso.` });
      },
    },
    {
      id: 'batch-export',
      label: 'Exportar Selecionados',
      icon: <Download size={14} />,
      variant: 'secondary',
      onExecute: (items) => {
        const jsonStr = JSON.stringify(items, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `produtos-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
    },
  ];

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Produtos</h2>
          <p className={styles.subtitle}>
            {products.length} itens cadastrados ({products.filter((p) => p.status === 'ATIVO').length} ativos no PDV). Marcas reais do varejo brasileiro.
          </p>
        </div>
        <div>
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenNewModal}>
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {statusFeedback && (
        <InlineAlert
          variant={statusFeedback.type === 'error' ? 'error' : 'info'}
          message={statusFeedback.message}
          onDismiss={() => setStatusFeedback(null)}
        />
      )}

      {/* Barra de Filtros */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <SearchInput
            placeholder="Buscar por nome, marca ou SKU..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        <select
          className={styles.selectInput}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">Todas as Categorias ({products.length})</option>
          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className={styles.selectInput}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Todos os Status</option>
          <option value="ATIVO">Apenas Ativos no PDV</option>
          <option value="CONGELADO">Apenas Congelados</option>
        </select>
      </div>

      {/* Tabela de Produtos */}
      <div className={styles.tableCard}>
        <DataTable
          columns={columns}
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          batchActions={productBatchActions}
          pagination={true}
          defaultPageSize={25}
          isLoading={isLoading}
          emptyMessage="Nenhum produto encontrado com os filtros aplicados."
        />
      </div>

      {/* Modal de Cadastro / Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        title={editingProduct ? `Editar Produto: ${editingProduct.name}` : 'Novo Produto'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="primary" loading={isSubmitting} onClick={handleSaveProduct}>
              Salvar Alterações
            </Button>
          </>
        }
      >
        <div className={styles.modalContent}>
          {/* Telemetria Dinâmica de Margem & Markup */}
          <div className={styles.metricBanner}>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Margem de Lucro</span>
              <span
                className={`${styles.metricValue} ${
                  calculatedMargin >= 40 ? styles.marginHigh : calculatedMargin >= 20 ? styles.marginMedium : styles.marginLow
                }`}
              >
                {calculatedMargin.toFixed(1)}%
              </span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Markup s/ Custo</span>
              <span className={styles.metricValue}>{calculatedMarkup.toFixed(1)}%</span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricLabel}>Lucro Bruto Un.</span>
              <span className={styles.metricValue}>
                {calculatedProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <TextInput
                label="Código SKU"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                disabled={!!editingProduct}
                placeholder="Ex: SKU-BEB-010"
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.fieldLabel}>Categoria</label>
              <select
                className={styles.selectInput}
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              >
                <option value="Cervejas">Cervejas</option>
                <option value="Vinhos">Vinhos</option>
                <option value="Refrigerantes">Refrigerantes</option>
                <option value="Energéticos">Energéticos</option>
                <option value="Destilados">Destilados</option>
                <option value="Tabacaria e Afins">Tabacaria e Afins</option>
                <option value="Snacks">Snacks</option>
                <option value="Congelados">Congelados</option>
                <option value="Doces">Doces</option>
                <option value="Gelo e Carvão">Gelo e Carvão</option>
                <option value="Higiene Pessoal">Higiene Pessoal</option>
                <option value="Mercearia">Mercearia</option>
                <option value="Limpeza">Limpeza</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <TextInput
              label="Nome do Produto"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: Cerveja Heineken Puro Malte Lata 350ml"
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <BankingNumberInput
                mode="currency"
                label="Preço de Venda"
                value={formUnitPrice}
                onChange={setFormUnitPrice}
                min={0.1}
                helperText="Valor unitário praticado na frente de caixa"
                tooltip="Digite os números diretamente. As casas decimais e centavos são ajustados automaticamente conforme você digita (padrão financeiro ágil)."
              />
            </div>
            <div className={styles.formRow}>
              <BankingNumberInput
                mode="currency"
                label="Custo Unitário"
                value={formUnitCost}
                onChange={setFormUnitCost}
                min={0.05}
                helperText="Custo de compra para cálculo de margem e markup"
                tooltip="Utilizado pelo motor analítico para apurar a margem de contribuição bruta de cada venda."
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <BankingNumberInput
                mode="integer"
                suffix="un"
                label="Estoque Atual"
                value={formStock}
                onChange={setFormStock}
                min={0}
              />
            </div>
            <div className={styles.formRow}>
              <BankingNumberInput
                mode="integer"
                suffix="un"
                label="Estoque Mínimo"
                value={formMinStock}
                onChange={setFormMinStock}
                min={1}
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <BankingNumberInput
                mode="integer"
                suffix="dias"
                label="Prazo de Entrega (Lead Time)"
                value={formLeadTime}
                onChange={setFormLeadTime}
                min={1}
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.fieldLabel}>Status Inicial no PDV</label>
              <select
                className={styles.selectInput}
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'ATIVO' | 'CONGELADO')}
              >
                <option value="ATIVO">ATIVO (Liberado para Vendas)</option>
                <option value="CONGELADO">CONGELADO (Bloqueado no PDV)</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsView;
