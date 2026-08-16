import { CORES } from '@espansione/brand';

// Tela de abertura. O enunciado da escala é explicado UMA única vez, aqui —
// depois disso nenhuma tela repete a instrução (SPEC §5.2).
export default function Abertura() {
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

        <button type="button" style={S.btn} disabled>
          Começar
        </button>
        <p style={S.nota}>
          Fase F0 — fundação. O fluxo das 22 telas entra na F2.
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
    cursor: 'not-allowed',
    opacity: .55,
  },
  nota: { margin: 0, fontSize: '.8rem', color: CORES.textSec },
};
