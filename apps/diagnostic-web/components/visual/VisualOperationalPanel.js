export default function VisualOperationalPanel({ slice }) {
  if (!slice) return null;
  const hasContent = [
    slice.visual_principles,
    slice.dos,
    slice.donts,
    slice.visual_risks,
    slice.prompt_guidelines,
  ].some((items) => Array.isArray(items) && items.length > 0);
  if (!hasContent) return null;

  return (
    <section
      className="screen-only"
      style={{
        border: '1px solid rgba(56, 189, 248, 0.28)',
        background: 'rgba(56, 189, 248, 0.055)',
        borderRadius: 12,
        padding: '1rem',
        marginBottom: '1rem',
      }}
    >
      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
        Sistema Visual Operacional
      </h3>
      <p style={{ margin: '0.25rem 0 0.85rem', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.45 }}>
        Direção visual preparada para Agência IA, prompts conceituais e revisão de ativos criativos.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.75rem' }}>
        <ListBlock title="Princípios" items={slice.visual_principles} />
        <ListBlock title="Dos" items={slice.dos} tone="success" />
        <ListBlock title="Don'ts" items={slice.donts} tone="danger" />
        <ListBlock title="Riscos visuais" items={slice.visual_risks} tone="warning" />
        <ListBlock title="Prompt guidelines" items={slice.prompt_guidelines} />
        <ListBlock title="Imagem" items={[...(slice.image_style?.photography || []), ...(slice.image_style?.illustration || []), ...(slice.image_style?.iconography || [])]} />
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
