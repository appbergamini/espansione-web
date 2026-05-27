import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../../../components/Logo';
import { supabase } from '../../../lib/supabaseClient';

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

const CHANNELS = Object.keys(CHANNEL_LABELS);
const OBJECTIVES = Object.keys(OBJECTIVE_LABELS);

const EXECUTION_PROFILE_LABELS = {
  auto: 'Automático sugerido',
  simple_content: 'Conteúdo simples',
  channel_adapted_content: 'Adaptado por canal',
  visual_content: 'Conteúdo visual',
  landing_page_copy: 'Landing page',
  campaign_light: 'Campanha leve',
};

const EXECUTION_PROFILE_DESCRIPTIONS = {
  auto: 'A plataforma escolhe o perfil conforme tipo, canal e contexto.',
  simple_content: 'Account, copy, editor, compliance e aprovador.',
  channel_adapted_content: 'Inclui adaptação da copy-mãe para o canal.',
  visual_content: 'Inclui direção visual e suporte para ativos visuais.',
  landing_page_copy: 'Estrutura copy para website/landing page.',
  campaign_light: 'Campanha simples com adaptação, visual, editor, compliance e aprovador.',
};

const CAMPAIGN_PERIOD_LABELS = {
  week: 'por semana',
  month: 'por mês',
};

function makeInitialForm() {
  return {
    request_type: '',
    campaign_mode: 'single_piece',
    execution_profile_id: 'auto',
    channel: 'linkedin',
    objective: 'authority',
    audience_cluster: '',
    offer: '',
    context: '',
    desired_cta: '',
    restrictions: '',
    reference_material: '',
    campaign_title: '',
    campaign_duration_weeks: 4,
    campaign_blueprint_items: [
      { request_type: 'social_post', channel: 'linkedin', quantity_per_period: 1, period: 'week' },
      { request_type: 'social_post', channel: 'instagram', quantity_per_period: 2, period: 'week' },
      { request_type: 'short_video_script', channel: 'instagram', quantity_per_period: 1, period: 'month' },
    ],
  };
}

const CAMPAIGN_CONTEXT_PREFIX = '[Campanha leve / multicanal]';

function isCampaignRequestContext(context) {
  return /campanha|multicanal|multi[-\s]?canal/i.test(String(context || ''));
}

function buildContextForSubmission(form) {
  const context = String(form.context || '').trim();
  if (form.campaign_mode !== 'campaign_light' || isCampaignRequestContext(context)) {
    return context;
  }
  return `${CAMPAIGN_CONTEXT_PREFIX}\n${context}`.trim();
}

export default function AgencyRequestsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [authReady, setAuthReady] = useState(false);
  const [readinessData, setReadinessData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [agencyStats, setAgencyStats] = useState(null);
  const [form, setForm] = useState(makeInitialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingBrandMemory, setLoadingBrandMemory] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) {
        router.push('/login');
        return;
      }
      setAuthReady(true);
    })();
    return () => { active = false; };
  }, [router]);

  const allowedRequestTypes = readinessData?.readiness?.allowedRequestTypes || [];
  const readinessStatus = readinessData?.readiness?.status || 'not_ready';
  const brand = readinessData?.brand || null;
  const audienceOptions = readinessData?.audienceOptions || [];
  const phaseOneStatus = readinessData?.phaseOneStatus || null;

  const canCreate = useMemo(
    () => !!brand && allowedRequestTypes.length > 0 && readinessStatus !== 'not_ready',
    [brand, allowedRequestTypes.length, readinessStatus]
  );

  const loadAgencyData = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const [readinessRes, requestsRes] = await Promise.all([
        fetch(`/api/agency/readiness?projeto_id=${id}`),
        fetch(`/api/agency/requests?projeto_id=${id}`),
      ]);
      const readinessJson = await readinessRes.json();
      const requestsJson = await requestsRes.json();

      if (!readinessJson.success) throw new Error(readinessJson.error || 'Erro ao carregar prontidão');
      if (!requestsJson.success) throw new Error(requestsJson.error || 'Erro ao carregar pedidos');

      setReadinessData(readinessJson);
      setRequests(requestsJson.requests || []);
      setAgencyStats(readinessJson.brand?.id ? await loadAgencyStats(readinessJson.brand.id) : null);
      const firstAllowed = readinessJson.readiness?.allowedRequestTypes?.[0] || '';
      setForm((current) => ({
        ...current,
        request_type: current.request_type || firstAllowed,
      }));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authReady) loadAgencyData();
  }, [authReady, id]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateCampaignItem = (index, patch) => {
    setForm((current) => ({
      ...current,
      campaign_blueprint_items: current.campaign_blueprint_items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, ...patch } : item
      )),
    }));
  };

  const addCampaignItem = () => {
    setForm((current) => ({
      ...current,
      campaign_blueprint_items: [
        ...current.campaign_blueprint_items,
        { request_type: 'social_post', channel: 'linkedin', quantity_per_period: 1, period: 'week' },
      ],
    }));
  };

  const removeCampaignItem = (index) => {
    setForm((current) => ({
      ...current,
      campaign_blueprint_items: current.campaign_blueprint_items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const isProgrammedCampaign = form.campaign_mode === 'campaign_programmed';
      const context = buildContextForSubmission(form);
      const executionProfileId = isProgrammedCampaign
        ? 'campaign_light'
        : form.execution_profile_id === 'auto'
          ? null
          : form.execution_profile_id;
      const body = {
        ...form,
        context,
        execution_profile_id: executionProfileId,
        projeto_id: id,
        brand_id: brand?.id,
      };
      if (isProgrammedCampaign) {
        body.campaign_blueprint = {
          duration_weeks: Number(form.campaign_duration_weeks || 4),
          items: form.campaign_blueprint_items,
        };
      }
      const res = await fetch('/api/agency/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao criar pedido');
      setSuccessMsg(isProgrammedCampaign
        ? `Campanha criada com ${json.created_count || 0} pedidos.`
        : 'Pedido criado.');
      setForm({ ...makeInitialForm(), request_type: allowedRequestTypes[0] || '' });
      await loadAgencyData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadBrandMemory = async () => {
    setLoadingBrandMemory(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/brand-memory/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetoId: id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao carregar Brand Memory');
      setSuccessMsg('Brand Memory carregada. A Agência IA já pode receber pedidos.');
      await loadAgencyData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingBrandMemory(false);
    }
  };

  return (
    <>
      <Head>
        <title>Espansione | Agência IA</title>
      </Head>
      <div className="page-container">
        <main className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link href={`/adm/${id}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.9rem' }}>
              &larr; Voltar ao projeto
            </Link>
            <Logo size="sm" showTagline={false} />
          </div>

          <section className="glass-card outline-glow" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderColor: 'rgba(56,189,248,0.32)', background: 'rgba(56,189,248,0.045)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                  Fase 2
                </div>
                <h1 style={{ fontSize: '1.65rem', margin: 0 }}>Agência IA</h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
                  Pedido estruturado primeiro. Execução dos agentes depois, dentro de cada pedido.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem' }}>
                {[
                  ['1', 'Brand Memory', readinessStatus === 'ready_for_campaigns' || readinessStatus === 'ready_for_content' ? 'ok' : 'pendente'],
                  ['2', 'Pedido', canCreate ? 'liberado' : 'bloqueado'],
                  ['3', 'Agentes', requests.length > 0 ? 'abrir pedido' : 'aguardando'],
                ].map(([num, label, status]) => (
                  <div key={label} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.65rem', background: 'rgba(255,255,255,0.035)' }}>
                    <div style={{ color: 'var(--accent-blue)', fontWeight: 800, fontSize: '0.75rem' }}>0{num}</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.82rem', marginTop: '0.15rem' }}>{label}</div>
                    <div style={{ color: status === 'ok' || status === 'liberado' ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.74rem', marginTop: '0.2rem' }}>{status}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {errorMsg && (
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.35)', color: 'var(--brand-red)' }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', borderColor: 'rgba(34,197,94,0.35)', color: 'var(--success)' }}>
              {successMsg}
            </div>
          )}

          {brand?.id && (
            <section className="agency-module-grid" style={{ marginBottom: '1.25rem' }}>
              <ModuleCard
                href={`/adm/${id}/agency/brand-book?brand_id=${brand.id}`}
                title="Brand Book"
                value={agencyStats?.brandBook || 0}
                subtitle="logos, cores, fontes e regras"
                tone="success"
              />
              <ModuleCard
                href={`/adm/${id}/agency/brand-memory?brand_id=${brand.id}`}
                title="Brand Memory"
                value={agencyStats?.brandMemoryVersions || 0}
                subtitle={agencyStats?.activeBrandMemoryVersion ? `ativa v${agencyStats.activeBrandMemoryVersion}` : 'sem versão ativa'}
                tone="blue"
              />
              <ModuleCard
                href={`/adm/${id}/agency/assets?brand_id=${brand.id}`}
                title="Ativos Visuais"
                value={agencyStats?.assets || 0}
                subtitle="imagens, prompts e referências"
                tone="blue"
              />
              <ModuleCard
                href={`/adm/${id}/agency/library?brand_id=${brand.id}`}
                title="Biblioteca"
                value={agencyStats?.library || 0}
                subtitle="exemplos e repertório"
                tone="success"
              />
              <ModuleCard
                href={`/adm/${id}/agency/learnings?brand_id=${brand.id}`}
                title="Aprendizados"
                value={agencyStats?.learnings || 0}
                subtitle="sugestões pendentes"
                tone="warning"
              />
              <ModuleCard
                href={`/adm/${id}/agency/signals?brand_id=${brand.id}`}
                title="Sinais"
                value={agencyStats?.signals || 0}
                subtitle="lacunas abertas por slice"
                tone="warning"
              />
            </section>
          )}

          {loading ? (
            <div className="glass-card" style={{ padding: '1.5rem' }}>Carregando...</div>
          ) : (
            <div className="agency-workspace">
              <section className="glass-card agency-panel" style={{ padding: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', marginTop: 0 }}>1. Novo pedido</h2>

                <div style={{ padding: '0.85rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Marca</div>
                  <div style={{ fontWeight: 700 }}>{brand?.name || 'Brand Memory não carregada'}</div>
                  <div style={{ fontSize: '0.8rem', color: readinessStatus === 'not_ready' ? 'var(--brand-red)' : readinessStatus === 'partial_ready' ? 'var(--warning)' : 'var(--success)', marginTop: '0.35rem', fontWeight: 700 }}>
                    Status: {readinessStatus}
                  </div>
                  {readinessData?.readiness?.warnings?.length > 0 && (
                    <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1.1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {readinessData.readiness.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                    </ul>
                  )}
                </div>

                {!canCreate ? (
                  <div style={{ display: 'grid', gap: '0.85rem' }}>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                      A Agência ainda não pode receber pedidos para esta marca. Carregue a Brand Memory com os slices críticos da Fase 1 antes de seguir.
                    </p>

                    {phaseOneStatus && (
                      <div style={{ padding: '0.85rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontWeight: 700, marginBottom: '0.45rem' }}>Diagnóstico da Fase 1</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '0.45rem' }}>
                          Agentes críticos encontrados: {phaseOneStatus.criticalAgentsFound?.map((item) => item.agent).join(', ') || 'nenhum'}
                        </div>
                        {phaseOneStatus.missingCriticalAgents?.length > 0 && (
                          <ul style={{ margin: '0.45rem 0', paddingLeft: '1.1rem', color: 'var(--brand-red)', fontSize: '0.84rem' }}>
                            {phaseOneStatus.missingCriticalAgents.map((item) => (
                              <li key={item.agent}>{item.label}</li>
                            ))}
                          </ul>
                        )}
                        <div style={{ color: phaseOneStatus.hasAgent16 ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.84rem' }}>
                          Agente 16: {phaseOneStatus.hasAgent16 ? 'encontrado' : 'não encontrado'}
                        </div>
                        <div style={{ color: phaseOneStatus.agent16HasExport ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.84rem' }}>
                          Export Brand Memory: {phaseOneStatus.agent16HasExport ? 'encontrado' : 'não encontrado'}
                        </div>
                        <div style={{ color: 'var(--accent-blue)', fontSize: '0.84rem', marginTop: '0.55rem', fontWeight: 700 }}>
                          Próximo passo: {phaseOneStatus.nextStep}
                        </div>
                        {phaseOneStatus.canLoadBrandMemory ? (
                          <button
                            type="button"
                            onClick={handleLoadBrandMemory}
                            disabled={loadingBrandMemory}
                            style={{ display: 'inline-block', marginTop: '0.7rem', background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.45)', borderRadius: '8px', color: 'var(--success)', fontSize: '0.84rem', fontWeight: 800, padding: '0.5rem 0.75rem', cursor: loadingBrandMemory ? 'wait' : 'pointer' }}
                          >
                            {loadingBrandMemory ? 'Carregando...' : 'Carregar Brand Memory'}
                          </button>
                        ) : (
                          <Link href={`/adm/${id}`} style={{ display: 'inline-block', marginTop: '0.7rem', color: 'var(--accent-blue)', fontSize: '0.84rem', fontWeight: 800, textDecoration: 'none' }}>
                            Voltar ao fluxo da Fase 1
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <form className="agency-form" onSubmit={handleSubmit}>
                    <Field label="Tipo de entrega">
                      <select className="form-input" value={form.request_type} onChange={e => handleChange('request_type', e.target.value)} required>
                        {allowedRequestTypes.map((type) => (
                          <option key={type} value={type}>{REQUEST_TYPE_LABELS[type] || type}</option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Escopo">
                      <div className="agency-segmented-control" role="group" aria-label="Escopo do pedido">
                        <button
                          type="button"
                          className={form.campaign_mode === 'single_piece' ? 'active' : ''}
                          onClick={() => setForm((current) => ({ ...current, campaign_mode: 'single_piece', execution_profile_id: current.execution_profile_id === 'campaign_light' ? 'auto' : current.execution_profile_id }))}
                        >
                          Peça avulsa
                        </button>
                        <button
                          type="button"
                          className={form.campaign_mode === 'campaign_light' ? 'active' : ''}
                          onClick={() => setForm((current) => ({ ...current, campaign_mode: 'campaign_light', execution_profile_id: 'campaign_light' }))}
                        >
                          Peça com desdobramento
                        </button>
                        <button
                          type="button"
                          className={form.campaign_mode === 'campaign_programmed' ? 'active' : ''}
                          onClick={() => setForm((current) => ({ ...current, campaign_mode: 'campaign_programmed', execution_profile_id: 'campaign_light' }))}
                        >
                          Campanha programada
                        </button>
                      </div>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {form.campaign_mode === 'campaign_programmed'
                          ? 'Cria uma série de pedidos a partir de duração e cadência por canal.'
                          : form.campaign_mode === 'campaign_light'
                            ? 'Usa fluxo mais robusto para uma peça com adaptação por canal, direção visual, editor, compliance e aprovador.'
                            : 'Cria um pedido único, com perfil automático ou manual.'}
                      </span>
                    </Field>

                    {form.campaign_mode === 'campaign_programmed' && (
                      <div style={{ display: 'grid', gap: '0.85rem', padding: '0.9rem', border: '1px solid rgba(16,185,129,0.22)', borderRadius: 8, background: 'rgba(16,185,129,0.05)' }}>
                        <div style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.84rem' }}>Plano da campanha</div>
                        <div className="agency-form-row">
                          <Field label="Nome da campanha">
                            <input className="form-input" value={form.campaign_title} onChange={e => handleChange('campaign_title', e.target.value)} placeholder="Ex.: Junho - geração de leads" />
                          </Field>
                          <Field label="Duração (semanas)">
                            <input className="form-input" type="number" min="1" max="52" value={form.campaign_duration_weeks} onChange={e => handleChange('campaign_duration_weeks', e.target.value)} />
                          </Field>
                        </div>

                        <div style={{ display: 'grid', gap: '0.65rem' }}>
                          {form.campaign_blueprint_items.map((item, index) => (
                            <div key={`${index}-${item.channel}-${item.request_type}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.1fr) 110px 120px auto', gap: '0.55rem', alignItems: 'end' }}>
                              <Field label="Tipo">
                                <select className="form-input" value={item.request_type} onChange={e => updateCampaignItem(index, { request_type: e.target.value })}>
                                  {allowedRequestTypes.map((type) => (
                                    <option key={type} value={type}>{REQUEST_TYPE_LABELS[type] || type}</option>
                                  ))}
                                </select>
                              </Field>
                              <Field label="Canal">
                                <select className="form-input" value={item.channel} onChange={e => updateCampaignItem(index, { channel: e.target.value })}>
                                  {CHANNELS.map((channel) => <option key={channel} value={channel}>{CHANNEL_LABELS[channel]}</option>)}
                                </select>
                              </Field>
                              <Field label="Qtd.">
                                <input className="form-input" type="number" min="0" max="31" value={item.quantity_per_period} onChange={e => updateCampaignItem(index, { quantity_per_period: e.target.value })} />
                              </Field>
                              <Field label="Periodicidade">
                                <select className="form-input" value={item.period} onChange={e => updateCampaignItem(index, { period: e.target.value })}>
                                  {Object.entries(CAMPAIGN_PERIOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                </select>
                              </Field>
                              <button
                                type="button"
                                onClick={() => removeCampaignItem(index)}
                                disabled={form.campaign_blueprint_items.length <= 1}
                                style={{ height: 42, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.24)', borderRadius: 8, color: 'var(--brand-red)', cursor: form.campaign_blueprint_items.length <= 1 ? 'not-allowed' : 'pointer', fontWeight: 800, padding: '0 0.8rem' }}
                              >
                                Remover
                              </button>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', justifyContent: 'space-between' }}>
                          <button
                            type="button"
                            onClick={addCampaignItem}
                            style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.28)', borderRadius: 8, color: 'var(--accent-blue)', fontWeight: 800, padding: '0.55rem 0.8rem', cursor: 'pointer' }}
                          >
                            Adicionar linha de cadência
                          </button>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                            Total previsto: {countCampaignPlannedItems(form)} pedidos
                          </span>
                        </div>
                      </div>
                    )}

                    <Field label="Perfil de execução">
                      <select className="form-input" value={form.execution_profile_id} onChange={e => handleChange('execution_profile_id', e.target.value)} disabled={form.campaign_mode === 'campaign_programmed'}>
                        {Object.entries(EXECUTION_PROFILE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {EXECUTION_PROFILE_DESCRIPTIONS[form.execution_profile_id] || EXECUTION_PROFILE_DESCRIPTIONS.auto}
                      </span>
                    </Field>

                    <div className="agency-form-row">
                      <Field label="Canal">
                        <select className="form-input" value={form.channel} onChange={e => handleChange('channel', e.target.value)} required>
                          {CHANNELS.map((channel) => <option key={channel} value={channel}>{CHANNEL_LABELS[channel]}</option>)}
                        </select>
                      </Field>
                      <Field label="Objetivo">
                        <select className="form-input" value={form.objective} onChange={e => handleChange('objective', e.target.value)} required>
                          {OBJECTIVES.map((objective) => <option key={objective} value={objective}>{OBJECTIVE_LABELS[objective]}</option>)}
                        </select>
                      </Field>
                    </div>

                    <Field label="Público/cluster">
                      {audienceOptions.length > 0 ? (
                        <>
                          <select className="form-input" value={form.audience_cluster} onChange={e => handleChange('audience_cluster', e.target.value)}>
                            <option value="">Selecionar ou preencher abaixo</option>
                            {audienceOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                          <input className="form-input" style={{ marginTop: '0.5rem' }} value={form.audience_cluster} onChange={e => handleChange('audience_cluster', e.target.value)} placeholder="Ou descreva livremente" />
                        </>
                      ) : (
                        <input className="form-input" value={form.audience_cluster} onChange={e => handleChange('audience_cluster', e.target.value)} placeholder="Descreva o público" />
                      )}
                    </Field>

                    <Field label="Oferta/produto/serviço">
                      <input className="form-input" value={form.offer} onChange={e => handleChange('offer', e.target.value)} />
                    </Field>

                    <Field label="Contexto">
                      <textarea className="form-input" rows={4} value={form.context} onChange={e => handleChange('context', e.target.value)} required />
                    </Field>

                    <Field label="CTA desejado">
                      <input className="form-input" value={form.desired_cta} onChange={e => handleChange('desired_cta', e.target.value)} />
                    </Field>

                    <Field label="Restrições">
                      <textarea className="form-input" rows={3} value={form.restrictions} onChange={e => handleChange('restrictions', e.target.value)} placeholder="Uma por linha" />
                    </Field>

                    <Field label="Material de referência">
                      <textarea className="form-input" rows={3} value={form.reference_material} onChange={e => handleChange('reference_material', e.target.value)} placeholder="Links, observações ou materiais, um por linha" />
                    </Field>

                    <button className="btn-primary" type="submit" disabled={saving} style={{ padding: '0.75rem 1rem' }}>
                      {saving ? 'Criando...' : 'Criar pedido'}
                    </button>
                  </form>
                )}
              </section>

              <section className="glass-card agency-panel" style={{ padding: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', marginTop: 0 }}>2. Pedidos</h2>
                {requests.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>{canCreate ? 'Crie o primeiro pedido à esquerda.' : 'Assim que a marca estiver pronta, os pedidos criados aparecerão aqui.'}</p>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {requests.map((request) => (
                      <Link key={request.id} href={`/adm/${id}/agency/${request.id}`} style={{ textDecoration: 'none' }}>
                        <article className="agency-request-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                            <strong>{REQUEST_TYPE_LABELS[request.request_type] || request.request_type}</strong>
                            <span style={{ color: 'var(--accent-blue)', fontSize: '0.78rem' }}>{request.status}</span>
                          </div>
                          {request.campaign_group_id && (
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.45rem' }}>
                              {request.campaign_title || 'Campanha programada'}
                              {request.campaign_wave_label ? ` · ${request.campaign_wave_label}` : ''}
                              {Number.isFinite(Number(request.campaign_item_order)) ? ` · item ${request.campaign_item_order}` : ''}
                            </div>
                          )}
                          {isCampaignRequestContext(request.context) && (
                            <div style={{ display: 'inline-flex', marginTop: '0.45rem', border: '1px solid rgba(16,185,129,0.28)', borderRadius: 999, padding: '0.16rem 0.5rem', color: 'var(--success)', fontSize: '0.72rem', fontWeight: 800 }}>
                              Campanha leve
                            </div>
                          )}
                          {request.campaign_group_id && (
                            <div style={{ display: 'inline-flex', marginTop: '0.45rem', marginLeft: '0.35rem', border: '1px solid rgba(56,189,248,0.28)', borderRadius: 999, padding: '0.16rem 0.5rem', color: 'var(--accent-blue)', fontSize: '0.72rem', fontWeight: 800 }}>
                              Campanha programada
                            </div>
                          )}
                          {request.execution_profile_id && (
                            <div style={{ display: 'inline-flex', marginTop: '0.45rem', marginLeft: isCampaignRequestContext(request.context) ? '0.35rem' : 0, border: '1px solid rgba(56,189,248,0.28)', borderRadius: 999, padding: '0.16rem 0.5rem', color: 'var(--accent-blue)', fontSize: '0.72rem', fontWeight: 800 }}>
                              {EXECUTION_PROFILE_LABELS[request.execution_profile_id] || request.execution_profile_id}
                            </div>
                          )}
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.35rem' }}>
                            {CHANNEL_LABELS[request.channel] || request.channel} · {OBJECTIVE_LABELS[request.objective] || request.objective}
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 0 }}>
                            {String(request.context || '').slice(0, 130)}{String(request.context || '').length > 130 ? '...' : ''}
                          </p>
                        </article>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
          <style jsx>{`
            .agency-workspace {
              display: grid;
              grid-template-columns: minmax(0, 1fr) minmax(320px, 0.9fr);
              gap: 1.25rem;
              align-items: start;
              width: 100%;
            }

            .agency-module-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
              gap: 0.75rem;
            }

            .agency-panel {
              min-width: 0;
              overflow: hidden;
            }

            .agency-form {
              display: grid;
              gap: 0.85rem;
              min-width: 0;
              width: 100%;
            }

            .agency-form-row {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 0.85rem;
              min-width: 0;
            }

            .agency-request-card {
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 8px;
              padding: 0.85rem;
              color: var(--text-primary);
              min-width: 0;
              overflow: hidden;
            }

            .agency-segmented-control {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 0.4rem;
              padding: 0.3rem;
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 8px;
              background: rgba(255, 255, 255, 0.025);
            }

            .agency-segmented-control button {
              border: 1px solid transparent;
              border-radius: 6px;
              padding: 0.5rem 0.65rem;
              color: var(--text-secondary);
              background: transparent;
              cursor: pointer;
              font-weight: 800;
              font-size: 0.8rem;
            }

            .agency-segmented-control button.active {
              color: var(--success);
              border-color: rgba(16, 185, 129, 0.35);
              background: rgba(16, 185, 129, 0.12);
            }

            :global(.agency-field) {
              display: grid;
              gap: 0.35rem;
              min-width: 0;
              width: 100%;
              font-size: 0.85rem;
              color: var(--text-secondary);
            }

            :global(.agency-field .form-input) {
              display: block;
              width: 100%;
              max-width: 100%;
              min-width: 0;
            }

            :global(.agency-field textarea.form-input) {
              resize: vertical;
            }

            @media (max-width: 900px) {
              .agency-workspace {
                grid-template-columns: 1fr;
              }
            }

            @media (max-width: 640px) {
              .agency-form-row {
                grid-template-columns: 1fr;
              }

              .agency-segmented-control {
                grid-template-columns: 1fr;
              }
            }
          `}</style>
        </main>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="agency-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ModuleCard({ href, title, value, subtitle, tone }) {
  const color = tone === 'success'
    ? 'var(--success)'
    : tone === 'warning'
      ? 'var(--warning)'
      : 'var(--accent-blue)';
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <article className="glass-card" style={{ padding: '0.9rem', minHeight: 112, borderColor: 'rgba(255,255,255,0.08)', display: 'grid', alignContent: 'space-between' }}>
        <div>
          <div style={{ color, fontSize: '1.2rem', fontWeight: 900 }}>{value}</div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '0.92rem', marginTop: '0.15rem' }}>{title}</div>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', lineHeight: 1.35 }}>{subtitle}</div>
      </article>
    </Link>
  );
}

function countCampaignPlannedItems(form) {
  const durationWeeks = Math.max(1, Number(form?.campaign_duration_weeks || 0));
  return (form?.campaign_blueprint_items || []).reduce((sum, item) => {
    const quantity = Math.max(0, Number(item?.quantity_per_period || 0));
    if (item?.period === 'month') return sum + quantity;
    return sum + (quantity * durationWeeks);
  }, 0);
}

async function loadAgencyStats(brandId) {
  const empty = {
    library: 0,
    learnings: 0,
    signals: 0,
    assets: 0,
    brandBook: 0,
    brandMemoryVersions: 0,
    activeBrandMemoryVersion: null,
  };
  if (!brandId) return empty;

  const urls = {
    library: `/api/agency/library?brand_id=${brandId}&status=active`,
    learnings: `/api/agency/learnings?brand_id=${brandId}&status=suggested`,
    signals: `/api/agency/signals?brand_id=${brandId}&status=open`,
    assets: `/api/agency/assets?brand_id=${brandId}`,
    brandBook: `/api/agency/brand-book?brand_id=${brandId}`,
    versions: `/api/agency/brand-memory-versions?brand_id=${brandId}`,
  };

  const entries = await Promise.all(Object.entries(urls).map(async ([key, url]) => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      return [key, json.success ? json : null];
    } catch {
      return [key, null];
    }
  }));
  const data = Object.fromEntries(entries);

  return {
    library: data.library?.items?.length || 0,
    learnings: data.learnings?.suggestions?.length || 0,
    signals: data.signals?.signals?.length || 0,
    assets: data.assets?.assets?.length || 0,
    brandBook: data.brandBook?.summary?.total || data.brandBook?.items?.length || 0,
    brandMemoryVersions: data.versions?.versions?.length || 0,
    activeBrandMemoryVersion: data.versions?.activeVersion?.version_number || null,
  };
}

