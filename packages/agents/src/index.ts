import { getBrandMemory } from '@espansione/brand-memory';
export * from './brand-readiness.ts';
export * from './prompt-packs.ts';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AgencyAgentId,
  AgencyRequest,
  BrandKernel,
  ClusterComunicacao,
  DiretrizEstrategica,
  EspansioneDiagnostic,
  OndaBranding,
  Persona,
  StrategicTension,
} from '@espansione/types';

export type {
  AgencyAgentId,
  AgencyApprovalDecision,
  AgencyChannel,
  AgencyObjective,
  AgencyOutput,
  AgencyRequest,
  AgencyRequestStatus,
  AgencyRequestType,
  AgencyRun,
  AgencyRunStatus,
  AgencyStep,
  AgencyStepStatus,
  ApprovalDecision,
  BrandKernel,
  BrandReadinessResult,
  BrandReadinessStatus,
} from '@espansione/types';

export interface AgencyAgentSpec {
  id: AgencyAgentId;
  name: string;
  role: string;
  mission: string;
  consumes: string[];
  produces: string[];
}

export interface AgencyAgentBrief extends AgencyAgentSpec {
  inputs: string[];
  guardrails: string[];
  outputContract: string[];
  prompt: string;
}

export interface AgencyPromptPackRun {
  brand: BrandKernel['brand'];
  request: AgencyRequest;
  kernel: BrandKernel;
  agents: AgencyAgentBrief[];
  approvalChecklist: string[];
}

export const DEFAULT_AGENCY_AGENT_IDS: AgencyAgentId[] = [
  'account_director',
  'copywriter',
  'visual_director',
  'editor',
  'approver',
];

export const AGENCY_AGENT_SPECS: Record<AgencyAgentId, AgencyAgentSpec> = {
  account_director: {
    id: 'account_director',
    name: 'Atendimento Estrategico',
    role: 'Traduz Brand Memory em briefing de campanha.',
    mission: 'Definir objetivo, audiencia, promessa, contexto e criterios de sucesso antes da criacao.',
    consumes: ['Agentes 6, 9, 12 e 13'],
    produces: ['briefing_operacional', 'hipotese_criativa', 'criterios_de_sucesso'],
  },
  copywriter: {
    id: 'copywriter',
    name: 'Copywriter',
    role: 'Cria textos no tom proprietario da marca.',
    mission: 'Transformar estrategia, voz e plano de comunicacao em narrativa, headline, corpo e CTA.',
    consumes: ['Agentes 9, 10, 12 e 13'],
    produces: ['copy_principal', 'variacoes', 'cta', 'racional_de_tom'],
  },
  visual_director: {
    id: 'visual_director',
    name: 'Direcao Visual',
    role: 'Define caminho visual coerente com a identidade.',
    mission: 'Traduzir a identidade visual em layout, imagem, cor, tipografia e comportamento de peca.',
    consumes: ['Agentes 9, 11, 12 e 13'],
    produces: ['direcao_de_arte', 'regras_visuais', 'assets_necessarios'],
  },
  editor: {
    id: 'editor',
    name: 'Editor de Coerencia',
    role: 'Ajusta a entrega para consistencia estrategica.',
    mission: 'Cortar excesso, alinhar promessa, manter clareza e preservar escolhas da fase 1.',
    consumes: ['Agentes 6, 7, 8, 9, 10 e 13'],
    produces: ['versao_editada', 'ajustes_recomendados', 'riscos_de_incoerencia'],
  },
  approver: {
    id: 'approver',
    name: 'Aprovador de Marca',
    role: 'Barreira final antes de publicar.',
    mission: 'Checar aderencia a estrategia, voz, visual, audiencia, canal e restricoes.',
    consumes: ['Todos os slices ativos da Brand Memory'],
    produces: ['decisao', 'checklist', 'ajustes_obrigatorios'],
  },
};

export function buildBrandKernel(diagnostic: EspansioneDiagnostic): BrandKernel {
  const plataforma = diagnostic.plataforma_branding;
  const voice = diagnostic.voice_profile;
  const visual = diagnostic.visual_identity;
  const plano = diagnostic.plano_comunicacao;
  const experiencia = diagnostic.experiencia;
  const strategicTensions = extractStrategicTensions(diagnostic);
  const checkpointContext = Array.isArray(diagnostic.meta?.checkpoint_context)
    ? diagnostic.meta.checkpoint_context
    : [];
  const unresolvedStrategicTensions = strategicTensions.filter(
    (tension) => tension.status !== 'resolved'
  );
  const communicationRisksFromTensions = unique(
    unresolvedStrategicTensions.map((tension) =>
      tension.impact_on_communication
        ? `${tension.theme}: ${tension.impact_on_communication}`
        : `${tension.theme}: ${tension.risk_if_ignored}`
    )
  );
  const forbiddenWords = (voice?.palavras_proibidas ?? []).map(
    (word) => `${word.termo}: ${word.razao}`
  );
  const visualRestrictions = visual?.manter_perder_ganhar?.perder ?? [];
  const channelGuidelines = unique([
    ...(plano?.plano_conexoes?.midia_paga?.papel_por_canal ?? []).map(
      (item) => `${item.canal}: ${item.papel} (onda ${item.onda})`
    ),
    ...(plano?.plano_conexoes?.midia_propria?.papel_por_canal ?? []).map(
      (item) => `${item.canal}: ${item.papel} (onda ${item.onda})`
    ),
    plano?.plano_conexoes?.midia_espontanea?.papel
      ? `PR/midia espontanea: ${plano.plano_conexoes.midia_espontanea.papel}`
      : null,
  ]);
  const proofPoints = unique([
    ...(plano?.diferenciais ?? []).map(
      (item) => `${item.titulo}: ${item.evidencia_que_sustenta}`
    ),
    ...(diagnostic.vi?.evidencias_literais ?? []).map(
      (item) => `${item.topic}: "${item.quote}"`
    ),
  ]);

  return {
    brand: {
      name: diagnostic.brand_name,
      slug: diagnostic.brand_slug,
      industry: diagnostic.industry,
    },
    strategy: {
      purpose: plataforma?.marca_e?.proposito?.statement ?? null,
      archetype: plataforma?.marca_e?.arquetipo?.dominante ?? null,
      positioning: plataforma?.comunicacao_fala?.discurso_posicionamento ?? null,
      tagline: plataforma?.comunicacao_fala?.tagline ?? plano?.atemporal?.tagline ?? null,
      directives: mapDiretrizes(diagnostic.diretrizes_estrategicas),
      dePara: (diagnostic.decodificacao?.de_para ?? []).map(
        (item) => `${item.camada}: sair de "${item.sair_de}" para "${item.ir_para}"`
      ),
      values: unique([
        ...(plataforma?.marca_e?.valores ?? []).map((item) => item.name),
        ...(diagnostic.values_and_attributes?.values ?? []).map((item) => item.name),
      ]),
      attributes: unique([
        ...(plataforma?.marca_e?.atributos ?? []).map((item) => item.name),
        ...(diagnostic.values_and_attributes?.personality_attributes ?? []).map((item) => item.name),
      ]),
    },
    audience: {
      personas: (experiencia?.personas ?? []).map(formatPersona),
      clusters: (plano?.clusters_comunicacao ?? []).map(formatCluster),
      journeyStages: (experiencia?.customer_journey?.stages ?? []).map(
        (stage) => `${stage.name}: ${stage.title_evocativo ?? stage.descricao}`
      ),
      brandMoments: (experiencia?.brand_moments ?? []).map(
        (moment) => `${moment.nome}: ${moment.como_manifesta_proposito}`
      ),
    },
    voice: {
      tones: (voice?.tons_de_voz ?? []).map(
        (tone) => `${tone.nome}: ${tone.descricao}. Usar quando: ${tone.quando_usar}`
      ),
      territories: (voice?.territorios_palavras ?? []).map(
        (territory) => `${territory.nome}: ${territory.vocabulario.join(', ')}`
      ),
      forbiddenWords: (voice?.palavras_proibidas ?? []).map(
        (word) => `${word.termo}: ${word.razao}`
      ),
      naming: (voice?.convencoes_naming ?? []).map(
        (item) => `${item.termo}: ${item.definicao}`
      ),
    },
    visual: {
      keep: visual?.manter_perder_ganhar?.manter ?? [],
      lose: visual?.manter_perder_ganhar?.perder ?? [],
      gain: visual?.manter_perder_ganhar?.ganhar ?? [],
      colors: [
        ...(visual?.color_palette?.principal ?? []).map(
          (color) => `${color.nome}${color.hex ? ` (${color.hex})` : ''}: ${color.papel}`
        ),
        ...(visual?.color_palette?.complementar ?? []).map(
          (color) => `${color.nome}${color.hex ? ` (${color.hex})` : ''}: ${color.uso_contextual ?? color.descricao}`
        ),
      ],
      typography: [
        visual?.typography?.titulos
          ? `Titulos: ${visual.typography.titulos.estilo} (${visual.typography.titulos.transmite})`
          : null,
        visual?.typography?.corpo
          ? `Corpo: ${visual.typography.corpo.estilo} (${visual.typography.corpo.transmite})`
          : null,
      ].filter(isString),
      photography: visual?.fotografia
        ? `${visual.fotografia.estilo}. Temas: ${visual.fotografia.temas.join(', ')}. Tratamento: ${visual.fotografia.tratamento}`
        : null,
      behavior: visual?.comportamento_visual ?? null,
      symbol: visual?.simbolo_logo?.defesa ?? null,
    },
    communication: {
      waves: (plano?.ondas_branding ?? []).map(formatWave),
      channels: unique([
        ...(plano?.plano_conexoes?.midia_paga?.canais ?? []),
        ...(plano?.plano_conexoes?.midia_propria?.canais ?? []),
        ...(plano?.plano_conexoes?.midia_espontanea?.alvos_pr ?? []),
      ]),
      differentials: (plano?.diferenciais ?? []).map(
        (item) => `${item.titulo}: ${item.defesa}`
      ),
      proprietaryAsset: plano?.ativo_proprietario_central ?? null,
      risk: plano?.principal_risco_a_monitorar ?? null,
    },
    constraints: unique([
      ...forbiddenWords.map((word) => `Evitar linguagem: ${word}`),
      ...visualRestrictions.map((item) => `Evitar caminho visual: ${item}`),
      plano?.principal_risco_a_monitorar
        ? `Monitorar risco: ${plano.principal_risco_a_monitorar}`
        : null,
    ]),
    proofPoints,
    forbiddenClaims: forbiddenWords,
    preferredCTAs: [],
    channelGuidelines,
    strategicTensions,
    unresolvedStrategicTensions,
    communicationRisksFromTensions,
    checkpointContext,
    source: {
      schemaVersion: diagnostic.schema_version,
      agentsPresent: diagnostic.meta?.agents_present ?? [],
      generatedFrom: 'espansione_diagnostic',
    },
  };
}

function extractStrategicTensions(diagnostic: EspansioneDiagnostic): StrategicTension[] {
  const slice =
    diagnostic.strategic_tensions ??
    diagnostic.decodificacao?.strategic_tensions ??
    diagnostic.decodificacao?.pontos_de_escolha_estrategica;

  if (!slice || !Array.isArray(slice.tensions)) return [];
  return slice.tensions.filter((tension): tension is StrategicTension => {
    return Boolean(
      tension &&
        typeof tension.title === 'string' &&
        typeof tension.theme === 'string' &&
        typeof tension.tension_summary === 'string' &&
        typeof tension.strategic_choice_needed === 'string' &&
        typeof tension.risk_if_ignored === 'string'
    );
  });
}

export function buildAgencyRun(
  diagnostic: EspansioneDiagnostic,
  request: AgencyRequest,
  agentIds: AgencyAgentId[] = DEFAULT_AGENCY_AGENT_IDS
): AgencyPromptPackRun {
  const kernel = buildBrandKernel(diagnostic);
  const agents = agentIds.map((id) => buildAgentBrief(id, kernel, request));

  return {
    brand: kernel.brand,
    request,
    kernel,
    agents,
    approvalChecklist: buildApprovalChecklist(kernel, request),
  };
}

export async function buildAgencyRunFromBrandMemory(
  supabase: SupabaseClient,
  brandId: string,
  request: AgencyRequest,
  agentIds: AgencyAgentId[] = DEFAULT_AGENCY_AGENT_IDS
): Promise<AgencyPromptPackRun> {
  const diagnostic = await getBrandMemory(supabase, brandId);
  if (!diagnostic) {
    throw new AgencyError(`Brand Memory nao encontrada para brandId=${brandId}`);
  }
  return buildAgencyRun(diagnostic, request, agentIds);
}

export function buildAgentBrief(
  agentId: AgencyAgentId,
  kernel: BrandKernel,
  request: AgencyRequest
): AgencyAgentBrief {
  const spec = AGENCY_AGENT_SPECS[agentId];
  const commonInputs = [
    `Marca: ${kernel.brand.name}`,
    `Objetivo: ${request.objective}`,
    `Entrega: ${request.requestType}`,
    request.channel ? `Canal: ${request.channel}` : null,
    request.audienceCluster ? `Audiencia/cluster solicitado: ${request.audienceCluster}` : null,
    request.offer ? `Oferta: ${request.offer}` : null,
    request.desiredCta ? `CTA desejado: ${request.desiredCta}` : null,
    `Contexto: ${request.context}`,
    ...formatList('Diretrizes', kernel.strategy.directives),
    ...formatList('Publicos/personas', kernel.audience.personas),
    ...formatList('Clusters', kernel.audience.clusters),
    ...formatList('Ondas de comunicacao', kernel.communication.waves),
  ].filter(isString);

  const roleInputs: Record<AgencyAgentId, string[]> = {
    account_director: [
      kernel.strategy.positioning ? `Posicionamento: ${kernel.strategy.positioning}` : null,
      kernel.strategy.purpose ? `Proposito: ${kernel.strategy.purpose}` : null,
      ...formatList('De/para estrategico', kernel.strategy.dePara),
      ...formatList('Diferenciais', kernel.communication.differentials),
    ].filter(isString),
    copywriter: [
      ...formatList('Tons de voz', kernel.voice.tones),
      ...formatList('Territorios de palavras', kernel.voice.territories),
      ...formatList('Palavras proibidas', kernel.voice.forbiddenWords),
      ...formatList('Convencoes de naming', kernel.voice.naming),
    ],
    visual_director: [
      ...formatList('Manter', kernel.visual.keep),
      ...formatList('Perder', kernel.visual.lose),
      ...formatList('Ganhar', kernel.visual.gain),
      ...formatList('Cores', kernel.visual.colors),
      ...formatList('Tipografia', kernel.visual.typography),
      kernel.visual.photography ? `Fotografia: ${kernel.visual.photography}` : null,
      kernel.visual.behavior ? `Comportamento visual: ${kernel.visual.behavior}` : null,
      kernel.visual.symbol ? `Simbolo/logo: ${kernel.visual.symbol}` : null,
    ].filter(isString),
    editor: [
      ...formatList('Valores', kernel.strategy.values),
      ...formatList('Atributos', kernel.strategy.attributes),
      kernel.communication.risk ? `Risco a monitorar: ${kernel.communication.risk}` : null,
      kernel.communication.proprietaryAsset
        ? `Ativo proprietario central: ${kernel.communication.proprietaryAsset}`
        : null,
    ].filter(isString),
    approver: buildApprovalChecklist(kernel, request),
  };

  const guardrails = buildGuardrails(agentId, kernel, request);
  const outputContract = buildOutputContract(agentId);
  const inputs = [...commonInputs, ...roleInputs[agentId]];

  return {
    ...spec,
    inputs,
    guardrails,
    outputContract,
    prompt: renderPrompt(spec, inputs, guardrails, outputContract),
  };
}

export function buildApprovalChecklist(kernel: BrandKernel, request: AgencyRequest): string[] {
  return [
    'A entrega responde ao objetivo do briefing sem mudar a estrategia da fase 1.',
    kernel.strategy.purpose
      ? `A promessa sustenta o proposito: ${kernel.strategy.purpose}`
      : 'A promessa nao inventa proposito ausente na Brand Memory.',
    kernel.strategy.positioning
      ? `O texto respeita o discurso de posicionamento: ${kernel.strategy.positioning}`
      : 'O texto nao inventa posicionamento.',
    request.desiredCta ? `O CTA esta presente e claro: ${request.desiredCta}` : 'O CTA e claro e compativel com o canal.',
    ...kernel.voice.forbiddenWords.map((word) => `Nao usar: ${word}`),
    ...kernel.visual.lose.map((item) => `Evitar visualmente: ${item}`),
    kernel.communication.risk ? `Mitigar risco: ${kernel.communication.risk}` : null,
    request.restrictions?.length ? `Respeitar restricoes: ${request.restrictions.join('; ')}` : null,
  ].filter(isString);
}

function buildGuardrails(
  agentId: AgencyAgentId,
  kernel: BrandKernel,
  request: AgencyRequest
): string[] {
  const base = [
    'Nao inventar fatos, provas, dados ou ofertas que nao estejam no briefing.',
    'Quando houver conflito, priorizar Brand Memory da fase 1.',
    'Responder em pt-BR.',
    request.restrictions?.length ? `Respeitar restricoes: ${request.restrictions.join('; ')}` : null,
  ].filter(isString);

  if (agentId === 'copywriter') {
    return [
      ...base,
      ...kernel.voice.forbiddenWords.map((word) => `Evitar palavra/territorio proibido: ${word}`),
      'Manter o tom de voz antes de buscar impacto criativo.',
    ];
  }

  if (agentId === 'visual_director') {
    return [
      ...base,
      ...kernel.visual.lose.map((item) => `Nao seguir caminho visual marcado como "perder": ${item}`),
      'Toda recomendacao visual deve apontar cor, tipo, imagem ou composicao.',
    ];
  }

  if (agentId === 'approver') {
    return [
      ...base,
      'Se algo violar a Brand Memory, devolver revision_requested com ajustes obrigatorios.',
      'Aprovacao exige coerencia estrategica, verbal e visual.',
    ];
  }

  return base;
}

function buildOutputContract(agentId: AgencyAgentId): string[] {
  const contracts: Record<AgencyAgentId, string[]> = {
    account_director: [
      'briefing_operacional',
      'audiencia_prioritaria',
      'promessa_da_peca',
      'criterios_de_sucesso',
    ],
    copywriter: ['headline', 'body_copy', 'cta', 'variacoes', 'racional_de_tom'],
    visual_director: ['direcao_de_arte', 'layout', 'paleta_aplicada', 'assets_necessarios'],
    editor: ['versao_editada', 'cortes', 'ajustes_de_coerencia', 'riscos_remanescentes'],
    approver: ['decisao: approved | revision_requested | rejected', 'checklist', 'ajustes_obrigatorios'],
  };
  return contracts[agentId];
}

function renderPrompt(
  spec: AgencyAgentSpec,
  inputs: string[],
  guardrails: string[],
  outputContract: string[]
): string {
  return [
    `Voce e o agente "${spec.name}" da agencia Espansione.`,
    spec.mission,
    '',
    'INSUMOS',
    ...inputs.map((item) => `- ${item}`),
    '',
    'REGRAS',
    ...guardrails.map((item) => `- ${item}`),
    '',
    'ENTREGAR',
    ...outputContract.map((item) => `- ${item}`),
  ].join('\n');
}

function mapDiretrizes(diretrizes: DiretrizEstrategica[]): string[] {
  return (diretrizes ?? []).map((item) => `${item.numero}. ${item.titulo}: ${item.o_que}`);
}

function formatPersona(persona: Persona): string {
  const pains = persona.pains?.length ? ` Dores: ${persona.pains.join(', ')}.` : '';
  return `${persona.name} (${persona.role_profession}): ${persona.jtbd}.${pains}`;
}

function formatCluster(cluster: ClusterComunicacao): string {
  return `${cluster.numero}. ${cluster.nome}: ${cluster.descricao}. Motivacao/JTBD: ${cluster.motivacoes_jtbd}`;
}

function formatWave(wave: OndaBranding): string {
  return `Onda ${wave.onda} (${wave.label}): ${wave.mensagem_ancora}. Tom: ${wave.tom_voz_dominante}`;
}

function formatList(label: string, items: string[]): string[] {
  if (!items.length) return [];
  return [`${label}:`, ...items.map((item) => `  - ${item}`)];
}

function unique(items: Array<string | null | undefined>): string[] {
  return Array.from(new Set(items.filter(isString)));
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

class AgencyError extends Error {
  constructor(message: string) {
    super(`[Agency] ${message}`);
    this.name = 'AgencyError';
  }
}
