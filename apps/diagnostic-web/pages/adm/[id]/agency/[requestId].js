import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../../../components/Logo';
import { supabase } from '../../../../lib/supabaseClient';

export default function AgencyRequestDetailPage() {
  const router = useRouter();
  const { id, requestId } = router.query;
  const [request, setRequest] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [archiving, setArchiving] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [runningWorkflow, setRunningWorkflow] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) router.push('/login');
    })();
    return () => { active = false; };
  }, [router]);

  const loadRequest = async () => {
    if (!requestId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/requests/${requestId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao carregar pedido');
      setRequest(json.request);
      setRuns(json.runs || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const archiveRequest = async () => {
    if (!window.confirm('Arquivar este pedido?')) return;
    setArchiving(true);
    try {
      const res = await fetch(`/api/agency/requests/${requestId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao arquivar');
      router.push(`/adm/${id}/agency`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setArchiving(false);
    }
  };

  const prepareBriefing = async () => {
    setPreparing(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/requests/${requestId}/prepare-run`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao preparar briefing');
      await loadRequest();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setPreparing(false);
    }
  };

  const runWorkflow = async () => {
    setRunningWorkflow(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/requests/${requestId}/run-workflow`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao rodar Agência IA');
      await loadRequest();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setRunningWorkflow(false);
    }
  };

  const latestRun = runs[0] || null;
  const accountStep = latestRun?.agency_steps?.find?.((step) => step.agent_id === 'account_director') || null;

  return (
    <>
      <Head>
        <title>Espansione | Pedido Agência IA</title>
      </Head>
      <div className="page-container">
        <main className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link href={`/adm/${id}/agency`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.9rem' }}>
              &larr; Voltar aos pedidos
            </Link>
            <Logo size="sm" showTagline={false} />
          </div>

          {errorMsg && (
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.35)', color: 'var(--brand-red)' }}>
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="glass-card" style={{ padding: '1.5rem' }}>Carregando...</div>
          ) : request ? (
            <section className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Pedido de Agência IA</h1>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>{request.status}</p>
                </div>
                <button
                  onClick={archiveRequest}
                  disabled={archiving}
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--brand-red)', padding: '0.5rem 0.8rem', cursor: 'pointer' }}
                >
                  {archiving ? 'Arquivando...' : 'Arquivar'}
                </button>
              </div>

              <dl style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '0.75rem 1rem', marginTop: '1.5rem' }}>
                <Label title="Tipo" value={request.request_type} />
                <Label title="Canal" value={request.channel} />
                <Label title="Objetivo" value={request.objective} />
                <Label title="Público/cluster" value={request.audience_cluster || '-'} />
                <Label title="Oferta" value={request.offer || '-'} />
                <Label title="CTA" value={request.desired_cta || '-'} />
                <Label title="Contexto" value={request.context} />
                <Label title="Restrições" value={(request.restrictions || []).join('\n') || '-'} preserve />
                <Label title="Referências" value={(request.reference_material || []).join('\n') || '-'} preserve />
                <Label title="Warnings de prontidão" value={(request.readiness_warnings || []).join('\n') || '-'} preserve />
              </dl>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1rem' }}>Briefing Operacional</h2>
                    <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Primeira etapa da Agência: prepara o prompt pack do Atendimento Estratégico, sem chamar modelo.
                    </p>
                  </div>
                  <button
                    className="btn-primary"
                    onClick={prepareBriefing}
                    disabled={preparing}
                    style={{ padding: '0.65rem 0.9rem' }}
                  >
                    {preparing ? 'Preparando...' : 'Preparar briefing'}
                  </button>
                  <button
                    onClick={runWorkflow}
                    disabled={runningWorkflow}
                    style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', borderRadius: '8px', color: 'var(--accent-blue)', padding: '0.65rem 0.9rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    {runningWorkflow ? 'Rodando...' : 'Rodar Agência IA'}
                  </button>
                </div>

                {latestRun ? (
                  <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
                    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.85rem' }}>
                      <strong>Run:</strong> {latestRun.status}
                      <br />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ID: {latestRun.id}</span>
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {(latestRun.agency_steps || []).map((step) => (
                        <div key={step.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.65rem 0.75rem' }}>
                          <span>{labelAgent(step.agent_id)}</span>
                          <span style={{ color: step.status === 'completed' ? 'var(--success)' : 'var(--text-secondary)' }}>{step.status}</span>
                        </div>
                      ))}
                    </div>
                    {accountStep && (
                      <details style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.85rem' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Prompt pack técnico do account_director</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: 'var(--text-secondary)', overflowX: 'auto' }}>
                          {JSON.stringify(accountStep.input?.promptPack || accountStep.input || {}, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Nenhuma run preparada ainda.
                  </p>
                )}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </>
  );
}

function labelAgent(agentId) {
  const labels = {
    account_director: 'Atendimento Estratégico',
    copywriter: 'Copywriter',
    visual_director: 'Direção Visual',
    editor: 'Editor de Coerência',
    approver: 'Aprovador de Marca',
  };
  return labels[agentId] || agentId;
}

function Label({ title, value, preserve }) {
  return (
    <>
      <dt style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{title}</dt>
      <dd style={{ margin: 0, whiteSpace: preserve ? 'pre-wrap' : 'normal' }}>{value}</dd>
    </>
  );
}
