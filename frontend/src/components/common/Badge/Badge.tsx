/**
 * =============================================================================
 * ETIQUETA VISUAL DE STATUS (ATOMIC DESIGN - BADGE)
 * =============================================================================
 * Projeto: CubeBox Mini
 * Função no Negócio:
 *     Funciona como as "etiquetas adesivas coloridas" colocadas nas caixas do estoque
 *     ou nas gôndolas (ex: "Em Falta", "Ativo", "Atenção ao Prazo", "Congelado").
 * 
 * Por que ele existe e o que resolve:
 *     Permite ao lojista bater o olho na tabela de produtos ou na lista de pedidos
 *     e compreender a situação imediatamente através de cores com alto contraste (WCAG 2.1).
 * =============================================================================
 */

import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  label?: React.ReactNode;
  children?: React.ReactNode;
  pulse?: boolean;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  label,
  children,
  pulse = false,
  size = 'md',
  icon,
  className = '',
}) => {
  const effectiveStatus = status || variant || 'neutral';
  const statusClass = styles[`badge_${effectiveStatus}`] || styles.badge_neutral;
  const sizeClass = styles[`badge_${size}`] || styles.badge_md;
  const content = children ?? label;

  return (
    <span className={`${styles.badge} ${statusClass} ${sizeClass} ${className}`}>
      {pulse && <span className={styles.pulseDot} aria-hidden="true" />}
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{content}</span>
    </span>
  );
};
