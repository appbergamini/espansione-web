import { useMemo, useState } from 'react';
import { TREINAMENTOS, aulas as todasAulas, embedUrl, BUNNY_LIBRARY_ID } from '../lib/treinamentos';

// Player de treinamentos (Bunny Stream) + lista de aulas. Compartilhado pela
// área do cliente (/area) e pela página de setup pós-compra (/identidade/setup).
export default function TreinamentosPlayer() {
  const lista = useMemo(() => todasAulas(), []);
  const [atual, setAtual] = useState(() => lista.find((a) => a.videoId) || lista[0] || null);
  const url = atual ? embedUrl(atual.videoId) : null;

  return (
    <div>
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.3rem' }}>{atual?.titulo || 'Trilha de treinamento'}</h2>

      <div style={sx.player}>
        {url ? (
          <iframe src={url} loading="lazy" style={sx.iframe} allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen" allowFullScreen title={atual?.titulo} />
        ) : (
          <div style={sx.vazio}>{!BUNNY_LIBRARY_ID ? 'Vídeos em configuração — em breve.' : 'Esta aula estará disponível em breve.'}</div>
        )}
      </div>
      {atual?.descricao && <p style={sx.desc}>{atual.descricao}</p>}

      <div style={{ marginTop: '1.3rem', display: 'grid', gap: '1.1rem' }}>
        {TREINAMENTOS.map((m) => (
          <div key={m.modulo}>
            <div style={sx.modulo}>{m.modulo}</div>
            <div style={{ display: 'grid', gap: '0.45rem', marginTop: '0.5rem' }}>
              {m.aulas.map((a) => {
                const ativo = atual?.id === a.id;
                const disp = !!(BUNNY_LIBRARY_ID && a.videoId);
                return (
                  <button key={a.id} onClick={() => setAtual({ ...a, modulo: m.modulo })} style={sx.aula(ativo, disp)}>
                    <span style={{ fontSize: '1rem' }}>{disp ? (ativo ? '▶' : '○') : '⏳'}</span>
                    <span style={{ flex: 1 }}>{a.titulo}</span>
                    {a.duracao && <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary,#9aa)' }}>{a.duracao}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const sx = {
  player: { position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', background: '#0b1220', border: '1px solid rgba(255,255,255,0.08)' },
  iframe: { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 },
  vazio: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary, #9aa)', fontSize: '0.95rem' },
  desc: { color: 'var(--text-secondary, #9aa)', fontSize: '0.9rem', marginTop: '0.9rem' },
  modulo: { fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fca5b0', fontWeight: 700 },
  aula: (on, disp) => ({ display: 'flex', alignItems: 'center', gap: '0.7rem', textAlign: 'left', padding: '0.7rem 0.9rem', borderRadius: 9, border: on ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.08)', background: on ? 'rgba(218,49,68,0.12)' : 'rgba(255,255,255,0.03)', color: disp ? 'inherit' : 'var(--text-secondary,#9aa)', cursor: 'pointer', fontSize: '0.9rem', width: '100%' }),
};
