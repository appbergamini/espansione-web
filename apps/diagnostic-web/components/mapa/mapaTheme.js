import Head from 'next/head';
import Logo from '../Logo';

// =====================================================================
// Tema do funil público do Mapa do Crescimento Integrado — alinhado à landing page
// (/crescimento): fundo azul #001A3B, fonte Poppins, vermelho #C72638,
// cards CLAROS sobre o azul. Compartilhado por /mapa e /mapa/[token].
// =====================================================================

export const CORES = {
  navy: '#001A3B',
  navy2: '#013063',
  red: '#C72638',
  redHover: '#E13345',
  redSoft: 'rgba(199,38,56,0.08)',
  redBorder: 'rgba(199,38,56,0.28)',
  card: '#FFFFFF',
  text: '#0C2340',
  textSec: '#5B6B7F',
  border: '#E2E8F0',
  track: '#E9EEF5',
};

// Wrapper da página: fundo azul + Poppins + logo centralizado + CSS dos
// botões/inputs (hover não dá pra fazer inline).
export function MapaShell({ children, title = 'Mapa do Crescimento Integrado · Espansione' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        .mapa-shell, .mapa-shell * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }
        .mapa-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:${CORES.red}; color:#fff; font-weight:600; font-size:1rem; padding:0.85rem 1.6rem; border:none; border-radius:12px; cursor:pointer; transition:background .18s, transform .18s, box-shadow .18s; box-shadow:0 10px 24px -12px rgba(199,38,56,.7); }
        .mapa-btn:hover:not(:disabled) { background:${CORES.redHover}; transform:translateY(-2px); }
        .mapa-btn:disabled { cursor:default; }
        .mapa-input { width:100%; box-sizing:border-box; padding:0.75rem 0.9rem; font-size:0.98rem; border-radius:10px; border:1px solid ${CORES.border}; background:#F8FAFC; color:${CORES.text}; outline:none; transition:border-color .15s, box-shadow .15s; }
        .mapa-input:focus { border-color:${CORES.red}; box-shadow:0 0 0 3px ${CORES.redSoft}; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .escala-opcoes { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
        .escala-opcoes > button { min-width:0 !important; }
        .escala-opcoes .naosei { grid-column:1 / -1; }
        @media (max-width:560px){ .escala-opcoes { grid-template-columns:repeat(2,1fr); } }
      `}</style>
      <div className="mapa-shell" style={shell}>
        <div style={{ marginBottom: '1.6rem' }}><Logo size="md" center /></div>
        {children}
      </div>
    </>
  );
}

const shell = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2.5rem 1rem',
  background: `radial-gradient(1200px 600px at 50% -10%, ${CORES.navy2}, ${CORES.navy} 60%)`,
  color: CORES.text,
};

// Card claro sobre o azul.
export function MapaCard({ children, wide }) {
  return (
    <div style={{
      maxWidth: wide ? 720 : 540, width: '100%', padding: '2rem', position: 'relative',
      overflow: 'hidden', background: CORES.card, borderRadius: 18,
      boxShadow: '0 30px 60px -30px rgba(0,10,30,.55)', border: '1px solid rgba(255,255,255,.5)',
    }}>
      <div style={sx.accent} />
      {children}
    </div>
  );
}

// Objeto de estilos (paleta LP) — união das chaves usadas por /mapa e /mapa/[token].
const C = CORES;
export const sx = {
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${C.red}, rgba(199,38,56,.15))` },
  eyebrow: { fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.red, fontWeight: 700 },
  h1: { marginTop: '0.2rem', fontSize: '1.7rem', color: C.text, fontWeight: 700 },
  h2: { fontSize: '1.25rem', margin: '0.4rem 0 0.2rem', color: C.text, fontWeight: 700 },
  txtSec: { color: C.textSec, lineHeight: 1.6 },
  // cadastro / campos
  campo: { padding: '0.9rem 0', borderTop: `1px solid ${C.border}` },
  label: { display: 'block', marginBottom: '0.55rem', lineHeight: 1.45, fontSize: '0.96rem', color: C.text, fontWeight: 500 },
  input: { width: '100%', boxSizing: 'border-box', padding: '0.75rem 0.9rem', fontSize: '0.98rem', borderRadius: 10, background: '#F8FAFC', color: C.text, fontFamily: 'inherit', border: `1px solid ${C.border}` },
  ctxCampo: { padding: '0.9rem 0', borderTop: `1px solid ${C.border}` },
  ctxLabel: { display: 'block', marginBottom: '0.55rem', lineHeight: 1.45, fontSize: '0.96rem', color: C.text, fontWeight: 500 },
  ctxInput: { width: '100%', boxSizing: 'border-box', padding: '0.75rem 0.9rem', fontSize: '0.98rem', borderRadius: 10, background: '#F8FAFC', color: C.text, fontFamily: 'inherit' },
  // opções (botões de escala/seleção)
  opcoes: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  opcao: (ativo) => ({
    flex: '1 1 auto', minWidth: 110, padding: '0.6rem 0.75rem', borderRadius: 10,
    border: ativo ? `1.5px solid ${C.red}` : `1px solid ${C.border}`,
    background: ativo ? C.redSoft : '#F8FAFC',
    color: ativo ? C.red : C.text,
    fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s ease', fontWeight: ativo ? 600 : 400,
  }),
  opcaoNaoSei: (ativo) => ({
    flex: '0 0 auto', padding: '0.6rem 0.9rem', borderRadius: 10,
    border: ativo ? '1px dashed #94a3b8' : `1px dashed ${C.border}`,
    background: ativo ? '#EEF2F7' : 'transparent',
    color: ativo ? C.text : C.textSec,
    fontSize: '0.84rem', cursor: 'pointer', transition: 'all 0.15s ease',
  }),
  // quiz
  navRow: { display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '1.6rem' },
  btnGhost: (disabled) => ({
    background: 'none', border: `1px solid ${C.border}`, borderRadius: 10,
    color: C.textSec, padding: '0.7rem 1.1rem',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, fontWeight: 500,
  }),
  afirmacao: { padding: '1rem 0', borderTop: `1px solid ${C.border}` },
  afirmacaoTxt: { margin: '0 0 0.7rem', lineHeight: 1.5, fontSize: '0.98rem', color: C.text },
  afirmacaoNum: { color: C.red, fontWeight: 700, marginRight: '0.2rem' },
  condicional: { padding: '1rem 0', borderTop: `1px solid ${C.redBorder}`, marginTop: '0.4rem' },
  aviso: { marginTop: '0.9rem', padding: '0.75rem 0.9rem', borderRadius: 10, background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.35)', color: '#8a6d1a', fontSize: '0.84rem', lineHeight: 1.55 },
  // progresso
  progLabel: { fontSize: '0.78rem', color: C.textSec, fontWeight: 500 },
  barraOut: { height: 7, background: C.track, borderRadius: 99, overflow: 'hidden' },
  barraIn: { height: '100%', background: `linear-gradient(90deg, ${C.red}, ${C.redHover})`, transition: 'width 0.3s ease' },
  // resultado
  sectionLabel: { fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.red, fontWeight: 700, margin: '1.7rem 0 0.7rem' },
  indiceBox: { position: 'relative', overflow: 'hidden', padding: '1.2rem 1.3rem', borderRadius: 14, background: C.redSoft, border: `1px solid ${C.redBorder}`, marginTop: '1.1rem' },
  indiceNum: { fontSize: '3rem', fontWeight: 800, color: C.red, lineHeight: 1 },
  gaugeOut: { height: 7, background: C.track, borderRadius: 99, overflow: 'hidden', margin: '0.6rem 0 0.45rem' },
  gaugeIn: { height: '100%', background: `linear-gradient(90deg, ${C.red}, ${C.redHover})`, borderRadius: 99 },
  pilarCard: { padding: '1rem 1.1rem', borderRadius: 12, background: '#F8FAFC', border: `1px solid ${C.border}` },
  nivelTagBase: { fontSize: '0.74rem', padding: '0.2rem 0.55rem', borderRadius: 99, whiteSpace: 'nowrap', fontWeight: 600 },
  miniBarOut: { flex: 1, height: 8, background: C.track, borderRadius: 99, overflow: 'hidden' },
  miniBarIn: { height: '100%', background: C.red, borderRadius: 99 },
  chip: { fontSize: '0.8rem', background: '#EEF2F7', color: C.text, borderRadius: 99, padding: '0.28rem 0.7rem', fontWeight: 500 },
  ctaAprofundar: { marginTop: '1.8rem', padding: '1.2rem 1.3rem', borderRadius: 14, background: C.redSoft, border: `1px solid ${C.redBorder}` },
  btnGhostResult: { background: 'none', border: `1px solid ${C.border}`, borderRadius: 10, color: C.textSec, padding: '0.8rem 1.2rem', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 500 },
};

// tags de nível (resultado) — na paleta clara
export const NIVEL_TAG_COR = {
  1: { bg: 'rgba(199,38,56,0.12)', fg: '#B91C2C' },
  2: { bg: 'rgba(199,38,56,0.12)', fg: '#B91C2C' },
  3: { bg: 'rgba(202,138,4,0.14)', fg: '#A16207' },
  4: { bg: 'rgba(21,128,61,0.14)', fg: '#15803D' },
};
