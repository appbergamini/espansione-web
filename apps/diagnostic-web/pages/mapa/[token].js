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
import {
  SISTEMAS_MATURIDADE,
  CADASTRO_MATURIDADE,
  perguntasPorSistema,
  perguntasCondicionais,
  condicionalVisivel,
  obrigatoriasFaltando,
} from '../../lib/mapa-maturidade/catalog';
import { MapaShell, MapaCard as Card, sx, CORES, NIVEL_TAG_COR } from '../../components/mapa/mapaTheme';

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
    <MapaShell>
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
              <button className="mapa-btn" onClick={avancarCadastro} disabled={salvando}
                style={{ opacity: cadastroCompleto && !salvando ? 1 : 0.6 }}>
                Iniciar check-up →
              </button>
            </div>
            {cadastroTentou && !cadastroCompleto && (
              <p style={{ color: '#C72638', fontSize: '0.82rem', marginTop: '0.6rem' }}>
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
            <button className="mapa-btn" onClick={() => setFase('quiz')} style={{ marginTop: '0.6rem' }}>
              Iniciar check-up
            </button>
          </Card>
        )}

        {fase === 'quiz' && sistema && (
          <Card wide>
            <Progresso atual={sistemaIdx + 1} total={SISTEMAS_MATURIDADE.length} rotulo="Bloco" />
            <h2 style={sx.h2}>Bloco {sistemaIdx + 1} de {SISTEMAS_MATURIDADE.length} — {sistema}</h2>

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
              <button className="mapa-btn" onClick={proximoSistema} disabled={!sistemaCompleto || salvando}
                style={{ opacity: sistemaCompleto && !salvando ? 1 : 0.5 }}>
                {sistemaIdx < SISTEMAS_MATURIDADE.length - 1 ? 'Próximo bloco →' : 'Ver resultado →'}
              </button>
            </div>
          </Card>
        )}

        {fase === 'enviando' && <Card><p style={sx.txtSec}>Calculando seu Mapa da Maturidade…</p></Card>}

        {fase === 'resultado' && result && <Resultado result={result} cliente={cliente} token={token} />}
    </MapaShell>
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
      <div className="escala-opcoes">
        {pergunta.opcoes.map((opt) =>
          opt.value === -1 ? (
            <button key={opt.value} type="button" className="naosei" onClick={() => onSelect(opt.value)}
              style={sx.opcaoNaoSei(valor === opt.value)}
              title="Não reduz nem aumenta a pontuação; apenas remove esta afirmação do cálculo.">
              {opt.label}
            </button>
          ) : (
            <button key={opt.value} type="button" onClick={() => onSelect(opt.value)} style={{ ...sx.opcao(valor === opt.value), textAlign: 'center', justifyContent: 'center' }}>
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
  const borda = erro && essencial && vazio ? '1px solid #C72638' : '1px solid rgba(255,255,255,0.16)';
  return (
    <div style={sx.ctxCampo}>
      <label style={sx.ctxLabel}>
        {c.pergunta} {essencial && <span style={{ color: '#C72638' }}>*</span>}
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


function Resultado({ result, cliente, token }) {
  const radarData = (result.sistemas || []).map((s) => ({ eixo: s.sistema, valor: s.nota ?? 0 }));
  return (
    <Card wide>
      <div style={sx.eyebrow}>Resultado · Mapa da Maturidade</div>
      <h1 style={sx.h1}>{cliente || 'Mapa da Maturidade'}</h1>
      <p style={{ ...sx.txtSec, marginTop: '-0.1rem', fontSize: '0.9rem' }}>Check-up de maturidade do negócio</p>

      <div style={sx.indiceBox}>
        <div style={sx.accent} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={sx.indiceNum}>{result.general_score != null ? Math.round(result.general_score) : '—'}</span>
          <span style={{ fontSize: '1rem', color: '#5B6B7F' }}>/100</span>
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
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="eixo" tick={{ fill: '#334155', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} angle={90} />
            <Radar dataKey="valor" stroke="#C72638" fill="#C72638" fillOpacity={0.35} />
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
                <span style={{ fontSize: '0.85rem', color: '#5B6B7F', whiteSpace: 'nowrap' }}>
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
        <strong style={{ color: '#C72638' }}>Próximo passo: Mapa da Identidade Estratégica</strong>
        <p style={{ ...sx.txtSec, fontSize: '0.88rem', margin: '0.4rem 0 0' }}>
          O check-up mostra onde estão os sinais. O Mapa da Identidade investiga as causas e o caminho
          para evoluir. Baixe o relatório completo para ver o diagnóstico por sistema.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1.4rem' }}>
        <a className="mapa-btn" href={`/api/mapa/report?token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          📄 Ver relatório completo
        </a>
        <a href={`/api/mapa/report?token=${encodeURIComponent(token)}&print=1`} target="_blank" rel="noreferrer" style={{ ...sx.btnGhostResult, textDecoration: 'none' }}>
          ⬇ Baixar PDF
        </a>
      </div>
    </Card>
  );
}
