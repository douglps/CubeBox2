import React from 'react';
import styles from './QuickActionButtons.module.css';

export interface ActionItemProps {
  label: string;
  icon: string | React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'primary' | 'success';
  active?: boolean;
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
}

export const ActionIconButton: React.FC<ActionItemProps> = ({
  label,
  icon,
  variant = 'default',
  active = false,
  onClick,
  tooltip,
  disabled = false,
}) => {
  const variantClass = styles[`variant_${variant}`] || styles.variant_default;

  return (
    <button
      type="button"
      className={`${styles.iconBtn} ${variantClass} ${active ? styles.isActive : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={tooltip || label}
      aria-label={label}
    >
      <span className={styles.iconWrapper}>{icon}</span>
    </button>
  );
};

export interface QuickActionBarProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  onAddInfo?: () => void;
  onCheck?: () => void;
  isChecked?: boolean;
  onExpandCollapse?: () => void;
  isExpanded?: boolean;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onEdit,
  onDelete,
  onFavorite,
  isFavorite = false,
  onAddInfo,
  onCheck,
  isChecked = false,
  onExpandCollapse,
  isExpanded = false,
}) => {
  return (
    <div className={styles.actionBar}>
      {onCheck && (
        <ActionIconButton
          label={isChecked ? 'Desmarcar Item' : 'Marcar Item'}
          icon={isChecked ? '☑️' : '◻️'}
          variant={isChecked ? 'success' : 'default'}
          active={isChecked}
          onClick={onCheck}
          tooltip="Marcar/Desmarcar seleção"
        />
      )}

      {onFavorite && (
        <ActionIconButton
          label={isFavorite ? 'Remover dos favoritos' : 'Favoritar produto'}
          icon={isFavorite ? '⭐' : '☆'}
          variant="warning"
          active={isFavorite}
          onClick={onFavorite}
          tooltip="Favoritar item para acesso rápido"
        />
      )}

      {onEdit && (
        <ActionIconButton
          label="Editar Registro"
          icon="✏️"
          variant="default"
          onClick={onEdit}
          tooltip="Editar dados cadastrais"
        />
      )}

      {onAddInfo && (
        <ActionIconButton
          label="Adicionar Observação"
          icon="💬"
          variant="primary"
          onClick={onAddInfo}
          tooltip="Adicionar nota ou observação fiscal"
        />
      )}

      {onExpandCollapse && (
        <ActionIconButton
          label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
          icon={isExpanded ? '▲' : '▼'}
          variant="default"
          onClick={onExpandCollapse}
          tooltip={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
        />
      )}

      {onDelete && (
        <ActionIconButton
          label="Excluir Registro"
          icon="🗑️"
          variant="danger"
          onClick={onDelete}
          tooltip="Excluir item da lista"
        />
      )}
    </div>
  );
};
