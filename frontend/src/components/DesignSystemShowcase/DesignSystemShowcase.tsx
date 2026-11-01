import React, { useEffect, useState } from 'react';
import styles from './DesignSystemShowcase.module.css';
import {
  BarcodeScannerInput,
  ExpirationGuardBadge,
  ReceiptWatermark,
  PaymentSelector,
  StockLevelBar,
  EmptyState,
  SkeletonShimmer,
  Button,
  Badge,
  TextInput,
  QuantitySelector,
  QuickActionBar,
  SliderInput,
  ModalDrawer,
  SelectCombobox,
  CurrencyInput,
  SearchInput,
  FlagBadge,
  DatePickerCalendar,
  DataTable,
  IconGallery,
  IconLibrarySelector,
  MotionLab,
  AppShellLab,
  LivingDocsLab,
  GovernanceTestingLab,
  type PaymentType,
} from '../common';

export const DesignSystemShowcase: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeFontPreset, setActiveFontPreset] = useState<'preset-1' | 'preset-2' | 'preset-3' | 'preset-4'>('preset-1');

  // Estados para o Laboratório da Dimensão 4 (Componentes Atômicos & Operacionais)
  const [btnLoading, setBtnLoading] = useState(false);
  const [toggleActive, setToggleActive] = useState(true);
  const [cnpjVal, setCnpjVal] = useState('12.345.678/0001-90');
  const [phoneVal, setPhoneVal] = useState('(11) 98765-4321');
  const [cepVal, setCepVal] = useState('01310-100');
  const [showToast, setShowToast] = useState(true);

  // Estados dos Componentes Operacionais Reais
  const [barcodeScanned, setBarcodeScanned] = useState('7891000100105');
  const [lastScannedResult, setLastScannedResult] = useState<string | null>('Bipagem anterior: SKU-CAFE-GRAO-1KG');
  const [paymentSelected, setPaymentSelected] = useState<PaymentType>('PIX');
  const [demoStock, setDemoStock] = useState<number>(35);

  // Novos Estados: Seletores de Quantidade, Slide, Ações Rápidas, Modal & Drawer
  const [demoQuantity, setDemoQuantity] = useState<number>(6);
  const [demoDiscountSlide, setDemoDiscountSlide] = useState<number>(15);
  const [isItemFavorited, setIsItemFavorited] = useState<boolean>(true);
  const [isItemChecked, setIsItemChecked] = useState<boolean>(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('wh-main');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [quickActionNotice, setQuickActionNotice] = useState<string | null>(null);

  // Estados dos Novos Elementos: Moeda Bancária, Pesquisa, Calendário e Tabela
  const [currencyCents, setCurrencyCents] = useState<number>(14990); // R$ 149,90
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-22');
  const [tableDensity, setTableDensity] = useState<'compact' | 'comfortable'>('compact');

  // Estado para Avaliação dos Estilos de Caixa em Feedback Semântico (Homologado: Opção 3 - Cubo Elevado Executive)
  const [feedbackBoxStyle, setFeedbackBoxStyle] = useState<'3d-crate' | 'tape-sealed' | 'elevated-cube' | 'original'>('elevated-cube');


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };


  return (
    <div className={styles.container}>
      {/* Header do Showcase */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>
            <span>💎 CubeBox Design System</span>
            <span className={styles.badgePill}>W3C DTCG • Nível 5</span>
          </h1>
          <p className={styles.subtitle}>
            Auditório interativo dos Pilares Fundacionais: Dimensões 1 (Tokens W3C), 2 (Tipografia Quiet Luxury), 3 (Acessibilidade WCAG 2.1 AA), 4 (Componentes Operacionais), 5 (Motion System Cinético), 6 (Padrões de Layout, Densidade &amp; App Shell), 7 (Documentação Viva &amp; Docs as Code) e 8 (Governança, Testes &amp; Regressão Visual VRT).
          </p>
        </div>

        <div className={styles.themeToggleGroup} role="group" aria-label="Alternador de tema">
          <button
            type="button"
            className={`${styles.themeBtn} ${theme === 'light' ? styles.themeBtnActive : ''}`}
            onClick={() => toggleTheme('light')}
          >
            ☀️ Modo Claro (Light • #E1EEF3)
          </button>
          <button
            type="button"
            className={`${styles.themeBtn} ${theme === 'dark' ? styles.themeBtnActive : ''}`}
            onClick={() => toggleTheme('dark')}
          >
            🌙 Modo Escuro (Dark • #181818)
          </button>
        </div>
      </header>

      {/* Pilar 1: Cores & Superfícies Dual-Theme */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🎨</span>
            <span>Pilar 1: Superfícies & Cores Semânticas (Zero #000 e Zero #FFF)</span>
          </h2>
          <span className={styles.sectionBadge}>Contraste WCAG AAA (&gt; 9.5:1)</span>
        </div>

        <div className={styles.paletteGrid}>
          <div className={styles.colorSwatch}>
            <div className={styles.swatchPreview} style={{ backgroundColor: 'var(--bg-canvas)' }} />
            <div className={styles.swatchMeta}>
              <span className={styles.swatchName}>Canvas / Fundo Global</span>
              <span className={styles.swatchToken}>--bg-canvas</span>
              <span className={styles.swatchValue}>{theme === 'light' ? '#E1EEF3' : '#181818'}</span>
            </div>
          </div>

          <div className={styles.colorSwatch}>
            <div className={styles.swatchPreview} style={{ backgroundColor: 'var(--bg-surface)' }} />
            <div className={styles.swatchMeta}>
              <span className={styles.swatchName}>Surface / Cards</span>
              <span className={styles.swatchToken}>--bg-surface</span>
              <span className={styles.swatchValue}>{theme === 'light' ? '#EDF5F8' : '#242424'}</span>
            </div>
          </div>

          <div className={styles.colorSwatch}>
            <div className={styles.swatchPreview} style={{ backgroundColor: 'var(--bg-surface-elevated)' }} />
            <div className={styles.swatchMeta}>
              <span className={styles.swatchName}>Surface Elevated / Modais</span>
              <span className={styles.swatchToken}>--bg-surface-elevated</span>
              <span className={styles.swatchValue}>{theme === 'light' ? '#F6FAFB' : '#2F2F2F'}</span>
            </div>
          </div>

          <div className={styles.colorSwatch}>
            <div className={styles.swatchPreview} style={{ backgroundColor: 'var(--bg-surface-hover)' }} />
            <div className={styles.swatchMeta}>
              <span className={styles.swatchName}>Hover Tátil / Acento</span>
              <span className={styles.swatchToken}>--bg-surface-hover</span>
              <span className={styles.swatchValue}>{theme === 'light' ? '#D7E7EE' : '#373737'}</span>
            </div>
          </div>

          <div className={styles.colorSwatch}>
            <div className={styles.swatchPreview} style={{ backgroundColor: 'var(--bg-inset)' }} />
            <div className={styles.swatchMeta}>
              <span className={styles.swatchName}>Inset / Inputs & Grids</span>
              <span className={styles.swatchToken}>--bg-inset</span>
              <span className={styles.swatchValue}>{theme === 'light' ? '#D7E6EC' : '#1D1D1D'}</span>
            </div>
          </div>

          <div className={styles.colorSwatch}>
            <div className={styles.swatchPreview} style={{ backgroundColor: 'var(--border-subtle)' }} />
            <div className={styles.swatchMeta}>
              <span className={styles.swatchName}>Bordas & Divisores</span>
              <span className={styles.swatchToken}>--border-subtle</span>
              <span className={styles.swatchValue}>{theme === 'light' ? '#C2D7E1' : '#373737'}</span>
            </div>
          </div>

          <div className={styles.colorSwatch}>
            <div className={styles.swatchPreview} style={{ backgroundColor: 'var(--text-primary)' }} />
            <div className={styles.swatchMeta}>
              <span className={styles.swatchName}>Texto Primário</span>
              <span className={styles.swatchToken}>--text-primary</span>
              <span className={styles.swatchValue}>{theme === 'light' ? '#373737' : '#EDEDED'}</span>
            </div>
          </div>

          <div className={styles.colorSwatch}>
            <div className={styles.swatchPreview} style={{ backgroundColor: 'var(--primary)' }} />
            <div className={styles.swatchMeta}>
              <span className={styles.swatchName}>Ação Primária (Brand)</span>
              <span className={styles.swatchToken}>--primary</span>
              <span className={styles.swatchValue}>{theme === 'light' ? '#0284C7' : '#38BDF8'}</span>
            </div>
          </div>
        </div>

        {/* Alertas Anti-Pânico / Feedback Semântico com Efeito de Caixa */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📦</span>
                <span>Feedback Semântico: Comparativo de Efeito de Caixas (CubeBox WMS)</span>
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Escolha o estilo tátil ideal para representar alertas e eventos de logística.
              </p>
            </div>

            {/* Seletor de Estilo de Caixa */}
            <div className={styles.boxStyleTabs} role="tablist" aria-label="Estilo de Caixa para Feedback Semântico">
              <button
                type="button"
                className={`${styles.boxTabBtn} ${feedbackBoxStyle === '3d-crate' ? styles.boxTabBtnActive : ''}`}
                onClick={() => setFeedbackBoxStyle('3d-crate')}
              >
                <span>📦</span> Opção 1: Caixa 3D Tátil (Crate)
              </button>
              <button
                type="button"
                className={`${styles.boxTabBtn} ${feedbackBoxStyle === 'tape-sealed' ? styles.boxTabBtnActive : ''}`}
                onClick={() => setFeedbackBoxStyle('tape-sealed')}
              >
                <span>🏷️</span> Opção 2: Lacre / Encomenda WMS
              </button>
              <button
                type="button"
                className={`${styles.boxTabBtn} ${feedbackBoxStyle === 'elevated-cube' ? styles.boxTabBtnActive : ''}`}
                onClick={() => setFeedbackBoxStyle('elevated-cube')}
              >
                <span>💎</span> Opção 3: Cubo Elevado Executive
              </button>
              <button
                type="button"
                className={`${styles.boxTabBtn} ${feedbackBoxStyle === 'original' ? styles.boxTabBtnActive : ''}`}
                onClick={() => setFeedbackBoxStyle('original')}
              >
                <span>📐</span> Atual (Borda 4px Flat)
              </button>
            </div>
          </div>

          {/* Badge Informativo do Estilo Selecionado */}
          <div className={styles.boxStyleBadgeBar}>
            {feedbackBoxStyle === '3d-crate' && (
              <span><strong>Opção 1 (Caixa 3D Tátil / Crate):</strong> Sombra facetada com profundidade física sólida (4px), chanfro superior e afundamento mecânico tátil no hover/active.</span>
            )}
            {feedbackBoxStyle === 'tape-sealed' && (
              <span><strong>Opção 2 (Lacre de Encomenda WMS):</strong> Estilo envelope de remessa logística com fita adesiva/lacre superior estampada com carimbo semântico e textura de papelão reforçado.</span>
            )}
            {feedbackBoxStyle === 'elevated-cube' && (
              <span><strong>Opção 3 (Cubo Elevado Executive):</strong> Estética Quiet Luxury com chanfro interno de luz superior (inset bevel), sombras multicamadas em difusão e elevação ao passar o mouse.</span>
            )}
            {feedbackBoxStyle === 'original' && (
              <span><strong>Atual (Flat 2D com Borda-Guia 4px):</strong> Estilo minimalista plano com borda sólida à esquerda e sem volume 3D.</span>
            )}
          </div>

          <div className={styles.alertsColumn}>
            {/* Sucesso */}
            <div className={`${styles.alertCard} ${styles.alertSuccess} ${styles[`box_${feedbackBoxStyle}`]}`}>
              {feedbackBoxStyle === 'tape-sealed' && <span className={`${styles.tapeSeal} ${styles.tapeSuccess}`}>LACRE DE CONFORMIDADE SEFAZ</span>}
              <div className={styles.alertLeft}>
                <span className={styles.alertIcon}>✅</span>
                <div className={styles.alertTexts}>
                  <span className={styles.alertTitle}>NF-e Autorizada com Sucesso na SEFAZ</span>
                  <span className={styles.alertDesc}>Estoque baixado via custo médio ponderado (CMP / CPC 16). Protocolo #2026-8841.</span>
                </div>
              </div>
              <div className={styles.alertRightSide}>
                <span className={styles.boxTag}>PROTOCOLO SEFAZ</span>
                <span className={styles.alertRatio}>Contraste &gt; 11:1 (AAA)</span>
              </div>
            </div>

            {/* Aviso */}
            <div className={`${styles.alertCard} ${styles.alertWarning} ${styles[`box_${feedbackBoxStyle}`]}`}>
              {feedbackBoxStyle === 'tape-sealed' && <span className={`${styles.tapeSeal} ${styles.tapeWarning}`}>AVISO DE QUARENTENA / ROP</span>}
              <div className={styles.alertLeft}>
                <span className={styles.alertIcon}>⚠️</span>
                <div className={styles.alertTexts}>
                  <span className={styles.alertTitle}>Atenção: Estoque de Segurança Atingido</span>
                  <span className={styles.alertDesc}>Restam 8 caixas no Armazém Central. Sugerido pedido de ressuprimento.</span>
                </div>
              </div>
              <div className={styles.alertRightSide}>
                <span className={styles.boxTag}>ROP CRÍTICO</span>
                <span className={styles.alertRatio}>Contraste &gt; 11:1 (AAA)</span>
              </div>
            </div>

            {/* Perigo */}
            <div className={`${styles.alertCard} ${styles.alertDanger} ${styles[`box_${feedbackBoxStyle}`]}`}>
              {feedbackBoxStyle === 'tape-sealed' && <span className={`${styles.tapeSeal} ${styles.tapeDanger}`}>BLOQUEIO OPERACIONAL</span>}
              <div className={styles.alertLeft}>
                <span className={styles.alertIcon}>🛑</span>
                <div className={styles.alertTexts}>
                  <span className={styles.alertTitle}>Risco Crítico de Ruptura de Estoque</span>
                  <span className={styles.alertDesc}>Previsão de esgotamento nas próximas 48 horas. Vendas balcão suspensas para o lote.</span>
                </div>
              </div>
              <div className={styles.alertRightSide}>
                <span className={styles.boxTag}>RUPTURA IMINENTE</span>
                <span className={styles.alertRatio}>Contraste &gt; 11:1 (AAA)</span>
              </div>
            </div>

            {/* Info */}
            <div className={`${styles.alertCard} ${styles.alertInfo} ${styles[`box_${feedbackBoxStyle}`]}`}>
              {feedbackBoxStyle === 'tape-sealed' && <span className={`${styles.tapeSeal} ${styles.tapeInfo}`}>LOGÍSTICA & AUDITORIA</span>}
              <div className={styles.alertLeft}>
                <span className={styles.alertIcon}>ℹ️</span>
                <div className={styles.alertTexts}>
                  <span className={styles.alertTitle}>Auditoria de Inventário Físico Agendada</span>
                  <span className={styles.alertDesc}>Contagem cíclica de caixas programada para o fechamento do turno B.</span>
                </div>
              </div>
              <div className={styles.alertRightSide}>
                <span className={styles.boxTag}>CONCILIAÇÃO WMS</span>
                <span className={styles.alertRatio}>Contraste &gt; 11:1 (AAA)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilar 2: Grade Geométrica de Espaçamento */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>📐</span>
            <span>Pilar 2: Grade Geométrica de Espaçamento (Base-4 / Base-8)</span>
          </h2>
          <span className={styles.sectionBadge}>Adeus aos Valores Arbitrários</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Todo espaçamento no CubeBox respeita uma progressão geométrica padrão de 4px e 8px para garantir ritmo visual uniforme.
        </p>

        <div className={styles.spacingGrid}>
          <div className={styles.spacingItem}>
            <div className={styles.spacingVisual} style={{ height: 'var(--space-0-5)' }} />
            <span className={styles.spacingLabel}>--space-0-5</span>
            <span className={styles.spacingValue}>2px</span>
          </div>
          <div className={styles.spacingItem}>
            <div className={styles.spacingVisual} style={{ height: 'var(--space-1)' }} />
            <span className={styles.spacingLabel}>--space-1</span>
            <span className={styles.spacingValue}>4px</span>
          </div>
          <div className={styles.spacingItem}>
            <div className={styles.spacingVisual} style={{ height: 'var(--space-2)' }} />
            <span className={styles.spacingLabel}>--space-2</span>
            <span className={styles.spacingValue}>8px</span>
          </div>
          <div className={styles.spacingItem}>
            <div className={styles.spacingVisual} style={{ height: 'var(--space-3)' }} />
            <span className={styles.spacingLabel}>--space-3</span>
            <span className={styles.spacingValue}>12px</span>
          </div>
          <div className={styles.spacingItem}>
            <div className={styles.spacingVisual} style={{ height: 'var(--space-4)' }} />
            <span className={styles.spacingLabel}>--space-4</span>
            <span className={styles.spacingValue}>16px</span>
          </div>
          <div className={styles.spacingItem}>
            <div className={styles.spacingVisual} style={{ height: 'var(--space-6)' }} />
            <span className={styles.spacingLabel}>--space-6</span>
            <span className={styles.spacingValue}>24px</span>
          </div>
          <div className={styles.spacingItem}>
            <div className={styles.spacingVisual} style={{ height: 'var(--space-8)' }} />
            <span className={styles.spacingLabel}>--space-8</span>
            <span className={styles.spacingValue}>32px</span>
          </div>
          <div className={styles.spacingItem}>
            <div className={styles.spacingVisual} style={{ height: 'var(--space-12)' }} />
            <span className={styles.spacingLabel}>--space-12</span>
            <span className={styles.spacingValue}>48px</span>
          </div>
        </div>
      </section>

      {/* Pilar 3: Stacking Context & Z-Index */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🥞</span>
            <span>Pilar 3: Sistema Semântico de Z-Index (Anti-Z-Index War)</span>
          </h2>
          <span className={styles.sectionBadge}>Sem 99999 Espalhados</span>
        </div>

        <div className={styles.tokenTableWrapper}>
          <table className={styles.tokenTable}>
            <thead>
              <tr>
                <th>Token Semântico</th>
                <th>Valor Numérico</th>
                <th>Camada de Uso no CubeBox</th>
                <th>Exemplo Operacional</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.tabularNum}>--z-base</td>
                <td className={styles.tabularNum}>0</td>
                <td>Fluxo Natural do DOM</td>
                <td>Cards de KPI, tabelas e canvas geral</td>
              </tr>
              <tr>
                <td className={styles.tabularNum}>--z-table-sticky</td>
                <td className={styles.tabularNum}>10</td>
                <td>Cabeçalhos Fixos</td>
                <td>Cabeçalho e colunas fixas de SKUs com scroll horizontal</td>
              </tr>
              <tr>
                <td className={styles.tabularNum}>--z-nav</td>
                <td className={styles.tabularNum}>100</td>
                <td>Navegação Global</td>
                <td>Navbar superior fixa e alternador de abas</td>
              </tr>
              <tr>
                <td className={styles.tabularNum}>--z-dropdown</td>
                <td className={styles.tabularNum}>1000</td>
                <td>Menus Contextuais</td>
                <td>Combobox de busca de produtos e filtros avançados</td>
              </tr>
              <tr>
                <td className={styles.tabularNum}>--z-drawer</td>
                <td className={styles.tabularNum}>1200</td>
                <td>Painéis Deslizantes</td>
                <td>Carrinho lateral de PDV e detalhes do armazém</td>
              </tr>
              <tr>
                <td className={styles.tabularNum}>--z-modal</td>
                <td className={styles.tabularNum}>1300</td>
                <td>Janelas de Bloqueio</td>
                <td>Abertura de caixa, emissão de NF-e e sangria</td>
              </tr>
              <tr>
                <td className={styles.tabularNum}>--z-toast</td>
                <td className={styles.tabularNum}>1500</td>
                <td>Notificações Globais</td>
                <td>Toasts de alerta SEFAZ e confirmações críticas no topo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pilar 4: Elevações & Sombras Compostas */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🌗</span>
            <span>Pilar 4: Elevações & Sombras Compostas (Direct + Ambient Light)</span>
          </h2>
          <span className={styles.sectionBadge}>Multi-Layer Shadows</span>
        </div>

        <div className={styles.elevationGrid}>
          <div className={styles.elevationCard} style={{ boxShadow: 'var(--shadow-sm)' }}>
            <span className={styles.elevationTitle}>Elevação Sutil</span>
            <span className={styles.elevationToken}>--shadow-sm</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cards normais & botões</span>
          </div>

          <div className={styles.elevationCard} style={{ boxShadow: 'var(--shadow-md)' }}>
            <span className={styles.elevationTitle}>Elevação Média</span>
            <span className={styles.elevationToken}>--shadow-md</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cards em hover & dropdowns</span>
          </div>

          <div className={styles.elevationCard} style={{ boxShadow: 'var(--shadow-lg)' }}>
            <span className={styles.elevationTitle}>Elevação Profunda</span>
            <span className={styles.elevationToken}>--shadow-lg</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Drawers laterais</span>
          </div>

          <div className={styles.elevationCard} style={{ boxShadow: 'var(--shadow-modal)' }}>
            <span className={styles.elevationTitle}>Elevação Máxima</span>
            <span className={styles.elevationToken}>--shadow-modal</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Modais flutuantes</span>
          </div>
        </div>
      </section>

      {/* Pilar 5: Geometria de Bordas & Radii */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🔲</span>
            <span>Pilar 5: Geometria de Bordas & Radii Padronizados</span>
          </h2>
          <span className={styles.sectionBadge}>Corner Consistency</span>
        </div>

        <div className={styles.radiiGrid}>
          <div className={styles.radiiCard}>
            <div className={styles.radiiBox} style={{ borderRadius: 'var(--radius-xs)' }} />
            <span className={styles.elevationTitle}>--radius-xs</span>
            <span className={styles.elevationToken}>4px (Tags/Badges)</span>
          </div>
          <div className={styles.radiiCard}>
            <div className={styles.radiiBox} style={{ borderRadius: 'var(--radius-sm)' }} />
            <span className={styles.elevationTitle}>--radius-sm</span>
            <span className={styles.elevationToken}>6px (Inputs/Buttons)</span>
          </div>
          <div className={styles.radiiCard}>
            <div className={styles.radiiBox} style={{ borderRadius: 'var(--radius-md)' }} />
            <span className={styles.elevationTitle}>--radius-md</span>
            <span className={styles.elevationToken}>10px (Cards Padrão)</span>
          </div>
          <div className={styles.radiiCard}>
            <div className={styles.radiiBox} style={{ borderRadius: 'var(--radius-lg)' }} />
            <span className={styles.elevationTitle}>--radius-lg</span>
            <span className={styles.elevationToken}>16px (Modais/Cockpit)</span>
          </div>
          <div className={styles.radiiCard}>
            <div className={styles.radiiBox} style={{ borderRadius: 'var(--radius-full)' }} />
            <span className={styles.elevationTitle}>--radius-full</span>
            <span className={styles.elevationToken}>Pills / Avatares</span>
          </div>
        </div>
      </section>

      {/* Pilar 6: Opacidades Semânticas */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🌫️</span>
            <span>Pilar 6: Escala de Opacidades Semânticas</span>
          </h2>
          <span className={styles.sectionBadge}>WCAG Legibility Standard</span>
        </div>

        <div className={styles.opacityGrid}>
          <div className={styles.opacityCard}>
            <div className={styles.opacitySample} style={{ opacity: 'var(--opacity-disabled)' }}>
              Desabilitado (0.38)
            </div>
            <span className={styles.elevationTitle}>--opacity-disabled</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Botões e inputs inativos</span>
          </div>

          <div className={styles.opacityCard}>
            <div className={styles.opacitySample} style={{ opacity: '0.60' }}>
              Backdrop Modal (0.60)
            </div>
            <span className={styles.elevationTitle}>--opacity-backdrop</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Fundo escurecido atrás de modal</span>
          </div>

          <div className={styles.opacityCard}>
            <div className={styles.opacitySample} style={{ opacity: '1.0' }}>
              Ativo / Pleno (1.00)
            </div>
            <span className={styles.elevationTitle}>Opacidade Plena</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Elementos 100% visíveis</span>
          </div>
        </div>
      </section>

      {/* Pilar 7: Breakpoints & Contêineres */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🖥️</span>
            <span>Pilar 7: Breakpoints & Limites de Container Responsivo</span>
          </h2>
          <span className={styles.sectionBadge}>Tablet POS até Ultrawide</span>
        </div>

        <div className={styles.tokenTableWrapper}>
          <table className={styles.tokenTable}>
            <thead>
              <tr>
                <th>Token do Container</th>
                <th>Largura Máxima</th>
                <th>Alvo de Dispositivo</th>
                <th>Cenário de Negócio CubeBox</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.tabularNum}>--container-sm</td>
                <td className={styles.tabularNum}>640px</td>
                <td>Tablets Compactos & Celulares</td>
                <td>Frente de Caixa (POS Balcão) em modo terminal único</td>
              </tr>
              <tr>
                <td className={styles.tabularNum}>--container-md</td>
                <td className={styles.tabularNum}>768px</td>
                <td>Tablets Verticais & iPads</td>
                <td>Conferência física de inventário com leitor de código de barras</td>
              </tr>
              <tr>
                <td className={styles.tabularNum}>--container-lg</td>
                <td className={styles.tabularNum}>1024px</td>
                <td>Laptops / Desktops Pequenos</td>
                <td>Gestão de estoque diária e emissão fiscal</td>
              </tr>
              <tr>
                <td className={styles.tabularNum}>--container-xl</td>
                <td className={styles.tabularNum}>1280px</td>
                <td>Monitores Desktop Padrão</td>
                <td>Dashboard Cockpit executivo do gestor</td>
              </tr>
              <tr>
                <td className={styles.tabularNum}>--container-2xl</td>
                <td className={styles.tabularNum}>1536px</td>
                <td>Monitores Ultrawide / Centros de Controle</td>
                <td>Painel de controle multi-armazém em tempo real</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* DIMENSÃO 2: TIPOGRAFIA, RITMO VERTICAL & NUMERAIS (NOVA SEÇÃO) */}
      <section className={styles.section} style={{ borderLeft: '4px solid var(--primary)' }}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🔤</span>
            <span>Dimensão 2: Tipografia & Font Pairing Playground (3 Opções + 1 Extra)</span>
          </h2>
          <span className={styles.sectionBadge}>Personalidade & Performance</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Alterne entre as 4 combinações tipográficas abaixo para inspecionar em tempo real o ganho de personalidade e autoridade visual no CubeBox:
        </p>

        {/* Font Pairing Selector Tabs */}
        <div className={styles.fontPresetTabs} role="tablist" aria-label="Seletor de Combinações Tipográficas">
          <button
            type="button"
            className={`${styles.fontPresetBtn} ${activeFontPreset === 'preset-1' ? styles.fontPresetBtnActive : ''}`}
            onClick={() => setActiveFontPreset('preset-1')}
          >
            ⚡ Opção 1: Geist Neo-Grotesca (Linear/Vercel)
          </button>
          <button
            type="button"
            className={`${styles.fontPresetBtn} ${activeFontPreset === 'preset-2' ? styles.fontPresetBtnActive : ''}`}
            onClick={() => setActiveFontPreset('preset-2')}
          >
            💼 Opção 2: Plus Jakarta + Inter (Fintech Premium)
          </button>
          <button
            type="button"
            className={`${styles.fontPresetBtn} ${activeFontPreset === 'preset-3' ? styles.fontPresetBtnActive : ''}`}
            onClick={() => setActiveFontPreset('preset-3')}
          >
            🏭 Opção 3: Space Grotesk + DM Sans (Industrial Tech)
          </button>
          <button
            type="button"
            className={`${styles.fontPresetBtn} ${activeFontPreset === 'preset-4' ? styles.fontPresetBtnActive : ''}`}
            onClick={() => setActiveFontPreset('preset-4')}
          >
            ✨ Opção 4 (Extra): Instrument Serif + Geist (Quiet Luxury)
          </button>
        </div>

        {/* Live Preview Card da Combinação Selecionada */}
        <div
          className={styles.pairingPreviewCard}
          style={{
            fontFamily:
              activeFontPreset === 'preset-1'
                ? "'Geist', sans-serif"
                : activeFontPreset === 'preset-2'
                ? "'Plus Jakarta Sans', sans-serif"
                : activeFontPreset === 'preset-3'
                ? "'DM Sans', sans-serif"
                : "'Geist', sans-serif",
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={styles.pairingBadge}>
              {activeFontPreset === 'preset-1' && 'TÍTULOS: GEIST SANS (700) • CORPO: GEIST (400) • MONO: GEIST MONO'}
              {activeFontPreset === 'preset-2' && 'TÍTULOS: PLUS JAKARTA SANS (700) • CORPO: INTER (400) • MONO: JETBRAINS MONO'}
              {activeFontPreset === 'preset-3' && 'TÍTULOS: SPACE GROTESK (700) • CORPO: DM SANS (400) • MONO: GEIST MONO'}
              {activeFontPreset === 'preset-4' && 'TÍTULOS: INSTRUMENT SERIF (400) • CORPO: GEIST (400) • MONO: GEIST MONO'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>Preview Dinâmico</span>
          </div>

          <div
            style={{
              fontSize: activeFontPreset === 'preset-4' ? '36px' : '28px',
              fontWeight: activeFontPreset === 'preset-4' ? 400 : 700,
              fontFamily:
                activeFontPreset === 'preset-1'
                  ? "'Geist', sans-serif"
                  : activeFontPreset === 'preset-2'
                  ? "'Plus Jakarta Sans', sans-serif"
                  : activeFontPreset === 'preset-3'
                  ? "'Space Grotesk', sans-serif"
                  : "'Instrument Serif', serif",
              lineHeight: 1.15,
              color: 'var(--text-primary)',
            }}
          >
            {activeFontPreset === 'preset-4' ? 'Cockpit de Gestão & Inteligência Analítica' : 'CubeBox: Operação Multi-Armazém & POS'}
          </div>

          <div style={{ fontSize: '15px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            O algoritmo de alocação atômica calcula o saldo físico e contábil em tempo real. Cada emissão fiscal autorizada na SEFAZ liquida o estoque imediatamente, evitando riscos de ruptura e vendas duplicadas (anti-overselling).
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginTop: 'var(--space-2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Valor Total em Estoque</span>
              <span
                className={styles.tabularNum}
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: activeFontPreset === 'preset-1' ? "'Geist Mono', monospace" : "'JetBrains Mono', monospace",
                }}
              >
                R$ 1.849.320,50
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Giro Médio (Lead Time)</span>
              <span
                className={styles.tabularNum}
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--status-success)',
                  fontFamily: activeFontPreset === 'preset-1' ? "'Geist Mono', monospace" : "'JetBrains Mono', monospace",
                }}
              >
                4,2 dias (Ótimo)
              </span>
            </div>
          </div>
        </div>

        {/* Escala Detalhada Minor Third */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
            Escala Tipográfica Hierárquica (Minor Third 1.200)
          </h3>
          <div className={styles.typeScaleGrid}>
            <div className={styles.typeScaleRow}>
              <div className={styles.typeMeta}>
                <span className={styles.typeTag}>Display Macro</span>
                <span className={styles.typeSpecs}>32px / 1.20 tight</span>
              </div>
              <div
                className={styles.typeSample}
                style={{
                  fontSize: 'var(--font-size-3xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: 'var(--leading-tight)',
                  fontFamily:
                    activeFontPreset === 'preset-3'
                      ? "'Space Grotesk', sans-serif"
                      : activeFontPreset === 'preset-4'
                      ? "'Instrument Serif', serif"
                      : activeFontPreset === 'preset-2'
                      ? "'Plus Jakarta Sans', sans-serif"
                      : "'Geist', sans-serif",
                }}
              >
                R$ 2.489.120,45 CMP
              </div>
            </div>

            <div className={styles.typeScaleRow}>
              <div className={styles.typeMeta}>
                <span className={styles.typeTag}>Heading 1</span>
                <span className={styles.typeSpecs}>26px / 1.20 tight</span>
              </div>
              <div
                className={styles.typeSample}
                style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: 'var(--leading-tight)',
                  fontFamily:
                    activeFontPreset === 'preset-3'
                      ? "'Space Grotesk', sans-serif"
                      : activeFontPreset === 'preset-4'
                      ? "'Instrument Serif', serif"
                      : activeFontPreset === 'preset-2'
                      ? "'Plus Jakarta Sans', sans-serif"
                      : "'Geist', sans-serif",
                }}
              >
                Cockpit de Gestão & Indicadores Multi-Armazém
              </div>
            </div>

            <div className={styles.typeScaleRow}>
              <div className={styles.typeMeta}>
                <span className={styles.typeTag}>Heading 2</span>
                <span className={styles.typeSpecs}>22px / 1.35 snug</span>
              </div>
              <div
                className={styles.typeSample}
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  lineHeight: 'var(--leading-snug)',
                  fontFamily:
                    activeFontPreset === 'preset-3'
                      ? "'Space Grotesk', sans-serif"
                      : activeFontPreset === 'preset-2'
                      ? "'Plus Jakarta Sans', sans-serif"
                      : "'Geist', sans-serif",
                }}
              >
                Auditoria de Posição de Estoque & Balcão POS
              </div>
            </div>

            <div className={styles.typeScaleRow}>
              <div className={styles.typeMeta}>
                <span className={styles.typeTag}>Body Regular</span>
                <span className={styles.typeSpecs}>15px / 1.50 normal</span>
              </div>
              <div
                className={styles.typeSample}
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-regular)',
                  lineHeight: 'var(--leading-normal)',
                  fontFamily:
                    activeFontPreset === 'preset-3'
                      ? "'DM Sans', sans-serif"
                      : activeFontPreset === 'preset-1'
                      ? "'Geist', sans-serif"
                      : "'Inter', sans-serif",
                }}
              >
                O sistema calcula automaticamente a alocação atômica evitando overselling e emitindo NF-e de contingência em menos de 150ms.
              </div>
            </div>

            <div className={styles.typeScaleRow}>
              <div className={styles.typeMeta}>
                <span className={styles.typeTag}>Table & Meta</span>
                <span className={styles.typeSpecs}>13px / 1.35 snug</span>
              </div>
              <div
                className={styles.typeSample}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-secondary)',
                  fontFamily:
                    activeFontPreset === 'preset-1'
                      ? "'Geist Mono', monospace"
                      : "'JetBrains Mono', monospace",
                }}
              >
                SKU: PRD-9941 • Lote: L2026-B • Armazém Central Box-04 • Entrada: 22/10/2026 14:32
              </div>
            </div>
          </div>
        </div>

        {/* Truncamento e Numerais OpenType */}
        <div style={{ marginTop: 'var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          {/* Truncation */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              Utilitários de Truncamento Seguro (Zero Quebra de Layout)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Truncamento Linha Única (.truncate-single):</span>
              <div className={styles.truncateSingle} title="Refrigerante Cola Lata 350ml Edição Especial Sabor Original Caixa com 24 unidades">
                Refrigerante Cola Lata 350ml Edição Especial Sabor Original Caixa com 24 unidades
              </div>

              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>Truncamento em 2 Linhas (.truncate-line-2):</span>
              <div className={styles.truncateLine2} title="Descrição técnica expandida do produto químico com normas de segurança fiscal, estocagem em temperatura ambiente e instruções de descarte seguro do lote.">
                Descrição técnica expandida do produto químico com normas de segurança fiscal, estocagem em temperatura ambiente e instruções de descarte seguro do lote.
              </div>
            </div>
          </div>

          {/* Tabular Nums */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
              Comparativo Óptico: Proporcional vs. Tabular Nums
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              Observe como os pontos e vírgulas alinham com precisão milimétrica em <code>tabular-nums</code>, impedindo tremores na tela.
            </p>
            <div className={styles.tokenTableWrapper}>
              <table className={styles.tokenTable}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Comum (Jitter)</th>
                    <th>Tabular Nums (Estável)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Qtd A</td>
                    <td>1.111,11 un</td>
                    <td className={styles.tabularNum}>1.111,11 un</td>
                  </tr>
                  <tr>
                    <td>Qtd B</td>
                    <td>8.888,88 un</td>
                    <td className={styles.tabularNum}>8.888,88 un</td>
                  </tr>
                  <tr>
                    <td>Total</td>
                    <td>R$ 11.999,00</td>
                    <td className={styles.tabularNum}>R$ 11.999,00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* DIMENSÃO 3: ACESSIBILIDADE WCAG 2.1 AA (LAB INTERATIVO) */}
      <section className={styles.section} style={{ borderLeft: '4px solid var(--status-success)' }}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>♿</span>
            <span>Dimensão 3: Acessibilidade & Focus Lab (WCAG 2.1 AA / AAA)</span>
          </h2>
          <span className={styles.sectionBadge}>Navegação Teclado & Zero Traps</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Pressione <kbd style={{ padding: '2px 6px', background: 'var(--bg-inset)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>Tab</kbd> para navegar interativamente entre os elementos abaixo e testar o anel de foco visível duplo (Focus Ring), os limites de toque de 44px e os alertas ARIA:
        </p>

        <div className={styles.a11yGrid}>
          {/* Card 1: Focus Ring & Teclado */}
          <div className={styles.a11yCard}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>1. Focus Ring Duplo (:focus-visible)</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Não aparece em cliques de mouse, mas aciona anel nítido de 2px + offset ao navegar via teclado.
            </p>
            <button type="button" className={styles.accessibleFocusBtn}>
              Pressione Tab para Focar
            </button>
          </div>

          {/* Card 2: Touch Target 44px */}
          <div className={styles.a11yCard}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>2. Alvo de Toque Mínimo (44px)</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Previne erros de toque em tablets POS balcão com dedos de operadores.
            </p>
            <input
              type="text"
              className={styles.accessibleInput}
              placeholder="Campo com min-height de 44px"
              aria-label="Campo de teste de acessibilidade de toque"
            />
          </div>

          {/* Card 3: Screen Reader Announcer */}
          <div className={styles.a11yCard}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>3. Região Viva (ARIA Live)</span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Anuncia em segundo plano para deficientes visuais sem interromper a navegação.
            </p>
            <div
              role="status"
              aria-live="polite"
              style={{
                fontSize: '12px',
                padding: 'var(--space-2) var(--space-3)',
                background: 'var(--status-success-subtle)',
                color: 'var(--status-success)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}
            >
              [aria-live="polite"]: Estoque atualizado: 1.240 un.
            </div>
          </div>
        </div>
      </section>

      {/* DIMENSÃO 4: COMPONENTES ATÔMICOS (LAB INTERATIVO) */}
      <section className={styles.section} style={{ borderLeft: '4px solid var(--primary)' }}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🧩</span>
            <span>Dimensão 4: Biblioteca de Componentes Atômicos (Atoms &amp; Molecules)</span>
          </h2>
          <span className={styles.sectionBadge}>Formulários, Feedback &amp; Exibição de Dados</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Catálogo funcional dos blocos atômicos essenciais que compõem os cockpits operacionais do CubeBox (Frente de Caixa POS, Cockpit de Estoque e Dashboard Executivo).
        </p>

        <div className={styles.atomicGrid}>
          {/* Card 1: Botões & Action Pills */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>1. Botões &amp; Action Pills</span>
              <span className={styles.atomicSubtext}>Variantes, Escalas &amp; Loading</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                  Variantes de Ação:
                </span>
                <div className={styles.btnGroup}>
                  <button type="button" className={`${styles.btnBase} ${styles.btnMd} ${styles.btnPrimary}`}>
                    Primary
                  </button>
                  <button type="button" className={`${styles.btnBase} ${styles.btnMd} ${styles.btnSecondary}`}>
                    Secondary
                  </button>
                  <button type="button" className={`${styles.btnBase} ${styles.btnMd} ${styles.btnDanger}`}>
                    Danger
                  </button>
                  <button type="button" className={`${styles.btnBase} ${styles.btnMd} ${styles.btnGhost}`}>
                    Ghost
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                  Escalas de Tamanho (sm, md [44px touch], lg):
                </span>
                <div className={styles.btnGroup}>
                  <button type="button" className={`${styles.btnBase} ${styles.btnSm} ${styles.btnPrimary}`}>
                    Small (28px)
                  </button>
                  <button type="button" className={`${styles.btnBase} ${styles.btnMd} ${styles.btnPrimary}`}>
                    Medium (44px)
                  </button>
                  <button type="button" className={`${styles.btnBase} ${styles.btnLg} ${styles.btnPrimary}`}>
                    Large (48px)
                  </button>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                  Estado de Carregamento (Loading State com Spinner):
                </span>
                <div className={styles.btnGroup}>
                  <button
                    type="button"
                    className={`${styles.btnBase} ${styles.btnMd} ${styles.btnPrimary} ${btnLoading ? styles.btnLoading : ''}`}
                    onClick={() => setBtnLoading(!btnLoading)}
                  >
                    {btnLoading ? (
                      <>
                        <span className={styles.spinner} aria-hidden="true" />
                        <span>Processando SEFAZ...</span>
                      </>
                    ) : (
                      'Simular Ação de Carregamento'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Formulários & Entradas */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>2. Formulários &amp; Masked Inputs</span>
              <span className={styles.atomicSubtext}>Máscara Fiscal, Helpers &amp; Erros</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <TextInput
                label="CNPJ do Fornecedor / Destinatário"
                mask="cnpj"
                value={cnpjVal}
                onChange={(e) => setCnpjVal(e.target.value)}
                placeholder="00.000.000/0000-00"
                helperText="Validação automática de 14 dígitos com máscara estrita"
              />

              <TextInput
                label="Telefone / Celular Comercial"
                mask="phone"
                value={phoneVal}
                onChange={(e) => setPhoneVal(e.target.value)}
                placeholder="(00) 00000-0000"
                helperText="Máscara dinâmica para fixo (10 dígitos) ou celular (11 dígitos)"
              />

              <TextInput
                label="CEP do Estabelecimento"
                mask="cep"
                value={cepVal}
                onChange={(e) => setCepVal(e.target.value)}
                placeholder="00000-000"
                helperText="Formatação postal automática de 8 dígitos"
              />

              <TextInput
                label="Inscrição Estadual (Estado Inválido)"
                defaultValue="ISENTO-999"
                error="⚠️ Inscrição Estadual não homologada no Sintegra para este tenant."
              />

              {/* Toggle Switch */}
              <div
                className={styles.toggleWrapper}
                onClick={() => setToggleActive(!toggleActive)}
                role="switch"
                aria-checked={toggleActive}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setToggleActive(!toggleActive);
                  }
                }}
              >
                <div className={`${styles.toggleSwitch} ${toggleActive ? styles.toggleSwitchActive : ''}`}>
                  <div className={`${styles.toggleThumb} ${toggleActive ? styles.toggleThumbActive : ''}`} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {toggleActive ? 'Anti-Overselling Ativo' : 'Anti-Overselling Desativado'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Bloqueio atômico de venda a descoberto no POS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Feedback Semântico & Badges com Pulso */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>3. Feedback &amp; Badges com Pulso</span>
              <span className={styles.atomicSubtext}>Status Vivo da Operação</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Indicadores de Status com Pulso em Tempo Real:
                </span>
                <div className={styles.badgeContainer}>
                  <Badge status="success" pulse>
                    ONLINE • SEFAZ RS
                  </Badge>
                  <Badge status="warning" pulse>
                    ALERT • ESTOQUE BAIXO
                  </Badge>
                  <Badge status="danger" pulse>
                    CRITICAL • CAIXA FECHADO
                  </Badge>
                  <Badge status="info" pulse>
                    SYNC • MOTOR FAST-MCP
                  </Badge>
                </div>
              </div>

              {/* Toast Preview */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Notificação Toast (Autoclose &amp; Resiliência):
                  </span>
                  <button
                    type="button"
                    style={{ fontSize: '11px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => setShowToast(!showToast)}
                  >
                    {showToast ? 'Ocultar' : 'Exibir'}
                  </button>
                </div>

                {showToast && (
                  <div className={styles.toastPreview} role="alert">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span>✅</span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>NFS-e Emitida com Sucesso</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Lote #8849 homologado pela SEFAZ.</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
                      onClick={() => setShowToast(false)}
                      aria-label="Fechar notificação"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: StatCard & KPI Tile */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>4. StatCard / KPI Tile</span>
              <span className={styles.atomicSubtext}>Exibição Numérica Tabular &amp; Variação</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className={styles.kpiTile}>
                <div className={styles.kpiHeader}>
                  <span>Faturamento Hoje</span>
                  <span>💰</span>
                </div>
                <div className={styles.kpiValue}>
                  R$ 48.920,00
                </div>
                <div className={`${styles.kpiTrend} ${styles.trendUp}`}>
                  <span>↑ +14.2%</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs ontem</span>
                </div>
              </div>

              <div className={styles.kpiTile}>
                <div className={styles.kpiHeader}>
                  <span>Risco de Ruptura</span>
                  <span>⚠️</span>
                </div>
                <div className={styles.kpiValue}>
                  3 itens
                </div>
                <div className={`${styles.kpiTrend} ${styles.trendDown}`}>
                  <span>↓ -2 itens</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>em quarentena</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Chão de Loja & POS (Barcode Scanner & Hotkey Button) */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>5. Chão de Loja &amp; Leitor de Código de Barras</span>
              <span className={styles.atomicSubtext}>Atalhos F-Keys &amp; Leitura Rápida</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <BarcodeScannerInput
                value={barcodeScanned}
                onChange={setBarcodeScanned}
                onSubmit={(code) => {
                  setLastScannedResult(`Item capturado: EAN ${code} • Adicionado ao carrinho!`);
                  setBarcodeScanned('');
                }}
              />

              {lastScannedResult && (
                <div
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--status-info-subtle)',
                    color: 'var(--status-info)',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--status-info)',
                  }}
                >
                  {lastScannedResult}
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Button variant="primary" size="md" hotkey="F10">
                  Finalizar Venda
                </Button>
                <Button variant="secondary" size="md" hotkey="F4">
                  Cancelar Pedido
                </Button>
                <Button variant="ghost" size="md" hotkey="F8">
                  Aplicar Desconto
                </Button>
              </div>
            </div>
          </div>

          {/* Card 6: Seletor de Pagamento Tátil POS */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>6. Seletor de Pagamento POS</span>
              <span className={styles.atomicSubtext}>Seleção Instantânea por Teclado/Toque</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <PaymentSelector
                selected={paymentSelected}
                onSelect={(method) => setPaymentSelected(method)}
              />
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Forma ativa: <strong style={{ color: 'var(--primary)' }}>{paymentSelected}</strong> • Pronto para recebimento.
              </div>
            </div>
          </div>

          {/* Card 7: Controle de Validades & Expirações Multiescopo */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>7. Controle de Validades &amp; Expirações</span>
              <span className={styles.atomicSubtext}>Lotes, Orçamentos, Reservas &amp; Produtos</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Vencimentos operacionais em múltiplos âmbitos do negócio:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {/* Lote de Mercadoria */}
                <ExpirationGuardBadge
                  scope="batch"
                  identifier="LOTE-2026-A1"
                  daysRemaining={45}
                  dateFormatted="06/12/2026"
                />
                {/* Produto Perecível Unitário */}
                <ExpirationGuardBadge
                  scope="product"
                  identifier="Café Especial Mogiana 1KG"
                  daysRemaining={12}
                  dateFormatted="03/11/2026"
                />
                {/* Orçamento / Comanda com Prazo de Validade */}
                <ExpirationGuardBadge
                  scope="quote"
                  identifier="#ORC-8841 (Tabela Promocional)"
                  daysRemaining={3}
                  dateFormatted="25/10/2026"
                />
                {/* Reserva Temporária de Estoque */}
                <ExpirationGuardBadge
                  scope="reservation"
                  identifier="Reserva Pedido Balcão #204"
                  daysRemaining={-1}
                  dateFormatted="21/10/2026"
                />
                {/* Licença / Alvará Sanitário / Certidão */}
                <ExpirationGuardBadge
                  scope="license"
                  identifier="Alvará Sanitário Armazém Central"
                  daysRemaining={180}
                  dateFormatted="20/04/2027"
                />
              </div>
            </div>
          </div>

          {/* Card 8: Nível Físico de Estoque & Ponto de Reposição (ROP) */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>8. Nível Físico &amp; Ponto de Reposição (ROP)</span>
              <span className={styles.atomicSubtext}>Geração Autônoma de Reposição</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <StockLevelBar
                currentStock={demoStock}
                ropStock={40}
                maxStock={100}
                uom="UN"
              />

              <div className={styles.simStockGroup}>
                <span className={styles.simStockLabel}>Simular Saldo:</span>
                <button
                  type="button"
                  className={`${styles.simStockBtn} ${styles.simStockSafe}`}
                  onClick={() => setDemoStock(75)}
                >
                  ● 75 un (Seguro)
                </button>
                <button
                  type="button"
                  className={`${styles.simStockBtn} ${styles.simStockWarning}`}
                  onClick={() => setDemoStock(35)}
                >
                  ▲ 35 un (Abaixo ROP)
                </button>
                <button
                  type="button"
                  className={`${styles.simStockBtn} ${styles.simStockCritical}`}
                  onClick={() => setDemoStock(12)}
                >
                  ■ 12 un (Crítico)
                </button>
              </div>
            </div>
          </div>

          {/* Card 9: Comprovante com Marca D'água Obrigatória */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>9. Comprovante Não-Fiscal Indelével</span>
              <span className={styles.atomicSubtext}>Conformidade Legal &amp; Cláusula de Isenção</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ReceiptWatermark
                orderNumber="1042"
                timestamp="22/10/2026 17:50"
                operatorName="João Balcão"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>1x Café Torrado 1KG</span>
                    <span>R$ 38,00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>2x Filtro Especial V60</span>
                    <span>R$ 24,00</span>
                  </div>
                  <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>TOTAL</span>
                    <span>R$ 62,00</span>
                  </div>
                </div>
              </ReceiptWatermark>
            </div>
          </div>

          {/* Card 10: Skeleton Loaders & Empty State Zero Deadlock */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>10. Resiliência: Skeleton &amp; Empty State</span>
              <span className={styles.atomicSubtext}>Transições de Carga &amp; Zero Deadlock</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                  Shimmer Shimmer Placeholders (Sem Layout-Shift):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <SkeletonShimmer height="16px" width="70%" />
                  <SkeletonShimmer height="12px" width="90%" />
                  <SkeletonShimmer height="32px" width="100%" />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                  Empty State com CTA Resolutivo:
                </span>
                <EmptyState
                  icon="📦"
                  title="Nenhum lote em quarentena"
                  description="Todos os recebimentos físicos foram inspecionados e liberados para venda."
                  actionText="Nova Entrada Física"
                  onAction={() => alert('Abrir fluxo de conferência cega')}
                />
              </div>
            </div>
          </div>

          {/* Card 11: Seletor de Quantidades & Unidades (QuantitySelector) */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>11. Seletor de Quantidade (+ / −)</span>
              <span className={styles.atomicSubtext}>Ajuste Rápido de Balcão &amp; UOM</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1-5)' }}>
                  Controle de Itens do Pedido (Mínimo: 1, Máximo: 50):
                </span>
                <QuantitySelector
                  value={demoQuantity}
                  onChange={setDemoQuantity}
                  min={1}
                  max={50}
                  uom="CX"
                />
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Subtotal calculado: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>R$ {(demoQuantity * 45.5).toFixed(2).replace('.', ',')}</strong>
              </div>
            </div>
          </div>

          {/* Card 12: Micro-Ações Rápidas em Linha (QuickActionBar) */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>12. Botões de Ação Rápida</span>
              <span className={styles.atomicSubtext}>Marcar, Favoritar, Editar, Detalhes, Excluir</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1-5)' }}>
                  Barra Compacta de Ações de Chão de Loja:
                </span>
                <QuickActionBar
                  isChecked={isItemChecked}
                  onCheck={() => {
                    setIsItemChecked(!isItemChecked);
                    setQuickActionNotice(isItemChecked ? 'Item desmarcado.' : 'Item marcado para conferência.');
                  }}
                  isFavorite={isItemFavorited}
                  onFavorite={() => {
                    setIsItemFavorited(!isItemFavorited);
                    setQuickActionNotice(isItemFavorited ? 'Removido dos favoritos.' : 'Adicionado aos favoritos de balcão.');
                  }}
                  onEdit={() => setQuickActionNotice('Abrindo edição de SKU...')}
                  onAddInfo={() => setQuickActionNotice('Adicionar nota fiscal/observação aberta.')}
                  isExpanded={isDetailsExpanded}
                  onExpandCollapse={() => {
                    setIsDetailsExpanded(!isDetailsExpanded);
                    setQuickActionNotice(isDetailsExpanded ? 'Detalhes recolhidos.' : 'Detalhes expandidos.');
                  }}
                  onDelete={() => setQuickActionNotice('Confirmar exclusão de item?')}
                />
              </div>

              {quickActionNotice && (
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: 'var(--space-1-5) var(--space-2-5)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                  }}
                >
                  ⚡ {quickActionNotice}
                </div>
              )}
            </div>
          </div>

          {/* Card 13: Slide de Ajuste Contínuo & Combobox Select */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>13. Slide de Ajuste &amp; Select Combobox</span>
              <span className={styles.atomicSubtext}>Desconto Linear &amp; Seleção de Armazém</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <SliderInput
                label="Margem de Desconto Balcão"
                value={demoDiscountSlide}
                onChange={setDemoDiscountSlide}
                min={0}
                max={30}
                step={1}
                unit="%"
              />

              <SelectCombobox
                label="Armazém / Depósito Físico de Origem"
                value={selectedWarehouse}
                onChange={setSelectedWarehouse}
                options={[
                  { value: 'wh-main', label: 'Depósito Central Matriz', badge: 'Principal' },
                  { value: 'wh-front', label: 'Frente de Loja Balcão', badge: 'Giro Rápido' },
                  { value: 'wh-quarantine', label: 'Área de Quarentena / Avarias', badge: 'Bloqueado' },
                ]}
                helperText="Define o ponto de estocagem para baixa física atômica"
              />
            </div>
          </div>

          {/* Card 14: Janelas Modais & Gaveta Lateral (ModalDrawer) */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>14. Modal &amp; Drawer Flyout</span>
              <span className={styles.atomicSubtext}>Janelas com Backdrop Blur &amp; Escape</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2-5)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Demonstração de sobreposições com foco acessível e trava de rolagem:
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
                  Abrir Modal Central
                </Button>
                <Button variant="secondary" size="md" onClick={() => setIsDrawerOpen(true)}>
                  Abrir Drawer Lateral
                </Button>
              </div>
            </div>
          </div>

          {/* Card 15: Moeda Bancária Natural (CurrencyInput) */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>15. Entrada Monetária Bancária</span>
              <span className={styles.atomicSubtext}>Digitação da Direita para a Esquerda</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <CurrencyInput
                label="Preço de Custo Médio / Valor de Venda"
                valueCents={currencyCents}
                onChangeCents={setCurrencyCents}
                helperText="Preenchimento estrito estilo caixa eletrônico e app bancário"
              />
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Valor em centavos no estado da aplicação: <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{currencyCents}</strong>
              </div>
            </div>
          </div>

          {/* Card 16: Campo de Pesquisa em Tempo Real (SearchInput) */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>16. Campo de Pesquisa Rápida</span>
              <span className={styles.atomicSubtext}>Atalhos Enter &amp; Esc para Limpar</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <SearchInput
                label="Consulta de Catálogo / SKUs"
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={(q) => alert(`Buscando catálogo por: "${q}"`)}
                placeholder="Pesquisar por descrição, EAN ou categoria..."
              />
              {searchQuery && (
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  Filtro dinâmico: &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>

          {/* Card 17: Bandeiras Operacionais & Alfândega (FlagBadge) */}
          <div className={styles.atomicCard}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>17. Bandeiras &amp; Origem de Carga</span>
              <span className={styles.atomicSubtext}>Identificação de País, Moeda e Comércio</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Origem alfandegária e tabelas de precificação multimoeda:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <FlagBadge country="BR" />
                <FlagBadge country="US" />
                <FlagBadge country="EU" />
                <FlagBadge country="CN" />
                <FlagBadge country="AR" />
                <FlagBadge country="GLOBAL" />
              </div>
            </div>
          </div>

          {/* Card 18: Calendário de Movimentação (DatePickerCalendar) */}
          <div className={`${styles.atomicCard} ${styles.atomicCardOverflowVisible}`}>
            <div className={styles.atomicCardHeader}>
              <span className={styles.atomicTitle}>18. Calendário de Operação &amp; Vencimento</span>
              <span className={styles.atomicSubtext}>Navegação Mensal &amp; Seleção de Dias</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'center' }}>
              <DatePickerCalendar
                valueDate={selectedDate}
                onChangeDate={setSelectedDate}
                label="Data de Entrega / Fechamento de Balanço"
                helperText={`Data selecionada: ${selectedDate.split('-').reverse().join('/')}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SESSÃO DEDICADA: TABELA DE DADOS REUTILIZÁVEL (DATA TABLE) */}
      <section className={styles.section} style={{ borderLeft: '4px solid var(--accent-purple)' }}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>📋</span>
            <span>Data Table Reutilizável: Cockpit de Estoque &amp; Faturamento</span>
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Densidade:</span>
            <button
              type="button"
              className={`${styles.themeBtn} ${tableDensity === 'compact' ? styles.themeBtnActive : ''}`}
              onClick={() => setTableDensity('compact')}
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              Compacta (34px)
            </button>
            <button
              type="button"
              className={`${styles.themeBtn} ${tableDensity === 'comfortable' ? styles.themeBtnActive : ''}`}
              onClick={() => setTableDensity('comfortable')}
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              Confortável (44px)
            </button>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Tabela densa com cabeçalho fixo (*sticky*), seleção de linhas atômica, alinhamento numérico tabular e renderização de status em tempo real.
        </p>

        <DataTable
          density={tableDensity}
          keyExtractor={(item) => item.sku}
          data={[
            { sku: 'CAFE-GRAO-1KG', desc: 'Café Especial Mogiana em Grãos', stock: 120, uom: 'UN', unitCost: 'R$ 28,50', salePrice: 'R$ 45,00', status: 'fresh' },
            { sku: 'FILTRO-V60-100', desc: 'Filtros Descartáveis V60 Caixa 100un', stock: 35, uom: 'CX', unitCost: 'R$ 14,20', salePrice: 'R$ 24,00', status: 'warning' },
            { sku: 'PRENSA-FRANC-1L', desc: 'Prensa Francesa Vidro Borossilicato 1L', stock: 4, uom: 'UN', unitCost: 'R$ 55,00', salePrice: 'R$ 95,00', status: 'critical' },
            { sku: 'XAROPE-BAUNILHA', desc: 'Xarope Artesanal de Baunilha 750ml', stock: 0, uom: 'UN', unitCost: 'R$ 22,00', salePrice: 'R$ 38,00', status: 'expired' },
          ]}
          columns={[
            { key: 'sku', header: 'Código SKU', align: 'left', render: (item) => <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.sku}</code> },
            { key: 'desc', header: 'Descrição do Produto', align: 'left' },
            { key: 'stock', header: 'Saldo Físico', align: 'right', render: (item) => <span className={styles.tabularNum}>{item.stock} {item.uom}</span> },
            { key: 'unitCost', header: 'Custo Médio (CMP)', align: 'right', render: (item) => <span className={styles.tabularNum}>{item.unitCost}</span> },
            { key: 'salePrice', header: 'Preço Venda', align: 'right', render: (item) => <span className={styles.tabularNum} style={{ fontWeight: 700 }}>{item.salePrice}</span> },
            {
              key: 'status',
              header: 'Status de Validade',
              align: 'center',
              render: (item) => (
                <ExpirationGuardBadge
                  scope={item.status === 'expired' ? 'reservation' : 'product'}
                  daysRemaining={item.status === 'fresh' ? 30 : item.status === 'warning' ? 10 : item.status === 'critical' ? 3 : -2}
                  identifier={item.sku}
                />
              ),
            },
          ]}
        />
      </section>

      {/* SESSÃO DEDICADA: GALERIA DE ÍCONES DO SISTEMA */}
      <section className={styles.section} style={{ borderLeft: '4px solid var(--status-warning)' }}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>✨</span>
            <span>Galeria &amp; Padronização de Ícones (WMS, POS, Cockpit &amp; Ações)</span>
          </h2>
          <span className={styles.sectionBadge}>Série Homologada por Domínio</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Famílias visuais padronizadas para identificação imediata sem sobrecarga cognitiva nas operações de estoque e chão de loja.
        </p>

        <IconGallery />

        <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
              Opções de Bibliotecas de Ícones SVG Enterprise para o CubeBox
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Clique para selecionar e comparar os atributos
            </span>
          </div>
          <IconLibrarySelector />
        </div>
      </section>

      {/* DIMENSÃO 5: MOTION SYSTEM & MICROINTERAÇÕES (CRAFT FRONTEND MOTION) */}
      <section className={styles.section} style={{ borderLeft: '4px solid var(--primary)' }}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🌀</span>
            <span>Dimensão 5: Motion System &amp; Microinterações Cinéticas (Craft Frontend Motion)</span>
          </h2>
          <span className={styles.sectionBadge}>Física &amp; Acessibilidade A11y</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Transições orgânicas de aceleração e desaceleração baseadas na física real, micro-respiros com amortecimento elástico e feedback de alta velocidade para operadores de chão de loja e POS.
        </p>

        <MotionLab />
      </section>

      {/* DIMENSÃO 6: PADRÕES DE LAYOUT & DENSIDADE DE INFORMAÇÃO (COCKPIT & POS) */}
      <section className={styles.section} style={{ borderLeft: '4px solid var(--accent-purple, #c084fc)' }}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🖥️</span>
            <span>Dimensão 6: Padrões de Layout &amp; Densidade de Informação (Cockpit &amp; POS)</span>
          </h2>
          <span className={styles.sectionBadge}>App Shell • Hotkeys • Split-Pane</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Ergonomia para chão de fábrica, operadores de WMS e caixas de alta velocidade: densidade compacta de 32px vs confortável de 42px, sidebar retrátil com atalhos numéricos, status bar HUD com radar de latência e tela bipartida de separação.
        </p>

        <AppShellLab />
      </section>

      {/* DIMENSÃO 7: DOCUMENTAÇÃO VIVA & CATÁLOGO INTERATIVO (DESIGN SYSTEM SHOWCASE & DOCS AS CODE) */}
      <section className={styles.section} style={{ borderLeft: '4px solid var(--status-success, #10b981)' }}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>📚</span>
            <span>Dimensão 7: Documentação Viva &amp; Catálogo Interativo (Showcase &amp; Docs as Code)</span>
          </h2>
          <span className={styles.sectionBadge}>IEEE 1016 • W3C DTCG • WCAG AAA</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Ecossistema interativo com explorador de propriedades com código dinâmico gerado, diretrizes contextuais de uso (Do's &amp; Don'ts), inspetor de tokens W3C e especificação estruturada pronta para consumo por desenvolvedores e agentes de IA.
        </p>

        <LivingDocsLab />
      </section>

      {/* DIMENSÃO 8: GOVERNANÇA, TESTES & REGRESSÃO VISUAL (VRT & ARCHITECTURE LINTERS) */}
      <section className={styles.section} style={{ borderLeft: '4px solid var(--status-info, #0ea5e9)' }}>
        <div className={styles.sectionHeader}>
          <h2>
            <span>🛡️</span>
            <span>Dimensão 8: Governança, Testes &amp; Regressão Visual (VRT &amp; Architecture Linters)</span>
          </h2>
          <span className={styles.sectionBadge}>Nível 5 • Zero Flakiness • Axe-Core CI</span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Ecossistema de garantia de qualidade para Design Systems enterprise: testes de regressão visual com motor anti-flakiness (font sync + reduced motion), auditoria contínua de acessibilidade (Axe-Core), telemetria de adoção de tokens e linters estritos de arquitetura (Zero Inline Styles).
        </p>

        <GovernanceTestingLab />
      </section>

      {/* MODAL CENTRAL INTERATIVO */}
      <ModalDrawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar Apontamento de Quebra"
        type="modal"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" size="md" onClick={() => { alert('Quebra lançada!'); setIsModalOpen(false); }}>
              Confirmar Baixa Física
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, marginBottom: 'var(--space-3)' }}>
          Você está prestes a registrar o descarte de <strong>2 unidades</strong> do item <em>Café Mogiana 1KG</em> por avaria de transporte.
        </p>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
          Esta ação gera uma trilha imutável na tabela de movimentações físicas de estoque. Pressione <kbd>Esc</kbd> para fechar a qualquer momento.
        </div>
      </ModalDrawer>

      {/* DRAWER LATERAL FLYOUT INTERATIVO */}
      <ModalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Transferência entre Depósitos"
        type="drawer"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setIsDrawerOpen(false)}>
              Fechar
            </Button>
            <Button variant="primary" size="md" onClick={() => { alert('Transferência gerada com status Em Trânsito!'); setIsDrawerOpen(false); }}>
              Efetivar Saída
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ margin: 0, fontSize: '13px' }}>
            Configure os parâmetros de transferência física de saldo entre armazéns do mesmo tenant.
          </p>

          <SelectCombobox
            label="Armazém de Destino"
            value="wh-front"
            onChange={() => {}}
            options={[
              { value: 'wh-front', label: 'Frente de Loja Balcão' },
              { value: 'wh-hub', label: 'Centro de Distribuição Filial' },
            ]}
          />

          <QuantitySelector
            value={10}
            onChange={() => {}}
            min={1}
            max={100}
            uom="UN"
          />

          <div style={{ fontSize: '12px', color: 'var(--status-info)', background: 'var(--status-info-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)' }}>
            ℹ️ Durante o trajeto, o estoque assume estado <strong>Em Trânsito</strong> para evitar dupla contagem ou venda concorrente.
          </div>
        </div>
      </ModalDrawer>
    </div>
  );
};
