import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import {
  SISTEMAS_MATURIDADE,
  CADASTRO_MATURIDADE,
  perguntasPorSistema,
  perguntasCondicionais,
  condicionalVisivel,
  obrigatoriasFaltando,
} from '../../lib/mapa-maturidade/catalog';
import { MapaShell, MapaCard as Card, sx, CORES } from '../../components/mapa/mapaTheme';

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
        if (data.status === 'concluido') {
          // já concluído → vai direto para o relatório completo
          window.location.href = `/api/mapa/report?token=${encodeURIComponent(token)}`;
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
    setFase('gerando');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const r = await fetch('/api/mapa/finalize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await r.json();
      if (!data.success) { setErro(data.error || 'Não foi possível concluir.'); setFase('erro'); return; }
      // gera o relatório completo (aquece o cache da IA) e vai direto para ele
      await fetch(`/api/mapa/report?token=${encodeURIComponent(token)}`).catch(() => {});
      window.location.href = `/api/mapa/report?token=${encodeURIComponent(token)}`;
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

        {fase === 'gerando' && (
          <Card>
            <div style={sx.accent} />
            <div style={sx.eyebrow}>Quase lá</div>
            <h1 style={sx.h1}>Gerando o seu relatório…</h1>
            <p style={sx.txtSec}>Estamos preparando a leitura completa do seu Mapa da Maturidade. Leva alguns segundos.</p>
            <div style={{ width: 38, height: 38, margin: '1.4rem auto 0.3rem', borderRadius: '50%', border: `3px solid ${CORES.track}`, borderTopColor: CORES.red, animation: 'spin 0.9s linear infinite' }} />
          </Card>
        )}
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
