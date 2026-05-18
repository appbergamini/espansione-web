export default function StrategicTensionsPanel({ slice, compact = false }) {
  const tensions = Array.isArray(slice?.tensions) ? slice.tensions : [];

  if (tensions.length === 0) return null;

  return (
    <section
      className="screen-only"
      style={{
        border: '1px solid rgba(245, 158, 11, 0.35)',
        background: 'rgba(245, 158, 11, 0.06)',
        borderRadius: 12,
        padding: compact ? '0.9rem' : '1rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: compact ? '0.95rem' : '1.05rem', color: 'var(--text-primary)' }}>
            Pontos de Escolha Estratégica
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45 }}>
            {slice.summary || 'Divergências VI/VE/VM preservadas como restrições estratégicas.'}
          </p>
        </div>
        <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
          {slice.unresolved_count ?? tensions.length} em aberto
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.85rem' }}>
        {tensions.map((tension, index) => (
          <article
            key={tension.id || `${tension.title}-${index}`}
            style={{
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              padding: '0.85rem',
              background: 'rgba(3, 7, 18, 0.28)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: '#93c5fd', fontSize: '0.72rem', fontWeight: 800 }}>{tension.theme}</div>
                <h4 style={{ margin: '0.15rem 0 0', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  {tension.title}
                </h4>
              </div>
              <span
                style={{
                  border: '1px solid rgba(251, 191, 36, 0.35)',
                  borderRadius: 999,
                  padding: '0.2rem 0.5rem',
                  color: '#fbbf24',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                }}
              >
                {tension.status || 'open'}
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', margin: '0.55rem 0', lineHeight: 1.45, fontSize: '0.82rem' }}>
              {tension.tension_summary}
            </p>

            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: compact ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)',
                gap: '0.65rem',
                margin: 0,
              }}
            >
              <Field label="Escolha necessária" value={tension.strategic_choice_needed} />
              <Field label="Risco se ignorar" value={tension.risk_if_ignored} tone="warning" />
              <Field label="Escolha recomendada" value={tension.recommended_choice} />
              <Field label="Impacto na comunicação" value={tension.impact_on_communication} />
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function Field({ label, value, tone }) {
  if (!value) return null;
  return (
    <div>
      <dt style={{ color: 'var(--text-secondary)', fontSize: '0.68rem', marginBottom: '0.2rem' }}>{label}</dt>
      <dd
        style={{
          margin: 0,
          color: tone === 'warning' ? '#fbbf24' : 'var(--text-primary)',
          fontSize: '0.78rem',
          lineHeight: 1.45,
        }}
      >
        {value}
      </dd>
    </div>
  );
}
