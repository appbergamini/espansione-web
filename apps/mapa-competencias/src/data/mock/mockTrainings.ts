import { competencyById } from "@/data/methodology";
import type { Training, TrainingState } from "@/data/types";

/**
 * =====================================================================
 * CATÁLOGO DE TRILHAS — DADOS DE DEMONSTRAÇÃO (PROTÓTIPO)
 * =====================================================================
 * Estrutura preparada para conversão comercial:
 * - estados: comingSoon · available · purchased
 * - integração futura com a Greenn (checkout + área de membros) via
 *   API/webhook, SOMENTE com credenciais e autorização. As URLs ficam
 *   vazias até lá (NÃO inserir URLs fictícias).
 * A plataforma (hub) permanece o centro da experiência do usuário.
 * =====================================================================
 */

const behaviorIdsOf = (competencyId: string) =>
  competencyById.get(competencyId)?.behaviorIds ?? [];

/** Trilhas demo (títulos provisórios — catálogo oficial virá depois). */
export const mockTrainings: Training[] = [
  {
    trainingId: "t-visao",
    title: "Trilha: Visão e Planejamento de Longo Prazo",
    format: "Trilha executiva · 8 semanas",
    focus: "Planejamento estratégico, definição de prioridades e desdobramento de metas",
    relatedCompetencyIds: ["visao"],
    relatedBehaviorIds: behaviorIdsOf("visao"),
    status: "available",
    purchaseStatus: "available",
    greennCheckoutUrl: "",
    greennAccessUrl: "",
  },
  {
    trainingId: "t-gerenciando",
    title: "Trilha: Liderança e Gestão de Pessoas",
    format: "Trilha de liderança · 8 semanas",
    focus: "Direção de equipes, comunicação, responsabilização e desempenho",
    relatedCompetencyIds: ["gerenciando-outros"],
    relatedBehaviorIds: behaviorIdsOf("gerenciando-outros"),
    status: "comingSoon",
    purchaseStatus: "available",
    greennCheckoutUrl: "",
    greennAccessUrl: "",
  },
  {
    trainingId: "t-planejamento",
    title: "Oficina: Organização e Execução",
    format: "Oficina prática · 4 semanas",
    focus: "Priorização, organização do trabalho e acompanhamento da execução",
    relatedCompetencyIds: ["planejamento-e-organizacao"],
    relatedBehaviorIds: behaviorIdsOf("planejamento-e-organizacao"),
    status: "available",
    purchaseStatus: "purchased",
    greennCheckoutUrl: "",
    greennAccessUrl: "",
  },
  {
    trainingId: "t-generic",
    title: "Trilha recomendada (demonstração)",
    format: "A definir",
    focus: "Conteúdo oficial será fornecido na próxima etapa.",
    relatedCompetencyIds: [],
    relatedBehaviorIds: [],
    status: "comingSoon",
    purchaseStatus: "available",
    greennCheckoutUrl: "",
    greennAccessUrl: "",
  },
];

export const mockTrainingById = new Map(mockTrainings.map((t) => [t.trainingId, t]));

export function getMockTraining(trainingId: string): Training {
  return mockTrainingById.get(trainingId) ?? mockTrainings[mockTrainings.length - 1];
}

/** Estado combinado exibido na interface (comingSoon · available · purchased). */
export function getMockTrainingState(trainingId: string): TrainingState {
  const t = getMockTraining(trainingId);
  if (t.status === "comingSoon") return "comingSoon";
  if (t.purchaseStatus === "purchased") return "purchased";
  return "available";
}
