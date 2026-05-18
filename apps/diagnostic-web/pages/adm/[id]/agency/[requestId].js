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
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

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

  const generateApprovedImage = async () => {
    setGeneratingImage(true);
    setGeneratedImage(null);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/requests/${requestId}/generate-image`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao gerar imagem');
      setGeneratedImage({
        src: `data:${json.image.mimeType || 'image/png'};base64,${json.image.b64}`,
        model: json.image.model,
        overlayText: json.overlayText || {},
        prompt: json.prompt,
        revisedPrompt: json.image.revisedPrompt,
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setGeneratingImage(false);
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
  const approvalDecision = normalizeDecision(getStepPayload(approverStep)?.decisao || getStepPayload(approverStep)?.decision);
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
                      {formatValue(channelLabel)} · {formatValue(objectiveLabel)} · status {formatValue(request.status)}
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
                        {decisionLabel(approvalDecision)}
                      </span>
                    )}
                  </div>

                  <DeliveryPanel
                    latestRun={latestRun}
                    copyStep={stepByAgent.get('copywriter')}
                    visualStep={stepByAgent.get('visual_director')}
                    editorStep={stepByAgent.get('editor')}
                    approverStep={approverStep}
                    generatingImage={generatingImage}
                    generatedImage={generatedImage}
                    onGenerateImage={generateApprovedImage}
                  />

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
                              <AgentOutput agentId={agent.id} output={step.output} />
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

function getStepPayload(stepOrOutput) {
  const output = stepOrOutput?.output || stepOrOutput;
  return output?.data || output || {};
}

function AgentOutput({ agentId, output }) {
  const data = getStepPayload(output);
  const warnings = [...toArray(data.warnings), ...toArray(output?.warnings)].filter(Boolean);

  if (agentId === 'account_director') {
    const briefing = data.briefing_operacional || {};
    const creative = data.hipotese_criativa || {};
    return (
      <OutputCard>
        <OutputLine title="Objetivo" value={briefing.objetivo} />
        <OutputLine title="Público" value={briefing.publico} />
        <OutputLine title="Mensagem central" value={briefing.mensagem_central} />
        <OutputLine title="Promessa" value={briefing.promessa} />
        <OutputLine title="Tom recomendado" value={briefing.tom_recomendado} />
        <OutputLine title="Hipótese criativa" value={[creative.conceito, creative.angulo, creative.narrativa].filter(Boolean).join(' · ')} />
        <OutputList title="Critérios de sucesso" items={data.criterios_de_sucesso || briefing.criterio_de_sucesso} />
        <OutputList title="Avisos" items={warnings} muted />
      </OutputCard>
    );
  }

  if (agentId === 'copywriter') {
    return (
      <OutputCard>
        <OutputLine title="Headline" value={data.headline} />
        <OutputLine title="Copy principal" value={data.copy_principal || data.legenda} />
        <OutputList title="Variações" items={data.variacoes} />
        <OutputLine title="CTA" value={data.cta} />
        <OutputLine title="Racional de tom" value={data.racional_de_tom} />
        <OutputList title="Claims a evitar" items={data.claims_evitar} muted />
        <OutputList title="Avisos" items={warnings} muted />
      </OutputCard>
    );
  }

  if (agentId === 'visual_director') {
    return (
      <OutputCard>
        <OutputLine title="Direção de arte" value={data.direcao_de_arte} />
        <OutputLine title="Composição" value={data.composicao} />
        <OutputLine title="Estilo de imagem" value={data.estilo_imagem} />
        <OutputList title="Regras visuais" items={data.regras_visuais} />
        <OutputList title="Assets necessários" items={data.assets_necessarios} />
        <OutputList title="Restrições visuais" items={data.restricoes_visuais} muted />
        <OutputList title="Avisos" items={warnings} muted />
      </OutputCard>
    );
  }

  if (agentId === 'editor') {
    return (
      <OutputCard>
        <OutputLine title="Versão editada" value={data.versao_editada} />
        <OutputLine title="Score de aderência" value={typeof data.score_aderencia === 'number' ? `${data.score_aderencia}/100` : data.score_aderencia} />
        <OutputList title="Ajustes recomendados" items={data.ajustes_recomendados} />
        <OutputList title="Riscos de incoerência" items={data.riscos_de_incoerencia} muted />
        <OutputList title="Observações" items={data.observacoes} muted />
      </OutputCard>
    );
  }

  if (agentId === 'approver') {
    return (
      <OutputCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <strong>Decisão final</strong>
          <span style={{ color: decisionColor(data.decisao || data.decision), background: 'rgba(255,255,255,0.05)', border: `1px solid ${decisionBorder(data.decisao || data.decision)}`, borderRadius: 999, padding: '0.22rem 0.65rem', fontSize: '0.78rem', fontWeight: 800 }}>
            {decisionLabel(data.decisao || data.decision)}
          </span>
        </div>
        <OutputLine title="Justificativa" value={data.justificativa} />
        <OutputLine title="Risco principal" value={data.risco_principal} />
        <Checklist items={data.checklist} />
        <OutputList title="Ajustes obrigatórios" items={data.ajustes_obrigatorios} />
        <OutputList title="Avisos" items={warnings} muted />
      </OutputCard>
    );
  }

  return (
    <OutputCard>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', color: 'var(--text-secondary)', overflowX: 'auto', margin: 0 }}>
        {JSON.stringify(output, null, 2)}
      </pre>
    </OutputCard>
  );
}

function DeliveryPanel({ latestRun, copyStep, visualStep, editorStep, approverStep, generatingImage, generatedImage, onGenerateImage }) {
  const copy = getStepPayload(copyStep);
  const visual = getStepPayload(visualStep);
  const editor = getStepPayload(editorStep);
  const approver = getStepPayload(approverStep);
  const decision = normalizeDecision(approver.decisao || approver.decision);
  const editorText = extractEditedCopy(editor.versao_editada);
  const editorVisual = extractEditedVisual(editor.versao_editada);
  const hasGeneratedMaterial = !!(copy.copy_principal || editorText || visual.direcao_de_arte || editorVisual);

  if (!latestRun) {
    return (
      <section style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.9rem', marginBottom: '0.85rem', background: 'rgba(255,255,255,0.025)' }}>
        <strong>Entrega final</strong>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.3rem 0 0' }}>
          Ainda não existe material gerado. Prepare ou rode a Agência para criar a primeira entrega.
        </p>
      </section>
    );
  }

  if (!hasGeneratedMaterial) {
    return (
      <section style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.9rem', marginBottom: '0.85rem', background: 'rgba(255,255,255,0.025)' }}>
        <strong>Entrega final</strong>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.3rem 0 0' }}>
          A run foi preparada, mas os agentes ainda não geraram material.
        </p>
      </section>
    );
  }

  const approved = decision === 'approved';
  return (
    <section style={{ border: `1px solid ${approved ? 'rgba(16,185,129,0.32)' : 'rgba(245,158,11,0.28)'}`, borderRadius: 8, padding: '0.9rem', marginBottom: '0.85rem', background: approved ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.055)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.65rem' }}>
        <strong>{approved ? 'Material aprovado' : 'Prévia da entrega'}</strong>
        <span style={{ color: decisionColor(decision), background: 'rgba(255,255,255,0.05)', border: `1px solid ${decisionBorder(decision)}`, borderRadius: 999, padding: '0.22rem 0.65rem', fontSize: '0.78rem', fontWeight: 800 }}>
          {decisionLabel(decision)}
        </span>
      </div>

      {!approved && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0 0 0.75rem' }}>
          Este material ainda não está aprovado para uso. Veja os ajustes obrigatórios do aprovador antes de publicar.
        </p>
      )}

      <OutputLine title="Texto final/editado" value={editorText || copy.copy_principal || copy.legenda} />
      <OutputLine title="Headline" value={copy.headline} />
      <OutputLine title="CTA" value={copy.cta} />
      <OutputLine title="Direção visual" value={editorVisual || visual.direcao_de_arte} />
      <OutputList title="Ajustes obrigatórios" items={approver.ajustes_obrigatorios} muted={!approved} />

      {approved && (
        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.95rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={onGenerateImage}
            disabled={generatingImage}
            style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.38)', borderRadius: 8, color: 'var(--success)', padding: '0.72rem 0.85rem', cursor: generatingImage ? 'wait' : 'pointer', fontWeight: 800 }}
          >
            {generatingImage ? 'Criando imagem...' : 'Criar imagem da arte aprovada'}
          </button>

          {generatedImage?.src && (
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              <ComposedArtworkPreview image={generatedImage} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => downloadComposedArtwork(generatedImage)}
                  style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}
                >
                  Baixar PNG com texto correto
                </button>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  Modelo: {formatValue(generatedImage.model)}
                </span>
              </div>
              {generatedImage.revisedPrompt && (
                <details style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.65rem' }}>
                  <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontSize: '0.82rem', fontWeight: 800 }}>Prompt revisado</summary>
                  <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.78rem', marginTop: '0.5rem' }}>
                    {formatValue(generatedImage.revisedPrompt)}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function OutputCard({ children }) {
  return (
    <div style={{ display: 'grid', gap: '0.7rem', background: 'rgba(0,0,0,0.16)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.85rem' }}>
      {children}
    </div>
  );
}

function ComposedArtworkPreview({ image }) {
  const text = image.overlayText || {};
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 560, aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
      <img
        src={image.src}
        alt="Arte aprovada gerada por GPT Image"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 32%, rgba(0,0,0,0.72) 100%)' }} />
      <div style={{ position: 'absolute', left: '7%', right: '7%', bottom: '7%', color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
        {text.headline && (
          <div style={{ fontFamily: 'Georgia, Times New Roman, serif', fontSize: 'clamp(1.8rem, 6.2vw, 3.25rem)', lineHeight: 1.03, fontWeight: 700, marginBottom: '0.75rem', letterSpacing: 0 }}>
            {text.headline}
          </div>
        )}
        {text.body && (
          <div style={{ fontSize: 'clamp(0.88rem, 2.2vw, 1.16rem)', lineHeight: 1.22, maxWidth: '92%', marginBottom: text.cta ? '0.7rem' : 0 }}>
            {text.body}
          </div>
        )}
        {text.cta && (
          <div style={{ fontSize: 'clamp(0.86rem, 2vw, 1.06rem)', lineHeight: 1.2, fontWeight: 800 }}>
            {text.cta}
          </div>
        )}
      </div>
    </div>
  );
}

function OutputLine({ title, value }) {
  if (!hasRenderableValue(value)) return null;
  return (
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginBottom: '0.2rem' }}>{title}</div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{formatValue(value)}</div>
    </div>
  );
}

function OutputList({ title, items, muted }) {
  const list = toArray(items).filter(Boolean);
  if (!list.length) return null;
  return (
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginBottom: '0.3rem' }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: '1.1rem', color: muted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
        {list.map((item, index) => <li key={`${title}-${index}`} style={{ marginBottom: '0.18rem' }}>{formatValue(item)}</li>)}
      </ul>
    </div>
  );
}

function Checklist({ items }) {
  const list = normalizeChecklist(items);
  if (!list.length) return null;
  return (
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginBottom: '0.35rem' }}>Checklist</div>
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        {list.map((item, index) => (
          <div key={`${item.criterio}-${index}`} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.55rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <strong>{formatValue(item.criterio)}</strong>
              <span style={{ color: checklistColor(item.status), fontSize: '0.78rem', fontWeight: 800 }}>{formatValue(normalizeChecklistStatus(item.status))}</span>
            </div>
            {item.observacao && <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>{formatValue(item.observacao)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function decisionLabel(decision) {
  const normalized = normalizeDecision(decision);
  const labels = {
    approved: 'Aprovado',
    revision_requested: 'Revisão solicitada',
    rejected: 'Rejeitado',
  };
  return labels[normalized] || formatValue(normalized) || 'Sem decisão';
}

function decisionColor(decision) {
  const normalized = normalizeDecision(decision);
  if (normalized === 'approved') return 'var(--success)';
  if (normalized === 'rejected') return 'var(--brand-red)';
  return 'var(--warning)';
}

function decisionBorder(decision) {
  const normalized = normalizeDecision(decision);
  if (normalized === 'approved') return 'rgba(16,185,129,0.35)';
  if (normalized === 'rejected') return 'rgba(239,68,68,0.35)';
  return 'rgba(245,158,11,0.35)';
}

function checklistColor(status) {
  const normalized = normalizeChecklistStatus(status);
  if (normalized === 'pass') return 'var(--success)';
  if (normalized === 'fail') return 'var(--brand-red)';
  return 'var(--warning)';
}

function hasRenderableValue(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return String(value).length > 0;
}

function normalizeDecision(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return formatValue(value.decisao || value.decision || value.status || value.resultado || value.result || value);
  }
  return String(value);
}

function normalizeChecklistStatus(value) {
  if (!value) return 'warning';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return formatValue(value.status || value.resultado || value.result || inferChecklistStatus(value));
  }
  return String(value);
}

function extractEditedCopy(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.copy_final || value.copy || value.texto || value.legenda || value.versao_final || '';
  }
  return String(value);
}

function extractEditedVisual(value) {
  if (!value || typeof value !== 'object') return '';
  return value.direcao_visual_final || value.direcao_visual || value.visual || '';
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') {
    return Object.entries(value).map(([key, item]) => {
      if (item && typeof item === 'object') return { titulo: humanizeKey(key), ...item };
      return `${humanizeKey(key)}: ${item}`;
    });
  }
  return [value];
}

function normalizeChecklist(items) {
  if (!items) return [];
  if (Array.isArray(items)) {
    return items.map((item) => normalizeChecklistItem(item)).filter(Boolean);
  }
  if (typeof items === 'object') {
    return Object.entries(items)
      .map(([key, value]) => normalizeChecklistItem({ criterio: humanizeKey(key), observacao: value, status: inferChecklistStatus(value) }))
      .filter(Boolean);
  }
  return [];
}

function normalizeChecklistItem(item) {
  if (!item) return null;
  if (typeof item === 'string') {
    return { criterio: item, status: 'pass', observacao: '' };
  }
  return {
    criterio: item.criterio || item.criterion || item.titulo || item.title || 'Critério',
    status: normalizeChecklistStatus(item.status || inferChecklistStatus(item.observacao || item.note || item)),
    observacao: item.observacao || item.note || item.descricao || item.description || '',
  };
}

function inferChecklistStatus(value) {
  const text = String(formatValue(value)).toLowerCase();
  if (text.includes('violação') || text.includes('falha') || text.includes('não ')) return 'warning';
  return 'pass';
}

function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join('\n');
  if (typeof value === 'object') {
    if (value.texto && value.titulo) return `${value.titulo}: ${value.texto}`;
    if (value.titulo && value.descricao) return `${value.titulo}: ${value.descricao}`;
    if (value.name && value.description) return `${value.name}: ${value.description}`;
    return Object.entries(value)
      .map(([key, item]) => `${humanizeKey(key)}: ${formatValue(item)}`)
      .join('\n');
  }
  return String(value);
}

function humanizeKey(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function downloadComposedArtwork(image) {
  if (!image?.src || typeof window === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const img = new window.Image();

  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0,0,0,0.04)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const text = image.overlayText || {};
    const left = 72;
    const maxWidth = canvas.width - 144;
    let y = canvas.height - 84;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;

    if (text.cta) {
      ctx.font = '800 34px Arial, sans-serif';
      const ctaLines = wrapCanvasText(ctx, text.cta, maxWidth);
      y = drawCanvasLines(ctx, ctaLines, left, y, 40);
      y -= 28;
    }

    if (text.body) {
      ctx.font = '400 34px Arial, sans-serif';
      const bodyLines = wrapCanvasText(ctx, text.body, maxWidth).slice(0, 5);
      y = drawCanvasLines(ctx, bodyLines, left, y, 42);
      y -= 34;
    }

    if (text.headline) {
      ctx.font = '700 64px Georgia, serif';
      const headlineLines = wrapCanvasText(ctx, text.headline, maxWidth).slice(0, 4);
      drawCanvasLines(ctx, headlineLines, left, y, 70);
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'arte-aprovada-espansione.png';
    link.click();
  };

  img.src = image.src;
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCanvasLines(ctx, lines, x, bottomY, lineHeight) {
  let y = bottomY - (lines.length - 1) * lineHeight;
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return bottomY - lines.length * lineHeight;
}

function Label({ title, value, preserve }) {
  return (
    <>
      <dt style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{title}</dt>
      <dd style={{ margin: 0, whiteSpace: preserve ? 'pre-wrap' : 'normal' }}>{formatValue(value)}</dd>
    </>
  );
}
