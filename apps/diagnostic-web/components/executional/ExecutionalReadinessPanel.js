export default function ExecutionalReadinessPanel({ readiness, compact = false }) {
  if (!readiness) return null;

  return (
    <section
      className="screen-only"
      style={{
        border: '1px solid rgba(34, 197, 94, 0.32)',
        background: 'rgba(34, 197, 94, 0.055)',
        borderRadius: 12,
        padding: compact ? '0.9rem' : '1rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: compact ? '0.95rem' : '1.05rem' }}>
            Prontidão de Execução
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45 }}>
            {readiness.summary}
          </p>
        </div>
        <div style={{ display: 'grid', gap: '0.35rem', justifyItems: 'end' }}>
          <Badge>{alignmentLabel(readiness.internal_alignment_level)}</Badge>
          {typeof readiness.confidence_score === 'number' ? (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
              confiança {readiness.confidence_score}/100
            </span>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '0.75rem', marginTop: '0.85rem' }}>
        <ListBlock title="Riscos de adoção" items={readiness.adoption_risks} tone="warning" />
        <ListBlock title="Bloqueadores culturais" items={readiness.cultural_blockers} tone="danger" />
        <ListBlock title="Sinais da liderança" items={readiness.leadership_style_signals} />
        <ListBlock title="Perfil de decisão" items={readiness.decision_profile_signals} />
        <ListBlock title="Gaps de capacidade" items={readiness.capability_gaps} tone="warning" />
        <ListBlock title="Gestão da mudança" items={readiness.recommended_change_management_notes} tone="success" />
      </div>

      <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {sourceLabels(readiness.source_basis).map((label) => (
          <span
            key={label}
            style={{
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 999,
              padding: '0.22rem 0.52rem',
              color: 'var(--text-secondary)',
              fontSize: '0.68rem',
              fontWeight: 800,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function ListBlock({ title, items = [], tone }) {
  if (!items.length) return null;
  const color = tone === 'danger'
    ? 'var(--brand-red)'
    : tone === 'warning'
      ? 'var(--warning)'
      : tone === 'success'
        ? 'var(--success)'
        : 'var(--accent-blue)';

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.75rem', background: 'rgba(3,7,18,0.25)' }}>
      <div style={{ color, fontSize: '0.76rem', fontWeight: 800, marginBottom: '0.45rem' }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.45 }}>
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span
      style={{
        border: '1px solid rgba(34, 197, 94, 0.35)',
        borderRadius: 999,
        padding: '0.2rem 0.55rem',
        color: '#34d399',
        fontSize: '0.68rem',
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

function alignmentLabel(value) {
  const labels = {
    high: 'alinhamento alto',
    medium: 'alinhamento médio',
    low: 'alinhamento baixo',
    unknown: 'alinhamento incerto',
  };
  return labels[value] || labels.unknown;
}

function sourceLabels(source = {}) {
  const labels = [];
  if (source.forms) labels.push('formulários');
  if (source.interviews) labels.push('entrevistas');
  if (source.cis) labels.push('CIS');
  if (source.disc) labels.push('DISC');
  if (source.diagnostic_360) labels.push('diagnóstico 360');
  if (source.inferred) labels.push('inferido');
  return labels.length ? labels : ['base não informada'];
}
