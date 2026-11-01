import React, { useState, useEffect } from 'react';
import styles from './AppShellLab.module.css';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';

export type LayoutDensity = 'compact' | 'comfortable';

interface AppShellLabProps {
  className?: string;
}

interface HotkeyItem {
  key: string;
  action: string;
  scope: 'Global' | 'PDV / Caixa' | 'WMS / Estoque';
}

const HOTKEYS: HotkeyItem[] = [
  { key: '?', action: 'Abrir este painel de atalhos', scope: 'Global' },
  { key: 'F1', action: 'Guia do Operador & Ajuda', scope: 'Global' },
  { key: 'Alt+1', action: 'Ir para Cockpit do Gestor', scope: 'Global' },
  { key: 'Alt+2', action: 'Ir para Estoque Multi-Armazém', scope: 'Global' },
  { key: 'Alt+3', action: 'Ir para Frente de Caixa (POS)', scope: 'Global' },
  { key: 'Alt+4', action: 'Ir para Design System Showcase', scope: 'Global' },
  { key: 'F2', action: 'Focar Leitor de Código de Barras', scope: 'PDV / Caixa' },
  { key: 'F4', action: 'Selecionar Meio de Pagamento', scope: 'PDV / Caixa' },
  { key: 'F8', action: 'Finalizar Venda & Imprimir Comanda', scope: 'PDV / Caixa' },
  { key: 'Esc', action: 'Limpar campo / Fechar popups', scope: 'Global' },
  { key: 'F9', action: 'Consultar Lote / FEFO do Item', scope: 'WMS / Estoque' },
  { key: 'Ctrl+B', action: 'Recolher / Expandir Menu Lateral', scope: 'Global' },
];

export const AppShellLab: React.FC<AppShellLabProps> = ({ className = '' }) => {
  const [density, setDensity] = useState<LayoutDensity>('compact');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeNav, setActiveNav] = useState('inventory');
  const [isHotkeyModalOpen, setIsHotkeyModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('wh-sp-matriz');
  const [sefazStatus, setSefazStatus] = useState<'online' | 'unstable' | 'offline'>('online');
  const [splitRatio, setSplitRatio] = useState<'balanced' | 'focus-left' | 'focus-right'>('balanced');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-2026-9042');
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);

  // Escuta tecla '?' e 'F1' para abrir o modal de atalhos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em input ou textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      if (e.key === '?' || e.key === 'F1') {
        e.preventDefault();
        setIsHotkeyModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsHotkeyModalOpen(false);
        setIsItemDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`${styles.container} ${className}`}>
      {/* CABEÇALHO DA DIMENSÃO 6 */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.titleWrap}>
            <span className={styles.badgePill}>Dimensão 6 • Padrões de Layout &amp; Cockpit</span>
            <h3 className={styles.title}>Simulador de App Shell Enterprise &amp; Densidade de Informação</h3>
          </div>

          <div className={styles.controlsBar}>
            {/* Seletor de Densidade */}
            <div className={styles.densitySelector} role="group" aria-label="Seletor de densidade de layout">
              <span className={styles.controlLabel}>Densidade:</span>
              <button
                type="button"
                className={`${styles.densityBtn} ${density === 'compact' ? styles.densityBtnActive : ''}`}
                onClick={() => setDensity('compact')}
                title="Linhas compactas de 32px para alta densidade analítica"
              >
                Compacta (32px)
              </button>
              <button
                type="button"
                className={`${styles.densityBtn} ${density === 'comfortable' ? styles.densityBtnActive : ''}`}
                onClick={() => setDensity('comfortable')}
                title="Linhas confortáveis de 42px para uso prolongado ou touch"
              >
                Confortável (42px)
              </button>
            </div>

            {/* Alternador Modo Zen */}
            <button
              type="button"
              className={`${styles.zenBtn} ${isZenMode ? styles.zenBtnActive : ''}`}
              onClick={() => setIsZenMode((prev) => !prev)}
              title="Modo Foco / Zen POS: Oculta distrações do layout"
            >
              {isZenMode ? '🎯 Modo Zen: ATIVO' : '🎯 Modo Zen POS'}
            </button>

            {/* Gatilho Hotkey Sheet */}
            <button
              type="button"
              className={styles.hotkeyTriggerBtn}
              onClick={() => setIsHotkeyModalOpen(true)}
              title="Pressione ? ou F1 no teclado"
            >
              ⌨️ Atalhos (?)
            </button>
          </div>
        </div>
        <p className={styles.subtitle}>
          Experimente em tempo real a alternância entre densidade compacta de alta volumetria e layout ergonômico,
          o App Shell unificado com sidebar retrátil, status bar HUD de chão de loja e painel bipartido (split-pane).
        </p>
      </div>

      {/* AMBIENTE SIMULADO DO APP SHELL CUBEBOX */}
      <div
        className={`${styles.shellPreview} ${density === 'compact' ? styles.densityCompact : styles.densityComfortable} ${isZenMode ? styles.shellZen : ''}`}
      >
        {/* TOPBAR ENTERPRISE UNIFICADA */}
        {!isZenMode && (
          <header className={styles.mockTopbar}>
            <div className={styles.topbarLeft}>
              <button
                type="button"
                className={styles.sidebarToggle}
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                title={isSidebarCollapsed ? 'Expandir Sidebar (Ctrl+B)' : 'Recolher Sidebar (Ctrl+B)'}
                aria-label="Alternar menu lateral"
              >
                <span className={styles.hamburgerIcon}>☰</span>
              </button>

              <div className={styles.mockBrand}>
                <span className={styles.brandCube}>C</span>
                <span className={styles.brandTitle}>CubeBox Enterprise</span>
                <span className={styles.tenantBadge}>Tenant: Hub Matriz 01</span>
              </div>
            </div>

            {/* SELETOR DE ARMAZÉM & STATUS SEFAZ */}
            <div className={styles.topbarRight}>
              <div className={styles.warehouseSelectorWrap}>
                <span className={styles.whLabel}>Armazém:</span>
                <select
                  className={styles.whSelect}
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                >
                  <option value="wh-sp-matriz">CD Principal • São Paulo (SP)</option>
                  <option value="wh-rj-filial">Filial Operacional • Rio de Janeiro (RJ)</option>
                  <option value="wh-pr-crossdock">Cross-Docking • Curitiba (PR)</option>
                </select>
              </div>

              {/* RADAR PULSE SEFAZ */}
              <div
                className={`${styles.sefazPill} ${styles[`sefaz_${sefazStatus}`]}`}
                title="Sincronização contínua com SEFAZ Estadual via Webhooks"
                onClick={() => {
                  const states: Array<'online' | 'unstable' | 'offline'> = ['online', 'unstable', 'offline'];
                  const nextIndex = (states.indexOf(sefazStatus) + 1) % states.length;
                  setSefazStatus(states[nextIndex]);
                }}
              >
                <span className={styles.sefazPulse} />
                <span className={styles.sefazText}>
                  SEFAZ: <strong>{sefazStatus.toUpperCase()}</strong> (24ms)
                </span>
              </div>

              {/* OPERADOR LOGADO */}
              <div className={styles.operatorChip}>
                <span className={styles.operatorAvatar}>DF</span>
                <div className={styles.operatorDetails}>
                  <span className={styles.operatorName}>Douglas F.</span>
                  <span className={styles.operatorRole}>Líder WMS / Supervisor</span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* CORPO PRINCIPAL COM SIDEBAR + ÁREA DE TRABALHO */}
        <div className={styles.shellBody}>
          {/* SIDEBAR RETRÁTIL */}
          {!isZenMode && (
            <aside
              className={`${styles.mockSidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}
            >
              <nav className={styles.sidebarNav} aria-label="Navegação simulada">
                {[
                  { id: 'dashboard', label: 'Cockpit do Gestor', icon: '🧭', hotkey: 'Alt+1' },
                  { id: 'inventory', label: 'Estoque Multi-Armazém', icon: '📦', hotkey: 'Alt+2' },
                  { id: 'pos', label: 'Frente de Caixa (POS)', icon: '⚡', hotkey: 'Alt+3' },
                  { id: 'design-system', label: 'Design System', icon: '💎', hotkey: 'Alt+4' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.sidebarItem} ${activeNav === item.id ? styles.sidebarItemActive : ''}`}
                    onClick={() => setActiveNav(item.id)}
                    title={`${item.label} (${item.hotkey})`}
                  >
                    <span className={styles.sidebarIcon}>{item.icon}</span>
                    {!isSidebarCollapsed && (
                      <div className={styles.sidebarItemLabelGroup}>
                        <span className={styles.sidebarItemLabel}>{item.label}</span>
                        <kbd className={styles.sidebarItemKbd}>{item.hotkey}</kbd>
                      </div>
                    )}
                  </button>
                ))}
              </nav>

              <div className={styles.sidebarFooter}>
                {!isSidebarCollapsed ? (
                  <div className={styles.sidebarFooterFull}>
                    <span className={styles.footerMicroText}>CubeBox WMS v1.2.0</span>
                    <span className={styles.footerHint}>Pressione <strong>?</strong> para ajuda</span>
                  </div>
                ) : (
                  <span className={styles.sidebarMiniVersion}>v1.2</span>
                )}
              </div>
            </aside>
          )}

          {/* ÁREA DE CONTEÚDO PRINCIPAL (SPLIT-PANE RESILIENTE) */}
          <main className={styles.mockWorkspace}>
            {/* BARRA SUPERIOR DE SUB-AÇÕES DO COCKPIT */}
            <div className={styles.workspaceToolbar}>
              <div className={styles.toolbarBreadcrumb}>
                <span>WMS &gt; Separação e Conferência &gt; Lote #2026-L49</span>
              </div>
              <div className={styles.toolbarActions}>
                <span className={styles.splitLabel}>Split-Pane:</span>
                <button
                  type="button"
                  className={`${styles.splitBtn} ${splitRatio === 'focus-left' ? styles.splitBtnActive : ''}`}
                  onClick={() => setSplitRatio('focus-left')}
                  title="Focar lista de pedidos (60/40)"
                >
                  ◀ 60/40
                </button>
                <button
                  type="button"
                  className={`${styles.splitBtn} ${splitRatio === 'balanced' ? styles.splitBtnActive : ''}`}
                  onClick={() => setSplitRatio('balanced')}
                  title="Divisão equilibrada (50/50)"
                >
                  ⚖ 50/50
                </button>
                <button
                  type="button"
                  className={`${styles.splitBtn} ${splitRatio === 'focus-right' ? styles.splitBtnActive : ''}`}
                  onClick={() => setSplitRatio('focus-right')}
                  title="Focar conferência física de itens (40/60)"
                >
                  40/60 ▶
                </button>
                <button
                  type="button"
                  className={styles.quickInspectBtn}
                  onClick={() => setIsItemDrawerOpen(true)}
                  title="Abrir gaveta de inspeção rápida do produto"
                >
                  🔍 Inspecionar Item (F9)
                </button>
              </div>
            </div>

            {/* CONTEÚDO BIPARTIDO (SPLIT PANE) */}
            <div className={`${styles.splitGrid} ${styles[`split_${splitRatio}`]}`}>
              {/* PAINEL ESQUERDO: FILA DE REMESSAS/PEDIDOS */}
              <section className={styles.paneLeft}>
                <div className={styles.paneHeader}>
                  <h4>Fila de Separação em Andamento (4 pedidos)</h4>
                  <Badge status="info">Fila WMS</Badge>
                </div>

                <div className={styles.ordersTableWrap}>
                  <table className={styles.denseTable}>
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente / Destino</th>
                        <th>Itens</th>
                        <th>Prioridade</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'ORD-2026-9042', client: 'Mercado Bom Preço', items: 12, prio: 'URGENTE', status: 'Em Separação' },
                        { id: 'ORD-2026-9043', client: 'Distribuidora Alvorada', items: 48, prio: 'NORMAL', status: 'Aguardando Lote' },
                        { id: 'ORD-2026-9044', client: 'Supermercado Central', items: 6, prio: 'ALTA', status: 'Conferência Cega' },
                        { id: 'ORD-2026-9045', client: 'Padaria & Confeitaria Pão Dourado', items: 3, prio: 'NORMAL', status: 'Pronto p/ Rota' },
                      ].map((order) => (
                        <tr
                          key={order.id}
                          className={`${styles.tableRow} ${selectedOrderId === order.id ? styles.tableRowSelected : ''}`}
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          <td className={styles.cellMono}>{order.id}</td>
                          <td>{order.client}</td>
                          <td className={styles.cellNum}>{order.items} UN</td>
                          <td>
                            <span
                              className={`${styles.prioTag} ${
                                order.prio === 'URGENTE'
                                  ? styles.prioUrgente
                                  : order.prio === 'ALTA'
                                  ? styles.prioAlta
                                  : styles.prioNormal
                              }`}
                            >
                              {order.prio}
                            </span>
                          </td>
                          <td>
                            <Badge status={order.status === 'Em Separação' ? 'success' : 'neutral'}>
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* PAINEL DIREITO: CONFERÊNCIA ATÔMICA DE ITENS DO PEDIDO SELECIONADO */}
              <section className={styles.paneRight}>
                <div className={styles.paneHeader}>
                  <h4>Conferência do Pedido: {selectedOrderId}</h4>
                  <Badge status="info">Conferência FEFO</Badge>
                </div>

                <div className={styles.itemsList}>
                  <div className={styles.itemCard}>
                    <div className={styles.itemTop}>
                      <div>
                        <strong className={styles.itemName}>Café Especial Grão Torrado 1KG</strong>
                        <span className={styles.itemSku}>SKU: BEV-COF-001 • EAN: 7891000100105</span>
                      </div>
                      <span className={styles.itemQty}>6 / 6 UN</span>
                    </div>
                    <div className={styles.itemBottom}>
                      <span className={styles.batchTag}>Lote: #2026-B1 • Validade: 12/2026 (FEFO Válido)</span>
                      <Badge status="success">Bipagem OK</Badge>
                    </div>
                  </div>

                  <div className={styles.itemCard}>
                    <div className={styles.itemTop}>
                      <div>
                        <strong className={styles.itemName}>Azeite de Oliva Extra Virgem 500ml</strong>
                        <span className={styles.itemSku}>SKU: OLI-EV-500 • EAN: 7892000300201</span>
                      </div>
                      <span className={styles.itemQty}>2 / 4 UN</span>
                    </div>
                    <div className={styles.itemBottom}>
                      <span className={styles.batchTag}>Lote: #2026-AZ • Validade: 09/2026</span>
                      <Badge status="warning">Bipagem Pendente (2 un)</Badge>
                    </div>
                  </div>

                  <div className={styles.itemCard}>
                    <div className={styles.itemTop}>
                      <div>
                        <strong className={styles.itemName}>Farinha de Trigo Especial Tipo 1 5KG</strong>
                        <span className={styles.itemSku}>SKU: GRA-FAR-005 • EAN: 7893000400302</span>
                      </div>
                      <span className={styles.itemQty}>0 / 2 CX</span>
                    </div>
                    <div className={styles.itemBottom}>
                      <span className={styles.batchTag}>Lote: #2026-FT • Aguardando Alocação</span>
                      <Badge status="danger">Não Bipado</Badge>
                    </div>
                  </div>
                </div>

                <div className={styles.paneFooterActions}>
                  <Button variant="ghost" size="sm" onClick={() => alert('Contagem reiniciada!')}>
                    Zerar Bipagem
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => alert('Romaneio liberado para expedição!')}>
                    Liberar Romaneio (F8)
                  </Button>
                </div>
              </section>
            </div>
          </main>
        </div>

        {/* FOOTER HUD: STATUS BAR OPERACIONAL DE ALTA DENSIDADE */}
        <footer className={styles.mockFooterHud}>
          <div className={styles.hudGroup}>
            <span className={styles.hudIndicatorGreen}>●</span>
            <span>Modo Operacional: <strong>WMS Online</strong></span>
          </div>

          <div className={styles.hudGroup}>
            <span>Fila Offline: <strong>0 pendências</strong> (Sincronizado)</span>
          </div>

          <div className={styles.hudGroup}>
            <span>Impressora: <strong>Zebra ZT411 • ESC/POS (Térmica OK)</strong></span>
          </div>

          <div className={styles.hudGroup}>
            <span>Latência API: <strong>18ms</strong></span>
          </div>

          <div className={styles.hudGroup}>
            <span>Densidade Ativa: <strong>{density.toUpperCase()}</strong></span>
          </div>

          <div className={styles.hudHelp}>
            <kbd className={styles.hudKbd}>?</kbd>
            <span>Ajuda de Atalhos</span>
          </div>
        </footer>
      </div>

      {/* MODAL OVERLAY: CHEATSHEET DE ATALHOS GLOBAIS (HOTKEYS) */}
      {isHotkeyModalOpen && (
        <div className={styles.hotkeyBackdrop} onClick={() => setIsHotkeyModalOpen(false)}>
          <div className={styles.hotkeyModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.hotkeyHeader}>
              <div>
                <h3 className={styles.hotkeyTitle}>⌨️ Atalhos de Teclado Operacionais</h3>
                <p className={styles.hotkeyDesc}>
                  Navegue com velocidade de chão de loja sem tirar as mãos do teclado numérico ou leitor.
                </p>
              </div>
              <button
                type="button"
                className={styles.hotkeyCloseBtn}
                onClick={() => setIsHotkeyModalOpen(false)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className={styles.hotkeyGrid}>
              {['Global', 'PDV / Caixa', 'WMS / Estoque'].map((scope) => (
                <div key={scope} className={styles.hotkeyCategory}>
                  <h4 className={styles.hotkeyCategoryTitle}>{scope}</h4>
                  <div className={styles.hotkeyList}>
                    {HOTKEYS.filter((h) => h.scope === scope).map((item) => (
                      <div key={item.key} className={styles.hotkeyRow}>
                        <kbd className={styles.kbdBadge}>{item.key}</kbd>
                        <span className={styles.hotkeyAction}>{item.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.hotkeyFooter}>
              <span>Pressione <kbd className={styles.kbdBadge}>Esc</kbd> para fechar este painel a qualquer momento.</span>
              <Button variant="primary" size="sm" onClick={() => setIsHotkeyModalOpen(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER LATERAL DE INSPEÇÃO RÁPIDA (QUICK INSPECT SLIDE) */}
      {isItemDrawerOpen && (
        <div className={styles.drawerBackdrop} onClick={() => setIsItemDrawerOpen(false)}>
          <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <span className={styles.drawerPill}>F9 • Quick Inspect Context</span>
                <h3 className={styles.drawerTitle}>Café Especial Grão Torrado 1KG</h3>
                <span className={styles.drawerSku}>SKU: BEV-COF-001 • Curva ABC: <strong>Classe A</strong></span>
              </div>
              <button
                type="button"
                className={styles.hotkeyCloseBtn}
                onClick={() => setIsItemDrawerOpen(false)}
                aria-label="Fechar gaveta"
              >
                ✕
              </button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.drawerKpiGrid}>
                <div className={styles.drawerKpiCard}>
                  <span className={styles.kpiLabel}>Estoque Disponível</span>
                  <span className={styles.kpiValue}>142 UN</span>
                </div>
                <div className={styles.drawerKpiCard}>
                  <span className={styles.kpiLabel}>Reservado Balcão</span>
                  <span className={styles.kpiValue}>18 UN</span>
                </div>
                <div className={styles.drawerKpiCard}>
                  <span className={styles.kpiLabel}>Giro Estimado</span>
                  <span className={styles.kpiValue}>4.8 dias</span>
                </div>
              </div>

              <div className={styles.drawerSection}>
                <h4 className={styles.drawerSubtitle}>Lotes FEFO Ativos em Estoque</h4>
                <div className={styles.drawerLotItem}>
                  <div>
                    <strong>Lote #2026-B1</strong>
                    <p>Vencimento: 15/12/2026 • Localização: Rua A, Prédio 3, Nível 2</p>
                  </div>
                  <Badge status="success">Saldo: 80 UN</Badge>
                </div>
                <div className={styles.drawerLotItem}>
                  <div>
                    <strong>Lote #2026-B2</strong>
                    <p>Vencimento: 28/02/2027 • Localização: Rua A, Prédio 3, Nível 3</p>
                  </div>
                  <Badge status="neutral">Saldo: 62 UN</Badge>
                </div>
              </div>

              <div className={styles.drawerAlert}>
                💡 <strong>Dica Operacional:</strong> Os lotes são alocados automaticamente pelo algoritmo FEFO do CubeBox. Não desvie lotes prioritários sem registrar justificativa de avaria.
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <Button variant="ghost" size="sm" onClick={() => setIsItemDrawerOpen(false)}>
                Fechar Gaveta (Esc)
              </Button>
              <Button variant="primary" size="sm" onClick={() => { alert('Transferência rápida acionada!'); setIsItemDrawerOpen(false); }}>
                Mover de Prateleira
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
