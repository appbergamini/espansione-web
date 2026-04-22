// Helpers visuais compartilhados entre as Partes do FormSocios.

export function RequiredMark() {
  return <span style={{ color: 'var(--brand-red, #dc2626)' }}>*</span>;
}

export function Campo({ id, label, erro, children, hint }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {label && (
        <label htmlFor={id} style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 500, fontSize: '0.92rem' }}>
          {label}
        </label>
      )}
      {hint && <small style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontSize: '0.78rem' }}>{hint}</small>}
      {children}
      {erro && <small style={{ display: 'block', color: 'var(--brand-red, #dc2626)', marginTop: '0.25rem', fontSize: '0.8rem' }}>{erro}</small>}
    </div>
  );
}

export function LegendSection({ titulo, children }) {
  return (
    <fieldset style={{
      border: '1px solid var(--glass-border)',
      borderRadius: 10,
      padding: '1.25rem',
      marginBottom: '1.25rem',
      background: 'rgba(255,255,255,0.015)',
    }}>
      <legend style={{ fontWeight: 700, padding: '0 0.5rem', fontSize: '0.88rem', color: 'var(--accent-blue, #6BA3FF)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
        {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

export function RadioGroup({ name, opcoes, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {opcoes.map(opt => {
        const selecionado = value === opt;
        return (
          <label
            key={opt}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
              padding: '0.5rem 0.7rem', borderRadius: 6,
              border: selecionado ? '1px solid var(--accent-blue, #6BA3FF)' : '1px solid var(--glass-border)',
              background: selecionado ? 'rgba(107,163,255,0.08)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.15s',
              fontSize: '0.9rem',
            }}
          >
            <input type="radio" name={name} value={opt} checked={selecionado} onChange={() => onChange(opt)} />
            <span>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

export function TextArea({ id, value, onChange, rows = 4, placeholder, erro }) {
  return (
    <>
      <textarea
        id={id}
        className="form-input"
        rows={rows}
        value={value || ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%' }}
      />
      {erro && <small style={{ display: 'block', color: 'var(--brand-red, #dc2626)', marginTop: '0.2rem', fontSize: '0.8rem' }}>{erro}</small>}
    </>
  );
}
