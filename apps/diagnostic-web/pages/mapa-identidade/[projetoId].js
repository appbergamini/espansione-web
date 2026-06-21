import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

// Mapa de Identidade Estratégica — página principal (hub, admin).
// Mostra o status das 4 etapas + o contexto do Mapa de Maturidade vinculado.
// A API /api/identidade/hub é admin-gated (master/admin); o cookie de sessão
// vai junto no fetch. Forms 1/2 abrem por link de token; 3/4 entram na Fase 2.

const STATUS_LABEL = {
  not_started: { txt: 'Não iniciado', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' },
  in_progress: { txt: 'Em andamento', cor: '#fde68a', bg: 'rgba(234,179,8,0.15)' },
  completed: { txt: 'Concluído', cor: '#86efac', bg: 'rgba(34,197,94,0.16)' },
  not_applicable: { txt: 'Fase 2', cor: '#9bb8e0', bg: 'rgba(0,50,109,0.18)' },
  skipped: { txt: 'Pulado', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' },
};

export default function MapaIdentidadeHub() {
  const router = useRouter();
  const { projetoId } = router.query;
  const [data, setData] = useState(null);
  const [erro, setErro] = useState(null);
  const [copiado, setCopiado] = useState(null);

  useEffect(() => {
    if (!projetoId) return;
    (async () => {
      try {
        const r = await fetch('/api/identidade/hub', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projeto_id: projetoId }),
        });
        const j = await r.json();
        if (!j.success) {
          setErro(r.status === 401 || r.status === 403 ? 'Acesso restrito (faça login como admin).' : j.error || 'Erro');
          return;
        }
        setData(j);
      } catch (e) {
        setErro('Não foi possível carregar.');
      }
    })();
  }, [projetoId]);

  function copiar(link, type) {
    navigator.clipboard.writeText(`${window.location.origin}${link}`);
    setCopiado(type);
    setTimeout(() => setCopiado(null), 1800);
  }

  const mc = data?.maturity_context;

  return (
    <>
      <Head><title>Mapa de Identidade Estratégica</title></Head>
      <div style={sx.page}>
        <div style={{ width: '100%', maxWidth: 760, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
          <Logo size="sm" />
          <a href={`/adm/${projetoId}`} style={sx.voltar}>← Voltar ao projeto</a>
        </div>

        <div style={{ width: '100%', maxWidth: 760 }}>
          <h1 style={sx.h1}>Mapa de Identidade Estratégica</h1>
          {data?.cliente && <p style={{ ...sx.txtSec, marginTop: '-0.4rem' }}>{data.cliente}</p>}

          {erro && <div className="glass-card" style={{ padding: '1.2rem' }}><p style={sx.txtSec}>{erro}</p></div>}

          {/* contexto de maturidade */}
          {data && (mc ? (
            <div style={sx.matBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <span style={sx.matNum}>{mc.general_score}</span>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary,#9aa)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mapa de Maturidade vinculado</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{mc.general_level}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginTop: '0.7rem', fontSize: '0.82rem' }}>
                {mc.critical_pillars?.length > 0 && <span style={sx.txtSec}>⚠ Críticos: <b style={{ color: '#fca5a5' }}>{mc.critical_pillars.join(', ')}</b></span>}
                {mc.strong_pillars?.length > 0 && <span style={sx.txtSec}>★ Fortes: <b style={{ color: '#86efac' }}>{mc.strong_pillars.join(', ')}</b></span>}
              </div>
            </div>
          ) : (
            <div style={{ ...sx.matBox, borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}>
              <span style={sx.txtSec}>Mapa de Maturidade ainda não concluído para este projeto — o contexto será vinculado automaticamente quando estiver.</span>
            </div>
          ))}

          {/* cards das 4 etapas */}
          <div style={{ display: 'grid', gap: '0.9rem', marginTop: '1.2rem' }}>
            {data?.forms?.map((f) => {
              const st = STATUS_LABEL[f.status] || STATUS_LABEL.not_started;
              const badge = f.shared
                ? (f.responses_count ? { txt: `${f.responses_count} resposta${f.responses_count === 1 ? '' : 's'}`, cor: '#86efac', bg: 'rgba(34,197,94,0.16)' } : { txt: 'Aguardando respostas', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' })
                : st;
              return (
                <div key={f.type} className="glass-card" style={{ padding: '1.1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{f.titulo}</h3>
                    <span style={{ ...sx.badge, color: badge.cor, background: badge.bg }}>{badge.txt}</span>
                  </div>
                  <p style={{ ...sx.txtSec, fontSize: '0.85rem', margin: '0.35rem 0 0.8rem' }}>
                    {f.respondente} · {f.tempo}{f.obrigatorio ? ' · obrigatório' : ' · recomendado'}
                  </p>
                  {f.shared && f.responses_count > 0 && typeof f.indicator === 'number' && (
                    <p style={{ margin: '0 0 0.7rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{f.indicator_label}: </span>
                      <b style={{ color: f.indicator >= 0 ? '#86efac' : '#fca5a5' }}>{f.indicator}</b>
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {f.shared ? (
                      <>
                        <button onClick={() => copiar(f.link, f.type)} className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                          {copiado === f.type ? '✓ Link copiado' : '🔗 Copiar link da pesquisa'}
                        </button>
                        <a href={f.link} target="_blank" rel="noreferrer" style={{ ...sx.btnGhost, textDecoration: 'none' }}>Abrir →</a>
                      </>
                    ) : (
                      <>
                        <a href={f.link} target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>
                          {f.status === 'completed' ? 'Revisar →' : f.status === 'in_progress' ? 'Continuar →' : 'Iniciar →'}
                        </a>
                        <button onClick={() => copiar(f.link, f.type)} style={sx.btnGhost}>
                          {copiado === f.type ? '✓ Copiado' : '🔗 Copiar link'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

const sx = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' },
  h1: { fontSize: '1.6rem', marginBottom: '0.2rem' },
  txtSec: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  voltar: { fontSize: '0.82rem', color: 'var(--text-secondary, #9aa)', textDecoration: 'none' },
  matBox: { borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(218,49,68,0.25)', background: 'rgba(218,49,68,0.08)', borderRadius: 12, padding: '1rem 1.2rem', marginTop: '1rem' },
  matNum: { fontSize: '2.2rem', fontWeight: 800, color: '#Da3144', lineHeight: 1 },
  badge: { fontSize: '0.74rem', padding: '0.2rem 0.6rem', borderRadius: 99, whiteSpace: 'nowrap', fontWeight: 600 },
  btnGhost: { background: 'none', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, color: 'var(--text-secondary, #9aa)', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem' },
};
