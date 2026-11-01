import React, { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { SkeletonShimmer } from '../SkeletonShimmer/SkeletonShimmer';
import styles from './DataTable.module.css';

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  render?: (item: T) => React.ReactNode;
}

export type Column<T> = DataTableColumn<T>;

export interface BatchAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onExecute: (selectedItems: T[], clearSelection: () => void) => void;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  density?: 'compact' | 'comfortable';
  onRowClick?: (item: T) => void;
  activeRowId?: string | number | null;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingRows?: number;
  selectable?: boolean;
  batchActions?: BatchAction<T>[];
  onSelectionChange?: (selectedItems: T[]) => void;
  pagination?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  initialSortKey?: string;
  initialSortDirection?: SortDirection;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  density = 'compact',
  onRowClick,
  activeRowId,
  emptyMessage = 'Nenhum registro encontrado.',
  isLoading = false,
  loadingRows = 5,
  selectable = true,
  batchActions = [],
  onSelectionChange,
  pagination = true,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  initialSortKey,
  initialSortDirection = null,
}: DataTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [sortKey, setSortKey] = useState<string | null>(initialSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);

  // Limpa seleção ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedIds.size > 0) {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds.size]);

  // Se o conjunto de dados mudar ou tamanho diminuir, valida se a página atual ainda existe
  useEffect(() => {
    const totalPages = Math.ceil(data.length / pageSize) || 1;
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [data.length, pageSize]);

  const clearSelection = () => {
    setSelectedIds(new Set());
    if (onSelectionChange) onSelectionChange([]);
  };

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;

    if (sortKey !== col.key) {
      setSortKey(col.key);
      setSortDirection('asc');
    } else {
      // Ciclo tri-state: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      } else {
        setSortDirection('asc');
      }
    }
    // Ao ordenar, reseta para a primeira página para manter previsibilidade
    setCurrentPage(1);
  };

  // Dados ordenados
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    const column = columns.find((c) => c.key === sortKey);
    const sorted = [...data];

    sorted.sort((a, b) => {
      if (column?.sortFn) {
        const res = column.sortFn(a, b);
        return sortDirection === 'asc' ? res : -res;
      }

      const valA = (a as any)[sortKey];
      const valB = (b as any)[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      const comp = strA.localeCompare(strB, 'pt-BR', { numeric: true });
      return sortDirection === 'asc' ? comp : -comp;
    });

    return sorted;
  }, [data, sortKey, sortDirection, columns]);

  // Dados paginados
  const totalItems = sortedData.length;
  const totalPages = pagination ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const displayedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, pagination, safeCurrentPage, pageSize]);

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length && data.length > 0) {
      clearSelection();
    } else {
      const allIds = new Set(data.map((item) => String(keyExtractor(item))));
      setSelectedIds(allIds);
      if (onSelectionChange) onSelectionChange(data);
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
    if (onSelectionChange) {
      const selectedList = data.filter((item) => updated.has(String(keyExtractor(item))));
      onSelectionChange(selectedList);
    }
  };

  const selectedItems = data.filter((item) => selectedIds.has(String(keyExtractor(item))));

  const densityClass = density === 'compact' ? styles.compactDensity : styles.comfortableDensity;

  const startRecord = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(safeCurrentPage * pageSize, totalItems);

  const renderBatchActionBar = (position: 'top' | 'bottom') => {
    if (!selectable || selectedIds.size === 0 || batchActions.length === 0) return null;

    const positionClass = position === 'top' ? styles.batchActionBarTop : styles.batchActionBarBottom;

    return (
      <div
        className={`${styles.batchActionBar} ${positionClass}`}
        role="region"
        aria-live="polite"
        aria-label={`Ações em massa (${position === 'top' ? 'topo' : 'rodapé'})`}
      >
        <div className={styles.batchCountGroup}>
          <span className={styles.batchCountBadge}>{selectedIds.size}</span>
          <span className={styles.batchCountText}>
            {selectedIds.size === 1 ? 'item selecionado' : 'itens selecionados'}
          </span>
          <button
            type="button"
            className={styles.batchClearBtn}
            onClick={clearSelection}
            title="Desmarcar todos os itens (Esc)"
          >
            Desmarcar (Esc)
          </button>
        </div>

        <div className={styles.batchButtonsGroup}>
          {batchActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`${styles.batchActionBtn} ${
                action.variant === 'primary'
                  ? styles.batchBtnPrimary
                  : action.variant === 'danger'
                  ? styles.batchBtnDanger
                  : styles.batchBtnSecondary
              }`}
              onClick={() => action.onExecute(selectedItems, clearSelection)}
            >
              {action.icon && <span className={styles.batchBtnIcon}>{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.tableWrapper}>
      {/* Barra de Ações em Lote Superior (Topo da Tabela) */}
      {renderBatchActionBar('top')}

      <table className={`${styles.table} ${densityClass}`} aria-busy={isLoading}>
        <thead>
          <tr>
            {selectable && (
              <th className={styles.checkTh}>
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.size === data.length}
                  onChange={toggleSelectAll}
                  aria-label="Selecionar todas as linhas"
                />
              </th>
            )}
            {columns.map((col) => {
              const isSorted = sortKey === col.key && sortDirection !== null;
              const isSortable = !!col.sortable;

              return (
                <th
                  key={col.key}
                  style={{ textAlign: col.align || 'left', width: col.width }}
                  className={`${styles.th} ${isSortable ? styles.thSortable : ''}`}
                  onClick={() => handleSort(col)}
                  aria-sort={
                    isSorted
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  tabIndex={isSortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (isSortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(col);
                    }
                  }}
                  role={isSortable ? 'columnheader button' : 'columnheader'}
                >
                  <div
                    className={styles.thContent}
                    style={{
                      justifyContent:
                        col.align === 'right'
                          ? 'flex-end'
                          : col.align === 'center'
                          ? 'center'
                          : 'flex-start',
                    }}
                  >
                    <span>{col.header}</span>
                    {isSortable && (
                      <span
                        className={`${styles.sortIcon} ${isSorted ? styles.sortIconActive : ''}`}
                        aria-hidden="true"
                      >
                        {isSorted && sortDirection === 'asc' && <ChevronUp size={14} />}
                        {isSorted && sortDirection === 'desc' && <ChevronDown size={14} />}
                        {!isSorted && <ChevronsUpDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: loadingRows }).map((_, rIdx) => (
              <tr key={`skeleton-row-${rIdx}`} className={styles.skeletonRow} aria-hidden="true">
                {selectable && (
                  <td className={styles.checkTd}>
                    <SkeletonShimmer
                      width={16}
                      height={16}
                      borderRadius="var(--radius-xs)"
                      className={styles.skeletonCheckbox}
                    />
                  </td>
                )}
                {columns.map((_, cIdx) => (
                  <td key={`skeleton-col-${cIdx}`} className={styles.skeletonCell}>
                    <SkeletonShimmer
                      variant="text"
                      height={14}
                      width={cIdx === 0 ? '70%' : cIdx === 1 ? '45%' : cIdx === columns.length - 1 ? '85%' : '60%'}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : displayedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className={styles.emptyTd}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            displayedData.map((item) => {
              const id = String(keyExtractor(item));
              const isSelected = selectedIds.has(id);
              const isActive = activeRowId !== undefined && activeRowId !== null && String(activeRowId) === id;

              return (
                <tr
                  key={id}
                  className={`${styles.row} ${isSelected ? styles.rowSelected : ''} ${isActive ? styles.rowActive : ''} ${onRowClick ? styles.rowClickable : ''}`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {selectable && (
                    <td className={styles.checkTd} onClick={(e) => toggleSelectRow(id, e)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Tratado no click do td
                        aria-label={`Selecionar item ${id}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align || 'left' }}
                      className={styles.td}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Paginação Integrada (Padrão NN/g) */}
      {pagination && totalItems > 0 && (
        <div className={styles.paginationBar}>
          <div className={styles.paginationInfo}>
            <span className={styles.paginationCount}>
              Exibindo <strong>{startRecord}–{endRecord}</strong> de <strong>{totalItems}</strong> registros
            </span>

            <div className={styles.pageSizeGroup}>
              <label htmlFor="data-table-page-size">Exibir:</label>
              <select
                id="data-table-page-size"
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} por pág.
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.paginationControls}>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage <= 1}
              title="Primeira página"
              aria-label="Primeira página"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCurrentPage <= 1}
              title="Página anterior"
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <span className={styles.pageIndicator}>
              {safeCurrentPage} / {totalPages}
            </span>

            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage >= totalPages}
              title="Próxima página"
              aria-label="Próxima página"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className={styles.pageBtn}
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage >= totalPages}
              title="Última página"
              aria-label="Última página"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Barra de Ações em Lote Inferior (Fim da Tabela) */}
      {renderBatchActionBar('bottom')}
    </div>
  );
}
