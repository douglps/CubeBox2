/**
 * =============================================================================
 * CURSOR TOOLTIP PORTAL - CUBEBOX 2.0 ENTERPRISE
 * =============================================================================
 * Componente de tooltip flutuante renderizado via React Portal diretamente no
 * document.body. Acompanha as coordenadas do mouse em tempo real, eliminando
 * qualquer problema de corte por overflow (aside, tabelas, modais) ou rolagem
 * horizontal indesejada.
 * =============================================================================
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './CursorTooltip.module.css';

interface TooltipData {
  label: string;
  shortcut?: string;
  x: number;
  y: number;
}

interface CursorTooltipContextType {
  showTooltip: (label: string, shortcut?: string, e?: React.MouseEvent) => void;
  updatePosition: (e: React.MouseEvent) => void;
  hideTooltip: () => void;
}

const CursorTooltipContext = createContext<CursorTooltipContextType | null>(null);

export const CursorTooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = useCallback((label: string, shortcut?: string, e?: React.MouseEvent) => {
    const x = e ? e.clientX : 0;
    const y = e ? e.clientY : 0;
    setTooltip({ label, shortcut, x, y });
  }, []);

  const updatePosition = useCallback((e: React.MouseEvent) => {
    setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  // Previne overflow da tela calculando dimensões da viewport
  const getCalculatedStyle = () => {
    if (!tooltip) return {};
    const offset = 14;
    let top = tooltip.y + offset;
    let left = tooltip.x + offset;

    if (typeof window !== 'undefined') {
      const maxX = window.innerWidth - 200;
      const maxY = window.innerHeight - 50;
      if (left > maxX) {
        left = tooltip.x - 180;
      }
      if (top > maxY) {
        top = tooltip.y - 36;
      }
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  return (
    <CursorTooltipContext.Provider value={{ showTooltip, updatePosition, hideTooltip }}>
      {children}
      {tooltip && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            className={styles.portalTooltip}
            style={getCalculatedStyle()}
            role="tooltip"
          >
            <span className={styles.label}>{tooltip.label}</span>
            {tooltip.shortcut && <kbd className={styles.kbd}>{tooltip.shortcut}</kbd>}
          </div>,
          document.body
        )}
    </CursorTooltipContext.Provider>
  );
};

export const useCursorTooltip = () => {
  const context = useContext(CursorTooltipContext);
  if (!context) {
    throw new Error('useCursorTooltip deve ser usado dentro de CursorTooltipProvider');
  }
  return context;
};
