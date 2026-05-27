import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../../../../components/Logo';
import { supabase } from '../../../../lib/supabaseClient';

const TYPE_LABELS = {
  brand_book_file: 'Arquivo de brand book',
  logo_primary: 'Logo principal',
  logo_secondary: 'Logo secundário',
  logo_symbol: 'Símbolo',
  logo_monochrome: 'Logo monocromático',
  color_palette: 'Paleta de cores',
  typography: 'Tipografia',
  graphic_element: 'Elemento gráfico',
  iconography: 'Iconografia',
  image_style_reference: 'Referência de imagem',
  usage_rule: 'Regra de uso',
  approved_visual_example: 'Exemplo visual aprovado',
  rejected_visual_example: 'Exemplo visual rejeitado',
  other: 'Outro',
};

const initialForm = {
  asset_type: 'logo_primary',
  name: '',
  storage_url: '',
  mime_type: '',
  description: '',
  tags: '',
};

export default function BrandBookPage() {
  const router = useRouter();
  const { id, brand_id: brandId } = router.query;
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState('');
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
    if (filter) params.set('asset_type', filter);
    return params.toString();
  }, [brandId, filter]);

  async function loadItems() {
    if (!brandId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/brand-book?${query}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao carregar Brand Book');
      setItems(json.items || []);
      setSummary(json.summary || null);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [query]);

  async function saveItem(event) {
    event.preventDefault();
    if (!brandId) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/agency/brand-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brandId,
          ...form,
          tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao salvar item');
      setSuccessMsg('Item adicionado ao Brand Book.');
      setForm(initialForm);
      await loadItems();
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function archiveItem(itemId) {
    setBusyId(itemId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/agency/brand-book/${itemId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao arquivar item');
      setSuccessMsg('Item arquivado.');
      await loadItems();
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setBusyId('');
    }
  }

  return (
    <>
      <Head><title>Espansione | Brand Book</title></Head>
      <div className="page-container">
        <main className="container">
          <Header id={id} brandId={brandId} />

          {errorMsg && <Notice tone="error">{errorMsg}</Notice>}
          {successMsg && <Notice tone="success">{successMsg}</Notice>}

          <section className="glass-card outline-glow" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderColor: 'rgba(16,185,129,0.3)' }}>
            <div className="hero-grid">
              <div>
                <div className="eyebrow">Brand Asset Kit</div>
                <h1>Brand Book da Marca</h1>
                <p>Logos, cores, fontes, regras e referências oficiais para orientar a Agência IA sem alterar automaticamente a Brand Memory.</p>
              </div>
              <div className="summary-grid">
                <Metric label="Itens" value={summary?.total || 0} />
                <Metric label="Logos" value={summary?.logos || 0} />
                <Metric label="Cores" value={summary?.colors || 0} />
                <Metric label="Fontes" value={summary?.typography || 0} />
              </div>
            </div>
          </section>

          <div className="workspace">
            <section className="glass-card panel">
              <h2>Novo item oficial</h2>
              <form className="form" onSubmit={saveItem}>
                <Field label="Tipo">
                  <select className="form-input" value={form.asset_type} onChange={(event) => setForm({ ...form, asset_type: event.target.value })}>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </Field>
                <Field label="Nome">
                  <input className="form-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                </Field>
                <Field label="URL do arquivo ou referência">
                  <input className="form-input" value={form.storage_url} onChange={(event) => setForm({ ...form, storage_url: event.target.value })} placeholder="https://... ou deixe vazio para regra manual" />
                </Field>
                <Field label="Tipo MIME">
                  <input className="form-input" value={form.mime_type} onChange={(event) => setForm({ ...form, mime_type: event.target.value })} placeholder="image/svg+xml, application/pdf..." />
                </Field>
                <Field label="Descrição / regra de uso">
                  <textarea className="form-input" rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                </Field>
                <Field label="Tags">
                  <input className="form-input" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="logo, principal, fundo escuro" />
                </Field>
                <button className="btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Adicionar ao Brand Book'}</button>
              </form>
            </section>

            <section className="glass-card panel">
              <div className="section-head">
                <h2>Itens cadastrados</h2>
                <select className="form-input compact" value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option value="">Todos os tipos</option>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              {loading ? (
                <p>Carregando...</p>
              ) : items.length === 0 ? (
                <p className="muted">Nenhum item oficial cadastrado ainda.</p>
              ) : (
                <div className="items">
                  {items.map((item) => (
                    <article className="item-card" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{TYPE_LABELS[item.asset_type] || item.asset_type}</span>
                      </div>
                      {item.description && <p>{item.description}</p>}
                      {item.storage_url && item.storage_url !== 'manual://brand-asset-kit' && (
                        <a href={item.storage_url} target="_blank" rel="noreferrer">Abrir arquivo</a>
                      )}
                      <button type="button" onClick={() => archiveItem(item.id)} disabled={busyId === item.id}>
                        {busyId === item.id ? 'Arquivando...' : 'Arquivar'}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <style jsx>{`
            .hero-grid, .workspace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 0.9fr); gap: 1rem; align-items: start; }
            .eyebrow { color: var(--success); font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; }
            h1 { margin: 0.25rem 0 0; font-size: 1.7rem; }
            h2 { margin: 0 0 0.75rem; font-size: 1rem; }
            p, .muted { color: var(--text-secondary); }
            .summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.65rem; }
            .panel { padding: 1.1rem; min-width: 0; overflow: hidden; }
            .form { display: grid; gap: 0.75rem; }
            .section-head { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 0.75rem; }
            .compact { max-width: 220px; }
            .items { display: grid; gap: 0.75rem; }
            .item-card { border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.85rem; display: grid; gap: 0.55rem; }
            .item-card span { display: block; color: var(--accent-blue); font-size: 0.78rem; margin-top: 0.2rem; }
            .item-card a { color: var(--success); text-decoration: none; font-weight: 800; font-size: 0.84rem; }
            .item-card button { justify-self: start; border: 1px solid rgba(239,68,68,0.35); color: var(--brand-red); background: rgba(239,68,68,0.08); border-radius: 8px; padding: 0.45rem 0.7rem; cursor: pointer; }
            :global(.brand-book-field) { display: grid; gap: 0.35rem; color: var(--text-secondary); font-size: 0.82rem; }
            @media (max-width: 900px) { .hero-grid, .workspace { grid-template-columns: 1fr; } }
          `}</style>
        </main>
      </div>
    </>
  );
}

function Header({ id, brandId }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href={`/adm/${id}/agency`} style={linkStyle}>&larr; Voltar à Agência</Link>
        <Link href={`/adm/${id}/agency/assets?brand_id=${brandId || ''}`} style={linkStyle}>Ativos Visuais</Link>
      </div>
      <Logo size="sm" showTagline={false} />
    </div>
  );
}

function Field({ label, children }) {
  return <label className="brand-book-field"><span>{label}</span>{children}</label>;
}

function Metric({ label, value }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.7rem', background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ color: 'var(--accent-blue)', fontWeight: 900, fontSize: '1.1rem' }}>{value}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{label}</div>
    </div>
  );
}

function Notice({ tone, children }) {
  const color = tone === 'error' ? 'var(--brand-red)' : 'var(--success)';
  return <div className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', color, borderColor: tone === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)' }}>{children}</div>;
}

const linkStyle = { color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 800 };
