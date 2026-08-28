import type { Behavior } from "../types";

/**
 * =====================================================================
 * CONSTRUTOS OPERACIONAIS ESPANSIONE — 20 EIXOS COMPORTAMENTAIS
 * =====================================================================
 * Fonte: Banco de Itens Espansione V1.0 — Pré-Piloto (lista oficial).
 *
 * `behaviorId` aqui segue a grafia usada no BANCO DE ITENS (ex.:
 * "ponderado-controlado"). Os ids CANÔNICOS da metodologia (usados pelas
 * 15 competências e pela relação competência × comportamento) podem diferir
 * em grafia (ex.: "ponderado"). O mapa de aliases reconcilia os dois espaços.
 *
 * `internalSourceName` é o nome original (rastreabilidade metodológica).
 * `displayName` / `directionALabel` / `directionBLabel` são a linguagem
 * apresentada ao usuário.
 * =====================================================================
 */

/** Alias: id do banco de itens → id canônico da metodologia. */
export const behaviorIdAliases: Record<string, string> = {
  "ponderado-controlado": "ponderado",
  "baseado-fatos": "baseado-em-fatos",
  "ritmo-trabalho": "ritmo-de-trabalho",
  "comportamento-planejamento-organizacao": "planejamento-organizacao",
};

export function canonicalBehaviorId(behaviorId: string): string {
  return behaviorIdAliases[behaviorId] ?? behaviorId;
}

export interface BehaviorConstruct {
  /** id conforme banco de itens (ex.: ponderado-controlado) */
  behaviorId: string;
  internalSourceName: string;
  displayName: string;
  directionALabel: string;
  directionBLabel: string;
}

export const behaviorConstructs: BehaviorConstruct[] = [
  {
    behaviorId: "reflexivo",
    internalSourceName: "Reflexivo",
    displayName: "Profundidade de investigação",
    directionALabel: "Ação mais direta",
    directionBLabel: "Investigação e reflexão",
  },
  {
    behaviorId: "logico",
    internalSourceName: "Lógico",
    displayName: "Estrutura do raciocínio",
    directionALabel: "Raciocínio mais livre",
    directionBLabel: "Raciocínio estruturado",
  },
  {
    behaviorId: "ponderado-controlado",
    internalSourceName: "Ponderado, Controlado",
    displayName: "Ritmo de decisão",
    directionALabel: "Decisão mais rápida",
    directionBLabel: "Decisão mais cautelosa",
  },
  {
    behaviorId: "baseado-fatos",
    internalSourceName: "Baseado em fatos",
    displayName: "Base da decisão",
    directionALabel: "Intuição e percepção",
    directionBLabel: "Fatos e evidências",
  },
  {
    behaviorId: "realista",
    internalSourceName: "Realista",
    displayName: "Orientação prática",
    directionALabel: "Exploração de possibilidades",
    directionBLabel: "Aplicação prática",
  },
  {
    behaviorId: "ritmo-trabalho",
    internalSourceName: "Ritmo de trabalho",
    displayName: "Ritmo de execução",
    directionALabel: "Ritmo mais cadenciado",
    directionBLabel: "Ritmo mais acelerado",
  },
  {
    behaviorId: "autossuficiencia",
    internalSourceName: "Autossuficiência",
    displayName: "Independência na condução",
    directionALabel: "Construção com outros",
    directionBLabel: "Condução mais independente",
  },
  {
    behaviorId: "comportamento-planejamento-organizacao",
    internalSourceName: "Planejamento e Organização",
    displayName: "Estrutura de organização",
    directionALabel: "Organização mais flexível",
    directionBLabel: "Estrutura e ordem",
  },
  {
    behaviorId: "multitarefa",
    internalSourceName: "Multitarefa",
    displayName: "Alternância de frentes",
    directionALabel: "Foco em uma frente",
    directionBLabel: "Várias frentes simultâneas",
  },
  {
    behaviorId: "tolerancia-frustracao",
    internalSourceName: "Tolerância à Frustração",
    displayName: "Recuperação diante de contratempos",
    directionALabel: "Processamento mais prolongado",
    directionBLabel: "Retomada mais rápida",
  },
  {
    behaviorId: "necessidade-reconhecimento",
    internalSourceName: "Necessidade de Reconhecimento",
    displayName: "Confiança na própria capacidade",
    directionALabel: "Autoconfiança mais imediata",
    directionBLabel: "Maior necessidade de confirmação da capacidade",
  },
  {
    behaviorId: "orientacao-detalhes",
    internalSourceName: "Orientação para Detalhes",
    displayName: "Atenção a detalhes",
    directionALabel: "Visão mais geral",
    directionBLabel: "Atenção mais minuciosa",
  },
  {
    behaviorId: "assertividade",
    internalSourceName: "Assertividade",
    displayName: "Assertividade",
    directionALabel: "Posicionamento mais reservado",
    directionBLabel: "Posicionamento mais direto",
  },
  {
    behaviorId: "sociabilidade",
    internalSourceName: "Sociabilidade",
    displayName: "Aproximação social",
    directionALabel: "Interação mais seletiva",
    directionBLabel: "Aproximação mais espontânea",
  },
  {
    behaviorId: "necessidade-ser-estimado",
    internalSourceName: "Necessidade de Ser Estimado",
    displayName: "Influência da aprovação",
    directionALabel: "Menor influência da aprovação",
    directionBLabel: "Maior influência da aprovação",
  },
  {
    behaviorId: "positividade-pessoas",
    internalSourceName: "Positividade com relação às Pessoas",
    displayName: "Confiança nas pessoas",
    directionALabel: "Maior cautela inicial",
    directionBLabel: "Maior confiança inicial",
  },
  {
    behaviorId: "observador",
    internalSourceName: "Observador",
    displayName: "Leitura de sinais interpessoais",
    directionALabel: "Foco no explícito",
    directionBLabel: "Leitura de sinais sutis",
  },
  {
    behaviorId: "otimismo",
    internalSourceName: "Otimismo",
    displayName: "Expectativa diante da incerteza",
    directionALabel: "Atenção maior aos riscos",
    directionBLabel: "Atenção maior às possibilidades",
  },
  {
    behaviorId: "tolerancia-critica",
    internalSourceName: "Tolerância à Crítica",
    displayName: "Resposta à crítica",
    directionALabel: "Maior sensibilidade à crítica",
    directionBLabel: "Maior distanciamento diante da crítica",
  },
  {
    behaviorId: "autocontrole",
    internalSourceName: "Autocontrole",
    displayName: "Expressividade e Reserva",
    directionALabel: "Maior expressividade",
    directionBLabel: "Maior reserva",
  },
];

export const behaviorConstructByItemId = new Map(
  behaviorConstructs.map((c) => [c.behaviorId, c])
);

/** Construto resolvido a partir do id canônico da metodologia. */
export function constructForBehavior(behavior: Behavior): BehaviorConstruct {
  const itemId = Object.keys(behaviorIdAliases).find(
    (k) => behaviorIdAliases[k] === behavior.id
  );
  const construct = behaviorConstructByItemId.get(itemId ?? behavior.id);
  return (
    construct ?? {
      behaviorId: behavior.id,
      internalSourceName: behavior.name,
      displayName: behavior.name,
      directionALabel: behavior.poloA,
      directionBLabel: behavior.poloB,
    }
  );
}
