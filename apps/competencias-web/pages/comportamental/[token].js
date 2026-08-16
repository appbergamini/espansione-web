import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CORES } from '@espansione/brand';
import TelaDeAviso from '../../components/TelaDeAviso';

// Mapeamento Comportamental. Respondido duas vezes — como você é, e o que o
// papel pede — porque é da diferença entre os dois que sai a leitura de
// esforço de adaptação. Nenhum resultado aparece aqui.
export default function Comportamental() {
  const router = useRouter();
  const { token } = router.query;

  const [estado, setEstado] = useState(null);
  const [bloqueio, setBloqueio] = useState(null);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  // Por id, não booleano: com duas transições (natural e contexto) um
  // booleano só faria a segunda nunca aparecer, porque a primeira já o
  // teria levantado.
  const [transicoesVistas, setTransicoesVistas] = useState({});

  const carregar = useCallback(async () => {
    const r = await fetch(`/teste/api/comportamental/${token}`);
    const d = await r.json();
    if (r.status === 423) return setBloqueio(d.motivo);
    if (r.status === 404) return setNaoEncontrado(true);
    if (!r.ok) return setErro(d.erro || 'Não foi possível carregar.');
    setEstado(d);
  }, [token]);

  useEffect(() => { if (token) carregar(); }, [token, carregar]);

  async function responder(itemId, payload) {
    setEnviando(true);
    setErro(null);
    try {
      const r = await fetch(`/teste/api/comportamental/${token}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, payload }),
      });
      const d = await r.json();
      if (!r.ok) { setErro(d.erro || 'Não foi possível salvar.'); return; }
      setEstado(d);
      window.scrollTo({ top: 0 });
    } catch {
      setErro('Sem conexão. A sua resposta anterior está salva — tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  if (naoEncontrado) {
    return (
      <TelaDeAviso
        titulo="Este link não abre mais"
        texto="O teste ligado a ele não existe mais. Use o link original que você recebeu; se ele também não abrir, a gente resolve por aqui."
        acao={{ href: '/teste', rotulo: 'Começar um teste novo' }}
      />
    );
  }
  if (bloqueio) {
    return (
      <Moldura>
        <h2 style={S.titulo}>Ainda não</h2>
        {/* Motivo em uma linha, como a SPEC pede. */}
        <p style={S.sec}>{bloqueio}</p>
        <a href={`/teste/${token}`} style={{ ...S.btn, textDecoration: 'none' }}>Voltar ao teste</a>
      </Moldura>
    );
  }
  if (erro && !estado) return <Moldura><p style={S.erro}>{erro}</p></Moldura>;
  if (!estado) return <Moldura><p style={S.sec}>Carregando…</p></Moldura>;

  const { tela, progresso, transicao } = estado;

  // A transição vem anexada à tela real; dispensá-la é decisão do cliente.
  if (transicao && !transicoesVistas[transicao.id]) {
    return (
      <Moldura progresso={progresso}>
        <h2 style={S.titulo}>{transicao.titulo}</h2>
        <p style={S.sec}>{transicao.texto}</p>
        <button type="button" style={S.btn}
                onClick={() => setTransicoesVistas((v) => ({ ...v, [transicao.id]: true }))}>
          {transicao.rotulo || 'Continuar'}
        </button>
      </Moldura>
    );
  }

  return (
    <Moldura progresso={progresso}>
      {erro && <p style={S.erro}>{erro}</p>}
      {tela.tipo === 'ranking' && <Ranking key={tela.id} tela={tela} enviando={enviando} onResponder={responder} />}
      {tela.tipo === 'par' && <Par key={tela.id} tela={tela} enviando={enviando} onResponder={responder} />}
      {tela.tipo === 'fim' && <Fim tela={tela} token={token} />}
    </Moldura>
  );
}

// ── ranking: toca na ordem, do que mais parece para o que menos ──────
function Ranking({ tela, enviando, onResponder }) {
  const [ordem, setOrdem] = useState([]);

  useEffect(() => {
    if (ordem.length === 4 && !enviando) onResponder(tela.id, { ordem });
  }, [ordem]); // eslint-disable-line react-hooks/exhaustive-deps

  function tocar(indice) {
    setOrdem((o) => (o.includes(indice) ? o.filter((x) => x !== indice) : [...o, indice]));
  }

  return (
    <>
      <p style={S.instrucao}>{tela.instrucao}</p>
      <div style={S.lista}>
        {tela.palavras.map((p) => {
          const pos = ordem.indexOf(p.indice);
          const marcada = pos >= 0;
          return (
            <button key={p.indice} type="button" onClick={() => tocar(p.indice)} disabled={enviando}
              aria-pressed={marcada}
              style={{
                ...S.palavra,
                borderColor: marcada ? CORES.red : CORES.border,
                background: marcada ? CORES.redSoft : CORES.card,
              }}>
              <span style={{
                ...S.numero,
                background: marcada ? CORES.red : CORES.track,
                color: marcada ? '#fff' : CORES.textSec,
              }}>{marcada ? pos + 1 : '·'}</span>
              {p.label}
            </button>
          );
        })}
      </div>
      <p style={S.dica}>
        {ordem.length === 0 ? 'Toque na que mais se parece primeiro.' : `${ordem.length} de 4 · toque de novo para desfazer`}
      </p>
    </>
  );
}

// ── par forçado ──────────────────────────────────────────────────────
function Par({ tela, enviando, onResponder }) {
  return (
    <>
      <p style={S.instrucao}>{tela.instrucao}</p>
      <div style={S.lista}>
        {[['a', tela.a], ['b', tela.b]].map(([k, texto]) => (
          <button key={k} type="button" disabled={enviando}
            onClick={() => onResponder(tela.id, { escolha: k })} style={S.opcaoPar}>
            {texto}
          </button>
        ))}
      </div>
    </>
  );
}

function Fim({ tela, token }) {
  const router = useRouter();
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={S.titulo}>{tela.titulo}</h2>
      <p style={S.sec}>{tela.texto}</p>
      {tela.acao?.destino === 'relatorio' && (
        <button type="button" style={S.btn} onClick={() => router.push(`/relatorio/${token}`)}>
          {tela.acao.rotulo}
        </button>
      )}
    </div>
  );
}

function Moldura({ children, progresso }) {
  return (
    <main style={S.shell}>
      <div style={S.card}>
        {progresso && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
            <div style={S.trilho}><div style={{ ...S.barra, width: `${progresso.percentual}%` }} /></div>
            <div style={S.linhaProgresso}>
              <span style={S.legenda}>{progresso.legenda}</span>
              {progresso.deTotal && (
                <span style={S.contador}>{progresso.pergunta} de {progresso.deTotal}</span>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </main>
  );
}

const S = {
  shell: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' },
  card: {
    background: CORES.card, borderRadius: '16px', padding: '2rem 1.6rem', maxWidth: '560px', width: '100%',
    boxShadow: '0 24px 60px -20px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', gap: '1.1rem',
  },
  trilho: { height: '6px', background: CORES.track, borderRadius: '99px', overflow: 'hidden' },
  barra: { height: '100%', background: CORES.red, borderRadius: '99px', transition: 'width .3s' },
  linhaProgresso: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '.75rem' },
  legenda: { fontSize: '.78rem', color: CORES.textSec, fontWeight: 600 },
  contador: {
    fontSize: '.78rem', color: CORES.textSec, fontWeight: 700,
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flex: 'none',
  },
  instrucao: { margin: 0, fontSize: '1.05rem', lineHeight: 1.45, fontWeight: 600 },
  lista: { display: 'flex', flexDirection: 'column', gap: '.7rem' },
  palavra: {
    display: 'flex', alignItems: 'center', gap: '.8rem', textAlign: 'left',
    padding: '.85rem 1rem', borderRadius: '12px', border: '1.5px solid', cursor: 'pointer',
    font: 'inherit', fontSize: '1.02rem', color: CORES.text,
  },
  numero: {
    flex: 'none', width: '26px', height: '26px', borderRadius: '50%',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '.85rem', fontWeight: 700,
  },
  opcaoPar: {
    textAlign: 'left', padding: '1rem', borderRadius: '12px', border: `1.5px solid ${CORES.border}`,
    background: CORES.card, font: 'inherit', fontSize: '1rem', lineHeight: 1.4, cursor: 'pointer', color: CORES.text,
  },
  titulo: { margin: 0, fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.25 },
  sec: { margin: 0, color: CORES.textSec, fontSize: '.98rem', lineHeight: 1.55 },
  dica: { margin: 0, fontSize: '.82rem', color: CORES.textSec },
  btn: {
    background: CORES.red, color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '.85rem 1.6rem',
    border: 'none', borderRadius: '12px', cursor: 'pointer', font: 'inherit', textAlign: 'center',
  },
  erro: {
    margin: 0, padding: '.7rem .9rem', borderRadius: '10px', fontSize: '.9rem',
    background: CORES.redSoft, border: `1px solid ${CORES.redBorder}`, color: CORES.text,
  },
};
