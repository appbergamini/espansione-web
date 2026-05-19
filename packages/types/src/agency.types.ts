import type {
  EspansioneDiagnostic,
  ExecutionalReadiness,
  StrategicTension,
  VisualIdentityOperationalSlice,
} from './espansione-diagnostic.types.js';
import type { CheckpointApprovalRecord } from './checkpoint.types.js';
import type { OutputQualityMetadata } from './output-quality.types.js';

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

export type ProjectLifecycleStatus =
  | 'project_created'
  | 'intake_configured'
  | 'diagnosis_running'
  | 'checkpoint_pending'
  | 'diagnosis_completed'
  | 'brand_memory_ready_to_load'
  | 'brand_memory_active'
  | 'agency_ready'
  | 'archived';

export type AgencyRequestStatus =
  | 'draft'
  | 'briefing_pending'
  | 'briefing_generated'
  | 'briefing_revision_requested'
  | 'briefing_approved'
  | 'generation_pending'
  | 'generation_running'
  | 'approval_pending'
  | 'revision_requested'
  | 'approved'
  | 'rejected'
  | 'archived';

export type AgencyRunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'partial';

export type AgencyStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'regenerated';

export type TechnicalExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'skipped';

export type OutputQualityStatus =
  | 'not_reviewed'
  | 'acceptable'
  | 'needs_revision'
  | 'rejected'
  | 'risky';

export type BrandMemoryVersionStatus =
  | 'draft'
  | 'active'
  | 'archived'
  | 'invalid';

export type BrandLibraryItemType =
  | 'approved_copy'
  | 'rejected_copy'
  | 'approved_visual_direction'
  | 'rejected_visual_direction'
  | 'approved_cta'
  | 'rejected_cta'
  | 'visual_prompt'
  | 'creative_reference'
  | 'campaign_example'
  | 'negative_example';

export type BrandLibraryItemStatus = 'active' | 'archived';

export type BrandLearningType =
  | 'voice_preference'
  | 'forbidden_language'
  | 'approved_cta'
  | 'rejected_cta'
  | 'audience_insight'
  | 'visual_preference'
  | 'visual_rejection'
  | 'claim_rule'
  | 'channel_rule'
  | 'campaign_learning';

export type BrandLearningSuggestionStatus =
  | 'suggested'
  | 'approved_for_memory'
  | 'rejected'
  | 'archived';

export type AgencySignalAffectedSlice =
  | 'decodificacao'
  | 'plataforma_branding'
  | 'voice_profile'
  | 'visual_identity'
  | 'experiencia'
  | 'plano_comunicacao'
  | 'strategic_tensions'
  | 'executional_readiness'
  | 'other';

export type AgencySignalType =
  | 'missing_information'
  | 'vague_guideline'
  | 'contradiction'
  | 'weak_proof'
  | 'tone_gap'
  | 'visual_gap'
  | 'audience_gap'
  | 'channel_gap'
  | 'repeated_manual_edit'
  | 'performance_learning';

export type AgencySignalSeverity = 'low' | 'medium' | 'high';

export type AgencySignalStatus =
  | 'open'
  | 'reviewed'
  | 'converted_to_learning'
  | 'dismissed'
  | 'archived';

export type CreativeAssetType =
  | 'conceptual_image'
  | 'moodboard_reference'
  | 'background_image'
  | 'visual_prompt'
  | 'editable_art_reference'
  | 'final_art';

export type CreativeAssetStatus =
  | 'draft'
  | 'generated'
  | 'approved'
  | 'rejected'
  | 'archived';

export type AgencyAgentId =
  | 'account_director'
  | 'copywriter'
  | 'channel_adapter'
  | 'visual_director'
  | 'editor'
  | 'brand_compliance'
  | 'approver';

export type AgencyApprovalDecision =
  | 'approved'
  | 'revision_requested'
  | 'rejected';

export type AIExecutionMode =
  | 'mock'
  | 'economical'
  | 'use_agent_defaults'
  | 'use_single_model_for_run'
  | 'override_single_agent';

export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mock';

export type AIModelId =
  | 'mock-model'
  | 'gemini-3-flash-preview'
  | 'gpt-5.4'
  | 'claude-sonnet-4-6';

export interface AgencyModelSelection {
  execution_mode: AIExecutionMode;
  selected_model_id?: string;
  agent_overrides?: {
    agent_id: AgencyAgentId;
    model_id: string;
  }[];
  max_tokens_per_step?: number;
  max_estimated_cost_per_run?: number;
  require_confirmation_for_premium?: boolean;
  save_as_brand_default?: boolean;
}

export interface AIModelRegistryItem {
  provider: AIProvider;
  model_id: string;
  display_name: string;
  description?: string;
  cost_tier: 'zero' | 'low' | 'medium' | 'medium_high' | 'high';
  speed_tier: 'instant' | 'fast' | 'medium' | 'slow';
  is_active: boolean;
  is_mock?: boolean;
  is_preview?: boolean;
  recommended_for?: AgencyAgentId[];
}

export type AgencyExecutionProfileId =
  | 'simple_content'
  | 'channel_adapted_content'
  | 'visual_content'
  | 'landing_page_copy'
  | 'campaign_light'
  | 'custom';

export type BrandReadinessStatus =
  | 'not_ready'
  | 'partial_ready'
  | 'ready_for_content'
  | 'ready_for_campaigns';

export interface AgencyExecutionProfile {
  id: AgencyExecutionProfileId;
  name: string;
  description: string;
  allowed_request_types: AgencyRequestType[];
  allowed_channels?: AgencyChannel[];
  required_agents: AgencyAgentId[];
  optional_agents: AgencyAgentId[];
  default_agent_sequence: AgencyAgentId[];
  requires_briefing_approval: boolean;
  requires_brand_compliance: boolean;
  supports_visual_assets: boolean;
  supports_publication_pack: boolean;
  max_auto_revision_loops?: number;
}

export interface AgencyExecutionPlan {
  profile_id: AgencyExecutionProfileId;
  request_id: string;
  brand_id: string;
  agent_sequence: AgencyAgentId[];
  skipped_agents: {
    agent_id: AgencyAgentId;
    reason: string;
  }[];
  required_gates: string[];
  rationale: string;
  created_at?: string;
}

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
  brandMemoryVersionId?: string;
  brandKernelSnapshot?: BrandKernel;
  brandKernelVersion?: string;
  executionProfileId?: AgencyExecutionProfileId;
  executionPlan?: AgencyExecutionPlan;
  executionMode?: AIExecutionMode;
  modelSelection?: AgencyModelSelection;
  maxTokensPerStep?: number;
  maxEstimatedCostPerRun?: number;
  parentRunId?: string;
  branchLabel?: string;
  status: AgencyRunStatus;
  steps: AgencyStep[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
  executionMetadata?: AgencyRunExecutionSummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgencyStep {
  id?: string;
  runId?: string;
  agentId: AgencyAgentId;
  parentStepId?: string;
  supersededByStepId?: string;
  invalidatedByStepId?: string;
  versionNumber?: number;
  isCurrent?: boolean;
  input: unknown;
  output?: AgencyOutput;
  status: AgencyStepStatus;
  technicalStatus?: TechnicalExecutionStatus;
  qualityAssessment?: OutputQualityAssessment;
  modelUsed?: string;
  provider?: string;
  promptVersion?: string;
  modelId?: string;
  isMock?: boolean;
  tokens?: {
    input?: number;
    output?: number;
    total?: number;
  };
  costEstimate?: number;
  durationMs?: number;
  attemptCount?: number;
  executionMetadata?: AgentExecutionMetadata;
  executionMetadataJson?: AgentExecutionMetadata;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgencyOutput {
  agentId: AgencyAgentId;
  data: unknown;
  warnings?: string[];
  brandMemorySlicesUsed?: string[];
  qualityAssessment?: OutputQualityAssessment;
  provider?: AIProvider | string;
  model?: string;
  modelId?: string;
  isMock?: boolean;
  promptVersion?: string;
  tokens?: {
    input?: number;
    output?: number;
    total?: number;
  };
  estimatedCost?: number;
  temperature?: number;
  traceId?: string;
}

export interface OutputQualityAssessment {
  quality_status: OutputQualityStatus;
  quality_score?: number;
  quality_issues: string[];
  strategic_alignment_score?: number;
  voice_alignment_score?: number;
  visual_alignment_score?: number;
  evidence_risk_score?: number;
  review_reason?: string;
  assessed_by?: 'agent' | 'human' | 'system';
  assessed_at?: string;
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

export interface BrandMemoryVersion {
  id?: string;
  brandId: string;
  diagnosticRunId?: string;
  sourceOutputId?: string;
  versionNumber: number;
  status: BrandMemoryVersionStatus;
  espansioneDiagnosticJson: EspansioneDiagnostic;
  changeSummary?: string;
  validationStatus?: string;
  validationErrors?: unknown[];
  approvedBy?: string;
  activatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
    executionalReadiness: ExecutionalReadiness | null;
    adoptionRisks: string[];
    changeManagementNotes: string[];
  };
  internal: {
    executionalReadiness: ExecutionalReadiness | null;
    adoptionRisks: string[];
    culturalBlockers: string[];
    capabilityGaps: string[];
    internalAlignmentLevel: ExecutionalReadiness['internal_alignment_level'];
    changeManagementNotes: string[];
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
    operationalGuidelines: VisualIdentityOperationalSlice | null;
    visualPrinciples: string[];
    dos: string[];
    donts: string[];
    visualRisks: string[];
    promptGuidelines: string[];
    operationalWarnings: string[];
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
  strategicTensions: StrategicTension[];
  unresolvedStrategicTensions: StrategicTension[];
  communicationRisksFromTensions: string[];
  checkpointContext: CheckpointApprovalRecord[];
  source: {
    schemaVersion: EspansioneDiagnostic['schema_version'];
    agentsPresent: number[];
    generatedFrom: 'espansione_diagnostic';
  };
}

export interface AgencyPromptPack {
  agentId?: AgencyAgentId;
  systemPrompt: string;
  userPrompt: string;
  expectedOutputSchema: unknown;
  promptVersion: string;
}

export interface AgentExecutionMetadata {
  provider?: string;
  model?: string;
  model_id?: string;
  is_mock?: boolean;
  prompt_version?: string;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  estimated_cost?: number;
  duration_ms?: number;
  attempt_count?: number;
  temperature?: number;
  structured_output?: boolean;
  error_code?: string;
  error_message?: string;
  trace_id?: string;
}

export interface AgencyRunExecutionSummary {
  total_steps: number;
  completed_steps: number;
  failed_steps: number;
  estimated_cost_total: number;
  input_tokens_total: number;
  output_tokens_total: number;
  total_tokens: number;
  duration_ms_total: number;
}

export interface BrandLibraryItem {
  id?: string;
  brandId: string;
  sourceAgencyRunId?: string;
  sourceAgencyStepId?: string;
  sourceAgencyRequestId?: string;
  itemType: BrandLibraryItemType;
  status: BrandLibraryItemStatus;
  title: string;
  contentJson: unknown;
  plainText?: string;
  tags?: string[];
  channel?: AgencyChannel;
  requestType?: AgencyRequestType;
  objective?: AgencyObjective;
  audienceCluster?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandLearningSuggestion {
  id?: string;
  brandId: string;
  sourceAgencyRunId?: string;
  sourceAgencyRequestId?: string;
  sourceLibraryItemId?: string;
  sourceAgencySignalId?: string;
  learningType: BrandLearningType;
  content: string;
  rationale?: string;
  confidenceScore?: number;
  status: BrandLearningSuggestionStatus;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgencySignal {
  id?: string;
  brand_id: string;
  agency_run_id?: string;
  agency_request_id?: string;
  source_agent_id?: AgencyAgentId | string;
  affected_slice: AgencySignalAffectedSlice;
  signal_type: AgencySignalType;
  severity: AgencySignalSeverity;
  title: string;
  description: string;
  evidence: string[];
  recommendation: string;
  status: AgencySignalStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreativeAsset {
  id?: string;
  brandId: string;
  agencyRequestId?: string;
  agencyRunId?: string;
  sourceStepId?: string;
  assetType: CreativeAssetType;
  status: CreativeAssetStatus;
  title: string;
  prompt?: string;
  negativePrompt?: string;
  fileUrl?: string;
  metadataJson?: unknown;
  hasEmbeddedText?: boolean;
  textReviewRequired?: boolean;
  reviewNotes?: string;
  createdAt?: string;
  updatedAt?: string;
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
  quality_metadata?: OutputQualityMetadata;
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

export interface ChannelAdapterOutput {
  channel: AgencyChannel;
  request_type: AgencyRequestType;
  adapted_content: {
    headline?: string;
    body: string;
    caption?: string;
    subject_line?: string;
    preview_text?: string;
    script?: string;
    slide_sequence?: {
      slide_number: number;
      title?: string;
      text: string;
      visual_note?: string;
    }[];
    sections?: {
      section_title: string;
      content: string;
      cta?: string;
    }[];
  };
  channel_specific_notes: string[];
  formatting_rules_applied: string[];
  cta: string;
  hashtags?: string[];
  utm_suggestion?: string;
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
  quality_metadata?: OutputQualityMetadata;
  quality_assessment?: OutputQualityAssessment;
}

export interface BrandComplianceOutput {
  decision: 'pass' | 'warning' | 'fail';
  overall_brand_alignment_score: number;
  checklist: {
    criterion:
      | 'strategy'
      | 'positioning'
      | 'audience'
      | 'voice'
      | 'forbidden_words'
      | 'visual_identity'
      | 'communication_plan'
      | 'claims'
      | 'channel_fit'
      | 'strategic_tensions'
      | 'executional_readiness';
    status: 'pass' | 'warning' | 'fail';
    observation: string;
    required_adjustment?: string;
  }[];
  violations: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    related_brand_memory_slice?: string;
    suggested_fix: string;
  }[];
  required_adjustments: string[];
  optional_improvements: string[];
  brand_memory_slices_checked: string[];
  warnings: string[];
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
  quality_metadata?: OutputQualityMetadata;
  quality_assessment?: OutputQualityAssessment;
}

export interface ModelGatewayInput {
  agentId: AgencyAgentId;
  promptPack: AgencyPromptPack;
  provider?: AIProvider | string;
  modelId?: string;
  systemPrompt?: string;
  userPrompt?: string;
  schema?: unknown;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface ModelGateway {
  generateStructuredOutput(input: ModelGatewayInput): Promise<AgencyOutput>;
}
