import React, { useState } from 'react';
import styles from './IconGallery.module.css';

export type IconPackKey = 'lucide' | 'phosphor' | 'heroicons' | 'tabler';

export interface DomainIconItem {
  id: string;
  name: string;
  domain: string;
  description: string;
  variants: {
    lucide: React.ReactNode;
    phosphor: React.ReactNode;
    heroicons: React.ReactNode;
    tabler: React.ReactNode;
  };
}

export const IconGallery: React.FC = () => {
  const [activePack, setActivePack] = useState<IconPackKey>('lucide');
  const [selectedDomain, setSelectedDomain] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'comparative' | 'single'>('comparative');

  const packsMeta: Record<IconPackKey, { name: string; style: string; badge: string }> = {
    lucide: {
      name: 'Lucide Icons',
      style: 'Contorno 24x24 / Stroke 2px',
      badge: 'Recomendada (Default)',
    },
    phosphor: {
      name: 'Phosphor Icons',
      style: 'Duo-tone / Regular 256x256',
      badge: 'Ergonomia Visual',
    },
    heroicons: {
      name: 'Heroicons v2',
      style: 'Micro / Mini / Outline 24x24',
      badge: 'Densidade Óptica',
    },
    tabler: {
      name: 'Tabler Icons',
      style: 'Traço Preciso 1px-3px',
      badge: 'Variedade Industrial',
    },
  };

  const domainIcons: DomainIconItem[] = [
    // --- DOMÍNIO: WMS & ESTOQUE ---
    {
      id: 'wms-deposito',
      name: 'Armazém / Depósito',
      domain: 'WMS & Estoque',
      description: 'Representa instalações de armazenamento, galpões e centros de distribuição.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21V9l9-6 9 6v12H3z" />
            <path d="M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M240,104.28,133.33,26.79a8,8,0,0,0-9.66,0L17,103.62A8,8,0,0,0,16,110v98a8,8,0,0,0,8,8H232a8,8,0,0,0,8-8V110A8,8,0,0,0,240,104.28ZM96,200V152a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v48Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21v-13l9 -4l9 4v13" />
            <path d="M13 13h4v8H7v-6h6" />
          </svg>
        ),
      },
    },
    {
      id: 'wms-caixa',
      name: 'Caixa / SKU Físico',
      domain: 'WMS & Estoque',
      description: 'Item estocável individual, embalagem primária e rastreio de lote.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M223.68,66.15l-88-48.15a15.89,15.89,0,0,0-15.36,0l-88,48.15a16,16,0,0,0-8.32,14V175.85a16,16,0,0,0,8.32,14l88,48.15a15.89,15.89,0,0,0,15.36,0l88-48.15a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80,43.76L176.88,93,96.88,49.24ZM40,88.13,120,131.9v87.72L40,175.85ZM136,219.62V131.9l80-43.77v87.72Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
            <path d="M12 12l8 -4.5" />
            <path d="M12 12l0 9" />
            <path d="M12 12l-8 -4.5" />
          </svg>
        ),
      },
    },
    {
      id: 'wms-caminhao',
      name: 'Transferência / Carga',
      domain: 'WMS & Estoque',
      description: 'Transferência entre depósitos, romaneio de carga e entrega física.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M248,120h-8V88a16,16,0,0,0-16-16H160V64a16,16,0,0,0-16-16H24A16,16,0,0,0,8,64V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h25a8,8,0,0,0,8-8V128A8,8,0,0,0,248,120ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm112,0a16,16,0,1,1,16-16A16,16,0,0,1,184,208Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25H4.125C3.504 7.5 3 8.004 3 8.625V14.25m11.25-6.75v11.25" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
            <path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5" />
          </svg>
        ),
      },
    },
    {
      id: 'wms-avaria',
      name: 'Quarentena / Avaria',
      domain: 'WMS & Estoque',
      description: 'Lotes retidos, produtos avariados, inspeção de qualidade ou recall.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,0,1-62.22-25.78l126.44-126.44A88,88,0,0,1,128,216Zm62.22-25.78L63.78,63.78A88,88,0,0,1,190.22,190.22Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M5.7 5.7l12.6 12.6" />
          </svg>
        ),
      },
    },

    // --- DOMÍNIO: VENDAS & POS ---
    {
      id: 'pos-barcode',
      name: 'Código de Barras / EAN',
      domain: 'Vendas & POS',
      description: 'Leitura rápida de leitor óptico, scanner ou digitação manual de EAN-13.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5v14" />
            <path d="M8 5v14" />
            <path d="M12 5v14" />
            <path d="M17 5v14" />
            <path d="M21 5v14" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M224,40H32A16,16,0,0,0,16,56V200a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V56A16,16,0,0,0,224,40Zm-176,144H40V72H48Zm32,0H64V72H80Zm48,0H112V72h16Zm48,0H160V72h16Zm32,0H208V72h16Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7v-1a2 2 0 0 1 2 -2h2" />
            <path d="M4 17v1a2 2 0 0 0 2 2h2" />
            <path d="M16 4h2a2 2 0 0 1 2 2v1" />
            <path d="M16 20h2a2 2 0 0 0 2 -2v-1" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        ),
      },
    },
    {
      id: 'pos-carrinho',
      name: 'Frente de Caixa / PDV',
      domain: 'Vendas & POS',
      description: 'Carrinho de vendas de balcão, checkout e totalização de pedido.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,26.64A8,8,0,0,0,41.92,20H16a8,8,0,0,0,0,16H34.78L62.6,202.93A24.08,24.08,0,0,0,86.22,224H192a8,8,0,0,0,0-16H86.22a8.06,8.06,0,0,1-7.9-6.67L75.69,184H192a24.1,24.1,0,0,0,23.63-19.86l14.4-86.4A8,8,0,0,0,222.14,58.87ZM88,208a16,16,0,1,1-16-16A16,16,0,0,1,88,208Zm104,0a16,16,0,1,1-16-16A16,16,0,0,1,192,208Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="19" r="2" />
            <circle cx="17" cy="19" r="2" />
            <path d="M17 17h-11v-14h-2" />
            <path d="M6 5l14 1l-1 7h-13" />
          </svg>
        ),
      },
    },
    {
      id: 'pos-comanda',
      name: 'Comanda / Comprovante',
      domain: 'Vendas & POS',
      description: 'Emissão de comprovante térmico não-fiscal e recibo de entrega.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
            <path d="M16 8h-8" />
            <path d="M16 12h-8" />
            <path d="M12 16h-4" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M216,32H40a8,8,0,0,0-8,8V216a8,8,0,0,0,12.44,6.67L64,209.6l19.56,13.07a8,8,0,0,0,8.88,0L112,209.6l19.56,13.07a8,8,0,0,0,8.88,0L160,209.6l19.56,13.07a8,8,0,0,0,8.88,0L208,209.6l19.56,13.07A8,8,0,0,0,240,216V40A8,8,0,0,0,216,32ZM80,88h96a8,8,0,0,1,0,16H80a8,8,0,0,1,0-16Zm96,56H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16l-3 -2l-2 2l-2 -2l-2 2l-2 -2l-3 2" />
            <path d="M9 7h6" />
            <path d="M9 11h6" />
            <path d="M9 15h4" />
          </svg>
        ),
      },
    },
    {
      id: 'pos-etiqueta',
      name: 'Preço & Etiqueta',
      domain: 'Vendas & POS',
      description: 'Precificação, gôndola e impressão de etiquetas térmicas de prateleira.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68A16,16,0,0,0,243.31,136ZM84,96A12,12,0,1,1,96,84,12,12,0,0,1,84,96Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path d="M6 6h.008v.008H6V6z" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.56 3.69a9 9 0 0 0 -2.92 1.95l-4.25 4.25a2 2 0 0 0 0 2.83l7.92 7.92a2 2 0 0 0 2.83 0l4.25 -4.25a9 9 0 0 0 1.95 -2.92l1.66 -5.47a1 1 0 0 0 -1.21 -1.21l-5.47 1.66z" />
            <circle cx="8.5" cy="8.5" r="1" />
          </svg>
        ),
      },
    },

    // --- DOMÍNIO: GESTÃO & COCKPIT ---
    {
      id: 'mgmt-analytics',
      name: 'Indicadores / Cockpit',
      domain: 'Gestão & Cockpit',
      description: 'Painéis gerenciais, faturamento acumulado e métricas de desempenho.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM104,184H72V120h32Zm48,0H120V72h32Zm48,0H168V104h32Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="19" x2="20" y2="19" />
            <polyline points="4 15 8 9 12 11 16 6 20 10" />
          </svg>
        ),
      },
    },
    {
      id: 'mgmt-seguranca',
      name: 'Segurança & Auditoria',
      domain: 'Gestão & Cockpit',
      description: 'Logs imutáveis de transações, permissões RBAC e conformidade contábil.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
            <path d="M9 12l2 2l4 -4" />
          </svg>
        ),
      },
    },

    // --- DOMÍNIO: AÇÕES DE TABELA ---
    {
      id: 'act-editar',
      name: 'Editar / Modificar',
      domain: 'Ações de Tabela',
      description: 'Ação rápida na linha de dados para ajuste de saldo, preço ou descrição.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M227.31,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31l123.31-123.3a16,16,0,0,0,0-22.64ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.31,64l24-24L216,84.69Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -3 -3l-10.5 10.5v4" />
            <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
          </svg>
        ),
      },
    },
    {
      id: 'act-excluir',
      name: 'Excluir / Baixa Lógica',
      domain: 'Ações de Tabela',
      description: 'Ação crítica com confirmação obrigatória para estorno ou baixa de linha.',
      variants: {
        lucide: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        ),
        phosphor: (
          <svg viewBox="0 0 256 256" fill="currentColor">
            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM192,208H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z" />
          </svg>
        ),
        heroicons: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        ),
        tabler: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          </svg>
        ),
      },
    },
  ];

  const domains = ['todos', 'WMS & Estoque', 'Vendas & POS', 'Gestão & Cockpit', 'Ações de Tabela'];

  const filteredIcons = selectedDomain === 'todos'
    ? domainIcons
    : domainIcons.filter((item) => item.domain === selectedDomain);

  return (
    <div className={styles.container}>
      {/* Controles do Comparativo */}
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Visualização:</span>
          <button
            type="button"
            className={`${styles.modeBtn} ${viewMode === 'comparative' ? styles.modeBtnActive : ''}`}
            onClick={() => setViewMode('comparative')}
          >
            Matriz Comparativa (4 Bibliotecas)
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${viewMode === 'single' ? styles.modeBtnActive : ''}`}
            onClick={() => setViewMode('single')}
          >
            Filtro por Biblioteca Ativa
          </button>
        </div>

        {/* Seletor de Domínio Funcional */}
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Domínio:</span>
          <div className={styles.domainPills}>
            {domains.map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.pillBtn} ${selectedDomain === d ? styles.pillBtnActive : ''}`}
                onClick={() => setSelectedDomain(d)}
              >
                {d === 'todos' ? 'Todos os Domínios' : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modo de Visualização 1: MATRIZ COMPARATIVA LADO A LADO */}
      {viewMode === 'comparative' && (
        <div className={styles.comparativeContainer}>
          <div className={styles.tableHeaderRow}>
            <div className={styles.thConcept}>Conceito / Função WMS-POS</div>
            <div className={styles.thLibrary}>Lucide Icons</div>
            <div className={styles.thLibrary}>Phosphor Icons</div>
            <div className={styles.thLibrary}>Heroicons v2</div>
            <div className={styles.thLibrary}>Tabler Icons</div>
          </div>

          <div className={styles.rowsWrapper}>
            {filteredIcons.map((item) => (
              <div key={item.id} className={styles.comparativeRow}>
                <div className={styles.conceptCol}>
                  <span className={styles.conceptDomain}>{item.domain}</span>
                  <span className={styles.conceptName}>{item.name}</span>
                  <span className={styles.conceptDesc}>{item.description}</span>
                </div>

                <div className={`${styles.iconCol} ${styles.colLucide}`}>
                  <div className={styles.svgWrapper}>{item.variants.lucide}</div>
                  <span className={styles.packTag}>Lucide</span>
                </div>

                <div className={`${styles.iconCol} ${styles.colPhosphor}`}>
                  <div className={styles.svgWrapper}>{item.variants.phosphor}</div>
                  <span className={styles.packTag}>Phosphor</span>
                </div>

                <div className={`${styles.iconCol} ${styles.colHeroicons}`}>
                  <div className={styles.svgWrapper}>{item.variants.heroicons}</div>
                  <span className={styles.packTag}>Heroicons</span>
                </div>

                <div className={`${styles.iconCol} ${styles.colTabler}`}>
                  <div className={styles.svgWrapper}>{item.variants.tabler}</div>
                  <span className={styles.packTag}>Tabler</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modo de Visualização 2: SELETOR DE BIBLIOTECA ATIVA */}
      {viewMode === 'single' && (
        <div className={styles.singleViewContainer}>
          <div className={styles.packTabs}>
            {(Object.keys(packsMeta) as IconPackKey[]).map((key) => {
              const meta = packsMeta[key];
              const isSelected = activePack === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.packTab} ${isSelected ? styles.packTabActive : ''}`}
                  onClick={() => setActivePack(key)}
                >
                  <span className={styles.tabTitle}>{meta.name}</span>
                  <span className={styles.tabBadge}>{meta.badge}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.singleGrid}>
            {filteredIcons.map((item) => (
              <div key={item.id} className={styles.singleCard}>
                <div className={styles.singleSvgBox}>
                  {item.variants[activePack]}
                </div>
                <div className={styles.singleDetails}>
                  <span className={styles.singleName}>{item.name}</span>
                  <span className={styles.singleDomain}>{item.domain}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
