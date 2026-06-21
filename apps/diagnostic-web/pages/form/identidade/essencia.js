import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../../../components/Logo';
import { FORM_ESSENCIA, validarBlocoEssencia } from '../../../lib/mapa-identidade/forms';

// Formulário 1 — Essência e Direção da Marca (público, por token do assessment).
// Renderiza genericamente os 5 tipos de campo, bloco por bloco, com salvamento
// progressivo. Fundador/direção respondem; tempo estimado 20–30 min.

export default function EssenciaForm() {
  const router = useRouter();
  const token = (router.query.token || '').toString();

  const [fase, setFase] = useState('loading'); // loading|erro|intro|form|enviando|concluido
  const [erro, setErro] = useState(null);
  const [cliente, setCliente] = useState('');
  const [answers, setAnswers] = useState({});
  const [blocoIdx, setBlocoIdx] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [tentouAvancar, setTentouAvancar] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`/api/identidade/session?token=${encodeURIComponent(token)}&form=essencia`);
        const j = await r.json();
        if (!j.success) { setErro(j.error || 'Link inválido'); setFase('erro'); return; }
        setCliente(j.cliente || '');
        setAnswers(j.answers || {});
        if (j.submission_status === 'completed') { setFase('concluido'); return; }
        setFase(Object.keys(j.answers || {}).length > 0 ? 'form' : 'intro');
      } catch {
        setErro('Não foi possível abrir o formulário.'); setFase('erro');
      }
    })();
  }, [token]);

  const bloco = FORM_ESSENCIA.blocos[blocoIdx];
  const faltando = useMemo(() => (bloco ? validarBlocoEssencia(bloco, answers) : []), [bloco, answers]);

  function setCampo(code, value) {
    setAnswers((p) => ({ ...p, [code]: value }));
  }

  async function salvarBloco() {
    const lote = {};
    for (const c of bloco.campos) if (answers[c.code] !== undefined) lote[c.code] = answers[c.code];
    try {
      await fetch('/api/identidade/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, form: 'essencia', answers: lote }),
      });
    } catch { /* best-effort; finalize revalida */ }
  }

  async function proximo() {
    if (faltando.length) { setTentouAvancar(true); return; }
    setTentouAvancar(false);
    setSalvando(true);
    await salvarBloco();
    setSalvando(false);
    if (blocoIdx < FORM_ESSENCIA.blocos.length - 1) {
      setBlocoIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await finalizar();
    }
  }

  function voltar() {
    setTentouAvancar(false);
    if (blocoIdx > 0) { setBlocoIdx((i) => i - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  async function finalizar() {
    setFase('enviando');
    await salvarBloco();
    try {
      const r = await fetch('/api/identidade/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, form: 'essencia' }),
      });
      const j = await r.json();
      if (!j.success) { setErro(j.error || 'Não foi possível concluir.'); setFase('erro'); return; }
      setFase('concluido');
    } catch { setErro('Falha ao concluir.'); setFase('erro'); }
  }

  return (
    <>
      <Head><title>Essência e Direção da Marca</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.4rem' }}><Logo size="md" center /></div>

        {fase === 'loading' && <Card><p style={sx.txtSec}>Carregando…</p></Card>}
        {fase === 'erro' && <Card><h2 style={{ marginTop: 0 }}>Ops</h2><p style={sx.txtSec}>{erro}</p></Card>}

        {fase === 'intro' && (
          <Card>
            <h1 style={sx.h1}>{FORM_ESSENCIA.titulo}</h1>
            {cliente && <p style={{ ...sx.txtSec, marginTop: '-0.4rem' }}>{cliente}</p>}
            <p style={sx.txtSec}>Esta etapa capta a visão da liderança sobre a essência, a diferenciação, o propósito, a cultura e as tensões estratégicas da marca. Responda com honestidade — não há resposta certa.</p>
            <p style={{ ...sx.txtSec, fontSize: '0.9rem' }}>{FORM_ESSENCIA.respondente} · {FORM_ESSENCIA.tempo} · você pode salvar e continuar depois.</p>
            <button className="btn-primary" onClick={() => setFase('form')} style={{ marginTop: '0.6rem' }}>Iniciar</button>
          </Card>
        )}

        {fase === 'form' && bloco && (
          <Card wide>
            <Progresso atual={blocoIdx + 1} total={FORM_ESSENCIA.blocos.length} />
            <h2 style={sx.h2}>Bloco {bloco.id} de {FORM_ESSENCIA.blocos.length} — {bloco.titulo}</h2>
            <div style={{ marginTop: '1.2rem' }}>
              {bloco.campos.map((c) => (
                <Campo
                  key={c.code}
                  campo={c}
                  valor={answers[c.code]}
                  onChange={(v) => setCampo(c.code, v)}
                  erro={tentouAvancar && faltando.includes(c.code)}
                />
              ))}
            </div>
            <div style={sx.navRow}>
              <button onClick={voltar} disabled={blocoIdx === 0 || salvando} style={sx.btnGhost(blocoIdx === 0 || salvando)}>← Voltar</button>
              <button className="btn-primary" onClick={proximo} disabled={salvando} style={{ opacity: salvando ? 0.6 : 1 }}>
                {blocoIdx < FORM_ESSENCIA.blocos.length - 1 ? 'Próximo →' : 'Concluir →'}
              </button>
            </div>
            {tentouAvancar && faltando.length > 0 && (
              <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.7rem' }}>Preencha os campos obrigatórios deste bloco para continuar.</p>
            )}
          </Card>
        )}

        {fase === 'enviando' && <Card><p style={sx.txtSec}>Salvando suas respostas…</p></Card>}
        {fase === 'concluido' && (
          <Card>
            <h2 style={{ marginTop: 0, color: '#86efac' }}>Formulário concluído 🙌</h2>
            <p style={sx.txtSec}>Obrigado. Suas respostas sobre a essência da marca foram registradas e vão alimentar o Mapa de Identidade Estratégica.</p>
          </Card>
        )}
      </div>
    </>
  );
}

// ── renderer de campo (short|long|single|multi|words3) ───────────────
function Campo({ campo, valor, onChange, erro }) {
  const borda = erro ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)';
  return (
    <div style={sx.campo}>
      <label style={sx.label}>
        {campo.label} {campo.required ? <span style={{ color: '#Da3144' }}>*</span> : <span style={sx.opc}>(opcional)</span>}
      </label>

      {campo.type === 'short' && (
        <input value={valor || ''} onChange={(e) => onChange(e.target.value)} style={{ ...sx.input, border: borda }} />
      )}

      {campo.type === 'long' && (
        <textarea value={valor || ''} onChange={(e) => onChange(e.target.value)} rows={3} style={{ ...sx.input, border: borda, minHeight: 90, resize: 'vertical' }} />
      )}

      {campo.type === 'single' && (
        <div style={sx.opcoes}>
          {campo.options.map((opt) => (
            <button key={opt} type="button" onClick={() => onChange(opt)} style={sx.opcao(valor === opt)}>{opt}</button>
          ))}
        </div>
      )}

      {campo.type === 'multi' && (
        <MultiSelect campo={campo} valor={Array.isArray(valor) ? valor : []} onChange={onChange} />
      )}

      {campo.type === 'words3' && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              value={(Array.isArray(valor) ? valor[i] : '') || ''}
              onChange={(e) => {
                const arr = Array.isArray(valor) ? [...valor] : ['', '', ''];
                arr[i] = e.target.value;
                onChange(arr);
              }}
              placeholder={`Palavra ${i + 1}`}
              style={{ ...sx.input, border: borda, flex: '1 1 110px', minWidth: 110 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MultiSelect({ campo, valor, onChange }) {
  const noMax = valor.length >= campo.max;
  function toggle(opt) {
    if (valor.includes(opt)) onChange(valor.filter((v) => v !== opt));
    else if (!noMax) onChange([...valor, opt]);
  }
  return (
    <>
      <div style={sx.opcoes}>
        {campo.options.map((opt) => {
          const ativo = valor.includes(opt);
          const bloqueado = !ativo && noMax;
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} disabled={bloqueado} style={{ ...sx.opcao(ativo), opacity: bloqueado ? 0.4 : 1 }}>
              {ativo ? '✓ ' : ''}{opt}
            </button>
          );
        })}
      </div>
      <span style={{ ...sx.opc, fontSize: '0.76rem' }}>{valor.length}/{campo.max} selecionadas</span>
    </>
  );
}

function Progresso({ atual, total }) {
  const pct = Math.round((atual / total) * 100);
  return (
    <div style={{ marginBottom: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <span style={sx.prog}>Bloco {atual} de {total}</span><span style={sx.prog}>{pct}%</span>
      </div>
      <div style={sx.barraOut}><div style={{ ...sx.barraIn, width: `${pct}%` }} /></div>
    </div>
  );
}

function Card({ children, wide }) {
  return <div className="glass-card" style={{ maxWidth: wide ? 700 : 540, width: '100%', padding: '2rem' }}>{children}</div>;
}

const sx = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem' },
  h1: { marginTop: 0, fontSize: '1.5rem' },
  h2: { fontSize: '1.2rem', margin: '0.4rem 0 0.2rem' },
  txtSec: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  prog: { fontSize: '0.78rem', color: 'var(--text-secondary, #9aa)' },
  barraOut: { height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' },
  barraIn: { height: '100%', background: '#Da3144', transition: 'width 0.3s ease' },
  campo: { padding: '0.9rem 0', borderTop: '1px solid rgba(255,255,255,0.07)' },
  label: { display: 'block', marginBottom: '0.55rem', lineHeight: 1.45, fontSize: '0.96rem' },
  opc: { color: 'var(--text-secondary, #9aa)', fontSize: '0.82rem' },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.85rem', fontSize: '0.95rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: 'inherit', fontFamily: 'inherit' },
  opcoes: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  opcao: (ativo) => ({
    padding: '0.5rem 0.8rem', borderRadius: 8,
    border: ativo ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)',
    background: ativo ? 'rgba(218,49,68,0.18)' : 'rgba(255,255,255,0.03)',
    color: ativo ? '#fca5b0' : 'var(--text-secondary, #9aa)',
    fontSize: '0.86rem', cursor: 'pointer',
  }),
  navRow: { display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '1.6rem' },
  btnGhost: (disabled) => ({ background: 'none', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 8, color: 'var(--text-secondary, #9aa)', padding: '0.6rem 1rem', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1 }),
};
