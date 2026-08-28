import type { Behavior, Competency, Macroarea } from "./types";
import { behaviorConstructs, canonicalBehaviorId } from "./methodology/behaviorConstructs";

/**
 * =====================================================================
 * METODOLOGIA OFICIAL DO PRODUTO — FONTE ÚNICA DE VERDADE
 * =====================================================================
 * Este arquivo contém EXCLUSIVAMENTE a estrutura metodológica real:
 * - 14 competências ativas (Persuasão de Compra foi desativada na V1.1 como
 *   competência independente — vira aplicação comercial de Influência e Persuasão)
 * - 20 comportamentos oficiais (eixos comportamentais)
 * - relação oficial competência × comportamento (obrigatória)
 *
 * NENHUM dado fictício/demonstrativo deve ser adicionado aqui.
 * Dados de demonstração vivem em src/data/mock/.
 *
 * Princípios: não classificar como bom/ruim; score alto não é melhor;
 * o centro da escala não é o ideal; competência é comportamento em ação,
 * adequado ao contexto e orientado ao resultado.
 * =====================================================================
 */

export const MACROAREA_ORDER: Macroarea[] = ["Estrategicas", "Laborais", "Relacionais"];

/** Relação oficial competência → comportamentos (fonte deste documento). */
const COMPETENCY_BEHAVIORS: Record<string, string[]> = {
  "analise-solucao-problemas": ["reflexivo", "realista", "baseado-em-fatos", "ponderado"],
  "defender-mudancas": ["assertividade", "ritmo-de-trabalho", "tolerancia-frustracao", "realista", "ponderado"],
  "orientacao-resultados": ["assertividade", "autossuficiencia", "ritmo-de-trabalho", "realista", "tolerancia-frustracao"],
  "influencia-persuasao": ["assertividade", "sociabilidade", "ritmo-de-trabalho"],
  "gerenciando-outros": ["assertividade", "positividade-pessoas", "necessidade-ser-estimado", "sociabilidade", "ritmo-de-trabalho", "autossuficiencia", "otimismo"],
  "aperfeicoamento-continuo": ["realista", "orientacao-detalhes", "planejamento-organizacao", "necessidade-reconhecimento"],
  visao: ["reflexivo", "realista", "ponderado", "assertividade", "autossuficiencia", "ritmo-de-trabalho"],
  "desenvolvimento-pessoas": ["positividade-pessoas", "necessidade-ser-estimado", "observador", "necessidade-reconhecimento"],
  "julgamento-decisivo": ["baseado-em-fatos", "realista", "ponderado", "autossuficiencia", "assertividade"],
  "planejamento-e-organizacao": ["logico", "realista", "planejamento-organizacao", "multitarefa"],
  "administracao-relacionamentos": ["assertividade", "necessidade-ser-estimado", "observador", "positividade-pessoas", "sociabilidade", "autocontrole", "tolerancia-critica"],
  "foco-no-cliente": ["observador", "positividade-pessoas", "assertividade", "ritmo-de-trabalho"],
  negociacao: ["assertividade", "necessidade-ser-estimado", "positividade-pessoas", "observador", "tolerancia-frustracao", "tolerancia-critica", "autocontrole"],
  "persuasao-compra": ["assertividade", "sociabilidade", "ritmo-de-trabalho"],
  flexibilidade: ["otimismo", "tolerancia-critica", "autocontrole"],
};

/** 15 competências cadastradas; 14 ativas (Persuasão de Compra está desativada). */
export const competencies: Competency[] = [
  /* ---------------- ESTRATÉGICAS ---------------- */
  {
    id: "analise-solucao-problemas",
    internalName: "Análise e Solução de Problemas com Profundidade",
    displayName: "Análise e Solução de Problemas com Profundidade",
    category: "Estrategicas",
    description:
      "Capacidade de resolver problemas difíceis por meio da análise cuidadosa das informações, alternativas e possíveis consequências.",
    behaviorIds: COMPETENCY_BEHAVIORS["analise-solucao-problemas"],
  },
  {
    id: "defender-mudancas",
    internalName: "Defender Mudanças",
    displayName: "Defender Mudanças",
    category: "Estrategicas",
    description:
      "Capacidade de apoiar e conduzir a implementação de mudanças necessárias ao avanço do negócio.",
    behaviorIds: COMPETENCY_BEHAVIORS["defender-mudancas"],
  },
  {
    id: "visao",
    internalName: "Visão",
    displayName: "Visão",
    category: "Estrategicas",
    description:
      "Capacidade de identificar objetivos de longo prazo e considerar ideias, alternativas e caminhos que permitam ao negócio evoluir.",
    behaviorIds: COMPETENCY_BEHAVIORS["visao"],
  },
  {
    id: "julgamento-decisivo",
    internalName: "Julgamento Decisivo",
    displayName: "Julgamento Decisivo",
    category: "Estrategicas",
    description:
      "Capacidade de tomar decisões de maneira oportuna, consciente e confiante, considerando alternativas e consequências.",
    behaviorIds: COMPETENCY_BEHAVIORS["julgamento-decisivo"],
  },

  /* ---------------- LABORAIS ---------------- */
  {
    id: "orientacao-resultados",
    internalName: "Orientação para Resultados",
    displayName: "Orientação para Resultados",
    category: "Laborais",
    description:
      "Capacidade de direcionar esforço, responsabilidade e persistência para a conquista de resultados relevantes.",
    behaviorIds: COMPETENCY_BEHAVIORS["orientacao-resultados"],
  },
  {
    id: "aperfeicoamento-continuo",
    internalName: "Aperfeiçoamento Contínuo",
    displayName: "Aperfeiçoamento Contínuo",
    category: "Laborais",
    description:
      "Capacidade de buscar oportunidades para melhorar processos, sistemas, métodos, qualidade e eficácia do trabalho.",
    behaviorIds: COMPETENCY_BEHAVIORS["aperfeicoamento-continuo"],
  },
  {
    id: "planejamento-e-organizacao",
    internalName: "Planejamento e Organização",
    displayName: "Planejamento e Organização",
    category: "Laborais",
    description:
      "Capacidade de organizar o trabalho, definir metas, prever necessidades, administrar prioridades e acompanhar a execução.",
    behaviorIds: COMPETENCY_BEHAVIORS["planejamento-e-organizacao"],
  },
  {
    id: "foco-no-cliente",
    internalName: "Foco no Cliente",
    displayName: "Foco no Cliente",
    category: "Laborais",
    description:
      "Capacidade de perceber necessidades do cliente e apoiar entregas, experiências, produtos e serviços que gerem valor.",
    behaviorIds: COMPETENCY_BEHAVIORS["foco-no-cliente"],
  },
  {
    id: "flexibilidade",
    internalName: "Flexibilidade",
    displayName: "Flexibilidade",
    category: "Laborais",
    description:
      "Capacidade de lidar com problemas, pressões, mudanças e adversidades de maneira profissional, construtiva e adaptável.",
    behaviorIds: COMPETENCY_BEHAVIORS["flexibilidade"],
  },

  /* ---------------- RELACIONAIS ---------------- */
  {
    id: "influencia-persuasao",
    internalName: "Influência e Persuasão",
    displayName: "Influência e Persuasão",
    category: "Relacionais",
    description:
      "Capacidade de mobilizar outras pessoas em direção a uma ideia, decisão ou caminho, adaptando a abordagem ao interlocutor.",
    behaviorIds: COMPETENCY_BEHAVIORS["influencia-persuasao"],
  },
  {
    id: "gerenciando-outros",
    internalName: "Gerenciando Outros",
    displayName: "Gerenciando Outros",
    category: "Relacionais",
    description:
      "Capacidade de direcionar e liderar pessoas para alcançar objetivos, mantendo clareza, responsabilidade, comprometimento e desempenho.",
    behaviorIds: COMPETENCY_BEHAVIORS["gerenciando-outros"],
  },
  {
    id: "desenvolvimento-pessoas",
    internalName: "Treinando e Desenvolvendo Outros",
    displayName: "Desenvolvimento de Pessoas",
    category: "Relacionais",
    description:
      "Capacidade de ensinar, orientar, aconselhar, fornecer feedback e criar condições para que outras pessoas desenvolvam capacidades e autonomia.",
    behaviorIds: COMPETENCY_BEHAVIORS["desenvolvimento-pessoas"],
  },
  {
    id: "administracao-relacionamentos",
    internalName: "Administração de Relacionamentos",
    displayName: "Administração de Relacionamentos",
    category: "Relacionais",
    description:
      "Capacidade de desenvolver e manter relacionamentos positivos e produtivos com pessoas relevantes para o negócio.",
    behaviorIds: COMPETENCY_BEHAVIORS["administracao-relacionamentos"],
  },
  {
    id: "negociacao",
    internalName: "Negociação",
    displayName: "Negociação",
    category: "Relacionais",
    description:
      "Capacidade de compreender necessidades e interesses das partes e construir acordos sustentáveis e mutuamente benéficos.",
    behaviorIds: COMPETENCY_BEHAVIORS["negociacao"],
  },
  {
    id: "persuasao-compra",
    internalName: "Persuasão de Compra",
    displayName: "Persuasão de Compra",
    category: "Relacionais",
    description:
      "Capacidade de compreender o interlocutor e comunicar valor de maneira persuasiva, favorecendo decisões de compra sem recorrer a pressão excessiva.",
    behaviorIds: COMPETENCY_BEHAVIORS["persuasao-compra"],
    // V1.1: desativada como competência independente — passou a ser aplicação
    // comercial de Influência e Persuasão (ver competencyApplications.ts).
    active: false,
  },
];

/** 20 comportamentos oficiais (eixos comportamentais). */
const RAW_BEHAVIORS: Omit<Behavior, "displayName" | "directionALabel" | "directionBLabel">[] = [
  {
    id: "reflexivo",
    name: "Reflexivo",
    poleA: "Pouca necessidade de investigar",
    poleB: "Pensativo / filosófico",
    relatedCompetencyIds: relatedTo("reflexivo"),
  },
  {
    id: "logico",
    name: "Lógico",
    poleA: "Evita atuar gradualmente",
    poleB: "Lógico / sistemático",
    relatedCompetencyIds: relatedTo("logico"),
  },
  {
    id: "ponderado",
    name: "Ponderado, Controlado",
    poleA: "Rapidez para decidir",
    poleB: "Cauteloso",
    relatedCompetencyIds: relatedTo("ponderado"),
  },
  {
    id: "baseado-em-fatos",
    name: "Baseado em Fatos",
    poleA: "Intuitivo",
    poleB: "Factual",
    relatedCompetencyIds: relatedTo("baseado-em-fatos"),
  },
  {
    id: "realista",
    name: "Realista",
    poleA: "Imaginativo",
    poleB: "Pragmático",
    relatedCompetencyIds: relatedTo("realista"),
  },
  {
    id: "ritmo-de-trabalho",
    name: "Ritmo de Trabalho",
    poleA: "Lento",
    poleB: "Ativo / ocupado",
    relatedCompetencyIds: relatedTo("ritmo-de-trabalho"),
  },
  {
    id: "autossuficiencia",
    name: "Autossuficiência",
    poleA: "Com outros",
    poleB: "Sozinho",
    relatedCompetencyIds: relatedTo("autossuficiencia"),
  },
  {
    id: "planejamento-organizacao",
    name: "Planejamento e Organização",
    poleA: "Não gosta de organização e ordem",
    poleB: "Prefere estrutura e ordem",
    relatedCompetencyIds: relatedTo("planejamento-organizacao"),
  },
  {
    id: "multitarefa",
    name: "Multitarefa",
    poleA: "Rotina / uma tarefa por vez",
    poleB: "Multitarefa / variedade",
    relatedCompetencyIds: relatedTo("multitarefa"),
  },
  {
    id: "tolerancia-frustracao",
    name: "Tolerância à Frustração",
    poleA: "Sensível",
    poleB: "Capacidade de recuperação",
    relatedCompetencyIds: relatedTo("tolerancia-frustracao"),
  },
  {
    id: "necessidade-reconhecimento",
    name: "Necessidade de Reconhecimento",
    poleA: "Baixa",
    poleB: "Alta",
    relatedCompetencyIds: relatedTo("necessidade-reconhecimento"),
  },
  {
    id: "orientacao-detalhes",
    name: "Orientação para Detalhes",
    poleA: "Não gosta de detalhes",
    poleB: "Prefere tarefas com detalhes",
    relatedCompetencyIds: relatedTo("orientacao-detalhes"),
  },
  {
    id: "assertividade",
    name: "Assertividade",
    poleA: "Baixa",
    poleB: "Alta",
    relatedCompetencyIds: relatedTo("assertividade"),
  },
  {
    id: "sociabilidade",
    name: "Sociabilidade",
    poleA: "Timidez ou desinteresse",
    poleB: "Cordialidade",
    relatedCompetencyIds: relatedTo("sociabilidade"),
  },
  {
    id: "necessidade-ser-estimado",
    name: "Necessidade de Ser Estimado",
    poleA: "Baixa",
    poleB: "Alta",
    relatedCompetencyIds: relatedTo("necessidade-ser-estimado"),
  },
  {
    id: "positividade-pessoas",
    name: "Positividade com relação às Pessoas",
    poleA: "Cético / cauteloso",
    poleB: "Confiança / positividade",
    relatedCompetencyIds: relatedTo("positividade-pessoas"),
  },
  {
    id: "observador",
    name: "Observador",
    poleA: "Não analisa os outros",
    poleB: "Analisa os outros",
    relatedCompetencyIds: relatedTo("observador"),
  },
  {
    id: "otimismo",
    name: "Otimismo",
    poleA: "Pessimismo",
    poleB: "Positividade / otimismo",
    relatedCompetencyIds: relatedTo("otimismo"),
  },
  {
    id: "tolerancia-critica",
    name: "Tolerância à Crítica",
    poleA: "Subjetividade / sensibilidade",
    poleB: "Objetividade / resistência",
    relatedCompetencyIds: relatedTo("tolerancia-critica"),
  },
  {
    id: "autocontrole",
    name: "Autocontrole",
    poleA: "Expressividade",
    poleB: "Reservado",
    relatedCompetencyIds: relatedTo("autocontrole"),
  },
];

/** Construtos operacionais resolvidos pelo id canônico. */
const operationalByCanonical = new Map<string, (typeof behaviorConstructs)[number]>();
for (const c of behaviorConstructs) {
  operationalByCanonical.set(canonicalBehaviorId(c.behaviorId), c);
}

/**
 * 20 comportamentos oficiais com nomes operacionais e direções da interface
 * (displayName / directionALabel / directionBLabel). `name`, `poloA` e
 * `poloB` preservam a origem (rastreabilidade).
 */
export const behaviors: Behavior[] = RAW_BEHAVIORS.map((b) => {
  const c = operationalByCanonical.get(b.id);
  return {
    ...b,
    displayName: c?.displayName ?? b.name,
    directionALabel: c?.directionALabel ?? b.poloA,
    directionBLabel: c?.directionBLabel ?? b.poloB,
  };
});

export const competencyById = new Map(competencies.map((c) => [c.id, c]));
export const behaviorById = new Map(behaviors.map((b) => [b.id, b]));

/** 14 competências ativas (exclui Persuasão de Compra, desativada na V1.1). */
export const activeCompetencies = competencies.filter((c) => c.active !== false);

export const getCompetenciesByCategory = (category: Macroarea) =>
  activeCompetencies.filter((c) => c.category === category);

function relatedTo(behaviorId: string): string[] {
  return competencies
    .filter((c) => c.behaviorIds.includes(behaviorId))
    .map((c) => c.id);
}
