// FIX.35 — Bloco visual de Moodboard sugerido.
// Renderizado a partir de `moodboard` fenced JSON.
//
// Estrutura esperada:
// [
//   { "territorio": "Editorial patrimonial", "descricao": "...", "cor_associada": "#10233F" },
//   { "territorio": "Cinema autoral BR", "descricao": "...", "cor_associada": "#5A2E38" }
// ]

export default function Moodboard({ moodboard }) {
  const lista = Array.isArray(moodboard) ? moodboard : [];
  if (lista.length === 0) {
    return (
      <div style={{ padding: '0.75rem 1rem', border: '1px dashed var(--viz-card-border)', borderRadius: 8, fontStyle: 'italic', color: 'var(--viz-card-text-muted)', fontSize: '0.85rem' }}>
        Moodboard não informado.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', margin: '0.5rem 0' }}>
      {lista.map((m, i) => {
        const cor = normalizeHex(m.cor_associada) || '#6BA3FF';
        return (
          <div
            key={i}
            style={{
              background: 'var(--viz-card-bg)',
              border: '1px solid var(--viz-card-border)',
              borderRadius: 10,
              overflow: 'hidden',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              background: `linear-gradient(135deg, ${cor}, ${cor}cc)`,
              height: '52px',
              borderBottom: '1px solid var(--viz-card-border)',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute',
                bottom: '0.4rem', left: '0.7rem',
                fontSize: '0.65rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                color: '#fff',
                opacity: 0.85,
                background: 'rgba(0,0,0,0.25)',
                padding: '0.1rem 0.4rem',
                borderRadius: 3,
              }}>
                {cor.toUpperCase()}
              </span>
            </div>
            <div style={{ padding: '0.7rem 0.85rem 0.85rem', minWidth: 0 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--viz-card-text)', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {m.territorio || m.nome || '—'}
              </div>
              {m.descricao && (
                <p style={{ fontSize: '0.78rem', lineHeight: 1.5, color: 'var(--viz-card-text-muted)', margin: '0.3rem 0 0', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {m.descricao}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function normalizeHex(s) {
  if (!s || typeof s !== 'string') return null;
  const m = s.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return '#' + h.toLowerCase();
}
