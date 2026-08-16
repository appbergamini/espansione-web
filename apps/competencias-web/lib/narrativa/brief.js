// =====================================================================
// O BRIEF — o que a IA vê.
//
// INVARIANTE DESTE MÓDULO: o brief é montado a partir dos BLOCOS que o
// motor já produziu, nunca dos scores. Consequência: a IA enxerga
// estritamente MENOS do que o relatório determinístico já mostraria ao
// cliente. Nenhum score bruto, nenhuma distância de faixa, nenhum valor
// de pilar e nenhum gap numérico chegam à API — não porque o prompt pede
// discrição, mas porque não existe caminho de código que os leve até lá.
//
// A divisão de trabalho é essa, e é o ponto todo do desenho:
//   o motor DECIDE  → posição, nível, rota, pilar fora de faixa
//   a IA ESCREVE    → só prosa, sobre fatos que já estavam decididos
//
// Se um dia alguém quiser "dar mais contexto pro modelo" passando o score,
// leia de novo o parágrafo acima antes.
// =====================================================================
import { ROTULO_PILAR } from '@espansione/cis';

/** Fragilidade sem ponto de atenção comportamental, e por quê. */
const TIPO_LEITURA = {
  leituraLimitada: 'leitura_limitada',
  semPontoDeAtencao: 'sem_ponto_comportamental',
};

/**
 * @param {Object} relatorio — saída de gerarRelatorio()
 * @returns {Object} fatos, e só fatos
 */
export function montarBrief(relatorio) {
  const bloco = (id) => relatorio.blocos.find((b) => b.id === id);

  const onde = bloco('onde_voce_esta');
  const suas = bloco('suas_competencias');
  const porQue = bloco('por_que');
  const energia = bloco('sustenta_custa');
  const trilha = bloco('trilha');
  const passo = bloco('passo_7_dias');

  return {
    capacidades: onde.capacidades.map((c) => ({
      nome: c.capacidade,
      posicao: c.posicao,
    })),

    competencias: suas.capacidades.flatMap((cap) =>
      cap.competencias.map((c) => ({
        chave: c.chave,
        nome: c.nome,
        capacidade: cap.capacidade,
        posicao: c.posicao,
        // Nível só existe nas aprofundadas, e sempre pelo NOME — "nível 3"
        // não diz nada a quem lê, e a IA repetiria o número.
        nivel: c.nivelNome || null,
        nivelEstimado: Boolean(c.nivelEstimado),
      }))
    ),

    // O resultado do Mapeamento Comportamental. Qualitativo de ponta a
    // ponta: a régua da tela é geometria (posição em 0–100), e geometria
    // não vai para o modelo — ele escreveria o número.
    jeito: {
      observacao: bloco('jeito_de_trabalhar').texto,
      pilares: bloco('jeito_de_trabalhar').pilares.map((p) => ({
        pilar: p.nome,
        faz: p.descricao,
        peso: p.ordem === 1 ? 'o que mais te define'
          : p.ordem === p.de ? 'o que menos aparece em você'
          : 'no meio do seu perfil',
        // `alinhado` é informação, não ausência de informação: é o pilar
        // em que a pessoa não gasta energia se traduzindo.
        relacaoComOContexto: !p.distante ? 'alinhado'
          : p.direcao === 'acima' ? 'você tem puxado por ela mais do que ela vem'
          : 'o contexto tem segurado o que vem natural',
        observacao: p.texto,
      })),
    },

    // A leitura que o motor fez de cada competência em desenvolvimento.
    // `observacao` é a conclusão dele — a IA reescreve, não revisa.
    fragilidades: (porQue.leituras || []).map((l) => ({
      chave: l.chave,
      nome: l.nome,
      tipo: l.leituraLimitada ? TIPO_LEITURA.leituraLimitada
        : l.semPontoDeAtencao ? TIPO_LEITURA.semPontoDeAtencao
        : 'comportamental',
      caracteristicas: (l.caracteristicas || []).map((e) => ({
        caracteristica: e.caracteristica,
        pilar: ROTULO_PILAR[e.pilar] || e.pilar,
      })),
      observacao: l.texto,
    })),

    padraoRecorrente: porQue.padraoRecorrente
      ? {
          pilar: ROTULO_PILAR[porQue.padraoRecorrente.pilar] || porQue.padraoRecorrente.pilar,
          observacao: porQue.padraoRecorrente.texto,
        }
      : null,

    energia: {
      observacao: energia.texto || null,
      pilares: (energia.leituras || []).map((l) => ({
        pilar: ROTULO_PILAR[l.pilar] || l.pilar,
        observacao: l.texto,
      })),
    },

    trilha: {
      // Quando nada é comportamental o bloco muda de nome no motor. A IA
      // precisa saber disso para não escrever uma trilha de comportamento
      // onde o motor não encontrou nenhum.
      todaTecnica: Boolean(relatorio.meta?.trilhaToda1Tecnica),
      observacao: trilha.introducao,
      itens: (trilha.itens || []).map((i) => ({
        ordem: i.ordem,
        chave: i.chave,
        nome: i.nome,
        rota: i.rota,
        caracteristica: i.caracteristica || null,
        observacao: i.motivo,
      })),
    },

    passo: passo.competencia
      ? { competencia: passo.competencia, acao: passo.texto }
      : null,
  };
}

/**
 * Rede de segurança: nada que pareça resultado numérico pode entrar no
 * brief. Roda antes de cada chamada — custa microssegundos e evita a
 * classe de bug em que alguém acrescenta um campo "só para dar contexto".
 */
const PADROES_PROIBIDOS = [
  [/\bscore/i, 'score'],
  [/\bpercentil/i, 'percentil'],
  [/\bDISC\b/i, 'termo do instrumento de origem'],
  [/\b\d{2,3}\s*(pontos?|%)/i, 'número de pilar ou de gap'],
];

export function conferirBrief(brief) {
  const texto = JSON.stringify(brief);
  const achados = [];
  for (const [re, nome] of PADROES_PROIBIDOS) {
    if (re.test(texto)) achados.push(nome);
  }
  return { limpo: achados.length === 0, achados };
}
