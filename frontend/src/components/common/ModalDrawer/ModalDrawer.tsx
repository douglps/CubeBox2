import React, { useEffect, useRef } from 'react';
import styles from './ModalDrawer.module.css';

export interface ModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type?: 'modal' | 'drawer';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
}

export type ModalProps = ModalDrawerProps;

export const ModalDrawer: React.FC<ModalDrawerProps> = ({
  isOpen,
  onClose,
  title,
  type = 'modal',
  size,
  children,
  footer,
  maxWidth,
  maxHeight,
  width,
  height,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechamento via tecla Escape (SC 2.1.2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = size
    ? styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`] || ''
    : '';

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        ref={containerRef}
        className={`${styles.container} ${type === 'drawer' ? styles.drawer : styles.modal} ${sizeClass}`}
        style={{
          ...(maxWidth ? { maxWidth } : {}),
          ...(maxHeight ? { maxHeight } : {}),
          ...(width ? { width } : {}),
          ...(height ? { height } : {}),
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-drawer-title"
      >
        <div className={styles.header}>
          <h3 id="modal-drawer-title" className={styles.title}>
            {title}
          </h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar janela"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};

export const Modal = ModalDrawer;
