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

  function renderCard(f, num) {
    const st = STATUS_LABEL[f.status] || STATUS_LABEL.not_started;
    const badge = f.shared
      ? (f.responses_count ? { txt: `${f.responses_count} resposta${f.responses_count === 1 ? '' : 's'}`, cor: '#86efac', bg: 'rgba(34,197,94,0.16)' } : { txt: 'Aguardando respostas', cor: '#9aa3ad', bg: 'rgba(255,255,255,0.06)' })
      : st;
    return (
      <div key={f.type} className="glass-card" style={sx.formCard}>
        <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
          <div style={sx.stepNum}>{num}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.02rem' }}>{f.titulo}</h3>
              <span style={{ ...sx.badge, color: badge.cor, background: badge.bg }}>{badge.txt}</span>
            </div>
            <p style={{ ...sx.txtSec, fontSize: '0.84rem', margin: '0.3rem 0 0.7rem' }}>
              {f.respondente} · {f.tempo}{f.obrigatorio ? ' · obrigatório' : ' · recomendado'}
            </p>
            {f.shared && f.responses_count > 0 && typeof f.indicator === 'number' && (
              <p style={{ margin: '0 0 0.7rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{f.indicator_label}: </span>
                <b style={{ color: f.indicator >= 0 ? '#86efac' : '#fca5a5' }}>{f.indicator}</b>
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {f.shared ? (
                <>
                  <button onClick={() => copiar(f.link, f.type)} className="btn-primary" style={{ fontSize: '0.84rem', padding: '0.5rem 1rem' }}>
                    {copiado === f.type ? '✓ Link copiado' : '🔗 Copiar link da pesquisa'}
                  </button>
                  <a href={f.link} target="_blank" rel="noreferrer" style={{ ...sx.btnGhost, textDecoration: 'none' }}>Abrir →</a>
                </>
              ) : (
                <>
                  <a href={f.link} target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: '0.84rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>
                    {f.status === 'completed' ? 'Revisar →' : f.status === 'in_progress' ? 'Continuar →' : 'Iniciar →'}
                  </a>
                  <button onClick={() => copiar(f.link, f.type)} style={sx.btnGhost}>
                    {copiado === f.type ? '✓ Copiado' : '🔗 Copiar link'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>Mapa de Identidade Estratégica</title></Head>
      <div style={sx.page}>
        <div style={{ width: '100%', maxWidth: 760, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
          <Logo size="sm" />
          <a href={`/adm/${projetoId}`} style={sx.voltar}>← Voltar ao projeto</a>
        </div>

        <div style={{ width: '100%', maxWidth: 760 }}>
          <div style={sx.eyebrow}>Diagnóstico de marca</div>
          <h1 style={sx.h1}>Mapa de Identidade Estratégica</h1>
          {data?.cliente && <p style={{ ...sx.txtSec, marginTop: '-0.1rem' }}>{data.cliente}</p>}

          {erro && <div className="glass-card" style={{ padding: '1.2rem', marginTop: '1rem' }}><p style={sx.txtSec}>{erro}</p></div>}

          {/* contexto de maturidade */}
          {data && (mc ? (
            <div style={sx.matBox}>
              <div style={sx.matAccent} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={sx.matNum}>{mc.general_score}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary,#9aa)' }}>/100</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.95rem', fontWeight: 700 }}>{mc.general_level}</span>
              </div>
              <div style={sx.gaugeOut}><div style={{ ...sx.gaugeIn, width: `${mc.general_score}%` }} /></div>
              <div style={sx.eyebrow}>Mapa de Maturidade vinculado</div>
              {mc.pillars?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.7rem' }}>
                  {mc.pillars.map((p) => {
                    const c = levelColor(p.level);
                    return <span key={p.code} title={`${p.name} — Nível ${p.level}`} style={{ ...sx.pillarChip, borderColor: c.b, color: c.c }}>{p.code} · {p.percentage_score}%</span>;
                  })}
                </div>
              )}
            </div>
          ) : (
            <div style={{ ...sx.matBox, borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}>
              <span style={sx.txtSec}>Mapa de Maturidade ainda não concluído para este projeto — o contexto será vinculado automaticamente quando estiver.</span>
            </div>
          ))}

          {/* etapas da liderança */}
          {data?.forms && (
            <>
              <div style={sx.sectionLabel}>Respondido pela liderança</div>
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {data.forms.filter((f) => !f.shared).map((f, i) => renderCard(f, i + 1))}
              </div>
              <div style={sx.sectionLabel}>Pesquisas de percepção · links compartilhados</div>
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {data.forms.filter((f) => f.shared).map((f, i) => renderCard(f, i + 3))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function levelColor(level) {
  if (level <= 2) return { b: 'rgba(239,68,68,0.4)', c: '#fca5a5' };
  if (level === 3) return { b: 'rgba(234,179,8,0.4)', c: '#fde68a' };
  return { b: 'rgba(34,197,94,0.4)', c: '#86efac' };
}

const sx = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' },
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600 },
  h1: { fontSize: '1.7rem', margin: '0.25rem 0 0.15rem' },
  txtSec: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  voltar: { fontSize: '0.82rem', color: 'var(--text-secondary, #9aa)', textDecoration: 'none' },
  matBox: { position: 'relative', overflow: 'hidden', borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(218,49,68,0.25)', background: 'rgba(218,49,68,0.08)', borderRadius: 14, padding: '1.1rem 1.3rem', marginTop: '1.2rem' },
  matAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' },
  matNum: { fontSize: '2.6rem', fontWeight: 800, color: '#Da3144', lineHeight: 1 },
  gaugeOut: { height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', margin: '0.55rem 0 0.4rem' },
  gaugeIn: { height: '100%', background: 'linear-gradient(90deg, #Da3144, #f0667a)', borderRadius: 99 },
  pillarChip: { fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: 99, border: '1px solid', background: 'rgba(255,255,255,0.03)' },
  sectionLabel: { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600, margin: '1.6rem 0 0.7rem' },
  formCard: { padding: '1.15rem 1.3rem' },
  stepNum: { flexShrink: 0, width: 30, height: 30, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#fca5b0', background: 'rgba(218,49,68,0.14)', border: '1px solid rgba(218,49,68,0.3)' },
  badge: { fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 99, whiteSpace: 'nowrap', fontWeight: 600 },
  btnGhost: { background: 'none', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, color: 'var(--text-secondary, #9aa)', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.84rem' },
};
