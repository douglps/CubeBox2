import React, { useState } from 'react';
import styles from './MotionLab.module.css';
import { Button } from '../Button/Button';

interface MotionLabProps {
  className?: string;
}

export const MotionLab: React.FC<MotionLabProps> = ({ className = '' }) => {
  // Estado para disparar o teste das curvas Bézier
  const [isRunning, setIsRunning] = useState(false);

  // Estados para as microinterações de negócio
  const [isBarcodeFlashing, setIsBarcodeFlashing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isBadgeBouncing, setIsBadgeBouncing] = useState(false);
  const [staggerKey, setStaggerKey] = useState(0);

  // Estados das novas situações operacionais
  const [isErrorShaking, setIsErrorShaking] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isItemRemoved, setIsItemRemoved] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const triggerMotionRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 1200);
  };

  const triggerBarcodeScanFeedback = () => {
    setIsBarcodeFlashing(true);
    setTimeout(() => {
      setIsBarcodeFlashing(false);
    }, 200);
  };

  const triggerNewNotification = () => {
    setNotificationCount((prev) => prev + 1);
    setIsBadgeBouncing(true);
    setTimeout(() => {
      setIsBadgeBouncing(false);
    }, 350);
  };

  const triggerStaggerReload = () => {
    setStaggerKey((prev) => prev + 1);
  };

  const triggerErrorShake = () => {
    setIsErrorShaking(true);
    setTimeout(() => {
      setIsErrorShaking(false);
    }, 500);
  };

  const triggerAutoSaveDemo = () => {
    setAutoSaveState('saving');
    setTimeout(() => {
      setAutoSaveState('saved');
      setTimeout(() => {
        setAutoSaveState('idle');
      }, 2000);
    }, 800);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span>⚡</span>
          <span>Laboratório de Motion &amp; Curvas Cinéticas Enterprise</span>
        </div>
        <p className={styles.subtitle}>
          Inspeção óptica de curvas Bézier calibradas para o ecossistema WMS/PDV do CubeBox, microinterações táteis e garantia de zero fadiga visual.
        </p>
      </div>

      {/* Painel de WCAG A11y: Reduced Motion */}
      <div className={styles.a11yPanel}>
        <div className={styles.a11yInfo}>
          <span className={styles.a11yLabel}>🛡️ Conformidade WCAG 2.1 AA (Critério 2.3.3)</span>
          <span className={styles.a11yDesc}>
            O CubeBox respeita a diretiva <code>prefers-reduced-motion</code> do sistema operacional, zerando transições para operadores sensíveis.
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={triggerMotionRun}>
          {isRunning ? '▶ Executando Trajetória...' : 'Disparar Comparativo Bézier'}
        </Button>
      </div>

      {/* Grid de Curvas Bézier Comparativas */}
      <div className={styles.curvesGrid}>
        {/* Curva 1: Linear */}
        <div className={styles.curveCard}>
          <div className={styles.curveHeader}>
            <span className={styles.curveName}>Linear (Mecânica / Rígida)</span>
            <code className={styles.curveFormula}>linear</code>
          </div>
          <span className={styles.curveUsage}>
            Uso: Spinners e barras de progresso contínuo de uploads. Evitar em transições de tela.
          </span>
          <div className={styles.motionTrack}>
            <div
              className={`${styles.motionRunner} ${styles.runnerLinear} ${
                isRunning ? styles.activeEnd : ''
              }`}
            >
              01
            </div>
          </div>
        </div>

        {/* Curva 2: Standard Ease */}
        <div className={styles.curveCard}>
          <div className={styles.curveHeader}>
            <span className={styles.curveName}>Standard (Material/Web)</span>
            <code className={styles.curveFormula}>0.4, 0, 0.2, 1</code>
          </div>
          <span className={styles.curveUsage}>
            Uso: Micro-hovers, foco de inputs e alternância de botões secundários.
          </span>
          <div className={styles.motionTrack}>
            <div
              className={`${styles.motionRunner} ${styles.runnerStandard} ${
                isRunning ? styles.activeEnd : ''
              }`}
            >
              02
            </div>
          </div>
        </div>

        {/* Curva 3: Ease-Out Quint (Oficial CubeBox) */}
        <div className={styles.curveCard} style={{ borderColor: 'var(--primary)' }}>
          <div className={styles.curveHeader}>
            <span className={styles.curveName}>Smooth Quint (Entrada Orgânica)</span>
            <code className={styles.curveFormula}>0.22, 1, 0.36, 1</code>
          </div>
          <span className={styles.curveUsage}>
            <strong>Padrão Oficial:</strong> Entradas de modais, drawers, popups e revelação de dados sem solavanco.
          </span>
          <div className={styles.motionTrack}>
            <div
              className={`${styles.motionRunner} ${styles.runnerQuint} ${
                isRunning ? styles.activeEnd : ''
              }`}
              style={{ backgroundColor: 'var(--status-info)' }}
            >
              03
            </div>
          </div>
        </div>

        {/* Curva 4: Springy Elastic Bounce */}
        <div className={styles.curveCard}>
          <div className={styles.curveHeader}>
            <span className={styles.curveName}>Spring Bounce (Feedback Tátil)</span>
            <code className={styles.curveFormula}>0.175, 0.885, 0.32, 1.28</code>
          </div>
          <span className={styles.curveUsage}>
            Uso: Alertas sonoros/visuais, micro-pulsos de confirmação de estoque e badges de contagem.
          </span>
          <div className={styles.motionTrack}>
            <div
              className={`${styles.motionRunner} ${styles.runnerSpring} ${
                isRunning ? styles.activeEnd : ''
              }`}
              style={{ backgroundColor: 'var(--status-success)' }}
            >
              04
            </div>
          </div>
        </div>
      </div>

      {/* Microinterações Essenciais do Sistema WMS/PDV */}
      <div style={{ marginTop: 'var(--space-2)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
          Microinterações Críticas de Negócio &amp; Chão de Loja
        </h3>

        <div className={styles.microGrid}>
          {/* Micro 1: Flash Óptico de Barcode Scanner */}
          <div className={styles.microCard}>
            <span className={styles.microTitle}>1. Flash Óptico de Barcode (100ms)</span>
            <span className={styles.microDesc}>
              Confirmação visual instantânea de bip físico em ambientes com ruído industrial elevado.
            </span>
            <div
              className={`${styles.barcodeTarget} ${
                isBarcodeFlashing ? styles.barcodeFlashSuccess : ''
              }`}
            >
              <span>📷 [BIP]</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>7891234567890</span>
            </div>
            <Button variant="secondary" size="sm" onClick={triggerBarcodeScanFeedback}>
              Simular Leitura Laser (BIP)
            </Button>
          </div>

          {/* Micro 2: Micro-Bounce de Alertas & Quarentena */}
          <div className={styles.microCard}>
            <span className={styles.microTitle}>2. Micro-Bounce Tátil de Notificação</span>
            <span className={styles.microDesc}>
              Aviso elástico sutil ao registrar novo lote em quarentena ou divergência fiscal.
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', height: '42px' }}>
              <span>Notificações Pendentes:</span>
              <div
                className={`${styles.bounceBadge} ${
                  isBadgeBouncing ? styles.bouncing : ''
                }`}
              >
                +{notificationCount}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={triggerNewNotification}>
              Acionar Novo Alerta (+1)
            </Button>
          </div>

          {/* Micro 3: Stagger Escalado de Linhas de Tabela */}
          <div className={styles.microCard}>
            <span className={styles.microTitle}>3. Stagger Fluido de Linhas (25ms)</span>
            <span className={styles.microDesc}>
              Entrada cascateada de itens recém-carregados, eliminando flashes abruptos de tela.
            </span>
            <div key={staggerKey} className={styles.staggerList}>
              {[
                { sku: 'SKU-001', item: 'Café Arábica Especial', delay: '0ms' },
                { sku: 'SKU-002', item: 'Filtro de Papel 103', delay: '25ms' },
                { sku: 'SKU-003', item: 'Xarope de Baunilha', delay: '50ms' },
              ].map((row) => (
                <div
                  key={row.sku}
                  className={styles.staggerRow}
                  style={{ animationDelay: row.delay }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.sku}</span>
                  <span>{row.item}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={triggerStaggerReload}>
              Re-executar Cascata de Linhas
            </Button>
          </div>
          {/* Micro 4: Error Background Pulse (Validação Imediata de Saldo/Lote) */}
          <div className={styles.microCard}>
            <span className={styles.microTitle}>4. Error Pulse (Pulso de Fundo Alaranjado)</span>
            <span className={styles.microDesc}>
              Pulso sutil de fundo sem tremor (shake) em tom alaranjado de alerta para sinalizar divergência ou saldo insuficiente com foco preservado.
            </span>
            <div className={`${styles.shakeInput} ${isErrorShaking ? styles.shakeActive : ''}`}>
              <span>{isErrorShaking ? '⚠️' : '📦'}</span>
              <span style={{ fontWeight: isErrorShaking ? 600 : 400 }}>
                {isErrorShaking ? 'LOTE EXPIRADO OU SEM SALDO' : 'EAN-13: 7890000000000'}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={triggerErrorShake}>
              Simular Alerta Crítico (Pulso de Fundo)
            </Button>
          </div>

          {/* Micro 5: Auto-Save Silencioso com Debounce */}
          <div className={styles.microCard}>
            <span className={styles.microTitle}>5. Auto-Save com Debounce Silencioso</span>
            <span className={styles.microDesc}>
              Transição não-bloqueante entre edição, persistência no banco e confirmação segura.
            </span>
            <div style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
              <div
                className={`${styles.autoSaveBadge} ${
                  autoSaveState === 'idle'
                    ? styles.autoSaveIdle
                    : autoSaveState === 'saving'
                    ? styles.autoSaveSaving
                    : styles.autoSaveSaved
                }`}
              >
                <span>
                  {autoSaveState === 'idle' && '✏️ Aguardando digitação...'}
                  {autoSaveState === 'saving' && '⏳ Sincronizando com PostgreSQL...'}
                  {autoSaveState === 'saved' && '✅ Salvo na nuvem com integridade'}
                </span>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={triggerAutoSaveDemo}>
              Disparar Edição de Registro
            </Button>
          </div>

          {/* Micro 6: Remoção Suave de Item (PDV Touch) */}
          <div className={styles.microCard}>
            <span className={styles.microTitle}>6. Swipe / Remoção Suave de Item</span>
            <span className={styles.microDesc}>
              Recolhimento gradual de altura e opacidade (300ms) sem solavanco no cupom fiscal.
            </span>
            <div
              className={`${styles.cartItem} ${
                isItemRemoved ? styles.cartItemRemoving : ''
              }`}
            >
              <span>1x Café Torrado 500g</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>R$ 18,90</strong>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsItemRemoved(!isItemRemoved)}
            >
              {isItemRemoved ? 'Restaurar Item na Comanda' : 'Remover Item Suavemente'}
            </Button>
          </div>

          {/* Micro 7: SEFAZ Sync Pulse & Heartbeat */}
          <div className={styles.microCard}>
            <span className={styles.microTitle}>7. Heartbeat SEFAZ &amp; Sincronização</span>
            <span className={styles.microDesc}>
              Radar visual suave de 2s para monitoramento de webservice fiscal ativo em background.
            </span>
            <div className={styles.sefazHeartbeat}>
              <div className={styles.pulseDot} />
              <span>Webservice SEFAZ-SP: <strong>Operando Normal (14ms)</strong></span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Mapeado no Topbar / Cockpit para tranquilidade operacional contínua.
            </div>
          </div>

          {/* Micro 8: Smooth Accordion / Flyout Expansion */}
          <div className={styles.microCard}>
            <span className={styles.microTitle}>8. Expansão Suave de Detalhes Fiscais</span>
            <span className={styles.microDesc}>
              Interpolação contínua de altura via CSS Grid <code>0fr ➜ 1fr</code> sem corte brusco.
            </span>
            <div className={styles.accordionCard}>
              <div
                className={styles.accordionHeader}
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              >
                <span>Tributação CFOP 5102 (ICMS/PIS/COFINS)</span>
                <span>{isAccordionOpen ? '▲' : '▼'}</span>
              </div>
              <div
                className={`${styles.accordionContent} ${
                  isAccordionOpen ? styles.accordionOpen : ''
                }`}
              >
                <div className={styles.accordionInner}>
                  <div>• CST ICMS: 00 (Tributado Integralmente - Alíquota 18%)</div>
                  <div>• NCM: 0901.21.00 (Café Torrado, Não Descafeinado)</div>
                  <div>• Regime Especial: Sem substituição tributária no estado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
