import type { CompetencyApplication } from "../types";

/**
 * =====================================================================
 * APLICAÇÕES COMERCIAIS / CONTEXTUAIS DE COMPETÊNCIAS
 * =====================================================================
 * Persuasão de Compra deixou de ser competência independente (V1.1): ela
 * utilizava exatamente a mesma assinatura comportamental de Influência e
 * Persuasão. Passa a existir como APLICAÇÃO COMERCIAL/CONTEXTUAL da
 * competência-mãe.
 *
 * Ela NÃO possui N, R, P, ranking, status, card ou Focus próprios.
 * =====================================================================
 */
export const competencyApplications: CompetencyApplication[] = [
  {
    id: "purchase-persuasion",
    parentCompetencyId: "influencia-persuasao",
    label: "Influência em decisões de compra",
    sourceRole: "gerente-de-vendas",
    type: "commercial-application",
    active: true,
  },
];

export const commercialApplication = competencyApplications.find(
  (a) => a.type === "commercial-application"
);
