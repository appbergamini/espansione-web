import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../../../../components/Logo';
import { supabase } from '../../../../lib/supabaseClient';

const TYPE_LABELS = {
  conceptual_image: 'Imagem conceitual',
  moodboard_reference: 'Referência de moodboard',
  background_image: 'Imagem de fundo',
  visual_prompt: 'Prompt visual',
  editable_art_reference: 'Referência editável',
  final_art: 'Arte final',
};

export default function BrandCreativeAssetsPage() {
  const router = useRouter();
  const { id, brand_id: brandId } = router.query;
  const [assets, setAssets] = useState([]);
  const [filters, setFilters] = useState({ asset_type: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

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

  async function loadAssets() {
    if (!brandId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/agency/assets?${query}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erro ao carregar ativos');
      setAssets(json.assets || []);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssets();
  }, [query]);

  const summary = {
    total: assets.length,
    approved: assets.filter((asset) => asset.status === 'approved').length,
    review: assets.filter((asset) => asset.text_review_required).length,
    prompts: assets.filter((asset) => asset.asset_type === 'visual_prompt').length,
  };

  return (
    <>
      <Head><title>Espansione | Ativos Visuais</title></Head>
      <div className="page-container">
        <main className="container">
          <div className="topbar">
            <div className="links">
              <Link href={`/adm/${id}/agency`}>&larr; Voltar à Agência</Link>
              <Link href={`/adm/${id}/agency/brand-book?brand_id=${brandId || ''}`}>Brand Book</Link>
            </div>
            <Logo size="sm" showTagline={false} />
          </div>

          <section className="glass-card outline-glow hero">
            <div>
              <div className="eyebrow">Biblioteca visual</div>
              <h1>Ativos Visuais da Marca</h1>
              <p>Imagens conceituais, prompts, moodboards e referências ligadas às runs da Agência. Esta camada não publica nem altera Brand Memory.</p>
            </div>
            <div className="metrics">
              <Metric label="Ativos" value={summary.total} />
              <Metric label="Aprovados" value={summary.approved} />
              <Metric label="Com revisão de texto" value={summary.review} />
              <Metric label="Prompts visuais" value={summary.prompts} />
            </div>
          </section>

          {errorMsg && <div className="glass-card error">{errorMsg}</div>}

          <section className="glass-card panel">
            <div className="filters">
              <select className="form-input" value={filters.asset_type} onChange={(event) => setFilters({ ...filters, asset_type: event.target.value })}>
                <option value="">Todos os tipos</option>
                {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select className="form-input" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option value="">Todos os status</option>
                {['draft', 'generated', 'approved', 'rejected', 'archived'].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <input className="form-input" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Buscar por título, prompt ou notas" />
            </div>

            {loading ? (
              <p>Carregando...</p>
            ) : assets.length === 0 ? (
              <p className="muted">Nenhum ativo visual encontrado para esta marca.</p>
            ) : (
              <div className="grid">
                {assets.map((asset) => (
                  <article className="asset-card" key={asset.id}>
                    {asset.file_url && <img src={asset.file_url} alt={asset.title || 'Ativo visual'} />}
                    <div className="asset-body">
                      <div className="asset-head">
                        <strong>{asset.title || TYPE_LABELS[asset.asset_type] || asset.asset_type}</strong>
                        <span>{asset.status}</span>
                      </div>
                      <div className="muted">{TYPE_LABELS[asset.asset_type] || asset.asset_type}</div>
                      {asset.prompt && <p>{asset.prompt}</p>}
                      {asset.text_review_required && <div className="warning">Texto embutido exige revisão humana.</div>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <style jsx>{`
            .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
            .links { display: flex; gap: 1rem; flex-wrap: wrap; }
            .links :global(a) { color: var(--accent-blue); text-decoration: none; font-size: 0.9rem; font-weight: 800; }
            .hero { padding: 1.25rem; margin-bottom: 1.25rem; border-color: rgba(56,189,248,0.32); display: grid; grid-template-columns: minmax(0,1fr) minmax(320px,0.8fr); gap: 1rem; }
            .eyebrow { color: var(--accent-blue); font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; }
            h1 { margin: 0.25rem 0 0; font-size: 1.7rem; }
            p, .muted { color: var(--text-secondary); }
            .metrics { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 0.65rem; }
            .panel { padding: 1.1rem; }
            .filters { display: grid; grid-template-columns: 220px 180px minmax(260px,1fr); gap: 0.75rem; margin-bottom: 1rem; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.9rem; }
            .asset-card { border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.025); min-width: 0; }
            .asset-card img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; background: rgba(0,0,0,0.35); }
            .asset-body { padding: 0.85rem; display: grid; gap: 0.5rem; }
            .asset-head { display: flex; justify-content: space-between; gap: 0.75rem; }
            .asset-head span { color: var(--accent-blue); font-size: 0.75rem; font-weight: 800; }
            .warning { color: var(--warning); font-size: 0.8rem; font-weight: 800; }
            .error { padding: 1rem; margin-bottom: 1rem; color: var(--brand-red); border-color: rgba(239,68,68,0.35); }
            @media (max-width: 900px) { .hero, .filters { grid-template-columns: 1fr; } }
          `}</style>
        </main>
      </div>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.7rem', background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ color: 'var(--accent-blue)', fontWeight: 900, fontSize: '1.1rem' }}>{value}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{label}</div>
    </div>
  );
}
