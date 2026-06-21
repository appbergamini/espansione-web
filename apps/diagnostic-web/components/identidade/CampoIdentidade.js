import { ESCALA_FREQUENCIA } from '../../lib/mapa-identidade/forms';

// Renderer genérico de um campo de formulário do Mapa de Identidade.
// Tipos: short | long | single | multi | words3 | scale4 | scale10.
// Tema dark, mobile-first. `erro` destaca o campo quando obrigatório vazio.

export default function CampoIdentidade({ campo, valor, onChange, erro }) {
  const borda = erro ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)';
  return (
    <div style={sx.campo}>
      <label style={sx.label}>
        {campo.label} {campo.required ? <span style={{ color: '#Da3144' }}>*</span> : <span style={sx.opc}>(opcional)</span>}
      </label>

      {campo.type === 'short' && (
        <input value={valor || ''} onChange={(e) => onChange(e.target.value)} style={{ ...sx.input, border: borda }} />
      )}

      {campo.type === 'long' && (
        <textarea value={valor || ''} onChange={(e) => onChange(e.target.value)} rows={3} style={{ ...sx.input, border: borda, minHeight: 88, resize: 'vertical' }} />
      )}

      {campo.type === 'single' && (
        <div style={sx.opcoes}>
          {campo.options.map((opt) => (
            <button key={opt} type="button" onClick={() => onChange(opt)} style={sx.opcao(valor === opt)}>{opt}</button>
          ))}
        </div>
      )}

      {campo.type === 'multi' && <Multi campo={campo} valor={Array.isArray(valor) ? valor : []} onChange={onChange} />}

      {campo.type === 'words3' && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              value={(Array.isArray(valor) ? valor[i] : '') || ''}
              onChange={(e) => {
                const arr = Array.isArray(valor) ? [...valor] : ['', '', ''];
                arr[i] = e.target.value;
                onChange(arr);
              }}
              placeholder={`Palavra ${i + 1}`}
              style={{ ...sx.input, border: borda, flex: '1 1 110px', minWidth: 110 }}
            />
          ))}
        </div>
      )}

      {campo.type === 'scale4' && (
        <div style={sx.opcoes}>
          {ESCALA_FREQUENCIA.map((opt) => (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)} style={{ ...sx.opcao(valor === opt.value), flex: '1 1 auto', minWidth: 120 }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {campo.type === 'scale10' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {Array.from({ length: 11 }, (_, n) => (
              <button key={n} type="button" onClick={() => onChange(n)} style={sx.nota(valor === n)}>{n}</button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', ...sx.opc, fontSize: '0.74rem' }}>
            <span>0 — nada provável</span><span>10 — muito provável</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Multi({ campo, valor, onChange }) {
  const cheio = valor.length >= campo.max;
  function toggle(opt) {
    if (valor.includes(opt)) onChange(valor.filter((v) => v !== opt));
    else if (!cheio) onChange([...valor, opt]);
  }
  return (
    <>
      <div style={sx.opcoes}>
        {campo.options.map((opt) => {
          const ativo = valor.includes(opt);
          const bloqueado = !ativo && cheio;
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} disabled={bloqueado} style={{ ...sx.opcao(ativo), opacity: bloqueado ? 0.4 : 1 }}>
              {ativo ? '✓ ' : ''}{opt}
            </button>
          );
        })}
      </div>
      <span style={{ ...sx.opc, fontSize: '0.76rem' }}>{valor.length}/{campo.max} selecionadas</span>
    </>
  );
}

const sx = {
  campo: { padding: '0.9rem 0', borderTop: '1px solid rgba(255,255,255,0.07)' },
  label: { display: 'block', marginBottom: '0.55rem', lineHeight: 1.45, fontSize: '0.96rem' },
  opc: { color: 'var(--text-secondary, #9aa)', fontSize: '0.82rem' },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.85rem', fontSize: '0.95rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: 'inherit', fontFamily: 'inherit' },
  opcoes: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  opcao: (ativo) => ({
    padding: '0.5rem 0.8rem', borderRadius: 8,
    border: ativo ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)',
    background: ativo ? 'rgba(218,49,68,0.18)' : 'rgba(255,255,255,0.03)',
    color: ativo ? '#fca5b0' : 'var(--text-secondary, #9aa)', fontSize: '0.86rem', cursor: 'pointer',
  }),
  nota: (ativo) => ({
    width: 38, height: 40, borderRadius: 8,
    border: ativo ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)',
    background: ativo ? 'rgba(218,49,68,0.22)' : 'rgba(255,255,255,0.03)',
    color: ativo ? '#fca5b0' : 'var(--text-secondary, #9aa)', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
  }),
};
