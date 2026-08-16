import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CORES } from '@espansione/brand';

// Fluxo do teste. Uma questão por tela; o enunciado da escala foi explicado
// uma única vez, na abertura, e não se repete aqui.
export default function Teste() {
  const router = useRouter();
  const { token } = router.query;

  const [estado, setEstado] = useState(null);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    const r = await fetch(`/teste/api/sessao/${token}`);
    const d = await r.json();
    if (!r.ok) return setErro(d.erro || 'Não foi possível carregar o teste.');
    setEstado(d);
  }, [token]);

  useEffect(() => { if (token) carregar(); }, [token, carregar]);

  async function enviar(url, corpo) {
    setEnviando(true);
    setErro(null);
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
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

  const responder = (itemId, payload) => enviar(`/teste/api/sessao/${token}/responder`, { itemId, payload });
  const escolher = (escolhas) => enviar(`/teste/api/sessao/${token}/escolher`, { escolhas });

  if (erro && !estado) return <Moldura><p style={S.erro}>{erro}</p></Moldura>;
  if (!estado) return <Moldura><p style={S.sec}>Carregando…</p></Moldura>;

  const { tela, progresso } = estado;

  return (
    <Moldura progresso={progresso}>
      {erro && <p style={S.erro}>{erro}</p>}

      {tela.tipo === 'escolha_forcada' && (
        <EscolhaForcada key={tela.id} tela={tela} enviando={enviando} onResponder={responder} />
      )}
      {tela.tipo === 'escolha_de_aprofundamento' && (
        <EscolhaAprofundamento key="esc" tela={tela} enviando={enviando} onEscolher={escolher} />
      )}
      {tela.tipo === 'item_ancorado' && (
        <ItemAncorado key={tela.id} tela={tela} enviando={enviando} onResponder={responder} />
      )}
      {tela.tipo === 'ancora_evidencia' && (
        <Ancora key={tela.id} tela={tela} enviando={enviando} onResponder={responder} />
      )}
      {tela.tipo === 'fim' && <Fim tela={tela} token={token} />}
    </Moldura>
  );
}

// ── etapa 1 ──────────────────────────────────────────────────────────
function EscolhaForcada({ tela, enviando, onResponder }) {
  const [mais, setMais] = useState(null);
  const [menos, setMenos] = useState(null);

  // Avanço automático assim que a marcação estiver completa (SPEC §5.2).
  useEffect(() => {
    if (mais && menos && mais !== menos && !enviando) onResponder(tela.id, { mais, menos });
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
            <Marcador
              ativo={mais === o.competencia}
              cor={CORES.red}
              rotulo={`Marcar "${o.afirmacao}" como mais parecida`}
              onClick={() => marcar('mais', o.competencia)}
            />
            <p style={S.afirmacao}>{o.afirmacao}</p>
            <Marcador
              ativo={menos === o.competencia}
              cor={CORES.textSec}
              rotulo={`Marcar "${o.afirmacao}" como menos parecida`}
              onClick={() => marcar('menos', o.competencia)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

function Marcador({ ativo, cor, rotulo, onClick }) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      aria-pressed={ativo}
      onClick={onClick}
      style={{
        ...S.marcador,
        borderColor: ativo ? cor : CORES.border,
        background: ativo ? cor : 'transparent',
      }}
    />
  );
}

// ── empate no corte ──────────────────────────────────────────────────
function EscolhaAprofundamento({ tela, enviando, onEscolher }) {
  const [sel, setSel] = useState([]);
  const completo = sel.length === tela.escolherQuantas;

  function alternar(chave) {
    setSel((s) => (s.includes(chave)
      ? s.filter((x) => x !== chave)
      : s.length < tela.escolherQuantas ? [...s, chave] : s));
  }

  return (
    <>
      <h2 style={S.titulo}>{tela.titulo}</h2>
      <p style={S.sec}>{tela.instrucao}</p>
      <div style={S.listaOpcoes}>
        {tela.opcoes.map((o) => (
          <button
            key={o.chave}
            type="button"
            onClick={() => alternar(o.chave)}
            aria-pressed={sel.includes(o.chave)}
            style={{
              ...S.cartaoEscolha,
              borderColor: sel.includes(o.chave) ? CORES.red : CORES.border,
              background: sel.includes(o.chave) ? CORES.redSoft : CORES.card,
            }}
          >
            {o.nome}
          </button>
        ))}
      </div>
      <button type="button" style={{ ...S.btn, opacity: completo && !enviando ? 1 : .5 }}
        disabled={!completo || enviando} onClick={() => onEscolher(sel)}>
        Continuar
      </button>
    </>
  );
}

// ── etapa 2 ──────────────────────────────────────────────────────────
function ItemAncorado({ tela, enviando, onResponder }) {
  return (
    <>
      <p style={S.situacao}>{tela.situacao}</p>
      <div style={S.listaOpcoes}>
        {tela.niveis.map((n) => (
          <button key={n.nivel} type="button" disabled={enviando}
            onClick={() => onResponder(tela.id, { nivel: n.nivel })}
            style={S.cartaoOpcao}>
            {n.texto}
          </button>
        ))}
      </div>
    </>
  );
}

// ── etapa 3 ──────────────────────────────────────────────────────────
function Ancora({ tela, enviando, onResponder }) {
  const [valor, setValor] = useState(null);
  return (
    <>
      <p style={S.situacao}>{tela.pergunta}</p>
      <div style={S.listaOpcoes}>
        {tela.opcoes.map((o) => (
          <button key={o.valor} type="button" onClick={() => setValor(o.valor)}
            aria-pressed={valor === o.valor}
            style={{
              ...S.cartaoOpcao,
              borderColor: valor === o.valor ? CORES.red : CORES.border,
              background: valor === o.valor ? CORES.redSoft : CORES.card,
            }}>
            {o.label}
          </button>
        ))}
      </div>
      {/* Âncora exige Continuar — é contagem factual, não impressão. */}
      <button type="button" style={{ ...S.btn, opacity: valor !== null && !enviando ? 1 : .5 }}
        disabled={valor === null || enviando}
        onClick={() => onResponder(tela.id, { valor })}>
        Continuar
      </button>
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
        // Dentro da zona: navegação normal do Next.
        <button type="button" style={S.btn} onClick={() => router.push(`/comportamental/${token}`)}>
          {tela.acao.rotulo}
        </button>
      )}
      {/* Para fora da zona: <a>, nunca <Link>. */}
      <a href="/area" style={{ ...S.sec, textDecoration: 'underline' }}>Depois, na minha conta</a>
    </div>
  );
}

// ── moldura ──────────────────────────────────────────────────────────
function Moldura({ children, progresso }) {
  return (
    <main style={S.shell}>
      <div style={S.card}>
        {progresso && (
          <div style={S.progresso}>
            <div style={S.trilho}>
              <div style={{ ...S.barra, width: `${progresso.percentual}%` }} />
            </div>
            {/* Progresso por etapa, nunca por questão. */}
            <span style={S.legendaProgresso}>
              Etapa {progresso.etapa} de {progresso.de} · {progresso.rotulo}
            </span>
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
  legendaProgresso: { fontSize: '.78rem', color: CORES.textSec, fontWeight: 600, letterSpacing: '.02em' },
  cabecalhoColunas: {
    display: 'grid', gridTemplateColumns: '44px 1fr 44px', alignItems: 'end', gap: '.6rem',
  },
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
    background: CORES.card, fontSize: '.98rem', lineHeight: 1.45, cursor: 'pointer', font: 'inherit', color: CORES.text,
  },
  cartaoEscolha: {
    textAlign: 'left', padding: '.85rem 1rem', borderRadius: '12px', border: `1.5px solid ${CORES.border}`,
    fontSize: '1rem', cursor: 'pointer', font: 'inherit', color: CORES.text, fontWeight: 600,
  },
  situacao: { margin: 0, fontSize: '1.1rem', lineHeight: 1.45, fontWeight: 600 },
  titulo: { margin: 0, fontSize: '1.3rem', lineHeight: 1.25, fontWeight: 700 },
  sec: { margin: 0, color: CORES.textSec, fontSize: '.98rem', lineHeight: 1.55 },
  btn: {
    background: CORES.red, color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '.85rem 1.6rem',
    border: 'none', borderRadius: '12px', cursor: 'pointer', font: 'inherit', textAlign: 'center',
  },
  erro: {
    margin: 0, padding: '.7rem .9rem', borderRadius: '10px', fontSize: '.9rem',
    background: CORES.redSoft, border: `1px solid ${CORES.redBorder}`, color: CORES.text,
  },
};
