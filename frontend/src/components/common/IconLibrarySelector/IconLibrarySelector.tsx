import React, { useState } from 'react';
import styles from './IconLibrarySelector.module.css';

export type IconLibraryId = 'lucide' | 'phosphor' | 'heroicons' | 'tabler';

export interface IconPackOption {
  id: IconLibraryId;
  name: string;
  creator: string;
  style: string;
  pros: string;
  sampleIcons: { name: string; svg: React.ReactNode }[];
}

export const IconLibrarySelector: React.FC = () => {
  const [selectedPack, setSelectedPack] = useState<IconLibraryId>('lucide');

  const packs: IconPackOption[] = [
    {
      id: 'lucide',
      name: 'Lucide Icons',
      creator: 'Comunidade Open-Source / Sucessor do Feather',
      style: 'Outline puro, grid 24px, traço uniforme 2px, altíssima consistência geométrica.',
      pros: 'Padrão da indústria moderna em SaaS/Design Systems como Shadcn UI, Next.js e Tailwind UI.',
      sampleIcons: [
        {
          name: 'Caixa / Estoque',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          ),
        },
        {
          name: 'Código de Barras',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5v14" /><path d="M8 5v14" /><path d="M12 5v14" /><path d="M17 5v14" /><path d="M21 5v14" />
            </svg>
          ),
        },
        {
          name: 'Frente de Caixa',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          ),
        },
        {
          name: 'Alerta / Ruptura',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        },
      ],
    },
    {
      id: 'phosphor',
      name: 'Phosphor Icons',
      creator: 'Helena Zhang & Tobias Fried',
      style: '6 variações ópticas: Thin, Light, Regular, Bold, Fill e Duotone para alta ênfase.',
      pros: 'Excelente para dashboards operacionais e telas touch de PDV devido aos modos Duotone e Bold.',
      sampleIcons: [
        {
          name: 'Armazém Duotone',
          svg: (
            <svg viewBox="0 0 256 256" fill="currentColor">
              <path d="M240,116.69V208a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V116.69a15.86,15.86,0,0,1,5.27-11.87l96-84a16,16,0,0,1,21.46,0l96,84A15.86,15.86,0,0,1,240,116.69Z" opacity="0.2" />
              <path d="M240,116.69V208a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V116.69a15.86,15.86,0,0,1,5.27-11.87l96-84a16,16,0,0,1,21.46,0l96,84A15.86,15.86,0,0,1,240,116.69Zm-16,91.31V120.48L128,36.48,32,120.48V208H80V152a8,8,0,0,1,8-8h80a8,8,0,0,1,8,8v56Z" />
            </svg>
          ),
        },
        {
          name: 'Comanda / Nota',
          svg: (
            <svg viewBox="0 0 256 256" fill="currentColor">
              <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192ZM80,96a8,8,0,0,1,8-8h80a8,8,0,0,1,0,16H88A8,8,0,0,1,80,96Zm0,32a8,8,0,0,1,8-8h80a8,8,0,0,1,0,16H88A8,8,0,0,1,80,128Zm0,32a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H88A8,8,0,0,1,80,160Z" />
            </svg>
          ),
        },
        {
          name: 'Rastreio Caminhão',
          svg: (
            <svg viewBox="0 0 256 256" fill="currentColor">
              <path d="M248,120h-8V88a16,16,0,0,0-16-16H160V64a16,16,0,0,0-16-16H24A16,16,0,0,0,8,64V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h25a8,8,0,0,0,8-8V128A8,8,0,0,0,248,120ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm112,0a16,16,0,1,1,16-16A16,16,0,0,1,184,208Z" />
            </svg>
          ),
        },
        {
          name: 'Segurança / Audit',
          svg: (
            <svg viewBox="0 0 256 256" fill="currentColor">
              <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-80-64a16,16,0,0,0-16,16v16a16,16,0,0,0,32,0V160A16,16,0,0,0,128,144Z" />
            </svg>
          ),
        },
      ],
    },
    {
      id: 'heroicons',
      name: 'Heroicons v2',
      creator: 'Tailwind Labs (Steve Schoger)',
      style: 'Densidade óptica escalonada: Micro (16px), Mini (20px), Outline (24px) e Solid.',
      pros: 'Excelente balanceamento óptico para botões densos de tabelas e cabeçalhos de formulário.',
      sampleIcons: [
        {
          name: 'Gráfico Cockpit',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
            </svg>
          ),
        },
        {
          name: 'Etiqueta Preço',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          ),
        },
        {
          name: 'Impressão Comprovante',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
          ),
        },
        {
          name: 'Leitor Laser',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            </svg>
          ),
        },
      ],
    },
    {
      id: 'tabler',
      name: 'Tabler Icons',
      creator: 'Paweł Kuna',
      style: 'Mais de 4.500 ícones em traço altamente customizável de 1px a 3px.',
      pros: 'Maior variedade de símbolos específicos de armazém, logística, fiscais e automação industrial.',
      sampleIcons: [
        {
          name: 'Palete 3D',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l8 4.5v9l-8 4.5l-8 -4.5v-9l8 -4.5" />
              <path d="M12 12l8 -4.5" /><path d="M12 12v9" /><path d="M12 12l-8 -4.5" />
            </svg>
          ),
        },
        {
          name: 'Empilhadeira WMS',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
              <path d="M7 18h8m4 0h2v-6h-4" /><path d="M5 16v-9h7l3 3v6" />
              <path d="M21 12v-7" /><path d="M19 5h4" />
            </svg>
          ),
        },
        {
          name: 'Custo Médio (CMP)',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" />
              <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" />
            </svg>
          ),
        },
        {
          name: 'Fast-MCP / IA',
          svg: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <path d="M9 15h.01" /><path d="M15 15h.01" /><path d="M12 4v4" />
            </svg>
          ),
        },
      ],
    },
  ];

  const activeOption = packs.find((p) => p.id === selectedPack) || packs[0];

  return (
    <div className={styles.container}>
      {/* Cards de Escolha de Biblioteca */}
      <div className={styles.grid}>
        {packs.map((p) => {
          const isSelected = selectedPack === p.id;
          return (
            <div
              key={p.id}
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => setSelectedPack(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setSelectedPack(p.id)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconCircle}>
                  <div className={styles.sampleSvgBox}>{p.sampleIcons[0].svg}</div>
                </div>
                <div className={styles.nameArea}>
                  <div className={styles.titleRow}>
                    <span className={styles.packName}>{p.name}</span>
                    {p.id === 'lucide' && <span className={styles.activeTag}>Oficial Adotada</span>}
                    {isSelected && p.id !== 'lucide' && <span className={styles.activeTag}>Visualizando</span>}
                  </div>
                  <span className={styles.creator}>{p.creator}</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.descLine}>
                  <strong>Estilo:</strong> {p.style}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Amostrador Visual Interativo dos Ícones da Biblioteca Selecionada */}
      <div className={styles.previewSection}>
        <div className={styles.previewHeader}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Amostra Visual da Biblioteca: <span style={{ color: 'var(--primary)' }}>{activeOption.name}</span>
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Renderizados em SVG nativo de alta fidelidade
          </span>
        </div>

        <div className={styles.sampleGrid}>
          {activeOption.sampleIcons.map((ic, i) => (
            <div key={i} className={styles.sampleItem}>
              <div className={styles.sampleSvg}>{ic.svg}</div>
              <span className={styles.sampleLabel}>{ic.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
