// components/visualizations/tokens.js
//
// Design tokens para os 5 componentes de visualização do Bloco D (CIS + Maturidade 360°).
// Thin wrapper sobre as CSS vars definidas em styles/globals.css — não é segunda
// fonte de verdade. Se trocar cor aqui, troca na var CSS.
//
// Observação importante: os cards são "ilhas claras editoriais" (fundo #FEFEFE)
// dentro do painel em tema escuro. Cores internas dos gráficos (eixos, fills)
// são as da paleta da marca (azul, vermelho, verde, âmbar).

export const VIZ_TOKENS = {
  // ─── Cores dos gráficos ───────────────────────────────────────────────
  // Usar em backgroundColor, fill, stroke — via style={{ color: var(--...) }}.
  colors: {
    primary:      'var(--brand-blue)',        // #00326D — azul marinho Espansione
    primaryLight: 'var(--brand-blue-light)',  // #6BA3FF
    accent:       'var(--brand-red)',         // #Da3144 — vermelho da marca
    success:      'var(--viz-success)',       // #10B981 — score ≥ 70
    warning:      'var(--viz-warning)',       // #F59E0B — score 40-69
    critical:     'var(--viz-critical)',      // --brand-red — score < 40
  },

  // ─── Card "ilha clara" editorial ───────────────────────────────────────
  // Wrapper padrão de todo componente de visualização.
  card: {
    bg:         'var(--viz-card-bg)',          // #FEFEFE
    text:       'var(--viz-card-text)',        // #111827
    textMuted:  'var(--viz-card-text-muted)',  // #6B7280
    border:     'var(--viz-card-border)',      // #E5E7EB
    shadow:     'var(--viz-card-shadow)',      // sombra sutil editorial
    radius:     12,                            // px — maior que UI padrão
    padding:    24,                            // px — arejado
  },

  // ─── Tipografia ────────────────────────────────────────────────────────
  typography: {
    title: { fontSize: 16, fontWeight: 700, lineHeight: 1.3 },
    label: { fontSize: 12, fontWeight: 500, color: 'var(--viz-card-text-muted)' },
    value: { fontSize: 14, fontWeight: 700 },
    note:  { fontSize: 12, fontStyle: 'italic', color: 'var(--viz-card-text-muted)' },
  },

  // ─── Dimensões padrão ──────────────────────────────────────────────────
  dimensions: {
    heatmapCellMinHeight: 72,  // px
    radarSize:            280, // px (lado do quadrado do radar)
    barJungHeight:        10,  // px
  },
};

/**
 * Classifica score de competência (0-100).
 * @param {number|null} score
 * @returns {'sustains'|'developing'|'fragile'|'unknown'}
 */
export function classificarScore(score) {
  if (score === null || score === undefined) return 'unknown';
  if (score >= 70) return 'sustains';
  if (score >= 40) return 'developing';
  return 'fragile';
}

/**
 * Nome da CSS var correspondente à classificação. Útil para color-mix.
 * @param {'sustains'|'developing'|'fragile'|'unknown'} c
 * @returns {string}  '--viz-success' | '--viz-warning' | '--viz-critical' | '--viz-card-text-muted'
 */
export function cssVarPorClassificacao(c) {
  if (c === 'sustains')   return '--viz-success';
  if (c === 'developing') return '--viz-warning';
  if (c === 'fragile')    return '--viz-critical';
  return '--viz-card-text-muted';
}

/**
 * Cor direta (resolvida para var()) a partir da classificação.
 * @param {'sustains'|'developing'|'fragile'|'unknown'} c
 * @returns {string}
 */
export function corPorClassificacao(c) {
  if (c === 'sustains')   return VIZ_TOKENS.colors.success;
  if (c === 'developing') return VIZ_TOKENS.colors.warning;
  if (c === 'fragile')    return VIZ_TOKENS.colors.critical;
  return VIZ_TOKENS.colors.primary;
}
