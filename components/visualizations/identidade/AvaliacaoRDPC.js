// FIX.35 — Bloco visual de Avaliação RDPC.
// Renderizado a partir de `avaliacao-rdpc` fenced JSON.
//
// Estrutura esperada:
// [
//   { "criterio": "Relevante",     "classificacao": "Forte",    "defesa": "..." },
//   { "criterio": "Diferenciada",  "classificacao": "Razoável", "defesa": "..." },
//   { "criterio": "Proprietária",  "classificacao": "Frágil",   "defesa": "..." },
//   { "criterio": "Consistente",   "classificacao": "Forte",    "defesa": "..." }
// ]

const COR_POR_CLASSIFICACAO = {
  forte:    { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.45)', fg: '#10b981', simbolo: '●' },
  razoavel: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.45)', fg: '#f59e0b', simbolo: '◐' },
  fragil:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.45)',  fg: '#ef4444', simbolo: '○' },
};

function normClass(c) {
  return String(c || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function AvaliacaoRDPC({ avaliacao }) {
  const lista = Array.isArray(avaliacao) ? avaliacao : [];
  if (lista.length === 0) {
    return (
      <div style={{ padding: '0.75rem 1rem', border: '1px dashed var(--viz-card-border)', borderRadius: 8, fontStyle: 'italic', color: 'var(--viz-card-text-muted)', fontSize: '0.85rem' }}>
        Avaliação RDPC não informada.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', margin: '0.5rem 0' }}>
      {lista.map((item, i) => {
        const cor = COR_POR_CLASSIFICACAO[normClass(item.classificacao)] || {
          bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.30)', fg: '#94a3b8', simbolo: '–',
        };
        return (
          <div
            key={i}
            style={{
              background: cor.bg,
              border: `1px solid ${cor.border}`,
              borderRadius: 10,
              padding: '0.85rem 1rem',
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.55rem', marginBottom: '0.35rem' }}>
              <span style={{ color: cor.fg, fontSize: '1.1rem', lineHeight: 1 }}>{cor.simbolo}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--viz-card-text-muted)' }}>
                  {item.criterio || '—'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: cor.fg, marginTop: '0.1rem' }}>
                  {item.classificacao || '—'}
                </div>
              </div>
            </div>
            {item.defesa && (
              <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--viz-card-text)', margin: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {item.defesa}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
