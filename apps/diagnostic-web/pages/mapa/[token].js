import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
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
// Mapa do Crescimento Integrado · Essencial (FINAL) — página pública (acesso por token).
// Fluxo: cadastro → quiz estilo Typeform (uma afirmação por tela, auto-avanço
// ao tocar na resposta, botão voltar) → resultado vendedor. A única tela com
// botão "Continuar" é a condicional de atributos de marca (múltipla escolha).
// O score exibido é o AUTORITATIVO devolvido por /api/mapa/finalize
// (recomputado no servidor).
// =====================================================================

const CONDICIONAL = perguntasCondicionais()[0] || null; // MM2-MAR-10b (atributos de marca)
const MAX_ATRIBUTOS = 3;
const AVANCO_MS = 320;

// sequência exibida: perguntas núcleo na ordem dos sistemas; a condicional
// entra logo após a pergunta da qual depende, quando visível.
function montarSequencia(answers) {
  const seq = [];
  for (const sistema of SISTEMAS_MATURIDADE) {
    for (const q of perguntasPorSistema(sistema)) {
      seq.push(q);
      if (CONDICIONAL?.regra_condicional?.depende === q.id && condicionalVisivel(CONDICIONAL, answers)) {
        seq.push(CONDICIONAL);
      }
    }
  }
  return seq;
}

function primeiraNaoRespondida(answers) {
  const seq = montarSequencia(answers);
  const i = seq.findIndex((q) => q.pontua && typeof answers[q.id] !== 'number');
  return i === -1 ? 0 : i;
}

export default function MapaMaturidadePage() {
  const router = useRouter();
  const token = (router.query.token || '').toString();

  const [fase, setFase] = useState('loading'); // loading|erro|cadastro|intro|quiz|gerando
  const [erro, setErro] = useState(null);
  const [cliente, setCliente] = useState('');
  const [cadastro, setCadastro] = useState({});
  const [cadastroTentou, setCadastroTentou] = useState(false);
  const [answers, setAnswers] = useState({});
  const [atributos, setAtributos] = useState([]); // seleção do MM2-MAR-10b (até 3)
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [salvando, setSalvando] = useState(false);

  // refs espelham o estado para os callbacks do auto-avanço (setTimeout)
  const answersRef = useRef({});
  const atributosRef = useRef([]);
  const idxRef = useRef(0);
  const timerRef = useRef(null);
  useEffect(() => { atributosRef.current = atributos; }, [atributos]);
  useEffect(() => { idxRef.current = perguntaIdx; }, [perguntaIdx]);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

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
        const respostas = data.answers || {};
        answersRef.current = respostas;
        setAnswers(respostas);
        setPerguntaIdx(primeiraNaoRespondida(respostas)); // retomada: 1ª sem resposta
        const temCadastro = cadastroEssencialOk(data.cadastro || {});
        if (!temCadastro) { setFase('cadastro'); return; }
        setFase(Object.keys(respostas).length > 0 ? 'quiz' : 'intro');
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

  // ── quiz: uma pergunta por tela ──────────────────────────────────
  const sequencia = useMemo(() => montarSequencia(answers), [answers]);
  const pergunta = sequencia[Math.min(perguntaIdx, sequencia.length - 1)] || null;

  // a sequência encolhe se a resposta que habilita a condicional mudar
  useEffect(() => {
    if (perguntaIdx > 0 && perguntaIdx >= sequencia.length) setPerguntaIdx(sequencia.length - 1);
  }, [sequencia, perguntaIdx]);

  function responder(id, value) {
    const next = { ...answersRef.current, [id]: value };
    answersRef.current = next;
    setAnswers(next);
    // auto-avanço: a seleção já é a resposta completa (escala única)
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(avancar, AVANCO_MS);
  }

  function toggleAtributo(a) {
    setAtributos((prev) => {
      if (prev.includes(a)) return prev.filter((x) => x !== a);
      if (prev.length >= MAX_ATRIBUTOS) return prev;
      return [...prev, a];
    });
  }

  // envia o lote completo (o servidor faz upsert por pergunta)
  async function salvarRespostas() {
    try {
      await fetch('/api/mapa/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          answers: answersRef.current,
          extras: { atributos_marca: atributosRef.current },
        }),
      });
    } catch { /* best-effort; finalize revalida */ }
  }

  function avancar() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    const seq = montarSequencia(answersRef.current);
    const idx = idxRef.current;
    if (idx >= seq.length - 1) { finalizar(); return; }
    const prox = idx + 1;
    if (seq[prox].sistema !== seq[idx].sistema) salvarRespostas(); // checkpoint por bloco
    setPerguntaIdx(prox);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function voltar() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setPerguntaIdx((i) => Math.max(0, i - 1));
  }

  // ── finalização ──────────────────────────────────────────────────
  async function finalizar() {
    const faltando = obrigatoriasFaltando(answersRef.current);
    if (faltando.length) {
      const seq = montarSequencia(answersRef.current);
      const i = seq.findIndex((q) => faltando.includes(q.id));
      setPerguntaIdx(i >= 0 ? i : 0);
      setFase('quiz');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFase('gerando');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await salvarRespostas(); // garante persistência antes do recompute no servidor
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
  const multipla = pergunta?.response_type === 'multipla';
  return (
    <MapaShell>
        <style>{`
          @keyframes perguntaIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
          .pergunta-anim { animation: perguntaIn 0.28s ease; }
        `}</style>
        {fase === 'loading' && <Card><p style={sx.txtSec}>Carregando…</p></Card>}
        {fase === 'erro' && (
          <Card><h2 style={{ marginTop: 0 }}>Não foi possível abrir</h2><p style={sx.txtSec}>{erro}</p></Card>
        )}

        {fase === 'cadastro' && (
          <Card wide>
            <div style={sx.eyebrow}>Antes de começar</div>
            <h1 style={sx.h1}>Vamos conhecer sua empresa</h1>
            <p style={sx.txtSec}>
              O Mapa do Crescimento Integrado · Essencial é um check-up rápido do seu negócio. Preencha seus dados para
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
            <h1 style={sx.h1}>Mapa do Crescimento Integrado · Essencial</h1>
            {cliente && <p style={{ ...sx.txtSec, marginTop: '-0.1rem' }}>{cliente}</p>}
            <p style={sx.txtSec}>
              Responda às afirmações considerando a realidade atual da empresa. Avaliamos 4 pilares:
              Marca, Negócios, Comunicação e Pessoas. É uma afirmação por vez — ao tocar na resposta,
              você avança automaticamente.
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

        {fase === 'quiz' && pergunta && (
          <Card wide>
            <Progresso atual={perguntaIdx + 1} total={sequencia.length} rotulo="Pergunta" />
            <div key={pergunta.id} className="pergunta-anim">
              <div style={{ ...sx.eyebrow, marginTop: '0.9rem' }}>{pergunta.sistema}</div>
              <p style={estiloPergunta}>{pergunta.pergunta}</p>

              {multipla ? (
                <>
                  <div style={sx.opcoes}>
                    {pergunta.opcoes.map((a) => {
                      const ativo = atributos.includes(a);
                      const cheio = !ativo && atributos.length >= MAX_ATRIBUTOS;
                      return (
                        <button key={a} type="button" onClick={() => toggleAtributo(a)} disabled={cheio}
                          style={{ ...sx.opcao(ativo), opacity: cheio ? 0.45 : 1, cursor: cheio ? 'default' : 'pointer' }}>
                          {ativo ? '✓ ' : ''}{a}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ ...sx.txtSec, fontSize: '0.8rem', marginTop: '0.6rem' }}>
                    {atributos.length}/{MAX_ATRIBUTOS} selecionados
                  </p>
                </>
              ) : (
                <div className="escala-opcoes">
                  {pergunta.opcoes.map((opt) =>
                    opt.value === -1 ? (
                      <button key={opt.value} type="button" className="naosei"
                        onClick={() => responder(pergunta.id, opt.value)}
                        style={sx.opcaoNaoSei(answers[pergunta.id] === opt.value)}
                        title="Não reduz nem aumenta a pontuação; apenas remove esta afirmação do cálculo.">
                        {opt.label}
                      </button>
                    ) : (
                      <button key={opt.value} type="button" onClick={() => responder(pergunta.id, opt.value)}
                        style={{ ...sx.opcao(answers[pergunta.id] === opt.value), textAlign: 'center', justifyContent: 'center' }}>
                        {opt.label}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <div style={sx.navRow}>
              <button onClick={voltar} disabled={perguntaIdx === 0} style={sx.btnGhost(perguntaIdx === 0)}>
                ← Voltar
              </button>
              {multipla && (
                // única tela com botão: múltipla escolha não tem "resposta completa" num toque
                <button className="mapa-btn" onClick={avancar}>Continuar →</button>
              )}
            </div>
          </Card>
        )}

        {fase === 'gerando' && (
          <Card>
            <div style={sx.accent} />
            <div style={sx.eyebrow}>Quase lá</div>
            <h1 style={sx.h1}>Gerando o seu relatório…</h1>
            <p style={sx.txtSec}>Estamos preparando a leitura completa do seu Mapa do Crescimento Integrado · Essencial. Leva alguns segundos.</p>
            <div style={{ width: 38, height: 38, margin: '1.4rem auto 0.3rem', borderRadius: '50%', border: `3px solid ${CORES.track}`, borderTopColor: CORES.red, animation: 'spin 0.9s linear infinite' }} />
          </Card>
        )}
    </MapaShell>
  );
}

// ── componentes de apoio ─────────────────────────────────────────────

const estiloPergunta = { margin: '0.5rem 0 1.2rem', lineHeight: 1.55, fontSize: '1.12rem', color: CORES.text, fontWeight: 500 };

function cadastroEssencialOk(cad) {
  return ['CAD-MM-001', 'CAD-MM-002', 'CAD-MM-006'].every((id) => String(cad?.[id] || '').trim());
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
