import React, { useState } from 'react';
import styles from './LivingDocsLab.module.css';
import { Button } from '../index';

interface TokenItem {
  name: string;
  category: 'color' | 'space' | 'typography' | 'z-index' | 'motion';
  value: string;
  type: string;
  description: string;
}

const DESIGN_TOKENS_CATALOG: TokenItem[] = [
  { name: '--primary', category: 'color', value: '#0ea5e9 (Light) / #38bdf8 (Dark)', type: 'color', description: 'Cor primária de ação do sistema' },
  { name: '--bg-canvas', category: 'color', value: '#E1EEF3 (Light) / #181818 (Dark)', type: 'color', description: 'Superfície de fundo de página (Zero #000 / Zero #FFF)' },
  { name: '--bg-surface-elevated', category: 'color', value: '#FFFFFF (Light) / #282828 (Dark)', type: 'color', description: 'Cards e modais elevados' },
  { name: '--status-warning', category: 'color', value: '#f59e0b', type: 'color', description: 'Alerta semântico anti-pânico de lote próximo do vencimento' },
  { name: '--status-danger', category: 'color', value: '#ef4444', type: 'color', description: 'Rejeição crítica fiscal SEFAZ ou ruptura' },
  { name: '--space-4', category: 'space', value: '16px', type: 'dimension', description: 'Espaçamento base-8 do layout e padding padrão' },
  { name: '--space-2', category: 'space', value: '8px', type: 'dimension', description: 'Gutter interno e respiro de ícones' },
  { name: '--font-sans', category: 'typography', value: "'Geist', sans-serif", type: 'fontFamily', description: 'Fonte oficial aprovada para interface e inputs' },
  { name: '--font-mono', category: 'typography', value: "'Geist Mono', monospace", type: 'fontFamily', description: 'Fonte com tabular-nums para moedas e SKUs' },
  { name: '--z-modal', category: 'z-index', value: '1300', type: 'number', description: 'Nível de elevação para modais e backdrops' },
  { name: '--ease-out-quint', category: 'motion', value: 'cubic-bezier(0.22, 1, 0.36, 1)', type: 'cubicBezier', description: 'Curva física de desaceleração suave' },
];

export const LivingDocsLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'dos-donts' | 'tokens' | 'architecture'>('sandbox');

  // Estados do Sandbox do Button
  const [btnVariant, setBtnVariant] = useState<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  const [btnSize, setBtnSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [btnLabel, setBtnLabel] = useState<string>('Confirmar Baixa');
  const [btnHotkey, setBtnHotkey] = useState<string>('F4');

  // Estados do Token Inspector
  const [tokenSearch, setTokenSearch] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const generatedTsx = `<Button
  variant="${btnVariant}"
  size="${btnSize}"${btnLoading ? '\n  isLoading={true}' : ''}${btnDisabled ? '\n  disabled={true}' : ''}${btnHotkey ? `\n  hotkey="${btnHotkey}"` : ''}
  onClick={() => handleExecute()}
>
  ${btnLabel}
</Button>`;

  const filteredTokens = DESIGN_TOKENS_CATALOG.filter(t =>
    t.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    t.category.toLowerCase().includes(tokenSearch.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Navegação entre Abas da Dimensão 7 */}
      <div className={styles.tabNavigation} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sandbox'}
          className={`${styles.navButton} ${activeTab === 'sandbox' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('sandbox')}
        >
          <span>🎛️</span>
          <span>Props Explorer &amp; Code Sandbox</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'dos-donts'}
          className={`${styles.navButton} ${activeTab === 'dos-donts' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('dos-donts')}
        >
          <span>⚖️</span>
          <span>Guia Contextual: Do's &amp; Don'ts</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'tokens'}
          className={`${styles.navButton} ${activeTab === 'tokens' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          <span>🏷️</span>
          <span>Token Inspector (W3C DTCG)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'architecture'}
          className={`${styles.navButton} ${activeTab === 'architecture' ? styles.navButtonActive : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          <span>🤖</span>
          <span>A11y SC &amp; AI-Ready Machine Spec</span>
        </button>
      </div>

      {/* ABA 1: PROPS EXPLORER & SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className={styles.explorerGrid}>
          <div className={styles.controlsPanel}>
            <div style={{ fontSize: '13px', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
              Configurador de Props (Button)
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Variante</span>
              <div className={styles.btnGroupOptions}>
                {(['primary', 'secondary', 'danger', 'ghost'] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`${styles.optionPill} ${btnVariant === v ? styles.optionPillActive : ''}`}
                    onClick={() => setBtnVariant(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Tamanho (Size)</span>
              <div className={styles.btnGroupOptions}>
                {(['sm', 'md', 'lg'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.optionPill} ${btnSize === s ? styles.optionPillActive : ''}`}
                    onClick={() => setBtnSize(s)}
                  >
                    {s} {s === 'md' ? '(44px touch)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Estados Booleanos</span>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={btnLoading}
                    onChange={(e) => setBtnLoading(e.target.checked)}
                  />
                  Loading
                </label>
                <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={btnDisabled}
                    onChange={(e) => setBtnDisabled(e.target.checked)}
                  />
                  Disabled
                </label>
              </div>
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Texto do Rótulo</span>
              <input
                type="text"
                value={btnLabel}
                onChange={(e) => setBtnLabel(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 8px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              />
            </div>

            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Hotkey Integrado</span>
              <input
                type="text"
                value={btnHotkey}
                onChange={(e) => setBtnHotkey(e.target.value)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 8px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          </div>

          <div className={styles.previewStage}>
            <div className={styles.stageCanvas}>
              <Button
                variant={btnVariant}
                size={btnSize}
                isLoading={btnLoading}
                disabled={btnDisabled}
                hotkey={btnHotkey || undefined}
                onClick={() => alert(`Ação disparada com sucesso! (${btnLabel})`)}
              >
                {btnLabel}
              </Button>
            </div>

            <div className={styles.snippetCard}>
              <div className={styles.snippetHeader}>
                <span className={styles.snippetTitle}>snippet.tsx — Auto-Generated Code</span>
                <button
                  type="button"
                  className={styles.copyButton}
                  onClick={() => handleCopy(generatedTsx, 'btn-tsx')}
                >
                  {copiedSnippet === 'btn-tsx' ? '✓ Copiado!' : 'Copiar TSX'}
                </button>
              </div>
              <pre className={styles.codeBlock}>
                <code>{generatedTsx}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: DO'S AND DON'TS */}
      {activeTab === 'dos-donts' && (
        <div className={styles.dosDontsGrid}>
          {/* Card 1: Feedbacks & Alertas */}
          <div className={styles.doCard}>
            <div className={`${styles.cardHeader} ${styles.headerSuccess}`}>
              <span>✓ DO (Boas Práticas Oficiais)</span>
            </div>
            <div className={styles.cardContent}>
              <strong>Use Calm UI com Borda-Guia Lateral:</strong> Mensagens de alerta devem residir sobre fundo neutro elevado com borda lateral demarcada de 4px e texto neutro de alto contraste (&gt; 11:1).
            </div>
            <div className={styles.visualExample}>
              <div style={{
                background: 'var(--bg-surface-elevated)',
                borderLeft: '4px solid var(--status-warning)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-card)',
                width: '100%',
              }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>Lote Próximo do Vencimento</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Restam 3 dias para a expiração física no armazém central.</div>
              </div>
            </div>
          </div>

          <div className={styles.dontCard}>
            <div className={`${styles.cardHeader} ${styles.headerDanger}`}>
              <span>✕ DON'T (Anti-Pattern Proibido)</span>
            </div>
            <div className={styles.cardContent}>
              <strong>Não use fundos saturados neon ou texto colorido:</strong> Fundos amarelos brilhantes com texto escuro ou tipografia vermelha piscante causam fadiga visual e aumentam erros do operador em turnos longos.
            </div>
            <div className={styles.visualExample}>
              <div style={{
                background: '#ffea00',
                color: '#ff0000',
                padding: '10px 14px',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '12px',
                width: '100%',
                border: '2px solid red',
              }}>
                ⚠️ ATENÇÃO: LOTE VENCENDO IMEDIATAMENTE!!!
              </div>
            </div>
          </div>

          {/* Card 2: Numerais e Tipografia */}
          <div className={styles.doCard}>
            <div className={`${styles.cardHeader} ${styles.headerSuccess}`}>
              <span>✓ DO (Numerais Alinhados com Tabular Nums)</span>
            </div>
            <div className={styles.cardContent}>
              <strong>Use Geist Mono com tabular-nums:</strong> Valores monetários, cotações e saldos de inventário devem possuir largura monoespaçada fixa para evitar tremores ópticos na tela.
            </div>
            <div className={styles.visualExample}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                R$ 1.489,50
              </div>
            </div>
          </div>

          <div className={styles.dontCard}>
            <div className={`${styles.cardHeader} ${styles.headerDanger}`}>
              <span>✕ DON'T (Layout-Jitter em Números Proporcionais)</span>
            </div>
            <div className={styles.cardContent}>
              <strong>Não use fontes de largura variável para contadores ao vivo:</strong> Algarismos como '1' têm larguras menores que '8', causando saltos no alinhamento das colunas durante atualizações automáticas.
            </div>
            <div className={styles.visualExample}>
              <div style={{ fontFamily: 'Times New Roman, serif', fontSize: '18px', fontWeight: 700, color: 'var(--text-muted)' }}>
                R$ 1.489,50
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: TOKEN INSPECTOR (W3C DTCG) */}
      {activeTab === 'tokens' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <input
              type="text"
              placeholder="Pesquisar token por nome, tipo ou contexto..."
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              className={styles.tokenSearchInput}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Padrão <strong>W3C DTCG</strong> ({filteredTokens.length} tokens listados)
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className={styles.tokensTable}>
              <thead>
                <tr>
                  <th>Token CSS (Var)</th>
                  <th>Tipo ($type)</th>
                  <th>Valor Atual ($value)</th>
                  <th>Finalidade Semântica</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.map((token) => (
                  <tr key={token.name}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                      {token.name}
                    </td>
                    <td>
                      <span className={styles.tokenBadgeType}>{token.type}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {token.type === 'color' && (
                        <span
                          className={styles.tokenColorSample}
                          style={{
                            background: token.name === '--bg-canvas'
                              ? 'var(--bg-canvas)'
                              : token.name === '--status-warning'
                              ? 'var(--status-warning)'
                              : token.name === '--status-danger'
                              ? 'var(--status-danger)'
                              : 'var(--primary)',
                          }}
                        />
                      )}
                      {token.value}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{token.description}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.copyButton}
                        onClick={() => handleCopy(`var(${token.name})`, token.name)}
                      >
                        {copiedSnippet === token.name ? '✓ Copiado' : 'Copiar var()'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: A11Y SC & MACHINE SPEC */}
      {activeTab === 'architecture' && (
        <div className={styles.architectureCard}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Matriz de Acessibilidade &amp; Especificação Pronta para IA (Machine-Readable)
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Todos os componentes operacionais do CubeBox possuem mapeamento determinístico para critérios de sucesso WCAG 2.1 AA/AAA e contratos de API padronizados para consumo por agentes inteligentes e servidores MCP.
          </p>

          <div className={styles.a11yGrid}>
            <div className={styles.a11yItem}>
              <div className={styles.a11yHeader}>
                <span className={styles.a11yTitle}>SC 1.4.3 Contraste de Texto</span>
                <span className={styles.a11yBadge}>WCAG AAA (9.8:1)</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Fundo Light <code>#E1EEF3</code> com texto <code>#373737</code> e Dark <code>#181818</code> com texto <code>#E1EEF3</code> sem fadiga visual.
              </div>
            </div>

            <div className={styles.a11yItem}>
              <div className={styles.a11yHeader}>
                <span className={styles.a11yTitle}>SC 2.1.2 Sem Armadilha de Teclado</span>
                <span className={styles.a11yBadge}>Conforme</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Escape-to-close automático em modais, flyouts e seletores, restaurando o foco original no elemento disparador.
              </div>
            </div>

            <div className={styles.a11yItem}>
              <div className={styles.a11yHeader}>
                <span className={styles.a11yTitle}>SC 2.3.3 Movimento sob Demanda</span>
                <span className={styles.a11yBadge}>Conforme</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Respeito compulsório a <code>prefers-reduced-motion: reduce</code>, desativando transições e animações sem quebrar o layout.
              </div>
            </div>

            <div className={styles.a11yItem}>
              <div className={styles.a11yHeader}>
                <span className={styles.a11yTitle}>SC 2.5.5 Touch Target Mínimo</span>
                <span className={styles.a11yBadge}>44px x 44px</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Área mínima tátil nos botões, seletores de pagamento numéricos e campos de entrada para tablets de balcão.
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              🤖 Contexto para Agentes de IA &amp; MCP (Machine-Readable Context)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Disponível via SDD formal: <code>docs/sdd/SDD-CBOX-DESIGN-SYSTEM-V1.0.0.md</code> | Registry de Tokens: <code>variables.css</code> | Zero CSS inline permitido.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
