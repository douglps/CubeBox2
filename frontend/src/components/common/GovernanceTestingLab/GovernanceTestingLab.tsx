import React, { useState } from 'react';
import styles from './GovernanceTestingLab.module.css';
import { Button } from '../index';

export const GovernanceTestingLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vrt-simulator' | 'a11y-audit' | 'health-telemetry' | 'lifecycle-linters'>('vrt-simulator');

  // Estados da Aba 1: VRT Simulator
  const [vrtMode, setVrtMode] = useState<'side-by-side' | 'heatmap'>('side-by-side');
  const [vrtViewport, setVrtViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDiffApproved, setIsDiffApproved] = useState<boolean>(false);

  // Estados da Aba 2: A11y Audit
  const [isA11yScanning, setIsA11yScanning] = useState<boolean>(false);
  const [scanTimestamp, setScanTimestamp] = useState<string>('Hoje às 21:40');

  // Estados da Aba 4: Lifecycle & Linters
  const [isPipelineRunning, setIsPipelineRunning] = useState<boolean>(false);
  const [pipelineFinished, setPipelineFinished] = useState<boolean>(true);

  const handleRunA11yScan = () => {
    setIsA11yScanning(true);
    setTimeout(() => {
      setIsA11yScanning(false);
      setScanTimestamp('Agora mesmo');
    }, 800);
  };

  const handleRunPipeline = () => {
    setIsPipelineRunning(true);
    setPipelineFinished(false);
    setTimeout(() => {
      setIsPipelineRunning(false);
      setPipelineFinished(true);
    }, 1200);
  };

  return (
    <div className={styles.container}>
      {/* Navegação entre Abas da Dimensão 8 */}
      <div className={styles.tabNavigation} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'vrt-simulator'}
          className={`${styles.navButton} ${activeTab === 'vrt-simulator' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('vrt-simulator')}
        >
          <span>📸</span>
          <span>VRT Simulator (Visual Diff Engine)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'a11y-audit'}
          className={`${styles.navButton} ${activeTab === 'a11y-audit' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('a11y-audit')}
        >
          <span>♿</span>
          <span>Automated A11y Audit (Axe-Core CI)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'health-telemetry'}
          className={`${styles.navButton} ${activeTab === 'health-telemetry' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('health-telemetry')}
        >
          <span>📊</span>
          <span>Health &amp; Adoption Cockpit</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'lifecycle-linters'}
          className={`${styles.navButton} ${activeTab === 'lifecycle-linters' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('lifecycle-linters')}
        >
          <span>🛡️</span>
          <span>Lifecycle &amp; Architecture Linters</span>
        </button>
      </div>

      {/* --- ABA 1: VRT SIMULATOR --- */}
      {activeTab === 'vrt-simulator' && (
        <div className={styles.vrtLayout}>
          <div className={styles.controlsBar}>
            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Modo de Comparação:</span>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.pillBtn} ${vrtMode === 'side-by-side' ? styles.pillBtnActive : ''}`}
                  onClick={() => setVrtMode('side-by-side')}
                >
                  Lado a Lado (Side-by-Side)
                </button>
                <button
                  type="button"
                  className={`${styles.pillBtn} ${vrtMode === 'heatmap' ? styles.pillBtnActive : ''}`}
                  onClick={() => setVrtMode('heatmap')}
                >
                  Heatmap de Pixel Diff (1.4%)
                </button>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Viewport Testado:</span>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.pillBtn} ${vrtViewport === 'desktop' ? styles.pillBtnActive : ''}`}
                  onClick={() => setVrtViewport('desktop')}
                >
                  Desktop 1440px
                </button>
                <button
                  type="button"
                  className={`${styles.pillBtn} ${vrtViewport === 'tablet' ? styles.pillBtnActive : ''}`}
                  onClick={() => setVrtViewport('tablet')}
                >
                  POS Balcão 1024px
                </button>
                <button
                  type="button"
                  className={`${styles.pillBtn} ${vrtViewport === 'mobile' ? styles.pillBtnActive : ''}`}
                  onClick={() => setVrtViewport('mobile')}
                >
                  Mobile 375px
                </button>
              </div>
            </div>
          </div>

          <div className={`${styles.vrtStage} ${vrtMode === 'side-by-side' ? styles.vrtStageSideBySide : ''}`}>
            {/* Baseline Aprovado */}
            <div className={styles.vrtCard}>
              <div className={styles.vrtCardHeader}>
                <span className={styles.vrtCardTitle}>
                  <span>🟢</span>
                  <span>Baseline Aprovado (Master Branch)</span>
                </span>
                <span className={styles.badgeSuccess}>Fonte da Verdade</span>
              </div>
              <div className={styles.componentBox}>
                <Button variant="primary" size="md">
                  Confirmar Baixa (Baseline)
                </Button>
              </div>
            </div>

            {/* Pull Request / Snapshot Atual com Drift */}
            <div className={styles.vrtCard}>
              <div className={styles.vrtCardHeader}>
                <span className={styles.vrtCardTitle}>
                  <span>⚠️</span>
                  <span>Snapshot do Pull Request (Candidate)</span>
                </span>
                <span className={isDiffApproved ? styles.badgeSuccess : styles.badgePillDeprecated}>
                  {isDiffApproved ? 'Diff Aprovado' : 'Regressão Detectada (1.4%)'}
                </span>
              </div>
              <div className={styles.componentBox}>
                <Button variant="primary" size="md">
                  Confirmar Baixa (PR Drift)
                </Button>
                {vrtMode === 'heatmap' && (
                  <div className={styles.heatmapOverlay}>
                    <span className={styles.heatmapTag}>Δ Padding Drift: 16px ➔ 14px</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`${styles.vrtStatusBanner} ${isDiffApproved ? styles.vrtBannerSuccess : styles.vrtBannerAlert}`}>
            <div>
              <strong>Motor Anti-Flakiness Ativo:</strong> Animações congeladas (`prefers-reduced-motion: reduce`), fontes web sincronizadas via `document.fonts.ready` e sub-pixel tolerance calibrada em 0.02%.
            </div>
            <div className={styles.buttonGroup}>
              <Button
                variant={isDiffApproved ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setIsDiffApproved(!isDiffApproved)}
              >
                {isDiffApproved ? 'Revogar Aprovação' : 'Aprovar Visual Diff como Novo Baseline'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- ABA 2: A11Y AUDIT --- */}
      {activeTab === 'a11y-audit' && (
        <div className={styles.a11yGrid}>
          <div className={styles.a11yScorecard}>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreNumber}>100%</span>
              <span className={styles.scoreLabel}>A11y Pass</span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--font-size-sm)' }}>
                Auditoria Automatizada Axe-Core
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Zero violações críticas ou sérias detectadas na suíte de componentes.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              isLoading={isA11yScanning}
              onClick={handleRunA11yScan}
            >
              Reexecutar Auditoria A11y
            </Button>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Último scan: {scanTimestamp}
            </span>
          </div>

          <div className={styles.ruleList}>
            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <span className={styles.ruleName}>
                  <span>✅</span>
                  <span>color-contrast (WCAG 2.1 AA / AAA SC 1.4.3)</span>
                </span>
                <span className={styles.ruleDesc}>
                  Contraste de texto mínimo 4.5:1 e componentes 3:1. Fundo #E1EEF3 + texto #373737 atinge 9.8:1 (AAA).
                </span>
              </div>
              <span className={styles.badgeSuccess}>0 Violações</span>
            </div>

            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <span className={styles.ruleName}>
                  <span>✅</span>
                  <span>button-name (WCAG SC 4.1.2 Name, Role, Value)</span>
                </span>
                <span className={styles.ruleDesc}>
                  Todos os botões contêm texto discernível, aria-label ou descrição associada para leitores de tela.
                </span>
              </div>
              <span className={styles.badgeSuccess}>0 Violações</span>
            </div>

            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <span className={styles.ruleName}>
                  <span>✅</span>
                  <span>focus-visible &amp; tab-order (WCAG SC 2.4.7 &amp; SC 2.1.2)</span>
                </span>
                <span className={styles.ruleDesc}>
                  Foco visível obrigatório com anel duplo sem outline:none cego; ausência de tabindex &gt; 0 e keyboard traps.
                </span>
              </div>
              <span className={styles.badgeSuccess}>0 Violações</span>
            </div>

            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <span className={styles.ruleName}>
                  <span>✅</span>
                  <span>aria-live &amp; dynamic regions (WCAG SC 4.1.3)</span>
                </span>
                <span className={styles.ruleDesc}>
                  Anúncios de atualizações de estoque (polite) e erros fiscais SEFAZ (assertive) com live regions calibradas.
                </span>
              </div>
              <span className={styles.badgeSuccess}>0 Violações</span>
            </div>
          </div>
        </div>
      )}

      {/* --- ABA 3: HEALTH TELEMETRY --- */}
      {activeTab === 'health-telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className={styles.telemetryGrid}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiValue}>96.2%</span>
              <span className={styles.kpiLabel}>Adoção Geral do Design System</span>
              <div className={styles.kpiProgress}>
                <div className={styles.kpiBar} style={{ width: '96.2%' }} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <span className={styles.kpiValue}>99.4%</span>
              <span className={styles.kpiLabel}>Conformidade de Tokens (Zero Magic Values)</span>
              <div className={styles.kpiProgress}>
                <div className={styles.kpiBar} style={{ width: '99.4%' }} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <span className={styles.kpiValue}>91.8%</span>
              <span className={styles.kpiLabel}>Cobertura Pirâmide de Testes</span>
              <div className={styles.kpiProgress}>
                <div className={styles.kpiBar} style={{ width: '91.8%' }} />
              </div>
            </div>

            <div className={styles.kpiCard}>
              <span className={styles.kpiValue}>2.3 kB</span>
              <span className={styles.kpiLabel}>Tamanho Médio Bundle (Gzip &lt; 3.0 kB)</span>
              <div className={styles.kpiProgress}>
                <div className={styles.kpiBar} style={{ width: '76%' }} />
              </div>
            </div>
          </div>

          <div className={styles.domainTableContainer}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>Bounded Context / Módulo</th>
                  <th>Uso de Componentes DS</th>
                  <th>Uso de Tokens CSS</th>
                  <th>Telas Auditadas</th>
                  <th>Status de Saúde</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>01. WMS &amp; Armazenagem</strong></td>
                  <td>98.5%</td>
                  <td>99.6%</td>
                  <td>14 telas</td>
                  <td><span className={styles.badgeSuccess}>Excelente</span></td>
                </tr>
                <tr>
                  <td><strong>02. PDV &amp; Balcão de Vendas</strong></td>
                  <td>97.2%</td>
                  <td>99.2%</td>
                  <td>8 telas</td>
                  <td><span className={styles.badgeSuccess}>Excelente</span></td>
                </tr>
                <tr>
                  <td><strong>03. Cockpit Executivo &amp; BI</strong></td>
                  <td>94.0%</td>
                  <td>98.8%</td>
                  <td>10 telas</td>
                  <td><span className={styles.badgeSuccess}>Excelente</span></td>
                </tr>
                <tr>
                  <td><strong>04. Fiscal &amp; SEFAZ Hub</strong></td>
                  <td>95.1%</td>
                  <td>100.0%</td>
                  <td>6 telas</td>
                  <td><span className={styles.badgeSuccess}>Excelente</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ABA 4: LIFECYCLE & LINTERS --- */}
      {activeTab === 'lifecycle-linters' && (
        <div className={styles.lifecycleGrid}>
          {/* Tabela de Ciclo de Vida */}
          <div className={styles.domainTableContainer} style={{ margin: 0 }}>
            <table className={styles.customTable}>
              <thead>
                <tr>
                  <th>Componente</th>
                  <th>Estágio de Maturidade</th>
                  <th>Versão</th>
                  <th>Diretriz de Uso</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>&lt;Button /&gt;</code></td>
                  <td><span className={styles.badgePillStable}>Stable</span></td>
                  <td>v1.0.0</td>
                  <td>Uso corporativo irrestrito em todas as telas</td>
                </tr>
                <tr>
                  <td><code>&lt;BarcodeScannerInput /&gt;</code></td>
                  <td><span className={styles.badgePillStable}>Stable</span></td>
                  <td>v1.0.0</td>
                  <td>Chão de fábrica e balcão com suporte a hotkey F2</td>
                </tr>
                <tr>
                  <td><code>&lt;StockLevelBar /&gt;</code></td>
                  <td><span className={styles.badgePillCandidate}>Candidate</span></td>
                  <td>v1.1.0-beta</td>
                  <td>Em validação operacional com sparkline D+3</td>
                </tr>
                <tr>
                  <td><code>&lt;LegacyAlertBox /&gt;</code></td>
                  <td><span className={styles.badgePillDeprecated}>Deprecated</span></td>
                  <td>v0.4.0</td>
                  <td>Substituir por <code>&lt;FeedbackBox /&gt;</code> (Sunset v2.0)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terminal CI/CD */}
          <div className={styles.terminalCard}>
            <div className={styles.terminalHeader}>
              <div className={styles.terminalDots}>
                <span className={styles.terminalDot} style={{ background: '#ef4444' }} />
                <span className={styles.terminalDot} style={{ background: '#f59e0b' }} />
                <span className={styles.terminalDot} style={{ background: '#10b981' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                ci-governance-guard.sh
              </span>
              <Button
                variant="ghost"
                size="sm"
                isLoading={isPipelineRunning}
                onClick={handleRunPipeline}
              >
                Reexecutar CI
              </Button>
            </div>

            <div className={styles.terminalBody}>
              <div className={styles.terminalLineCommand}>$ pnpm run test:governance</div>
              <div className={styles.terminalLineMuted}>[1/3] Enforcing Zero Inline Styles (react/forbid-component-props)...</div>
              <div className={styles.terminalLineSuccess}>✔ 0 inline style violations found in /src/components/</div>
              <div className={styles.terminalLineMuted}>[2/3] Checking Design Tokens Linter (anti-hardcoded CSS rules)...</div>
              <div className={styles.terminalLineSuccess}>✔ 100% tokens compliant (Zero raw hex or arbitrary px)</div>
              <div className={styles.terminalLineMuted}>[3/3] Validating TypeScript strict type contracts (tsd)...</div>
              <div className={styles.terminalLineSuccess}>✔ All props interfaces strictly typed. Zero 'any' found.</div>
              {pipelineFinished && (
                <div style={{ marginTop: 'var(--space-2)', color: '#38bdf8' }}>
                  🎉 Build Gate: PASSED • Ready to deploy to production.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
