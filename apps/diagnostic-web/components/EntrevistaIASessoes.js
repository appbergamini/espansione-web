import { useEffect, useState } from 'react';

// Entrevista guiada por IA — Slice 3.
// Card de status no painel do projeto: quem está em andamento / concluiu a
// entrevista conduzida por IA. Conteúdo das respostas não é exibido aqui —
// apenas o status operacional (o conteúdo vive em `formularios`, anônimo p/
// colaboradores).

const PAPEL_LABEL = { socios: 'Sócio', colaboradores: 'Colaborador', clientes: 'Cliente' };

export default function EntrevistaIASessoes({ projetoId }) {
  const [items, setItems] = useState(null);
  const [counts, setCounts] = useState({ em_andamento: 0, concluida: 0 });
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!projetoId) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/entrevista/sessions?projeto_id=${encodeURIComponent(projetoId)}`);
        if (!res.ok) { if (active) { setItems([]); } return; }
        const j = await res.json();
        if (!active) return;
        setItems(j.items || []);
        setCounts(j.counts || { em_andamento: 0, concluida: 0 });
      } catch (err) {
        if (active) setErro(err.message);
      }
    })();
    return () => { active = false; };
  }, [projetoId]);

  // Sem nenhuma entrevista IA iniciada → não polui o painel.
  if (items === null) return null;
  if (items.length === 0 && !erro) return null;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', borderColor: 'rgba(167,139,250,0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>🤖 Entrevistas por IA</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          ✅ {counts.concluida} concluída{counts.concluida === 1 ? '' : 's'} · ⏳ {counts.em_andamento} em andamento
        </span>
      </div>
      {erro && <p style={{ color: 'var(--error, #f87171)', fontSize: '0.85rem' }}>{erro}</p>}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {items.map((s) => (
          <li key={s.respondente_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
            <span>
              {s.status === 'concluida' ? '✅' : '⏳'} {s.nome}
              <span style={{ color: 'var(--text-secondary)' }}> · {PAPEL_LABEL[s.papel] || s.papel}</span>
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              {s.updated_at ? new Date(s.updated_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
