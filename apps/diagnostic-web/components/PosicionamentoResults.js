import { useState } from 'react';

const DISCIPLINAS = [
  { key: 'excelencia_operacional', label: 'Excelência Operacional', short: 'EO', color: '#f59e0b' },
  { key: 'intimidade_cliente', label: 'Intimidade com Cliente', short: 'IC', color: '#10b981' },
  { key: 'lideranca_produto', label: 'Liderança em Produto', short: 'LP', color: '#60a5fa' },
];

function Bar({ label, value, color, showPercent = true }) {
  const pct = Math.max(0, Math.min(1, value || 0));
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color }}>{(value || 0).toFixed(2)} {showPercent && `· ${Math.round(pct * 100)}%`}</span>
      </div>
      <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: '5px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

export default function PosicionamentoResults({ respostas, projetoNome, onClose }) {
  const [view, setView] = useState('consolidado');
  const [expandedId, setExpandedId] = useState(null);

  const respPos = (respostas || [])
    .filter(r => r.tipo === 'posicionamento_estrategico')
    .map(r => ({
      id: r.id,
      respondente: r.respondente || 'anônimo',
      scores: r.respostas_json?.scores,
      interpretacao: r.respostas_json?.interpretacao,
      raw: r.respostas_json,
      created: r.created_at,
    }))
    .filter(r => r.scores);

  if (respPos.length === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#0a1122', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem', maxWidth: '420px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.75rem' }}>Nenhuma resposta ainda</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Os sócios ainda não responderam o Teste de Posicionamento Estratégico.
          </p>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>Fechar</button>
        </div>
      </div>
    );
  }

  // Consolidado: média dos 3 scores
  const consolidado = DISCIPLINAS.map(d => ({
    ...d,
    media: respPos.reduce((acc, r) => acc + (r.scores[d.key] || 0), 0) / respPos.length,
  })).sort((a, b) => b.media - a.media);

  const dominante = consolidado[0];
  const secundaria = consolidado[1];
  const fraco = consolidado[2];

  // Detecta divergência entre sócios (mesmos dominantes vs diferentes)
  const dominantesPorSocio = respPos.map(r => r.interpretacao?.dominante);
  const todosConcordam = dominantesPorSocio.every(d => d === dominantesPorSocio[0]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', overflow: 'auto' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0a1122', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '2rem', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>📊 Posicionamento Estratégico</h2>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {projetoNome} · {respPos.length} respondente(s)
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }} title="Fechar">×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', margin: '1.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
          <button onClick={() => setView('consolidado')} style={{ padding: '0.5rem 1rem', background: view === 'consolidado' ? 'rgba(96,165,250,0.15)' : 'transparent', border: `1px solid ${view === 'consolidado' ? 'var(--accent-blue)' : 'transparent'}`, color: view === 'consolidado' ? 'var(--accent-blue)' : 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>Consolidado</button>
          <button onClick={() => setView('individual')} style={{ padding: '0.5rem 1rem', background: view === 'individual' ? 'rgba(96,165,250,0.15)' : 'transparent', border: `1px solid ${view === 'individual' ? 'var(--accent-blue)' : 'transparent'}`, color: view === 'individual' ? 'var(--accent-blue)' : 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>Por respondente</button>
        </div>

        {view === 'consolidado' && (
          <div>
            <div style={{ background: `${dominante.color}15`, border: `1px solid ${dominante.color}55`, borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Posicionamento Dominante</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: dominante.color }}>{dominante.label}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                Score médio: <strong>{dominante.media.toFixed(2)}</strong> · Secundária: {secundaria.label} ({secundaria.media.toFixed(2)}) · Fraca: {fraco.label} ({fraco.media.toFixed(2)})
              </div>
            </div>

            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: 'var(--text-primary)' }}>Distribuição agregada (média)</h3>
            {DISCIPLINAS.map(d => {
              const c = consolidado.find(x => x.key === d.key);
              return <Bar key={d.key} label={d.label} value={c.media} color={d.color} />;
            })}

            {!todosConcordam && respPos.length > 1 && (
              <div style={{ marginTop: '1.25rem', padding: '0.9rem 1rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600, marginBottom: '0.25rem' }}>⚠ Divergência entre sócios</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Os sócios não concordam sobre o posicionamento dominante — {respPos.map(r => `${r.respondente.split(' ')[0]} vê ${r.interpretacao?.dominante}`).join(', ')}.
                  Isso costuma ser um ponto de tensão estratégica crítica — vale aprofundar na Visão Geral (Agente 6).
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>Sobre o teste:</strong> 27 afirmações da metodologia PWR Gestão, mapeadas às 3 disciplinas de valor (Treacy &amp; Wiersema). Scores normalizados 0–1. O dominante indica o centro de gravidade estratégico atual da organização.
            </div>
          </div>
        )}

        {view === 'individual' && (
          <div>
            {respPos.map(r => {
              const expanded = expandedId === r.id;
              return (
                <div key={r.id} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '0.75rem', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    style={{ width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.02)', border: 'none', padding: '1rem 1.25rem', cursor: 'pointer', color: 'var(--text-primary)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{r.respondente}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Dominante: <span style={{ color: DISCIPLINAS.find(d => d.label === r.interpretacao?.dominante)?.color || 'var(--accent-blue)', fontWeight: 600 }}>{r.interpretacao?.dominante}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {DISCIPLINAS.map(d => (
                            <div key={d.key} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              <span style={{ color: d.color, fontWeight: 600 }}>{d.short}</span> {(r.scores[d.key] || 0).toFixed(2)}
                            </div>
                          ))}
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{expanded ? '▼' : '▶'}</span>
                      </div>
                    </div>
                  </button>
                  {expanded && (
                    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
                      {DISCIPLINAS.map(d => (
                        <Bar key={d.key} label={d.label} value={r.scores[d.key]} color={d.color} />
                      ))}
                      {r.raw?.somas_brutas && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          Somas brutas (antes da normalização ÷46): EO={r.raw.somas_brutas.EO} · IC={r.raw.somas_brutas.IC} · LP={r.raw.somas_brutas.LP}
                        </div>
                      )}
                      {/* Respostas por questão */}
                      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Respostas (1 Mín → 4 Máx)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '0.25rem', fontSize: '0.72rem' }}>
                          {Array.from({ length: 27 }, (_, i) => i + 1).map(q => {
                            const v = Number(r.raw?.[`q${q}`] || 0);
                            const cor = v >= 4 ? '#10b981' : v >= 3 ? '#60a5fa' : v >= 2 ? '#f59e0b' : '#ef4444';
                            return (
                              <div key={q} style={{ background: `${cor}22`, border: `1px solid ${cor}55`, borderRadius: '4px', padding: '0.3rem 0.2rem', textAlign: 'center' }}>
                                <div style={{ color: 'var(--text-secondary)' }}>{q}</div>
                                <div style={{ color: cor, fontWeight: 700 }}>{v || '—'}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
