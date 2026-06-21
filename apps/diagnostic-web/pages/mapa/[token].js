import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import Logo from '../../components/Logo';
import {
  PILARES_ORDENADOS,
  PILAR_BY_CODE,
  ESCALA,
  APROFUNDAMENTO_BY_PILAR,
} from '../../lib/mapa-maturidade/pilares';
import { buildResult } from '../../lib/mapa-maturidade/scoring';

// =====================================================================
// Mapa de Maturidade Espansione — página pública (acesso por token)
// Fluxo: intro → 30 obrigatórias (1 pilar por tela) → aprofundamento
// adaptativo (só pilares Nível 1/2) → resultado.
// O score exibido é o AUTORITATIVO devolvido por /api/mapa/finalize
// (recomputado no servidor a partir das respostas persistidas).
// =====================================================================

export default function MapaMaturidadePage() {
  const router = useRouter();
  const token = (router.query.token || '').toString();

  const [fase, setFase] = useState('loading'); // loading|erro|intro|quiz|aprofundamento|enviando|resultado
  const [erro, setErro] = useState(null);
  const [cliente, setCliente] = useState('');
  const [answers, setAnswers] = useState({}); // obrigatórias {code:value}
  const [deepAnswers, setDeepAnswers] = useState({}); // aprofundamento {code:value}
  const [pilarIdx, setPilarIdx] = useState(0);
  const [deepList, setDeepList] = useState([]); // pilares selecionados p/ aprofundar
  const [deepIdx, setDeepIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // ── carga inicial ────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`/api/mapa/session?token=${encodeURIComponent(token)}`);
        const data = await r.json();
        if (!data.success) {
          setErro(data.error || 'Link inválido');
          setFase('erro');
          return;
        }
        setCliente(data.cliente || '');
        if (data.status === 'concluido' && data.result) {
          setResult(data.result);
          setFase('resultado');
          return;
        }
        setAnswers(data.answers || {});
        setDeepAnswers(data.deepening_answers || {});
        const temRespostas = Object.keys(data.answers || {}).length > 0;
        setFase(temRespostas ? 'quiz' : 'intro');
      } catch (e) {
        setErro('Não foi possível abrir o diagnóstico.');
        setFase('erro');
      }
    })();
  }, [token]);

  // ── persistência ─────────────────────────────────────────────────
  async function salvarRespostas(obj) {
    try {
      await fetch('/api/mapa/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers: obj, status: 'em_andamento' }),
      });
    } catch {
      /* salvamento progressivo é best-effort; finalize revalida tudo */
    }
  }

  // ── quiz obrigatório (pilar por pilar) ───────────────────────────
  const pilar = PILARES_ORDENADOS[pilarIdx];
  const pilarCompleto = useMemo(
    () => (pilar ? pilar.perguntas.every((q) => typeof answers[q.code] === 'number') : false),
    [pilar, answers]
  );

  function responder(code, value) {
    setAnswers((prev) => ({ ...prev, [code]: value }));
  }

  async function proximoPilar() {
    setSalvando(true);
    const lote = {};
    for (const q of pilar.perguntas) lote[q.code] = answers[q.code];
    await salvarRespostas(lote);
    setSalvando(false);

    if (pilarIdx < PILARES_ORDENADOS.length - 1) {
      setPilarIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // última etapa obrigatória → decide aprofundamento (client-side, prévia)
    const previa = buildResult(answers);
    const selecionados = previa.deepening_pillars || [];
    if (selecionados.length === 0) {
      await finalizar();
    } else {
      setDeepList(selecionados);
      setDeepIdx(0);
      setFase('aprofundamento');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function voltarPilar() {
    if (pilarIdx > 0) {
      setPilarIdx((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ── aprofundamento ───────────────────────────────────────────────
  const deepPilarCode = deepList[deepIdx];
  const deepPerguntas = deepPilarCode ? APROFUNDAMENTO_BY_PILAR[deepPilarCode] || [] : [];
  const deepCompleto = deepPerguntas.every((q) => typeof deepAnswers[q.code] === 'number');

  function responderDeep(code, value) {
    setDeepAnswers((prev) => ({ ...prev, [code]: value }));
  }

  async function proximoDeep() {
    setSalvando(true);
    const lote = {};
    for (const q of deepPerguntas) lote[q.code] = deepAnswers[q.code];
    await salvarRespostas(lote);
    setSalvando(false);

    if (deepIdx < deepList.length - 1) {
      setDeepIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await finalizar();
    }
  }

  // ── finalização (resultado autoritativo) ─────────────────────────
  async function finalizar() {
    setFase('enviando');
    try {
      const r = await fetch('/api/mapa/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await r.json();
      if (!data.success) {
        setErro(data.error || 'Não foi possível concluir o diagnóstico.');
        setFase('erro');
        return;
      }
      setResult(data.result);
      setFase('resultado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErro('Falha ao concluir. Tente novamente.');
      setFase('erro');
    }
  }

  // ── render ───────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Mapa de Maturidade Espansione</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.6rem' }}>
          <Logo size="md" center />
        </div>

        {fase === 'loading' && (
          <Card>
            <p style={sx.txtSec}>Carregando…</p>
          </Card>
        )}

        {fase === 'erro' && (
          <Card>
            <h2 style={{ marginTop: 0 }}>Não foi possível abrir</h2>
            <p style={sx.txtSec}>{erro}</p>
          </Card>
        )}

        {fase === 'intro' && (
          <Card>
            <h1 style={sx.h1}>Mapa de Maturidade Espansione</h1>
            {cliente && <p style={{ ...sx.txtSec, marginTop: '-0.4rem' }}>{cliente}</p>}
            <p style={sx.txtSec}>
              Responda às afirmações considerando a realidade atual da empresa. O objetivo é
              identificar o estágio de maturidade nos pilares que sustentam o crescimento.
            </p>
            <p style={{ ...sx.txtSec, fontSize: '0.9rem' }}>
              São {PILARES_ORDENADOS.length} pilares, com afirmações objetivas. Leva poucos minutos.
            </p>
            <button className="btn-primary" onClick={() => setFase('quiz')} style={{ marginTop: '0.6rem' }}>
              Iniciar diagnóstico
            </button>
          </Card>
        )}

        {fase === 'quiz' && pilar && (
          <Card wide>
            <Progresso atual={pilarIdx + 1} total={PILARES_ORDENADOS.length} rotulo="Pilar" />
            <h2 style={sx.h2}>
              Pilar {pilarIdx + 1} de {PILARES_ORDENADOS.length} — {pilar.name}
            </h2>
            {pilar.description && <p style={{ ...sx.txtSec, fontSize: '0.9rem' }}>{pilar.description}</p>}

            <div style={{ marginTop: '1.4rem' }}>
              {pilar.perguntas.map((q, i) => (
                <Afirmacao
                  key={q.code}
                  numero={i + 1}
                  texto={q.text}
                  valor={answers[q.code]}
                  onSelect={(v) => responder(q.code, v)}
                />
              ))}
            </div>

            <div style={sx.navRow}>
              <button onClick={voltarPilar} disabled={pilarIdx === 0 || salvando} style={sx.btnGhost(pilarIdx === 0 || salvando)}>
                ← Voltar
              </button>
              <button className="btn-primary" onClick={proximoPilar} disabled={!pilarCompleto || salvando} style={{ opacity: pilarCompleto && !salvando ? 1 : 0.5 }}>
                {pilarIdx < PILARES_ORDENADOS.length - 1 ? 'Próximo pilar →' : 'Concluir etapa →'}
              </button>
            </div>
          </Card>
        )}

        {fase === 'aprofundamento' && deepPilarCode && (
          <Card wide>
            <Progresso atual={deepIdx + 1} total={deepList.length} rotulo="Aprofundamento" />
            <p style={sx.txtSec}>
              Alguns pilares precisam de uma leitura mais precisa. Responda às próximas afirmações
              para aprofundar o diagnóstico.
            </p>
            <h2 style={sx.h2}>{PILAR_BY_CODE[deepPilarCode]?.name}</h2>

            <div style={{ marginTop: '1.2rem' }}>
              {deepPerguntas.map((q, i) => (
                <Afirmacao
                  key={q.code}
                  numero={i + 1}
                  texto={q.text}
                  valor={deepAnswers[q.code]}
                  onSelect={(v) => responderDeep(q.code, v)}
                />
              ))}
            </div>

            <div style={sx.navRow}>
              <span />
              <button className="btn-primary" onClick={proximoDeep} disabled={!deepCompleto || salvando} style={{ opacity: deepCompleto && !salvando ? 1 : 0.5 }}>
                {deepIdx < deepList.length - 1 ? 'Próximo →' : 'Ver resultado →'}
              </button>
            </div>
          </Card>
        )}

        {fase === 'enviando' && (
          <Card>
            <p style={sx.txtSec}>Calculando seu Mapa de Maturidade…</p>
          </Card>
        )}

        {fase === 'resultado' && result && <Resultado result={result} cliente={cliente} />}
      </div>
    </>
  );
}

// ── componentes de apoio ─────────────────────────────────────────────

function Afirmacao({ numero, texto, valor, onSelect }) {
  return (
    <div style={sx.afirmacao}>
      <p style={sx.afirmacaoTxt}>
        <span style={sx.afirmacaoNum}>{numero}.</span> {texto}
      </p>
      <div style={sx.opcoes}>
        {ESCALA.map((opt) => {
          const ativo = valor === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              style={sx.opcao(ativo)}
              type="button"
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Progresso({ atual, total, rotulo }) {
  const pct = Math.round((atual / total) * 100);
  return (
    <div style={{ marginBottom: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={sx.progLabel}>{rotulo} {atual} de {total}</span>
        <span style={sx.progLabel}>{pct}%</span>
      </div>
      <div style={sx.barraOut}>
        <div style={{ ...sx.barraIn, width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Resultado({ result, cliente }) {
  const radarData = result.pillars.map((p) => ({ eixo: encurtar(p.name), valor: p.percentage_score }));
  return (
    <Card wide>
      <h1 style={sx.h1}>Mapa de Maturidade</h1>
      {cliente && <p style={{ ...sx.txtSec, marginTop: '-0.4rem' }}>{cliente}</p>}

      {/* Índice geral */}
      <div style={sx.indiceBox}>
        <div style={sx.indiceNum}>{result.general_score}</div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary,#9aa)' }}>Índice Geral Espansione</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{result.general_level}</div>
        </div>
      </div>

      {result.alert && <div style={sx.alerta}>⚠ {result.alert}</div>}

      {/* Radar */}
      <div style={{ width: '100%', height: 320, marginTop: '1rem' }}>
        <ResponsiveContainer>
          <RadarChart data={radarData} outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,0.12)" />
            <PolarAngleAxis dataKey="eixo" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} angle={90} />
            <Radar dataKey="valor" stroke="#Da3144" fill="#Da3144" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Cards por pilar */}
      <div style={{ marginTop: '1.4rem', display: 'grid', gap: '0.9rem' }}>
        {result.pillars.map((p) => (
          <div key={p.code} style={sx.pilarCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1.02rem' }}>{p.name}</strong>
              <span style={sx.nivelTag(p.level)}>Nível {p.level} — {p.level_name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.5rem 0' }}>
              <div style={sx.miniBarOut}>
                <div style={{ ...sx.miniBarIn, width: `${p.percentage_score}%` }} />
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary,#9aa)', whiteSpace: 'nowrap' }}>
                {p.percentage_score}% · {p.raw_score}/{p.max_score}
              </span>
            </div>
            <p style={{ ...sx.txtSec, fontSize: '0.9rem', margin: 0 }}>{p.interpretation}</p>
            {p.critical_gap && <p style={sx.lacuna}>Lacunas críticas identificadas neste pilar.</p>}
          </div>
        ))}
      </div>

      {/* Prioridades / trilhas */}
      {result.recommendations?.length > 0 && (
        <>
          <h3 style={{ marginTop: '1.8rem', marginBottom: '0.6rem' }}>Prioridades recomendadas</h3>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {result.recommendations.map((rec) => (
              <div key={rec.pillar_code} style={sx.recCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <strong>{rec.trail}</strong>
                  <span style={sx.prioTag(rec.priority)}>{rec.priority}</span>
                </div>
                <p style={{ ...sx.txtSec, fontSize: '0.85rem', margin: '0.3rem 0 0' }}>{rec.reason}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ ...sx.navRow, marginTop: '1.8rem' }}>
        <button style={sx.btnGhost(true)} disabled title="Em breve">
          Baixar relatório (em breve)
        </button>
        <button style={sx.btnGhost(true)} disabled title="Em breve">
          Mapa de Identidade Estratégica (em breve)
        </button>
      </div>
    </Card>
  );
}

function Card({ children, wide }) {
  return (
    <div className="glass-card" style={{ maxWidth: wide ? 720 : 540, width: '100%', padding: '2rem' }}>
      {children}
    </div>
  );
}

function encurtar(nome) {
  return nome
    .replace('Direção Estratégica', 'Direção')
    .replace('Identidade Estratégica', 'Identidade')
    .replace('Cultura e Pessoas', 'Cultura');
}

// ── estilos ──────────────────────────────────────────────────────────
const sx = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2.5rem 1rem',
  },
  h1: { marginTop: 0, fontSize: '1.6rem' },
  h2: { fontSize: '1.25rem', margin: '0.4rem 0 0.2rem' },
  txtSec: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  progLabel: { fontSize: '0.78rem', color: 'var(--text-secondary, #9aa)' },
  barraOut: { height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  barraIn: { height: '100%', background: '#Da3144', transition: 'width 0.3s ease' },
  navRow: { display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '1.6rem' },
  btnGhost: (disabled) => ({
    background: 'none',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 8,
    color: 'var(--text-secondary, #9aa)',
    padding: '0.6rem 1rem',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.45 : 1,
  }),
  afirmacao: {
    padding: '1rem 0',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },
  afirmacaoTxt: { margin: '0 0 0.7rem', lineHeight: 1.5, fontSize: '0.98rem' },
  afirmacaoNum: { color: '#Da3144', fontWeight: 700, marginRight: '0.2rem' },
  opcoes: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  opcao: (ativo) => ({
    flex: '1 1 auto',
    minWidth: 110,
    padding: '0.55rem 0.7rem',
    borderRadius: 8,
    border: ativo ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)',
    background: ativo ? 'rgba(218,49,68,0.18)' : 'rgba(255,255,255,0.03)',
    color: ativo ? '#fca5b0' : 'var(--text-secondary, #9aa)',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }),
  indiceBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.2rem',
    borderRadius: 12,
    background: 'rgba(218,49,68,0.10)',
    border: '1px solid rgba(218,49,68,0.25)',
    marginTop: '1rem',
  },
  indiceNum: { fontSize: '2.6rem', fontWeight: 800, color: '#Da3144', lineHeight: 1 },
  alerta: {
    marginTop: '0.9rem',
    padding: '0.7rem 0.9rem',
    borderRadius: 8,
    background: 'rgba(234,179,8,0.10)',
    border: '1px solid rgba(234,179,8,0.3)',
    color: '#fde68a',
    fontSize: '0.88rem',
  },
  pilarCard: {
    padding: '1rem 1.1rem',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  nivelTag: (level) => ({
    fontSize: '0.74rem',
    padding: '0.2rem 0.55rem',
    borderRadius: 99,
    whiteSpace: 'nowrap',
    background: ['rgba(239,68,68,0.18)', 'rgba(239,68,68,0.18)', 'rgba(234,179,8,0.16)', 'rgba(34,197,94,0.16)'][level - 1],
    color: ['#fca5a5', '#fca5a5', '#fde68a', '#86efac'][level - 1],
  }),
  miniBarOut: { flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  miniBarIn: { height: '100%', background: '#Da3144', borderRadius: 99 },
  lacuna: { color: '#fca5a5', fontSize: '0.8rem', margin: '0.5rem 0 0' },
  recCard: {
    padding: '0.8rem 1rem',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  prioTag: (prio) => ({
    fontSize: '0.72rem',
    padding: '0.2rem 0.55rem',
    borderRadius: 99,
    whiteSpace: 'nowrap',
    background: prio === 'Alta' ? 'rgba(239,68,68,0.18)' : prio === 'Média' ? 'rgba(234,179,8,0.16)' : 'rgba(34,197,94,0.16)',
    color: prio === 'Alta' ? '#fca5a5' : prio === 'Média' ? '#fde68a' : '#86efac',
  }),
};
