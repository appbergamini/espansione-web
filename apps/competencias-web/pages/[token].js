import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CORES } from '@espansione/brand';
import TelaDeAviso from '../components/TelaDeAviso';

// Fluxo do teste. Uma questão por tela; o enunciado da escala foi explicado
// uma única vez, na abertura, e não se repete aqui.
//
// Avanço automático em TODAS as etapas, e sempre com Voltar disponível —
// o comportamento misto (bloco avança sozinho, âncora pede Continuar)
// confundia mais do que protegia.
export default function Teste() {
  const router = useRouter();
  const { token } = router.query;

  const [estado, setEstado] = useState(null);
  const [erro, setErro] = useState(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async (telaId = null) => {
    const url = telaId
      ? `/teste/api/sessao/${token}?tela=${encodeURIComponent(telaId)}`
      : `/teste/api/sessao/${token}`;
    const r = await fetch(url);
    const d = await r.json();
    if (r.status === 404) return setNaoEncontrado(true);
    if (!r.ok) return setErro(d.erro || 'Não foi possível carregar o teste.');
    setErro(null);
    setEstado(d);
    window.scrollTo({ top: 0 });
  }, [token]);

  useEffect(() => { if (token) carregar(); }, [token, carregar]);

  async function responder(itemId, payload) {
    const revisitando = estado?.navegacao?.revisitando;
    const proxima = estado?.navegacao?.proxima;
    setEnviando(true);
    setErro(null);
    try {
      const r = await fetch(`/teste/api/sessao/${token}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, payload }),
      });
      const d = await r.json();
      if (!r.ok) { setErro(d.erro || 'Não foi possível salvar.'); return; }
      // Corrigindo uma resposta antiga: segue na ordem, não pula para o fim.
      if (revisitando && proxima) { await carregar(proxima); return; }
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
        texto="O teste ligado a ele não existe mais. Se você começou e parou no meio, use o link original que recebeu; se ele também não abrir, a gente resolve por aqui."
        acao={{ href: '/teste', rotulo: 'Começar um teste novo' }}
      />
    );
  }
  if (erro && !estado) return <Moldura><p style={S.erro}>{erro}</p></Moldura>;
  if (!estado) return <Moldura><p style={S.sec}>Carregando…</p></Moldura>;

  const { tela, progresso, navegacao } = estado;

  return (
    <Moldura progresso={progresso}>
      {erro && <p style={S.erro}>{erro}</p>}

      {tela.tipo === 'escolha_forcada' && (
        <EscolhaForcada key={tela.id} tela={tela} enviando={enviando} onResponder={responder} />
      )}
      {tela.tipo === 'item_ancorado' && (
        <UmaEscolha key={tela.id} enunciado={tela.situacao} enviando={enviando}
          opcoes={tela.niveis.map((n) => ({ chave: n.nivel, texto: n.texto }))}
          marcada={tela.resposta?.nivel ?? null}
          onEscolher={(nivel) => responder(tela.id, { nivel })} />
      )}
      {tela.tipo === 'ancora_evidencia' && (
        <UmaEscolha key={tela.id} enunciado={tela.pergunta} enviando={enviando}
          opcoes={tela.opcoes.map((o) => ({ chave: o.valor, texto: o.label }))}
          marcada={tela.resposta?.valor ?? null}
          onEscolher={(valor) => responder(tela.id, { valor })} />
      )}
      {tela.tipo === 'fim' && <Fim tela={tela} token={token} />}

      <Rodape navegacao={navegacao} tela={tela} enviando={enviando} onIr={carregar} />
    </Moldura>
  );
}

// ── navegação ────────────────────────────────────────────────────────
function Rodape({ navegacao, tela, enviando, onIr }) {
  const anterior = navegacao?.anterior ?? tela?.anterior ?? null;
  if (!anterior && !navegacao?.frontier) return null;
  return (
    <div style={S.rodape}>
      {anterior ? (
        <button type="button" style={S.voltar} disabled={enviando} onClick={() => onIr(anterior)}>
          ← Voltar
        </button>
      ) : <span />}
      {navegacao?.frontier && (
        <button type="button" style={S.voltar} disabled={enviando} onClick={() => onIr(null)}>
          Ir para onde parei →
        </button>
      )}
    </div>
  );
}

// ── etapa 1 ──────────────────────────────────────────────────────────
function EscolhaForcada({ tela, enviando, onResponder }) {
  const [mais, setMais] = useState(tela.resposta?.mais ?? null);
  const [menos, setMenos] = useState(tela.resposta?.menos ?? null);

  useEffect(() => {
    if (!mais || !menos || mais === menos || enviando) return;
    // Não reenvia o que já estava gravado quando a pessoa só está revendo.
    if (mais === tela.resposta?.mais && menos === tela.resposta?.menos) return;
    onResponder(tela.id, { mais, menos });
  }, [mais, menos]); // eslint-disable-line react-hooks/exhaustive-deps

  function marcar(tipo, chave) {
    if (tipo === 'mais') {
      setMais(chave);
      if (menos === chave) setMenos(null);
    } else {
      setMenos(chave);
      if (mais === chave) setMais(null);
    }
  }

  return (
    <>
      <div style={S.cabecalhoColunas}>
        <span style={S.rotuloColuna}>mais<br />parecida</span>
        <span />
        <span style={S.rotuloColuna}>menos<br />parecida</span>
      </div>
      <div style={S.listaOpcoes}>
        {tela.opcoes.map((o) => (
          <div key={o.competencia} style={S.linhaOpcao}>
            <Marcador ativo={mais === o.competencia} cor={CORES.red}
              rotulo={`Marcar "${o.afirmacao}" como mais parecida`}
              onClick={() => marcar('mais', o.competencia)} />
            <p style={S.afirmacao}>{o.afirmacao}</p>
            <Marcador ativo={menos === o.competencia} cor={CORES.textSec}
              rotulo={`Marcar "${o.afirmacao}" como menos parecida`}
              onClick={() => marcar('menos', o.competencia)} />
          </div>
        ))}
      </div>
    </>
  );
}

function Marcador({ ativo, cor, rotulo, onClick }) {
  return (
    <button type="button" aria-label={rotulo} aria-pressed={ativo} onClick={onClick}
      style={{ ...S.marcador, borderColor: ativo ? cor : CORES.border, background: ativo ? cor : 'transparent' }} />
  );
}

// ── etapas 2 e 3: mesma mecânica, um toque escolhe e avança ──────────
function UmaEscolha({ enunciado, opcoes, marcada, enviando, onEscolher }) {
  return (
    <>
      <p style={S.situacao}>{enunciado}</p>
      <div style={S.listaOpcoes}>
        {opcoes.map((o) => (
          <button key={o.chave} type="button" disabled={enviando}
            aria-pressed={marcada === o.chave}
            onClick={() => onEscolher(o.chave)}
            style={{
              ...S.cartaoOpcao,
              borderColor: marcada === o.chave ? CORES.red : CORES.border,
              background: marcada === o.chave ? CORES.redSoft : CORES.card,
            }}>
            {o.texto}
          </button>
        ))}
      </div>
    </>
  );
}

// ── fim ──────────────────────────────────────────────────────────────
function Fim({ tela, token }) {
  const router = useRouter();
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={S.titulo}>{tela.titulo}</h2>
      <p style={S.sec}>{tela.texto}</p>
      {tela.acao?.destino === 'comportamental' && (
        <button type="button" style={S.btn} onClick={() => router.push(`/comportamental/${token}`)}>
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
          <div style={S.progresso}>
            <div style={S.trilho}>
              <div style={{ ...S.barra, width: `${progresso.percentual}%` }} />
            </div>
            <div style={S.linhaProgresso}>
              <span style={S.legendaProgresso}>{progresso.legenda}</span>
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
    background: CORES.card, borderRadius: '16px', padding: '2rem 1.6rem', maxWidth: '600px', width: '100%',
    boxShadow: '0 24px 60px -20px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', gap: '1.2rem',
  },
  progresso: { display: 'flex', flexDirection: 'column', gap: '.45rem' },
  trilho: { height: '6px', background: CORES.track, borderRadius: '99px', overflow: 'hidden' },
  barra: { height: '100%', background: CORES.red, borderRadius: '99px', transition: 'width .3s' },
  linhaProgresso: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '.75rem' },
  legendaProgresso: { fontSize: '.78rem', color: CORES.textSec, fontWeight: 600, letterSpacing: '.02em' },
  contador: {
    fontSize: '.78rem', color: CORES.textSec, fontWeight: 700,
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flex: 'none',
  },
  cabecalhoColunas: { display: 'grid', gridTemplateColumns: '44px 1fr 44px', alignItems: 'end', gap: '.6rem' },
  rotuloColuna: {
    fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
    color: CORES.textSec, textAlign: 'center', lineHeight: 1.25,
  },
  listaOpcoes: { display: 'flex', flexDirection: 'column', gap: '.7rem' },
  linhaOpcao: { display: 'grid', gridTemplateColumns: '44px 1fr 44px', alignItems: 'center', gap: '.6rem' },
  afirmacao: { margin: 0, fontSize: '1rem', lineHeight: 1.45 },
  marcador: {
    width: '30px', height: '30px', margin: '0 auto', display: 'block',
    borderRadius: '50%', border: '2px solid', cursor: 'pointer', transition: 'background .15s, border-color .15s',
  },
  cartaoOpcao: {
    textAlign: 'left', padding: '.9rem 1rem', borderRadius: '12px', border: `1.5px solid ${CORES.border}`,
    fontSize: '.98rem', lineHeight: 1.45, cursor: 'pointer', font: 'inherit', color: CORES.text,
  },
  situacao: { margin: 0, fontSize: '1.1rem', lineHeight: 1.45, fontWeight: 600 },
  titulo: { margin: 0, fontSize: '1.3rem', lineHeight: 1.25, fontWeight: 700 },
  sec: { margin: 0, color: CORES.textSec, fontSize: '.98rem', lineHeight: 1.55 },
  btn: {
    background: CORES.red, color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '.85rem 1.6rem',
    border: 'none', borderRadius: '12px', cursor: 'pointer', font: 'inherit', textAlign: 'center',
  },
  rodape: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem',
    borderTop: `1px solid ${CORES.border}`, paddingTop: '.9rem', marginTop: '.2rem',
  },
  voltar: {
    background: 'none', border: 'none', padding: '.35rem .1rem', cursor: 'pointer', font: 'inherit',
    fontSize: '.88rem', fontWeight: 600, color: CORES.textSec,
  },
  erro: {
    margin: 0, padding: '.7rem .9rem', borderRadius: '10px', fontSize: '.9rem',
    background: CORES.redSoft, border: `1px solid ${CORES.redBorder}`, color: CORES.text,
  },
};
