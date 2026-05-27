import type {
  AccountDirectorOutput,
  ApproverOutput,
  AgencyAgentId,
  AgencyPromptPack,
  AgencyRequest,
  BrandComplianceOutput,
  BrandKernel,
  ChannelAdapterOutput,
  CopywriterOutput,
  EditorOutput,
  VisualDirectorOutput,
} from '@espansione/types';

interface AccountDirectorPromptPackInput {
  brandKernel: BrandKernel;
  agencyRequest: AgencyRequest;
}

type ArchetypeGuidanceFocus = 'verbal' | 'channel' | 'visual' | 'compliance';

const ARCHETYPE_GUIDANCE: Record<string, {
  verbal: string[];
  visual: string[];
  avoid: string[];
}> = {
  mago: {
    verbal: ['transformacao com clareza', 'revelar possibilidades', 'mudanca guiada por metodo'],
    visual: ['atmosfera de descoberta', 'contraste sofisticado', 'sinais de transformacao sem fantasia literal'],
    avoid: ['misticismo vazio', 'promessas milagrosas', 'efeitos visuais espalhafatosos'],
  },
  sabio: {
    verbal: ['clareza intelectual', 'autoridade calma', 'ensino sem pedantismo'],
    visual: ['ordem visual', 'legibilidade alta', 'hierarquia racional e precisa'],
    avoid: ['tom professoral arrogante', 'jargao excessivo', 'frieza desumana'],
  },
  heroi: {
    verbal: ['coragem pratica', 'superacao objetiva', 'convite a agir'],
    visual: ['energia e direcao', 'contraste forte', 'composicao assertiva'],
    avoid: ['agressividade gratuita', 'triunfalismo vazio', 'promessa de invencibilidade'],
  },
  rebelde: {
    verbal: ['ruptura com criterio', 'franqueza', 'desafio ao padrao gasto'],
    visual: ['tensao controlada', 'cortes ousados', 'atitude sem caos'],
    avoid: ['destruicao gratuita', 'cinismo', 'provocacao sem estrategia'],
  },
  cuidador: {
    verbal: ['acolhimento', 'protecao', 'servico confiavel'],
    visual: ['calor humano', 'proximidade', 'clareza tranquilizadora'],
    avoid: ['paternalismo', 'tom infantilizado', 'fragilidade excessiva'],
  },
  explorador: {
    verbal: ['abertura ao novo', 'liberdade com direcao', 'descoberta'],
    visual: ['espaco', 'respiro', 'sensacao de movimento e horizonte'],
    avoid: ['dispersao', 'falta de foco', 'aventura sem relevancia'],
  },
  criador: {
    verbal: ['originalidade util', 'inventividade', 'expressao autoral'],
    visual: ['composicao inventiva', 'detalhes proprietarios', 'forma com conceito'],
    avoid: ['excentricidade gratuita', 'ornamento sem funcao', 'caos visual'],
  },
  bobo: {
    verbal: ['leveza inteligente', 'humor com timing', 'quebra de rigidez'],
    visual: ['ritmo leve', 'surpresas controladas', 'expressividade sem bagunca'],
    avoid: ['palhacada', 'deboche da marca', 'piada que enfraquece confianca'],
  },
  amante: {
    verbal: ['conexao', 'encantamento', 'proximidade sensorial'],
    visual: ['textura', 'intimidade', 'sofisticacao calorosa'],
    avoid: ['seducao vazia', 'exagero melodramatico', 'apelo apelativo'],
  },
  inocente: {
    verbal: ['simplicidade luminosa', 'otimismo', 'franqueza limpa'],
    visual: ['leveza', 'respiro', 'limpeza sem ingenuidade boba'],
    avoid: ['naivete', 'simplificacao infantil', 'falta de densidade'],
  },
  governante: {
    verbal: ['controle sereno', 'seguranca', 'lideranca organizada'],
    visual: ['estrutura', 'simetria funcional', 'acabamento premium e disciplinado'],
    avoid: ['autoritarismo', 'rigidez fria', 'distancia excessiva'],
  },
  comum: {
    verbal: ['acessibilidade', 'realismo', 'identificacao imediata'],
    visual: ['naturalidade', 'cotidiano qualificado', 'proximidade sem banalidade'],
    avoid: ['mediocridade', 'genericidade', 'falta de personalidade'],
  },
};

export const ACCOUNT_DIRECTOR_PROMPT_VERSION = 'account_director_v1';
export const COPYWRITER_PROMPT_VERSION = 'copywriter_v2';
export const CHANNEL_ADAPTER_PROMPT_VERSION = 'channel_adapter_v2';
export const VISUAL_DIRECTOR_PROMPT_VERSION = 'visual_director_v2';
export const EDITOR_PROMPT_VERSION = 'editor_v1';
export const BRAND_COMPLIANCE_PROMPT_VERSION = 'brand_compliance_v2';
export const APPROVER_PROMPT_VERSION = 'approver_v1';

const PROMPT_VERSION_BY_AGENT = {
  account_director: ACCOUNT_DIRECTOR_PROMPT_VERSION,
  copywriter: COPYWRITER_PROMPT_VERSION,
  channel_adapter: CHANNEL_ADAPTER_PROMPT_VERSION,
  visual_director: VISUAL_DIRECTOR_PROMPT_VERSION,
  editor: EDITOR_PROMPT_VERSION,
  brand_compliance: BRAND_COMPLIANCE_PROMPT_VERSION,
  approver: APPROVER_PROMPT_VERSION,
} as const;

export const ACCOUNT_DIRECTOR_OUTPUT_SCHEMA = {
  type: 'object',
  required: [
    'briefing_operacional',
    'hipotese_criativa',
    'criterios_de_sucesso',
    'brand_memory_slices_used',
    'warnings',
  ],
  properties: {
    briefing_operacional: {
      type: 'object',
      required: [
        'objetivo',
        'publico',
        'contexto',
        'insight',
        'promessa',
        'mensagem_central',
        'tom_recomendado',
        'canal',
        'formato',
        'criterio_de_sucesso',
      ],
    },
    hipotese_criativa: {
      type: 'object',
      required: ['conceito', 'angulo', 'narrativa'],
    },
    criterios_de_sucesso: { type: 'array', items: { type: 'string' } },
    brand_memory_slices_used: { type: 'array', items: { type: 'string' } },
    warnings: { type: 'array', items: { type: 'string' } },
    quality_metadata: qualityMetadataSchema(),
  },
} as const satisfies Record<string, unknown>;

export function buildAccountDirectorPromptPack({
  brandKernel,
  agencyRequest,
}: AccountDirectorPromptPackInput): AgencyPromptPack {
  assertBrandKernel(brandKernel);
  assertAgencyRequest(agencyRequest);

  return {
    agentId: 'account_director',
    promptVersion: ACCOUNT_DIRECTOR_PROMPT_VERSION,
    systemPrompt: [
      'Voce e o agente account_director da Agencia IA da Espansione.',
      'Sua funcao e transformar Brand Memory e pedido do usuario em briefing operacional.',
      'Nao escreva a peca final. Nao crie copy final. Nao invente fatos, provas, numeros ou promessas.',
      'Se faltar evidencia, declare como hipotese ou warning.',
      'Inclua quality_metadata com confiança, força de evidência, hipóteses, lacunas, contradições e necessidade de atenção humana.',
      'Use a Brand Memory como fonte canonica e preserve as escolhas estrategicas da Fase 1.',
      'Use strategicTensions como restricao estrategica: nao resolva tensoes abertas sem autorizacao humana.',
      'Use executionalReadiness quando existir: nao trate DISC/CIS como obrigatorio, mas considere riscos de adocao, bloqueadores culturais, alinhamento interno e notas de gestao da mudanca.',
      'Responda apenas no schema esperado.',
    ].join('\n'),
    userPrompt: [
      'BRAND_KERNEL',
      JSON.stringify(brandKernel, null, 2),
      '',
      'AGENCY_REQUEST',
      JSON.stringify(agencyRequest, null, 2),
      '',
      'TAREFA',
      '- Definir objetivo, publico, contexto, insight, promessa, mensagem central, tom e criterio de sucesso.',
      '- Usar os slices criticos: decodificacao, plataforma_branding, experiencia e plano_comunicacao.',
      '- Considerar constraints, proofPoints, forbiddenClaims, preferredCTAs e channelGuidelines.',
      '- Se o pedido tocar em tema com strategicTensions abertas, mencionar o risco no briefing.',
      '- Sinalizar quando a campanha puder reforcar uma divergencia sensivel entre VI, VE e VM.',
      '- Considerar executionalReadiness em campanhas internas, mudanca de posicionamento, tom de comunicacao e risco de desalinhamento entre promessa externa e capacidade interna.',
      '- Nao criar a peca final nesta etapa.',
    ].join('\n'),
    expectedOutputSchema: ACCOUNT_DIRECTOR_OUTPUT_SCHEMA,
  };
}

export function buildCopywriterPromptPack({
  brandKernel,
  agencyRequest,
  accountDirectorOutput,
}: {
  brandKernel: BrandKernel;
  agencyRequest: AgencyRequest;
  accountDirectorOutput: AccountDirectorOutput;
}): AgencyPromptPack {
  assertBrandKernel(brandKernel);
  assertAgencyRequest(agencyRequest);
  assertAccountDirectorOutput(accountDirectorOutput);

  return makePromptPack({
    agent: 'copywriter',
    mission: 'Criar textos no tom proprietario da marca, a partir do briefing operacional.',
    rules: [
      'Usar voice_profile, tons de voz, territorios verbais e palavras proibidas.',
      ...buildArchetypeGuidance(brandKernel, 'verbal'),
      'Nao inventar fatos, provas, numeros ou promessas.',
      'Declarar warnings quando houver falta de prova.',
      'Entregar copy, variacoes, CTA e racional de tom.',
    ],
    payload: { brandKernel, agencyRequest, accountDirectorOutput },
    expectedOutputSchema: {
      required: ['copy_principal', 'variacoes', 'cta', 'racional_de_tom', 'claims_utilizados', 'claims_evitar', 'warnings'],
    },
  });
}

export function buildVisualDirectorPromptPack({
  brandKernel,
  agencyRequest,
  accountDirectorOutput,
  channelAdapterOutput,
}: {
  brandKernel: BrandKernel;
  agencyRequest: AgencyRequest;
  accountDirectorOutput: AccountDirectorOutput;
  channelAdapterOutput?: ChannelAdapterOutput;
}): AgencyPromptPack {
  assertBrandKernel(brandKernel);
  assertAgencyRequest(agencyRequest);
  assertAccountDirectorOutput(accountDirectorOutput);

  return makePromptPack({
    agent: 'visual_director',
    mission: 'Traduzir identidade visual em direcao de arte para a peca.',
    rules: [
      'Consumir brandKernel.visual.operationalGuidelines quando existir; usar dos, donts, visualRisks e promptGuidelines como restricoes.',
      'Respeitar visual_identity, manter/perder/ganhar, cores, tipografia, fotografia, iconografia e comportamento visual.',
      ...buildArchetypeGuidance(brandKernel, 'visual'),
      'Gerar direcao de arte, nao arte final.',
      'Evitar caminhos visuais marcados como inadequados.',
      'Indicar assets necessarios, composicao, restricoes visuais e riscos visuais.',
      'Gerar prompt_visual_opcional apenas quando houver direcao suficiente e sem exigir texto embutido.',
      'Se brandKernel.visual.operationalWarnings incluir "Visual identity operacional incompleta.", declarar warning e pedir revisao humana visual.',
      'Quando channelAdapterOutput existir, considerar o conteudo adaptado ao canal como insumo de formato e hierarquia visual.',
    ],
    payload: { brandKernel, agencyRequest, accountDirectorOutput, channelAdapterOutput },
    expectedOutputSchema: {
      required: ['direcao_de_arte', 'regras_visuais', 'assets_necessarios', 'composicao', 'estilo_imagem', 'restricoes_visuais', 'warnings'],
    },
  });
}

export function buildChannelAdapterPromptPack({
  brandKernel,
  agencyRequest,
  accountDirectorOutput,
  copywriterOutput,
  approvedBriefing,
}: {
  brandKernel: BrandKernel;
  agencyRequest: AgencyRequest;
  accountDirectorOutput: AccountDirectorOutput;
  copywriterOutput: CopywriterOutput;
  approvedBriefing?: AccountDirectorOutput;
}): AgencyPromptPack {
  assertBrandKernel(brandKernel);
  assertAgencyRequest(agencyRequest);
  assertAccountDirectorOutput(accountDirectorOutput);
  assertCopywriterOutput(copywriterOutput);

  return makePromptPack({
    agent: 'channel_adapter',
    mission: 'Adaptar a copy-mae ou mensagem central para o canal e formato solicitados, sem publicar.',
    rules: [
      'Usar BrandKernel como fonte canonica e respeitar voz, palavras proibidas, proofPoints, forbiddenClaims e restricoes.',
      ...buildArchetypeGuidance(brandKernel, 'channel'),
      'Usar approvedBriefing quando existir; caso contrario, usar accountDirectorOutput como briefing operacional.',
      'Usar copywriterOutput como copy-mae. Nao substituir estrategia, apenas adaptar linguagem, formato e hierarquia ao canal.',
      'Nao inventar fatos, numeros, cases, provas ou promessas. Declarar warnings quando faltar prova, contexto ou houver risco de claim.',
      'LinkedIn: tom profissional, abertura forte, paragrafos curtos, CTA claro e poucas hashtags.',
      'Instagram: legenda direta, gancho inicial, linguagem fluida, hashtags opcionais e atencao a post/carrossel/reels.',
      'WhatsApp: texto curto, conversacional, direto, CTA objetivo e sem blocos longos.',
      'Email: incluir subject_line, preview_text, abertura, desenvolvimento e CTA com clareza de oferta.',
      'Website: incluir sections com headline/subtitulo/blocos/CTA, foco em clareza e conversao.',
      'Paid media: variacoes curtas, promessa objetiva, CTA e warnings sobre claims sem prova.',
      'Other: adaptar de forma generica e registrar warnings de limitacao.',
      'Nao gerar imagem, nao publicar, nao criar plano de midia e nao alterar Brand Memory.',
    ],
    payload: { brandKernel, agencyRequest, accountDirectorOutput, copywriterOutput, approvedBriefing },
    expectedOutputSchema: CHANNEL_ADAPTER_OUTPUT_SCHEMA,
  });
}

export function buildEditorPromptPack({
  brandKernel,
  agencyRequest,
  accountDirectorOutput,
  copywriterOutput,
  visualDirectorOutput,
  channelAdapterOutput,
}: {
  brandKernel: BrandKernel;
  agencyRequest: AgencyRequest;
  accountDirectorOutput: AccountDirectorOutput;
  copywriterOutput: CopywriterOutput;
  visualDirectorOutput?: VisualDirectorOutput;
  channelAdapterOutput?: ChannelAdapterOutput;
}): AgencyPromptPack {
  assertBrandKernel(brandKernel);
  assertAgencyRequest(agencyRequest);
  assertAccountDirectorOutput(accountDirectorOutput);
  assertCopywriterOutput(copywriterOutput);

  return makePromptPack({
    agent: 'editor',
    mission: 'Ajustar copy e, quando existir, direcao visual para consistencia estrategica.',
    rules: [
      'Cortar excessos.',
      'Preservar posicionamento, promessa e criterios do briefing.',
      'Apontar riscos de incoerencia.',
      'Gerar score de aderencia de 0 a 100.',
      'Incluir quality_metadata quando houver riscos, lacunas ou hipóteses relevantes.',
      'Incluir quality_assessment separando qualidade do output de falha técnica.',
      'Quando channelAdapterOutput existir, editar a versao adaptada ao canal; a copy-mae continua como referencia de origem.',
      'Quando visualDirectorOutput nao existir, avaliar apenas qualidade editorial, clareza, canal, promessa e riscos de incoerencia textual.',
    ],
    payload: { brandKernel, agencyRequest, accountDirectorOutput, copywriterOutput, channelAdapterOutput, visualDirectorOutput },
    expectedOutputSchema: {
      required: ['versao_editada', 'ajustes_recomendados', 'riscos_de_incoerencia', 'score_aderencia', 'observacoes'],
      properties: { quality_metadata: qualityMetadataSchema(), quality_assessment: qualityAssessmentSchema() },
    },
  });
}

export function buildApproverPromptPack({
  brandKernel,
  agencyRequest,
  accountDirectorOutput,
  copywriterOutput,
  visualDirectorOutput,
  editorOutput,
  channelAdapterOutput,
  brandComplianceOutput,
}: {
  brandKernel: BrandKernel;
  agencyRequest: AgencyRequest;
  accountDirectorOutput: AccountDirectorOutput;
  copywriterOutput: CopywriterOutput;
  visualDirectorOutput?: VisualDirectorOutput;
  editorOutput: EditorOutput;
  channelAdapterOutput?: ChannelAdapterOutput;
  brandComplianceOutput?: BrandComplianceOutput;
}): AgencyPromptPack {
  assertBrandKernel(brandKernel);
  assertAgencyRequest(agencyRequest);
  assertAccountDirectorOutput(accountDirectorOutput);
  assertCopywriterOutput(copywriterOutput);
  assertEditorOutput(editorOutput);

  return makePromptPack({
    agent: 'approver',
    mission: 'Funcionar como gate final antes de aprovacao humana.',
    rules: [
      'Checar coerencia estrategica, verbal, visual, audiencia, canal, restricoes e risco.',
      'Pedir revisao ou rejeitar se houver violacao da Brand Memory.',
      'Nao aprovar conteudo com claims sem sustentacao.',
      'Checar se a adaptacao por canal preserva a mensagem central, CTA, restricoes e formato solicitado.',
      'Considerar brandComplianceOutput como auditoria de aderencia a marca, sem terceirizar a decisao final.',
      'Se brand_compliance falhar em claims, tom ou posicionamento, nao aprovar sem justificativa explicita.',
      'Se houver violacao high severity, a decisao recomendada e revision_requested ou rejected.',
      'Decidir entre approved, revision_requested ou rejected.',
      'Incluir quality_metadata para registrar confiança, lacunas de evidência, hipóteses e riscos da decisão.',
      'Incluir quality_assessment final: approved geralmente acceptable, revision_requested geralmente needs_revision ou risky, rejected deve ser rejected.',
    ],
    payload: { brandKernel, agencyRequest, accountDirectorOutput, copywriterOutput, channelAdapterOutput, visualDirectorOutput, editorOutput, brandComplianceOutput },
    expectedOutputSchema: {
      required: ['decisao', 'checklist', 'ajustes_obrigatorios', 'justificativa'],
      properties: { quality_metadata: qualityMetadataSchema(), quality_assessment: qualityAssessmentSchema() },
    },
  });
}

export function buildBrandCompliancePromptPack({
  brandKernel,
  agencyRequest,
  approvedBriefing,
  accountDirectorOutput,
  copywriterOutput,
  channelAdapterOutput,
  visualDirectorOutput,
  editorOutput,
}: {
  brandKernel: BrandKernel;
  agencyRequest: AgencyRequest;
  approvedBriefing?: AccountDirectorOutput;
  accountDirectorOutput: AccountDirectorOutput;
  copywriterOutput: CopywriterOutput;
  channelAdapterOutput?: ChannelAdapterOutput;
  visualDirectorOutput?: VisualDirectorOutput;
  editorOutput: EditorOutput;
}): AgencyPromptPack {
  assertBrandKernel(brandKernel);
  assertAgencyRequest(agencyRequest);
  assertAccountDirectorOutput(accountDirectorOutput);
  assertCopywriterOutput(copywriterOutput);
  assertEditorOutput(editorOutput);

  return makePromptPack({
    agent: 'brand_compliance',
    mission: 'Auditar aderencia da peca a Brand Memory antes do aprovador final.',
    rules: [
      'Ser rigoroso na aderencia a Brand Memory. Nao avaliar apenas se a peca esta bonita ou bem escrita.',
      'Checar estrategia, plataforma de branding, posicionamento, publico/cluster, plano de comunicacao, tom de voz e canal.',
      ...buildArchetypeGuidance(brandKernel, 'compliance'),
      'Identificar violacoes de tom de voz, palavras proibidas e claims sem prova.',
      'Checar diretrizes visuais, restricoes, forbiddenClaims, proofPoints e channelGuidelines.',
      'Checar strategicTensions: nao permitir que a peca resolva ou ignore tensoes abertas sem autorizacao humana.',
      'Checar executionalReadiness quando existir: sinalizar desalinhamento entre promessa externa e capacidade interna.',
      'Nao aprovar publicacao final. A decisao final continua no approver.',
      'Nao alterar Brand Memory, nao criar nova estrategia e nao inventar dados ausentes.',
      'Se houver duvida, marcar warning e pedir revisao humana.',
    ],
    payload: {
      brandKernel,
      agencyRequest,
      approvedBriefing,
      accountDirectorOutput,
      copywriterOutput,
      channelAdapterOutput,
      visualDirectorOutput,
      editorOutput,
    },
    expectedOutputSchema: BRAND_COMPLIANCE_OUTPUT_SCHEMA,
  });
}

export const BRAND_COMPLIANCE_OUTPUT_SCHEMA = {
  type: 'object',
  required: [
    'decision',
    'overall_brand_alignment_score',
    'checklist',
    'violations',
    'required_adjustments',
    'optional_improvements',
    'brand_memory_slices_checked',
    'warnings',
  ],
  properties: {
    decision: { type: 'string', enum: ['pass', 'warning', 'fail'] },
    overall_brand_alignment_score: { type: 'number', minimum: 0, maximum: 100 },
    checklist: {
      type: 'array',
      items: {
        type: 'object',
        required: ['criterion', 'status', 'observation'],
        properties: {
          criterion: {
            type: 'string',
            enum: [
              'strategy',
              'positioning',
              'audience',
              'archetype',
              'voice',
              'forbidden_words',
              'visual_identity',
              'communication_plan',
              'claims',
              'channel_fit',
              'strategic_tensions',
              'executional_readiness',
            ],
          },
          status: { type: 'string', enum: ['pass', 'warning', 'fail'] },
          observation: { type: 'string' },
          required_adjustment: { type: 'string' },
        },
      },
    },
    violations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'description', 'severity', 'suggested_fix'],
        properties: {
          type: { type: 'string' },
          description: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          related_brand_memory_slice: { type: 'string' },
          suggested_fix: { type: 'string' },
        },
      },
    },
    required_adjustments: { type: 'array', items: { type: 'string' } },
    optional_improvements: { type: 'array', items: { type: 'string' } },
    brand_memory_slices_checked: { type: 'array', items: { type: 'string' } },
    warnings: { type: 'array', items: { type: 'string' } },
  },
} as const satisfies Record<string, unknown>;

export const CHANNEL_ADAPTER_OUTPUT_SCHEMA = {
  type: 'object',
  required: [
    'channel',
    'request_type',
    'adapted_content',
    'channel_specific_notes',
    'formatting_rules_applied',
    'cta',
    'warnings',
  ],
  properties: {
    channel: { type: 'string' },
    request_type: { type: 'string' },
    adapted_content: {
      type: 'object',
      required: ['body'],
      properties: {
        headline: { type: 'string' },
        body: { type: 'string' },
        caption: { type: 'string' },
        subject_line: { type: 'string' },
        preview_text: { type: 'string' },
        script: { type: 'string' },
        slide_sequence: {
          type: 'array',
          items: {
            type: 'object',
            required: ['slide_number', 'text'],
            properties: {
              slide_number: { type: 'number' },
              title: { type: 'string' },
              text: { type: 'string' },
              visual_note: { type: 'string' },
            },
          },
        },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            required: ['section_title', 'content'],
            properties: {
              section_title: { type: 'string' },
              content: { type: 'string' },
              cta: { type: 'string' },
            },
          },
        },
      },
    },
    channel_specific_notes: { type: 'array', items: { type: 'string' } },
    formatting_rules_applied: { type: 'array', items: { type: 'string' } },
    cta: { type: 'string' },
    hashtags: { type: 'array', items: { type: 'string' } },
    utm_suggestion: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
  },
} as const satisfies Record<string, unknown>;

export function assertAccountDirectorOutput(
  output: Partial<AccountDirectorOutput> | null | undefined
): asserts output is AccountDirectorOutput {
  if (!output?.briefing_operacional || !output?.hipotese_criativa) {
    throw new Error('AccountDirectorOutput invalido: briefing_operacional e hipotese_criativa sao obrigatorios.');
  }
}

function assertCopywriterOutput(
  output: Partial<CopywriterOutput> | null | undefined
): asserts output is CopywriterOutput {
  if (!output?.copy_principal || !output?.cta) {
    throw new Error('CopywriterOutput invalido: copy_principal e cta sao obrigatorios.');
  }
}

function assertVisualDirectorOutput(
  output: Partial<VisualDirectorOutput> | null | undefined
): asserts output is VisualDirectorOutput {
  if (!output?.direcao_de_arte || !output?.composicao) {
    throw new Error('VisualDirectorOutput invalido: direcao_de_arte e composicao sao obrigatorios.');
  }
}

function assertEditorOutput(
  output: Partial<EditorOutput> | null | undefined
): asserts output is EditorOutput {
  if (!output?.versao_editada || typeof output.score_aderencia !== 'number') {
    throw new Error('EditorOutput invalido: versao_editada e score_aderencia sao obrigatorios.');
  }
}

function makePromptPack({
  agent,
  mission,
  rules,
  payload,
  expectedOutputSchema,
}: {
  agent: AgencyAgentId;
  mission: string;
  rules: string[];
  payload: Record<string, unknown>;
  expectedOutputSchema: unknown;
}): AgencyPromptPack {
  return {
    agentId: agent,
    promptVersion: PROMPT_VERSION_BY_AGENT[agent as keyof typeof PROMPT_VERSION_BY_AGENT],
    systemPrompt: [
      `Voce e o agente ${agent} da Agencia IA da Espansione.`,
      mission,
      'Use a Brand Memory como fonte canonica.',
      'Responda apenas no schema esperado.',
    ].join('\n'),
    userPrompt: [
      'INPUT_ESTRUTURADO',
      JSON.stringify(payload, null, 2),
      '',
      'REGRAS',
      ...rules.map((rule) => `- ${rule}`),
    ].join('\n'),
    expectedOutputSchema,
  };
}

function buildArchetypeGuidance(brandKernel: BrandKernel, focus: ArchetypeGuidanceFocus): string[] {
  const archetypeKey = normalizeArchetypeKey(brandKernel.strategy?.archetype);
  const archetypeName = formatArchetypeName(brandKernel.strategy?.archetype);
  if (!archetypeKey || !archetypeName) {
    return ['Se o arquétipo da marca estiver ausente ou ambíguo, registrar warning e priorizar positioning, atributos e voz proprietária.'];
  }

  const guidance = ARCHETYPE_GUIDANCE[archetypeKey];
  const verbalSignals = guidance?.verbal?.join(', ');
  const visualSignals = guidance?.visual?.join(', ');
  const avoidSignals = guidance?.avoid?.join(', ');

  if (focus === 'verbal') {
    return [
      `Arquétipo dominante da marca: ${archetypeName}. A copy deve soar compatível com esse arquétipo, sem citar o nome do arquétipo na peça final.`,
      verbalSignals ? `Sinais verbais esperados para ${archetypeName}: ${verbalSignals}.` : `Usar o arquétipo ${archetypeName} como filtro de tom, enquadramento e CTA.`,
      avoidSignals ? `Evitar sinais que deturpem o lado sombra de ${archetypeName}: ${avoidSignals}.` : `Evitar sinais que contradigam o arquétipo ${archetypeName}.`,
    ];
  }

  if (focus === 'channel') {
    return [
      `Preservar o arquétipo ${archetypeName} mesmo ao adaptar para o canal; mudar formato e cadência, não a identidade arquetípica.`,
      verbalSignals ? `Ao adaptar para o canal, manter estes sinais centrais de ${archetypeName}: ${verbalSignals}.` : `Manter o enquadramento compatível com ${archetypeName}.`,
      avoidSignals ? `Nao deixar o canal empurrar a marca para sinais contrários ao arquétipo ${archetypeName}: ${avoidSignals}.` : `Evitar desvio arquetípico provocado por clichês do canal.`,
    ];
  }

  if (focus === 'visual') {
    return [
      `Traduzir o arquétipo ${archetypeName} em direção de arte, composição, clima, ritmo e escolha de assets, sem caricatura literal.`,
      visualSignals ? `Sinais visuais esperados para ${archetypeName}: ${visualSignals}.` : `Usar o arquétipo ${archetypeName} como filtro de linguagem visual.`,
      avoidSignals ? `Evitar interpretações visuais que ativem a sombra de ${archetypeName}: ${avoidSignals}.` : `Evitar leitura visual incoerente com ${archetypeName}.`,
    ];
  }

  return [
    `Checar aderência arquetípica explicitamente: a peça deve reforçar ${archetypeName} em linguagem, enquadramento e, quando existir, direção visual.`,
    `Adicionar um item de checklist sobre arquétipo e registrar violação quando a peça puxar para outro arquétipo dominante incompatível.`,
    avoidSignals ? `Tratar como warning ou fail sinais de sombra de ${archetypeName}: ${avoidSignals}.` : 'Tratar como warning sinais de desvio arquetípico.',
  ];
}

function normalizeArchetypeKey(value: string | null | undefined): string | null {
  if (!value) return null;
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^o\s+/, '')
    .replace(/^a\s+/, '')
    .trim();
}

function formatArchetypeName(value: string | null | undefined): string | null {
  const raw = String(value || '').trim();
  return raw || null;
}

function qualityMetadataSchema() {
  return {
    type: 'object',
    properties: {
      confidence_score: { type: 'number', minimum: 0, maximum: 100 },
      evidence_strength: { type: 'string', enum: ['strong', 'medium', 'weak', 'unknown'] },
      evidence_gaps: { type: 'array', items: { type: 'string' } },
      assumptions: { type: 'array', items: { type: 'string' } },
      contradictions: { type: 'array', items: { type: 'string' } },
      needs_human_attention: { type: 'boolean' },
      risk_summary: { type: 'string' },
      source_coverage: { type: 'object' },
    },
  };
}

function qualityAssessmentSchema() {
  return {
    type: 'object',
    required: ['quality_status', 'quality_issues'],
    properties: {
      quality_status: { type: 'string', enum: ['not_reviewed', 'acceptable', 'needs_revision', 'rejected', 'risky'] },
      quality_score: { type: 'number', minimum: 0, maximum: 100 },
      quality_issues: { type: 'array', items: { type: 'string' } },
      strategic_alignment_score: { type: 'number', minimum: 0, maximum: 100 },
      voice_alignment_score: { type: 'number', minimum: 0, maximum: 100 },
      visual_alignment_score: { type: 'number', minimum: 0, maximum: 100 },
      evidence_risk_score: { type: 'number', minimum: 0, maximum: 100 },
      review_reason: { type: 'string' },
      assessed_by: { type: 'string', enum: ['agent', 'human', 'system'] },
      assessed_at: { type: 'string' },
    },
  };
}

function assertBrandKernel(brandKernel: BrandKernel | null | undefined): asserts brandKernel is BrandKernel {
  if (!brandKernel?.brand?.name || !brandKernel.strategy || !brandKernel.audience) {
    throw new Error('brandKernel obrigatorio para montar prompt pack do account_director.');
  }
}

function assertAgencyRequest(
  agencyRequest: AgencyRequest | null | undefined
): asserts agencyRequest is AgencyRequest {
  if (
    !agencyRequest?.brandId ||
    !agencyRequest.requestType ||
    !agencyRequest.channel ||
    !agencyRequest.objective ||
    !agencyRequest.context
  ) {
    throw new Error('agencyRequest incompleto para montar prompt pack do account_director.');
  }
}
