import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo, useState, useEffect, useCallback } from 'react';
import Logo from '../../../components/Logo';

// Formulário genérico do Mapa do Crescimento Integrado · Estratégico (FINAL), dirigido pelo catálogo.
// Serve os 3 públicos; conteúdo vem de /api/identidade-final. Autosave por campo.
// Cobre escala4, 0–10, NPS, múltipla (limitada e livre), ranking, seleção única,
// número, texto e abertas (curta/longa/estruturada).

function secaoDe(q) {
  return q.classificacao === 'Bloco aberto' ? 'Aprofundamento' : q.sistema || 'Geral';
}

function preenchida(q, v) {
  const t = q.response_type;
  if (['escala4_concordancia', 'escala4_frequencia', 'escala_0_10', 'escala_0_10_nps', 'numero'].includes(t)) {
    return typeof v === 'number' && Number.isFinite(v);
  }
  if (['multipla_ate3', 'multipla', 'ranking_top3', 'aberta_curta_multipla', 'aberta_estruturada_3'].includes(t)) {
    return Array.isArray(v) && v.some((x) => (typeof x === 'string' ? x.trim() : x != null && x !== ''));
  }
  return typeof v === 'string' ? v.trim().length > 0 : v != null && v !== '';
}

export default function FormIdentidadeFinal() {
  const router = useRouter();
  const token = (router.query.token || '').toString();

  const [fase, setFase] = useState('loading');
  const [erro, setErro] = useState(null);
  const [cliente, setCliente] = useState('');
  const [publico, setPublico] = useState('');
  const [perguntas, setPerguntas] = useState([]);
  const [answers, setAnswers] = useState({});
  const [rid, setRid] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`/api/identidade-final/session?token=${encodeURIComponent(token)}`);
        const j = await r.json();
        if (!j.success) { setErro(j.error || 'Link inválido'); setFase('erro'); return; }
        if (j.status === 'completed') { setErro('Este formulário já foi concluído.'); setFase('erro'); return; }
        setCliente(j.cliente || ''); setPublico(j.publico || '');
        setPerguntas(j.perguntas || []); setAnswers(j.answers || {}); setRid(j.rid || null);
        setFase('form');
      } catch { setErro('Não foi possível abrir o formulário.'); setFase('erro'); }
    })();
  }, [token]);

  const salvar = useCallback(async (patch) => {
    try {
      const r = await fetch('/api/identidade-final/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rid, answers: patch }),
      });
      const j = await r.json();
      if (j.success && j.rid && !rid) setRid(j.rid);
    } catch { /* autosave silencioso */ }
  }, [token, rid]);

  function responder(id, value) {
    setAnswers((p) => ({ ...p, [id]: value }));
    salvar({ [id]: value });
  }

  const visivel = useCallback((q) => {
    const r = q.regra_condicional;
    if (!r) return true;
    return r.valores.includes(String(answers[r.depende]));
  }, [answers]);

  const visiveis = useMemo(() => perguntas.filter(visivel), [perguntas, visivel]);
  const obrigatorias = useMemo(() => visiveis.filter((q) => q.obrigatoria), [visiveis]);
  const faltando = useMemo(() => obrigatorias.filter((q) => !preenchida(q, answers[q.id])).map((q) => q.id), [obrigatorias, answers]);
  const respondidas = useMemo(() => visiveis.filter((q) => preenchida(q, answers[q.id])).length, [visiveis, answers]);
  const completo = faltando.length === 0;

  // seções na ordem de primeira aparição (Perfil → sistemas → Aprofundamento)
  const secoes = useMemo(() => {
    const ordem = [];
    const g = {};
    for (const q of visiveis) {
      const s = secaoDe(q);
      if (!g[s]) { g[s] = []; ordem.push(s); }
      g[s].push(q);
    }
    return ordem.map((s) => [s, g[s]]);
  }, [visiveis]);

  async function finalizar() {
    if (!completo) { setTentou(true); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setFase('enviando');
    try {
      await fetch('/api/identidade-final/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rid, answers }),
      });
      const r = await fetch('/api/identidade-final/finalize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rid }),
      });
      const j = await r.json();
      if (!j.success) { setErro(j.error || 'Não foi possível concluir.'); setFase('erro'); return; }
      setResumo(j.resumo || null); setFase('resultado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { setErro('Falha ao concluir.'); setFase('erro'); }
  }

  const TITULO = { socios: 'Sócios e Diretores', colaboradores: 'Colaboradores e Líderes', clientes: 'Clientes e Fornecedores' };

  return (
    <>
      <Head><title>Mapa do Crescimento Integrado · Estratégico</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.4rem' }}><Logo size="md" center /></div>

        {fase === 'loading' && <Card><p style={sx.txtSec}>Carregando…</p></Card>}
        {fase === 'erro' && <Card><h2 style={{ marginTop: 0 }}>Ops</h2><p style={sx.txtSec}>{erro}</p></Card>}
        {fase === 'enviando' && <Card><p style={sx.txtSec}>Registrando suas respostas…</p></Card>}

        {fase === 'resultado' && (
          <Card wide>
            <div style={sx.eyebrow}>Concluído</div>
            <h1 style={sx.h1}>Obrigado!</h1>
            <p style={sx.txtSec}>Suas respostas foram registradas{cliente ? ` para ${cliente}` : ''}.</p>
            {resumo?.geral != null && (
              <div style={sx.domBox}><div style={sx.domAccent} />
                <div style={sx.eyebrow}>Índice de maturidade deste público</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#Da3144' }}>{resumo.geral}%</div>
              </div>
            )}
          </Card>
        )}

        {fase === 'form' && (
          <Card wide>
            <div style={sx.eyebrow}>Mapa do Crescimento Integrado · Estratégico{publico ? ` · ${TITULO[publico] || publico}` : ''}</div>
            {cliente && <p style={{ ...sx.txtSec, margin: '0.2rem 0 0.8rem' }}>{cliente}</p>}
            <Progresso atual={respondidas} total={visiveis.length} />
            {tentou && !completo && (
              <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.7rem' }}>
                Faltam {faltando.length} resposta(s) obrigatória(s).
              </p>
            )}
            {secoes.map(([secao, qs]) => (
              <div key={secao} style={{ marginTop: '1.4rem' }}>
                <div style={sx.sectionLabel}>{secao}</div>
                {qs.map((q) => (
                  <div key={q.id} style={{ ...sx.item, ...(tentou && q.obrigatoria && !preenchida(q, answers[q.id]) ? sx.itemErro : {}) }}>
                    <p style={sx.itemTxt}>{q.pergunta}{q.obrigatoria ? '' : <span style={sx.opc}> (opcional)</span>}</p>
                    <Input q={q} value={answers[q.id]} onChange={(v) => responder(q.id, v)} />
                  </div>
                ))}
              </div>
            ))}
            <div style={sx.navRow}>
              <span />
              <button className="btn-primary" onClick={finalizar} style={{ opacity: completo ? 1 : 0.6 }}>Concluir →</button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

function Input({ q, value, onChange }) {
  const t = q.response_type;

  if (t === 'escala4_concordancia' || t === 'escala4_frequencia') {
    return (
      <div style={sx.opcoes}>
        {q.opcoes.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            style={o.value === -1 ? sx.opcaoNa(value === o.value) : sx.opcao(value === o.value)}>{o.label}</button>
        ))}
      </div>
    );
  }
  if (t === 'escala_0_10' || t === 'escala_0_10_nps') {
    return (
      <div style={sx.opcoes}>
        {Array.from({ length: 11 }, (_, n) => (
          <button key={n} type="button" onClick={() => onChange(n)} style={{ ...sx.opcao(value === n), minWidth: 40, flex: '0 0 auto' }}>{n}</button>
        ))}
      </div>
    );
  }
  if (t === 'multipla_ate3' || t === 'multipla') {
    const max = t === 'multipla_ate3' ? (q.max_escolhas || 3) : Infinity;
    const sel = Array.isArray(value) ? value : [];
    const toggle = (op) => {
      if (sel.includes(op)) onChange(sel.filter((x) => x !== op));
      else if (sel.length < max) onChange([...sel, op]);
    };
    return (
      <div style={sx.opcoes}>
        {q.opcoes.map((op) => (
          <button key={op} type="button" onClick={() => toggle(op)} style={sx.opcao(sel.includes(op))}>
            {sel.includes(op) ? '✓ ' : ''}{op}
          </button>
        ))}
        {Number.isFinite(max) && <span style={{ ...sx.txtSec, fontSize: '0.78rem', alignSelf: 'center' }}>{sel.length}/{max}</span>}
      </div>
    );
  }
  if (t === 'ranking_top3') {
    const sel = Array.isArray(value) ? value : [];
    const toggle = (op) => {
      if (sel.includes(op)) onChange(sel.filter((x) => x !== op));
      else if (sel.length < 3) onChange([...sel, op]);
    };
    return (
      <div style={sx.opcoes}>
        {q.opcoes.map((op) => {
          const pos = sel.indexOf(op);
          return (
            <button key={op} type="button" onClick={() => toggle(op)} style={sx.opcao(pos >= 0)}>
              {pos >= 0 ? `${pos + 1}º ` : ''}{op}
            </button>
          );
        })}
        <span style={{ ...sx.txtSec, fontSize: '0.78rem', alignSelf: 'center' }}>{sel.length}/3</span>
      </div>
    );
  }
  if (t === 'selecao_unica') {
    return (
      <div style={sx.opcoes}>
        {(q.opcoes || []).map((op) => (
          <button key={op} type="button" onClick={() => onChange(op)} style={sx.opcao(value === op)}>{value === op ? '✓ ' : ''}{op}</button>
        ))}
      </div>
    );
  }
  if (t === 'numero') {
    return <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} style={sx.text} />;
  }
  if (t === 'aberta_longa') {
    return <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...sx.text, resize: 'vertical' }} />;
  }
  if (t === 'aberta_curta_multipla' || t === 'aberta_estruturada_3') {
    const arr = Array.isArray(value) ? value : ['', '', ''];
    const setI = (i, v) => { const c = [...arr]; c[i] = v; onChange(c); };
    return (
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {[0, 1, 2].map((i) => (
          <input key={i} type="text" value={arr[i] || ''} onChange={(e) => setI(i, e.target.value)}
            placeholder={t === 'aberta_curta_multipla' ? `${i + 1}º` : `Campo ${i + 1}`} style={sx.text} />
        ))}
      </div>
    );
  }
  // texto_curto, aberta_curta e fallback
  return <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={sx.text} />;
}

function Progresso({ atual, total }) {
  const pct = total ? Math.round((atual / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={sx.prog}>{atual} de {total}</span><span style={sx.prog}>{pct}%</span>
      </div>
      <div style={sx.barOut}><div style={{ ...sx.barIn, width: `${pct}%` }} /></div>
    </div>
  );
}

function Card({ children, wide }) {
  return (
    <div className="glass-card" style={{ maxWidth: wide ? 720 : 540, width: '100%', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={sx.domAccent} />
      {children}
    </div>
  );
}

const sx = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem' },
  h1: { marginTop: 0, fontSize: '1.5rem' },
  txtSec: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  opc: { color: 'var(--text-secondary, #9aa)', fontSize: '0.8rem', fontWeight: 400 },
  prog: { fontSize: '0.78rem', color: 'var(--text-secondary, #9aa)' },
  item: { padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.07)' },
  itemErro: { background: 'rgba(218,49,68,0.05)' },
  itemTxt: { margin: '0 0 0.7rem', lineHeight: 1.5, fontSize: '0.97rem' },
  opcoes: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  opcao: (ativo) => ({
    flex: '1 1 auto', minWidth: 120, padding: '0.55rem 0.7rem', borderRadius: 8,
    border: ativo ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)',
    background: ativo ? 'rgba(218,49,68,0.18)' : 'rgba(255,255,255,0.03)',
    color: ativo ? '#fca5b0' : 'var(--text-secondary, #9aa)', fontSize: '0.85rem', cursor: 'pointer',
  }),
  opcaoNa: (ativo) => ({
    flex: '0 0 auto', padding: '0.55rem 0.9rem', borderRadius: 8,
    border: ativo ? '1px dashed #9aa3ad' : '1px dashed rgba(255,255,255,0.16)',
    background: ativo ? 'rgba(255,255,255,0.08)' : 'transparent',
    color: ativo ? '#cbd5e1' : 'var(--text-secondary, #9aa)', fontSize: '0.82rem', cursor: 'pointer',
  }),
  text: { width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.7rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.03)', color: 'inherit', fontSize: '0.9rem', fontFamily: 'inherit' },
  navRow: { display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '1.8rem' },
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600 },
  sectionLabel: { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fca5b0', fontWeight: 700, margin: '0.4rem 0' },
  domBox: { position: 'relative', overflow: 'hidden', marginTop: '1.1rem', padding: '1.1rem 1.3rem', borderRadius: 14, background: 'rgba(218,49,68,0.10)', border: '1px solid rgba(218,49,68,0.25)' },
  domAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' },
  barOut: { height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  barIn: { height: '100%', background: 'linear-gradient(90deg, #Da3144, #f0667a)', borderRadius: 99 },
};
