import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TelaDeAviso from '../../components/TelaDeAviso';

// =====================================================================
// Relatório integrado.
//
// DIREÇÃO: a metodologia é FAIXA — posição dentro de um intervalo. Não é
// nota, não é gauge, não é percentil. A marca de posição em 5 se repete a
// cada competência e dá o ritmo da página: é a medida desenhada.
//
// As 5 células viraram 5 ESTRELAS em 16/08, a pedido do cliente. Vale
// saber o que se trocou: estrela é o dispositivo de nota por excelência,
// e isso puxa contra "frágil não é defeito". O que compensa é que o
// rótulo ("Frágil", "Mais forte") saiu de baixo do nome da competência —
// ele lia como veredicto e a contagem já diz a mesma coisa. Saldo
// provavelmente neutro. Não reverter sem falar com o cliente.
//
// COR: o calor não vem de bege (default genérico, e briga com a marca) —
// vem do próprio vermelho Espansione em tinta baixa, e o peso vem de
// campos navy cheios alternando com branco. Cor codifica POSIÇÃO, nunca
// "bom/ruim": a escala vai de cheia a aberta, jamais verde→vermelho,
// porque frágil aqui não é defeito.
//
// Tema único e claro, de propósito: é documento para ler e imprimir.
// =====================================================================
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
    return <TelaDeAviso titulo="Ainda falta uma parte" texto={pendente.motivo}
      acao={pendente.pendente === 'comportamental'
        ? { href: `/teste/comportamental/${token}`, rotulo: 'Fazer o Mapeamento Comportamental' }
        : { href: `/teste/${token}`, rotulo: 'Voltar ao teste' }} />;
  }
  if (erro) return <TelaDeAviso titulo="Não consegui montar" texto={erro} />;

  if (!dados) {
    return (
      <>
        <style>{CSS}</style>
        <main className="rel">
          <div className="folha">
            {/* O relatório é escrito na primeira abertura, não montado de
                peças prontas. Dizer isso evita que a espera pareça travamento. */}
            <p className="sec">Escrevendo o seu relatório…</p>
            <p className="espera">Leva cerca de um minuto. Ele é escrito uma vez, a partir das suas respostas — depois abre na hora, sempre igual.</p>
          </div>
        </main>
      </>
    );
  }

  const [onde, competencias, porque, sustenta, trilha, passo, convite] = dados.blocos;

  return (
    <>
      <style>{CSS}</style>
      <main className="rel">
        <article className="folha">

          {/* ── capa: campo navy, a tese antes do dado ── */}
          <header className="capa">
            <p className="marca">Espansione</p>
            <h1 className="titulo">Competências<br />Empreendedoras</h1>
            <p className="tese">
              Não é um retrato de personalidade. É onde as suas competências estão hoje —
              e o que, no seu jeito de trabalhar, ajuda ou atrapalha cada uma delas.
            </p>
          </header>

          {/* Abertura: a primeira frase escrita SOBRE esta pessoa. Fica
              fora das seções numeradas de propósito — é o lede, e a
              numeração começa quando começa o conteúdo. */}
          {dados.abertura && <p className="abertura">{dados.abertura}</p>}

          {/* ── 1 ── */}
          <Secao numero="1" titulo={onde.titulo}>
            {onde.texto && <p className="corpo">{onde.texto}</p>}
            <div className="capacidades">
              {onde.capacidades.map((c) => (
                <div key={c.capacidade} className="capacidade">
                  <span className="cap-nome">{c.capacidade}</span>
                  <span className="cap-pos">{c.posicao}</span>
                </div>
              ))}
            </div>
          </Secao>

          {/* ── 2 ── */}
          <Secao numero="2" titulo={competencias.titulo}>
            {competencias.texto && <p className="corpo">{competencias.texto}</p>}
            <div className="escala-legenda" aria-hidden="true">
              <span>mais frágil</span><span>mais forte</span>
            </div>
            {competencias.capacidades.map((cap) => (
              <div key={cap.capacidade} className="grupo">
                <h3 className="grupo-nome">{cap.capacidade}</h3>
                {cap.competencias.map((c) => (
                  <div key={c.chave} className="comp">
                    <div className="comp-cabeca">
                      <span className="comp-nome">{c.nome}</span>
                      <Faixa passo={c.passo} de={c.de} rotulo={c.posicao} />
                    </div>
                    {/* Só as 3 aprofundadas têm nível. Sem ele o pé fica
                        vazio — e um pé vazio abre um vão que parece erro. */}
                    {c.nivelNome && (
                      <div className="comp-pe">
                        <span className="comp-nivel">
                          {c.nivelNome}{c.nivelEstimado ? ' · estimado' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
            <p className="nota">
              A leitura é da sua ordem interna: onde cada competência está em relação às
              outras onze, dentro de você. Não é nota, e não compara você com ninguém.
              {!dados.nivelCalibrado && ' O nível aparece só nas competências aprofundadas.'}
            </p>
          </Secao>

          {/* ── 3 ── */}
          <Secao numero="3" titulo={porque.titulo}>
            {porque.texto && <p className="corpo">{porque.texto}</p>}
            {porque.padraoRecorrente && (
              <p className="padrao">{porque.padraoRecorrente.texto}</p>
            )}
            {porque.leituras.map((l) => (
              <div key={l.chave} className="leitura">
                <h3 className="leitura-nome">{l.nome}</h3>
                {l.caracteristicas.length > 0 && (
                  <p className="etiquetas">
                    {l.caracteristicas.map((c) => c.caracteristica).join(' · ')}
                  </p>
                )}
                <p className="corpo">{l.texto}</p>
              </div>
            ))}
          </Secao>

          {/* ── 4 ── */}
          <Secao numero="4" titulo={sustenta.titulo} campo="blush">
            {sustenta.texto && <p className="corpo">{sustenta.texto}</p>}
            {sustenta.leituras.map((l) => <p key={l.pilar} className="corpo">{l.texto}</p>)}
          </Secao>

          {/* ── 5 · o pagamento do relatório: campo navy ── */}
          <section className="trilha">
            <h2 className="trilha-titulo">{trilha.titulo}</h2>
            <p className="trilha-intro">{trilha.introducao}</p>
            <ol className="trilha-lista">
              {trilha.itens.map((i) => (
                <li key={i.chave} className="trilha-item">
                  <span className="trilha-ordem">{i.ordem}</span>
                  <div>
                    <span className="trilha-nome">{i.nome}</span>
                    {/* `motivo` é a conclusão curta do motor; `texto` é ela
                        escrita por extenso. Sem narrativa, o motor fala. */}
                    <span className="trilha-motivo">{i.texto || i.motivo}</span>
                    {i.caracteristica && <span className="trilha-etiqueta">{i.caracteristica}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ── 6 ── */}
          {passo.texto && (
            <section className="passo">
              <p className="passo-rotulo">{passo.titulo}</p>
              <p className="passo-texto">{passo.texto}</p>
            </section>
          )}

          {/* ── 7 ── */}
          <section className="convite">
            <h2 className="convite-titulo">{convite.titulo}</h2>
            <p className="convite-texto">{convite.texto}</p>
            <a className="botao" href="https://wa.me/5511985775893">Marcar a sessão de leitura</a>
          </section>

          {dados.fechamento && <p className="fechamento">{dados.fechamento}</p>}

          <div className="acoes sem-impressao">
            <button type="button" className="botao-vazado" onClick={() => window.print()}>
              Salvar em PDF
            </button>
          </div>
        </article>
      </main>
    </>
  );
}

function Secao({ numero, titulo, campo, children }) {
  return (
    <section className={`secao${campo ? ` secao--${campo}` : ''}`}>
      <div className="secao-cabeca">
        <span className="secao-numero">{numero}</span>
        <h2 className="secao-titulo">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

/**
 * A assinatura do documento: posição em 5 células.
 * Mesma informação do rótulo, em forma de posição. Não é barra de
 * progresso nem nota — é onde a competência está na escala.
 */
/**
 * Estrela de 5 pontas em SVG, não caractere Unicode (★): o glifo muda de
 * desenho e de peso a cada fonte e sistema, e o relatório é impresso.
 * Geometria: raio externo 11, interno 4,8 num viewBox 24 — ponta afiada o
 * bastante para não virar flor no tamanho pequeno.
 */
const ESTRELA = 'M12 1 L14.82 8.12 L22.46 8.6 L16.57 13.48 L18.47 20.9 L12 16.8 '
  + 'L5.53 20.9 L7.43 13.48 L1.54 8.6 L9.18 8.12 Z';

/**
 * O rótulo da posição saiu da tela (16/08, pedido do cliente): a contagem
 * de estrelas já diz a mesma coisa, e "Frágil" carimbado embaixo do nome
 * da competência lia como veredicto. Ele continua no `aria-label` — quem
 * usa leitor de tela não conta estrela.
 */
function Faixa({ passo, de, rotulo }) {
  return (
    <span className="faixa" role="img" aria-label={`Posição: ${rotulo}`}>
      {Array.from({ length: de }, (_, i) => (
        <svg key={i} className={`estrela${i < passo ? ' estrela--cheia' : ''}`}
             viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d={ESTRELA} />
        </svg>
      ))}
    </span>
  );
}

const CSS = `
:root {
  --navy: #001A3B;
  --navy-2: #013063;
  --red: #C72638;
  --blush: #FBEEF0;
  --mist: #E4EAF2;
  --slate: #5B6B7F;
  --papel: #FFFFFF;
  --display: 'Poppins', system-ui, sans-serif;
  --corpo: 'Manrope', 'Poppins', system-ui, sans-serif;
}

.rel { min-height: 100vh; background: var(--papel); color: var(--navy); padding: 0 1rem 5rem;
       font-family: var(--corpo); -webkit-font-smoothing: antialiased; }
.folha { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 3.5rem; }

.rel section, .rel header { animation: sobe .5s ease both; }
@keyframes sobe { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .rel section, .rel header { animation: none; } }

/* ── capa ─────────────────────────────────────────────── */
.capa {
  margin: 0 -1rem; padding: 4rem 2rem 3.5rem;
  background: radial-gradient(120% 140% at 50% -20%, var(--navy-2), var(--navy) 62%);
  color: #fff; display: flex; flex-direction: column; gap: 1.1rem;
  border-bottom: 5px solid var(--red);
}
.marca { margin: 0; font-family: var(--display); font-size: .68rem; font-weight: 700;
         letter-spacing: .22em; text-transform: uppercase; color: var(--red); }
.capa .marca { color: #FF8A97; }
.titulo { margin: 0; font-family: var(--display); font-weight: 700;
          font-size: clamp(2.1rem, 6.5vw, 3.4rem); line-height: 1.02; letter-spacing: -.03em; }
.tese { margin: .4rem 0 0; max-width: 46ch; font-size: 1.02rem; line-height: 1.6; color: #C3D2E6; }

/* ── seções ───────────────────────────────────────────── */
.secao { display: flex; flex-direction: column; gap: 1.1rem; }
.secao--blush { background: var(--blush); border-radius: 18px; padding: 1.8rem; }
.secao-cabeca { display: flex; align-items: baseline; gap: .8rem;
                border-top: 2px solid var(--navy); padding-top: 1rem; }
.secao--blush .secao-cabeca { border-top-color: var(--red); }
.secao-numero { font-family: var(--display); font-weight: 700; font-size: .8rem;
                color: var(--red); font-variant-numeric: tabular-nums; }
.secao-titulo { margin: 0; font-family: var(--display); font-weight: 700;
                font-size: clamp(1.25rem, 3vw, 1.6rem); letter-spacing: -.02em; line-height: 1.18; }
.corpo { margin: 0; font-size: 1rem; line-height: 1.65; max-width: 64ch; }
.sec { margin: 0; color: var(--slate); font-size: .95rem; }
.espera { margin: .5rem 0 0; color: var(--slate); font-size: .85rem; line-height: 1.55; max-width: 46ch; }

/* Lede: primeiro parágrafo escrito sobre esta pessoa. Maior que o corpo e
   sem numeração — a numeração é do conteúdo, não da abertura. */
.abertura { margin: 0; font-size: 1.2rem; line-height: 1.6; max-width: 58ch;
            color: var(--navy); border-left: 3px solid var(--red); padding-left: 1.2rem; }
/* Fechamento: sai do campo do convite e volta ao papel, em voz baixa. */
.fechamento { margin: 0; font-size: .95rem; line-height: 1.6; max-width: 54ch;
              color: var(--slate); text-align: center; align-self: center; }
.nota { margin: .6rem 0 0; font-size: .85rem; line-height: 1.55; color: var(--slate);
        border-left: 2px solid var(--mist); padding-left: .9rem; max-width: 60ch; }

/* ── 1 · capacidades ──────────────────────────────────── */
.capacidades { display: flex; flex-direction: column; }
.capacidade { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between;
              gap: .2rem 1rem; padding: .85rem 0; border-bottom: 1px solid var(--mist); }
.capacidade:first-child { border-top: 1px solid var(--mist); }
.cap-nome { font-family: var(--display); font-weight: 700; font-size: 1.12rem; letter-spacing: -.01em; }
.cap-pos { font-size: .93rem; color: var(--slate); }

/* ── 2 · competências + a faixa ───────────────────────── */
.escala-legenda { display: flex; justify-content: space-between; font-size: .66rem; font-weight: 700;
                  letter-spacing: .1em; text-transform: uppercase; color: var(--slate);
                  max-width: 158px; margin-left: auto; }
.grupo { display: flex; flex-direction: column; margin-top: 1rem; }
.grupo-nome { margin: 0 0 .3rem; font-family: var(--display); font-size: .72rem; font-weight: 700;
              letter-spacing: .14em; text-transform: uppercase; color: var(--red); }
.comp { padding: .7rem 0; border-bottom: 1px solid var(--mist); }
.comp-cabeca { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.comp-nome { font-size: 1.02rem; font-weight: 600; line-height: 1.35; }
.comp-pe { display: flex; gap: .6rem; align-items: baseline; flex-wrap: wrap; margin-top: .3rem; }
.comp-nivel { font-family: var(--display); font-size: .72rem; font-weight: 700; letter-spacing: .04em;
              text-transform: uppercase; color: var(--red); }

.faixa { display: inline-flex; gap: 5px; flex: none; align-items: center; }
/* Vazia é silhueta cheia em tinta baixa, não contorno: contorno some na
   impressão e a contagem de cheias fica sem referência para comparar.
   Tinta um pouco acima do --mist das bordas — no --mist puro a estrela
   vazia lê como falha de renderização, não como posição não alcançada. */
.estrela { width: 22px; height: 22px; flex: none; fill: #CBD8E7; }
.estrela--cheia { fill: var(--navy); }
@media (max-width: 560px) { .estrela { width: 17px; height: 17px; } .escala-legenda { max-width: 150px; } }

/* ── 3 · leituras ─────────────────────────────────────── */
.padrao { margin: 0; font-size: 1.03rem; line-height: 1.55; font-weight: 600;
          background: var(--blush); border-radius: 14px; padding: 1.1rem 1.2rem; max-width: 62ch; }
.leitura { display: flex; flex-direction: column; gap: .35rem; padding-top: .8rem; }
.leitura-nome { margin: 0; font-family: var(--display); font-size: 1.05rem; font-weight: 700; }
.etiquetas { margin: 0; font-family: var(--display); font-size: .68rem; font-weight: 700;
             letter-spacing: .13em; text-transform: uppercase; color: var(--slate); }

/* ── 5 · trilha, o campo navy do meio ─────────────────── */
.trilha { margin: 0 -1rem; padding: 2.5rem 2rem; background: var(--navy); color: #fff;
          display: flex; flex-direction: column; gap: 1rem; border-radius: 0; }
.trilha-titulo { margin: 0; font-family: var(--display); font-weight: 700;
                 font-size: clamp(1.35rem, 3.4vw, 1.8rem); letter-spacing: -.02em; line-height: 1.15; }
.trilha-intro { margin: 0; color: #C3D2E6; font-size: 1rem; line-height: 1.6; max-width: 58ch; }
.trilha-lista { margin: .6rem 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 1.1rem; }
/* Alinhamento por baseline servia quando o motivo era uma frase; com um
   parágrafo escrito, flex-start é o que segura a coluna do número. */
.trilha-item { display: flex; gap: 1rem; align-items: flex-start; }
.trilha-ordem { font-family: var(--display); font-weight: 700; font-size: 1.5rem; color: var(--red);
                line-height: 1; flex: none; width: 1.4rem; font-variant-numeric: tabular-nums; }
.trilha-nome { display: block; font-family: var(--display); font-weight: 700; font-size: 1.08rem; }
.trilha-motivo { display: block; color: #C3D2E6; font-size: .95rem; line-height: 1.6;
                 margin-top: .3rem; max-width: 58ch; }
.trilha-etiqueta { display: block; font-family: var(--display); font-size: .68rem; font-weight: 700;
                   letter-spacing: .13em; text-transform: uppercase; color: #8FA6C4; margin-top: .3rem; }

/* ── 6 · o passo ──────────────────────────────────────── */
.passo { border-left: 4px solid var(--red); padding: .3rem 0 .3rem 1.3rem;
         display: flex; flex-direction: column; gap: .4rem; }
.passo-rotulo { margin: 0; font-family: var(--display); font-size: .68rem; font-weight: 700;
                letter-spacing: .16em; text-transform: uppercase; color: var(--red); }
.passo-texto { margin: 0; font-size: 1.18rem; line-height: 1.5; font-weight: 600; max-width: 54ch; }

/* ── 7 · convite ──────────────────────────────────────── */
.convite { background: var(--navy); color: #fff; border-radius: 18px; padding: 2rem;
           display: flex; flex-direction: column; gap: .9rem; align-items: flex-start; }
.convite-titulo { margin: 0; font-family: var(--display); font-size: 1.3rem; font-weight: 700; }
.convite-texto { margin: 0; color: #C3D2E6; font-size: 1rem; line-height: 1.6; max-width: 52ch; }
.botao { background: var(--red); color: #fff; font-family: var(--display); font-weight: 600;
         font-size: 1rem; padding: .85rem 1.6rem; border-radius: 12px; text-decoration: none;
         transition: background .18s, transform .18s; }
.botao:hover { background: #E13345; transform: translateY(-1px); }
.acoes { display: flex; justify-content: center; }
.botao-vazado { background: none; border: 1.5px solid var(--mist); color: var(--slate);
                font-family: var(--corpo); font-weight: 600; font-size: .92rem;
                padding: .7rem 1.5rem; border-radius: 12px; cursor: pointer; }
.botao-vazado:hover { border-color: var(--slate); color: var(--navy); }
.botao:focus-visible, .botao-vazado:focus-visible { outline: 2px solid var(--red); outline-offset: 3px; }

/* ── impressão ────────────────────────────────────────── */
@media print {
  .rel { padding: 0; }
  .folha { max-width: none; gap: 2rem; }
  .sem-impressao { display: none !important; }
  .capa, .trilha, .convite { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .capa, .trilha { margin: 0; }
  .secao, .leitura, .comp, .trilha-item, .passo { break-inside: avoid; }
  .secao-titulo, .grupo-nome, .leitura-nome { break-after: avoid; }
  .estrela { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { margin: 14mm; }
}
`;
