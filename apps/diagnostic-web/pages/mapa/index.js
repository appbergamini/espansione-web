import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import Logo from '../../components/Logo';
import { CADASTRO_MATURIDADE } from '../../lib/mapa-maturidade/catalog';

// =====================================================================
// Mapa da Maturidade — entrada pública (funil de captação).
// Coleta o cadastro/lead, cria a avaliação (/api/mapa/start) e leva ao
// questionário em /mapa/[token].
// =====================================================================

const ESSENCIAIS = ['CAD-MM-001', 'CAD-MM-002', 'CAD-MM-006']; // nome, empresa, contato

export default function MapaEntradaPage() {
  const router = useRouter();
  const [cadastro, setCadastro] = useState({});
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const completo = useMemo(
    () => ESSENCIAIS.every((id) => String(cadastro[id] || '').trim()),
    [cadastro]
  );
  function setCad(id, v) { setCadastro((p) => ({ ...p, [id]: v })); }

  async function iniciar() {
    if (!completo) { setTentou(true); return; }
    setEnviando(true);
    setErro(null);
    try {
      const r = await fetch('/api/mapa/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cadastro }),
      });
      const data = await r.json();
      if (!data.success) { setErro(data.error || 'Não foi possível iniciar.'); setEnviando(false); return; }
      router.push(`/mapa/${data.token}`);
    } catch {
      setErro('Falha de conexão. Tente novamente.');
      setEnviando(false);
    }
  }

  return (
    <>
      <Head>
        <title>Mapa da Maturidade · Espansione</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={sx.page}>
        <div style={{ marginBottom: '1.6rem' }}><Logo size="md" center /></div>
        <div className="glass-card" style={{ maxWidth: 640, width: '100%', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={sx.accent} />
          <div style={sx.eyebrow}>Check-up gratuito</div>
          <h1 style={sx.h1}>Mapa da Maturidade</h1>
          <p style={sx.txtSec}>
            Um diagnóstico rápido do seu negócio em 4 sistemas — Marca, Negócios, Comunicação e
            Pessoas. Preencha seus dados para começar e receber o resultado.
          </p>
          <div style={{ marginTop: '1rem' }}>
            {CADASTRO_MATURIDADE.map((c) => {
              const essencial = ESSENCIAIS.includes(c.id);
              const vazio = !String(cadastro[c.id] || '').trim();
              const borda = tentou && essencial && vazio ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)';
              return (
                <div key={c.id} style={sx.campo}>
                  <label style={sx.label}>{c.pergunta} {essencial && <span style={{ color: '#Da3144' }}>*</span>}</label>
                  {c.response_type === 'selecao_unica' ? (
                    <div style={sx.opcoes}>
                      {c.opcoes.map((opt) => (
                        <button key={opt} type="button" onClick={() => setCad(c.id, opt)} style={sx.opcao(cadastro[c.id] === opt)}>
                          {cadastro[c.id] === opt ? '✓ ' : ''}{opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input value={cadastro[c.id] || ''} onChange={(e) => setCad(c.id, e.target.value)} style={{ ...sx.input, border: borda }} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1.4rem', textAlign: 'right' }}>
            <button className="btn-primary" onClick={iniciar} disabled={enviando} style={{ opacity: completo && !enviando ? 1 : 0.6 }}>
              {enviando ? 'Iniciando…' : 'Iniciar check-up →'}
            </button>
          </div>
          {tentou && !completo && (
            <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.6rem' }}>Preencha ao menos nome, empresa e contato.</p>
          )}
          {erro && <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.6rem' }}>{erro}</p>}
        </div>
      </div>
    </>
  );
}

const sx = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem' },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #Da3144, rgba(218,49,68,0.08))' },
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary, #9aa)', fontWeight: 600 },
  h1: { marginTop: '0.2rem', fontSize: '1.6rem' },
  txtSec: { color: 'var(--text-secondary, #9aa)', lineHeight: 1.6 },
  campo: { padding: '0.9rem 0', borderTop: '1px solid rgba(255,255,255,0.07)' },
  label: { display: 'block', marginBottom: '0.55rem', lineHeight: 1.45, fontSize: '0.96rem' },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.85rem', fontSize: '0.95rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: 'inherit', fontFamily: 'inherit' },
  opcoes: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  opcao: (ativo) => ({
    flex: '1 1 auto', minWidth: 110, padding: '0.55rem 0.7rem', borderRadius: 8,
    border: ativo ? '1px solid #Da3144' : '1px solid rgba(255,255,255,0.16)',
    background: ativo ? 'rgba(218,49,68,0.18)' : 'rgba(255,255,255,0.03)',
    color: ativo ? '#fca5b0' : 'var(--text-secondary, #9aa)',
    fontSize: '0.88rem', cursor: 'pointer',
  }),
};
