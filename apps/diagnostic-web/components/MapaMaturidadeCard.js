import { useEffect, useState } from 'react';

// Mapa de Maturidade Espansione — card no painel do projeto.
// Gera (ou recupera) o link público de convite do Mapa e mostra o status.
// Quando concluído, exibe o Índice Geral + nível e link para o resultado.

export default function MapaMaturidadeCard({ projetoId }) {
  const [assessment, setAssessment] = useState(null); // { token, status }
  const [resumo, setResumo] = useState(null); // { general_score, general_level }
  const [erro, setErro] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [pdf, setPdf] = useState('idle'); // idle|gerando|erro

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

  async function baixarPdf() {
    if (!assessment) return;
    setPdf('gerando');
    try {
      const r = await fetch(`/api/mapa/report?token=${encodeURIComponent(assessment.token)}`);
      if (!r.ok) throw new Error('falha');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mapa-de-maturidade.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setPdf('idle');
    } catch {
      setPdf('erro');
    }
  }

  return (
    <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(218,49,68,0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>🧭 Mapa de Maturidade</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{statusLabel}</span>
      </div>

      {erro && <p style={{ color: 'var(--error, #f87171)', fontSize: '0.85rem' }}>{erro}</p>}

      {resumo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', margin: '0.4rem 0 0.8rem' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#Da3144', lineHeight: 1 }}>{resumo.general_score}</span>
          <span style={{ fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Índice Geral · </span>
            <strong>{resumo.general_level}</strong>
          </span>
        </div>
      )}

      {assessment && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={copiar}
            style={{ background: 'rgba(218,49,68,0.15)', border: '1px solid rgba(218,49,68,0.3)', color: '#fca5b0', borderRadius: 8, padding: '0.5rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {copiado ? '✓ Link copiado' : '🔗 Copiar link do Mapa'}
          </button>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            style={{ border: '1px solid rgba(255,255,255,0.18)', color: 'var(--text-secondary)', borderRadius: 8, padding: '0.5rem 0.9rem', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            {assessment.status === 'concluido' ? 'Ver resultado →' : 'Abrir →'}
          </a>
          {assessment.status === 'concluido' && (
            <button
              onClick={baixarPdf}
              disabled={pdf === 'gerando'}
              style={{ background: 'rgba(0,50,109,0.18)', border: '1px solid rgba(0,50,109,0.4)', color: '#9bb8e0', borderRadius: 8, padding: '0.5rem 0.9rem', cursor: pdf === 'gerando' ? 'default' : 'pointer', fontSize: '0.85rem', opacity: pdf === 'gerando' ? 0.6 : 1 }}
            >
              {pdf === 'gerando' ? 'Gerando…' : pdf === 'erro' ? 'Erro — repetir' : '⬇ Baixar PDF'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
