import { useEffect, useState } from 'react';

// Mapa do Crescimento Integrado v2 (FINAL) — card no painel do projeto.
// Gera (ou recupera) os 3 links por público (Sócios, Colaboradores/Líderes,
// Clientes/Fornecedores) e mostra contagem de respondentes + status.

const PUBLICO_LABEL = {
  socios: 'Sócios e Diretores',
  colaboradores: 'Colaboradores e Líderes',
  clientes: 'Clientes e Fornecedores',
};

export default function MapaIdentidadeFinalCard({ projetoId }) {
  const [links, setLinks] = useState(null); // [{ publico, link, respondentes, concluidos }]
  const [status, setStatus] = useState(null);
  const [erro, setErro] = useState(null);
  const [copiado, setCopiado] = useState(null); // publico copiado

  useEffect(() => {
    if (!projetoId) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/identidade-final/hub', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projeto_id: projetoId }),
        });
        const j = await res.json();
        if (!active) return;
        if (!j.success) { setErro(j.error || 'Erro'); return; }
        setLinks(j.links || []);
        setStatus(j.assessment?.status || null);
      } catch (err) {
        if (active) setErro(err.message);
      }
    })();
    return () => { active = false; };
  }, [projetoId]);

  if (!links && !erro) return null;

  function copiar(publico, link) {
    const abs = `${typeof window !== 'undefined' ? window.location.origin : ''}${link}`;
    navigator.clipboard.writeText(abs);
    setCopiado(publico);
    setTimeout(() => setCopiado(null), 1800);
  }

  const pill = {
    not_started: { txt: 'Não iniciado', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' },
    in_progress: { txt: 'Em andamento', cor: '#fde68a', bg: 'rgba(234,179,8,0.14)' },
    completed: { txt: 'Concluído', cor: '#86efac', bg: 'rgba(34,197,94,0.15)' },
  }[status] || { txt: '—', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' };

  // token de qualquer público serve para o relatório (extrai do 1º link)
  const tokenRelatorio = (() => {
    const l = (links || [])[0]?.link || '';
    const m = l.match(/token=([a-f0-9]+)/);
    return m ? m[1] : null;
  })();


  return (
    <div className="glass-card" style={st.card}>
      <div style={st.accent} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem' }}>
        <div>
          <div style={st.eyebrow}>Diagnóstico · 2ª etapa (pago)</div>
          <h3 style={st.title}>🧬 Mapa do Crescimento Integrado v2</h3>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            3 públicos · triangulação Sócios × Equipe × Externo
          </p>
        </div>
        <span style={{ ...st.pill, color: pill.cor, background: pill.bg }}>{pill.txt}</span>
      </div>

      {erro && <p style={{ color: 'var(--error, #f87171)', fontSize: '0.85rem', marginTop: '0.8rem' }}>{erro}</p>}

      {links && (
        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
          {links.map((l) => (
            <div key={l.publico} style={st.row}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{PUBLICO_LABEL[l.publico] || l.publico}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {l.respondentes} respondente(s){l.concluidos ? ` · ${l.concluidos} concluído(s)` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                <button onClick={() => copiar(l.publico, l.link)} style={st.btnAccent}>
                  {copiado === l.publico ? '✓' : '🔗 Copiar'}
                </button>
                <a href={l.link} target="_blank" rel="noreferrer" style={st.btnGhost}>Abrir →</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'completed' && tokenRelatorio && (
        <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.9rem' }}>
          <a href={`/api/identidade-final/report?token=${encodeURIComponent(tokenRelatorio)}`} target="_blank" rel="noreferrer"
            style={{ ...st.btnGhost, flex: 1, textAlign: 'center' }}>📄 Ver relatório de triangulação</a>
          <a href={`/api/identidade-final/report?token=${encodeURIComponent(tokenRelatorio)}&print=1`} target="_blank" rel="noreferrer" style={st.btnBlue}>⬇ PDF</a>
        </div>
      )}
    </div>
  );
}

const st = {
  card: { padding: '1.3rem 1.4rem', borderColor: 'rgba(218,49,68,0.28)', position: 'relative', overflow: 'hidden' },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' },
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600 },
  title: { margin: '0.2rem 0 0', fontSize: '1.05rem' },
  pill: { fontSize: '0.72rem', fontWeight: 600, padding: '0.22rem 0.6rem', borderRadius: 99, whiteSpace: 'nowrap' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 0.8rem', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' },
  btnAccent: { background: 'rgba(218,49,68,0.15)', border: '1px solid rgba(218,49,68,0.32)', color: '#fca5b0', borderRadius: 8, padding: '0.42rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' },
  btnGhost: { border: '1px solid rgba(255,255,255,0.18)', color: 'var(--text-secondary)', borderRadius: 8, padding: '0.42rem 0.7rem', fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' },
  btnBlue: { background: 'rgba(0,50,109,0.2)', border: '1px solid rgba(80,130,200,0.4)', color: '#9bb8e0', borderRadius: 8, padding: '0.55rem 0.9rem', fontSize: '0.84rem' },
};
