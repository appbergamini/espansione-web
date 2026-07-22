import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

// Painel de leads do funil do Mapa (teste grátis em /mapa). Master/admin.
const STATUS = {
  concluido: { txt: 'Concluído', cor: '#86efac', bg: 'rgba(34,197,94,0.15)' },
  em_andamento: { txt: 'Em andamento', cor: '#fde68a', bg: 'rgba(234,179,8,0.15)' },
};

function dataBr(iso) {
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return '—'; }
}

export default function AdminLeads() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/adm/leads');
        if (r.status === 401) { router.replace('/login'); return; }
        if (r.status === 403) { router.replace('/adm'); return; }
        const j = await r.json();
        if (j.success) setLeads(j.leads || []);
        else setErro(j.error || 'Erro');
      } catch { setErro('Erro de conexão'); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const concluidos = leads.filter((l) => l.status === 'concluido').length;

  return (
    <>
      <Head><title>Leads do Mapa · Espansione</title></Head>
      <div className="page-container">
        <main className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Logo size="lg" showTagline={false} />
              <div style={{ height: '64px', width: '1px', background: 'var(--glass-border)' }} />
              <h1 style={{ fontSize: '1.5rem' }}>🧲 Leads do Mapa</h1>
            </div>
            <button onClick={() => router.push('/adm')} style={sx.back}>← Painel</button>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.4rem', flexWrap: 'wrap', gap: '0.6rem' }}>
              <h2 style={{ margin: 0 }}>Teste grátis (/mapa)</h2>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {leads.length} lead(s) · <b style={{ color: '#86efac' }}>{concluidos}</b> concluíram
                {leads.length > 0 && <> ({Math.round((concluidos / leads.length) * 100)}%)</>}
              </span>
            </div>

            {loading ? (
              <div style={sx.empty}>Carregando…</div>
            ) : erro ? (
              <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: 8, color: '#fff' }}>{erro}</div>
            ) : leads.length === 0 ? (
              <div style={sx.empty}>Nenhum lead ainda.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                      <th style={sx.th}>Data</th>
                      <th style={sx.th}>Lead</th>
                      <th style={sx.th}>Empresa</th>
                      <th style={sx.th}>Contato</th>
                      <th style={sx.th}>Segmento</th>
                      <th style={sx.th}>Status</th>
                      <th style={sx.th}>Score</th>
                      <th style={{ ...sx.th, textAlign: 'right' }}>Relatório</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => {
                      const st = STATUS[l.status] || { txt: l.status || '—', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' };
                      const progresso = l.status !== 'concluido' ? ` · ${l.respondidas}/${l.total_perguntas}` : '';
                      return (
                        <tr key={l.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                          <td style={sx.td}>{dataBr(l.started_at)}</td>
                          <td style={sx.td}>
                            {l.nome || <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                            {l.papel && <div style={sx.sub}>{l.papel}</div>}
                          </td>
                          <td style={sx.td}>
                            {l.empresa || <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                            {l.porte && <div style={sx.sub}>{l.porte} pessoas</div>}
                          </td>
                          <td style={sx.td}>{l.contato || <span style={{ color: 'var(--text-secondary)' }}>—</span>}</td>
                          <td style={sx.td}>{l.segmento || '—'}</td>
                          <td style={sx.td}><span style={{ ...sx.pill, color: st.cor, background: st.bg }}>{st.txt}{progresso}</span></td>
                          <td style={sx.td}>
                            {l.score != null
                              ? <><b>{Math.round(l.score)}%</b>{l.nivel ? <span style={{ color: 'var(--text-secondary)' }}> · N{l.nivel}</span> : null}</>
                              : '—'}
                          </td>
                          <td style={{ ...sx.td, textAlign: 'right' }}>
                            {l.status === 'concluido'
                              ? <a href={`/api/mapa/report?token=${l.token}`} target="_blank" rel="noreferrer" style={sx.link}>abrir</a>
                              : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

const sx = {
  back: { padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer' },
  th: { padding: '0.8rem 1rem', fontWeight: 500 },
  td: { padding: '0.8rem 1rem', verticalAlign: 'top' },
  sub: { color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 },
  empty: { textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' },
  pill: { fontSize: '0.76rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 99, whiteSpace: 'nowrap' },
  link: { color: '#fca5b0', textDecoration: 'none' },
};
