import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo, useState, useEffect, useCallback } from 'react';
import Logo from '../../../components/Logo';

// Formulário genérico do Mapa de Identidade Estratégica v2 (dirigido pelo
// catálogo). Funciona para qualquer público; o conteúdo vem de /api/identidade-v2.
// Core 100% fechado: escalas, 0–10 e múltipla (até 3). Autosave por campo.

const ORDEM_SECOES = ['Perfil', 'Marca', 'Negócios', 'Comunicação', 'Pessoas', 'Priorização'];
const SECAO = (q) => (q.sistema === 'Perfil' || q.sistema === 'Priorização' ? q.sistema : q.sistema);

function preenchida(q, v) {
  if (['escala4_concordancia', 'escala4_frequencia', 'escala_0_10', 'escala_0_10_nps', 'numero'].includes(q.response_type)) {
    return typeof v === 'number' && Number.isFinite(v);
  }
  if (q.response_type === 'multipla_ate3') return Array.isArray(v) && v.length >= 1;
  return typeof v === 'string' ? v.trim().length > 0 : v != null && v !== '';
}

export default function FormIdentidadeV2() {
  const router = useRouter();
  const token = (router.query.token || '').toString();

  const [fase, setFase] = useState('loading'); // loading|erro|form|enviando|resultado
  const [erro, setErro] = useState(null);
  const [cliente, setCliente] = useState('');
  const [perguntas, setPerguntas] = useState([]);
  const [answers, setAnswers] = useState({});
  const [rid, setRid] = useState(null);
  const [resumo, setResumo] = useState(null);
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`/api/identidade-v2/session?token=${encodeURIComponent(token)}`);
        const j = await r.json();
        if (!j.success) { setErro(j.error || 'Link inválido'); setFase('erro'); return; }
        if (j.status === 'completed') { setErro('Este formulário já foi concluído.'); setFase('erro'); return; }
        setCliente(j.cliente || '');
        setPerguntas(j.perguntas || []);
        setAnswers(j.answers || {});
        setRid(j.rid || null);
        setFase('form');
      } catch { setErro('Não foi possível abrir o formulário.'); setFase('erro'); }
    })();
  }, [token]);

  const salvar = useCallback(async (patch) => {
    try {
      const r = await fetch('/api/identidade-v2/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rid, answers: patch }),
      });
      const j = await r.json();
      if (j.success && j.rid && !rid) setRid(j.rid);
    } catch { /* autosave silencioso; finalize revalida */ }
  }, [token, rid]);

  function responder(id, value) {
    setAnswers((p) => ({ ...p, [id]: value }));
    salvar({ [id]: value });
  }

  // visibilidade condicional: mostra a pergunta só se a regra for satisfeita
  const visivel = useCallback((q) => {
    const r = q.regra_condicional;
    if (!r) return true;
    return r.valores.includes(answers[r.depende]);
  }, [answers]);

  const visiveis = useMemo(() => perguntas.filter(visivel), [perguntas, visivel]);
  const obrigatorias = useMemo(() => visiveis.filter((q) => q.obrigatoria), [visiveis]);
  const faltando = useMemo(() => obrigatorias.filter((q) => !preenchida(q, answers[q.id])).map((q) => q.id), [obrigatorias, answers]);
  const respondidas = useMemo(() => visiveis.filter((q) => preenchida(q, answers[q.id])).length, [visiveis, answers]);
  const completo = faltando.length === 0;

  const secoes = useMemo(() => {
    const g = {};
    for (const q of visiveis) (g[SECAO(q)] = g[SECAO(q)] || []).push(q);
    return ORDEM_SECOES.filter((s) => g[s]?.length).map((s) => [s, g[s]]);
  }, [visiveis]);

  async function finalizar() {
    if (!completo) { setTentou(true); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setFase('enviando');
    try {
      await fetch('/api/identidade-v2/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rid, answers }),
      });
      const r = await fetch('/api/identidade-v2/finalize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rid }),
      });
      const j = await r.json();
      if (!j.success) { setErro(j.error || 'Não foi possível concluir.'); setFase('erro'); return; }
      setResumo(j.resumo || null);
      setFase('resultado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch { setErro('Falha ao concluir.'); setFase('erro'); }
  }

  return (
    <>
      <Head><title>Mapa de Identidade Estratégica</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.4rem' }}><Logo size="md" center /></div>

        {fase === 'loading' && <Card><p style={sx.txtSec}>Carregando…</p></Card>}
        {fase === 'erro' && <Card><h2 style={{ marginTop: 0 }}>Ops</h2><p style={sx.txtSec}>{erro}</p></Card>}
        {fase === 'enviando' && <Card><p style={sx.txtSec}>Calculando o resultado…</p></Card>}

        {fase === 'resultado' && (
          <Card wide>
            <div style={sx.eyebrow}>Concluído</div>
            <h1 style={sx.h1}>Obrigado!</h1>
            <p style={sx.txtSec}>Suas respostas foram registradas{cliente ? ` para ${cliente}` : ''}.</p>
            {resumo?.geral != null && (
              <div style={sx.domBox}><div style={sx.domAccent} />
                <div style={sx.eyebrow}>Índice geral (maturidade)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#Da3144' }}>{resumo.geral}%</div>
              </div>
            )}
          </Card>
        )}

        {fase === 'form' && (
          <Card wide>
            <Progresso atual={respondidas} total={visiveis.length} />
            {tentou && !completo && (
              <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.7rem' }}>
                Faltam {faltando.length} resposta(s) obrigatória(s).
              </p>
            )}
            {secoes.map(([secao, qs]) => (
              <div key={secao} style={{ marginTop: '1.4rem' }}>
                <div style={sx.sectionLabel}>{secao}</div>
                {qs.map((q, i) => (
                  <div key={q.id} style={{ ...sx.item, ...(tentou && q.obrigatoria && !preenchida(q, answers[q.id]) ? sx.itemErro : {}) }}>
                    <p style={sx.itemTxt}>{q.pergunta}</p>
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
  if (q.response_type === 'escala4_concordancia' || q.response_type === 'escala4_frequencia') {
    return (
      <div style={sx.opcoes}>
        {q.opcoes.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} style={sx.opcao(value === o.value)}>{o.label}</button>
        ))}
      </div>
    );
  }
  if (q.response_type === 'escala_0_10' || q.response_type === 'escala_0_10_nps') {
    return (
      <div style={sx.opcoes}>
        {Array.from({ length: 11 }, (_, n) => (
          <button key={n} type="button" onClick={() => onChange(n)} style={{ ...sx.opcao(value === n), minWidth: 40, flex: '0 0 auto' }}>{n}</button>
        ))}
      </div>
    );
  }
  if (q.response_type === 'multipla_ate3') {
    const sel = Array.isArray(value) ? value : [];
    const toggle = (op) => {
      if (sel.includes(op)) onChange(sel.filter((x) => x !== op));
      else if (sel.length < (q.max_escolhas || 3)) onChange([...sel, op]);
    };
    return (
      <div style={sx.opcoes}>
        {q.opcoes.map((op) => (
          <button key={op} type="button" onClick={() => toggle(op)} style={sx.opcao(sel.includes(op))}>{op}</button>
        ))}
        <span style={{ ...sx.txtSec, fontSize: '0.78rem', alignSelf: 'center' }}>{sel.length}/{q.max_escolhas || 3}</span>
      </div>
    );
  }
  if (q.response_type === 'numero') {
    return <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} style={sx.text} />;
  }
  if (q.response_type === 'selecao_unica') {
    return (
      <div style={sx.opcoes}>
        {(q.opcoes || []).map((op) => (
          <button key={op} type="button" onClick={() => onChange(op)} style={sx.opcao(value === op)}>{op}</button>
        ))}
      </div>
    );
  }
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
  text: { width: '100%', padding: '0.6rem 0.7rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-primary,#eee)', fontSize: '0.9rem' },
  navRow: { display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '1.8rem' },
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600 },
  sectionLabel: { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fca5b0', fontWeight: 700, margin: '0.4rem 0' },
  domBox: { position: 'relative', overflow: 'hidden', marginTop: '1.1rem', padding: '1.1rem 1.3rem', borderRadius: 14, background: 'rgba(218,49,68,0.10)', border: '1px solid rgba(218,49,68,0.25)' },
  domAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' },
  barOut: { height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  barIn: { height: '100%', background: 'linear-gradient(90deg, #Da3144, #f0667a)', borderRadius: 99 },
};
