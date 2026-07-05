import { useEffect, useState } from 'react';

// Mapa de Maturidade Espansione — card no painel do projeto.
// Gera (ou recupera) o link público de convite do Mapa e mostra o status.
// Quando concluído, exibe o Índice Geral + nível e link para o resultado.

export default function MapaMaturidadeCard({ projetoId }) {
  const [assessment, setAssessment] = useState(null); // { token, status }
  const [resumo, setResumo] = useState(null); // { general_score, general_level }
  const [erro, setErro] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!projetoId) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/mapa/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projeto_id: projetoId }),
        });
        const j = await res.json();
        if (!active) return;
        if (!j.success) { setErro(j.error || 'Erro'); return; }
        setAssessment(j.assessment);
        if (j.assessment?.status === 'concluido') {
          const r = await fetch(`/api/mapa/session?token=${encodeURIComponent(j.assessment.token)}`);
          const sj = await r.json();
          if (active && sj.success && sj.result) {
            setResumo({ general_score: sj.result.general_score, general_level: sj.result.general_level });
          }
        }
      } catch (err) {
        if (active) setErro(err.message);
      }
    })();
    return () => { active = false; };
  }, [projetoId]);

  if (!assessment && !erro) return null;

  const link = assessment ? `${typeof window !== 'undefined' ? window.location.origin : ''}/mapa/${assessment.token}` : '';
  const statusLabel = {
    pendente: '⏳ Não iniciado',
    em_andamento: '✍️ Em andamento',
    concluido: '✅ Concluído',
  }[assessment?.status] || '';

  function copiar() {
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  const pill = {
    pendente: { txt: 'Não iniciado', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' },
    em_andamento: { txt: 'Em andamento', cor: '#fde68a', bg: 'rgba(234,179,8,0.14)' },
    concluido: { txt: 'Concluído', cor: '#86efac', bg: 'rgba(34,197,94,0.15)' },
  }[assessment?.status] || { txt: '—', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' };

  return (
    <div className="glass-card" style={st.card}>
      <div style={st.accent} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem' }}>
        <div>
          <div style={st.eyebrow}>Diagnóstico · 1ª etapa</div>
          <h3 style={st.title}>🧭 Mapa de Maturidade</h3>
        </div>
        <span style={{ ...st.pill, color: pill.cor, background: pill.bg }}>{pill.txt}</span>
      </div>

      {erro && <p style={{ color: 'var(--error, #f87171)', fontSize: '0.85rem', marginTop: '0.8rem' }}>{erro}</p>}

      {resumo && (
        <div style={st.hero}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={st.heroNum}>{resumo.general_score}</span>
            <span style={st.heroDen}>/100</span>
            <span style={st.heroLevel}>{resumo.general_level}</span>
          </div>
          <div style={st.gaugeOut}><div style={{ ...st.gaugeIn, width: `${resumo.general_score}%` }} /></div>
          <div style={st.eyebrow}>Índice Geral Espansione</div>
        </div>
      )}

      {assessment && (
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginTop: resumo ? '1rem' : '0.9rem' }}>
          <button onClick={copiar} style={st.btnAccent}>{copiado ? '✓ Link copiado' : '🔗 Copiar link'}</button>
          <a href={link} target="_blank" rel="noreferrer" style={st.btnGhost}>
            {assessment.status === 'concluido' ? 'Ver resultado →' : 'Abrir →'}
          </a>
          {assessment.status === 'concluido' && (
            <>
              <a href={`/api/mapa/report?token=${encodeURIComponent(assessment.token)}`} target="_blank" rel="noreferrer" style={st.btnGhost}>📄 Relatório</a>
              <a href={`/api/mapa/report?token=${encodeURIComponent(assessment.token)}&print=1`} target="_blank" rel="noreferrer" style={st.btnBlue}>⬇ PDF</a>
            </>
          )}
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
  hero: { marginTop: '0.9rem' },
  heroNum: { fontSize: '2.4rem', fontWeight: 800, color: '#Da3144', lineHeight: 1 },
  heroDen: { fontSize: '0.95rem', color: 'var(--text-secondary, #9aa)' },
  heroLevel: { marginLeft: 'auto', fontSize: '0.95rem', fontWeight: 700 },
  gaugeOut: { height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', margin: '0.55rem 0 0.4rem' },
  gaugeIn: { height: '100%', background: 'linear-gradient(90deg, #Da3144, #f0667a)', borderRadius: 99 },
  btnAccent: { background: 'rgba(218,49,68,0.15)', border: '1px solid rgba(218,49,68,0.32)', color: '#fca5b0', borderRadius: 8, padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 500 },
  btnGhost: { border: '1px solid rgba(255,255,255,0.18)', color: 'var(--text-secondary)', borderRadius: 8, padding: '0.5rem 0.9rem', fontSize: '0.84rem', textDecoration: 'none' },
  btnBlue: { background: 'rgba(0,50,109,0.2)', border: '1px solid rgba(80,130,200,0.4)', color: '#9bb8e0', borderRadius: 8, padding: '0.5rem 0.9rem', fontSize: '0.84rem' },
};
