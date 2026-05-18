import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../../../../components/Logo';
import { supabase } from '../../../../lib/supabaseClient';

const ITEM_TYPE_LABELS = {
  approved_copy: 'Copy aprovado',
  rejected_copy: 'Copy rejeitado',
  approved_visual_direction: 'Direção visual aprovada',
  rejected_visual_direction: 'Direção visual rejeitada',
  approved_cta: 'CTA aprovado',
  rejected_cta: 'CTA rejeitado',
  visual_prompt: 'Prompt visual',
  creative_reference: 'Referência criativa',
  campaign_example: 'Exemplo de campanha',
  negative_example: 'Exemplo negativo',
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

export default function BrandLibraryPage() {
  const router = useRouter();
  const { id, brand_id: brandId } = router.query;
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filters, setFilters] = useState({
    item_type: '',
    channel: '',
    objective: '',
    status: 'active',
    audience_cluster: '',
    search: '',
  });
  const [targetRequestId, setTargetRequestId] = useState('');
  const [busyItemId, setBusyItemId] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) router.push('/login');
    })();
    return () => { active = false; };
  }, [router]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (brandId) params.set('brand_id', brandId);
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    return params.toString();
  }, [brandId, filters]);

  const loadLibrary = async () => {
    if (!brandId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const [libraryRes, requestsRes] = await Promise.all([
        fetch(`/api/agency/library?${query}`),
        fetch(`/api/agency/requests?brand_id=${brandId}`),
      ]);
      const libraryJson = await libraryRes.json();
      const requestsJson = await requestsRes.json();
      if (!libraryJson.success) throw new Error(libraryJson.error || 'Erro ao carregar Biblioteca');
      if (!requestsJson.success) throw new Error(requestsJson.error || 'Erro ao carregar pedidos');
      setItems(libraryJson.items || []);
      setRequests(requestsJson.requests || []);
      setTargetRequestId((current) => current || requestsJson.requests?.[0]?.id || '');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, [query]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const archiveItem = async (itemId) => {
    if (!window.confirm('Arquivar este item da Biblioteca?')) return;
    setBusyItemId(itemId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/agency/library/${itemId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao arquivar item');
      setSuccessMsg('Item arquivado.');
      await loadLibrary();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBusyItemId('');
    }
  };

  const suggestLearning = async (item) => {
    const learningType = window.prompt('Tipo de aprendizado', inferLearningType(item));
    if (!learningType) return;
    const content = window.prompt('Conteúdo do aprendizado', item.plain_text || item.title || '');
    if (!content) return;
    const rationale = window.prompt('Justificativa', item.notes || `Criado a partir da Biblioteca: ${item.title}`) || '';

    setBusyItemId(item.id);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/agency/learnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLibraryItemId: item.id,
          learningType,
          content,
          rationale,
          confidenceScore: 70,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao criar aprendizado');
      setSuccessMsg('Aprendizado sugerido criado.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBusyItemId('');
    }
  };

  const useAsReference = async (itemId) => {
    if (!targetRequestId) {
      setErrorMsg('Selecione um pedido para receber esta referência.');
      return;
    }
    setBusyItemId(itemId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/agency/library/${itemId}/use-reference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRequestId: targetRequestId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao anexar referência');
      setSuccessMsg('Referência anexada ao pedido.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBusyItemId('');
    }
  };

  return (
    <>
      <Head>
        <title>Espansione | Biblioteca da Marca</title>
      </Head>
      <div className="page-container">
        <main className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link href={`/adm/${id}/agency`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.9rem' }}>
              &larr; Voltar à Agência
            </Link>
            <Logo size="sm" showTagline={false} />
          </div>

          <section className="glass-card outline-glow" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderColor: 'rgba(16,185,129,0.32)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 0.45fr)', gap: '1rem', alignItems: 'end' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                  Agência IA
                </div>
                <h1 style={{ fontSize: '1.65rem', margin: 0 }}>Biblioteca da Marca</h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
                  Repertório de peças, variações, CTAs, prompts e exemplos. Não altera a Brand Memory.
                </p>
                <Link href={`/adm/${id}/agency/learnings?brand_id=${brandId || ''}`} style={{ display: 'inline-block', marginTop: '0.65rem', color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 800 }}>
                  Abrir Aprendizados Sugeridos
                </Link>
              </div>
              <label style={{ display: 'grid', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Usar referência em pedido
                <select className="form-input" value={targetRequestId} onChange={(event) => setTargetRequestId(event.target.value)}>
                  <option value="">Selecionar pedido</option>
                  {requests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {ITEM_REQUEST_LABEL(request)}
                    </option>
                  ))}
                </select>
              </label>
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

          <section className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              <FilterSelect label="Tipo" value={filters.item_type} onChange={(value) => updateFilter('item_type', value)} options={ITEM_TYPE_LABELS} />
              <FilterSelect label="Canal" value={filters.channel} onChange={(value) => updateFilter('channel', value)} options={CHANNEL_LABELS} />
              <FilterSelect label="Objetivo" value={filters.objective} onChange={(value) => updateFilter('objective', value)} options={OBJECTIVE_LABELS} />
              <FilterSelect label="Status" value={filters.status} onChange={(value) => updateFilter('status', value)} options={{ active: 'Ativo', archived: 'Arquivado' }} />
              <label style={{ display: 'grid', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Cluster
                <input className="form-input" value={filters.audience_cluster} onChange={(event) => updateFilter('audience_cluster', event.target.value)} />
              </label>
              <label style={{ display: 'grid', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Texto livre
                <input className="form-input" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} />
              </label>
            </div>
          </section>

          {loading ? (
            <div className="glass-card" style={{ padding: '1.5rem' }}>Carregando Biblioteca...</div>
          ) : items.length === 0 ? (
            <div className="glass-card" style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
              Nenhum item encontrado para os filtros atuais.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {items.map((item) => (
                <article key={item.id} className="glass-card" style={{ padding: '1rem', borderColor: item.item_type?.includes('rejected') || item.item_type === 'negative_example' ? 'rgba(245,158,11,0.28)' : 'rgba(16,185,129,0.22)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ color: 'var(--accent-blue)', fontSize: '0.78rem', fontWeight: 800 }}>
                        {ITEM_TYPE_LABELS[item.item_type] || item.item_type}
                      </div>
                      <h2 style={{ margin: '0.2rem 0 0', fontSize: '1rem' }}>{item.title}</h2>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                        {[CHANNEL_LABELS[item.channel] || item.channel, OBJECTIVE_LABELS[item.objective] || item.objective, item.audience_cluster].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <span style={{ color: item.status === 'active' ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 800 }}>
                      {item.status}
                    </span>
                  </div>

                  {item.plain_text && (
                    <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.84rem', margin: '0.75rem 0 0' }}>
                      {String(item.plain_text).slice(0, 700)}{String(item.plain_text).length > 700 ? '...' : ''}
                    </p>
                  )}
                  {item.notes && (
                    <p style={{ color: 'var(--warning)', fontSize: '0.82rem', margin: '0.75rem 0 0' }}>
                      Notas: {item.notes}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginTop: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => useAsReference(item.id)}
                      disabled={busyItemId === item.id || !targetRequestId}
                      style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 8, color: 'var(--accent-blue)', padding: '0.5rem 0.7rem', cursor: busyItemId === item.id || !targetRequestId ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
                    >
                      {busyItemId === item.id ? 'Aplicando...' : 'Usar como referência'}
                    </button>
                    {item.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => archiveItem(item.id)}
                        disabled={busyItemId === item.id}
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.24)', borderRadius: 8, color: 'var(--brand-red)', padding: '0.5rem 0.7rem', cursor: busyItemId === item.id ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
                      >
                        Arquivar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => suggestLearning(item)}
                      disabled={busyItemId === item.id}
                      style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.24)', borderRadius: 8, color: 'var(--accent-blue)', padding: '0.5rem 0.7rem', cursor: busyItemId === item.id ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
                    >
                      Sugerir aprendizado
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'grid', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
      {label}
      <select className="form-input" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function ITEM_REQUEST_LABEL(request) {
  const type = request.request_type || 'pedido';
  const channel = request.channel ? ` · ${request.channel}` : '';
  return `${type}${channel} · ${String(request.context || '').slice(0, 46)}`;
}

function inferLearningType(item) {
  if (item.item_type?.includes('cta')) return item.item_type?.includes('rejected') ? 'rejected_cta' : 'approved_cta';
  if (item.item_type?.includes('visual')) return item.item_type?.includes('rejected') ? 'visual_rejection' : 'visual_preference';
  if (item.item_type?.includes('rejected') || item.item_type === 'negative_example') return 'claim_rule';
  return 'campaign_learning';
}
