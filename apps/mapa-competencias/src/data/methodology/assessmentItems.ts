import type { AssessmentItem } from "../types";
import { canonicalBehaviorId } from "./behaviorConstructs";
import {
  ASSESSMENT_ITEMS_VERSION as ASSESSMENT_VERSION,
  METHODOLOGY_VERSION,
  CHALLENGE_MATRIX_VERSION,
  FUNCTIONAL_MATRIX_VERSION,
  ASSESSMENT_RESULT_VERSION,
} from "./versions";

export {
  ASSESSMENT_VERSION,
  METHODOLOGY_VERSION,
  CHALLENGE_MATRIX_VERSION,
  FUNCTIONAL_MATRIX_VERSION,
  ASSESSMENT_RESULT_VERSION,
};

/**
 * =====================================================================
 * BANCO DE ITENS ESPANSIONE V1.0 — PRÉ-PILOTO
 * =====================================================================
 * Fonte oficial deste documento. Textos, direções, ids, blocos e ordem
 * NÃO devem ser alterados nesta versão (não randomizar; ordem fixa para
 * comparação do piloto e rastreabilidade).
 *
 * Os behaviorId das 60 afirmações estão normalizados para os ids CANÔNICOS
 * da metodologia. O mapa de aliases (behaviorConstructs) permanece apenas
 * como proteção de compatibilidade.
 *
 * Regras de distribuição (validadas por validateAssessmentBank):
 * - 60 itens ativos
 * - 20 comportamentos, 3 itens por comportamento
 * - 5 blocos de 12 itens
 * - 30 itens direction A / 30 direction B
 * - os 3 itens de cada comportamento ficam em blocos diferentes
 * - nenhum id duplicado
 * =====================================================================
 */

export const ASSESSMENT_BLOCK_SIZE = 12;
export const BLOCKS = 5;
export const ACTIVE_ITEM_COUNT = 60;

/** Numeração visual global: bloco 1 = 01–12 … bloco 5 = 49–60. */
export const visualNumber = (item: AssessmentItem) => (item.block - 1) * ASSESSMENT_BLOCK_SIZE + item.order;

const item = (
  id: string,
  behaviorId: string,
  direction: "A" | "B",
  block: number,
  order: number,
  text: string
): AssessmentItem => ({
  id,
  text,
  behaviorId,
  direction,
  block,
  order,
  active: true,
  assessmentVersion: ASSESSMENT_VERSION,
});

export const assessmentItems: AssessmentItem[] = [
  /* ------------------------------- BLOCO 1 ------------------------------- */
  item("REF01", "reflexivo", "B", 1, 1, "Quando um problema importante aparece, costumo ir além da primeira explicação para entender o que pode estar por trás dele."),
  item("SOC02", "sociabilidade", "B", 1, 2, "Tenho facilidade para iniciar conversas e criar contato com pessoas novas em contextos profissionais."),
  item("FAT02", "baseado-em-fatos", "B", 1, 3, "Para sustentar uma decisão, costumo buscar informações que possam ser verificadas objetivamente."),
  item("AUT03", "autossuficiencia", "B", 1, 4, "Quando surge um obstáculo que acredito conseguir resolver, minha primeira tendência é tentar conduzi-lo sozinho."),
  item("DET03", "orientacao-detalhes", "A", 1, 5, "Em tarefas com muitos detalhes, tendo a avançar quando o essencial está resolvido, mesmo que ainda existam pontos menores a revisar."),
  item("POS01", "positividade-pessoas", "A", 1, 6, "Antes de confiar uma responsabilidade relevante a alguém, costumo precisar de sinais concretos de que a pessoa vai corresponder."),
  item("RIT01", "ritmo-de-trabalho", "A", 1, 7, "No dia a dia, meu ritmo de trabalho tende a ser mais cadenciado do que acelerado."),
  item("CRI02", "tolerancia-critica", "A", 1, 8, "Quando recebo uma crítica dura, num primeiro momento posso ter dificuldade de me concentrar apenas no conteúdo da mensagem."),
  item("LOG03", "logico", "A", 1, 9, "Meu raciocínio costuma seguir associações que surgem no momento, mais do que uma sequência previamente organizada."),
  item("OBS03", "observador", "B", 1, 10, "Em reuniões ou negociações, observo as reações das pessoas para ajustar minha leitura da situação."),
  item("REC01", "necessidade-reconhecimento", "B", 1, 11, "Mesmo quando já tive bons resultados em situações parecidas, posso duvidar se conseguirei lidar bem com um novo desafio."),
  item("MUL02", "multitarefa", "A", 1, 12, "Quando uma tarefa exige atenção, prefiro concentrar-me nela antes de mudar para outra frente."),

  /* ------------------------------- BLOCO 2 ------------------------------- */
  item("REA02", "realista", "A", 2, 1, "Quando surge um desafio, considero possibilidades novas mesmo que ainda pareçam pouco práticas."),
  item("ASS03", "assertividade", "B", 2, 2, "Em conversas difíceis, consigo pedir, negar ou delimitar algo de forma direta."),
  item("LOG01", "logico", "A", 2, 3, "Ao raciocinar sobre um problema novo, costumo construir o caminho enquanto avanço, sem precisar organizar previamente uma sequência."),
  item("OBS01", "observador", "B", 2, 4, "Durante uma conversa, costumo perceber mudanças de tom, expressão ou comportamento que ajudam a entender como a outra pessoa está reagindo."),
  item("PLA03", "planejamento-organizacao", "A", 2, 5, "Não sinto necessidade de manter rotinas ou estruturas muito definidas para me organizar no trabalho."),
  item("EST02", "necessidade-ser-estimado", "A", 2, 6, "A aprovação ou desaprovação das pessoas interfere pouco na forma como avalio meu próprio valor profissional."),
  item("PON03", "ponderado", "B", 2, 7, "Diante de uma oportunidade relevante, prefiro reservar algum tempo para ponderar antes de dizer sim ou não."),
  item("ACO02", "autocontrole", "B", 2, 8, "Em situações delicadas, minha tendência é manter para mim boa parte do que estou sentindo."),
  item("DET01", "orientacao-detalhes", "A", 2, 9, "Ao revisar uma entrega, minha atenção tende a ir primeiro para o resultado geral, e não para pequenos detalhes."),
  item("FRU02", "tolerancia-frustracao", "B", 2, 10, "Depois de um contratempo, consigo recuperar meu ritmo e voltar ao que precisa ser feito com relativa rapidez."),
  item("AUT01", "autossuficiencia", "B", 2, 11, "Quando tenho clareza do objetivo, sinto-me à vontade para conduzir uma responsabilidade importante por conta própria."),
  item("OTI03", "otimismo", "A", 2, 12, "Quando começo algo sem garantia de resultado, minha expectativa inicial tende a se concentrar mais nas dificuldades do que nas possibilidades de sucesso."),

  /* ------------------------------- BLOCO 3 ------------------------------- */
  item("ASS01", "assertividade", "B", 3, 1, "Quando discordo de alguém, consigo dizer com clareza qual é o meu ponto de vista."),
  item("REF02", "reflexivo", "A", 3, 2, "Quando uma explicação me parece suficiente, normalmente não procuro outras causas possíveis."),
  item("RIT02", "ritmo-de-trabalho", "B", 3, 3, "Minha forma de trabalhar costuma ser dinâmica, com ritmo acelerado de execução."),
  item("POS02", "positividade-pessoas", "B", 3, 4, "Quando começo uma nova relação profissional, minha tendência inicial é presumir boa intenção até que existam motivos para pensar diferente."),
  item("PON01", "ponderado", "B", 3, 5, "Quando uma decisão pode gerar consequências importantes, costumo avaliar os principais riscos antes de me comprometer com um caminho."),
  item("SOC03", "sociabilidade", "A", 3, 6, "Quando posso escolher, prefiro interações com poucas pessoas conhecidas a circular entre muitos contatos diferentes."),
  item("FAT03", "baseado-em-fatos", "A", 3, 7, "Mesmo sem todos os dados disponíveis, consigo confiar na minha percepção para escolher um caminho."),
  item("CRI03", "tolerancia-critica", "B", 3, 8, "Mesmo quando a forma de um feedback me incomoda, consigo separar a mensagem do modo como ela foi apresentada."),
  item("PLA01", "planejamento-organizacao", "A", 3, 9, "No dia a dia, prefiro ajustar prioridades conforme as demandas aparecem a deixar tudo definido com antecedência."),
  item("OTI01", "otimismo", "A", 3, 10, "Diante de um cenário incerto, minha atenção costuma ir primeiro para o que pode dificultar ou comprometer o resultado."),
  item("REC02", "necessidade-reconhecimento", "A", 3, 11, "Quando assumo uma responsabilidade nova, costumo confiar que serei capaz de dar conta dela."),
  item("MUL03", "multitarefa", "B", 3, 12, "Manter várias frentes de trabalho ativas ao mesmo tempo me parece natural."),

  /* ------------------------------- BLOCO 4 ------------------------------- */
  item("FAT01", "baseado-em-fatos", "A", 4, 1, "Minha primeira leitura de uma situação costuma se apoiar bastante na intuição."),
  item("SOC01", "sociabilidade", "A", 4, 2, "Em ambientes profissionais com pessoas que conheço pouco, normalmente espero que os outros iniciem a aproximação."),
  item("REA03", "realista", "B", 4, 3, "Ao escolher entre alternativas, costumo priorizar o que é viável com os recursos e condições disponíveis."),
  item("CRI01", "tolerancia-critica", "B", 4, 4, "Comentários críticos sobre meu trabalho costumam alterar pouco meu estado emocional."),
  item("AUT02", "autossuficiencia", "A", 4, 5, "Diante de uma tarefa complexa, prefiro envolver outras pessoas na construção da solução antes de seguir sozinho."),
  item("DET02", "orientacao-detalhes", "B", 4, 6, "Costumo perceber pequenas inconsistências em documentos, números ou entregas antes de finalizar algo importante."),
  item("LOG02", "logico", "B", 4, 7, "Diante de muitas informações, organizo mentalmente relações de causa, ordem e sequência antes de chegar a uma conclusão."),
  item("ACO03", "autocontrole", "A", 4, 8, "Minha comunicação tende a refletir de forma espontânea o que estou sentindo no momento."),
  item("MUL01", "multitarefa", "B", 4, 9, "Sinto-me à vontade alternando entre diferentes tipos de tarefa ao longo do dia."),
  item("EST03", "necessidade-ser-estimado", "B", 4, 10, "Sentir que sou valorizado pelas pessoas com quem trabalho tem bastante peso na forma como me percebo profissionalmente."),
  item("FRU03", "tolerancia-frustracao", "A", 4, 11, "Quando enfrento contratempos seguidos, minha energia para continuar naquela frente tende a diminuir."),
  item("OBS02", "observador", "A", 4, 12, "Quando estou concentrado no assunto de uma conversa, tendo a prestar mais atenção ao que é dito explicitamente do que aos sinais sutis da outra pessoa."),

  /* ------------------------------- BLOCO 5 ------------------------------- */
  item("PON02", "ponderado", "A", 5, 1, "Quando uma decisão precisa ser tomada, geralmente prefiro escolher um caminho rapidamente a prolongar a análise."),
  item("EST01", "necessidade-ser-estimado", "B", 5, 2, "Quando percebo desaprovação de pessoas importantes no trabalho, isso pode afetar a forma como avalio meu próprio valor profissional."),
  item("REA01", "realista", "B", 5, 3, "Ao avaliar uma ideia, uma das primeiras coisas que considero é como ela funcionaria na prática."),
  item("ACO01", "autocontrole", "A", 5, 4, "Quando algo me entusiasma ou incomoda, isso costuma aparecer rapidamente no meu tom de voz, expressão ou jeito de falar."),
  item("PLA02", "planejamento-organizacao", "B", 5, 5, "Quando as demandas aumentam, organizo prioridades, prazos e próximos passos para acompanhar o que precisa ser feito."),
  item("FRU01", "tolerancia-frustracao", "A", 5, 6, "Quando algo importante não sai como esperado, isso costuma afetar minha disposição por algum tempo."),
  item("ASS02", "assertividade", "A", 5, 7, "Em conversas de discordância, às vezes deixo parte do meu ponto de vista sem dizer."),
  item("REF03", "reflexivo", "B", 5, 8, "Depois de uma situação relevante, costumo refletir sobre causas, padrões ou aprendizados antes de fechar uma conclusão."),
  item("POS03", "positividade-pessoas", "A", 5, 9, "Mesmo depois de uma boa primeira impressão, costumo manter certa cautela até conhecer melhor a forma como a pessoa age."),
  item("RIT03", "ritmo-de-trabalho", "A", 5, 10, "Mesmo em períodos movimentados, tendo a preservar um ritmo de trabalho relativamente constante."),
  item("REC03", "necessidade-reconhecimento", "B", 5, 11, "Quando encontro dificuldades logo no início de uma tarefa, tendo a questionar se realmente tenho capacidade para realizá-la."),
  item("OTI02", "otimismo", "B", 5, 12, "Mesmo quando existem obstáculos, costumo enxergar possibilidades de um desfecho favorável."),
];

export const assessmentItemById = new Map(assessmentItems.map((i) => [i.id, i]));

/** Itens ativos. */
export const activeItems = assessmentItems.filter((i) => i.active);

export const itemsByBlock = (block: number) =>
  activeItems
    .filter((i) => i.block === block)
    .sort((a, b) => a.order - b.order);

export interface AssessmentBankReport {
  ok: boolean;
  checks: { name: string; ok: boolean; detail?: string }[];
}

/**
 * Valida todas as invariantes do banco de itens.
 * Lança Error se qualquer controle falhar (gate de deploy metodológico).
 */
export function validateAssessmentBank(): AssessmentBankReport {
  const checks: AssessmentBankReport["checks"] = [];
  const fail = (name: string, detail?: string) => {
    checks.push({ name, ok: false, detail });
  };
  const pass = (name: string, detail?: string) => {
    checks.push({ name, ok: true, detail });
  };

  const items = activeItems;

  // exatamente 60 itens ativos
  if (items.length === ACTIVE_ITEM_COUNT) {
    pass("60 itens ativos", String(items.length));
  } else {
    fail("60 itens ativos", `encontrados ${items.length}`);
  }

  // ids únicos
  const ids = items.map((i) => i.id);
  if (new Set(ids).size === ids.length) {
    pass("ids únicos");
  } else {
    fail("ids únicos", "há duplicatas");
  }

  // nenhum item sem campos obrigatórios
  const missingField = items.some(
    (i) =>
      !i.id ||
      !i.text ||
      !i.behaviorId ||
      !i.direction ||
      !i.block ||
      !i.order ||
      !i.assessmentVersion
  );
  if (missingField) {
    fail("campos obrigatórios");
  } else {
    pass("campos obrigatórios");
  }

  // exatamente 20 comportamentos (canônicos) e 3 itens por comportamento
  const byCanonical = new Map<string, typeof items>();
  for (const it of items) {
    const cid = canonicalBehaviorId(it.behaviorId);
    byCanonical.set(cid, [...(byCanonical.get(cid) ?? []), it]);
  }
  if (byCanonical.size === 20) {
    pass("20 comportamentos", String(byCanonical.size));
  } else {
    fail("20 comportamentos", `encontrados ${byCanonical.size}`);
  }
  const badCount = [...byCanonical.values()].filter((v) => v.length !== 3);
  if (badCount.length === 0) {
    pass("3 itens por comportamento");
  } else {
    fail("3 itens por comportamento", badCount.map((v) => `${v[0].behaviorId}:${v.length}`).join(", "));
  }

  // os 3 itens de cada comportamento em blocos diferentes
  const sameBlock = [...byCanonical.values()].filter((v) => new Set(v.map((i) => i.block)).size !== 3);
  if (sameBlock.length === 0) {
    pass("itens do mesmo comportamento em blocos diferentes");
  } else {
    fail("itens do mesmo comportamento em blocos diferentes", sameBlock.map((v) => v[0].behaviorId).join(", "));
  }

  // exatamente 5 blocos e 12 itens por bloco
  const blocks = new Set(items.map((i) => i.block));
  if (blocks.size === BLOCKS) {
    pass("5 blocos", String(blocks.size));
  } else {
    fail("5 blocos", `encontrados ${blocks.size}`);
  }
  const perBlock = [...blocks].map((b) => items.filter((i) => i.block === b).length);
  if (perBlock.every((n) => n === ASSESSMENT_BLOCK_SIZE)) {
    pass("12 itens por bloco", perBlock.join(","));
  } else {
    fail("12 itens por bloco", perBlock.join(","));
  }

  // 30 itens A / 30 itens B
  const aCount = items.filter((i) => i.direction === "A").length;
  const bCount = items.filter((i) => i.direction === "B").length;
  if (aCount === 30 && bCount === 30) {
    pass("30 itens A / 30 itens B", `${aCount}/${bCount}`);
  } else {
    fail("30 itens A / 30 itens B", `${aCount}/${bCount}`);
  }

  const report: AssessmentBankReport = {
    ok: checks.every((c) => c.ok),
    checks,
  };

  if (!report.ok) {
    const failures = report.checks
      .filter((c) => !c.ok)
      .map((c) => `${c.name}${c.detail ? ` (${c.detail})` : ""}`)
      .join("; ");
    throw new Error(`Falha na validação do Banco de Itens (${ASSESSMENT_VERSION}): ${failures}`);
  }
  return report;
}

// Gate metodológico: valida na carga do módulo. Falhas são registradas no
// console (não interrompem a renderização do preview); para bloqueio de
// deploy, chamar validateAssessmentBank() explicitamente — ela lança Error.
try {
  validateAssessmentBank();
} catch (err) {
  console.error("[AssessmentBank]", err);
}
