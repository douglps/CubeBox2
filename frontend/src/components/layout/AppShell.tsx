import React, { useEffect, useState, useRef } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Users,
  ClipboardList,
  TrendingUp,
  Sun,
  Moon,
  Layers,
  Activity,
  ChevronLeft,
} from 'lucide-react';
import { useCursorTooltip } from '../common/CursorTooltip';
import { fetchReorderSuggestions, fetchProducts } from '../../services/api';
import styles from './AppShell.module.css';

export type NavTab =
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'products'
  | 'customers'
  | 'orders'
  | 'predictive'
  | 'design-system';

export interface AppShellProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentTheme: 'dark' | 'light';
  onToggleTheme: () => void;
  children: React.ReactNode;
}

interface NavItemDef {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  shortcut: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'Alt+1' },
  { id: 'pos', label: 'Frente de Caixa (PDV)', icon: ShoppingCart, shortcut: 'Alt+2' },
  { id: 'inventory', label: 'Controle de Estoque', icon: Package, shortcut: 'Alt+3' },
  { id: 'products', label: 'Produtos', icon: Tag, shortcut: 'Alt+4' },
  { id: 'customers', label: 'Clientes', icon: Users, shortcut: 'Alt+5' },
  { id: 'orders', label: 'Histórico de Vendas', icon: ClipboardList, shortcut: 'Alt+6' },
  { id: 'predictive', label: 'Inteligência Preditiva', icon: TrendingUp, shortcut: 'Alt+7' },
];

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  currentTheme,
  onToggleTheme,
  children,
}) => {
  const { showTooltip, updatePosition, hideTooltip } = useCursorTooltip();
  const [isRailCollapsed, setIsRailCollapsed] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [latencyMs, setLatencyMs] = useState(14);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const mainScrollRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  // Monitoramento de relógio e telemetria
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      });
      const timePart = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentDateTime(`${datePart} • ${timePart}`);
    };

    updateDateTime();
    const clockInterval = setInterval(updateDateTime, 1000 * 30);

    const interval = setInterval(() => {
      setLatencyMs(Math.floor(12 + Math.random() * 10));
    }, 10000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(interval);
    };
  }, []);

  // Smart Sticky Header resiliente ao rolar (com histerese, detecção de fim de página e sem jitter)
  useEffect(() => {
    const mainEl = mainScrollRef.current;
    if (!mainEl) return;

    const SCROLL_THRESHOLD = 16; // Margem de histerese para ignorar micro-movimentos
    const HEADER_EXPAND_THRESHOLD = 8; // Sensibilidade para reexibir ao rolar para cima
    const TOP_REVEAL_ZONE = 40; // No topo sempre mantém visível
    const BOTTOM_TOLERANCE = 32; // Se estiver a menos de 32px do fim, não alterna estado

    const handleScroll = () => {
      const currentScroll = mainEl.scrollTop;
      const scrollHeight = mainEl.scrollHeight;
      const clientHeight = mainEl.clientHeight;
      const isNearBottom = currentScroll + clientHeight >= scrollHeight - BOTTOM_TOLERANCE;

      // 1. No topo da página: sempre restaura visível
      if (currentScroll <= TOP_REVEAL_ZONE) {
        setIsHeaderHidden(false);
        lastScrollY.current = Math.max(0, currentScroll);
        return;
      }

      // 2. No final do conteúdo: trava o estado atual para evitar loop de expansão e retração
      if (isNearBottom) {
        return;
      }

      const delta = currentScroll - lastScrollY.current;

      // 3. Rolando para baixo com deslocamento suficiente: oculta header
      if (delta > SCROLL_THRESHOLD) {
        setIsHeaderHidden(true);
        lastScrollY.current = currentScroll;
      }
      // 4. Rolando para cima com intenção clara: exibe header
      else if (delta < -HEADER_EXPAND_THRESHOLD) {
        setIsHeaderHidden(false);
        lastScrollY.current = currentScroll;
      }
    };

    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', handleScroll);
  }, []);

  // Atalhos Globais de Teclado (Alt+1..7, Alt+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key) {
          case '1': e.preventDefault(); onTabChange('dashboard'); break;
          case '2': e.preventDefault(); onTabChange('pos'); break;
          case '3': e.preventDefault(); onTabChange('inventory'); break;
          case '4': e.preventDefault(); onTabChange('products'); break;
          case '5': e.preventDefault(); onTabChange('customers'); break;
          case '6': e.preventDefault(); onTabChange('orders'); break;
          case '7': e.preventDefault(); onTabChange('predictive'); break;
          case 't':
          case 'T':
            e.preventDefault();
            onToggleTheme();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTabChange, onToggleTheme]);

  return (
    <div className={styles.appRoot}>
      {/* Header 100% Full-Width (Smart Sticky) */}
      <header
        className={`${styles.header} ${isHeaderHidden ? styles.headerHidden : ''}`}
        onFocusCapture={() => setIsHeaderHidden(false)}
      >
        <div className={styles.headerLeft}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <Layers size={20} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>CUBEBOX</span>
              <span className={styles.brandSubtitle}>Enterprise 2.0 • DTCG</span>
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Alternador Único de Tema Dark/Light com Cursor Follower Tooltip */}
          <button
            className={styles.themeToggleBtn}
            onClick={onToggleTheme}
            onMouseEnter={(e) => showTooltip('Alternar Tema', 'Alt+T', e)}
            onMouseMove={updatePosition}
            onMouseLeave={hideTooltip}
            onFocus={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              showTooltip('Alternar Tema', 'Alt+T', { clientX: rect.left, clientY: rect.bottom + 8 } as any);
            }}
            onBlur={hideTooltip}
            aria-label="Alternar tema claro e escuro"
          >
            {currentTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Estrutura Inferior: Aside Rail + Main Container */}
      <div className={styles.bodyWrapper}>
        <aside
          className={`${styles.aside} ${isRailCollapsed ? styles.asideCollapsed : ''}`}
          aria-label="Navegação Principal"
        >
          {/* Controle de Modo Rail */}
          <div className={styles.railHeader}>
            <button
              className={styles.railToggleBtn}
              onClick={() => setIsRailCollapsed((prev) => !prev)}
              onMouseEnter={(e) => showTooltip(isRailCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral', undefined, e)}
              onMouseMove={updatePosition}
              onMouseLeave={hideTooltip}
              title={isRailCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
              aria-label="Alternar modo da barra lateral"
            >
              <ChevronLeft
                size={16}
                className={isRailCollapsed ? styles.railIconRotated : undefined}
              />
            </button>
          </div>

          {/* Lista de Navegação das 7 Abas */}
          <nav className={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className={styles.navItemWrapper}>
                  <button
                    className={`${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`}
                    onClick={() => onTabChange(item.id)}
                    onMouseEnter={(e) => {
                      showTooltip(item.label, item.shortcut, e);
                      // Prefetch antecipado da Inteligência Preditiva ao passar o mouse na aba
                      if (item.id === 'predictive') {
                        fetchReorderSuggestions().catch(() => {});
                        fetchProducts().catch(() => {});
                      }
                    }}
                    onMouseMove={updatePosition}
                    onMouseLeave={hideTooltip}
                    onFocus={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      showTooltip(item.label, item.shortcut, { clientX: rect.right + 10, clientY: rect.top + 16 } as any);
                      if (item.id === 'predictive') {
                        fetchReorderSuggestions().catch(() => {});
                      }
                    }}
                    onBlur={hideTooltip}
                    aria-label={`${item.label} (${item.shortcut})`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} className={styles.navIcon} />
                    {!isRailCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Rodapé da Sidebar */}
          <div className={styles.asideFooter}>
            <span className={styles.statusDot} />
            {!isRailCollapsed && <span>Sistema Online</span>}
          </div>
        </aside>

        {/* Container Principal com Scroll Independente e Rodapé Estritamente Fixo */}
        <div className={styles.mainContainer}>
          <main className={styles.mainContent} ref={mainScrollRef}>
            <div className={styles.viewContent}>{children}</div>
          </main>

          {/* HUD de Rodapé Estritamente Fixo (Fixed Dock) */}
          <footer className={styles.footerHud}>
            <div className={styles.hudLeft}>
              <span>
                <strong>CubeBox Enterprise</strong> v2.0.0 • WCAG 2.1 AA
              </span>
            </div>
            <div className={styles.hudRight}>
              <span className={styles.hudEngine}>Núcleo de Inteligência</span>
              <div className={styles.telemetryBadge}>
                <Activity size={12} className={styles.pulseIcon} />
                <span className="tabular">{latencyMs}ms</span>
              </div>
              <div className={styles.dateBadge}>
                <span>{currentDateTime}</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
