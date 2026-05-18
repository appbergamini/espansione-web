import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../../../../components/Logo';
import { supabase } from '../../../../lib/supabaseClient';

const SLICE_LABELS = {
  decodificacao: 'Decodificação',
  plataforma_branding: 'Plataforma de branding',
  voice_profile: 'Voice profile',
  visual_identity: 'Visual identity',
  experiencia: 'Experiência',
  plano_comunicacao: 'Plano de comunicação',
  strategic_tensions: 'Tensões estratégicas',
  executional_readiness: 'Prontidão de execução',
  other: 'Outro',
};

const SIGNAL_TYPE_LABELS = {
  missing_information: 'Informação ausente',
  vague_guideline: 'Diretriz vaga',
  contradiction: 'Contradição',
  weak_proof: 'Prova fraca',
  tone_gap: 'Lacuna de tom',
  visual_gap: 'Lacuna visual',
  audience_gap: 'Lacuna de audiência',
  channel_gap: 'Lacuna de canal',
  repeated_manual_edit: 'Edição manual recorrente',
  performance_learning: 'Aprendizado de performance',
};

const SEVERITY_LABELS = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const STATUS_LABELS = {
  open: 'Aberto',
  reviewed: 'Revisado',
  converted_to_learning: 'Convertido em aprendizado',
  dismissed: 'Descartado',
  archived: 'Arquivado',
};

const initialForm = {
  affectedSlice: 'other',
  signalType: 'missing_information',
  severity: 'medium',
  title: '',
  description: '',
  evidence: '',
  recommendation: '',
};

export default function AgencySignalsPage() {
  const router = useRouter();
  const { id, brand_id: brandId } = router.query;
  const [signals, setSignals] = useState([]);
  const [summary, setSummary] = useState([]);
  const [filters, setFilters] = useState({ affected_slice: '', signal_type: '', severity: '', status: 'open', search: '' });
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

  const loadSignals = async () => {
    if (!brandId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/signals?${query}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao carregar sinais');
      setSignals(json.signals || []);
      setSummary(json.summary || []);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, [query]);

  const createSignal = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/agency/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          brandId,
          evidence: form.evidence.split('\n').map((item) => item.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao criar sinal');
      setSuccessMsg('Sinal criado. Brand Memory não foi alterada.');
      setForm(initialForm);
      await loadSignals();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const mutateSignal = async (signal, action) => {
    setBusyId(signal.id);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/agency/signals/${signal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao atualizar sinal');
      setSuccessMsg(action === 'convert_to_learning'
        ? 'Sinal convertido em aprendizado sugerido. Brand Memory continua intacta.'
        : 'Sinal atualizado.');
      await loadSignals();
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
        <title>Espansione | Sinais da Agência</title>
      </Head>
      <div className="page-container">
        <main className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Link href={`/adm/${id}/agency`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.9rem' }}>
              &larr; Voltar à Agência
            </Link>
            <Logo size="sm" showTagline={false} />
          </div>

          <section className="glass-card outline-glow" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderColor: 'rgba(245,158,11,0.28)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '1rem', alignItems: 'end' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                  Agência IA
                </div>
                <h1 style={{ fontSize: '1.65rem', margin: 0 }}>Sinais da Agência</h1>
                <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
                  Lacunas recorrentes percebidas pela operação. Revisar aqui não altera Brand Memory automaticamente.
                </p>
              </div>
              <Link href={`/adm/${id}/agency/learnings?brand_id=${brandId || ''}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 800 }}>
                Aprendizados Sugeridos
              </Link>
            </div>
          </section>

          {errorMsg && <Alert tone="danger">{errorMsg}</Alert>}
          {successMsg && <Alert tone="success">{successMsg}</Alert>}

          <section className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {summary.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.86rem' }}>Nenhum sinal no filtro atual.</p>
              ) : summary.map((item) => (
                <div key={item.affected_slice} style={{ border: `1px solid ${item.open >= 3 ? 'rgba(245,158,11,0.38)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 8, padding: '0.75rem', background: item.open >= 3 ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.025)' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '0.86rem' }}>{SLICE_LABELS[item.affected_slice] || item.affected_slice}</div>
                  <div style={{ color: item.open >= 3 ? 'var(--warning)' : 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                    {item.open} abertos · {item.high} alta severidade
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 0.45fr) minmax(0, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
            <section className="glass-card" style={{ padding: '1rem' }}>
              <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Registrar sinal manual</h2>
              <form onSubmit={createSignal} style={{ display: 'grid', gap: '0.75rem' }}>
                <FilterSelect label="Slice afetado" value={form.affectedSlice} onChange={(value) => updateForm('affectedSlice', value)} options={SLICE_LABELS} omitAll />
                <FilterSelect label="Tipo" value={form.signalType} onChange={(value) => updateForm('signalType', value)} options={SIGNAL_TYPE_LABELS} omitAll />
                <FilterSelect label="Severidade" value={form.severity} onChange={(value) => updateForm('severity', value)} options={SEVERITY_LABELS} omitAll />
                <Field label="Título">
                  <input className="form-input" value={form.title} onChange={(event) => updateForm('title', event.target.value)} required />
                </Field>
                <Field label="Descrição">
                  <textarea className="form-input" rows={4} value={form.description} onChange={(event) => updateForm('description', event.target.value)} required />
                </Field>
                <Field label="Evidências">
                  <textarea className="form-input" rows={3} value={form.evidence} onChange={(event) => updateForm('evidence', event.target.value)} placeholder="Uma por linha" />
                </Field>
                <Field label="Recomendação">
                  <textarea className="form-input" rows={3} value={form.recommendation} onChange={(event) => updateForm('recommendation', event.target.value)} required />
                </Field>
                <button className="btn-primary" type="submit" disabled={saving || !brandId} style={{ padding: '0.7rem 0.9rem' }}>
                  {saving ? 'Criando...' : 'Criar sinal'}
                </button>
              </form>
            </section>

            <section>
              <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  <FilterSelect label="Slice" value={filters.affected_slice} onChange={(value) => updateFilter('affected_slice', value)} options={SLICE_LABELS} />
                  <FilterSelect label="Tipo" value={filters.signal_type} onChange={(value) => updateFilter('signal_type', value)} options={SIGNAL_TYPE_LABELS} />
                  <FilterSelect label="Severidade" value={filters.severity} onChange={(value) => updateFilter('severity', value)} options={SEVERITY_LABELS} />
                  <FilterSelect label="Status" value={filters.status} onChange={(value) => updateFilter('status', value)} options={STATUS_LABELS} />
                  <Field label="Busca">
                    <input className="form-input" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} />
                  </Field>
                </div>
              </div>

              {loading ? (
                <div className="glass-card" style={{ padding: '1.5rem' }}>Carregando sinais...</div>
              ) : signals.length === 0 ? (
                <div className="glass-card" style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
                  Nenhum sinal encontrado.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {signals.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} busy={busyId === signal.id} onAction={mutateSignal} />
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

function SignalCard({ signal, busy, onAction }) {
  const evidence = Array.isArray(signal.evidence_json) ? signal.evidence_json : [];
  return (
    <article className="glass-card" style={{ padding: '1rem', borderColor: severityBorder(signal.severity) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.45rem' }}>
            <Badge color="blue">{SLICE_LABELS[signal.affected_slice] || signal.affected_slice}</Badge>
            <Badge color="amber">{SIGNAL_TYPE_LABELS[signal.signal_type] || signal.signal_type}</Badge>
            <Badge color={signal.severity === 'high' ? 'red' : 'muted'}>{SEVERITY_LABELS[signal.severity] || signal.severity}</Badge>
          </div>
          <h2 style={{ margin: 0, fontSize: '1rem' }}>{signal.title}</h2>
          <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.84rem', margin: '0.55rem 0 0' }}>{signal.description}</p>
        </div>
        <span style={{ color: statusColor(signal.status), fontSize: '0.78rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
          {STATUS_LABELS[signal.status] || signal.status}
        </span>
      </div>

      {evidence.length > 0 && (
        <div style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Evidências:</strong>
          <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1rem' }}>
            {evidence.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      )}

      <p style={{ color: 'var(--accent-blue)', fontSize: '0.82rem', margin: '0.75rem 0 0', whiteSpace: 'pre-wrap' }}>
        {signal.recommendation}
      </p>

      <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginTop: '0.65rem' }}>
        Origem: {signal.source_agent_id || 'manual'} · Run: {signal.agency_run_id || '-'}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.85rem' }}>
        {signal.status === 'open' && (
          <>
            <ActionButton color="success" disabled={busy} onClick={() => onAction(signal, 'review')}>Marcar revisado</ActionButton>
            <ActionButton color="blue" disabled={busy} onClick={() => onAction(signal, 'convert_to_learning')}>Converter em aprendizado</ActionButton>
            <ActionButton color="danger" disabled={busy} onClick={() => onAction(signal, 'dismiss')}>Descartar</ActionButton>
          </>
        )}
        {signal.status !== 'archived' && (
          <ActionButton color="muted" disabled={busy} onClick={() => onAction(signal, 'archive')}>Arquivar</ActionButton>
        )}
      </div>
    </article>
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

function FilterSelect({ label, value, onChange, options, omitAll = false }) {
  return (
    <Field label={label}>
      <select className="form-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {!omitAll && <option value="">Todos</option>}
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </Field>
  );
}

function Badge({ children, color }) {
  const colors = {
    blue: ['rgba(56,189,248,0.1)', 'rgba(56,189,248,0.26)', 'var(--accent-blue)'],
    amber: ['rgba(245,158,11,0.1)', 'rgba(245,158,11,0.26)', 'var(--warning)'],
    red: ['rgba(239,68,68,0.08)', 'rgba(239,68,68,0.24)', 'var(--brand-red)'],
    muted: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.1)', 'var(--text-secondary)'],
  };
  const [background, border, text] = colors[color] || colors.muted;
  return <span style={{ background, border: `1px solid ${border}`, color: text, borderRadius: 999, padding: '0.18rem 0.5rem', fontSize: '0.72rem', fontWeight: 900 }}>{children}</span>;
}

function ActionButton({ children, color, disabled, onClick }) {
  const colors = {
    success: ['rgba(16,185,129,0.1)', 'rgba(16,185,129,0.3)', 'var(--success)'],
    blue: ['rgba(56,189,248,0.08)', 'rgba(56,189,248,0.26)', 'var(--accent-blue)'],
    danger: ['rgba(239,68,68,0.08)', 'rgba(239,68,68,0.24)', 'var(--brand-red)'],
    muted: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.1)', 'var(--text-secondary)'],
  };
  const [background, border, text] = colors[color] || colors.muted;
  return (
    <button type="button" disabled={disabled} onClick={onClick} style={{ background, border: `1px solid ${border}`, borderRadius: 8, color: text, padding: '0.5rem 0.7rem', cursor: disabled ? 'wait' : 'pointer', fontWeight: 800, fontSize: '0.8rem' }}>
      {children}
    </button>
  );
}

function Alert({ children, tone }) {
  return (
    <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', borderColor: tone === 'danger' ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)', color: tone === 'danger' ? 'var(--brand-red)' : 'var(--success)' }}>
      {children}
    </div>
  );
}

function severityBorder(severity) {
  if (severity === 'high') return 'rgba(239,68,68,0.28)';
  if (severity === 'medium') return 'rgba(245,158,11,0.28)';
  return 'rgba(56,189,248,0.18)';
}

function statusColor(status) {
  if (status === 'converted_to_learning' || status === 'reviewed') return 'var(--success)';
  if (status === 'dismissed') return 'var(--brand-red)';
  if (status === 'archived') return 'var(--text-secondary)';
  return 'var(--warning)';
}
