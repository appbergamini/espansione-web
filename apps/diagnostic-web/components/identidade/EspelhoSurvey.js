import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../Logo';
import CampoIdentidade from './CampoIdentidade';
import { validateSurvey } from '../../lib/mapa-identidade/forms';

// Survey compartilhado dos Espelhos (Interno/Externo). Single-submit,
// multi-respondente, por token próprio do espelho. Mobile-first.

export default function EspelhoSurvey({ formDef, slug }) {
  const router = useRouter();
  const token = (router.query.token || '').toString();

  const [fase, setFase] = useState('loading'); // loading|erro|intro|form|enviando|concluido
  const [erro, setErro] = useState(null);
  const [cliente, setCliente] = useState('');
  const [answers, setAnswers] = useState({});
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await fetch(`/api/identidade/submit?token=${encodeURIComponent(token)}&form=${slug}`);
        const j = await r.json();
        if (!j.success) { setErro(j.error || 'Link inválido'); setFase('erro'); return; }
        setCliente(j.cliente || '');
        setFase('intro');
      } catch { setErro('Não foi possível abrir a pesquisa.'); setFase('erro'); }
    })();
  }, [token, slug]);

  const faltando = useMemo(() => validateSurvey(formDef, answers), [formDef, answers]);
  function setCampo(code, value) { setAnswers((p) => ({ ...p, [code]: value })); }

  async function enviar() {
    if (faltando.length) { setTentou(true); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setFase('enviando');
    try {
      const r = await fetch('/api/identidade/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, form: slug, answers }),
      });
      const j = await r.json();
      if (!j.success) { setErro(j.error || 'Não foi possível enviar.'); setFase('erro'); return; }
      setFase('concluido');
    } catch { setErro('Falha ao enviar.'); setFase('erro'); }
  }

  return (
    <>
      <Head><title>{formDef.titulo}</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.4rem' }}><Logo size="md" center /></div>

        {fase === 'loading' && <Card><p style={sx.txtSec}>Carregando…</p></Card>}
        {fase === 'erro' && <Card><h2 style={{ marginTop: 0 }}>Ops</h2><p style={sx.txtSec}>{erro}</p></Card>}

        {fase === 'intro' && (
          <Card>
            <h1 style={sx.h1}>{formDef.titulo}</h1>
            {cliente && <p style={{ ...sx.txtSec, marginTop: '-0.4rem' }}>{cliente}</p>}
            <p style={sx.txtSec}>{formDef.intro}</p>
            {formDef.anonimo && <div style={sx.anon}>🔒 Pesquisa anônima — não coletamos nome, e-mail ou telefone.</div>}
            <p style={{ ...sx.txtSec, fontSize: '0.9rem' }}>Leva cerca de {formDef.tempo}.</p>
            <button className="btn-primary" onClick={() => setFase('form')} style={{ marginTop: '0.6rem' }}>Começar</button>
          </Card>
        )}

        {fase === 'form' && (
          <Card wide>
            {formDef.anonimo && <div style={sx.anon}>🔒 Suas respostas são anônimas.</div>}
            {formDef.blocos.map((b) => (
              <div key={b.id} style={{ marginBottom: '0.6rem' }}>
                <h2 style={sx.h2}>{b.titulo}</h2>
                {b.campos.map((c) => (
                  <CampoIdentidade key={c.code} campo={c} valor={answers[c.code]} onChange={(v) => setCampo(c.code, v)} erro={tentou && faltando.includes(c.code)} />
                ))}
              </div>
            ))}
            {tentou && faltando.length > 0 && (
              <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.5rem' }}>Faltam {faltando.length} resposta(s) obrigatória(s).</p>
            )}
            <div style={{ marginTop: '1.4rem', textAlign: 'right' }}>
              <button className="btn-primary" onClick={enviar} style={{ opacity: faltando.length ? 0.7 : 1 }}>Enviar respostas →</button>
            </div>
          </Card>
        )}

        {fase === 'enviando' && <Card><p style={sx.txtSec}>Enviando…</p></Card>}
        {fase === 'concluido' && (
          <Card>
            <h2 style={{ marginTop: 0, color: '#86efac' }}>Respostas enviadas 🙌</h2>
            <p style={sx.txtSec}>Obrigado por compartilhar sua percepção. Sua contribuição ajuda a empresa a enxergar a si mesma com mais clareza.</p>
          </Card>
        )}
      </div>
    </>
  );
}

function Card({ children, wide }) {
  return <div className="glass-card" style={{ maxWidth: wide ? 680 : 540, width: '100%', padding: '2rem' }}>{children}</div>;
}

const sx = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem' },
  h1: { marginTop: 0, fontSize: '1.5rem' },
  h2: { fontSize: '1.12rem', margin: '1rem 0 0.2rem', color: '#fca5b0' },
  txtSec: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  anon: { fontSize: '0.84rem', color: '#9bb8e0', background: 'rgba(0,50,109,0.18)', border: '1px solid rgba(0,50,109,0.35)', borderRadius: 8, padding: '0.6rem 0.8rem', margin: '0.6rem 0' },
};
