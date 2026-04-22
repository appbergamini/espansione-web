export default function BarraProgresso({ partes, parteAtual, onClickParte }) {
  const percentual = Math.round((parteAtual / partes.length) * 100);
  const parteObj = partes[parteAtual - 1];

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem', flexWrap: 'wrap', gap: '0.4rem' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          Parte {parteAtual} de {partes.length} — {parteObj?.titulo}
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>{percentual}%</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${percentual}%`,
            background: 'var(--accent-blue, #6BA3FF)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {partes.map(p => {
          const ativa    = p.id === parteAtual;
          const completa = p.id < parteAtual;
          const bg = ativa ? 'var(--accent-blue, #6BA3FF)' : completa ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.05)';
          const color = ativa ? '#00326D' : completa ? '#10b981' : 'var(--text-secondary)';
          const border = ativa
            ? '1px solid var(--accent-blue, #6BA3FF)'
            : completa
            ? '1px solid rgba(16,185,129,0.4)'
            : '1px solid var(--glass-border)';
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onClickParte && onClickParte(p.id)}
              title={p.titulo}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                border, background: bg, color,
                cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {p.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
