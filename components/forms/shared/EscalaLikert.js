/**
 * Escala Likert responsiva (radio-grid).
 * Usada na Parte 6 (1-4) e reutilizável para escalas 1-5.
 */
export default function EscalaLikert({
  name,
  value,
  onChange,
  escala = 4,
  labelMin = 'Nunca',
  labelMax = 'Sempre',
}) {
  const valores = Array.from({ length: escala }, (_, i) => i + 1);

  return (
    <div style={{ margin: '0.5rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${escala}, 1fr)`, gap: '0.4rem' }}>
        {valores.map(v => {
          const selecionado = value === v;
          return (
            <label
              key={v}
              style={{
                padding: '0.6rem 0', textAlign: 'center',
                border: `1px solid ${selecionado ? 'var(--accent-blue, #6BA3FF)' : 'var(--glass-border)'}`,
                borderRadius: 6, cursor: 'pointer',
                background: selecionado ? 'var(--accent-blue, #6BA3FF)' : 'rgba(255,255,255,0.02)',
                color: selecionado ? '#00326D' : 'var(--text-primary)',
                fontWeight: 700, transition: 'all 0.15s',
                userSelect: 'none',
              }}
            >
              <input
                type="radio"
                name={name}
                value={v}
                checked={selecionado}
                onChange={() => onChange(v)}
                style={{ display: 'none' }}
              />
              {v}
            </label>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
        <small>{labelMin}</small>
        <small>{labelMax}</small>
      </div>
    </div>
  );
}
