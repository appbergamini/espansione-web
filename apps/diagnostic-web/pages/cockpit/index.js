// Cockpit — shell top-level (Fase 1). Sidebar + topbar + navegação entre as 6
// views, fiel ao handoff. Área nova e autocontida (tema dark GitHub); não
// altera o admin de diagnóstico. Dados reais serão ligados view a view depois.
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { P, Hoverable, PSideItem, PBadge, PProgress } from '../../components/cockpit/ui';
import { ViewOverview, ViewContent, ViewTasks, ViewSchedule, ViewAI, ViewReview } from '../../components/cockpit/views';

const NAV_ITEMS = [
  { key: 'overview', icon: '◫', label: 'Visão Geral' },
  { key: 'content', icon: '◧', label: 'Conteúdo', count: 12 },
  { key: 'tasks', icon: '☰', label: 'Pautas', count: 6 },
  { key: 'schedule', icon: '◷', label: 'Agenda' },
  { key: 'ai', icon: '⬡', label: 'IA' },
  { key: 'review', icon: '✎', label: 'Revisão', count: 14 },
];

const VIEWS = {
  overview: ViewOverview,
  content: ViewContent,
  tasks: ViewTasks,
  schedule: ViewSchedule,
  ai: ViewAI,
  review: ViewReview,
};

export default function CockpitPage() {
  const router = useRouter();
  const [authOk, setAuthOk] = useState(false);
  const [page, setPage] = useState('overview');
  const [fadeKey, setFadeKey] = useState(0);
  const [projetos, setProjetos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectorOpen, setSelectorOpen] = useState(false);

  // Auth gate (mesmo padrão das telas admin).
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) { router.push('/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (!active) return;
      if (profile?.role !== 'master' && profile?.role !== 'admin') { router.replace('/dashboard'); return; }
      setAuthOk(true);
    })();
    return () => { active = false; };
  }, [router]);

  // Restaura última view escolhida.
  useEffect(() => {
    try { const p = localStorage.getItem('esp-cockpit-page'); if (p && VIEWS[p]) setPage(p); } catch { /* */ }
  }, []);

  // Carrega projetos (marcas) após auth e resolve a seleção atual.
  useEffect(() => {
    if (!authOk) return undefined;
    let active = true;
    (async () => {
      try {
        const r = await fetch('/api/adm/projetos');
        const j = await r.json();
        if (!active || !j.success) return;
        const list = j.projetos || [];
        setProjetos(list);
        let stored = null;
        try { stored = localStorage.getItem('esp-cockpit-projeto'); } catch { /* */ }
        setSelectedId(stored && list.some(p => p.id === stored) ? stored : (list[0]?.id || null));
      } catch { /* */ }
    })();
    return () => { active = false; };
  }, [authOk]);

  const escolherProjeto = (pid) => {
    setSelectedId(pid);
    setSelectorOpen(false);
    try { localStorage.setItem('esp-cockpit-projeto', pid); } catch { /* */ }
  };

  const navigate = (key) => {
    setPage(key);
    setFadeKey(k => k + 1);
    try { localStorage.setItem('esp-cockpit-page', key); } catch { /* */ }
  };

  if (!authOk) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: P.bg, color: P.textSec, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
        Carregando cockpit…
      </div>
    );
  }

  const ViewComponent = VIEWS[page] || ViewOverview;
  const selectedProjeto = projetos.find(p => p.id === selectedId) || null;

  return (
    <>
      <Head><title>Espansione | Cockpit</title></Head>
      <style jsx global>{`
        @keyframes cockpitFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .cockpit-scroll::-webkit-scrollbar { width: 6px; }
        .cockpit-scroll::-webkit-scrollbar-thumb { background: ${P.border}; border-radius: 3px; }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', width: '100%', background: P.bg, color: P.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif', overflow: 'hidden' }}>
        {/* ── Sidebar ── */}
        <div style={{ width: 240, background: P.surface, borderRight: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', padding: '20px 12px', gap: 2, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px', marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${P.accent}, ${P.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', flexShrink: 0 }}>E</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: P.text, lineHeight: 1.2 }}>Espansione</div>
              <div style={{ fontSize: 10, color: P.textSec }}>Consultoria</div>
            </div>
          </div>

          {/* Seletor de marca/cliente — projetos reais */}
          <div style={{ position: 'relative', margin: '0 0 14px' }}>
            <Hoverable
              onClick={() => setSelectorOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: P.card, borderRadius: P.radius, border: `1px solid ${selectorOpen ? P.accent : P.border}` }}
              hoverStyle={{ borderColor: P.textDim }}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: P.accent, fontSize: 11, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {(selectedProjeto?.cliente || selectedProjeto?.nome || '?').charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 12, color: P.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedProjeto?.cliente || selectedProjeto?.nome || 'Selecione a marca'}
              </span>
              <span style={{ fontSize: 10, color: P.textDim }}>▾</span>
            </Hoverable>
            {selectorOpen && (
              <div className="cockpit-scroll" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, maxHeight: 280, overflowY: 'auto', background: P.card, border: `1px solid ${P.border}`, borderRadius: P.radius, zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}>
                {projetos.length === 0 && <div style={{ padding: '10px 12px', fontSize: 12, color: P.textDim }}>Nenhum projeto.</div>}
                {projetos.map(p => (
                  <Hoverable
                    key={p.id}
                    onClick={() => escolherProjeto(p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: 12, color: p.id === selectedId ? P.accent : P.textSec }}
                    hoverStyle={{ background: P.borderLt, color: P.text }}
                  >
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.cliente || p.nome || p.id}</span>
                    {p.id === selectedId && <span style={{ fontSize: 10 }}>✓</span>}
                  </Hoverable>
                ))}
              </div>
            )}
          </div>

          {NAV_ITEMS.map(item => (
            <PSideItem key={item.key} icon={item.icon} label={item.label} count={item.count} active={page === item.key} onClick={() => navigate(item.key)} />
          ))}

          <div style={{ flex: 1 }} />

          <div style={{ margin: '8px 4px 12px', padding: '12px 14px', borderRadius: P.radius, background: `linear-gradient(135deg, ${P.accentDim}, ${P.purpleBg})`, border: `1px solid ${P.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: P.accent, marginBottom: 4 }}>Plano Ativo</div>
            <div style={{ fontSize: 10, color: P.textSec }}>72% da capacidade IA usada</div>
            <div style={{ marginTop: 8 }}><PProgress value={72} color={`linear-gradient(90deg, ${P.accent}, ${P.purple})`} height={4} /></div>
          </div>

          <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 8 }}>
            <PSideItem icon="←" label="Voltar ao admin" onClick={() => router.push('/adm')} />
            <PSideItem icon="?" label="Ajuda" onClick={() => {}} />
          </div>
        </div>

        {/* ── Conteúdo ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', borderBottom: `1px solid ${P.border}`, flexShrink: 0, background: P.bg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: P.textSec }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('overview')}>Home</span>
              {page !== 'overview' && (
                <>
                  <span style={{ color: P.textDim }}>/</span>
                  <span style={{ color: P.text, fontWeight: 600 }}>{NAV_ITEMS.find(n => n.key === page)?.label}</span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <PBadge label="Empresa Ativa" color="green" />
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: P.card, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: P.textSec, cursor: 'pointer' }}>⊕</div>
            </div>
          </div>

          <div key={fadeKey} className="cockpit-scroll" style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', overflowX: 'hidden', animation: 'cockpitFadeIn .25s ease-out forwards' }}>
            <ViewComponent navigate={navigate} projeto={selectedProjeto} />
          </div>
        </div>
      </div>
    </>
  );
}
