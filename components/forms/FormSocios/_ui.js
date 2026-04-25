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

export function TextAreaLongo(props) {
  return <TextArea {...props} rows={props.rows || 5} />;
}

/**
 * Tabela pareada: renderiza colunas lado a lado em desktop e empilhadas em mobile.
 * `colunas` é um array de { header, children } — `children` é o input/textarea a renderizar.
 */
/**
 * FIX.30 — Multi-select com limite de seleções e suporte a "Outro" livre.
 * Salva o valor em respostas_json como array de strings. Quando o user
 * marca "Outro", aparece um input de texto livre. Outras opções marcadas
 * são strings literais; "Outro: <texto>" é injetado automaticamente.
 *
 * Props:
 *   value: string[] ou undefined (compat com forms antigos sem o campo)
 *   onChange: (string[]) => void
 *   opcoes: string[]
 *   max?: number (limita seleções; default ilimitado)
 *   permitirOutro?: boolean (default true; injeta opção "Outro")
 */
export function CheckboxGrid({ value, onChange, opcoes, max, permitirOutro = true, colunas = 2 }) {
  const arr = Array.isArray(value) ? value : [];
  const outroSelecionado = arr.some(v => v.startsWith('Outro:') || v === 'Outro');
  const outroTexto = (arr.find(v => v.startsWith('Outro:')) || '').replace(/^Outro:\s*/, '');
  const semOutro = arr.filter(v => !v.startsWith('Outro:') && v !== 'Outro');

  const toggle = (opt) => {
    const ja = arr.includes(opt);
    if (ja) {
      onChange(arr.filter(v => v !== opt));
      return;
    }
    if (typeof max === 'number' && semOutro.length + (outroSelecionado ? 1 : 0) >= max) {
      return; // limite atingido, não adiciona
    }
    onChange([...arr, opt]);
  };

  const toggleOutro = () => {
    if (outroSelecionado) {
      onChange(arr.filter(v => v !== 'Outro' && !v.startsWith('Outro:')));
    } else {
      if (typeof max === 'number' && semOutro.length + 1 > max) return;
      onChange([...arr, 'Outro']);
    }
  };

  const setOutroTexto = (txt) => {
    const semOpcao = arr.filter(v => v !== 'Outro' && !v.startsWith('Outro:'));
    const novoMarker = txt.trim() ? `Outro: ${txt.trim()}` : 'Outro';
    onChange([...semOpcao, novoMarker]);
  };

  const limiteAtingido = typeof max === 'number' && (semOutro.length + (outroSelecionado ? 1 : 0)) >= max;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))`, gap: '0.4rem' }} className="checkbox-grid-inner">
        {opcoes.map(opt => {
          const marcado = arr.includes(opt);
          const desabilitado = !marcado && limiteAtingido;
          return (
            <label
              key={opt}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                padding: '0.45rem 0.6rem', borderRadius: 6,
                border: marcado ? '1px solid var(--accent-blue, #6BA3FF)' : '1px solid var(--glass-border)',
                background: marcado ? 'rgba(107,163,255,0.08)' : 'rgba(255,255,255,0.02)',
                cursor: desabilitado ? 'not-allowed' : 'pointer',
                opacity: desabilitado ? 0.5 : 1,
                fontSize: '0.85rem',
                lineHeight: 1.35,
                transition: 'all 0.12s',
              }}
            >
              <input
                type="checkbox"
                checked={marcado}
                disabled={desabilitado}
                onChange={() => toggle(opt)}
                style={{ marginTop: '0.15rem', flexShrink: 0 }}
              />
              <span>{opt}</span>
            </label>
          );
        })}
        {permitirOutro && (
          <label
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              padding: '0.45rem 0.6rem', borderRadius: 6,
              border: outroSelecionado ? '1px solid var(--accent-blue, #6BA3FF)' : '1px solid var(--glass-border)',
              background: outroSelecionado ? 'rgba(107,163,255,0.08)' : 'rgba(255,255,255,0.02)',
              cursor: (!outroSelecionado && limiteAtingido) ? 'not-allowed' : 'pointer',
              opacity: (!outroSelecionado && limiteAtingido) ? 0.5 : 1,
              fontSize: '0.85rem',
              lineHeight: 1.35,
              transition: 'all 0.12s',
            }}
          >
            <input
              type="checkbox"
              checked={outroSelecionado}
              disabled={!outroSelecionado && limiteAtingido}
              onChange={toggleOutro}
              style={{ marginTop: '0.15rem', flexShrink: 0 }}
            />
            <span>Outro</span>
          </label>
        )}
      </div>
      {outroSelecionado && (
        <input
          type="text"
          className="form-input"
          placeholder="Especifique outro motivo / tipo / canal…"
          value={outroTexto}
          onChange={e => setOutroTexto(e.target.value)}
          style={{ width: '100%', fontSize: '0.85rem' }}
        />
      )}
      {typeof max === 'number' && (
        <small style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
          {semOutro.length + (outroSelecionado ? 1 : 0)}/{max} selecionado(s)
        </small>
      )}
      <style jsx>{`
        @media (max-width: 640px) {
          :global(.checkbox-grid-inner) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Lista numerada (até N itens). Compacta: cada linha é um input simples,
 * o user preenche só o que faz sentido. Salva como array de strings.
 */
export function ListaCurta({ value, onChange, max = 3, placeholder }) {
  const arr = Array.isArray(value) ? value : [];
  const items = Array.from({ length: max }, (_, i) => arr[i] || '');
  const setItem = (i, v) => {
    const novo = [...items];
    novo[i] = v;
    onChange(novo.filter(x => x && x.trim()));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {items.map((v, i) => (
        <input
          key={i}
          type="text"
          className="form-input"
          placeholder={`${placeholder || 'Item'} ${i + 1}${i === 0 ? '' : ' (opcional)'}`}
          value={v}
          onChange={e => setItem(i, e.target.value)}
          style={{ width: '100%', fontSize: '0.88rem' }}
        />
      ))}
    </div>
  );
}

export function TabelaParalela({ colunas, titulo, hint }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      {titulo && <div style={{ fontWeight: 500, fontSize: '0.92rem', marginBottom: '0.3rem' }}>{titulo}</div>}
      {hint && <small style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontSize: '0.78rem' }}>{hint}</small>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colunas.length}, minmax(0, 1fr))`, gap: '0.75rem' }}
           className="tabela-paralela-grid">
        {colunas.map((col, i) => (
          <div key={i}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-blue, #6BA3FF)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
              {col.header}
            </div>
            {col.children}
          </div>
        ))}
      </div>
      <style jsx>{`
        @media (max-width: 640px) {
          :global(.tabela-paralela-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
