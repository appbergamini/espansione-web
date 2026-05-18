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

const initialForm = {
  request_type: '',
  channel: 'linkedin',
  objective: 'authority',
  audience_cluster: '',
  offer: '',
  context: '',
  desired_cta: '',
  restrictions: '',
  reference_material: '',
};

export default function AgencyRequestsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [authReady, setAuthReady] = useState(false);
  const [readinessData, setReadinessData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/agency/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, projeto_id: id, brand_id: brand?.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao criar pedido');
      setSuccessMsg('Pedido criado.');
      setForm({ ...initialForm, request_type: allowedRequestTypes[0] || '' });
      await loadAgencyData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
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

          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Agência IA</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: '1.5rem' }}>
            Pedidos estruturados de marketing usando a Brand Memory como fonte canônica.
          </p>

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

          {loading ? (
            <div className="glass-card" style={{ padding: '1.5rem' }}>Carregando...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.8fr)', gap: '1.25rem', alignItems: 'start' }}>
              <section className="glass-card" style={{ padding: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Novo Pedido</h2>

                <div style={{ padding: '0.85rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Marca</div>
                  <div style={{ fontWeight: 700 }}>{brand?.name || 'Brand Memory não carregada'}</div>
                  <div style={{ fontSize: '0.8rem', color: readinessStatus === 'not_ready' ? 'var(--brand-red)' : 'var(--accent-blue)', marginTop: '0.35rem' }}>
                    Status: {readinessStatus}
                  </div>
                  {readinessData?.readiness?.warnings?.length > 0 && (
                    <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1.1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {readinessData.readiness.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                    </ul>
                  )}
                </div>

                {!canCreate ? (
                  <p style={{ color: 'var(--text-secondary)' }}>
                    A Agência ainda não pode receber pedidos para esta marca. Carregue a Brand Memory com os slices críticos da Fase 1 antes de seguir.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.85rem' }}>
                    <Field label="Tipo de entrega">
                      <select className="form-input" value={form.request_type} onChange={e => handleChange('request_type', e.target.value)} required>
                        {allowedRequestTypes.map((type) => (
                          <option key={type} value={type}>{REQUEST_TYPE_LABELS[type] || type}</option>
                        ))}
                      </select>
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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

              <section className="glass-card" style={{ padding: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Pedidos</h2>
                {requests.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>Nenhum pedido criado ainda.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {requests.map((request) => (
                      <Link key={request.id} href={`/adm/${id}/agency/${request.id}`} style={{ textDecoration: 'none' }}>
                        <article style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.85rem', color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                            <strong>{REQUEST_TYPE_LABELS[request.request_type] || request.request_type}</strong>
                            <span style={{ color: 'var(--accent-blue)', fontSize: '0.78rem' }}>{request.status}</span>
                          </div>
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
        </main>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

