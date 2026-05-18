import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../../../components/Logo';
import { supabase } from '../../../../lib/supabaseClient';

const REQUEST_TYPE_LABELS = {
  social_post: 'Post social',
  carousel: 'Carrossel',
  short_video_script: 'Roteiro vídeo curto',
  email: 'E-mail',
  landing_page_copy: 'Copy de landing page',
};

const CHANNEL_LABELS = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  website: 'Website',
  paid_media: 'Mídia paga',
  other: 'Outro',
};

const OBJECTIVE_LABELS = {
  awareness: 'Awareness',
  authority: 'Autoridade',
  lead_generation: 'Geração de leads',
  conversion: 'Conversão',
  launch: 'Lançamento',
  relationship: 'Relacionamento',
  retention: 'Retenção',
};

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
  const stepByAgent = new Map((latestRun?.agency_steps || []).map((step) => [step.agent_id, step]));
  const agentFlow = [
    { id: 'account_director', label: 'Atendimento', description: 'Briefing operacional' },
    { id: 'copywriter', label: 'Copywriter', description: 'Texto e tom' },
    { id: 'visual_director', label: 'Visual', description: 'Direção de arte' },
    { id: 'editor', label: 'Editor', description: 'Coerência' },
    { id: 'approver', label: 'Aprovador', description: 'Gate final' },
  ];
  const completedSteps = agentFlow.filter((agent) => stepByAgent.get(agent.id)?.status === 'completed').length;
  const approverStep = stepByAgent.get('approver');
  const approvalDecision = approverStep?.output?.decisao || approverStep?.output?.decision || null;
  const requestTypeLabel = REQUEST_TYPE_LABELS[request?.request_type] || request?.request_type;
  const channelLabel = CHANNEL_LABELS[request?.channel] || request?.channel;
  const objectiveLabel = OBJECTIVE_LABELS[request?.objective] || request?.objective;

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
            <>
              <section className="glass-card outline-glow" style={{ position: 'sticky', top: '0.75rem', zIndex: 20, padding: '1rem', marginBottom: '1.25rem', borderColor: 'rgba(56,189,248,0.35)', background: 'rgba(6,12,25,0.94)', backdropFilter: 'blur(18px)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                      Pedido de Agência IA
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.35rem' }}>{requestTypeLabel}</h1>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.35rem' }}>
                      {channelLabel} · {objectiveLabel} · status {request.status}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(76px, 1fr))', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                    {agentFlow.map((agent, index) => {
                      const step = stepByAgent.get(agent.id);
                      const done = step?.status === 'completed';
                      const active = step && !done;
                      return (
                        <div key={agent.id} title={labelAgent(agent.id)} style={{ minWidth: '76px', border: `1px solid ${done ? 'rgba(16,185,129,0.5)' : active ? 'rgba(56,189,248,0.55)' : 'rgba(255,255,255,0.09)'}`, background: done ? 'rgba(16,185,129,0.14)' : active ? 'rgba(56,189,248,0.14)' : 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.55rem 0.45rem' }}>
                          <div style={{ color: done ? 'var(--success)' : active ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 800 }}>0{index + 1}</div>
                          <div style={{ color: 'var(--text-primary)', fontSize: '0.76rem', fontWeight: 700, marginTop: '0.15rem', whiteSpace: 'nowrap' }}>{agent.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                    <button
                      className="btn-primary"
                      onClick={prepareBriefing}
                      disabled={preparing || runningWorkflow}
                      style={{ padding: '0.72rem 0.8rem' }}
                    >
                      {preparing ? 'Preparando...' : latestRun ? 'Preparar nova run' : 'Preparar briefing'}
                    </button>
                    <button
                      onClick={runWorkflow}
                      disabled={runningWorkflow || preparing}
                      style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', borderRadius: '8px', color: 'var(--accent-blue)', padding: '0.72rem 0.8rem', cursor: runningWorkflow || preparing ? 'wait' : 'pointer', fontWeight: 800 }}
                    >
                      {runningWorkflow ? 'Rodando...' : latestRun ? 'Rodar Agência' : 'Preparar e rodar'}
                    </button>
                  </div>
                </div>
                {errorMsg && (
                  <div style={{ marginTop: '0.85rem', color: 'var(--brand-red)', fontSize: '0.84rem' }}>{errorMsg}</div>
                )}
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '1.25rem', alignItems: 'start' }}>
                <section className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Brief do pedido</h2>
                      <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.84rem' }}>
                        O essencial para orientar a esteira, sem misturar com execução.
                      </p>
                    </div>
                    <button
                      onClick={archiveRequest}
                      disabled={archiving}
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.24)', borderRadius: '8px', color: 'var(--brand-red)', padding: '0.42rem 0.7rem', cursor: archiving ? 'wait' : 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      {archiving ? 'Arquivando...' : 'Arquivar'}
                    </button>
                  </div>

                  <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 0.34fr) 1fr', gap: '0.65rem 0.9rem', margin: 0 }}>
                    <Label title="Tipo" value={requestTypeLabel} />
                    <Label title="Canal" value={channelLabel} />
                    <Label title="Objetivo" value={objectiveLabel} />
                    <Label title="Público/cluster" value={request.audience_cluster || '-'} />
                    <Label title="Oferta" value={request.offer || '-'} />
                    <Label title="CTA" value={request.desired_cta || '-'} />
                    <Label title="Contexto" value={request.context} />
                  </dl>

                  <details style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.85rem' }}>Restrições, referências e warnings</summary>
                    <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 0.34fr) 1fr', gap: '0.65rem 0.9rem', margin: '0.85rem 0 0' }}>
                      <Label title="Restrições" value={(request.restrictions || []).join('\n') || '-'} preserve />
                      <Label title="Referências" value={(request.reference_material || []).join('\n') || '-'} preserve />
                      <Label title="Warnings" value={(request.readiness_warnings || []).join('\n') || '-'} preserve />
                    </dl>
                  </details>
                </section>

                <section className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Timeline dos agentes</h2>
                      <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                        {latestRun ? `${completedSteps}/${agentFlow.length} etapas concluídas · run ${latestRun.status}` : 'Nenhuma run preparada ainda.'}
                      </p>
                    </div>
                    {approvalDecision && (
                      <span style={{ color: approvalDecision === 'approved' ? 'var(--success)' : 'var(--warning)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 800 }}>
                        {approvalDecision}
                      </span>
                    )}
                  </div>

                  {!latestRun && (
                    <div style={{ border: '1px solid rgba(56,189,248,0.24)', borderRadius: 8, padding: '0.9rem', marginBottom: '0.85rem', background: 'rgba(56,189,248,0.06)' }}>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>A run ainda não foi preparada</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0 0 0.75rem' }}>
                        Prepare o briefing para criar a primeira etapa do Atendimento Estratégico, ou rode a Agência para preparar e executar a esteira mockada.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                        <button
                          className="btn-primary"
                          type="button"
                          onClick={prepareBriefing}
                          disabled={preparing || runningWorkflow}
                          style={{ padding: '0.62rem 0.8rem' }}
                        >
                          {preparing ? 'Preparando...' : 'Preparar briefing'}
                        </button>
                        <button
                          type="button"
                          onClick={runWorkflow}
                          disabled={preparing || runningWorkflow}
                          style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.35)', borderRadius: '8px', color: 'var(--accent-blue)', padding: '0.62rem 0.8rem', cursor: preparing || runningWorkflow ? 'wait' : 'pointer', fontWeight: 800 }}
                        >
                          {runningWorkflow ? 'Rodando...' : 'Preparar e rodar Agência'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: '0.65rem' }}>
                    {agentFlow.map((agent, index) => {
                      const step = stepByAgent.get(agent.id);
                      const done = step?.status === 'completed';
                      return (
                        <details key={agent.id} open={!!step?.output && agent.id === 'approver'} style={{ border: `1px solid ${done ? 'rgba(16,185,129,0.28)' : step ? 'rgba(56,189,248,0.24)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, background: done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.025)' }}>
                          <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 0.85rem' }}>
                            <span>
                              <strong style={{ color: done ? 'var(--success)' : 'var(--text-primary)', marginRight: '0.45rem' }}>0{index + 1}</strong>
                              {labelAgent(agent.id)}
                              <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.77rem', marginTop: '0.12rem' }}>{agent.description}</span>
                            </span>
                            <span style={{ color: done ? 'var(--success)' : step ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800 }}>
                              {step?.status || 'aguardando'}
                            </span>
                          </summary>
                          <div style={{ padding: '0 0.85rem 0.85rem' }}>
                            {step?.error && <p style={{ color: 'var(--brand-red)', margin: 0 }}>{step.error}</p>}
                            {step?.output ? (
                              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: 'var(--text-secondary)', overflowX: 'auto', background: 'rgba(0,0,0,0.18)', borderRadius: 8, padding: '0.75rem', margin: 0 }}>
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            ) : (
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>Sem output salvo ainda.</p>
                            )}
                          </div>
                        </details>
                      );
                    })}
                  </div>

                  {accountStep && process.env.NODE_ENV !== 'production' && (
                    <details style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.85rem', marginTop: '0.85rem' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--accent-blue)' }}>Prompt pack técnico do account_director</summary>
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: 'var(--text-secondary)', overflowX: 'auto' }}>
                        {JSON.stringify(accountStep.input?.promptPack || accountStep.input || {}, null, 2)}
                      </pre>
                    </details>
                  )}
                </section>
              </div>
            </>
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
