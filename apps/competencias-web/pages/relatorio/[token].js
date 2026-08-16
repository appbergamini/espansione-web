import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CORES } from '@espansione/brand';
import TelaDeAviso from '../../components/TelaDeAviso';

// Relatório integrado. Fundo claro (é documento, não fluxo), impressão
// direta pelo navegador — mesmo caminho do relatório do Mapa, já que
// html2pdf foi revertido no repo por gerar páginas em branco.
export default function Relatorio() {
  const router = useRouter();
  const { token } = router.query;

  const [dados, setDados] = useState(null);
  const [pendente, setPendente] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    const r = await fetch(`/teste/api/relatorio/${token}`);
    const d = await r.json();
    if (r.status === 404) return setErro('nao_encontrado');
    if (r.status === 409) return setPendente(d);
    if (!r.ok) return setErro(d.erro || 'Não foi possível montar o seu relatório.');
    setDados(d);
  }, [token]);

  useEffect(() => { if (token) carregar(); }, [token, carregar]);

  if (erro === 'nao_encontrado') {
    return <TelaDeAviso titulo="Este link não abre mais"
      texto="O teste ligado a ele não existe mais." acao={{ href: '/teste', rotulo: 'Começar um teste novo' }} />;
  }
  if (pendente) {
    return <TelaDeAviso
      titulo="Ainda falta uma parte"
      texto={pendente.motivo}
      acao={pendente.pendente === 'comportamental'
        ? { href: `/teste/comportamental/${token}`, rotulo: 'Fazer o Mapeamento Comportamental' }
        : { href: `/teste/${token}`, rotulo: 'Voltar ao teste' }}
    />;
  }
  if (erro) return <TelaDeAviso titulo="Não consegui montar" texto={erro} />;
  if (!dados) return <main style={S.fundo}><div style={S.folha}><p style={S.sec}>Montando o seu relatório…</p></div></main>;

  const [onde, competencias, porque, sustenta, trilha, passo, convite] = dados.blocos;

  return (
    <main style={S.fundo}>
      <style>{IMPRESSAO}</style>
      <article style={S.folha}>

        <header style={S.capa}>
          <p style={S.eyebrow}>Espansione</p>
          <h1 style={S.h1}>Competências Empreendedoras</h1>
          <p style={S.sec}>
            O que este relatório traz não é um retrato de personalidade. É onde as suas
            competências estão hoje, e o que no seu jeito de trabalhar ajuda ou atrapalha cada uma.
          </p>
        </header>

        {/* 1 · Onde você está */}
        <Bloco n="1" titulo={onde.titulo}>
          <ul style={S.lista}>
            {onde.capacidades.map((c) => (
              <li key={c.capacidade} style={S.itemCapacidade}>
                <strong style={S.nomeCapacidade}>{c.capacidade}</strong>
                <span style={S.sec}>{c.posicao}</span>
              </li>
            ))}
          </ul>
        </Bloco>

        {/* 2 · Suas competências */}
        <Bloco n="2" titulo={competencias.titulo}>
          {competencias.capacidades.map((cap) => (
            <div key={cap.capacidade} style={S.grupo}>
              <h3 style={S.h3}>{cap.capacidade}</h3>
              <div style={S.tabela}>
                {cap.competencias.map((c) => (
                  <div key={c.chave} style={S.linha}>
                    <span style={S.nomeComp}>{c.nome}</span>
                    <span style={S.posicao}>{c.posicao}</span>
                    {c.nivel && (
                      <span style={S.nivel}>
                        nível {c.nivel}{c.nivelEstimado ? ' (estimado)' : ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!dados.nivelCalibrado && (
            <p style={S.nota}>
              O nível aparece só nas competências aprofundadas. Ele indica a posição
              relativa dentro do seu perfil — não é uma nota, e não compara você com outras pessoas.
            </p>
          )}
        </Bloco>

        {/* 3 · Por que você está aí */}
        <Bloco n="3" titulo={porque.titulo}>
          {porque.padraoRecorrente && (
            <p style={S.destaque}>{porque.padraoRecorrente.texto}</p>
          )}
          {porque.leituras.map((l) => (
            <div key={l.chave} style={S.leitura}>
              <h3 style={S.h3}>{l.nome}</h3>
              <p style={S.corpo}>{l.texto}</p>
              {l.caracteristicas.length > 0 && (
                <p style={S.etiquetas}>
                  {l.caracteristicas.map((c) => c.caracteristica).join(' · ')}
                </p>
              )}
            </div>
          ))}
        </Bloco>

        {/* 4 · O que sustenta e o que custa */}
        <Bloco n="4" titulo={sustenta.titulo}>
          {sustenta.texto && <p style={S.corpo}>{sustenta.texto}</p>}
          {sustenta.leituras.map((l) => (
            <p key={l.pilar} style={S.corpo}>{l.texto}</p>
          ))}
        </Bloco>

        {/* 5 · Sua trilha */}
        <Bloco n="5" titulo={trilha.titulo}>
          <p style={S.corpo}>{trilha.introducao}</p>
          <ol style={S.trilha}>
            {trilha.itens.map((i) => (
              <li key={i.chave} style={S.itemTrilha}>
                <strong style={S.nomeComp}>{i.nome}</strong>
                <span style={S.sec}>{i.motivo}</span>
                {i.caracteristica && <span style={S.etiquetas}>{i.caracteristica}</span>}
              </li>
            ))}
          </ol>
        </Bloco>

        {/* 6 · Um passo para os próximos 7 dias */}
        {passo.texto && (
          <Bloco n="6" titulo={passo.titulo}>
            <p style={S.passo}>{passo.texto}</p>
          </Bloco>
        )}

        {/* 7 · Convite */}
        <section style={S.convite}>
          <h2 style={S.h2Convite}>{convite.titulo}</h2>
          <p style={S.corpo}>{convite.texto}</p>
          <a href="https://wa.me/5511985775893" style={S.btn}>Marcar a sessão de leitura</a>
        </section>

        <div style={S.acoes} className="sem-impressao">
          <button type="button" style={S.btnSecundario} onClick={() => window.print()}>
            Salvar em PDF
          </button>
        </div>
      </article>
    </main>
  );
}

function Bloco({ n, titulo, children }) {
  return (
    <section style={S.bloco}>
      <div style={S.cabecalhoBloco}>
        <span style={S.numeroBloco}>{n}</span>
        <h2 style={S.h2}>{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

const IMPRESSAO = `
  @media print {
    body { background: #fff !important; }
    .sem-impressao { display: none !important; }
    section { break-inside: avoid; }
    h2, h3 { break-after: avoid; }
    @page { margin: 18mm 16mm; }
  }
`;

const S = {
  fundo: { minHeight: '100vh', background: CORES.card, padding: '2.5rem 1rem 4rem' },
  folha: {
    maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem',
    color: CORES.text,
  },
  capa: { display: 'flex', flexDirection: 'column', gap: '.7rem', paddingBottom: '.5rem' },
  eyebrow: {
    margin: 0, fontSize: '.7rem', fontWeight: 700, letterSpacing: '.18em',
    textTransform: 'uppercase', color: CORES.red,
  },
  h1: { margin: 0, fontSize: 'clamp(1.7rem, 4vw, 2.3rem)', lineHeight: 1.12, letterSpacing: '-.025em', fontWeight: 700 },
  bloco: { display: 'flex', flexDirection: 'column', gap: '.9rem' },
  cabecalhoBloco: {
    display: 'flex', alignItems: 'baseline', gap: '.7rem',
    borderTop: `2px solid ${CORES.text}`, paddingTop: '.9rem',
  },
  numeroBloco: { fontSize: '.85rem', fontWeight: 700, color: CORES.red, fontVariantNumeric: 'tabular-nums' },
  h2: { margin: 0, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-.015em', lineHeight: 1.2 },
  h3: { margin: 0, fontSize: '1rem', fontWeight: 700 },
  corpo: { margin: 0, fontSize: '1rem', lineHeight: 1.62, maxWidth: '62ch' },
  sec: { margin: 0, color: CORES.textSec, fontSize: '.95rem', lineHeight: 1.55 },
  nota: {
    margin: 0, fontSize: '.85rem', color: CORES.textSec, lineHeight: 1.5,
    borderLeft: `2px solid ${CORES.border}`, paddingLeft: '.8rem',
  },
  lista: { margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.6rem' },
  itemCapacidade: {
    display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '.2rem .7rem',
    borderBottom: `1px solid ${CORES.border}`, paddingBottom: '.6rem',
  },
  nomeCapacidade: { fontSize: '1.05rem', fontWeight: 700 },
  grupo: { display: 'flex', flexDirection: 'column', gap: '.5rem' },
  tabela: { display: 'flex', flexDirection: 'column' },
  linha: {
    display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '.2rem .6rem',
    padding: '.5rem 0', borderBottom: `1px solid ${CORES.border}`,
  },
  nomeComp: { fontSize: '1rem', fontWeight: 600, flex: '1 1 16rem' },
  posicao: { fontSize: '.9rem', color: CORES.textSec, fontWeight: 600 },
  nivel: { fontSize: '.82rem', color: CORES.red, fontWeight: 700, whiteSpace: 'nowrap' },
  leitura: { display: 'flex', flexDirection: 'column', gap: '.4rem', paddingTop: '.4rem' },
  etiquetas: {
    margin: 0, fontSize: '.8rem', fontWeight: 700, letterSpacing: '.05em',
    textTransform: 'uppercase', color: CORES.textSec,
  },
  destaque: {
    margin: 0, fontSize: '1.02rem', lineHeight: 1.55, fontWeight: 600,
    background: CORES.track, borderRadius: '12px', padding: '1rem 1.1rem',
  },
  trilha: { margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '.8rem' },
  itemTrilha: { display: 'flex', flexDirection: 'column', gap: '.15rem' },
  passo: {
    margin: 0, fontSize: '1.08rem', lineHeight: 1.55, fontWeight: 600,
    borderLeft: `3px solid ${CORES.red}`, paddingLeft: '1rem',
  },
  convite: {
    display: 'flex', flexDirection: 'column', gap: '.8rem', alignItems: 'flex-start',
    background: CORES.track, borderRadius: '16px', padding: '1.6rem',
  },
  h2Convite: { margin: 0, fontSize: '1.2rem', fontWeight: 700 },
  btn: {
    background: CORES.red, color: '#fff', fontWeight: 600, fontSize: '1rem',
    padding: '.8rem 1.5rem', borderRadius: '12px', textDecoration: 'none',
  },
  acoes: { display: 'flex', justifyContent: 'center' },
  btnSecundario: {
    background: 'none', border: `1.5px solid ${CORES.border}`, color: CORES.textSec,
    fontWeight: 600, fontSize: '.92rem', padding: '.7rem 1.4rem', borderRadius: '12px',
    cursor: 'pointer', font: 'inherit',
  },
};
