import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../../../../components/Logo';
import { supabase } from '../../../../lib/supabaseClient';

const LEARNING_TYPE_LABELS = {
  voice_preference: 'Preferência de voz',
  forbidden_language: 'Linguagem proibida',
  approved_cta: 'CTA aprovado',
  rejected_cta: 'CTA rejeitado',
  audience_insight: 'Insight de audiência',
  visual_preference: 'Preferência visual',
  visual_rejection: 'Rejeição visual',
  claim_rule: 'Regra de claim',
  channel_rule: 'Regra de canal',
  campaign_learning: 'Aprendizado de campanha',
};

const STATUS_LABELS = {
  suggested: 'Sugerido',
  approved_for_memory: 'Aprovado para memória futura',
  rejected: 'Rejeitado',
  archived: 'Arquivado',
};

const initialForm = {
  learningType: 'campaign_learning',
  content: '',
  rationale: '',
  confidenceScore: 70,
};

export default function BrandLearningSuggestionsPage() {
  const router = useRouter();
  const { id, brand_id: brandId } = router.query;
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({ learning_type: '', status: 'suggested', search: '' });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const loadSuggestions = async () => {
    if (!brandId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/learnings?${query}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao carregar aprendizados');
      setSuggestions(json.suggestions || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [query]);

  const createSuggestion = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/agency/learnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, brandId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao criar aprendizado');
      setSuccessMsg('Sugestão criada.');
      setForm(initialForm);
      await loadSuggestions();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const mutateSuggestion = async (suggestion, action) => {
    let reason = '';
    if (action === 'reject') {
      reason = window.prompt('Motivo da rejeição', '') || '';
      if (!reason.trim()) return;
    }

    setBusyId(suggestion.id);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/agency/learnings/${suggestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao atualizar aprendizado');
      setSuccessMsg(action === 'approve'
        ? 'Aprendizado aprovado para memória futura. Brand Memory não foi alterada.'
        : 'Aprendizado atualizado.');
      await loadSuggestions();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setBusyId('');
    }
  };

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <>
      <Head>
        <title>Espansione | Aprendizados Sugeridos</title>
      </Head>
      <div className="page-container">
        <main className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link href={`/adm/${id}/agency`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.9rem' }}>
              &larr; Voltar à Agência
            </Link>
            <Logo size="sm" showTagline={false} />
          </div>

          <section className="glass-card outline-glow" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderColor: 'rgba(56,189,248,0.32)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 0.32fr)', gap: '1rem', alignItems: 'end' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                  Agência IA
                </div>
                <h1 style={{ fontSize: '1.65rem', margin: 0 }}>Aprendizados Sugeridos</h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
                  Fila humana para aprovar aprendizados futuros. Aprovar aqui não altera a Brand Memory.
                </p>
              </div>
              <Link href={`/adm/${id}/agency/library?brand_id=${brandId || ''}`} style={{ color: 'var(--success)', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 800 }}>
                Biblioteca da Marca
              </Link>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.8fr) minmax(340px, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
            <section className="glass-card" style={{ padding: '1rem' }}>
              <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Criar manualmente</h2>
              <form onSubmit={createSuggestion} style={{ display: 'grid', gap: '0.75rem' }}>
                <Field label="Tipo">
                  <select className="form-input" value={form.learningType} onChange={(event) => updateForm('learningType', event.target.value)}>
                    {Object.entries(LEARNING_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </Field>
                <Field label="Conteúdo">
                  <textarea className="form-input" rows={5} value={form.content} onChange={(event) => updateForm('content', event.target.value)} required />
                </Field>
                <Field label="Justificativa">
                  <textarea className="form-input" rows={3} value={form.rationale} onChange={(event) => updateForm('rationale', event.target.value)} />
                </Field>
                <Field label="Confiança">
                  <input className="form-input" type="number" min="0" max="100" value={form.confidenceScore} onChange={(event) => updateForm('confidenceScore', event.target.value)} />
                </Field>
                <button className="btn-primary" type="submit" disabled={saving || !brandId} style={{ padding: '0.7rem 0.9rem' }}>
                  {saving ? 'Criando...' : 'Criar sugestão'}
                </button>
              </form>
            </section>

            <section>
              <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                  <FilterSelect label="Tipo" value={filters.learning_type} onChange={(value) => updateFilter('learning_type', value)} options={LEARNING_TYPE_LABELS} />
                  <FilterSelect label="Status" value={filters.status} onChange={(value) => updateFilter('status', value)} options={STATUS_LABELS} />
                  <Field label="Busca">
                    <input className="form-input" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} />
                  </Field>
                </div>
              </div>

              {loading ? (
                <div className="glass-card" style={{ padding: '1.5rem' }}>Carregando aprendizados...</div>
              ) : suggestions.length === 0 ? (
                <div className="glass-card" style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
                  Nenhuma sugestão encontrada.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {suggestions.map((suggestion) => (
                    <article key={suggestion.id} className="glass-card" style={{ padding: '1rem', borderColor: suggestion.status === 'approved_for_memory' ? 'rgba(16,185,129,0.28)' : suggestion.status === 'rejected' ? 'rgba(239,68,68,0.28)' : 'rgba(56,189,248,0.18)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ color: 'var(--accent-blue)', fontSize: '0.78rem', fontWeight: 800 }}>
                            {LEARNING_TYPE_LABELS[suggestion.learning_type] || suggestion.learning_type}
                          </div>
                          <h2 style={{ margin: '0.25rem 0 0', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{suggestion.content}</h2>
                          {suggestion.rationale && (
                            <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.84rem', margin: '0.55rem 0 0' }}>
                              {suggestion.rationale}
                            </p>
                          )}
                        </div>
                        <span style={{ color: statusColor(suggestion.status), fontSize: '0.78rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                          {STATUS_LABELS[suggestion.status] || suggestion.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.6rem' }}>
                        Confiança: {suggestion.confidence_score ?? '-'} · Origem: {originLabel(suggestion)}
                      </div>
                      {suggestion.rejected_reason && (
                        <div style={{ color: 'var(--brand-red)', fontSize: '0.82rem', marginTop: '0.55rem' }}>
                          Rejeitado: {suggestion.rejected_reason}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.85rem' }}>
                        {suggestion.status === 'suggested' && (
                          <>
                            <ActionButton color="success" disabled={busyId === suggestion.id} onClick={() => mutateSuggestion(suggestion, 'approve')}>
                              Aprovar para memória futura
                            </ActionButton>
                            <ActionButton color="danger" disabled={busyId === suggestion.id} onClick={() => mutateSuggestion(suggestion, 'reject')}>
                              Rejeitar
                            </ActionButton>
                          </>
                        )}
                        {suggestion.status !== 'archived' && (
                          <ActionButton color="muted" disabled={busyId === suggestion.id} onClick={() => mutateSuggestion(suggestion, 'archive')}>
                            Arquivar
                          </ActionButton>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
      {label}
      {children}
    </label>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select className="form-input" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </Field>
  );
}

function ActionButton({ children, color, disabled, onClick }) {
  const colors = {
    success: ['rgba(16,185,129,0.1)', 'rgba(16,185,129,0.3)', 'var(--success)'],
    danger: ['rgba(239,68,68,0.08)', 'rgba(239,68,68,0.24)', 'var(--brand-red)'],
    muted: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.1)', 'var(--text-secondary)'],
  };
  const [background, border, text] = colors[color] || colors.muted;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{ background, border: `1px solid ${border}`, borderRadius: 8, color: text, padding: '0.5rem 0.7rem', cursor: disabled ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
    >
      {children}
    </button>
  );
}

function statusColor(status) {
  if (status === 'approved_for_memory') return 'var(--success)';
  if (status === 'rejected') return 'var(--brand-red)';
  if (status === 'archived') return 'var(--text-secondary)';
  return 'var(--accent-blue)';
}

function originLabel(suggestion) {
  if (suggestion.source_library_item_id) return 'Biblioteca';
  if (suggestion.source_agency_run_id) return 'Run da Agência';
  if (suggestion.source_agency_request_id) return 'Pedido';
  return 'Manual';
}
