import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../../../components/Logo';
import { supabase } from '../../../../lib/supabaseClient';

export default function BrandMemoryVersionsPage() {
  const router = useRouter();
  const { id, brand_id: brandId } = router.query;
  const [versions, setVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(null);
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

  useEffect(() => {
    if (!brandId) return;
    (async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch(`/api/agency/brand-memory-versions?brand_id=${brandId}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Erro ao carregar versões');
        setVersions(json.versions || []);
        setActiveVersion(json.activeVersion || null);
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [brandId]);

  return (
    <>
      <Head><title>Espansione | Versões da Brand Memory</title></Head>
      <div className="page-container">
        <main className="container">
          <div className="topbar">
            <Link href={`/adm/${id}/agency`}>&larr; Voltar à Agência</Link>
            <Logo size="sm" showTagline={false} />
          </div>

          <section className="glass-card outline-glow hero">
            <div>
              <div className="eyebrow">Fonte canônica</div>
              <h1>Versões da Brand Memory</h1>
              <p>Histórico de memórias carregadas para a marca. A Agência registra qual versão foi usada em cada run.</p>
            </div>
            <div className="active-card">
              <span>Versão ativa</span>
              <strong>{activeVersion ? `v${activeVersion.version_number}` : 'nenhuma'}</strong>
              <small>{activeVersion?.activated_at ? formatDate(activeVersion.activated_at) : 'sem ativação registrada'}</small>
            </div>
          </section>

          {errorMsg && <div className="glass-card error">{errorMsg}</div>}

          <section className="glass-card panel">
            {loading ? (
              <p>Carregando...</p>
            ) : versions.length === 0 ? (
              <p className="muted">Nenhuma versão de Brand Memory encontrada.</p>
            ) : (
              <div className="versions">
                {versions.map((version) => (
                  <article className={`version-card ${version.status}`} key={version.id}>
                    <div className="version-head">
                      <div>
                        <strong>Versão {version.version_number}</strong>
                        <span>{version.status}</span>
                      </div>
                      <div className="date">{formatDate(version.created_at)}</div>
                    </div>
                    <p>{version.change_summary || 'Sem resumo de alteração informado.'}</p>
                    <div className="meta">
                      <span>Validação: {version.validation_status || 'n/d'}</span>
                      <span>Erros: {Array.isArray(version.validation_errors) ? version.validation_errors.length : 0}</span>
                      <span>Output fonte: {version.source_output_id || 'n/d'}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <style jsx>{`
            .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
            .topbar :global(a) { color: var(--accent-blue); text-decoration: none; font-size: 0.9rem; font-weight: 800; }
            .hero { padding: 1.25rem; margin-bottom: 1.25rem; border-color: rgba(56,189,248,0.32); display: grid; grid-template-columns: minmax(0,1fr) 260px; gap: 1rem; align-items: center; }
            .eyebrow { color: var(--accent-blue); font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; }
            h1 { margin: 0.25rem 0 0; font-size: 1.7rem; }
            p, .muted, .date { color: var(--text-secondary); }
            .active-card { border: 1px solid rgba(16,185,129,0.28); border-radius: 8px; padding: 0.9rem; display: grid; gap: 0.25rem; background: rgba(16,185,129,0.08); }
            .active-card span, .active-card small { color: var(--text-secondary); font-size: 0.78rem; }
            .active-card strong { color: var(--success); font-size: 1.25rem; }
            .panel { padding: 1.1rem; }
            .versions { display: grid; gap: 0.8rem; }
            .version-card { border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 0.9rem; }
            .version-card.active { border-color: rgba(16,185,129,0.35); background: rgba(16,185,129,0.055); }
            .version-head { display: flex; justify-content: space-between; gap: 1rem; }
            .version-head span { display: block; margin-top: 0.2rem; color: var(--accent-blue); font-size: 0.78rem; font-weight: 800; }
            .meta { display: flex; flex-wrap: wrap; gap: 0.5rem; color: var(--text-secondary); font-size: 0.78rem; }
            .meta span { border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; padding: 0.18rem 0.5rem; }
            .error { padding: 1rem; margin-bottom: 1rem; color: var(--brand-red); border-color: rgba(239,68,68,0.35); }
            @media (max-width: 800px) { .hero { grid-template-columns: 1fr; } }
          `}</style>
        </main>
      </div>
    </>
  );
}

function formatDate(value) {
  if (!value) return 'n/d';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
