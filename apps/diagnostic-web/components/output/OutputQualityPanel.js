import { buildQualityMetadataDisplayModel, EVIDENCE_STRENGTH_LABELS } from '../../lib/output/qualityMetadata';

export default function OutputQualityPanel({ metadata, compact = false }) {
  const model = buildQualityMetadataDisplayModel(metadata);

  if (!model.available) {
    return (
      <section style={panelStyle('rgba(255,255,255,0.08)', 'rgba(255,255,255,0.025)')}>
        <h3 style={titleStyle}>Qualidade da decisão</h3>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.86rem' }}>
          {model.fallbackMessage}
        </p>
      </section>
    );
  }

  const alert = model.needsHumanAttention;

  return (
    <section style={panelStyle(alert ? 'rgba(245,158,11,0.36)' : 'rgba(56,189,248,0.22)', alert ? 'rgba(245,158,11,0.055)' : 'rgba(56,189,248,0.045)')}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.8rem' }}>
        <div>
          <h3 style={titleStyle}>Qualidade da decisão</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.82rem' }}>
            Evidências, hipóteses e riscos para revisão humana.
          </p>
        </div>
        {alert && (
          <span style={{ color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.38)', borderRadius: 999, padding: '0.25rem 0.6rem', fontSize: '0.76rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
            Atenção humana
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: compact ? '0.65rem' : '0.9rem' }}>
        <Metric label="Confiança" value={typeof model.confidenceScore === 'number' ? `${model.confidenceScore}/100` : 'n/d'} />
        <Metric label="Evidência" value={model.evidenceStrengthLabel || EVIDENCE_STRENGTH_LABELS.unknown} />
      </div>

      <QualityList title="Hipóteses" items={model.assumptions} />
      <QualityList title="Lacunas de evidência" items={model.evidenceGaps} />
      <QualityList title="Contradições" items={model.contradictions} />
      {model.riskSummary && (
        <div style={{ marginTop: '0.65rem' }}>
          <div style={labelStyle}>Resumo de risco</div>
          <div style={{ color: alert ? 'var(--warning)' : 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{model.riskSummary}</div>
        </div>
      )}
      {Object.keys(model.sourceCoverage || {}).length > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {Object.entries(model.sourceCoverage).map(([key, value]) => (
            <span key={key} style={{ color: value ? 'var(--success)' : 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 999, padding: '0.18rem 0.5rem', fontSize: '0.74rem' }}>
              {sourceLabel(key)} {value ? 'ok' : 'ausente'}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.6rem', background: 'rgba(0,0,0,0.12)' }}>
      <div style={labelStyle}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function QualityList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: '0.65rem' }}>
      <div style={labelStyle}>{title}</div>
      <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.1rem' }}>
        {items.map((item, index) => (
          <li key={`${title}-${index}`} style={{ marginBottom: '0.18rem' }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function sourceLabel(key) {
  const labels = {
    vi: 'VI',
    ve: 'VE',
    vm: 'VM',
    forms: 'Forms',
    interviews: 'Entrevistas',
    market_research: 'Mercado',
  };
  return labels[key] || key;
}

function panelStyle(borderColor, background) {
  return {
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    background,
    padding: '0.9rem',
  };
}

const titleStyle = { margin: 0, fontSize: '0.98rem' };
const labelStyle = { color: 'var(--text-secondary)', fontSize: '0.76rem', marginBottom: '0.2rem' };

