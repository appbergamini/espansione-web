// Re-export dos helpers usados pelo FormSocios para manter consistência visual.
export { Campo, RadioGroup, LegendSection, RequiredMark, TextArea, TextAreaLongo, TabelaParalela } from '../FormSocios/_ui';

/**
 * Checkbox list para múltipla escolha (usado em canais de interação).
 */
export function CheckboxGroup({ name, opcoes, values = [], onChange }) {
  const toggle = (opt) => {
    const set = new Set(values);
    if (set.has(opt)) set.delete(opt); else set.add(opt);
    onChange([...set]);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {opcoes.map(opt => {
        const marcado = values.includes(opt);
        return (
          <label
            key={opt}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
              padding: '0.5rem 0.7rem', borderRadius: 6,
              border: marcado ? '1px solid var(--accent-blue, #6BA3FF)' : '1px solid var(--glass-border)',
              background: marcado ? 'rgba(107,163,255,0.08)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.15s',
              fontSize: '0.9rem',
            }}
          >
            <input type="checkbox" name={name} value={opt} checked={marcado} onChange={() => toggle(opt)} />
            <span>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

/**
 * Escala 0-10 com slider nativo (mais mobile-friendly do que radio grid).
 */
export function EscalaSlider({ name, value, onChange, labelMin = '0', labelMax = '10' }) {
  const v = Number.isInteger(value) ? value : null;
  return (
    <div style={{ marginTop: '0.3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', alignItems: 'baseline' }}>
        <small style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{labelMin}</small>
        <strong style={{ color: 'var(--accent-blue, #6BA3FF)', fontSize: '1.1rem' }}>{v === null ? '—' : v}</strong>
        <small style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{labelMax}</small>
      </div>
      <input
        type="range"
        name={name}
        min={0}
        max={10}
        step={1}
        value={v ?? 5}
        onChange={e => onChange(parseInt(e.target.value, 10))}
        style={{ width: '100%' }}
      />
    </div>
  );
}
