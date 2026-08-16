import { useState } from 'react';
import { useRouter } from 'next/router';
import { CORES } from '@espansione/brand';

// Tela de abertura. O enunciado da escala é explicado UMA única vez, aqui —
// depois disso nenhuma tela repete a instrução (SPEC §5.2).
export default function Abertura() {
  const router = useRouter();
  const [abrindo, setAbrindo] = useState(false);
  const [erro, setErro] = useState(null);

  async function comecar() {
    setAbrindo(true);
    setErro(null);
    try {
      const r = await fetch('/teste/api/sessao/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const d = await r.json();
      if (!r.ok) { setErro(d.erro || 'Não foi possível abrir o teste.'); setAbrindo(false); return; }
      router.push(`/${d.token}`);
    } catch {
      setErro('Sem conexão. Tente de novo em instantes.');
      setAbrindo(false);
    }
  }

  return (
    <main style={S.shell}>
      <div style={S.card}>
        <p style={S.eyebrow}>Espansione</p>
        <h1 style={S.h1}>Teste de Competências Empreendedoras</h1>

        <p style={S.lead}>
          São 22 telas, entre 9 e 10 minutos. Não existe resposta certa —
          existe a que descreve você.
        </p>

        <div style={S.enunciado}>
          Pensando nos seus últimos 90 dias à frente do negócio, marque a frase{' '}
          <strong>mais parecida</strong> e a <strong>menos parecida</strong> com você.
        </div>

        {erro && <p style={S.erro}>{erro}</p>}

        <button type="button" style={{ ...S.btn, opacity: abrindo ? .6 : 1 }} disabled={abrindo} onClick={comecar}>
          {abrindo ? 'Abrindo…' : 'Começar'}
        </button>
        <p style={S.nota}>
          As suas respostas são salvas a cada tela. Dá para sair e voltar depois.
        </p>
      </div>
    </main>
  );
}

const S = {
  shell: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem 1rem',
  },
  card: {
    background: CORES.card,
    borderRadius: '16px',
    padding: '2.5rem 2rem',
    maxWidth: '540px',
    width: '100%',
    boxShadow: '0 24px 60px -20px rgba(0,0,0,.45)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },
  eyebrow: {
    margin: 0,
    fontSize: '.72rem',
    fontWeight: 700,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    color: CORES.red,
  },
  h1: { margin: 0, fontSize: '1.75rem', lineHeight: 1.15, letterSpacing: '-.02em', fontWeight: 700 },
  lead: { margin: 0, color: CORES.textSec, fontSize: '1rem', lineHeight: 1.6 },
  enunciado: {
    background: CORES.track,
    border: `1px solid ${CORES.border}`,
    borderRadius: '12px',
    padding: '1rem 1.1rem',
    fontSize: '1.02rem',
    lineHeight: 1.55,
  },
  btn: {
    background: CORES.red,
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    padding: '.85rem 1.6rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    font: 'inherit',
  },
  nota: { margin: 0, fontSize: '.8rem', color: CORES.textSec },
  erro: {
    margin: 0, padding: '.7rem .9rem', borderRadius: '10px', fontSize: '.9rem',
    background: CORES.redSoft, border: `1px solid ${CORES.redBorder}`, color: CORES.text,
  },
};
