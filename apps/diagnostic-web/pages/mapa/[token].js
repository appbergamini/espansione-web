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
  SISTEMAS_MATURIDADE,
  CADASTRO_MATURIDADE,
  perguntasPorSistema,
  perguntasCondicionais,
  condicionalVisivel,
  obrigatoriasFaltando,
} from '../../lib/mapa-maturidade/catalog';

// =====================================================================
// Mapa da Maturidade (FINAL) — página pública (acesso por token).
// Fluxo: cadastro → 4 sistemas (10 perguntas cada + condicional de
// atributos de marca) → resultado vendedor. O score exibido é o
// AUTORITATIVO devolvido por /api/mapa/finalize (recomputado no servidor).
// =====================================================================

const CONDICIONAL = perguntasCondicionais()[0] || null; // MM2-MAR-10b (atributos de marca)

export default function MapaMaturidadePage() {
  const router = useRouter();
  const token = (router.query.token || '').toString();

  const [fase, setFase] = useState('loading'); // loading|erro|cadastro|intro|quiz|enviando|resultado
  const [erro, setErro] = useState(null);
  const [cliente, setCliente] = useState('');
  const [cadastro, setCadastro] = useState({});
  const [cadastroTentou, setCadastroTentou] = useState(false);
  const [answers, setAnswers] = useState({});
  const [atributos, setAtributos] = useState([]); // seleção do MM2-MAR-10b
  const [sistemaIdx, setSistemaIdx] = useState(0);
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
        setCadastro(data.cadastro || {});
        setAtributos(data.extras?.atributos_marca || []);
        if (data.status === 'concluido' && data.result) {
          setResult(data.result);
          setFase('resultado');
          return;
        }
        setAnswers(data.answers || {});
        const temCadastro = cadastroEssencialOk(data.cadastro || {});
        if (!temCadastro) { setFase('cadastro'); return; }
        setFase(Object.keys(data.answers || {}).length > 0 ? 'quiz' : 'intro');
      } catch {
        setErro('Não foi possível abrir o check-up.');
        setFase('erro');
      }
    })();
  }, [token]);

  // ── cadastro / lead ──────────────────────────────────────────────
  const cadastroCompleto = useMemo(() => cadastroEssencialOk(cadastro), [cadastro]);
  function setCad(id, v) { setCadastro((p) => ({ ...p, [id]: v })); }
  async function avancarCadastro() {
    if (!cadastroCompleto) { setCadastroTentou(true); return; }
    setSalvando(true);
    try {
      await fetch('/api/mapa/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, cadastro }),
      });
    } catch { /* best-effort */ }
    setSalvando(false);
    setFase('intro');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── quiz por sistema ─────────────────────────────────────────────
  const sistema = SISTEMAS_MATURIDADE[sistemaIdx];
  const perguntas = useMemo(() => (sistema ? perguntasPorSistema(sistema) : []), [sistema]);
  const mostraCondicional = CONDICIONAL && sistema === CONDICIONAL.sistema && condicionalVisivel(CONDICIONAL, answers);
  const sistemaCompleto = useMemo(
    () => perguntas.length > 0 && perguntas.every((q) => typeof answers[q.id] === 'number'),
    [perguntas, answers]
  );

  function responder(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }
  function toggleAtributo(a) {
    setAtributos((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function salvarSistema() {
    setSalvando(true);
    const lote = {};
    for (const q of perguntas) if (typeof answers[q.id] === 'number') lote[q.id] = answers[q.id];
    try {
      await fetch('/api/mapa/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers: lote, extras: { atributos_marca: atributos } }),
      });
    } catch { /* best-effort; finalize revalida */ }
    setSalvando(false);
  }

  async function proximoSistema() {
    await salvarSistema();
    if (sistemaIdx < SISTEMAS_MATURIDADE.length - 1) {
      setSistemaIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await finalizar();
    }
  }
  function voltarSistema() {
    if (sistemaIdx > 0) {
      setSistemaIdx((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ── finalização ──────────────────────────────────────────────────
  async function finalizar() {
    const faltando = obrigatoriasFaltando(answers);
    if (faltando.length) {
      // volta ao primeiro sistema com pendência
      const sisPend = SISTEMAS_MATURIDADE.findIndex((s) =>
        perguntasPorSistema(s).some((q) => faltando.includes(q.id))
      );
      setSistemaIdx(sisPend >= 0 ? sisPend : 0);
      setFase('quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFase('enviando');
    try {
      const r = await fetch('/api/mapa/finalize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await r.json();
      if (!data.success) { setErro(data.error || 'Não foi possível concluir.'); setFase('erro'); return; }
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
        <title>Mapa da Maturidade · Espansione</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.6rem' }}>
          <Logo size="md" center />
        </div>

        {fase === 'loading' && <Card><p style={sx.txtSec}>Carregando…</p></Card>}
        {fase === 'erro' && (
          <Card><h2 style={{ marginTop: 0 }}>Não foi possível abrir</h2><p style={sx.txtSec}>{erro}</p></Card>
        )}

        {fase === 'cadastro' && (
          <Card wide>
            <div style={sx.eyebrow}>Antes de começar</div>
            <h1 style={sx.h1}>Vamos conhecer sua empresa</h1>
            <p style={sx.txtSec}>
              O Mapa da Maturidade é um check-up rápido do seu negócio. Preencha seus dados para
              iniciar e receber o resultado.
            </p>
            <div style={{ marginTop: '1rem' }}>
              {CADASTRO_MATURIDADE.map((c) => (
                <CadastroCampo key={c.id} c={c} val={cadastro[c.id]} onChange={setCad} erro={cadastroTentou} />
              ))}
            </div>
            <div style={{ marginTop: '1.4rem', textAlign: 'right' }}>
              <button className="btn-primary" onClick={avancarCadastro} disabled={salvando}
                style={{ opacity: cadastroCompleto && !salvando ? 1 : 0.6 }}>
                Iniciar check-up →
              </button>
            </div>
            {cadastroTentou && !cadastroCompleto && (
              <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.6rem' }}>
                Preencha ao menos nome, empresa e contato para continuar.
              </p>
            )}
          </Card>
        )}

        {fase === 'intro' && (
          <Card>
            <div style={sx.eyebrow}>Check-up gratuito</div>
            <h1 style={sx.h1}>Mapa da Maturidade</h1>
            {cliente && <p style={{ ...sx.txtSec, marginTop: '-0.1rem' }}>{cliente}</p>}
            <p style={sx.txtSec}>
              Responda às afirmações considerando a realidade atual da empresa. Avaliamos 4 sistemas —
              Marca, Negócios, Comunicação e Pessoas — com 10 sinais cada.
            </p>
            <div style={sx.aviso}>
              Use <b>"Não sei/Não se aplica"</b> apenas quando a afirmação realmente não fizer sentido
              para a empresa. Se a prática existe pouco ou ainda não foi estruturada, escolha
              <b> "Nunca"</b> ou <b>"Poucas vezes"</b>.
            </div>
            <button className="btn-primary" onClick={() => setFase('quiz')} style={{ marginTop: '0.6rem' }}>
              Iniciar check-up
            </button>
          </Card>
        )}

        {fase === 'quiz' && sistema && (
          <Card wide>
            <Progresso atual={sistemaIdx + 1} total={SISTEMAS_MATURIDADE.length} rotulo="Sistema" />
            <h2 style={sx.h2}>Sistema {sistemaIdx + 1} de {SISTEMAS_MATURIDADE.length} — {sistema}</h2>

            <div style={{ marginTop: '1.4rem' }}>
              {perguntas.map((q, i) => (
                <Afirmacao key={q.id} numero={i + 1} pergunta={q} valor={answers[q.id]}
                  onSelect={(v) => responder(q.id, v)} />
              ))}

              {mostraCondicional && (
                <div style={sx.condicional}>
                  <p style={sx.afirmacaoTxt}>{CONDICIONAL.pergunta}</p>
                  <div style={sx.opcoes}>
                    {CONDICIONAL.opcoes.map((a) => (
                      <button key={a} type="button" onClick={() => toggleAtributo(a)}
                        style={sx.opcao(atributos.includes(a))}>
                        {atributos.includes(a) ? '✓ ' : ''}{a}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={sx.navRow}>
              <button onClick={voltarSistema} disabled={sistemaIdx === 0 || salvando}
                style={sx.btnGhost(sistemaIdx === 0 || salvando)}>← Voltar</button>
              <button className="btn-primary" onClick={proximoSistema} disabled={!sistemaCompleto || salvando}
                style={{ opacity: sistemaCompleto && !salvando ? 1 : 0.5 }}>
                {sistemaIdx < SISTEMAS_MATURIDADE.length - 1 ? 'Próximo sistema →' : 'Ver resultado →'}
              </button>
            </div>
          </Card>
        )}

        {fase === 'enviando' && <Card><p style={sx.txtSec}>Calculando seu Mapa da Maturidade…</p></Card>}

        {fase === 'resultado' && result && <Resultado result={result} cliente={cliente} token={token} />}
      </div>
    </>
  );
}

// ── componentes de apoio ─────────────────────────────────────────────

function cadastroEssencialOk(cad) {
  return ['CAD-MM-001', 'CAD-MM-002', 'CAD-MM-006'].every((id) => String(cad?.[id] || '').trim());
}

function Afirmacao({ numero, pergunta, valor, onSelect }) {
  return (
    <div style={sx.afirmacao}>
      <p style={sx.afirmacaoTxt}>
        <span style={sx.afirmacaoNum}>{numero}.</span> {pergunta.pergunta}
      </p>
      <div style={sx.opcoes}>
        {pergunta.opcoes.map((opt) =>
          opt.value === -1 ? (
            <button key={opt.value} type="button" onClick={() => onSelect(opt.value)}
              style={sx.opcaoNaoSei(valor === opt.value)}
              title="Não reduz nem aumenta a pontuação; apenas remove esta afirmação do cálculo.">
              {opt.label}
            </button>
          ) : (
            <button key={opt.value} type="button" onClick={() => onSelect(opt.value)} style={sx.opcao(valor === opt.value)}>
              {opt.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

function CadastroCampo({ c, val, onChange, erro }) {
  const essencial = ['CAD-MM-001', 'CAD-MM-002', 'CAD-MM-006'].includes(c.id);
  const vazio = !String(val || '').trim();
  const borda = erro && essencial && vazio ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)';
  return (
    <div style={sx.ctxCampo}>
      <label style={sx.ctxLabel}>
        {c.pergunta} {essencial && <span style={{ color: '#Da3144' }}>*</span>}
      </label>
      {c.response_type === 'selecao_unica' ? (
        <div style={sx.opcoes}>
          {c.opcoes.map((opt) => (
            <button key={opt} type="button" onClick={() => onChange(c.id, opt)} style={sx.opcao(val === opt)}>
              {val === opt ? '✓ ' : ''}{opt}
            </button>
          ))}
        </div>
      ) : (
        <input value={val || ''} onChange={(e) => onChange(c.id, e.target.value)}
          style={{ ...sx.ctxInput, border: borda }} />
      )}
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
      <div style={sx.barraOut}><div style={{ ...sx.barraIn, width: `${pct}%` }} /></div>
    </div>
  );
}

const NIVEL_TAG_COR = {
  1: { bg: 'rgba(239,68,68,0.18)', fg: '#fca5a5' },
  2: { bg: 'rgba(239,68,68,0.18)', fg: '#fca5a5' },
  3: { bg: 'rgba(234,179,8,0.16)', fg: '#fde68a' },
  4: { bg: 'rgba(34,197,94,0.16)', fg: '#86efac' },
};

function Resultado({ result, cliente, token }) {
  const radarData = (result.sistemas || []).map((s) => ({ eixo: s.sistema, valor: s.nota ?? 0 }));
  return (
    <Card wide>
      <div style={sx.eyebrow}>Resultado · Mapa da Maturidade</div>
      <h1 style={sx.h1}>{cliente || 'Mapa da Maturidade'}</h1>
      <p style={{ ...sx.txtSec, marginTop: '-0.1rem', fontSize: '0.9rem' }}>Check-up de maturidade do negócio</p>

      <div style={sx.indiceBox}>
        <div style={sx.indiceAccent} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={sx.indiceNum}>{result.general_score != null ? Math.round(result.general_score) : '—'}</span>
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary,#9aa)' }}>/100</span>
          <span style={{ marginLeft: 'auto', fontSize: '1.05rem', fontWeight: 700 }}>
            {result.general_nivel ? `Nível ${result.general_nivel} — ` : ''}{result.general_level}
          </span>
        </div>
        <div style={sx.gaugeOut}><div style={{ ...sx.gaugeIn, width: `${Math.round(result.general_score || 0)}%` }} /></div>
        <div style={sx.eyebrow}>Índice Geral</div>
      </div>
      {result.general_leitura && <p style={{ ...sx.txtSec, fontSize: '0.9rem', marginTop: '0.7rem' }}>{result.general_leitura}</p>}

      <div style={sx.sectionLabel}>Panorama dos 4 sistemas</div>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <RadarChart data={radarData} outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,0.12)" />
            <PolarAngleAxis dataKey="eixo" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} angle={90} />
            <Radar dataKey="valor" stroke="#Da3144" fill="#Da3144" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={sx.sectionLabel}>Leitura por sistema</div>
      <div style={{ display: 'grid', gap: '0.9rem' }}>
        {(result.sistemas || []).map((s) => {
          const cor = NIVEL_TAG_COR[s.nivel] || NIVEL_TAG_COR[2];
          const nota = s.nota == null ? null : Math.round(s.nota);
          return (
            <div key={s.sistema} style={sx.pilarCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                <strong style={{ fontSize: '1.02rem' }}>{s.sistema}</strong>
                <span style={{ ...sx.nivelTagBase, background: cor.bg, color: cor.fg }}>
                  {s.nivel ? `Nível ${s.nivel} — ${s.nivel_nome}` : 'Sem dados'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.5rem 0' }}>
                <div style={sx.miniBarOut}><div style={{ ...sx.miniBarIn, width: `${nota ?? 0}%` }} /></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary,#9aa)', whiteSpace: 'nowrap' }}>
                  {nota != null ? `${nota}%` : '—'}
                </span>
              </div>
              {s.leitura && <p style={{ ...sx.txtSec, fontSize: '0.9rem', margin: 0 }}>{s.leitura}</p>}
            </div>
          );
        })}
      </div>

      {result.atributos_marca?.length > 0 && (
        <>
          <div style={sx.sectionLabel}>Atributos de marca percebidos</div>
          <div style={sx.opcoes}>
            {result.atributos_marca.map((a) => <span key={a} style={sx.chip}>{a}</span>)}
          </div>
        </>
      )}

      <div style={sx.ctaAprofundar}>
        <strong style={{ color: '#fca5b0' }}>Próximo passo: Mapa da Identidade Estratégica</strong>
        <p style={{ ...sx.txtSec, fontSize: '0.88rem', margin: '0.4rem 0 0' }}>
          O check-up mostra onde estão os sinais. O Mapa da Identidade investiga as causas e o caminho
          para evoluir. Baixe o relatório completo para ver o diagnóstico por sistema.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.4rem' }}>
        <a className="btn-primary" href={`/api/mapa/report?token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          📄 Ver relatório completo
        </a>
        <a href={`/api/mapa/report?token=${encodeURIComponent(token)}&print=1`} target="_blank" rel="noreferrer" style={{ ...sx.btnGhostResult, textDecoration: 'none' }}>
          ⬇ Baixar PDF
        </a>
      </div>
    </Card>
  );
}

function Card({ children, wide }) {
  return (
    <div className="glass-card" style={{ maxWidth: wide ? 720 : 540, width: '100%', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={sx.indiceAccent} />
      {children}
    </div>
  );
}

// ── estilos ──────────────────────────────────────────────────────────
const sx = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem' },
  h1: { marginTop: 0, fontSize: '1.6rem' },
  h2: { fontSize: '1.25rem', margin: '0.4rem 0 0.2rem' },
  txtSec: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  progLabel: { fontSize: '0.78rem', color: 'var(--text-secondary, #9aa)' },
  barraOut: { height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  barraIn: { height: '100%', background: 'linear-gradient(90deg, #Da3144, #f0667a)', transition: 'width 0.3s ease' },
  navRow: { display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '1.6rem' },
  btnGhost: (disabled) => ({
    background: 'none', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8,
    color: 'var(--text-secondary, #9aa)', padding: '0.6rem 1rem',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1,
  }),
  afirmacao: { padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.07)' },
  afirmacaoTxt: { margin: '0 0 0.7rem', lineHeight: 1.5, fontSize: '0.98rem' },
  afirmacaoNum: { color: '#Da3144', fontWeight: 700, marginRight: '0.2rem' },
  condicional: { padding: '1rem 0', borderTop: '1px solid rgba(218,49,68,0.25)', marginTop: '0.4rem' },
  opcoes: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  opcao: (ativo) => ({
    flex: '1 1 auto', minWidth: 110, padding: '0.55rem 0.7rem', borderRadius: 8,
    border: ativo ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)',
    background: ativo ? 'rgba(218,49,68,0.18)' : 'rgba(255,255,255,0.03)',
    color: ativo ? '#fca5b0' : 'var(--text-secondary, #9aa)',
    fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.15s ease',
  }),
  opcaoNaoSei: (ativo) => ({
    flex: '0 0 auto', padding: '0.55rem 0.9rem', borderRadius: 8,
    border: ativo ? '1px dashed #9aa3ad' : '1px dashed rgba(255,255,255,0.16)',
    background: ativo ? 'rgba(255,255,255,0.08)' : 'transparent',
    color: ativo ? '#cbd5e1' : 'var(--text-secondary, #9aa)',
    fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.15s ease',
  }),
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600 },
  aviso: { marginTop: '0.9rem', padding: '0.75rem 0.9rem', borderRadius: 8, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', color: 'var(--text-secondary, #9aa)', fontSize: '0.84rem', lineHeight: 1.55 },
  ctxCampo: { padding: '0.9rem 0', borderTop: '1px solid rgba(255,255,255,0.07)' },
  ctxLabel: { display: 'block', marginBottom: '0.55rem', lineHeight: 1.45, fontSize: '0.96rem' },
  ctxInput: { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.85rem', fontSize: '0.95rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: 'inherit', fontFamily: 'inherit' },
  sectionLabel: { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600, margin: '1.7rem 0 0.7rem' },
  indiceBox: { position: 'relative', overflow: 'hidden', padding: '1.2rem 1.3rem', borderRadius: 14, background: 'rgba(218,49,68,0.10)', border: '1px solid rgba(218,49,68,0.25)', marginTop: '1.1rem' },
  indiceAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' },
  indiceNum: { fontSize: '3rem', fontWeight: 800, color: '#Da3144', lineHeight: 1 },
  gaugeOut: { height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', margin: '0.6rem 0 0.45rem' },
  gaugeIn: { height: '100%', background: 'linear-gradient(90deg, #Da3144, #f0667a)', borderRadius: 99 },
  pilarCard: { padding: '1rem 1.1rem', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' },
  nivelTagBase: { fontSize: '0.74rem', padding: '0.2rem 0.55rem', borderRadius: 99, whiteSpace: 'nowrap' },
  miniBarOut: { flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  miniBarIn: { height: '100%', background: '#Da3144', borderRadius: 99 },
  chip: { fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', borderRadius: 99, padding: '0.28rem 0.7rem' },
  ctaAprofundar: { marginTop: '1.8rem', padding: '1.1rem 1.2rem', borderRadius: 12, background: 'rgba(218,49,68,0.10)', border: '1px solid rgba(218,49,68,0.25)' },
  btnGhostResult: { background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: 'var(--text-secondary, #9aa)', padding: '0.7rem 1.1rem', cursor: 'pointer', fontSize: '0.9rem' },
};
