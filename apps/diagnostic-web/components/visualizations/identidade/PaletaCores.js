// FIX.34 — Bloco visual de paleta de cores. Renderizado a partir de
// `paleta-cores` fenced JSON dentro do <conteudo> do Agente 11.
//
// Estrutura esperada do JSON:
// [
//   { "nome": "Marinho Profundo", "hex": "#0A1F3D", "papel": "Primária — institucional", "uso": "..." },
//   ...
// ]
//
// "uso" é opcional e descreve onde a cor aparece (ex.: "fundos de card",
// "headings", "destaques de CTA").

export default function PaletaCores({ cores }) {
  const lista = Array.isArray(cores) ? cores : [];
  if (lista.length === 0) {
    return (
      <div style={{ padding: '0.75rem 1rem', border: '1px dashed var(--viz-card-border)', borderRadius: 8, fontStyle: 'italic', color: 'var(--viz-card-text-muted)', fontSize: '0.85rem' }}>
        Paleta de cores não informada.
      </div>
    );
  }

  return (
    <div className="paleta-cores-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.85rem', margin: '0.5rem 0' }}>
      {lista.map((c, i) => (
        <Swatch key={i} {...c} />
      ))}
      <style jsx>{`
        @media print {
          .paleta-cores-wrapper {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  );
}

function Swatch({ nome, hex, papel, uso }) {
  const cor = normalizeHex(hex) || '#888';
  const luma = lumaFromHex(cor);
  const textoSobreCor = luma > 0.55 ? '#0a1f3d' : '#ffffff';

  // FIX.35 — minWidth:0 + overflow-wrap:anywhere quebram texto longo
  // (ex.: "Verde Musgo de Arquivo") evitando overflow horizontal do card.
  const textoQuebravel = { wordBreak: 'break-word', overflowWrap: 'anywhere' };

  return (
    <div style={{
      borderRadius: 10,
      overflow: 'hidden',
      border: '1px solid var(--viz-card-border)',
      background: 'var(--viz-card-bg)',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    }}>
      <div style={{
        background: cor,
        color: textoSobreCor,
        padding: '1.4rem 0.9rem 1.1rem',
        minHeight: '110px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        minWidth: 0,
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2, ...textoQuebravel }}>
          {nome || '—'}
        </div>
        <div style={{ fontSize: '0.78rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', opacity: 0.85, marginTop: '0.25rem', ...textoQuebravel }}>
          {cor.toUpperCase()}
        </div>
      </div>
      {(papel || uso) && (
        <div style={{ padding: '0.55rem 0.85rem 0.7rem', fontSize: '0.78rem', lineHeight: 1.45, minWidth: 0 }}>
          {papel && (
            <div style={{ color: 'var(--viz-card-text)', fontWeight: 600, ...textoQuebravel }}>{papel}</div>
          )}
          {uso && (
            <div style={{ color: 'var(--viz-card-text-muted)', marginTop: '0.15rem', ...textoQuebravel }}>{uso}</div>
          )}
        </div>
      )}
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

function lumaFromHex(hex) {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return 0.5;
  const num = parseInt(m[1], 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;
  // luma relativa simplificada (rec. 601)
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
