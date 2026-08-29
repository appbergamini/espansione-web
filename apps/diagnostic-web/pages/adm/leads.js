import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../../components/Logo';
import { supabase } from '../../lib/supabaseClient';
import { getServerUser } from '../../lib/getServerUser';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { ROLES_LEADS } from '../../lib/api/auth';

// Painel de leads do funil do Mapa (teste grátis em /mapa). Master/admin.
const STATUS = {
  concluido: { txt: 'Concluído', cor: '#86efac', bg: 'rgba(34,197,94,0.15)' },
  em_andamento: { txt: 'Em andamento', cor: '#fde68a', bg: 'rgba(234,179,8,0.15)' },
};

function horaBr(iso) {
  try { return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
}

function dataBr(iso) {
  try { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }); } catch { return '—'; }
}

const COLUNAS = [
  { key: 'started_at', label: 'Data', largura: '7%' },
  { key: 'nome', label: 'Lead', largura: '10%' },
  { key: 'empresa', label: 'Empresa', largura: '10%' },
  { key: 'contato', label: 'WhatsApp', largura: '9%' },
  { key: 'segmento', label: 'Segmento', largura: '8%' },
  { key: 'utm_source', label: 'Origem', largura: '7%' },
  { key: 'utm_medium', label: 'Mídia', largura: '6%' },
  { key: 'utm_campaign', label: 'Campanha', largura: '9%' },
  { key: 'utm_content', label: 'Conteúdo', largura: '7.5%' },
  { key: 'utm_term', label: 'Termo', largura: '6%' },
  { key: 'status', label: 'Status', largura: '8.5%' },
  { key: 'score', label: 'Score', largura: '7%' },
  { key: 'relatorio', label: 'Relatório', largura: '4.5%', align: 'right' },
];

function valorOrdenacao(lead, key) {
  if (key === 'started_at') return lead.started_at ? new Date(lead.started_at).getTime() : null;
  if (key === 'score') return lead.score;
  if (key === 'relatorio') return lead.status === 'concluido' ? 1 : 0;
  if (key === 'status') return STATUS[lead.status]?.txt || lead.status;
  return lead[key];
}

// UTMs podem vir com nomes de campanha enormes; cortamos a largura da coluna
// e deixamos o valor inteiro no title (hover) para a tabela nao esticar.
function Utm({ valor }) {
  if (!valor) return '—';
  return <span title={valor} style={sx.trunc}>{valor}</span>;
}

function comparar(a, b, key, direction) {
  const valorA = valorOrdenacao(a, key);
  const valorB = valorOrdenacao(b, key);
  const vazioA = valorA == null || valorA === '';
  const vazioB = valorB == null || valorB === '';

  // Valores ausentes permanecem no fim nas duas direções.
  if (vazioA || vazioB) {
    if (vazioA && vazioB) return 0;
    return vazioA ? 1 : -1;
  }

  const resultado = typeof valorA === 'number' && typeof valorB === 'number'
    ? valorA - valorB
    : String(valorA).localeCompare(String(valorB), 'pt-BR', { sensitivity: 'base', numeric: true });

  return direction === 'asc' ? resultado : -resultado;
}

// Porta de entrada da página: exige sessão e um dos papéis de ROLES_LEADS
// (master/admin veem tudo; 'digital' só enxerga este painel).
export async function getServerSideProps({ req, res }) {
  const { user } = await getServerUser(req, res);
  if (!user) return { redirect: { destination: '/login?next=/adm/leads', permanent: false } };

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !ROLES_LEADS.includes(profile.role)) {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }

  return { props: { role: profile.role } };
}

export default function AdminLeads({ role }) {
  const router = useRouter();
  const soLeads = role === 'digital';
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [ordenacao, setOrdenacao] = useState({ key: 'started_at', direction: 'desc' });

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
  const leadsOrdenados = useMemo(() => leads
    .map((lead, indice) => ({ lead, indice }))
    .sort((a, b) => comparar(a.lead, b.lead, ordenacao.key, ordenacao.direction) || a.indice - b.indice)
    .map(({ lead }) => lead), [leads, ordenacao]);

  function ordenarPor(key) {
    setOrdenacao((atual) => ({
      key,
      direction: atual.key === key && atual.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <>
      <Head><title>Leads do Mapa · Espansione</title></Head>
      <div className="page-container">
        <main className="container" style={{ maxWidth: 1680 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Logo size="lg" showTagline={false} />
              <div style={{ height: '64px', width: '1px', background: 'var(--glass-border)' }} />
              <h1 style={{ fontSize: '1.5rem' }}>🧲 Leads do Mapa</h1>
            </div>
            {soLeads ? (
              <button onClick={async () => { await supabase.auth.signOut(); router.replace('/login'); }} style={sx.back}>Sair</button>
            ) : (
              <button onClick={() => router.push('/adm')} style={sx.back}>← Painel</button>
            )}
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
                <table style={{ width: '100%', minWidth: 1120, borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', tableLayout: 'fixed' }}>
                  <colgroup>
                    {COLUNAS.map((coluna) => <col key={coluna.key} style={{ width: coluna.largura }} />)}
                  </colgroup>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                      {COLUNAS.map((coluna) => {
                        const ativa = ordenacao.key === coluna.key;
                        const direcao = ativa ? ordenacao.direction : null;
                        return (
                          <th
                            key={coluna.key}
                            scope="col"
                            aria-sort={ativa ? (direcao === 'asc' ? 'ascending' : 'descending') : 'none'}
                            style={{ ...sx.th, textAlign: coluna.align || 'left' }}
                          >
                            <button
                              type="button"
                              onClick={() => ordenarPor(coluna.key)}
                              title={`Ordenar por ${coluna.label}`}
                              style={{ ...sx.sortButton, justifyContent: coluna.align === 'right' ? 'flex-end' : 'flex-start' }}
                            >
                              <span>{coluna.label}</span>
                              <span aria-hidden="true" style={{ ...sx.sortIcon, opacity: ativa ? 1 : 0.45 }}>
                                {direcao === 'asc' ? '↑' : direcao === 'desc' ? '↓' : '↕'}
                              </span>
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {leadsOrdenados.map((l) => {
                      const st = STATUS[l.status] || { txt: l.status || '—', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' };
                      const progresso = l.status !== 'concluido' ? `${l.respondidas}/${l.total_perguntas} respostas` : '';
                      return (
                        <tr key={l.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                          <td style={{ ...sx.td, whiteSpace: 'nowrap' }}>
                            {dataBr(l.started_at)}
                            <div style={sx.sub}>{horaBr(l.started_at)}</div>
                          </td>
                          <td style={sx.td}>
                            {l.nome || <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                            {l.papel && <div style={sx.sub}>{l.papel}</div>}
                          </td>
                          <td style={sx.td}>
                            {l.empresa || <span style={{ color: 'var(--text-secondary)' }}>—</span>}
                            {l.porte && <div style={sx.sub}>{l.porte} pessoas</div>}
                          </td>
                          <td style={sx.td}><span style={sx.trunc} title={l.contato || ''}>{l.contato || <span style={{ color: 'var(--text-secondary)' }}>—</span>}</span></td>
                          <td style={sx.td}><span style={sx.trunc} title={l.segmento || ''}>{l.segmento || '—'}</span></td>
                          <td style={sx.td}><Utm valor={l.utm_source} /></td>
                          <td style={sx.td}><Utm valor={l.utm_medium} /></td>
                          <td style={sx.td}><Utm valor={l.utm_campaign} /></td>
                          <td style={sx.td}><Utm valor={l.utm_content} /></td>
                          <td style={sx.td}><Utm valor={l.utm_term} /></td>
                          <td style={sx.td}>
                            <span style={{ ...sx.pill, color: st.cor, background: st.bg }}>{st.txt}</span>
                            {progresso && <div style={sx.sub}>{progresso}</div>}
                          </td>
                          <td style={sx.td}>
                            {l.score != null ? (
                              <>
                                <b>{Math.round(l.score)}%</b>
                                {l.nivel && <div style={{ ...sx.sub, ...sx.trunc }} title={l.nivel}>{l.nivel}</div>}
                              </>
                            ) : '—'}
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
  th: { padding: '0.7rem 0.6rem', fontWeight: 500 },
  sortButton: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', width: '100%', padding: 0, border: 0, background: 'transparent', color: 'inherit', font: 'inherit', fontWeight: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' },
  sortIcon: { width: '1rem', color: '#fca5b0', fontSize: '0.85rem' },
  td: { padding: '0.7rem 0.6rem', verticalAlign: 'top' },
  trunc: { display: 'block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sub: { color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 },
  empty: { textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' },
  pill: { fontSize: '0.76rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 99, whiteSpace: 'nowrap' },
  link: { color: '#fca5b0', textDecoration: 'none' },
};
