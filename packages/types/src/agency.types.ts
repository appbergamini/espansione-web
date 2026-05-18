import type { EspansioneDiagnostic } from './espansione-diagnostic.types.js';

export type AgencyRequestType =
  | 'social_post'
  | 'carousel'
  | 'short_video_script'
  | 'email'
  | 'landing_page_copy';

export type AgencyChannel =
  | 'linkedin'
  | 'instagram'
  | 'whatsapp'
  | 'email'
  | 'website'
  | 'paid_media'
  | 'other';

export type AgencyObjective =
  | 'awareness'
  | 'authority'
  | 'lead_generation'
  | 'conversion'
  | 'launch'
  | 'relationship'
  | 'retention';

export type AgencyRequestStatus =
  | 'draft'
  | 'briefing_pending'
  | 'briefing_created'
  | 'briefing_approved'
  | 'generation_pending'
  | 'generated'
  | 'revision_requested'
  | 'approved'
  | 'rejected'
  | 'archived';

export type AgencyRunStatus =
  | 'pending'
  | 'ready'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AgencyStepStatus =
  | 'pending'
  | 'ready'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export type AgencyAgentId =
  | 'account_director'
  | 'copywriter'
  | 'visual_director'
  | 'editor'
  | 'approver';

export type AgencyApprovalDecision =
  | 'approved'
  | 'revision_requested'
  | 'rejected';

export type BrandReadinessStatus =
  | 'not_ready'
  | 'partial_ready'
  | 'ready_for_content'
  | 'ready_for_campaigns';

export interface AgencyRequest {
  id?: string;
  brandId: string;
  requestType: AgencyRequestType;
  channel: AgencyChannel;
  objective: AgencyObjective;
  audienceCluster?: string;
  offer?: string;
  context: string;
  desiredCta?: string;
  restrictions?: string[];
  referenceMaterial?: string[];
  status?: AgencyRequestStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgencyRun {
  id?: string;
  requestId?: string;
  brandId: string;
  brandKernelVersion?: string;
  status: AgencyRunStatus;
  steps: AgencyStep[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgencyStep {
  id?: string;
  runId?: string;
  agentId: AgencyAgentId;
  input: unknown;
  output?: AgencyOutput;
  status: AgencyStepStatus;
  modelUsed?: string;
  tokens?: {
    input?: number;
    output?: number;
    total?: number;
  };
  costEstimate?: number;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgencyOutput {
  agentId: AgencyAgentId;
  data: unknown;
  warnings?: string[];
  brandMemorySlicesUsed?: string[];
}

export interface ApprovalDecision {
  decision: AgencyApprovalDecision;
  checklist: {
    criterion: string;
    status: 'pass' | 'warning' | 'fail';
    note: string;
  }[];
  requiredAdjustments: string[];
  rationale: string;
}

export interface BrandReadinessResult {
  status: BrandReadinessStatus;
  missingSlices: string[];
  warnings: string[];
  allowedRequestTypes: AgencyRequestType[];
  criticalSlicesFound: string[];
}

export interface BrandKernel {
  brand: {
    name: string;
    slug: string;
    industry: string | null;
  };
  strategy: {
    purpose: string | null;
    archetype: string | null;
    positioning: string | null;
    tagline: string | null;
    directives: string[];
    dePara: string[];
    values: string[];
    attributes: string[];
  };
  audience: {
    personas: string[];
    clusters: string[];
    journeyStages: string[];
    brandMoments: string[];
  };
  voice: {
    tones: string[];
    territories: string[];
    forbiddenWords: string[];
    naming: string[];
  };
  visual: {
    keep: string[];
    lose: string[];
    gain: string[];
    colors: string[];
    typography: string[];
    photography: string | null;
    behavior: string | null;
    symbol: string | null;
  };
  communication: {
    waves: string[];
    channels: string[];
    differentials: string[];
    proprietaryAsset: string | null;
    risk: string | null;
  };
  constraints: string[];
  proofPoints: string[];
  forbiddenClaims: string[];
  preferredCTAs: string[];
  channelGuidelines: string[];
  source: {
    schemaVersion: EspansioneDiagnostic['schema_version'];
    agentsPresent: number[];
    generatedFrom: 'espansione_diagnostic';
  };
}

export interface AgencyPromptPack {
  systemPrompt: string;
  userPrompt: string;
  expectedOutputSchema: unknown;
}

export interface AccountDirectorOutput {
  briefing_operacional: {
    objetivo: string;
    publico: string;
    cluster?: string;
    contexto: string;
    insight: string;
    promessa: string;
    mensagem_central: string;
    prova?: string;
    objecoes?: string[];
    tom_recomendado: string;
    canal: AgencyChannel;
    formato: AgencyRequestType;
    criterio_de_sucesso: string[];
  };
  hipotese_criativa: {
    conceito: string;
    angulo: string;
    narrativa: string;
  };
  criterios_de_sucesso: string[];
  brand_memory_slices_used: string[];
  warnings: string[];
}

export interface CopywriterOutput {
  copy_principal: string;
  variacoes: string[];
  headline?: string;
  legenda?: string;
  cta: string;
  racional_de_tom: string;
  claims_utilizados: string[];
  claims_evitar: string[];
  warnings: string[];
}

export interface VisualDirectorOutput {
  direcao_de_arte: string;
  regras_visuais: string[];
  assets_necessarios: string[];
  composicao: string;
  estilo_imagem: string;
  cores?: string[];
  tipografia?: string;
  restricoes_visuais: string[];
  prompt_visual_opcional?: string;
  warnings: string[];
}

export interface EditorOutput {
  versao_editada: string;
  ajustes_recomendados: string[];
  riscos_de_incoerencia: string[];
  score_aderencia: number;
  observacoes: string[];
}

export interface ApproverOutput {
  decisao: AgencyApprovalDecision;
  checklist: {
    criterio: string;
    status: 'pass' | 'warning' | 'fail';
    observacao: string;
  }[];
  ajustes_obrigatorios: string[];
  risco_principal?: string;
  justificativa: string;
}

export interface ModelGatewayInput {
  agentId: AgencyAgentId;
  promptPack: AgencyPromptPack;
}

export interface ModelGateway {
  generateStructuredOutput(input: ModelGatewayInput): Promise<AgencyOutput>;
}
