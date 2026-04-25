// FIX.35 — Gauge horizontal entre Minimalista e Sensorial.
// Renderizado a partir de `comportamento-visual` fenced JSON.
//
// Estrutura esperada:
// {
//   "posicao": 30,           // 0 = totalmente minimalista, 100 = totalmente sensorial
//   "label": "Minimalista com pontos sensoriais",  // opcional
//   "defesa": "..."          // 1-2 frases explicando o porquê
// }

export default function ComportamentoVisual({ comportamento }) {
  const c = comportamento && typeof comportamento === 'object' ? comportamento : {};
  const pos = Number.isFinite(Number(c.posicao)) ? Math.max(0, Math.min(100, Number(c.posicao))) : 50;
  const label = c.label || (pos < 35 ? 'Predominantemente minimalista' : pos > 65 ? 'Predominantemente sensorial' : 'Equilíbrio entre minimalismo e sensorialidade');
  const defesa = c.defesa || null;

  return (
    <div style={{
      border: '1px solid var(--viz-card-border)',
      borderRadius: 10,
      padding: '1.05rem 1.1rem 1.2rem',
      background: 'var(--viz-card-bg)',
      margin: '0.5rem 0',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--viz-card-text-muted)' }}>
          Comportamento Visual
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--viz-card-text-muted)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
          {pos}/100
        </div>
      </div>

      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--viz-card-text)', marginBottom: '0.7rem', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
        {label}
      </div>

      {/* Trilha + indicador */}
      <div style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '0.4rem' }}>
        <div style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: '0%', right: `${100 - pos}%`,
          background: 'linear-gradient(90deg, #6BA3FF 0%, #a78bfa 100%)',
          borderRadius: '4px',
          transition: 'right 0.25s',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%', transform: 'translate(-50%, -50%)',
          left: `${pos}%`,
          width: '14px', height: '14px',
          borderRadius: '50%',
          background: '#fff',
          border: '2px solid #a78bfa',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--viz-card-text-muted)', marginBottom: defesa ? '0.7rem' : 0 }}>
        <span>Minimalista</span>
        <span>Sensorial</span>
      </div>

      {defesa && (
        <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: 'var(--viz-card-text)', margin: '0.4rem 0 0', borderTop: '1px solid var(--viz-card-border)', paddingTop: '0.55rem', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {defesa}
        </p>
      )}
    </div>
  );
}
