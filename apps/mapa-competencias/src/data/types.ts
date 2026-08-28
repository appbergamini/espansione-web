export type Macroarea = "Estrategicas" | "Laborais" | "Relacionais";

export const MACROAREA_LABEL: Record<Macroarea, string> = {
  Estrategicas: "Estratégicas",
  Laborais: "Laborais",
  Relacionais: "Relacionais",
};

export type CompetencyState = "base" | "observacao" | "prioridade";

export const STATE_LABEL: Record<CompetencyState, string> = {
  base: "Sustentar e ampliar",
  observacao: "Desenvolvimento contínuo",
  prioridade: "Foco de desenvolvimento agora",
};

/**
 * Comportamento — construto operacional.
 * Apresentado em um eixo comportamental com duas direções (A e B).
 * `id` é o id canônico interno. `name` é o nome de origem (rastreabilidade).
 * `displayName`/`directionALabel`/`directionBLabel` são a linguagem da interface.
 */
export interface Behavior {
  id: string;
  /** nome de origem / interno (rastreabilidade metodológica) */
  name: string;
  /** nome operacional exibido na interface */
  displayName: string;
  directionALabel: string;
  directionBLabel: string;
  /** descritores originais dos polos (rastreabilidade) */
  poloA: string;
  poloB: string;
  relatedCompetencyIds: string[];
}

/**
 * Competência — interpretada a partir da combinação de vários comportamentos.
 * Nunca inferir uma competência a partir de uma única pergunta.
 */
export interface Competency {
  id: string;
  /** nome metodológico original (rastreabilidade) */
  internalName: string;
  /** nome preferencial exibido na interface */
  displayName: string;
  category: Macroarea;
  description: string;
  behaviorIds: string[];
  /** false para competências históricas desativadas (não participam do cálculo) */
  active?: boolean;
}

/**
 * Campos preparados para o detalhamento de prioridades.
 * Os textos oficiais serão fornecidos na próxima etapa.
 */
export interface PriorityDetail {
  contributionText: string[];
  attentionText: string[];
  businessManifestationText: string;
  developmentMove: string;
  trainingId: string;
}

export interface Challenge {
  id: string;
  label: string;
}

export interface Participant {
  name: string;
  atuacao: string;
  empresa: string;
  lideraPessoas: boolean;
  participaVendas: boolean;
}

/* ---------------------------------------------------------------------------
 * BANCO DE ITENS — ASSESSMENT (V1.0 PRÉ-PILOTO)
 * ------------------------------------------------------------------------- */

/** Direção metodológica interna do item (nunca exibida ao usuário). */
export type ItemDirection = "A" | "B";

export interface AssessmentItem {
  /** id metodológico (ex.: REF01) — distinto da numeração visual */
  id: string;
  text: string;
  /** id do comportamento conforme banco de itens (pode ser alias → canônico) */
  behaviorId: string;
  direction: ItemDirection;
  /** bloco 1–5 (12 itens por bloco) */
  block: number;
  /** posição dentro do bloco (1–12) */
  order: number;
  active: boolean;
  assessmentVersion: string;
}

/* ---------------------------------------------------------------------------
 * RESULTADOS DE SCORE COMPORTAMENTAL (DETERMINÍSTICOS)
 * ------------------------------------------------------------------------- */

export interface BehaviorScoringResult {
  /** id canônico do comportamento */
  behaviorId: string;
  rawResponses: number[];
  correctedResponses: number[];
  mean: number;
  /** posição 0–100 no eixo comportamental (0≈A · 100≈B · 50=centro) */
  score: number;
  min: number;
  max: number;
  range: number;
  /** dispersão (preparada; limites interpretativos virão depois) */
  stdDev?: number;
  assessmentVersion: string;
}

export interface AssessmentResult {
  assessmentVersion: string;
  methodologyVersion: string;
  completedAt: string;
  /** resposta original 1–7 por id de item */
  answers: Record<string, number>;
  behaviorResults: BehaviorScoringResult[];
  /** true quando o Assessment foi preenchido pelo recurso de demonstração */
  isDemo: boolean;
}

/* ---------------------------------------------------------------------------
 * MOTOR METODOLÓGICO — V1.0 PRÉ-PILOTO
 * ------------------------------------------------------------------------- */

/** Exigência funcional de uma relação comportamento × competência. */
export type FunctionalRequirement = "A+" | "B+" | "EQ";

/** Papel funcional da relação (peso). */
export type FunctionalRole = "N" | "S" | "S*";

export interface FunctionalRelation {
  /** id canônico do comportamento */
  behaviorId: string;
  requirement: FunctionalRequirement;
  role: FunctionalRole;
}

export type DevelopmentMovement =
  | "EXPAND_A"
  | "EXPAND_B"
  | "MODULATE_A"
  | "MODULATE_B"
  | "MAINTAIN_FLEXIBILITY";

export interface BehaviorMovement {
  behaviorId: string;
  movement: DevelopmentMovement;
}

export interface KeyBehaviorResult {
  behaviorId: string;
  /** functionalDistance × weight */
  impact: number;
  movement: DevelopmentMovement;
}

export interface CompetencyResult {
  competencyId: string;
  /** N — necessidade funcional (0–100, interna) */
  need: number;
  /** R — relevância para o próximo nível (0–100) */
  relevance: number;
  /** P — índice de prioridade (0–100, interno) */
  priorityIndex: number;
  strongFocus: boolean;
  /** marcação interna (não exibir ao usuário) */
  relativeFocus: boolean;
  state: CompetencyState;
  significantDevelopmentSignal: boolean;
  keyBehaviors: KeyBehaviorResult[];
  movements: BehaviorMovement[];
}

/** Aplicação comercial/contextual de uma competência (não é competência própria). */
export interface CompetencyApplication {
  id: string;
  parentCompetencyId: string;
  label: string;
  sourceRole: string;
  type: "commercial-application";
  active: boolean;
}

/** Contexto do participante capturado no Assessment (não altera N/R/P nesta versão). */
export interface AssessmentContextData {
  lideraPessoas: boolean;
  participaVendas: boolean;
  selectedChallengeIds: string[];
}

export interface AssessmentResult {
  /** resultId único — fonte única de verdade consultada por todas as páginas */
  id: string;
  assessmentSessionId: string;
  userId: string | null;
  createdAt: string;
  /** versão do resultado (imutável por versão) */
  assessmentVersion: string;
  assessmentItemsVersion: string;
  methodologyVersion: string;
  challengeMatrixVersion: string;
  functionalMatrixVersion: string;
  completedAt: string;
  /** resposta original 1–7 por id de item */
  answers: Record<string, number>;
  behaviorResults: BehaviorScoringResult[];
  competencyResults: CompetencyResult[];
  /** ids das competências selecionadas (3 a 5) */
  focusCompetencyIds: string[];
  contextData: AssessmentContextData;
  /** contexto comercial (vendas/negociação) — só dado contextual, não altera N/R/P */
  commercialContextActive: boolean;
  /** true quando o Assessment foi preenchido pelo recurso de demonstração */
  isDemo: boolean;
}

/* ---------------------------------------------------------------------------
 * PERSISTÊNCIA — estruturas para a jornada anual (múltiplos assessments)
 * ------------------------------------------------------------------------- */
export interface AssessmentSession {
  id: string;
  userId: string | null;
  startedAt: string;
  completedAt: string | null;
  isDemo: boolean;
  assessmentVersion: string;
  assessmentItemsVersion: string;
  methodologyVersion: string;
  functionalMatrixVersion: string;
  challengeMatrixVersion: string;
}

export interface AssessmentContextRecord {
  assessmentSessionId: string;
  role: string;
  companySize: string;
  leadsPeople: boolean;
  participatesInSalesOrNegotiation: boolean;
  selectedChallenges: string[];
}

export interface AssessmentResponseRecord {
  assessmentSessionId: string;
  itemId: string;
  rawResponse: number;
}

export interface BehaviorResultRecord {
  resultId: string;
  behaviorId: string;
  score: number;
  positionBand: string;
  consistencyData: { min: number; max: number; range: number; mean: number; stdDev?: number };
}

export interface CompetencyResultRecord {
  resultId: string;
  competencyId: string;
  N: number;
  R: number;
  P: number;
  rankingPosition: number;
  status: CompetencyState;
  strongFocus: boolean;
  relativeFocus: boolean;
  significantDevelopmentSignal: boolean;
  keyBehaviors: { behaviorId: string; impact: number; movement: DevelopmentMovement }[];
}

/* ---------------------------------------------------------------------------
 * MATERIAIS / APOSTILAS — arquitetura preparada (sem links fictícios)
 * ------------------------------------------------------------------------- */

export type MaterialType = "pdf" | "presentation" | "video" | "course" | "external";
export type MaterialStatus = "available" | "comingSoon" | "unavailable";

/**
 * Material/apostila. As apostilas são classificadas por COMPORTAMENTO + DIREÇÃO
 * COMPORTAMENTAL (não primariamente por competência). Um material pode apoiar
 * várias competências (relatedCompetencyIds). Não criar relação 1:1
 * competência → material. Nenhum link fictício até o inventário oficial.
 */
export interface DevelopmentMaterial {
  id: string;
  title: string;
  behaviorId: string;
  /** direção-alvo interna ("A" ou "B") — códigos nunca exibidos ao cliente */
  targetDirection: "A" | "B";
  supportedMovements: DevelopmentMovement[];
  relatedCompetencyIds: string[];
  type: MaterialType;
  status: MaterialStatus;
  fileUrl: string;
  accessUrl: string;
  includesPracticalTools: boolean;
  version: string;
}

/* ---------------------------------------------------------------------------
 * TREINAMENTOS / TRILHAS — arquitetura preparada para conversão comercial.
 * Integração futura com a Greenn (checkout + área de membros), via API/webhook,
 * somente com credenciais e autorização. URLs ficam vazias até lá.
 * ------------------------------------------------------------------------- */

export type TrainingStatus = "comingSoon" | "available";
export type PurchaseStatus = "available" | "purchased";
export type TrainingState = "comingSoon" | "available" | "purchased";

export interface Training {
  trainingId: string;
  title: string;
  format: string;
  focus: string;
  relatedCompetencyIds: string[];
  relatedBehaviorIds: string[];
  status: TrainingStatus;
  purchaseStatus: PurchaseStatus;
  /** checkout na Greenn — vazio até integração autorizada */
  greennCheckoutUrl: string;
  /** área de membros na Greenn — vazio até integração autorizada */
  greennAccessUrl: string;
}
