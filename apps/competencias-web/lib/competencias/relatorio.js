// =====================================================================
// Relatório integrado — os 8 blocos.
//
// O relatório SÓ é gerado com os dois instrumentos concluídos. Antes disso
// não existe relatório parcial: resultado parcial vira o produto na cabeça
// do cliente e o segundo instrumento nunca é feito.
//
// PROIBIÇÕES que este módulo faz valer (e que o teste de vazamento cobre):
//  ✗ lista das 16 características       ✗ qualquer termo do instrumento de origem
//  ✗ número de pilar, característica ou gap    ✗ percentil
//  ✗ rótulo de perfil                   ✗ previsão de sucesso
//  ✗ Índice de Ajuste / de Coerência    ✗ pontuação item a item
// =====================================================================
import { CAPACIDADES, PILARES, nomeDe, leituraDe, faixaDe, competenciasDaCapacidade } from './catalog.js';
import { ROTULO_POSICAO } from './score.js';
import { avaliarCompetencia, rotaDaTrilha, TOLERANCIA_PADRAO } from './faixas.js';
import { etiquetasDe, PASSO_7_DIAS, DESCRICAO_PILAR } from './lexico.js';
import { ROTULO_PILAR, lerGap } from '@espansione/cis';

const FRAGEIS = new Set(['fragil', 'mais_fragil', 'intermediaria']);
const MAX_TRILHA = 3;

/**
 * Os 4 níveis, nomeados pelo que cada um DESCREVE — não por número solto.
 * Vêm direto das regras de escrita dos itens ancorados (SPEC §5.5):
 * 1 evita ou terceiriza · 2 age por hábito · 3 age com critério explícito ·
 * 4 age com critério e reconfigura a situação.
 *
 * "nível 3" não diz nada a quem lê; "Age com critério" diz.
 */
export const NOME_NIVEL = {
  1: 'Evita ou passa adiante',
  2: 'Age pelo hábito',
  3: 'Age com critério',
  4: 'Age e reconfigura',
};

/** Ordem da escala, do mais frágil ao mais forte — é assim que ela é desenhada. */
export const ESCALA_CRESCENTE = ['mais_fragil', 'fragil', 'intermediaria', 'forte', 'mais_forte'];

/**
 * @param {Object} args
 * @param {Object} args.consolidado — saída de score.consolidar()
 * @param {Object} args.pilares — { determinacao: {natural, emContexto}, ... }
 * @param {Object} args.niveis — { chave: {nivel, confianca} } das 3 aprofundadas
 * @param {string[]} args.aprofundadas
 */
export function gerarRelatorio({ consolidado, pilares, niveis = {}, aprofundadas = [], delta = TOLERANCIA_PADRAO.delta }) {
  if (!consolidado || !pilares) throw new Error('relatório exige os dois instrumentos concluídos');

  const avaliacoes = Object.fromEntries(
    consolidado.ranking.map((r) => [r.chave, avaliarCompetencia(r.chave, pilares, delta)])
  );
  const gap = lerGap(pilares);

  const bloco1 = ondeVoceEsta(consolidado);
  const bloco2 = suasCompetencias(consolidado, niveis, aprofundadas);
  // O resultado do Mapeamento Comportamental vem ANTES de ser usado. Sem
  // este bloco o instrumento só aparecia como explicação (as
  // características no bloco seguinte, o custo de energia no outro) e o
  // cliente nunca via o que ele mediu — pagou por dois e recebeu um.
  const bloco3 = jeitoDeTrabalhar(pilares, gap);
  const bloco4 = porQueVoceEstaAi(consolidado, avaliacoes);
  const bloco5 = oQueSustentaEOQueCusta(gap);
  const bloco6 = trilha(consolidado, avaliacoes, niveis, aprofundadas);
  const bloco7 = passoDaSemana(bloco6);
  const bloco8 = convite();

  return {
    blocos: [bloco1, bloco2, bloco3, bloco4, bloco5, bloco6, bloco7, bloco8],
    // metadado interno; não é para renderizar
    meta: {
      trilhaToda1Tecnica: bloco6.itens.length > 0 && bloco6.itens.every((i) => i.rota === 'tecnica'),
      delta,
    },
  };
}

// ── 1 · Onde você está ───────────────────────────────────────────────
function ondeVoceEsta(consolidado) {
  const ordenadas = [...consolidado.capacidades].sort((a, b) => b.score - a.score);
  return {
    id: 'onde_voce_esta',
    titulo: 'Onde você está',
    // Posição relativa, sem número: o instrumento é ipsativo e não produz
    // nível absoluto. Nada de percentil enquanto não houver base normativa.
    capacidades: ordenadas.map((c, i) => ({
      capacidade: c.capacidade,
      posicao: i === 0 ? 'a mais forte do seu perfil'
        : i === ordenadas.length - 1 ? 'a que mais exige intenção'
        : 'no meio do seu perfil',
      // Posição relativa entre as 4, para desenhar. Sem número exposto.
      ordem: i + 1,
      de: ordenadas.length,
    })),
  };
}

// ── 2 · Suas competências ────────────────────────────────────────────
function suasCompetencias(consolidado, niveis, aprofundadas) {
  return {
    id: 'suas_competencias',
    titulo: 'Suas competências',
    capacidades: CAPACIDADES.map((cap) => ({
      capacidade: cap,
      competencias: competenciasDaCapacidade(cap).map((c) => {
        const r = consolidado.ranking.find((x) => x.chave === c.chave);
        const n = aprofundadas.includes(c.chave) ? niveis[c.chave] : null;
        return {
          chave: c.chave,
          nome: c.nome,
          posicao: ROTULO_POSICAO[r.posicao],
          // Índice de 1 a 5 na escala desenhada. É a MESMA informação do
          // rótulo, em forma de posição — não é score nem percentil.
          passo: ESCALA_CRESCENTE.indexOf(r.posicao) + 1,
          de: ESCALA_CRESCENTE.length,
          // Nível só nas 3 aprofundadas, e sempre dizendo quando é estimado.
          nivel: n?.nivel ?? null,
          nivelNome: n?.nivel ? NOME_NIVEL[n.nivel] : null,
          nivelEstimado: n?.confianca === 'estimado',
        };
      }),
    })),
  };
}

// ── 3 · O seu jeito de trabalhar (resultado do comportamental) ───────
/**
 * O que o Mapeamento Comportamental mediu, mostrado como POSIÇÃO.
 *
 * Os 4 pilares somam 200, então o valor de um só significa alguma coisa
 * em relação aos outros três. Por isso o eixo é a fatia: 50 é a divisão
 * igual entre os quatro, e é o ponto de equilíbrio marcado na régua.
 * Nenhum número vai para a tela — a régua É o número.
 *
 * Duas marcas por pilar, e a distância entre elas é o assunto do bloco
 * seguinte: `natural` é como a pessoa é, `emContexto` é como ela tem
 * operado no negócio.
 */
const EQUILIBRIO = 50;   // 200 dividido entre os 4 pilares
const TETO_EIXO = 100;   // metade do total: acima disso um pilar domina o perfil

const naRegua = (v) => Math.max(0, Math.min(100, (v / TETO_EIXO) * 100));

function jeitoDeTrabalhar(pilares, gap) {
  const ordenados = [...PILARES].sort((a, b) => pilares[b].natural - pilares[a].natural);

  return {
    id: 'jeito_de_trabalhar',
    titulo: 'O seu jeito de trabalhar',
    texto: gap?.adaptacaoGeneralizada
      ? 'Em várias frentes ao mesmo tempo, o que o negócio pede de você está longe do seu jeito. Vale olhar as quatro juntas antes de olhar uma por uma.'
      : gap?.coerente
        ? 'As quatro aparecem no seu negócio como aparecem em você. É menos comum do que parece.'
        : 'Cada uma tem duas leituras: como ela é em você, e como ela tem aparecido no negócio. Onde as duas se afastam, há esforço acontecendo.',
    // Marca do eixo, para a régua desenhar. Não é resultado de ninguém.
    equilibrio: naRegua(EQUILIBRIO),
    pilares: ordenados.map((p, i) => {
      const g = gap?.porPilar[p];
      return {
        pilar: p,
        nome: ROTULO_PILAR[p],
        // Uma linha de verbos, NÃO as 4 características do pilar: listar
        // as 4 de cada um poria as 16 na tela, e aí o relatório vira
        // leitura de perfil de traços — que é a proibição do cabeçalho.
        descricao: DESCRICAO_PILAR[p],
        ordem: i + 1,
        de: PILARES.length,
        natural: naRegua(pilares[p].natural),
        emContexto: naRegua(pilares[p].emContexto),
        direcao: g?.direcao || 'igual',
        distante: Boolean(g?.grande),
        texto: textoDoPilar(ROTULO_PILAR[p], g),
      };
    }),
  };
}

function textoDoPilar(nome, g) {
  if (!g || !g.grande) return `Como você é e como você tem operado ficam no mesmo lugar em ${nome.toLowerCase()}.`;
  return g.direcao === 'acima'
    ? `${nome} aparece mais no seu dia do que no seu jeito. Você tem puxado por ela.`
    : `${nome} aparece menos no seu dia do que no seu jeito. Alguma coisa no contexto tem segurado.`;
}

// ── 4 · Por que você está aí ─────────────────────────────────────────
function porQueVoceEstaAi(consolidado, avaliacoes) {
  const alvo = consolidado.ranking.filter((r) => FRAGEIS.has(r.posicao));
  const leituras = alvo.map((r) => leituraDeUmaCompetencia(r.chave, avaliacoes[r.chave]));

  // Regra editorial 4: se um mesmo pilar aparecer sinalizado em 3 ou mais
  // competências, dizer UMA vez com força em vez de repetir o diagnóstico.
  const contagem = {};
  for (const l of leituras) for (const e of l.caracteristicas) contagem[e.pilar] = (contagem[e.pilar] || 0) + 1;
  const recorrente = Object.entries(contagem).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1])[0];

  return {
    id: 'por_que',
    titulo: 'Por que você está aí',
    padraoRecorrente: recorrente
      ? {
          pilar: recorrente[0],
          texto: `${ROTULO_PILAR[recorrente[0]]} aparece como ponto de atenção em várias frentes ao mesmo tempo. Vale tratar como um padrão só, e não como ${recorrente[1]} assuntos separados.`,
        }
      : null,
    leituras,
  };
}

function leituraDeUmaCompetencia(chave, av) {
  const l = leituraDe(chave);
  const f = faixaDe(chave);

  if (f?.confianca === 'BAIXA') {
    return {
      chave, nome: nomeDe(chave), caracteristicas: [],
      // Regra 6: sinalizar ao cliente que a leitura explica pouco ali.
      texto: 'O comportamento explica pouco desta competência — ela depende mais de escolha e de contexto do que de estilo. Vale conversar sobre ela na sessão de leitura.',
      semPontoDeAtencao: false,
      leituraLimitada: true,
    };
  }

  if (!av || av.sinalizados.length === 0) {
    return {
      chave, nome: nomeDe(chave), caracteristicas: [],
      // Regra editorial 3: dizer explicitamente. Não forçar um achado —
      // quem sempre encontra problema parece estar vendendo.
      texto: 'Sem pontos de atenção comportamentais nesta competência. Se ela aparece em desenvolvimento, o caminho é técnico: é sobre saber fazer, não sobre como você é.',
      semPontoDeAtencao: true,
      leituraLimitada: false,
    };
  }

  const caracteristicas = etiquetasDe(chave, av.sinalizados, av.porPilar, 3);
  const principal = caracteristicas[0];
  const posicao = av.porPilar[principal.pilar].posicao;
  const frase = posicao === 'acima' ? l?.acima : l?.abaixo;

  return {
    chave,
    nome: nomeDe(chave),
    caracteristicas,
    texto: posicao === 'acima'
      ? `${frase}. Aqui, ${principal.caracteristica.toLowerCase()} trabalha a favor até certo ponto — passando dele, começa a cobrar caro.`
      : `${frase}. É onde ${principal.caracteristica.toLowerCase()} exige intenção da sua parte, porque não vem sozinha.`,
    semPontoDeAtencao: false,
    leituraLimitada: false,
  };
}

// ── 5 · O que sustenta e o que custa ─────────────────────────────────
function oQueSustentaEOQueCusta(gap) {
  // Opera sobre os 4 pilares brutos. Nenhum número de gap é exposto.
  if (!gap) return { id: 'sustenta_custa', titulo: 'O que sustenta e o que custa', texto: null, leituras: [] };

  if (gap.adaptacaoGeneralizada) {
    return {
      id: 'sustenta_custa',
      titulo: 'O que sustenta e o que custa',
      texto: 'O jeito como você se comporta no negócio hoje está bem distante do seu jeito natural, em várias frentes ao mesmo tempo. Isso funciona — e cobra energia todo dia. Normalmente é sinal de que o papel atual pede uma configuração diferente da que você tem.',
      leituras: [],
    };
  }
  if (gap.coerente) {
    return {
      id: 'sustenta_custa',
      titulo: 'O que sustenta e o que custa',
      texto: 'O que o negócio exige de você está próximo do seu jeito natural. Isso é uma força: sobra energia para o que importa, em vez de gastar com adaptação.',
      leituras: [],
    };
  }

  const leituras = PILARES.filter((p) => gap.porPilar[p].grande).map((p) => ({
    pilar: p,
    texto: gap.porPilar[p].direcao === 'acima'
      ? `Você tem forçado mais ${ROTULO_PILAR[p].toLowerCase()} do que costuma ter naturalmente. Funciona, e é justamente o tipo de esforço que não se sustenta por anos sem custo.`
      : `O contexto atual tem segurado a sua ${ROTULO_PILAR[p].toLowerCase()} natural. Vale olhar se é o papel, a sociedade ou o momento que está pedindo isso.`,
  }));

  return {
    id: 'sustenta_custa',
    titulo: 'O que sustenta e o que custa',
    texto: 'Há diferença entre como você é e como você tem operado no negócio. Não é fragilidade — é custo de energia, e vale saber onde ele está.',
    leituras,
  };
}

// ── 6 · Sua trilha ───────────────────────────────────────────────────
function trilha(consolidado, avaliacoes, niveis, aprofundadas) {
  const candidatas = consolidado.ranking
    .filter((r) => FRAGEIS.has(r.posicao))
    // Sustentar-se é pré-condição, não diferenciação: não puxa prioridade.
    .filter((r) => r.capacidade !== 'Sustentar-se' || aprofundadas.includes(r.chave))
    .sort((a, b) => {
      const na = niveis[a.chave]?.nivel ?? 9;
      const nb = niveis[b.chave]?.nivel ?? 9;
      if (na !== nb) return na - nb;                    // nível afirmado mais baixo primeiro
      const da = maiorDistancia(avaliacoes[a.chave]);
      const db = maiorDistancia(avaliacoes[b.chave]);
      return db - da;                                    // depois, maior distância da faixa
    })
    .slice(0, MAX_TRILHA);

  const itens = candidatas.map((r, i) => {
    const av = avaliacoes[r.chave];
    const rota = rotaDaTrilha(av);
    return {
      ordem: i + 1,
      chave: r.chave,
      nome: nomeDe(r.chave),
      rota: rota.rota,
      pilarAlvo: rota.pilarAlvo,
      caracteristica: rota.pilarAlvo ? etiquetasDe(r.chave, [rota.pilarAlvo], av.porPilar, 1)[0]?.caracteristica : null,
      motivo: rota.motivo,
    };
  });

  const todasTecnicas = itens.length > 0 && itens.every((i) => i.rota === 'tecnica' || i.rota === 'confianca_baixa');

  return {
    id: 'trilha',
    // Quando nada é comportamental, o bloco muda de nome: não se força uma
    // trilha comportamental onde o motor não achou nada.
    titulo: todasTecnicas ? 'O que desenvolver' : 'Sua trilha',
    introducao: todasTecnicas
      ? 'Nas competências em desenvolvimento, o seu jeito de trabalhar não é o que está no caminho. O que falta é técnica — e isso se resolve com conteúdo e prática, não com mudança de comportamento.'
      : 'Uma competência por ciclo. Começar por três é o que cabe em um trimestre sem virar lista de boas intenções.',
    itens,
  };
}

function maiorDistancia(av) {
  if (!av) return 0;
  return Math.max(...PILARES.map((p) => av.porPilar[p].distancia));
}

// ── 7 · Um passo para os próximos 7 dias ─────────────────────────────
function passoDaSemana(blocoTrilha) {
  const primeira = blocoTrilha.itens[0];
  return {
    id: 'passo_7_dias',
    titulo: 'Um passo para os próximos 7 dias',
    competencia: primeira?.nome || null,
    texto: primeira ? PASSO_7_DIAS[primeira.chave] : null,
  };
}

// ── 8 · Convite ──────────────────────────────────────────────────────
function convite() {
  return {
    id: 'convite',
    titulo: 'O próximo passo',
    texto: 'Uma sessão de leitura de 45 minutos para percorrer este relatório com você e definir por onde começar.',
  };
}

/**
 * Varredura obrigatória antes de publicar (QA da SPEC §11.4): chave de
 * tradução crua no corpo do texto, e qualquer termo proibido.
 * Instrumentos concorrentes já vazaram chave crua em relatório de cliente.
 */
export const TERMOS_PROIBIDOS = [
  'DISC', 'Dominância', 'Influência', 'Estabilidade', 'Conformidade',
  'deficiente', 'fraco', 'ruim', 'percentil',
  'Índice de Ajuste', 'Índice de Coerência', 'aderência',
];

/**
 * `abertura` e `fechamento` são texto solto, fora dos blocos (só existem
 * quando a IA escreve o relatório — ver lib/narrativa). Entram na
 * varredura pelo mesmo motivo que o resto: é a única guarda de saída, e
 * texto que escapa dela é texto que ninguém revisou.
 */
export function varrerRelatorio(relatorio) {
  const avulsos = [relatorio.abertura, relatorio.fechamento].filter((s) => typeof s === 'string');
  const texto = JSON.stringify(relatorio.blocos) + avulsos.join(' ');
  const achados = [];

  for (const t of TERMOS_PROIBIDOS) {
    if (new RegExp(`\\b${t}\\b`, 'i').test(texto)) achados.push(`termo proibido: "${t}"`);
  }
  // chave crua: snake_case sobrando no corpo (fora dos campos técnicos)
  const corpo = [...relatorio.blocos.flatMap((b) => colherTextos(b)), ...avulsos];
  for (const s of corpo) {
    const m = s.match(/\b[a-z]+_[a-z_]+\b/);
    if (m) achados.push(`chave de tradução não resolvida no texto: "${m[0]}"`);
  }
  // número solto de pilar/gap
  for (const s of corpo) {
    if (/\b\d{1,3}\s*(pontos?|%)/i.test(s)) achados.push(`número exposto no texto: "${s.slice(0, 60)}…"`);
  }
  return { limpo: achados.length === 0, achados };
}

function colherTextos(no) {
  if (typeof no === 'string') return [no];
  if (Array.isArray(no)) return no.flatMap(colherTextos);
  if (no && typeof no === 'object') {
    return Object.entries(no)
      .filter(([k]) => ['texto', 'introducao', 'titulo', 'motivo', 'posicao'].includes(k))
      .flatMap(([, v]) => colherTextos(v));
  }
  return [];
}
