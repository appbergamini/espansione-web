import { CORES } from '@espansione/brand';

/**
 * Tela de beco sem saída (link inválido, sessão que sumiu, erro de rede).
 * Sempre com uma saída: um erro que não diz o que fazer é meio erro.
 */
export default function TelaDeAviso({ titulo, texto, acao }) {
  return (
    <main style={S.shell}>
      <div style={S.card}>
        <h1 style={S.titulo}>{titulo}</h1>
        <p style={S.texto}>{texto}</p>
        {acao && (
          <a href={acao.href} style={S.btn}>{acao.rotulo}</a>
        )}
        <a href="https://wa.me/5511985775893" style={S.secundario}>
          Falar com a Espansione
        </a>
      </div>
    </main>
  );
}

const S = {
  shell: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' },
  card: {
    background: CORES.card, borderRadius: '16px', padding: '2.5rem 2rem', maxWidth: '460px', width: '100%',
    boxShadow: '0 24px 60px -20px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column',
    gap: '1rem', textAlign: 'center',
  },
  titulo: { margin: 0, fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.25, color: CORES.text },
  texto: { margin: 0, color: CORES.textSec, fontSize: '.98rem', lineHeight: 1.55 },
  btn: {
    background: CORES.red, color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '.85rem 1.6rem',
    borderRadius: '12px', textDecoration: 'none', marginTop: '.3rem',
  },
  secundario: { color: CORES.textSec, fontSize: '.9rem', textDecoration: 'underline' },
};
