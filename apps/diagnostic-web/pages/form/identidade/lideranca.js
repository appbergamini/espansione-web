import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo, useState, useEffect } from 'react';
import Logo from '../../../components/Logo';
import CampoIdentidade from '../../../components/identidade/CampoIdentidade';
import {
  FORM_ESSENCIA,
  FORM_TERRITORIO,
  ESCALA_TERRITORIO,
  TERRITORIOS,
  validarBlocoEssencia,
} from '../../../lib/mapa-identidade/forms';

// Formulário consolidado da LIDERANÇA (Essência + Território de Valor).
// Um fluxo contínuo: 5 blocos da Essência + Território como bloco final.
// Salva e finaliza os DOIS formulários (essencia + territorio) por baixo,
// sem mudança de backend. Ao fim, mostra o território dominante.

const BLOCOS_ESS = FORM_ESSENCIA.blocos;       // 5 blocos
const TOTAL = BLOCOS_ESS.length + 1;           // + Território
const IDX_TERR = BLOCOS_ESS.length;            // índice do bloco de Território

export default function LiderancaForm() {
  const router = useRouter();
  const token = (router.query.token || '').toString();

  const [fase, setFase] = useState('loading'); // loading|erro|intro|form|enviando|resultado
  const [erro, setErro] = useState(null);
  const [cliente, setCliente] = useState('');
  const [ansEss, setAnsEss] = useState({});
  const [ansTer, setAnsTer] = useState({});
  const [blocoIdx, setBlocoIdx] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [e, t] = await Promise.all([
          fetch(`/api/identidade/session?token=${encodeURIComponent(token)}&form=essencia`).then((r) => r.json()),
          fetch(`/api/identidade/session?token=${encodeURIComponent(token)}&form=territorio`).then((r) => r.json()),
        ]);
        if (!e.success || !t.success) { setErro((e.error || t.error) || 'Link inválido'); setFase('erro'); return; }
        setCliente(e.cliente || t.cliente || '');
        setAnsEss(e.answers || {});
        setAnsTer(t.answers || {});
        if (e.submission_status === 'completed' && t.submission_status === 'completed' && t.computed) {
          setResultado(t.computed); setFase('resultado'); return;
        }
        const algum = Object.keys(e.answers || {}).length + Object.keys(t.answers || {}).length > 0;
        setFase(algum ? 'form' : 'intro');
      } catch { setErro('Não foi possível abrir o formulário.'); setFase('erro'); }
    })();
  }, [token]);

  const noTerritorio = blocoIdx === IDX_TERR;
  const blocoEss = BLOCOS_ESS[blocoIdx];

  const faltando = useMemo(() => {
    if (noTerritorio) return FORM_TERRITORIO.afirmacoes.filter((a) => typeof ansTer[a.code] !== 'number').map((a) => a.code);
    return validarBlocoEssencia(blocoEss, ansEss);
  }, [noTerritorio, blocoEss, ansEss, ansTer]);

  function setEss(code, v) { setAnsEss((p) => ({ ...p, [code]: v })); }
  function setTer(code, v) { setAnsTer((p) => ({ ...p, [code]: v })); }

  async function salvar(form, answers) {
    try {
      await fetch('/api/identidade/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, form, answers }),
      });
    } catch { /* best-effort; finalize revalida */ }
  }

  async function proximo() {
    if (faltando.length) { setTentou(true); return; }
    setTentou(false);
    setSalvando(true);
    if (noTerritorio) {
      await salvar('territorio', ansTer);
    } else {
      const lote = {};
      for (const c of blocoEss.campos) if (ansEss[c.code] !== undefined) lote[c.code] = ansEss[c.code];
      await salvar('essencia', lote);
    }
    setSalvando(false);

    if (blocoIdx < TOTAL - 1) {
      setBlocoIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await finalizar();
    }
  }

  function voltar() {
    setTentou(false);
    if (blocoIdx > 0) { setBlocoIdx((i) => i - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  async function finalizar() {
    setFase('enviando');
    await salvar('essencia', ansEss);
    await salvar('territorio', ansTer);
    try {
      const rE = await fetch('/api/identidade/finalize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, form: 'essencia' }) }).then((r) => r.json());
      const rT = await fetch('/api/identidade/finalize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, form: 'territorio' }) }).then((r) => r.json());
      if (!rE.success || !rT.success) { setErro((rE.error || rT.error) || 'Não foi possível concluir.'); setFase('erro'); return; }
      setResultado(rT.value_territory || rT.computed);
      setFase('resultado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { setErro('Falha ao concluir.'); setFase('erro'); }
  }

  return (
    <>
      <Head><title>Diagnóstico da Liderança — Identidade</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.4rem' }}><Logo size="md" center /></div>

        {fase === 'loading' && <Card><p style={sx.txtSec}>Carregando…</p></Card>}
        {fase === 'erro' && <Card><h2 style={{ marginTop: 0 }}>Ops</h2><p style={sx.txtSec}>{erro}</p></Card>}

        {fase === 'intro' && (
          <Card>
            <div style={sx.eyebrow}>Mapa de Identidade · Liderança</div>
            <h1 style={sx.h1}>Essência e Território de Valor</h1>
            {cliente && <p style={{ ...sx.txtSec, marginTop: '-0.1rem' }}>{cliente}</p>}
            <p style={sx.txtSec}>Esta etapa capta a visão da liderança sobre a marca em duas partes: a <b>essência</b> (propósito, diferenciação, cultura, tensões) e o <b>território de valor</b> do negócio. Responda com honestidade — não há resposta certa.</p>
            <p style={{ ...sx.txtSec, fontSize: '0.9rem' }}>Fundador / sócio / direção · 25 a 35 min · você pode salvar e continuar depois.</p>
            <button className="btn-primary" onClick={() => setFase('form')} style={{ marginTop: '0.6rem' }}>Iniciar</button>
          </Card>
        )}

        {fase === 'form' && (
          <Card wide>
            <Progresso atual={blocoIdx + 1} total={TOTAL} />
            {noTerritorio ? (
              <>
                <h2 style={sx.h2}>Bloco {TOTAL} de {TOTAL} — Território Estratégico de Valor</h2>
                <p style={{ ...sx.txtSec, fontSize: '0.9rem' }}>Avalie o quanto cada afirmação reflete a realidade e a estratégia da empresa.</p>
                <div style={{ marginTop: '1rem' }}>
                  {FORM_TERRITORIO.afirmacoes.map((a, i) => (
                    <div key={a.code} style={{ ...sx.afirmacao, ...(tentou && typeof ansTer[a.code] !== 'number' ? sx.afirmacaoErro : {}) }}>
                      <p style={sx.afirmacaoTxt}><span style={{ color: '#Da3144', fontWeight: 700 }}>{i + 1}.</span> {a.text}</p>
                      <div style={sx.opcoes}>
                        {ESCALA_TERRITORIO.map((opt) => (
                          <button key={opt.value} type="button" onClick={() => setTer(a.code, opt.value)} style={sx.opcao(ansTer[a.code] === opt.value)}>{opt.label}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 style={sx.h2}>Bloco {blocoIdx + 1} de {TOTAL} — {blocoEss.titulo}</h2>
                <div style={{ marginTop: '1.1rem' }}>
                  {blocoEss.campos.map((c) => (
                    <CampoIdentidade key={c.code} campo={c} valor={ansEss[c.code]} onChange={(v) => setEss(c.code, v)} erro={tentou && faltando.includes(c.code)} />
                  ))}
                </div>
              </>
            )}

            <div style={sx.navRow}>
              <button onClick={voltar} disabled={blocoIdx === 0 || salvando} style={sx.btnGhost(blocoIdx === 0 || salvando)}>← Voltar</button>
              <button className="btn-primary" onClick={proximo} disabled={salvando} style={{ opacity: salvando ? 0.6 : 1 }}>
                {blocoIdx < TOTAL - 1 ? 'Próximo →' : 'Ver resultado →'}
              </button>
            </div>
            {tentou && faltando.length > 0 && (
              <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.7rem' }}>
                {noTerritorio ? `Responda todas as ${FORM_TERRITORIO.afirmacoes.length} afirmações.` : 'Preencha os campos obrigatórios deste bloco para continuar.'}
              </p>
            )}
          </Card>
        )}

        {fase === 'enviando' && <Card><p style={sx.txtSec}>Concluindo o diagnóstico…</p></Card>}
        {fase === 'resultado' && resultado && <Resultado r={resultado} cliente={cliente} />}
      </div>
    </>
  );
}

function Resultado({ r, cliente }) {
  const linhas = [
    { code: 'EO', pct: r.scores.efficiency },
    { code: 'PP', pct: r.scores.proximity },
    { code: 'DI', pct: r.scores.differentiation },
  ].sort((a, b) => b.pct - a.pct);
  return (
    <Card wide>
      <div style={sx.selo}>✓</div>
      <h2 style={{ margin: '0 0 0.3rem', textAlign: 'center' }}>Diagnóstico da liderança concluído</h2>
      <p style={{ ...sx.txtSec, textAlign: 'center', marginBottom: '1.4rem' }}>Obrigado. As respostas de essência e território foram registradas.</p>

      <div style={sx.domBox}>
        <div style={sx.domAccent} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
          <div style={sx.eyebrow}>Território dominante</div>
          {r.is_hybrid && <span style={sx.hibridoTag}>Híbrido</span>}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#Da3144', marginTop: '0.2rem' }}>{r.dominant}</div>
        {r.is_hybrid && <p style={{ ...sx.txtSec, fontSize: '0.86rem', margin: '0.5rem 0 0' }}>⚠ {r.tensao}</p>}
      </div>

      <div style={{ marginTop: '1.1rem', display: 'grid', gap: '0.85rem' }}>
        {linhas.map((l, i) => (
          <div key={l.code}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              <span><span style={sx.rank}>{i + 1}º</span> {TERRITORIOS[l.code].nome}</span>
              <b style={{ color: i === 0 ? '#fca5b0' : 'var(--text-secondary,#9aa)' }}>{l.pct}%</b>
            </div>
            <div style={sx.barOut}><div style={{ ...sx.barIn, width: `${l.pct}%`, opacity: i === 0 ? 1 : 0.55 }} /></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Progresso({ atual, total }) {
  const pct = Math.round((atual / total) * 100);
  return (
    <div style={{ marginBottom: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={sx.prog}>Bloco {atual} de {total}</span><span style={sx.prog}>{pct}%</span>
      </div>
      <div style={sx.barOut}><div style={{ ...sx.barIn, width: `${pct}%` }} /></div>
    </div>
  );
}

function Card({ children, wide }) {
  return (
    <div className="glass-card" style={{ maxWidth: wide ? 700 : 540, width: '100%', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={sx.domAccent} />
      {children}
    </div>
  );
}

const sx = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem' },
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600, marginBottom: '0.3rem' },
  h1: { marginTop: 0, fontSize: '1.5rem' },
  h2: { fontSize: '1.2rem', margin: '0.4rem 0 0.2rem' },
  txtSec: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  prog: { fontSize: '0.78rem', color: 'var(--text-secondary, #9aa)' },
  afirmacao: { padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.07)' },
  afirmacaoErro: { background: 'rgba(218,49,68,0.05)' },
  afirmacaoTxt: { margin: '0 0 0.7rem', lineHeight: 1.5, fontSize: '0.97rem' },
  opcoes: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  opcao: (ativo) => ({
    flex: '1 1 auto', minWidth: 130, padding: '0.55rem 0.7rem', borderRadius: 8,
    border: ativo ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)',
    background: ativo ? 'rgba(218,49,68,0.18)' : 'rgba(255,255,255,0.03)',
    color: ativo ? '#fca5b0' : 'var(--text-secondary, #9aa)', fontSize: '0.85rem', cursor: 'pointer',
  }),
  navRow: { display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '1.6rem' },
  btnGhost: (disabled) => ({ background: 'none', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, color: 'var(--text-secondary, #9aa)', padding: '0.6rem 1rem', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1 }),
  selo: { width: 52, height: 52, borderRadius: 99, margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: '#86efac', background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.4)' },
  domBox: { position: 'relative', overflow: 'hidden', marginTop: '0.4rem', padding: '1.1rem 1.3rem', borderRadius: 14, background: 'rgba(218,49,68,0.10)', border: '1px solid rgba(218,49,68,0.25)' },
  domAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' },
  hibridoTag: { fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 99, color: '#fde68a', background: 'rgba(234,179,8,0.16)', whiteSpace: 'nowrap' },
  rank: { color: '#fca5b0', fontWeight: 700, fontSize: '0.82rem', marginRight: '0.2rem' },
  barOut: { height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  barIn: { height: '100%', background: 'linear-gradient(90deg, #Da3144, #f0667a)', borderRadius: 99 },
};
