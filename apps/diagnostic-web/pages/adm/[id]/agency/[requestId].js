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

const AGENCY_AGENT_ORDER = ['account_director', 'copywriter', 'channel_adapter', 'visual_director', 'editor', 'brand_compliance', 'approver'];

const AI_MODELS = [
  { provider: 'mock', model_id: 'mock-model', display_name: 'Mock / Simulado', cost_tier: 'zero', is_mock: true },
  { provider: 'google', model_id: 'gemini-3-flash-preview', display_name: 'Gemini 3 Flash', cost_tier: 'low', is_preview: true },
  { provider: 'openai', model_id: 'gpt-5.4', display_name: 'GPT-5.4', cost_tier: 'medium_high' },
  { provider: 'anthropic', model_id: 'claude-sonnet-4-6', display_name: 'Claude Sonnet 4.6', cost_tier: 'medium_high' },
];

const REAL_AI_MODELS = AI_MODELS.filter((model) => !model.is_mock);
const DEFAULT_AGENT_MODEL = {
  account_director: 'gpt-5.4',
  copywriter: 'claude-sonnet-4-6',
  channel_adapter: 'gemini-3-flash-preview',
  visual_director: 'gpt-5.4',
  editor: 'claude-sonnet-4-6',
  brand_compliance: 'gpt-5.4',
  approver: 'gpt-5.4',
};

const EXECUTION_MODE_OPTIONS = [
  {
    value: 'mock',
    label: 'Simular sem gastar tokens',
    description: 'Testa fluxo, banco, timeline e UI sem chamar IA real.',
  },
  {
    value: 'economical',
    label: 'Econômico',
    description: 'Usa modelo rápido/barato para testes com output real.',
  },
  {
    value: 'use_agent_defaults',
    label: 'Padrão por agente',
    description: 'Usa o modelo recomendado para cada agente.',
  },
  {
    value: 'use_single_model_for_run',
    label: 'Modelo único para toda a execução',
    description: 'Aplica o mesmo modelo em todos os steps desta execução.',
  },
  {
    value: 'override_single_agent',
    label: 'Personalizado por agente',
    description: 'Permite escolher modelo para agentes específicos da run.',
  },
];

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
  const [briefingFormValue, setBriefingFormValue] = useState(null);
  const [briefingRevisionReason, setBriefingRevisionReason] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [reprocessingAction, setReprocessingAction] = useState('');
  const [savingLibraryAction, setSavingLibraryAction] = useState('');
  const [savingLearningAction, setSavingLearningAction] = useState('');
  const [creativeAssets, setCreativeAssets] = useState([]);
  const [savingAssetAction, setSavingAssetAction] = useState('');
  const [executionModal, setExecutionModal] = useState(null);
  const [modelSelection, setModelSelection] = useState(defaultModelSelection());

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
    setBriefingFormValue(briefing ? cloneBriefing(briefing) : null);
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

  const openExecutionModal = (scope = 'all', agentId = null) => {
    setExecutionModal({ scope, agentId });
  };

  const runWorkflow = async () => {
    openExecutionModal('all');
  };

  const submitAgencyExecution = async () => {
    if (!executionModal) return;
    setRunningWorkflow(true);
    setReprocessingAction(executionModal.scope === 'all' ? '' : `${executionModal.scope === 'from' ? 'from' : 'one'}:${executionModal.agentId}`);
    setErrorMsg('');
    try {
      const cleanSelection = cleanModelSelection(modelSelection, agentFlow);
      let endpoint = `/api/agency/requests/${requestId}/run-workflow`;
      let body = { modelSelection: cleanSelection };

      if (executionModal.scope !== 'all') {
        if (!latestRun?.id || !executionModal.agentId) return;
        const approvedRequest = request?.status === 'approved';
        let confirmApproved = false;
        if (approvedRequest) {
          confirmApproved = window.confirm('Este pedido já está aprovado. Criar uma nova versão vai manter o histórico, mas mudar o status do pedido. Continuar?');
          if (!confirmApproved) return;
        }
        endpoint = executionModal.scope === 'from'
          ? `/api/agency/runs/${latestRun.id}/regenerate-from-step`
          : `/api/agency/runs/${latestRun.id}/regenerate-step`;
        body = { agentId: executionModal.agentId, confirmApproved, modelSelection: cleanSelection };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await readJsonOrThrow(res, 'Erro ao rodar Agência IA');
      if (!json.success) throw new Error(json.error || 'Erro ao rodar Agência IA');
      setExecutionModal(null);
      await loadRequest();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setRunningWorkflow(false);
      setReprocessingAction('');
    }
  };

  const approveBriefing = async () => {
    setApprovingBriefing(true);
    setErrorMsg('');
    try {
      const originalBriefing = request?.briefing_original_json || null;
      const editedText = String(briefingEditorValue || '').trim();
      const candidateBriefing = briefingFormValue || (editedText ? JSON.parse(editedText) : null);
      const editedBriefing = candidateBriefing && !briefingEquivalent(candidateBriefing, originalBriefing)
        ? candidateBriefing
        : null;

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
    openExecutionModal(action === 'from' ? 'from' : 'one', agentId);
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
  const executionPlan = latestRun?.execution_plan_json || latestRun?.executionPlan || null;
  const visibleAgentIds = Array.isArray(executionPlan?.agent_sequence) && executionPlan.agent_sequence.length
    ? executionPlan.agent_sequence
    : AGENCY_AGENT_ORDER;
  const agentFlow = visibleAgentIds.map((agentId) => ({
    id: agentId,
    label: shortAgentLabel(agentId),
    description: agentDescription(agentId),
  }));
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

          {executionModal && (
            <ExecutionModeModal
              modal={executionModal}
              agentFlow={agentFlow}
              modelSelection={modelSelection}
              setModelSelection={setModelSelection}
              running={runningWorkflow}
              onClose={() => setExecutionModal(null)}
              onSubmit={submitAgencyExecution}
            />
          )}

          {loading ? (
            <div className="glass-card" style={{ padding: '1.5rem' }}>Carregando...</div>
          ) : request ? (
            <>
              <section className="glass-card outline-glow agency-topbar">
                <div className="agency-topbar-main">
                  <div className="agency-title-block">
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                      Pedido de Agência IA
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.35rem' }}>{requestTypeLabel}</h1>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.35rem' }}>
                      {formatValue(channelLabel)} · {formatValue(objectiveLabel)} · status {formatValue(request.status)}
                    </div>
                  </div>

                  <div className="agency-step-strip">
                    {agentFlow.map((agent, index) => {
                      const step = stepByAgent.get(agent.id);
                      const technicalStatus = getTechnicalStatus(step);
                      const done = technicalStatus === 'completed';
                      const active = step && !done;
                      return (
                        <div key={agent.id} title={labelAgent(agent.id)} className="agency-step-pill" style={{ borderColor: done ? 'rgba(16,185,129,0.5)' : active ? 'rgba(56,189,248,0.55)' : 'rgba(255,255,255,0.09)', background: done ? 'rgba(16,185,129,0.14)' : active ? 'rgba(56,189,248,0.14)' : 'rgba(255,255,255,0.04)' }}>
                          <div style={{ color: done ? 'var(--success)' : active ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 800 }}>0{index + 1}</div>
                          <div className="agency-step-label">{agent.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="agency-top-actions">
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
              </section>

              <div className="agency-workspace">
                <aside className="agency-sidebar">
                <section className="glass-card agency-card">
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
                    <Label title="Oferta" value={request.offer || '-'} />
                    <Label title="CTA" value={request.desired_cta || '-'} />
                    <Label title="Contexto" value={request.context} />
                  </dl>

                  <details style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.85rem' }}>Restrições, referências e warnings</summary>
                    <dl style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 0.34fr) 1fr', gap: '0.65rem 0.9rem', margin: '0.85rem 0 0' }}>
                      <Label title="Público/cluster" value={request.audience_cluster || '-'} preserve />
                      <Label title="Restrições" value={(request.restrictions || []).join('\n') || '-'} preserve />
                      <Label title="Referências" value={(request.reference_material || []).join('\n') || '-'} preserve />
                      <Label title="Warnings" value={(request.readiness_warnings || []).join('\n') || '-'} preserve />
                    </dl>
                  </details>
                </section>
                </aside>

                <div className="agency-content">
                <BriefingPanel
                  request={request}
                  accountStep={accountStep}
                  editorValue={briefingEditorValue}
                  formValue={briefingFormValue}
                  revisionReason={briefingRevisionReason}
                  preparing={preparing}
                  approving={approvingBriefing}
                  requestingRevision={requestingBriefingRevision}
                  runningWorkflow={runningWorkflow}
                  onEditorChange={setBriefingEditorValue}
                  onFormChange={(nextBriefing) => {
                    setBriefingFormValue(nextBriefing);
                    setBriefingEditorValue(nextBriefing ? JSON.stringify(nextBriefing, null, 2) : '');
                  }}
                  onRevisionReasonChange={setBriefingRevisionReason}
                  onGenerate={prepareBriefing}
                  onApprove={approveBriefing}
                  onRequestRevision={requestBriefingRevision}
                  onRunWorkflow={runWorkflow}
                />

                <section className="glass-card agency-card agency-execution-card">
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
                        <Link href={`/adm/${id}/agency/signals?brand_id=${request.brand_id}`} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.28)', borderRadius: 8, color: 'var(--warning)', padding: '0.42rem 0.7rem', textDecoration: 'none', fontWeight: 800, fontSize: '0.78rem' }}>
                          Sinais
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
                    channelStep={stepByAgent.get('channel_adapter')}
                    visualStep={stepByAgent.get('visual_director')}
                    editorStep={stepByAgent.get('editor')}
                    approverStep={approverStep}
                    generatingImage={generatingImage}
                    generatedImage={generatedImage}
                    generatedImages={generatedImages}
                    onSelectImage={setGeneratedImage}
                    onGenerateImage={generateApprovedImage}
                  />

                  <ExecutionProfilePanel run={latestRun} executionPlan={executionPlan} agentFlow={agentFlow} />

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
                      const technicalStatus = getTechnicalStatus(step);
                      const qualityAssessment = getQualityAssessment(step);
                      const done = technicalStatus === 'completed';
                      const downstreamObsolete = hasObsoleteDownstream(allRunSteps, agent.id);
                      return (
                        <details key={agent.id} open={!!step?.output && agent.id === 'approver'} style={{ border: `1px solid ${done ? 'rgba(16,185,129,0.28)' : step ? 'rgba(56,189,248,0.24)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, background: done ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.025)' }}>
                          <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 0.85rem' }}>
                            <span>
                              <strong style={{ color: done ? 'var(--success)' : 'var(--text-primary)', marginRight: '0.45rem' }}>0{index + 1}</strong>
                              {labelAgent(agent.id)}
                              <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.77rem', marginTop: '0.12rem' }}>{agent.description}</span>
                            </span>
                            <span style={{ display: 'grid', gap: '0.15rem', justifyItems: 'end' }}>
                              <span style={{ color: done ? 'var(--success)' : step ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800 }}>
                                {step ? `v${step.version_number || 1} · execução ${technicalStatusLabel(technicalStatus)}` : 'aguardando'}
                              </span>
                              {step && (
                                <span style={{ color: qualityStatusColor(qualityAssessment?.quality_status), fontSize: '0.7rem', fontWeight: 800 }}>
                                  qualidade {qualityStatusLabel(qualityAssessment?.quality_status)}
                                </span>
                              )}
                            </span>
                          </summary>
                          <div style={{ padding: '0 0.85rem 0.85rem' }}>
                            {step && <StepStatusSummary step={step} />}
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
                                <QualityAssessmentPanel assessment={qualityAssessment} />
                                <TechnicalExecutionPanel step={step} />
                              </>
                            ) : (
                              <>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0 }}>Sem output salvo ainda.</p>
                                <QualityAssessmentPanel assessment={qualityAssessment} />
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
              </div>
            </>
          ) : null}
          <style jsx global>{`
            .agency-topbar {
              position: sticky;
              top: 0.75rem;
              z-index: 20;
              padding: 0.95rem;
              margin-bottom: 1rem;
              border-color: rgba(56, 189, 248, 0.35);
              background: rgba(6, 12, 25, 0.94);
              backdrop-filter: blur(18px);
            }

            .agency-topbar-main {
              display: grid;
              grid-template-columns: minmax(220px, 0.9fr) minmax(360px, 1.25fr) minmax(260px, 0.8fr);
              gap: 0.9rem;
              align-items: center;
            }

            .agency-title-block {
              min-width: 0;
            }

            .agency-step-strip {
              display: grid;
              grid-template-columns: repeat(5, minmax(0, 1fr));
              gap: 0.45rem;
              min-width: 0;
            }

            .agency-step-pill {
              min-width: 0;
              border: 1px solid rgba(255, 255, 255, 0.09);
              border-radius: 8px;
              padding: 0.5rem 0.45rem;
            }

            .agency-step-label {
              color: var(--text-primary);
              font-size: 0.73rem;
              font-weight: 800;
              margin-top: 0.14rem;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .agency-top-actions {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0.55rem;
            }

            .agency-workspace {
              display: grid;
              grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
              gap: 1rem;
              align-items: start;
            }

            .agency-sidebar {
              position: sticky;
              top: 7.35rem;
              align-self: start;
              min-width: 0;
            }

            .agency-content {
              display: grid;
              gap: 1rem;
              min-width: 0;
            }

            .agency-card {
              padding: 1.05rem;
              min-width: 0;
            }

            .agency-execution-card {
              display: grid;
              gap: 0.85rem;
            }

            .briefing-summary-card {
              display: grid;
              gap: 0.8rem;
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 8px;
              padding: 0.85rem;
              background: rgba(255, 255, 255, 0.025);
            }

            .briefing-highlight {
              display: grid;
              gap: 0.65rem;
              border: 1px solid rgba(56, 189, 248, 0.16);
              border-radius: 8px;
              padding: 0.75rem;
              background: rgba(56, 189, 248, 0.04);
            }

            .briefing-summary-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 0.8rem 1rem;
            }

            @media (max-width: 1180px) {
              .agency-topbar-main {
                grid-template-columns: minmax(220px, 1fr) minmax(320px, 1fr);
              }

              .agency-top-actions {
                grid-column: 1 / -1;
                grid-template-columns: repeat(2, minmax(180px, 1fr));
              }

              .agency-workspace {
                grid-template-columns: 1fr;
              }

              .agency-sidebar {
                position: static;
              }
            }

            @media (max-width: 720px) {
              .agency-topbar {
                position: static;
              }

              .agency-topbar-main,
              .agency-top-actions {
                grid-template-columns: 1fr;
              }

              .agency-step-strip {
                grid-template-columns: repeat(5, minmax(72px, 1fr));
                overflow-x: auto;
                padding-bottom: 0.2rem;
              }

              .agency-card {
                padding: 0.9rem;
              }

              .briefing-summary-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
        </main>
      </div>
    </>
  );
}

function BriefingPanel({
  request,
  accountStep,
  editorValue,
  formValue,
  revisionReason,
  preparing,
  approving,
  requestingRevision,
  runningWorkflow,
  onEditorChange,
  onFormChange,
  onRevisionReasonChange,
  onGenerate,
  onApprove,
  onRequestRevision,
  onRunWorkflow,
}) {
  const generatedBriefing = request?.briefing_original_json || getStepPayload(accountStep);
  const approvedBriefing = request?.approved_briefing_json;
  const visibleBriefing = approvedBriefing || generatedBriefing;
  const editableBriefing = formValue || visibleBriefing;
  const briefingStatus = getBriefingStatus(request, visibleBriefing);
  const canApprove = !!generatedBriefing && !approving && !preparing;
  const canRun = isBriefingApprovedRequest(request);

  const updateBriefingField = (path, value) => {
    const next = cloneBriefing(editableBriefing || {});
    setNestedValue(next, path, value);
    onFormChange(next);
  };

  const updateBriefingList = (path, value) => {
    updateBriefingField(path, splitLines(value));
  };

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

          <details open={!canRun} style={{ border: '1px solid rgba(56,189,248,0.18)', borderRadius: 8, padding: '0.85rem', background: 'rgba(56,189,248,0.035)' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.9rem' }}>
              Editar briefing por campos
            </summary>
            <BriefingForm
              briefing={editableBriefing}
              onFieldChange={updateBriefingField}
              onListChange={updateBriefingList}
              onReplace={onFormChange}
            />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0.45rem 0 0' }}>
              Se você alterar qualquer campo antes de aprovar, a versão aprovada será marcada como editada pelo admin.
            </p>
          </details>

          <details style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.75rem', background: 'rgba(0,0,0,0.1)' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 800, fontSize: '0.82rem' }}>
              JSON técnico
            </summary>
            <textarea
              className="form-input"
              value={editorValue}
              onChange={(event) => {
                const nextText = event.target.value;
                onEditorChange(nextText);
                try {
                  onFormChange(JSON.parse(nextText));
                } catch {
                  // Mantem o editor tecnico livre; a validacao acontece ao aprovar.
                }
              }}
              spellCheck={false}
              style={{ width: '100%', minHeight: 220, marginTop: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: '0.76rem', lineHeight: 1.45 }}
            />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', margin: '0.45rem 0 0' }}>
              Area tecnica para diagnostico. Prefira editar pelos campos acima.
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

function BriefingForm({ briefing, onFieldChange, onListChange, onReplace }) {
  const operational = briefing?.briefing_operacional || {};
  const creative = briefing?.hipotese_criativa || {};
  const criteria = briefing?.criterios_de_sucesso || operational.criterio_de_sucesso || [];

  return (
    <div style={{ display: 'grid', gap: '0.95rem', marginTop: '0.85rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: '0.75rem' }}>
        <BriefingTextField
          label="Objetivo"
          value={operational.objetivo}
          onChange={(value) => onFieldChange(['briefing_operacional', 'objetivo'], value)}
        />
        <BriefingTextField
          label="Público"
          value={operational.publico}
          onChange={(value) => onFieldChange(['briefing_operacional', 'publico'], value)}
        />
        <BriefingTextField
          label="Cluster"
          value={operational.cluster}
          onChange={(value) => onFieldChange(['briefing_operacional', 'cluster'], value)}
        />
      </div>

      <BriefingTextField
        label="Contexto"
        value={operational.contexto}
        multiline
        onChange={(value) => onFieldChange(['briefing_operacional', 'contexto'], value)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '0.75rem' }}>
        <BriefingTextField
          label="Insight"
          value={operational.insight}
          multiline
          onChange={(value) => onFieldChange(['briefing_operacional', 'insight'], value)}
        />
        <BriefingTextField
          label="Promessa"
          value={operational.promessa}
          multiline
          onChange={(value) => onFieldChange(['briefing_operacional', 'promessa'], value)}
        />
      </div>

      <BriefingTextField
        label="Mensagem central"
        value={operational.mensagem_central}
        multiline
        onChange={(value) => onFieldChange(['briefing_operacional', 'mensagem_central'], value)}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '0.75rem' }}>
        <BriefingTextField
          label="Prova"
          value={operational.prova}
          multiline
          onChange={(value) => onFieldChange(['briefing_operacional', 'prova'], value)}
        />
        <BriefingTextField
          label="Tom recomendado"
          value={operational.tom_recomendado}
          multiline
          onChange={(value) => onFieldChange(['briefing_operacional', 'tom_recomendado'], value)}
        />
      </div>

      <BriefingListField
        label="Objeções"
        value={operational.objecoes}
        onChange={(value) => onListChange(['briefing_operacional', 'objecoes'], value)}
      />

      <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.85rem', background: 'rgba(0,0,0,0.12)' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Hipótese criativa
        </div>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <BriefingTextField
            label="Conceito"
            value={creative.conceito}
            onChange={(value) => onFieldChange(['hipotese_criativa', 'conceito'], value)}
          />
          <BriefingTextField
            label="Ângulo"
            value={creative.angulo}
            multiline
            onChange={(value) => onFieldChange(['hipotese_criativa', 'angulo'], value)}
          />
          <BriefingTextField
            label="Narrativa"
            value={creative.narrativa}
            multiline
            onChange={(value) => onFieldChange(['hipotese_criativa', 'narrativa'], value)}
          />
        </div>
      </div>

      <BriefingListField
        label="Critérios de sucesso"
        value={criteria}
        onChange={(value) => {
          const list = splitLines(value);
          const next = cloneBriefing(briefing || {});
          setNestedValue(next, ['criterios_de_sucesso'], list);
          setNestedValue(next, ['briefing_operacional', 'criterio_de_sucesso'], list);
          onReplace(next);
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '0.75rem' }}>
        <BriefingListField
          label="Slices da Brand Memory usados"
          value={briefing?.brand_memory_slices_used}
          onChange={(value) => onListChange(['brand_memory_slices_used'], value)}
        />
        <BriefingListField
          label="Warnings"
          value={briefing?.warnings}
          onChange={(value) => onListChange(['warnings'], value)}
        />
      </div>
    </div>
  );
}

function BriefingTextField({ label, value, onChange, multiline }) {
  const commonStyle = {
    width: '100%',
    marginTop: '0.32rem',
    fontSize: '0.88rem',
    lineHeight: 1.45,
  };

  return (
    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800 }}>
      {label}
      {multiline ? (
        <textarea
          className="form-input"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          style={{ ...commonStyle, minHeight: 86 }}
        />
      ) : (
        <input
          className="form-input"
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          style={commonStyle}
        />
      )}
    </label>
  );
}

function BriefingListField({ label, value, onChange }) {
  return (
    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800 }}>
      {label}
      <textarea
        className="form-input"
        value={toArray(value).map(formatValue).join('\n')}
        onChange={(event) => onChange(event.target.value)}
        style={{ width: '100%', minHeight: 92, marginTop: '0.32rem', fontSize: '0.88rem', lineHeight: 1.45 }}
      />
      <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '0.28rem', fontWeight: 500 }}>
        Um item por linha.
      </span>
    </label>
  );
}

function BriefingSummary({ briefing }) {
  const operational = briefing?.briefing_operacional || {};
  const creative = briefing?.hipotese_criativa || {};
  return (
    <div className="briefing-summary-card">
      <div className="briefing-highlight">
        <OutputLine title="Objetivo" value={operational.objetivo} />
        <OutputLine title="Mensagem central" value={operational.mensagem_central} />
      </div>
      <div className="briefing-summary-grid">
        <OutputLine title="Público" value={operational.publico} />
        <OutputLine title="Insight" value={operational.insight} />
        <OutputLine title="Promessa" value={operational.promessa} />
        <OutputLine title="Tom recomendado" value={operational.tom_recomendado} />
      </div>
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
    channel_adapter: 'Channel Adapter',
    visual_director: 'Direção Visual',
    editor: 'Editor de Coerência',
    brand_compliance: 'Brand Compliance',
    approver: 'Aprovador de Marca',
  };
  return labels[agentId] || agentId;
}

function shortAgentLabel(agentId) {
  const labels = {
    account_director: 'Atendimento',
    copywriter: 'Copywriter',
    channel_adapter: 'Canal',
    visual_director: 'Visual',
    editor: 'Editor',
    brand_compliance: 'Compliance',
    approver: 'Aprovador',
  };
  return labels[agentId] || agentId;
}

function agentDescription(agentId) {
  const descriptions = {
    account_director: 'Briefing operacional',
    copywriter: 'Texto e tom',
    channel_adapter: 'Adaptação por canal',
    visual_director: 'Direção de arte',
    editor: 'Qualidade editorial',
    brand_compliance: 'Aderência à marca',
    approver: 'Gate final',
  };
  return descriptions[agentId] || 'Etapa da Agência';
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

  if (agentId === 'channel_adapter') {
    const adapted = data.adapted_content || {};
    return (
      <OutputCard>
        <OutputLine title="Canal" value={data.channel} />
        <OutputLine title="Formato" value={data.request_type} />
        <OutputLine title="Headline" value={adapted.headline} />
        <OutputLine title="Assunto" value={adapted.subject_line} />
        <OutputLine title="Preview text" value={adapted.preview_text} />
        <OutputLine title="Legenda" value={adapted.caption} />
        <OutputLine title="Corpo adaptado" value={adapted.body || adapted.script} />
        <OutputList title="Sequência de slides" items={toArray(adapted.slide_sequence).map(formatValue)} />
        <OutputList title="Seções" items={toArray(adapted.sections).map(formatValue)} />
        <OutputLine title="CTA" value={data.cta} />
        <OutputList title="Regras aplicadas" items={data.formatting_rules_applied} />
        <OutputList title="Notas do canal" items={data.channel_specific_notes} />
        <OutputList title="Hashtags" items={data.hashtags} />
        <OutputLine title="UTM sugerida" value={data.utm_suggestion} />
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

  if (agentId === 'brand_compliance') {
    return (
      <OutputCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <strong>Auditoria de aderência à marca</strong>
          <span style={{ color: complianceDecisionColor(data.decision), background: 'rgba(255,255,255,0.05)', border: `1px solid ${complianceDecisionBorder(data.decision)}`, borderRadius: 999, padding: '0.22rem 0.65rem', fontSize: '0.78rem', fontWeight: 800 }}>
            {complianceDecisionLabel(data.decision)}
          </span>
        </div>
        <OutputLine title="Score de aderência" value={typeof data.overall_brand_alignment_score === 'number' ? `${data.overall_brand_alignment_score}/100` : data.overall_brand_alignment_score} />
        <BrandComplianceChecklist items={data.checklist} />
        <BrandComplianceViolations items={data.violations} />
        <OutputList title="Ajustes obrigatórios" items={data.required_adjustments} />
        <OutputList title="Melhorias opcionais" items={data.optional_improvements} muted />
        <OutputList title="Slices checados" items={data.brand_memory_slices_checked} muted />
        <OutputList title="Avisos" items={warnings} muted />
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

function ExecutionModeModal({
  modal,
  agentFlow,
  modelSelection,
  setModelSelection,
  running,
  onClose,
  onSubmit,
}) {
  const scopeLabel = modal.scope === 'all'
    ? 'Esteira inteira'
    : modal.scope === 'from'
      ? `A partir de ${labelAgent(modal.agentId)}`
      : `Apenas ${labelAgent(modal.agentId)}`;
  const selectedSingleModel = getModel(modelSelection.selected_model_id);
  const usesPremiumForWholeRun = modal.scope === 'all' && (
    (modelSelection.execution_mode === 'use_single_model_for_run' && isPremiumModel(selectedSingleModel?.model_id))
    || modelSelection.execution_mode === 'use_agent_defaults'
  );

  const updateSelection = (patch) => setModelSelection((current) => ({
    ...current,
    ...patch,
  }));

  const setAgentOverride = (agentId, modelId) => {
    setModelSelection((current) => {
      const currentOverrides = Array.isArray(current.agent_overrides) ? current.agent_overrides : [];
      const nextOverrides = [
        ...currentOverrides.filter((item) => item.agent_id !== agentId),
        { agent_id: agentId, model_id: modelId },
      ];
      return { ...current, agent_overrides: nextOverrides };
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(1,6,18,0.72)', display: 'grid', placeItems: 'center', padding: '1.25rem' }}>
      <section className="glass-card" style={{ width: 'min(780px, 100%)', maxHeight: 'min(90vh, 820px)', overflowY: 'auto', borderColor: 'rgba(56,189,248,0.28)', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Execução da Agência</div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Executar Agência IA</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0', fontSize: '0.84rem' }}>{scopeLabel}</p>
          </div>
          <button type="button" onClick={onClose} disabled={running} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'var(--text-primary)', padding: '0.45rem 0.65rem', cursor: running ? 'wait' : 'pointer', fontWeight: 800 }}>
            Fechar
          </button>
        </div>

        <div style={{ display: 'grid', gap: '0.85rem' }}>
          <section style={modalSectionStyle}>
            <strong>1. Modo de execução</strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.55rem', marginTop: '0.7rem' }}>
              {EXECUTION_MODE_OPTIONS.map((option) => {
                const selected = modelSelection.execution_mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateSelection({ execution_mode: option.value })}
                    style={{
                      textAlign: 'left',
                      background: selected ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.035)',
                      border: `1px solid ${selected ? 'rgba(56,189,248,0.38)' : 'rgba(255,255,255,0.09)'}`,
                      borderRadius: 8,
                      color: 'var(--text-primary)',
                      padding: '0.72rem',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'block', color: selected ? 'var(--accent-blue)' : 'var(--text-primary)', fontWeight: 900, fontSize: '0.84rem' }}>{option.label}</span>
                    <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.76rem', lineHeight: 1.4, marginTop: '0.25rem' }}>{option.description}</span>
                  </button>
                );
              })}
            </div>

            {modelSelection.execution_mode === 'use_single_model_for_run' && (
              <label style={modalLabelStyle}>
                Modelo único
                <select
                  value={modelSelection.selected_model_id || 'gemini-3-flash-preview'}
                  onChange={(event) => updateSelection({ selected_model_id: event.target.value })}
                  style={modalInputStyle}
                >
                  {REAL_AI_MODELS.map((model) => <option key={model.model_id} value={model.model_id}>{model.display_name}</option>)}
                </select>
              </label>
            )}

            {modelSelection.execution_mode === 'override_single_agent' && (
              <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
                {agentFlow.map((agent) => {
                  const override = (modelSelection.agent_overrides || []).find((item) => item.agent_id === agent.id);
                  return (
                    <label key={agent.id} style={{ ...modalLabelStyle, marginTop: 0 }}>
                      {agent.label}
                      <select
                        value={override?.model_id || DEFAULT_AGENT_MODEL[agent.id] || 'gemini-3-flash-preview'}
                        onChange={(event) => setAgentOverride(agent.id, event.target.value)}
                        style={modalInputStyle}
                      >
                        {REAL_AI_MODELS.map((model) => <option key={model.model_id} value={model.model_id}>{model.display_name}</option>)}
                      </select>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          <section style={modalSectionStyle}>
            <strong>2. Escopo e proteções de custo</strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem', marginTop: '0.7rem' }}>
              <TechMetric label="Escopo" value={scopeLabel} />
              <label style={{ ...modalLabelStyle, marginTop: 0 }}>
                Máx. tokens por step
                <input
                  type="number"
                  min="1"
                  value={modelSelection.max_tokens_per_step || ''}
                  onChange={(event) => updateSelection({ max_tokens_per_step: event.target.value })}
                  placeholder="6000"
                  style={modalInputStyle}
                />
              </label>
              <label style={{ ...modalLabelStyle, marginTop: 0 }}>
                Máx. custo da run (US$)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={modelSelection.max_estimated_cost_per_run || ''}
                  onChange={(event) => updateSelection({ max_estimated_cost_per_run: event.target.value })}
                  placeholder="opcional"
                  style={modalInputStyle}
                />
              </label>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              <input
                type="checkbox"
                checked={modelSelection.require_confirmation_for_premium !== false}
                onChange={(event) => updateSelection({ require_confirmation_for_premium: event.target.checked })}
              />
              Exigir confirmação para modelos premium
            </label>
            {usesPremiumForWholeRun && modelSelection.require_confirmation_for_premium !== false && (
              <p style={{ margin: '0.75rem 0 0', color: 'var(--warning)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                Este modo pode consumir mais tokens. Confirme antes de executar.
              </p>
            )}
          </section>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1rem' }}>
          <button type="button" onClick={onClose} disabled={running} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'var(--text-primary)', padding: '0.65rem 0.9rem', cursor: running ? 'wait' : 'pointer', fontWeight: 800 }}>
            Cancelar
          </button>
          <button type="button" onClick={onSubmit} disabled={running} className="btn-primary" style={{ padding: '0.65rem 0.95rem' }}>
            {running ? 'Executando...' : 'Confirmar execução'}
          </button>
        </div>
      </section>
    </div>
  );
}

const modalSectionStyle = {
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.025)',
  padding: '0.85rem',
};

const modalLabelStyle = {
  display: 'grid',
  gap: '0.35rem',
  marginTop: '0.75rem',
  color: 'var(--text-secondary)',
  fontSize: '0.78rem',
  fontWeight: 800,
};

const modalInputStyle = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  color: 'var(--text-primary)',
  padding: '0.62rem',
  fontWeight: 700,
};

function StepStatusSummary({ step }) {
  const technicalStatus = getTechnicalStatus(step);
  const quality = getQualityAssessment(step);
  const qualityStatus = quality?.quality_status || 'not_reviewed';
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
      <span style={{ color: technicalStatusColor(technicalStatus), background: 'rgba(255,255,255,0.035)', border: `1px solid ${technicalStatusBorder(technicalStatus)}`, borderRadius: 999, padding: '0.2rem 0.58rem', fontSize: '0.74rem', fontWeight: 800 }}>
        Execução técnica: {technicalStatusLabel(technicalStatus)}
      </span>
      <span style={{ color: qualityStatusColor(qualityStatus), background: 'rgba(255,255,255,0.035)', border: `1px solid ${qualityStatusBorder(qualityStatus)}`, borderRadius: 999, padding: '0.2rem 0.58rem', fontSize: '0.74rem', fontWeight: 800 }}>
        Qualidade: {qualityStatusLabel(qualityStatus)}
      </span>
      {technicalStatus === 'failed' && (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', alignSelf: 'center' }}>
          retry técnico disponível em “Regenerar este agente”
        </span>
      )}
      {['needs_revision', 'risky'].includes(qualityStatus) && (
        <span style={{ color: qualityStatusColor(qualityStatus), fontSize: '0.74rem', alignSelf: 'center', fontWeight: 800 }}>
          regenerar, editar manualmente ou adicionar observação
        </span>
      )}
    </div>
  );
}

function QualityAssessmentPanel({ assessment }) {
  if (!assessment || assessment.quality_status === 'not_reviewed') return null;
  const issues = toArray(assessment.quality_issues);
  return (
    <details
      open={['needs_revision', 'risky', 'rejected'].includes(assessment.quality_status)}
      style={{
        marginTop: '0.65rem',
        border: `1px solid ${qualityStatusBorder(assessment.quality_status)}`,
        borderRadius: 8,
        padding: '0.65rem',
        background: qualityStatusBackground(assessment.quality_status),
      }}
    >
      <summary style={{ cursor: 'pointer', color: qualityStatusColor(assessment.quality_status), fontWeight: 800, fontSize: '0.78rem' }}>
        Qualidade do output: {qualityStatusLabel(assessment.quality_status)}
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.55rem', marginTop: '0.65rem' }}>
        <TechMetric label="Score qualidade" value={scoreLabel(assessment.quality_score)} />
        <TechMetric label="Estratégia" value={scoreLabel(assessment.strategic_alignment_score)} />
        <TechMetric label="Voz" value={scoreLabel(assessment.voice_alignment_score)} />
        <TechMetric label="Visual" value={scoreLabel(assessment.visual_alignment_score)} />
        <TechMetric label="Risco evidência" value={scoreLabel(assessment.evidence_risk_score)} />
        <TechMetric label="Avaliado por" value={assessment.assessed_by} />
      </div>
      {assessment.review_reason && (
        <p style={{ color: 'var(--text-secondary)', margin: '0.65rem 0 0', fontSize: '0.8rem', lineHeight: 1.45 }}>
          {assessment.review_reason}
        </p>
      )}
      {issues.length > 0 && (
        <ul style={{ margin: '0.65rem 0 0', paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.45 }}>
          {issues.map((issue, index) => <li key={index}>{issue}</li>)}
        </ul>
      )}
    </details>
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

function ExecutionProfilePanel({ run, executionPlan, agentFlow }) {
  if (!run) return null;
  const profileId = executionPlan?.profile_id || run.execution_profile_id || 'custom';
  const skipped = toArray(executionPlan?.skipped_agents);
  const gates = toArray(executionPlan?.required_gates);
  return (
    <section style={{ border: '1px solid rgba(56,189,248,0.18)', borderRadius: 8, padding: '0.8rem', marginBottom: '0.85rem', background: 'rgba(56,189,248,0.045)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Perfil de execução</div>
          <strong>{executionProfileLabel(profileId)}</strong>
          {executionPlan?.rationale && (
            <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.45 }}>
              {executionPlan.rationale}
            </p>
          )}
        </div>
        <span style={{ color: 'var(--accent-blue)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 999, padding: '0.22rem 0.58rem', fontSize: '0.74rem', fontWeight: 800 }}>
          {profileId}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginTop: '0.75rem' }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', marginBottom: '0.25rem' }}>Modo IA</div>
          <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            {executionModeLabel(run.execution_mode || run.model_selection_json?.execution_mode)}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', marginBottom: '0.25rem' }}>Sequência</div>
          <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            {agentFlow.map((agent) => agent.label).join(' → ')}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem', marginBottom: '0.25rem' }}>Gates</div>
          <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            {gates.length ? gates.map(formatGateLabel).join(' · ') : 'Sem gates registrados'}
          </div>
        </div>
      </div>
      {skipped.length > 0 && (
        <details style={{ marginTop: '0.7rem' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.78rem' }}>
            Agentes pulados ({skipped.length})
          </summary>
          <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.45 }}>
            {skipped.map((item, index) => (
              <li key={`${item.agent_id}-${index}`}>
                <strong>{labelAgent(item.agent_id)}</strong>: {item.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function TechnicalExecutionPanel({ step }) {
  const meta = step.execution_metadata_json || step.execution_metadata || {};
  const tokens = step.tokens || {
    input: meta.input_tokens,
    output: meta.output_tokens,
    total: meta.total_tokens,
  };
  const isMock = step.is_mock ?? meta.is_mock;
  const modelId = step.model_id || meta.model_id || step.model_used || meta.model;
  const hasMeta = modelId || step.prompt_version || step.provider || step.duration_ms || step.attempt_count || step.cost_estimate || step.error || tokens?.total || isMock !== undefined;
  if (!hasMeta) return null;

  return (
    <details style={{ marginTop: '0.65rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.65rem', background: 'rgba(255,255,255,0.02)' }}>
      <summary style={{ cursor: 'pointer', color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.78rem' }}>
        Metadados técnicos da execução
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.55rem', marginTop: '0.65rem' }}>
        <TechMetric label="Provider" value={step.provider || meta.provider} />
        <TechMetric label="Modelo" value={modelDisplayName(modelId)} />
        <TechMetric label="Mock" value={isMock === undefined ? '' : isMock ? 'sim' : 'não'} />
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

function DeliveryPanel({ latestRun, copyStep, channelStep, visualStep, editorStep, approverStep, generatingImage, generatedImage, generatedImages, onSelectImage, onGenerateImage }) {
  const copy = getStepPayload(copyStep);
  const channel = getStepPayload(channelStep);
  const visual = getStepPayload(visualStep);
  const editor = getStepPayload(editorStep);
  const approver = getStepPayload(approverStep);
  const decision = normalizeDecision(approver.decisao || approver.decision);
  const editorText = extractEditedCopy(editor.versao_editada);
  const channelText = extractChannelAdaptedText(channel);
  const editorVisual = extractEditedVisual(editor.versao_editada);
  const hasGeneratedMaterial = !!(copy.copy_principal || channelText || editorText || visual.direcao_de_arte || editorVisual);

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

      <OutputLine title="Texto final/editado" value={editorText || channelText || copy.copy_principal || copy.legenda} />
      <OutputLine title="Adaptação de canal" value={channelText && channelText !== editorText ? channelText : ''} />
      <OutputLine title="Headline" value={copy.headline} />
      <OutputLine title="CTA" value={channel.cta || copy.cta} />
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
  if (agentId === 'copywriter' || agentId === 'channel_adapter' || agentId === 'editor') {
    return positive ? 'approved_copy' : 'rejected_copy';
  }
  if (agentId === 'visual_director') {
    return positive ? 'approved_visual_direction' : 'rejected_visual_direction';
  }
  if (agentId === 'approver') {
    return positive ? 'campaign_example' : 'negative_example';
  }
  if (agentId === 'brand_compliance') {
    return positive ? 'campaign_example' : 'negative_example';
  }
  return positive ? 'creative_reference' : 'negative_example';
}

function defaultLearningTypeForAgent(agentId, step) {
  const payload = getStepPayload(step);
  const decision = normalizeDecision(payload.decisao || payload.decision);
  if (agentId === 'copywriter') return 'voice_preference';
  if (agentId === 'channel_adapter') return 'channel_rule';
  if (agentId === 'visual_director') return 'visual_preference';
  if (agentId === 'editor') return 'campaign_learning';
  if (agentId === 'brand_compliance') return 'claim_rule';
  if (agentId === 'approver' && decision === 'rejected') return 'claim_rule';
  if (agentId === 'approver' && decision === 'revision_requested') return 'claim_rule';
  return 'campaign_learning';
}

function defaultLearningContent(agentId, step) {
  const payload = getStepPayload(step);
  if (agentId === 'copywriter') return payload.racional_de_tom || payload.copy_principal || payload.cta || '';
  if (agentId === 'channel_adapter') return extractChannelAdaptedText(payload) || payload.cta || '';
  if (agentId === 'visual_director') return payload.direcao_de_arte || payload.composicao || payload.prompt_visual_opcional || '';
  if (agentId === 'editor') return payload.versao_editada || toArray(payload.riscos_de_incoerencia).join('\n') || '';
  if (agentId === 'brand_compliance') {
    return toArray(payload.required_adjustments).join('\n')
      || toArray(payload.violations).map((item) => item?.description || item?.suggested_fix).filter(Boolean).join('\n')
      || toArray(payload.warnings).join('\n')
      || '';
  }
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

function BrandComplianceChecklist({ items }) {
  const list = toArray(items);
  if (!list.length) return null;
  return (
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginBottom: '0.35rem' }}>Checklist de aderência</div>
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        {list.map((item, index) => (
          <div key={`${item?.criterion || 'criterion'}-${index}`} style={{ border: `1px solid ${complianceStatusBorder(item?.status)}`, borderRadius: 8, padding: '0.55rem', background: complianceStatusBackground(item?.status) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <strong>{complianceCriterionLabel(item?.criterion)}</strong>
              <span style={{ color: complianceStatusColor(item?.status), fontSize: '0.78rem', fontWeight: 800 }}>{complianceStatusLabel(item?.status)}</span>
            </div>
            {item?.observation && <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>{formatValue(item.observation)}</div>}
            {item?.required_adjustment && (
              <div style={{ color: 'var(--warning)', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 700 }}>
                Ajuste: {formatValue(item.required_adjustment)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandComplianceViolations({ items }) {
  const list = toArray(items);
  if (!list.length) return null;
  return (
    <div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginBottom: '0.35rem' }}>Violações encontradas</div>
      <div style={{ display: 'grid', gap: '0.4rem' }}>
        {list.map((item, index) => (
          <div key={`${item?.type || 'violation'}-${index}`} style={{ border: `1px solid ${severityBorder(item?.severity)}`, borderRadius: 8, padding: '0.55rem', background: severityBackground(item?.severity) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <strong>{formatValue(item?.type || 'Violação')}</strong>
              <span style={{ color: severityColor(item?.severity), fontSize: '0.78rem', fontWeight: 800 }}>{formatValue(item?.severity || 'medium')}</span>
            </div>
            {item?.description && <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>{formatValue(item.description)}</div>}
            {item?.related_brand_memory_slice && <div style={{ color: 'var(--accent-blue)', fontSize: '0.78rem', marginTop: '0.25rem' }}>Slice: {formatValue(item.related_brand_memory_slice)}</div>}
            {item?.suggested_fix && <div style={{ color: 'var(--warning)', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: 700 }}>Correção: {formatValue(item.suggested_fix)}</div>}
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

function complianceDecisionLabel(decision) {
  const labels = { pass: 'Passou', warning: 'Com ressalvas', fail: 'Falhou' };
  return labels[decision] || 'Com ressalvas';
}

function complianceDecisionColor(decision) {
  if (decision === 'pass') return 'var(--success)';
  if (decision === 'fail') return 'var(--brand-red)';
  return 'var(--warning)';
}

function complianceDecisionBorder(decision) {
  if (decision === 'pass') return 'rgba(16,185,129,0.35)';
  if (decision === 'fail') return 'rgba(239,68,68,0.35)';
  return 'rgba(245,158,11,0.35)';
}

function complianceCriterionLabel(criterion) {
  const labels = {
    strategy: 'Estratégia',
    positioning: 'Posicionamento',
    audience: 'Público',
    voice: 'Tom de voz',
    forbidden_words: 'Palavras proibidas',
    visual_identity: 'Identidade visual',
    communication_plan: 'Plano de comunicação',
    claims: 'Claims',
    channel_fit: 'Aderência ao canal',
    strategic_tensions: 'Tensões estratégicas',
    executional_readiness: 'Prontidão de execução',
  };
  return labels[criterion] || formatValue(criterion || 'Critério');
}

function complianceStatusLabel(status) {
  if (status === 'pass') return 'pass';
  if (status === 'fail') return 'fail';
  return 'warning';
}

function complianceStatusColor(status) {
  if (status === 'pass') return 'var(--success)';
  if (status === 'fail') return 'var(--brand-red)';
  return 'var(--warning)';
}

function complianceStatusBorder(status) {
  if (status === 'pass') return 'rgba(16,185,129,0.24)';
  if (status === 'fail') return 'rgba(239,68,68,0.28)';
  return 'rgba(245,158,11,0.28)';
}

function complianceStatusBackground(status) {
  if (status === 'pass') return 'rgba(16,185,129,0.05)';
  if (status === 'fail') return 'rgba(239,68,68,0.06)';
  return 'rgba(245,158,11,0.06)';
}

function severityColor(severity) {
  if (severity === 'high') return 'var(--brand-red)';
  if (severity === 'low') return 'var(--accent-blue)';
  return 'var(--warning)';
}

function severityBorder(severity) {
  if (severity === 'high') return 'rgba(239,68,68,0.3)';
  if (severity === 'low') return 'rgba(56,189,248,0.24)';
  return 'rgba(245,158,11,0.28)';
}

function severityBackground(severity) {
  if (severity === 'high') return 'rgba(239,68,68,0.06)';
  if (severity === 'low') return 'rgba(56,189,248,0.05)';
  return 'rgba(245,158,11,0.06)';
}

function executionProfileLabel(profileId) {
  const labels = {
    simple_content: 'Conteúdo simples',
    channel_adapted_content: 'Conteúdo adaptado por canal',
    visual_content: 'Conteúdo visual',
    landing_page_copy: 'Copy de landing page',
    campaign_light: 'Campanha leve',
    custom: 'Customizado',
  };
  return labels[profileId] || formatValue(profileId || 'Perfil não registrado');
}

function formatGateLabel(gate) {
  const labels = {
    briefing_approval: 'Briefing aprovado',
    brand_compliance_before_approver: 'Compliance antes do aprovador',
    human_approval_before_publication: 'Aprovação humana',
  };
  return labels[gate] || formatValue(gate);
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
  const relevant = (steps || []).filter((step) => step && getTechnicalStatus(step) !== 'skipped');
  return relevant.reduce((acc, step) => {
    const tokens = step.tokens || {};
    const inputTokens = Number(tokens.input || tokens.input_tokens || 0);
    const outputTokens = Number(tokens.output || tokens.output_tokens || 0);
    const technicalStatus = getTechnicalStatus(step);
    acc.total_steps += 1;
    if (technicalStatus === 'completed') acc.completed_steps += 1;
    if (technicalStatus === 'failed') acc.failed_steps += 1;
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

function getTechnicalStatus(step) {
  if (!step) return 'pending';
  if (step.technical_status) return step.technical_status;
  if (['pending', 'running', 'completed', 'failed', 'cancelled', 'skipped'].includes(step.status)) return step.status;
  if (step.status === 'regenerated') return 'skipped';
  return 'pending';
}

function getQualityAssessment(step) {
  if (!step) return { quality_status: 'not_reviewed', quality_issues: [] };
  const output = step.output || {};
  const data = getStepPayload(step);
  const explicit = step.quality_assessment || output.qualityAssessment || output.quality_assessment || data.quality_assessment;
  if (explicit?.quality_status) return normalizeQualityAssessment(explicit);
  return inferQualityAssessmentFromStep(step, data);
}

function normalizeQualityAssessment(value) {
  return {
    quality_status: normalizeQualityStatus(value.quality_status),
    quality_score: normalizeScore(value.quality_score),
    quality_issues: toArray(value.quality_issues).map(formatValue).filter(Boolean),
    strategic_alignment_score: normalizeScore(value.strategic_alignment_score),
    voice_alignment_score: normalizeScore(value.voice_alignment_score),
    visual_alignment_score: normalizeScore(value.visual_alignment_score),
    evidence_risk_score: normalizeScore(value.evidence_risk_score),
    review_reason: value.review_reason || '',
    assessed_by: value.assessed_by || 'system',
    assessed_at: value.assessed_at || '',
  };
}

function inferQualityAssessmentFromStep(step, data = {}) {
  const technicalStatus = getTechnicalStatus(step);
  if (technicalStatus === 'failed') {
    return { quality_status: 'not_reviewed', quality_issues: ['Execução técnica falhou antes de produzir output revisável.'], assessed_by: 'system' };
  }
  if (step.agent_id === 'editor' && data.score_aderencia !== undefined) {
    const issues = [...toArray(data.riscos_de_incoerencia), ...toArray(data.warnings)].map(formatValue).filter(Boolean);
    const score = normalizeScore(data.score_aderencia);
    const risky = issues.some((item) => /claim|prova|evid[eê]ncia|sustenta|n[uú]mero|garant/i.test(item));
    return {
      quality_status: risky ? 'risky' : score !== undefined && score < 70 ? 'needs_revision' : issues.length ? 'needs_revision' : 'acceptable',
      quality_score: score,
      quality_issues: issues,
      strategic_alignment_score: score,
      evidence_risk_score: risky ? 80 : 20,
      assessed_by: 'system',
    };
  }
  if (step.agent_id === 'approver' && (data.decisao || data.decision)) {
    const decision = normalizeDecision(data.decisao || data.decision);
    const issues = [...toArray(data.ajustes_obrigatorios), ...toArray(data.warnings)].map(formatValue).filter(Boolean);
    return {
      quality_status: decision === 'approved' ? 'acceptable' : decision === 'rejected' ? 'rejected' : 'needs_revision',
      quality_issues: issues,
      review_reason: data.justificativa || data.risco_principal || '',
      assessed_by: 'agent',
    };
  }
  if (step.agent_id === 'brand_compliance' && data.decision) {
    const violations = toArray(data.violations);
    const issues = [
      ...toArray(data.required_adjustments),
      ...toArray(data.warnings),
      ...violations.map((item) => item?.description || item?.suggested_fix),
    ].map(formatValue).filter(Boolean);
    const highSeverity = violations.some((item) => item?.severity === 'high');
    const claimRisk = issues.some((item) => /claim|prova|evid[eê]ncia|sustenta|garant/i.test(item));
    return {
      quality_status: data.decision === 'pass'
        ? 'acceptable'
        : data.decision === 'fail'
          ? (highSeverity ? 'rejected' : 'risky')
          : claimRisk ? 'risky' : 'needs_revision',
      quality_score: normalizeScore(data.overall_brand_alignment_score),
      quality_issues: issues,
      strategic_alignment_score: normalizeScore(data.overall_brand_alignment_score),
      evidence_risk_score: claimRisk ? 85 : 20,
      review_reason: data.decision === 'pass'
        ? 'Brand compliance não encontrou violações relevantes.'
        : 'Brand compliance encontrou warnings, violações ou ajustes obrigatórios.',
      assessed_by: 'agent',
    };
  }
  return { quality_status: 'not_reviewed', quality_issues: [], assessed_by: 'system' };
}

function normalizeQualityStatus(value) {
  return ['not_reviewed', 'acceptable', 'needs_revision', 'rejected', 'risky'].includes(value)
    ? value
    : 'not_reviewed';
}

function normalizeScore(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function technicalStatusLabel(status) {
  return ({
    pending: 'pendente',
    running: 'rodando',
    completed: 'concluída',
    failed: 'falhou',
    cancelled: 'cancelada',
    skipped: 'pulada',
  })[status] || formatValue(status);
}

function qualityStatusLabel(status) {
  return ({
    not_reviewed: 'não revisada',
    acceptable: 'aceitável',
    needs_revision: 'precisa revisão',
    rejected: 'rejeitada',
    risky: 'arriscada',
  })[status] || 'não revisada';
}

function technicalStatusColor(status) {
  if (status === 'completed') return 'var(--success)';
  if (status === 'failed') return 'var(--brand-red)';
  if (status === 'running') return 'var(--accent-blue)';
  return 'var(--text-secondary)';
}

function technicalStatusBorder(status) {
  if (status === 'completed') return 'rgba(16,185,129,0.35)';
  if (status === 'failed') return 'rgba(239,68,68,0.35)';
  if (status === 'running') return 'rgba(56,189,248,0.35)';
  return 'rgba(255,255,255,0.1)';
}

function qualityStatusColor(status) {
  if (status === 'acceptable') return 'var(--success)';
  if (status === 'rejected') return 'var(--brand-red)';
  if (status === 'risky' || status === 'needs_revision') return 'var(--warning)';
  return 'var(--text-secondary)';
}

function qualityStatusBorder(status) {
  if (status === 'acceptable') return 'rgba(16,185,129,0.35)';
  if (status === 'rejected') return 'rgba(239,68,68,0.35)';
  if (status === 'risky' || status === 'needs_revision') return 'rgba(245,158,11,0.35)';
  return 'rgba(255,255,255,0.1)';
}

function qualityStatusBackground(status) {
  if (status === 'acceptable') return 'rgba(16,185,129,0.05)';
  if (status === 'rejected') return 'rgba(239,68,68,0.05)';
  if (status === 'risky' || status === 'needs_revision') return 'rgba(245,158,11,0.055)';
  return 'rgba(255,255,255,0.02)';
}

function scoreLabel(value) {
  const score = normalizeScore(value);
  return score === undefined ? '' : `${score}/100`;
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

function extractChannelAdaptedText(value) {
  const adapted = value?.adapted_content || value;
  if (!adapted || typeof adapted !== 'object') return '';
  const parts = [
    adapted.subject_line ? `Assunto: ${adapted.subject_line}` : '',
    adapted.preview_text ? `Preview: ${adapted.preview_text}` : '',
    adapted.headline ? `Headline: ${adapted.headline}` : '',
    adapted.caption || '',
    adapted.body || '',
    adapted.script || '',
    ...toArray(adapted.slide_sequence).map(formatValue),
    ...toArray(adapted.sections).map(formatValue),
  ];
  return parts.map(formatValue).filter(Boolean).join('\n\n');
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

function defaultModelSelection() {
  const executionMode = process.env.NEXT_PUBLIC_DEFAULT_AI_EXECUTION_MODE
    || (process.env.NODE_ENV === 'production' ? 'use_agent_defaults' : 'mock');
  return {
    execution_mode: executionMode,
    selected_model_id: 'gemini-3-flash-preview',
    agent_overrides: [],
    max_tokens_per_step: 6000,
    max_estimated_cost_per_run: '',
    require_confirmation_for_premium: true,
  };
}

function cleanModelSelection(selection = {}, agentFlow = []) {
  const executionMode = selection.execution_mode || 'mock';
  const allowedAgentIds = new Set((agentFlow || []).map((agent) => agent.id));
  const overrides = (selection.agent_overrides || [])
    .filter((item) => item?.agent_id && item?.model_id && (!allowedAgentIds.size || allowedAgentIds.has(item.agent_id)))
    .map((item) => ({ agent_id: item.agent_id, model_id: item.model_id }));

  const cleaned = {
    execution_mode: executionMode,
    max_tokens_per_step: positiveNumberOrUndefined(selection.max_tokens_per_step),
    max_estimated_cost_per_run: nonNegativeNumberOrUndefined(selection.max_estimated_cost_per_run),
    require_confirmation_for_premium: selection.require_confirmation_for_premium !== false,
  };

  if (executionMode === 'use_single_model_for_run') {
    cleaned.selected_model_id = selection.selected_model_id || 'gemini-3-flash-preview';
  }
  if (executionMode === 'override_single_agent') {
    cleaned.agent_overrides = overrides;
  }
  return cleaned;
}

function positiveNumberOrUndefined(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : undefined;
}

function nonNegativeNumberOrUndefined(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : undefined;
}

function getModel(modelId) {
  return AI_MODELS.find((model) => model.model_id === modelId) || null;
}

function modelDisplayName(modelId) {
  return getModel(modelId)?.display_name || modelId;
}

function isPremiumModel(modelId) {
  return modelId === 'gpt-5.4' || modelId === 'claude-sonnet-4-6';
}

function executionModeLabel(mode) {
  return ({
    mock: 'Simulado sem tokens',
    economical: 'Econômico',
    use_agent_defaults: 'Padrão por agente',
    use_single_model_for_run: 'Modelo único',
    override_single_agent: 'Personalizado por agente',
  })[mode] || 'Não registrado';
}

function humanizeKey(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cloneBriefing(value) {
  if (!value || typeof value !== 'object') return null;
  return JSON.parse(JSON.stringify(value));
}

function setNestedValue(target, path, value) {
  let cursor = target;
  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];
    if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[path[path.length - 1]] = value;
}

function splitLines(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function briefingEquivalent(left, right) {
  return JSON.stringify(left || null) === JSON.stringify(right || null);
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
