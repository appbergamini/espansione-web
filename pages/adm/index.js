import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';
import { supabase } from '../../lib/supabaseClient';
export default function AdminPanel() {
  const router = useRouter();
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMaster, setIsMaster] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (!active) return;
      if (profile?.role !== 'master' && profile?.role !== 'admin') { router.replace('/dashboard'); return; }
    })();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/adm/projetos');
        const data = await res.json();
        if (data.success) {
          setProjetos(data.projetos || []);
          setIsMaster(data.isMaster || false);
          setUserRole(data.userRole || '');
        } else {
          setErrorMsg(data.error);
        }
      } catch (err) {
        setErrorMsg("Erro de conexão com a API.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STATUS_LABELS = {
    planejamento: 'Planejamento',
    em_andamento: 'Em Andamento',
    concluido: 'Concluido',
  };

  const STATUS_COLORS = {
    planejamento: { bg: 'rgba(96, 165, 250, 0.1)', color: 'var(--accent-blue)' },
    em_andamento: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' },
    concluido: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' },
  };

  return (
    <>
      <Head>
        <title>Espansione | {isMaster ? 'Master' : 'Administrador'}</title>
      </Head>
      <div className="page-container">
        <main className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <Logo size="lg" showTagline={false} />
              <div style={{ height: '64px', width: '1px', background: 'var(--glass-border)' }}></div>
              <h1 className="animate-fade-in" style={{ fontSize: '1.5rem' }}>Painel Gerencial</h1>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{
                padding: '0.35rem 0.85rem',
                background: isMaster ? 'rgba(167,139,250,0.1)' : 'var(--brand-red-glow)',
                color: isMaster ? 'var(--accent-purple, #a78bfa)' : 'var(--brand-red)',
                borderRadius: '16px', fontSize: '0.85rem', fontWeight: 600,
                border: isMaster ? '1px solid rgba(167,139,250,0.3)' : 'none',
              }}>
                {isMaster ? 'Visao Master' : 'Meus Projetos'}
              </span>
              {(isMaster || userRole === 'admin') && (
                <button className="btn-primary" onClick={() => router.push('/adm/novo')} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  + Novo Projeto
                </button>
              )}
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--brand-red)', cursor: 'pointer', fontWeight: 600 }}
              >
                Sair
              </button>
            </div>
          </div>

          <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>
              {isMaster ? 'Todos os Projetos' : 'Meus Projetos'}
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Carregando projetos do Supabase...
              </div>
            ) : errorMsg ? (
              <div style={{ background: 'var(--error)', padding: '1rem', borderRadius: '8px', color: '#fff' }}>
                {errorMsg}
              </div>
            ) : projetos.length === 0 ? (
              <div style={{ background: 'var(--bg-tertiary)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Nenhum projeto encontrado.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '1rem', fontWeight: 500 }}>Cliente</th>
                      {isMaster && <th style={{ padding: '1rem', fontWeight: 500 }}>Empresa</th>}
                      <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                      <th style={{ padding: '1rem', fontWeight: 500 }}>Progresso</th>
                      <th style={{ padding: '1rem', fontWeight: 500, textAlign: 'right' }}>Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projetos.map(proj => {
                      const sc = STATUS_COLORS[proj.status] || STATUS_COLORS.em_andamento;
                      return (
                        <tr key={proj.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {proj.cliente || proj.nome || '—'}
                          </td>
                          {isMaster && (
                            <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              {proj.empresas?.nome || '—'}
                            </td>
                          )}
                          <td style={{ padding: '1.25rem 1rem' }}>
                            <span style={{
                              padding: '0.3rem 0.8rem',
                              fontSize: '0.8rem',
                              borderRadius: '12px',
                              background: sc.bg,
                              color: sc.color,
                              whiteSpace: 'nowrap'
                            }}>
                              {STATUS_LABELS[proj.status] || proj.status}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1rem', minWidth: '150px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '100px', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, ((proj.etapa_atual || 0) / 10) * 100)}%`, background: 'var(--accent-blue)' }} />
                              </div>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Agent {proj.etapa_atual || 0}/10</span>
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                            <button className="btn-secondary" onClick={() => router.push(`/adm/${proj.id}`)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>Ver Detalhes</button>
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
