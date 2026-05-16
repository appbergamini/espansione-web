// FIX.35 — Bloco visual do Símbolo (Logo).
// Renderizado a partir de `simbolo-marca` fenced JSON.
//
// Estrutura esperada:
// {
//   "tipo": "Tipográfica" | "Símbolo abstrato" | "Símbolo figurativo" | "Símbolo cambiante",
//   "defesa": "1 parágrafo curto...",
//   "conceitos": ["Cuidado editorial", "Rigor patrimonial", "Discrição contemporânea"]
// }

const ICONES = {
  tipografica:    { letras: 'Aa', desc: 'Forma da letra é o símbolo' },
  'simbolo abstrato': { letras: '◇', desc: 'Forma geométrica/orgânica não-figurativa' },
  'simbolo figurativo': { letras: '◐', desc: 'Forma reconhecível com referência' },
  'simbolo cambiante': { letras: '∞', desc: 'Forma que se adapta em contextos' },
};

function normTipo(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

export default function SimboloMarca({ simbolo }) {
  const s = simbolo && typeof simbolo === 'object' ? simbolo : {};
  const tipoNorm = normTipo(s.tipo);
  const icone = ICONES[tipoNorm] || { letras: '◯', desc: 'Tipo não classificado' };
  const conceitos = Array.isArray(s.conceitos) ? s.conceitos.filter(Boolean) : [];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '1rem',
      alignItems: 'stretch',
      border: '1px solid var(--viz-card-border)',
      borderRadius: 10,
      padding: '1rem 1.1rem',
      background: 'var(--viz-card-bg)',
      margin: '0.5rem 0',
      minWidth: 0,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(107,163,255,0.18), rgba(167,139,250,0.18))',
        borderRadius: 10,
        width: '110px',
        height: '110px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--viz-card-border)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--viz-card-text)', lineHeight: 1, letterSpacing: '-0.04em' }}>
          {icone.letras}
        </span>
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--viz-card-text-muted)' }}>
          Símbolo recomendado
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--viz-card-text)', marginTop: '0.1rem' }}>
          {s.tipo || 'Não classificado'}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--viz-card-text-muted)', marginTop: '0.15rem', fontStyle: 'italic' }}>
          {icone.desc}
        </div>

        {s.defesa && (
          <p style={{ fontSize: '0.85rem', lineHeight: 1.55, color: 'var(--viz-card-text)', margin: '0.6rem 0 0.55rem', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {s.defesa}
          </p>
        )}

        {conceitos.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {conceitos.map((c, i) => (
              <span key={i} style={{
                background: 'rgba(167,139,250,0.12)',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: 14,
                padding: '0.2rem 0.65rem',
                fontSize: '0.75rem',
                color: '#a78bfa',
                fontWeight: 600,
              }}>
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
