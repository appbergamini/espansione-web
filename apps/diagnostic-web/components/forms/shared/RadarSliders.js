/**
 * Sliders 0-10 para cada dimensão do Radar de Marca Empregadora.
 * Mobile-friendly: input[type=range] nativo.
 */
export default function RadarSliders({ dimensoes, valores = {}, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {dimensoes.map(dim => {
        const valorAtual = Number.isInteger(valores[dim]) ? valores[dim] : 5;
        return (
          <div
            key={dim}
            style={{
              border: '1px solid var(--glass-border)',
              padding: '0.75rem 0.9rem',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 500, fontSize: '0.92rem' }}>{dim}</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-blue, #6BA3FF)', fontSize: '1.1rem' }}>{valorAtual}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={valorAtual}
              onChange={e => onChange(dim, parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <small>0 — inexistente</small>
              <small>10 — referência</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}
