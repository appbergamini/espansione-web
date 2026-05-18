import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../../../components/Logo';
import OutputQualityPanel from '../../../../components/output/OutputQualityPanel';
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

const AGENCY_AGENT_ORDER = ['account_director', 'copywriter', 'visual_director', 'editor', 'approver'];

const CREATIVE_ASSET_TYPE_LABELS = {
  conceptual_image: 'Imagem conceitual',
  moodboard_reference: 'Referência de moodboard',
  background_image: 'Imagem de fundo',
  visual_prompt: 'Prompt visual',
  editable_art_reference: 'Referência para arte editável',
  final_art: 'Arte final',
};

const CREATIVE_ASSET_STATUS_LABELS = {
  draft: 'Rascunho',
  generated: 'Gerado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  archived: 'Arquivado',
};

const EMBEDDED_TEXT_REVIEW_WARNING = 'Imagens com texto embutido exigem revisão humana de ortografia, legibilidade, marca e claims.';

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
  const [approvingBriefing, setApprovingBriefing] = useState(false);
  const [requestingBriefingRevision, setRequestingBriefingRevision] = useState(false);
  const [briefingEditorValue, setBriefingEditorValue] = useState('');
  const [briefingRevisionReason, setBriefingRevisionReason] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [reprocessingAction, setReprocessingAction] = useState('');
  const [savingLibraryAction, setSavingLibraryAction] = useState('');
  const [savingLearningAction, setSavingLearningAction] = useState('');
  const [creativeAssets, setCreativeAssets] = useState([]);
  const [savingAssetAction, setSavingAssetAction] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) router.push('/login');
    })();
    return () => { active = false; };
  }, [router]);

  const loadCreativeAssets = async (nextRequest) => {
    if (!nextRequest?.brand_id) {
      setCreativeAssets([]);
      return;
    }
    const query = new URLSearchParams({
      brand_id: nextRequest.brand_id,
      request_id: nextRequest.id,
    });
    const res = await fetch(`/api/agency/assets?${query}`);
    const json = await readJsonOrThrow(res, 'Erro ao carregar ativos visuais');
    if (!json.success) throw new Error(json.error || 'Erro ao carregar ativos visuais');
    setCreativeAssets(json.assets || []);
  };

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
      await loadCreativeAssets(json.request);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  useEffect(() => {
    const briefing = request?.approved_briefing_json || request?.briefing_original_json;
    setBriefingEditorValue(briefing ? JSON.stringify(briefing, null, 2) : '');
    setBriefingRevisionReason(request?.briefing_revision_reason || '');
  }, [request?.id, request?.briefing_original_json, request?.approved_briefing_json, request?.briefing_revision_reason]);

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

  const approveBriefing = async () => {
    setApprovingBriefing(true);
    setErrorMsg('');
    try {
      const originalText = request?.briefing_original_json ? JSON.stringify(request.briefing_original_json, null, 2) : '';
      const editedText = String(briefingEditorValue || '').trim();
      let editedBriefing = null;
      if (editedText && editedText !== originalText) {
        editedBriefing = JSON.parse(editedText);
      }

      const res = await fetch(`/api/agency/requests/${requestId}/briefing/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedBriefing }),
      });
      const json = await readJsonOrThrow(res, 'Erro ao aprovar briefing');
      if (!json.success) throw new Error(json.error || 'Erro ao aprovar briefing');
      await loadRequest();
    } catch (err) {
      setErrorMsg(err.message.includes('JSON') ? 'O briefing editado precisa ser um JSON válido.' : err.message);
    } finally {
      setApprovingBriefing(false);
    }
  };

  const requestBriefingRevision = async () => {
    setRequestingBriefingRevision(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/requests/${requestId}/briefing/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: briefingRevisionReason }),
      });
      const json = await readJsonOrThrow(res, 'Erro ao solicitar revisão do briefing');
      if (!json.success) throw new Error(json.error || 'Erro ao solicitar revisão do briefing');
      await loadRequest();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setRequestingBriefingRevision(false);
    }
  };

  const generateApprovedImage = async () => {
    setGeneratingImage(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/requests/${requestId}/generate-image`, { method: 'POST' });
      const json = await readJsonOrThrow(res, 'Erro ao gerar imagem');
      if (!json.success) throw new Error(json.error || 'Erro ao gerar imagem');
      const nextImage = {
        id: json.asset?.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        src: json.asset?.file_url || `data:${json.image.mimeType || 'image/png'};base64,${json.image.b64}`,
        model: json.image.model,
        compositionMode: json.compositionMode,
        overlayText: json.overlayText || {},
        prompt: json.prompt,
        revisedPrompt: json.image.revisedPrompt,
        asset: json.asset,
      };
      setGeneratedImages((current) => [nextImage, ...current]);
      setGeneratedImage(nextImage);
      if (json.asset) setCreativeAssets((current) => [json.asset, ...current.filter((asset) => asset.id !== json.asset.id)]);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setGeneratingImage(false);
    }
  };

  const runStepAction = async (action, agentId) => {
    if (!latestRun?.id) return;
    const approvedRequest = request?.status === 'approved';
    let confirmApproved = false;
    if (approvedRequest) {
      confirmApproved = window.confirm('Este pedido já está aprovado. Criar uma nova versão vai manter o histórico, mas mudar o status do pedido. Continuar?');
      if (!confirmApproved) return;
    }

    setReprocessingAction(`${action}:${agentId}`);
    setErrorMsg('');
    try {
      const endpoint = action === 'from'
        ? 'regenerate-from-step'
        : 'regenerate-step';
      const res = await fetch(`/api/agency/runs/${latestRun.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, confirmApproved }),
      });
      const json = await readJsonOrThrow(res, 'Erro ao reprocessar agente');
      if (!json.success) throw new Error(json.error || 'Erro ao reprocessar agente');
      await loadRequest();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setReprocessingAction('');
    }
  };

  const createVariation = async () => {
    if (!latestRun?.id) return;
    const label = window.prompt('Nome da variação', `Variação ${runs.length + 1}`);
    if (label === null) return;

    setReprocessingAction('variation');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/runs/${latestRun.id}/variation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label || undefined }),
      });
      const json = await readJsonOrThrow(res, 'Erro ao criar variação');
      if (!json.success) throw new Error(json.error || 'Erro ao criar variação');
      await loadRequest();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setReprocessingAction('');
    }
  };

  const saveStepToLibrary = async (agentId, step, polarity) => {
    if (!latestRun?.id || !step?.id) return;
    const itemType = libraryItemTypeForAgent(agentId, polarity);
    const notes = window.prompt(
      polarity === 'positive'
        ? 'Notas para salvar como exemplo positivo'
        : 'Notas para salvar como exemplo negativo',
      ''
    );
    if (notes === null) return;

    setSavingLibraryAction(`${step.id}:${polarity}`);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/runs/${latestRun.id}/library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType,
          sourceStepId: step.id,
          notes,
          tags: [polarity, agentId],
        }),
      });
      const json = await readJsonOrThrow(res, 'Erro ao salvar na Biblioteca');
      if (!json.success) throw new Error(json.error || 'Erro ao salvar na Biblioteca');
      await loadRequest();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingLibraryAction('');
    }
  };

  const createLearningFromStep = async (agentId, step) => {
    if (!latestRun?.id || !step?.id) return;
    const learningType = window.prompt('Tipo de aprendizado', defaultLearningTypeForAgent(agentId, step));
    if (!learningType) return;
    const content = window.prompt('Conteúdo do aprendizado', defaultLearningContent(agentId, step));
    if (!content) return;
    const rationale = window.prompt('Justificativa', `Sugerido a partir do step ${labelAgent(agentId)}.`) || '';

    setSavingLearningAction(step.id);
    setErrorMsg('');
    try {
      const res = await fetch('/api/agency/learnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceAgencyRunId: latestRun.id,
          sourceAgencyRequestId: request.id,
          learningType,
          content,
          rationale,
          confidenceScore: 70,
        }),
      });
      const json = await readJsonOrThrow(res, 'Erro ao criar aprendizado');
      if (!json.success) throw new Error(json.error || 'Erro ao criar aprendizado');
      await loadRequest();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingLearningAction('');
    }
  };

  const saveVisualPromptAsset = async (step) => {
    if (!latestRun?.id || !step?.id) return;
    setSavingAssetAction(`visual_prompt:${step.id}`);
    setErrorMsg('');
    try {
      const res = await fetch('/api/agency/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_visual_prompt',
          runId: latestRun.id,
          sourceStepId: step.id,
        }),
      });
      const json = await readJsonOrThrow(res, 'Erro ao salvar prompt visual');
      if (!json.success) throw new Error(json.error || 'Erro ao salvar prompt visual');
      setCreativeAssets((current) => [json.asset, ...current.filter((asset) => asset.id !== json.asset.id)]);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingAssetAction('');
    }
  };

  const addManualCreativeAsset = async () => {
    if (!request?.brand_id) return;
    const assetType = window.prompt('Tipo de ativo visual', 'moodboard_reference');
    if (!assetType) return;
    const title = window.prompt('Título do ativo', CREATIVE_ASSET_TYPE_LABELS[assetType] || 'Ativo visual');
    if (!title) return;
    const prompt = window.prompt('Prompt, descrição ou referência visual', '');
    if (prompt === null) return;
    const fileUrl = window.prompt('URL da imagem/referência, se houver', '') || '';
    const hasEmbeddedText = window.confirm('Este ativo tem texto embutido na imagem?');

    setSavingAssetAction('manual');
    setErrorMsg('');
    try {
      const res = await fetch('/api/agency/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: request.brand_id,
          agencyRequestId: request.id,
          agencyRunId: latestRun?.id,
          assetType,
          title,
          prompt,
          fileUrl,
          hasEmbeddedText,
          textReviewRequired: hasEmbeddedText,
        }),
      });
      const json = await readJsonOrThrow(res, 'Erro ao adicionar ativo visual');
      if (!json.success) throw new Error(json.error || 'Erro ao adicionar ativo visual');
      setCreativeAssets((current) => [json.asset, ...current.filter((asset) => asset.id !== json.asset.id)]);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingAssetAction('');
    }
  };

  const reviewCreativeAsset = async (asset, action) => {
    if (!asset?.id) return;
    const body = { action };
    if (action === 'approve') {
      body.notes = window.prompt('Notas da aprovação/revisão', asset.text_review_required ? 'Texto embutido revisado manualmente.' : '') || '';
    }
    if (action === 'reject') {
      const reason = window.prompt('Motivo da rejeição', asset.review_notes || '');
      if (!reason) return;
      body.reason = reason;
    }
    if (action === 'archive' && !window.confirm('Arquivar este ativo visual?')) return;

    setSavingAssetAction(`${action}:${asset.id}`);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/assets/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await readJsonOrThrow(res, 'Erro ao revisar ativo visual');
      if (!json.success) throw new Error(json.error || 'Erro ao revisar ativo visual');
      setCreativeAssets((current) => current.map((item) => item.id === json.asset.id ? json.asset : item));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingAssetAction('');
    }
  };


  const latestRun = runs[0] || null;
  const allRunSteps = sortAgencySteps(latestRun?.agency_steps || []);
  const currentRunSteps = allRunSteps.filter((step) => step.is_current !== false);
  const accountStep = currentRunSteps.find((step) => step.agent_id === 'account_director') || null;
  const stepByAgent = new Map(currentRunSteps.map((step) => [step.agent_id, step]));
  const stepsByAgent = groupStepsByAgent(allRunSteps);
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
  const briefingApproved = isBriefingApprovedRequest(request);

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
                      {preparing ? 'Gerando...' : request?.briefing_original_json ? 'Gerar novo briefing' : 'Gerar briefing'}
                    </button>
                    <button
                      onClick={runWorkflow}
                      disabled={runningWorkflow || preparing || !briefingApproved}
                      style={{ background: briefingApproved ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${briefingApproved ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', color: briefingApproved ? 'var(--accent-blue)' : 'var(--text-secondary)', padding: '0.72rem 0.8rem', cursor: runningWorkflow || preparing || !briefingApproved ? 'not-allowed' : 'pointer', fontWeight: 800 }}
                    >
                      {runningWorkflow ? 'Rodando...' : briefingApproved ? 'Rodar criação' : 'Aprovar briefing'}
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

                <BriefingPanel
                  request={request}
                  accountStep={accountStep}
                  editorValue={briefingEditorValue}
                  revisionReason={briefingRevisionReason}
                  preparing={preparing}
                  approving={approvingBriefing}
                  requestingRevision={requestingBriefingRevision}
                  runningWorkflow={runningWorkflow}
                  onEditorChange={setBriefingEditorValue}
                  onRevisionReasonChange={setBriefingRevisionReason}
                  onGenerate={prepareBriefing}
                  onApprove={approveBriefing}
                  onRequestRevision={requestBriefingRevision}
                  onRunWorkflow={runWorkflow}
                />

                <section className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Timeline dos agentes</h2>
                      <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                        {latestRun
                          ? `${completedSteps}/${agentFlow.length} etapas concluídas · ${latestRun.branch_label || 'Original'} · run ${latestRun.status}`
                          : 'Nenhuma run preparada ainda.'}
                      </p>
                      {latestRun?.parent_run_id && (
                        <p style={{ margin: '0.25rem 0 0', color: 'var(--accent-blue)', fontSize: '0.78rem', fontWeight: 700 }}>
                          Variação vinculada à run original.
                        </p>
                      )}
                      <RunExecutionSummary run={latestRun} steps={currentRunSteps} />
                    </div>
                    {approvalDecision && (
                      <span style={{ color: approvalDecision === 'approved' ? 'var(--success)' : 'var(--warning)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 800 }}>
                        {decisionLabel(approvalDecision)}
                      </span>
                    )}
                    {latestRun && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', justifyContent: 'flex-end' }}>
                        <Link href={`/adm/${id}/agency/library?brand_id=${request.brand_id}`} style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.28)', borderRadius: 8, color: 'var(--success)', padding: '0.42rem 0.7rem', textDecoration: 'none', fontWeight: 800, fontSize: '0.78rem' }}>
                          Biblioteca da Marca
                        </Link>
                        <Link href={`/adm/${id}/agency/learnings?brand_id=${request.brand_id}`} style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.28)', borderRadius: 8, color: 'var(--accent-blue)', padding: '0.42rem 0.7rem', textDecoration: 'none', fontWeight: 800, fontSize: '0.78rem' }}>
                          Aprendizados
                        </Link>
                        <button
                          type="button"
                          onClick={createVariation}
                          disabled={!!reprocessingAction}
                          style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 8, color: 'var(--accent-blue)', padding: '0.42rem 0.7rem', cursor: reprocessingAction ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.78rem' }}
                        >
                          {reprocessingAction === 'variation' ? 'Criando...' : 'Criar variação'}
                        </button>
                      </div>
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
                    generatedImages={generatedImages}
                    onSelectImage={setGeneratedImage}
                    onGenerateImage={generateApprovedImage}
                  />

                  <CreativeAssetsPanel
                    assets={creativeAssets}
                    latestRun={latestRun}
                    visualStep={stepByAgent.get('visual_director')}
                    savingAction={savingAssetAction}
                    onAddAsset={addManualCreativeAsset}
                    onSaveVisualPrompt={saveVisualPromptAsset}
                    onReviewAsset={reviewCreativeAsset}
                  />

                  {!latestRun && (
                    <div style={{ border: '1px solid rgba(56,189,248,0.24)', borderRadius: 8, padding: '0.9rem', marginBottom: '0.85rem', background: 'rgba(56,189,248,0.06)' }}>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>A run ainda não foi preparada</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0 0 0.75rem' }}>
                        Gere o briefing do Atendimento Estratégico. A criação só fica disponível depois da aprovação humana.
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                        <button
                          className="btn-primary"
                          type="button"
                          onClick={prepareBriefing}
                          disabled={preparing || runningWorkflow}
                          style={{ padding: '0.62rem 0.8rem' }}
                        >
                          {preparing ? 'Gerando...' : 'Gerar briefing'}
                        </button>
                        <button
                          type="button"
                          onClick={runWorkflow}
                          disabled={preparing || runningWorkflow || !briefingApproved}
                          style={{ background: briefingApproved ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${briefingApproved ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', color: briefingApproved ? 'var(--accent-blue)' : 'var(--text-secondary)', padding: '0.62rem 0.8rem', cursor: preparing || runningWorkflow || !briefingApproved ? 'not-allowed' : 'pointer', fontWeight: 800 }}
                        >
                          {runningWorkflow ? 'Rodando...' : 'Aprovar briefing para rodar'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: '0.65rem' }}>
                    {agentFlow.map((agent, index) => {
                      const step = stepByAgent.get(agent.id);
                      const history = stepsByAgent.get(agent.id) || [];
                      const done = step?.status === 'completed';
                      const downstreamObsolete = hasObsoleteDownstream(allRunSteps, agent.id);
                      return (
                        <details key={agent.id} open={!!step?.output && agent.id === 'approver'} style={{ border: `1px solid ${done ? 'rgba(16,185,129,0.28)' : step ? 'rgba(56,189,248,0.24)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, background: done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.025)' }}>
                          <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 0.85rem' }}>
                            <span>
                              <strong style={{ color: done ? 'var(--success)' : 'var(--text-primary)', marginRight: '0.45rem' }}>0{index + 1}</strong>
                              {labelAgent(agent.id)}
                              <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.77rem', marginTop: '0.12rem' }}>{agent.description}</span>
                            </span>
                            <span style={{ color: done ? 'var(--success)' : step ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800 }}>
                              {step ? `v${step.version_number || 1} · ${step.status}` : 'aguardando'}
                            </span>
                          </summary>
                          <div style={{ padding: '0 0.85rem 0.85rem' }}>
                            {step && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
                                <button
                                  type="button"
                                  onClick={() => runStepAction('one', agent.id)}
                                  disabled={!!reprocessingAction || !latestRun}
                                  style={miniActionStyle(reprocessingAction === `one:${agent.id}`)}
                                >
                                  {reprocessingAction === `one:${agent.id}` ? 'Regenerando...' : 'Regenerar este agente'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => runStepAction('from', agent.id)}
                                  disabled={!!reprocessingAction || !latestRun}
                                  style={miniActionStyle(reprocessingAction === `from:${agent.id}`)}
                                >
                                  {reprocessingAction === `from:${agent.id}` ? 'Rodando...' : 'Regenerar a partir daqui'}
                                </button>
                                {history.length > 1 && (
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', alignSelf: 'center' }}>
                                    {history.length} versões no histórico
                                  </span>
                                )}
                                {downstreamObsolete && (
                                  <span style={{ color: 'var(--warning)', fontSize: '0.76rem', alignSelf: 'center', fontWeight: 800 }}>
                                    há outputs posteriores obsoletos
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => saveStepToLibrary(agent.id, step, 'positive')}
                                  disabled={!!savingLibraryAction}
                                  style={libraryActionStyle(savingLibraryAction === `${step.id}:positive`, 'positive')}
                                >
                                  {savingLibraryAction === `${step.id}:positive` ? 'Salvando...' : 'Exemplo positivo'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveStepToLibrary(agent.id, step, 'negative')}
                                  disabled={!!savingLibraryAction}
                                  style={libraryActionStyle(savingLibraryAction === `${step.id}:negative`, 'negative')}
                                >
                                  {savingLibraryAction === `${step.id}:negative` ? 'Salvando...' : 'Exemplo negativo'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => createLearningFromStep(agent.id, step)}
                                  disabled={!!savingLearningAction}
                                  style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.24)', borderRadius: 8, color: 'var(--accent-blue)', padding: '0.4rem 0.58rem', cursor: savingLearningAction ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.74rem' }}
                                >
                                  {savingLearningAction === step.id ? 'Criando...' : 'Sugerir aprendizado'}
                                </button>
                                {agent.id === 'visual_director' && getStepPayload(step).prompt_visual_opcional && (
                                  <button
                                    type="button"
                                    onClick={() => saveVisualPromptAsset(step)}
                                    disabled={!!savingAssetAction}
                                    style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.26)', borderRadius: 8, color: 'var(--accent-blue)', padding: '0.4rem 0.58rem', cursor: savingAssetAction ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.74rem' }}
                                  >
                                    {savingAssetAction === `visual_prompt:${step.id}` ? 'Salvando...' : 'Salvar prompt visual'}
                                  </button>
                                )}
                              </div>
                            )}
                            {step?.error && <p style={{ color: 'var(--brand-red)', margin: 0 }}>{step.error}</p>}
                            {step?.output ? (
                              <>
                                <AgentOutput agentId={agent.id} output={step.output} />
                                <TechnicalExecutionPanel step={step} />
                              </>
                            ) : (
                              <>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>Sem output salvo ainda.</p>
                                {step && <TechnicalExecutionPanel step={step} />}
                              </>
                            )}
                            {history.length > 1 && (
                              <details style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.65rem' }}>
                                <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.8rem' }}>
                                  Ver versões anteriores
                                </summary>
                                <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.65rem' }}>
                                  {history.filter((item) => item.id !== step?.id).map((oldStep) => (
                                    <div key={oldStep.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.65rem', background: 'rgba(255,255,255,0.025)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.76rem', fontWeight: 800 }}>
                                        <span>v{oldStep.version_number || 1} · {oldStep.status}</span>
                                        <span>{oldStep.invalidated_by_step_id ? 'obsoleto' : 'substituído'}</span>
                                      </div>
                                      {oldStep.output ? (
                                        <AgentOutput agentId={agent.id} output={oldStep.output} />
                                      ) : (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>Versão sem output salvo.</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </details>
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

function BriefingPanel({
  request,
  accountStep,
  editorValue,
  revisionReason,
  preparing,
  approving,
  requestingRevision,
  runningWorkflow,
  onEditorChange,
  onRevisionReasonChange,
  onGenerate,
  onApprove,
  onRequestRevision,
  onRunWorkflow,
}) {
  const generatedBriefing = request?.briefing_original_json || getStepPayload(accountStep);
  const approvedBriefing = request?.approved_briefing_json;
  const visibleBriefing = approvedBriefing || generatedBriefing;
  const briefingStatus = getBriefingStatus(request, visibleBriefing);
  const canApprove = !!generatedBriefing && !approving && !preparing;
  const canRun = isBriefingApprovedRequest(request);

  return (
    <section className="glass-card" style={{ padding: '1.25rem', borderColor: canRun ? 'rgba(16,185,129,0.32)' : 'rgba(56,189,248,0.22)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Briefing Operacional</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0', fontSize: '0.84rem' }}>
            Gate obrigatório antes de copy, visual e edição.
          </p>
        </div>
        <span style={{ color: briefingStatus.color, background: 'rgba(255,255,255,0.04)', border: `1px solid ${briefingStatus.border}`, borderRadius: 999, padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
          {briefingStatus.label}
        </span>
      </div>

      {!visibleBriefing ? (
        <div style={{ border: '1px solid rgba(56,189,248,0.22)', borderRadius: 8, padding: '0.9rem', background: 'rgba(56,189,248,0.055)' }}>
          <strong>Aguardando geração</strong>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.3rem 0 0.8rem' }}>
            Gere o briefing do Atendimento Estratégico. A esteira criativa fica bloqueada até aprovação humana.
          </p>
          <button className="btn-primary" type="button" onClick={onGenerate} disabled={preparing || runningWorkflow} style={{ padding: '0.65rem 0.85rem' }}>
            {preparing ? 'Gerando briefing...' : 'Gerar briefing'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          <BriefingSummary briefing={visibleBriefing} />

          <details open={!canRun} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.75rem', background: 'rgba(0,0,0,0.12)' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.85rem' }}>
              Editar briefing estruturado
            </summary>
            <textarea
              className="form-input"
              value={editorValue}
              onChange={(event) => onEditorChange(event.target.value)}
              spellCheck={false}
              style={{ width: '100%', minHeight: 260, marginTop: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: '0.78rem', lineHeight: 1.45 }}
            />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0.45rem 0 0' }}>
              Se você alterar o JSON antes de aprovar, a versão aprovada será marcada como editada pelo admin.
            </p>
          </details>

          {request?.briefing_source && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Fonte aprovada: {request.briefing_source === 'admin_edited' ? 'editada pelo admin' : 'IA sem edição'}
            </div>
          )}

          {request?.briefing_revision_reason && (
            <div style={{ border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '0.75rem', color: 'var(--warning)', background: 'rgba(245,158,11,0.055)', fontSize: '0.84rem' }}>
              Revisão solicitada: {request.briefing_revision_reason}
            </div>
          )}

          <div style={{ display: 'grid', gap: '0.55rem' }}>
            <textarea
              className="form-input"
              value={revisionReason}
              onChange={(event) => onRevisionReasonChange(event.target.value)}
              placeholder="Motivo para pedir revisão do briefing"
              style={{ width: '100%', minHeight: 74 }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
              <button className="btn-primary" type="button" onClick={onApprove} disabled={!canApprove || approving} style={{ padding: '0.65rem 0.85rem' }}>
                {approving ? 'Aprovando...' : canRun ? 'Salvar aprovação' : 'Aprovar briefing'}
              </button>
              <button
                type="button"
                onClick={onRequestRevision}
                disabled={requestingRevision || preparing}
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.32)', borderRadius: 8, color: 'var(--warning)', padding: '0.65rem 0.85rem', cursor: requestingRevision || preparing ? 'wait' : 'pointer', fontWeight: 800 }}
              >
                {requestingRevision ? 'Solicitando...' : 'Pedir revisão'}
              </button>
              <button
                type="button"
                onClick={onGenerate}
                disabled={preparing || runningWorkflow}
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 8, color: 'var(--accent-blue)', padding: '0.65rem 0.85rem', cursor: preparing || runningWorkflow ? 'wait' : 'pointer', fontWeight: 800 }}
              >
                {preparing ? 'Gerando...' : 'Gerar nova versão'}
              </button>
              <button
                type="button"
                onClick={onRunWorkflow}
                disabled={!canRun || runningWorkflow || preparing}
                style={{ background: canRun ? 'rgba(16,185,129,0.14)' : 'rgba(255,255,255,0.04)', border: `1px solid ${canRun ? 'rgba(16,185,129,0.38)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, color: canRun ? 'var(--success)' : 'var(--text-secondary)', padding: '0.65rem 0.85rem', cursor: !canRun || runningWorkflow || preparing ? 'not-allowed' : 'pointer', fontWeight: 800 }}
              >
                {runningWorkflow ? 'Rodando...' : 'Prosseguir para criação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BriefingSummary({ briefing }) {
  const operational = briefing?.briefing_operacional || {};
  const creative = briefing?.hipotese_criativa || {};
  return (
    <div style={{ display: 'grid', gap: '0.65rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.85rem', background: 'rgba(255,255,255,0.025)' }}>
      <OutputLine title="Objetivo" value={operational.objetivo} />
      <OutputLine title="Público" value={operational.publico} />
      <OutputLine title="Insight" value={operational.insight} />
      <OutputLine title="Promessa" value={operational.promessa} />
      <OutputLine title="Mensagem central" value={operational.mensagem_central} />
      <OutputLine title="Tom recomendado" value={operational.tom_recomendado} />
      <OutputLine title="Hipótese criativa" value={[creative.conceito, creative.angulo, creative.narrativa].filter(Boolean).join(' · ')} />
      <OutputList title="Critérios de sucesso" items={briefing?.criterios_de_sucesso || operational.criterio_de_sucesso} />
      <OutputList title="Warnings" items={briefing?.warnings} muted />
    </div>
  );
}

function getBriefingStatus(request, briefing) {
  if (!briefing) {
    return { label: 'aguardando geração', color: 'var(--text-secondary)', border: 'rgba(255,255,255,0.12)' };
  }
  if (request?.status === 'briefing_approved') {
    return { label: 'aprovado', color: 'var(--success)', border: 'rgba(16,185,129,0.35)' };
  }
  if (request?.status === 'briefing_revision_requested') {
    return { label: 'revisão solicitada', color: 'var(--warning)', border: 'rgba(245,158,11,0.35)' };
  }
  return { label: 'aguardando aprovação', color: 'var(--accent-blue)', border: 'rgba(56,189,248,0.35)' };
}

function isBriefingApprovedRequest(request) {
  return !!request?.approved_briefing_json
    && !['draft', 'briefing_pending', 'briefing_generated', 'briefing_revision_requested'].includes(request.status);
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
        <OutputQualityPanel metadata={data.quality_metadata} compact />
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
        <OutputQualityPanel metadata={data.quality_metadata} compact />
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
        <OutputQualityPanel metadata={data.quality_metadata} compact />
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

function RunExecutionSummary({ run, steps }) {
  if (!run) return null;
  const summary = run.execution_metadata || calculateRunExecutionSummary(steps);
  if (!summary?.total_steps) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.55rem' }}>
      <MetricPill label="Steps" value={`${summary.completed_steps || 0}/${summary.total_steps || 0}`} />
      <MetricPill label="Falhas" value={summary.failed_steps || 0} tone={summary.failed_steps ? 'danger' : 'muted'} />
      <MetricPill label="Tokens" value={summary.total_tokens || 0} />
      <MetricPill label="Custo" value={formatMoney(summary.estimated_cost_total)} />
      <MetricPill label="Tempo" value={formatDuration(summary.duration_ms_total)} />
    </div>
  );
}

function TechnicalExecutionPanel({ step }) {
  const meta = step.execution_metadata || {};
  const tokens = step.tokens || {
    input: meta.input_tokens,
    output: meta.output_tokens,
    total: meta.total_tokens,
  };
  const hasMeta = step.model_used || step.prompt_version || step.provider || step.duration_ms || step.attempt_count || step.cost_estimate || step.error || tokens?.total;
  if (!hasMeta) return null;

  return (
    <details style={{ marginTop: '0.65rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.65rem', background: 'rgba(255,255,255,0.02)' }}>
      <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.78rem' }}>
        Metadados técnicos da execução
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.55rem', marginTop: '0.65rem' }}>
        <TechMetric label="Provider" value={step.provider || meta.provider} />
        <TechMetric label="Modelo" value={step.model_used || meta.model} />
        <TechMetric label="Prompt" value={step.prompt_version || meta.prompt_version || step.input?.promptPack?.promptVersion} />
        <TechMetric label="Tokens in" value={tokens?.input ?? meta.input_tokens} />
        <TechMetric label="Tokens out" value={tokens?.output ?? meta.output_tokens} />
        <TechMetric label="Tokens total" value={tokens?.total ?? meta.total_tokens} />
        <TechMetric label="Custo" value={formatMoney(step.cost_estimate ?? meta.estimated_cost)} />
        <TechMetric label="Duração" value={formatDuration(step.duration_ms ?? meta.duration_ms)} />
        <TechMetric label="Tentativas" value={step.attempt_count ?? meta.attempt_count} />
      </div>
      {(step.error || meta.error_message) && (
        <div style={{ marginTop: '0.6rem', color: 'var(--brand-red)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
          {step.error || meta.error_message}
        </div>
      )}
    </details>
  );
}

function TechMetric({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.5rem', background: 'rgba(0,0,0,0.12)' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginBottom: '0.18rem' }}>{label}</div>
      <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 800, wordBreak: 'break-word' }}>{formatValue(value)}</div>
    </div>
  );
}

function MetricPill({ label, value, tone = 'muted' }) {
  const color = tone === 'danger' ? 'var(--brand-red)' : 'var(--text-secondary)';
  return (
    <span style={{ color, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '0.18rem 0.55rem', fontSize: '0.72rem', fontWeight: 800 }}>
      {label}: {value}
    </span>
  );
}

function DeliveryPanel({ latestRun, copyStep, visualStep, editorStep, approverStep, generatingImage, generatedImage, generatedImages, onSelectImage, onGenerateImage }) {
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
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>
            A imagem gerada aqui é apoio conceitual para revisão visual. Ela não é publicação automática nem substitui arte final editável.
          </p>
          <button
            type="button"
            onClick={onGenerateImage}
            disabled={generatingImage}
            style={{ background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.38)', borderRadius: 8, color: 'var(--success)', padding: '0.72rem 0.85rem', cursor: generatingImage ? 'wait' : 'pointer', fontWeight: 800 }}
          >
            {generatingImage ? 'Criando imagem...' : generatedImages?.length ? 'Gerar outra imagem conceitual' : 'Gerar imagem conceitual'}
          </button>

          {generatedImage?.src && (
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800 }}>
                Opção escolhida
              </div>
              {generatedImage.compositionMode === 'baked_text' ? (
                <img
                  src={generatedImage.src}
                  alt="Imagem conceitual gerada por GPT Image"
                  style={{ width: '100%', maxWidth: 560, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}
                />
              ) : (
                <ComposedArtworkPreview image={generatedImage} />
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', alignItems: 'center' }}>
                {generatedImage.compositionMode === 'baked_text' ? (
                  <a
                    href={generatedImage.src}
                    download="ativo-visual-espansione.png"
                    style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}
                  >
                    Baixar PNG
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => downloadComposedArtwork(generatedImage)}
                    style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem' }}
                  >
                    Baixar PNG com texto correto
                  </button>
                )}
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

          {generatedImages?.length > 0 && (
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800 }}>
                Galeria de opções
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.55rem' }}>
                {generatedImages.map((image, index) => {
                  const selected = image.id === generatedImage?.id;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => onSelectImage(image)}
                      style={{ display: 'grid', gap: '0.35rem', textAlign: 'left', background: selected ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.035)', border: `1px solid ${selected ? 'rgba(56,189,248,0.48)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, padding: '0.45rem', cursor: 'pointer', color: 'var(--text-primary)' }}
                    >
                      <img
                        src={image.src}
                        alt={`Opção de arte ${index + 1}`}
                        style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 6, background: 'rgba(0,0,0,0.2)' }}
                      />
                      <span style={{ fontSize: '0.76rem', fontWeight: 800 }}>
                        Opção {generatedImages.length - index}
                      </span>
                      {selected && (
                        <span style={{ color: 'var(--accent-blue)', fontSize: '0.72rem', fontWeight: 800 }}>
                          Escolhida
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function CreativeAssetsPanel({
  assets,
  latestRun,
  visualStep,
  savingAction,
  onAddAsset,
  onSaveVisualPrompt,
  onReviewAsset,
}) {
  const hasVisualPrompt = !!getStepPayload(visualStep).prompt_visual_opcional;
  return (
    <section style={{ border: '1px solid rgba(56,189,248,0.2)', borderRadius: 8, padding: '0.9rem', marginBottom: '0.85rem', background: 'rgba(56,189,248,0.045)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <strong>Ativos Visuais</strong>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0.3rem 0 0' }}>
            Direção visual, imagens conceituais, moodboards e referências ficam aqui para revisão antes de qualquer uso.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', justifyContent: 'flex-end' }}>
          {latestRun && hasVisualPrompt && (
            <button
              type="button"
              onClick={() => onSaveVisualPrompt(visualStep)}
              disabled={!!savingAction}
              style={{ background: 'rgba(14,165,233,0.09)', border: '1px solid rgba(14,165,233,0.28)', borderRadius: 8, color: 'var(--accent-blue)', padding: '0.45rem 0.65rem', cursor: savingAction ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.76rem' }}
            >
              {savingAction === `visual_prompt:${visualStep?.id}` ? 'Salvando...' : 'Salvar prompt visual'}
            </button>
          )}
          <button
            type="button"
            onClick={onAddAsset}
            disabled={!!savingAction}
            style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'var(--text-primary)', padding: '0.45rem 0.65rem', cursor: savingAction ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.76rem' }}
          >
            {savingAction === 'manual' ? 'Adicionando...' : 'Adicionar ativo'}
          </button>
        </div>
      </div>

      {!assets?.length ? (
        <div style={{ border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
          Nenhum ativo visual salvo ainda. Gere uma imagem conceitual, salve o prompt do Diretor Visual ou adicione uma referência manual.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.65rem' }}>
          {assets.map((asset) => (
            <CreativeAssetCard
              key={asset.id}
              asset={asset}
              savingAction={savingAction}
              onReviewAsset={onReviewAsset}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CreativeAssetCard({ asset, savingAction, onReviewAsset }) {
  const warnings = getCreativeAssetWarnings(asset);
  const metadataWarnings = toArray(asset.metadata_json?.warnings);
  const allWarnings = [...new Set([...warnings, ...metadataWarnings])];
  return (
    <article style={{ display: 'grid', gap: '0.6rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.75rem', background: 'rgba(0,0,0,0.14)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
            {CREATIVE_ASSET_TYPE_LABELS[asset.asset_type] || asset.asset_type}
          </div>
          <strong>{asset.title}</strong>
        </div>
        <span style={{ color: creativeAssetStatusColor(asset.status), border: `1px solid ${creativeAssetStatusBorder(asset.status)}`, borderRadius: 999, padding: '0.2rem 0.58rem', fontSize: '0.74rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
          {CREATIVE_ASSET_STATUS_LABELS[asset.status] || asset.status}
        </span>
      </div>

      {asset.file_url && (
        <img
          src={asset.file_url}
          alt={asset.title}
          style={{ width: '100%', maxWidth: 420, aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.22)' }}
        />
      )}

      {asset.prompt && (
        <details style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.6rem', background: 'rgba(255,255,255,0.025)' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.8rem' }}>Prompt / descrição</summary>
          <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.45rem' }}>
            {asset.prompt}
          </div>
        </details>
      )}

      {allWarnings.length > 0 && (
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          {allWarnings.map((warning, index) => (
            <div key={`${asset.id}-warning-${index}`} style={{ color: 'var(--warning)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 8, padding: '0.55rem', fontSize: '0.82rem' }}>
              {warning}
            </div>
          ))}
        </div>
      )}

      {asset.review_notes && (
        <OutputLine title="Notas de revisão" value={asset.review_notes} />
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
        <button
          type="button"
          onClick={() => onReviewAsset(asset, 'approve')}
          disabled={!!savingAction || asset.status === 'approved'}
          style={assetActionStyle('approve', savingAction === `approve:${asset.id}`)}
        >
          {savingAction === `approve:${asset.id}` ? 'Aprovando...' : 'Aprovar ativo'}
        </button>
        <button
          type="button"
          onClick={() => onReviewAsset(asset, 'reject')}
          disabled={!!savingAction || asset.status === 'rejected'}
          style={assetActionStyle('reject', savingAction === `reject:${asset.id}`)}
        >
          {savingAction === `reject:${asset.id}` ? 'Rejeitando...' : 'Rejeitar'}
        </button>
        <button
          type="button"
          onClick={() => onReviewAsset(asset, 'archive')}
          disabled={!!savingAction || asset.status === 'archived'}
          style={assetActionStyle('archive', savingAction === `archive:${asset.id}`)}
        >
          {savingAction === `archive:${asset.id}` ? 'Arquivando...' : 'Arquivar'}
        </button>
      </div>
    </article>
  );
}

function OutputCard({ children }) {
  return (
    <div style={{ display: 'grid', gap: '0.7rem', background: 'rgba(0,0,0,0.16)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '0.85rem' }}>
      {children}
    </div>
  );
}

function miniActionStyle(loading) {
  return {
    background: loading ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${loading ? 'rgba(56,189,248,0.45)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 8,
    color: loading ? 'var(--accent-blue)' : 'var(--text-secondary)',
    padding: '0.4rem 0.58rem',
    cursor: loading ? 'wait' : 'pointer',
    fontWeight: 800,
    fontSize: '0.74rem',
  };
}

function libraryActionStyle(loading, polarity) {
  const positive = polarity === 'positive';
  return {
    background: loading
      ? 'rgba(56,189,248,0.18)'
      : positive
        ? 'rgba(16,185,129,0.08)'
        : 'rgba(245,158,11,0.08)',
    border: `1px solid ${positive ? 'rgba(16,185,129,0.28)' : 'rgba(245,158,11,0.28)'}`,
    borderRadius: 8,
    color: loading ? 'var(--accent-blue)' : positive ? 'var(--success)' : 'var(--warning)',
    padding: '0.4rem 0.58rem',
    cursor: loading ? 'wait' : 'pointer',
    fontWeight: 800,
    fontSize: '0.74rem',
  };
}

function assetActionStyle(action, loading) {
  const variants = {
    approve: ['rgba(16,185,129,0.08)', 'rgba(16,185,129,0.28)', 'var(--success)'],
    reject: ['rgba(245,158,11,0.08)', 'rgba(245,158,11,0.28)', 'var(--warning)'],
    archive: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.12)', 'var(--text-secondary)'],
  };
  const [background, border, color] = variants[action] || variants.archive;
  return {
    background: loading ? 'rgba(56,189,248,0.18)' : background,
    border: `1px solid ${loading ? 'rgba(56,189,248,0.45)' : border}`,
    borderRadius: 8,
    color: loading ? 'var(--accent-blue)' : color,
    padding: '0.4rem 0.58rem',
    cursor: loading ? 'wait' : 'pointer',
    fontWeight: 800,
    fontSize: '0.74rem',
  };
}

function creativeAssetStatusColor(status) {
  if (status === 'approved') return 'var(--success)';
  if (status === 'rejected') return 'var(--brand-red)';
  if (status === 'generated') return 'var(--accent-blue)';
  if (status === 'archived') return 'var(--text-secondary)';
  return 'var(--warning)';
}

function creativeAssetStatusBorder(status) {
  if (status === 'approved') return 'rgba(16,185,129,0.35)';
  if (status === 'rejected') return 'rgba(239,68,68,0.35)';
  if (status === 'generated') return 'rgba(56,189,248,0.35)';
  if (status === 'archived') return 'rgba(255,255,255,0.12)';
  return 'rgba(245,158,11,0.35)';
}

function getCreativeAssetWarnings(asset = {}) {
  const warnings = [];
  if (asset.has_embedded_text) warnings.push(EMBEDDED_TEXT_REVIEW_WARNING);
  if (asset.asset_type === 'final_art' && asset.text_review_required) {
    warnings.push('Ativo final_art com texto embutido só deve avançar após revisão humana explícita.');
  }
  return warnings;
}

function libraryItemTypeForAgent(agentId, polarity) {
  const positive = polarity === 'positive';
  if (agentId === 'copywriter' || agentId === 'editor') {
    return positive ? 'approved_copy' : 'rejected_copy';
  }
  if (agentId === 'visual_director') {
    return positive ? 'approved_visual_direction' : 'rejected_visual_direction';
  }
  if (agentId === 'approver') {
    return positive ? 'campaign_example' : 'negative_example';
  }
  return positive ? 'creative_reference' : 'negative_example';
}

function defaultLearningTypeForAgent(agentId, step) {
  const payload = getStepPayload(step);
  const decision = normalizeDecision(payload.decisao || payload.decision);
  if (agentId === 'copywriter') return 'voice_preference';
  if (agentId === 'visual_director') return 'visual_preference';
  if (agentId === 'editor') return 'campaign_learning';
  if (agentId === 'approver' && decision === 'rejected') return 'claim_rule';
  if (agentId === 'approver' && decision === 'revision_requested') return 'claim_rule';
  return 'campaign_learning';
}

function defaultLearningContent(agentId, step) {
  const payload = getStepPayload(step);
  if (agentId === 'copywriter') return payload.racional_de_tom || payload.copy_principal || payload.cta || '';
  if (agentId === 'visual_director') return payload.direcao_de_arte || payload.composicao || payload.prompt_visual_opcional || '';
  if (agentId === 'editor') return payload.versao_editada || toArray(payload.riscos_de_incoerencia).join('\n') || '';
  if (agentId === 'approver') {
    return payload.risco_principal
      || payload.justificativa
      || toArray(payload.ajustes_obrigatorios).join('\n')
      || '';
  }
  return JSON.stringify(payload);
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

function sortAgencySteps(steps = []) {
  return [...steps].sort((a, b) => {
    const agentDelta = AGENCY_AGENT_ORDER.indexOf(a.agent_id) - AGENCY_AGENT_ORDER.indexOf(b.agent_id);
    if (agentDelta !== 0) return agentDelta;
    const versionDelta = Number(b.version_number || 1) - Number(a.version_number || 1);
    if (versionDelta !== 0) return versionDelta;
    return String(b.created_at || '').localeCompare(String(a.created_at || ''));
  });
}

function groupStepsByAgent(steps = []) {
  const grouped = new Map();
  for (const step of steps) {
    const current = grouped.get(step.agent_id) || [];
    current.push(step);
    grouped.set(step.agent_id, current);
  }
  return grouped;
}

function hasObsoleteDownstream(steps = [], agentId) {
  const index = AGENCY_AGENT_ORDER.indexOf(agentId);
  if (index < 0) return false;
  const downstream = new Set(AGENCY_AGENT_ORDER.slice(index + 1));
  return steps.some((step) => downstream.has(step.agent_id) && step.is_current === false && step.invalidated_by_step_id);
}

function calculateRunExecutionSummary(steps = []) {
  const relevant = (steps || []).filter((step) => step && step.status !== 'skipped' && step.status !== 'regenerated');
  return relevant.reduce((acc, step) => {
    const tokens = step.tokens || {};
    const inputTokens = Number(tokens.input || tokens.input_tokens || 0);
    const outputTokens = Number(tokens.output || tokens.output_tokens || 0);
    acc.total_steps += 1;
    if (step.status === 'completed') acc.completed_steps += 1;
    if (step.status === 'failed') acc.failed_steps += 1;
    acc.input_tokens_total += inputTokens;
    acc.output_tokens_total += outputTokens;
    acc.total_tokens += Number(tokens.total || tokens.total_tokens || inputTokens + outputTokens || 0);
    acc.estimated_cost_total += Number(step.cost_estimate || step.execution_metadata?.estimated_cost || 0);
    acc.duration_ms_total += Number(step.duration_ms || step.execution_metadata?.duration_ms || 0);
    return acc;
  }, {
    total_steps: 0,
    completed_steps: 0,
    failed_steps: 0,
    estimated_cost_total: 0,
    input_tokens_total: 0,
    output_tokens_total: 0,
    total_tokens: 0,
    duration_ms_total: 0,
  });
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

function formatMoney(value) {
  const numeric = Number(value || 0);
  if (!numeric) return 'US$ 0.0000';
  return `US$ ${numeric.toFixed(4)}`;
}

function formatDuration(value) {
  const ms = Number(value || 0);
  if (!ms) return '0 ms';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

async function readJsonOrThrow(response, fallbackMessage) {
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    const compactText = text.replace(/\s+/g, ' ').trim();
    throw new Error(compactText || fallbackMessage);
  }

  if (!response.ok) {
    throw new Error(json?.error || fallbackMessage);
  }

  return json || {};
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
