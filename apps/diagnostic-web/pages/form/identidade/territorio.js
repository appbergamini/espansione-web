import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo, useState, useEffect } from 'react';
import Logo from '../../../components/Logo';
import { FORM_TERRITORIO, ESCALA_TERRITORIO, TERRITORIOS } from '../../../lib/mapa-identidade/forms';

// Formulário 2 — Território Estratégico de Valor (público, por token).
// 12 afirmações em escala 1–4 (categorias EO/PP/DI ocultas para não enviesar).
// Ao concluir, mostra o território dominante / secundário / híbrido.

export default function TerritorioForm() {
  const router = useRouter();
  const token = (router.query.token || '').toString();

  const [fase, setFase] = useState('loading'); // loading|erro|intro|form|enviando|resultado
  const [erro, setErro] = useState(null);
  const [cliente, setCliente] = useState('');
  const [answers, setAnswers] = useState({});
  const [resultado, setResultado] = useState(null);
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`/api/identidade/session?token=${encodeURIComponent(token)}&form=territorio`);
        const j = await r.json();
        if (!j.success) { setErro(j.error || 'Link inválido'); setFase('erro'); return; }
        setCliente(j.cliente || '');
        setAnswers(j.answers || {});
        if (j.submission_status === 'completed' && j.computed) { setResultado(j.computed); setFase('resultado'); return; }
        setFase(Object.keys(j.answers || {}).length > 0 ? 'form' : 'intro');
      } catch { setErro('Não foi possível abrir o formulário.'); setFase('erro'); }
    })();
  }, [token]);

  const total = FORM_TERRITORIO.afirmacoes.length;
  const respondidas = useMemo(() => FORM_TERRITORIO.afirmacoes.filter((a) => typeof answers[a.code] === 'number').length, [answers]);
  const completo = respondidas === total;

  function responder(code, value) { setAnswers((p) => ({ ...p, [code]: value })); }

  async function finalizar() {
    if (!completo) { setTentou(true); return; }
    setFase('enviando');
    try {
      await fetch('/api/identidade/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, form: 'territorio', answers }),
      });
      const r = await fetch('/api/identidade/finalize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, form: 'territorio' }),
      });
      const j = await r.json();
      if (!j.success) { setErro(j.error || 'Não foi possível concluir.'); setFase('erro'); return; }
      setResultado(j.value_territory || j.computed);
      setFase('resultado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { setErro('Falha ao concluir.'); setFase('erro'); }
  }

  return (
    <>
      <Head><title>Território Estratégico de Valor</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.4rem' }}><Logo size="md" center /></div>

        {fase === 'loading' && <Card><p style={sx.txtSec}>Carregando…</p></Card>}
        {fase === 'erro' && <Card><h2 style={{ marginTop: 0 }}>Ops</h2><p style={sx.txtSec}>{erro}</p></Card>}

        {fase === 'intro' && (
          <Card>
            <div style={sx.eyebrow}>Mapa de Identidade · Etapa 2</div>
            <h1 style={sx.h1}>{FORM_TERRITORIO.titulo}</h1>
            {cliente && <p style={{ ...sx.txtSec, marginTop: '-0.1rem' }}>{cliente}</p>}
            <p style={sx.txtSec}>Avalie o quanto cada afirmação reflete a realidade e a estratégia da empresa. O objetivo é identificar onde está o principal território de valor do negócio.</p>
            <p style={{ ...sx.txtSec, fontSize: '0.9rem' }}>{total} afirmações · {FORM_TERRITORIO.tempo}.</p>
            <button className="btn-primary" onClick={() => setFase('form')} style={{ marginTop: '0.6rem' }}>Iniciar</button>
          </Card>
        )}

        {fase === 'form' && (
          <Card wide>
            <Progresso atual={respondidas} total={total} />
            <div style={{ marginTop: '1rem' }}>
              {FORM_TERRITORIO.afirmacoes.map((a, i) => (
                <div key={a.code} style={{ ...sx.afirmacao, ...(tentou && typeof answers[a.code] !== 'number' ? sx.afirmacaoErro : {}) }}>
                  <p style={sx.afirmacaoTxt}><span style={{ color: '#Da3144', fontWeight: 700 }}>{i + 1}.</span> {a.text}</p>
                  <div style={sx.opcoes}>
                    {ESCALA_TERRITORIO.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => responder(a.code, opt.value)} style={sx.opcao(answers[a.code] === opt.value)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={sx.navRow}>
              <span />
              <button className="btn-primary" onClick={finalizar} style={{ opacity: completo ? 1 : 0.6 }}>Ver território →</button>
            </div>
            {tentou && !completo && <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.7rem' }}>Responda todas as {total} afirmações ({respondidas}/{total}).</p>}
          </Card>
        )}

        {fase === 'enviando' && <Card><p style={sx.txtSec}>Calculando o território…</p></Card>}
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
      <div style={sx.eyebrow}>Resultado · Território de Valor</div>
      <h1 style={sx.h1}>{cliente || 'Território Estratégico de Valor'}</h1>
      <p style={{ ...sx.txtSec, marginTop: '-0.1rem', fontSize: '0.9rem' }}>Onde está o principal território de valor do negócio</p>

      <div style={sx.domBox}>
        <div style={sx.domAccent} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem' }}>
          <div style={sx.eyebrow}>Território dominante</div>
          {r.is_hybrid && <span style={sx.hibridoTag}>Híbrido</span>}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#Da3144', marginTop: '0.2rem' }}>{r.dominant}</div>
        {r.is_hybrid && <p style={{ ...sx.txtSec, fontSize: '0.86rem', margin: '0.5rem 0 0' }}>⚠ {r.tensao}</p>}
      </div>

      <div style={sx.sectionLabel}>Os três territórios</div>
      <div style={{ display: 'grid', gap: '0.85rem' }}>
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
        <span style={sx.prog}>{atual} de {total}</span><span style={sx.prog}>{pct}%</span>
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
  h1: { marginTop: 0, fontSize: '1.5rem' },
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
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600 },
  sectionLabel: { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600, margin: '1.7rem 0 0.7rem' },
  domBox: { position: 'relative', overflow: 'hidden', marginTop: '1.1rem', padding: '1.1rem 1.3rem', borderRadius: 14, background: 'rgba(218,49,68,0.10)', border: '1px solid rgba(218,49,68,0.25)' },
  domAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' },
  hibridoTag: { fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 99, color: '#fde68a', background: 'rgba(234,179,8,0.16)', whiteSpace: 'nowrap' },
  rank: { color: '#fca5b0', fontWeight: 700, fontSize: '0.82rem', marginRight: '0.2rem' },
  barOut: { height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  barIn: { height: '100%', background: 'linear-gradient(90deg, #Da3144, #f0667a)', borderRadius: 99 },
};
