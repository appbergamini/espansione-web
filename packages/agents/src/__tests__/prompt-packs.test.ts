import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAccountDirectorPromptPack,
  buildApproverPromptPack,
  buildBrandCompliancePromptPack,
  buildChannelAdapterPromptPack,
  buildCopywriterPromptPack,
  buildEditorPromptPack,
  buildVisualDirectorPromptPack,
  ACCOUNT_DIRECTOR_PROMPT_VERSION,
  CHANNEL_ADAPTER_PROMPT_VERSION,
  COPYWRITER_PROMPT_VERSION,
  VISUAL_DIRECTOR_PROMPT_VERSION,
  EDITOR_PROMPT_VERSION,
  APPROVER_PROMPT_VERSION,
  BRAND_COMPLIANCE_PROMPT_VERSION,
} from '../prompt-packs.ts';
import type {
  AccountDirectorOutput,
  AgencyRequest,
  BrandKernel,
  BrandComplianceOutput,
  ChannelAdapterOutput,
  CopywriterOutput,
  EditorOutput,
  VisualDirectorOutput,
} from '@espansione/types';

const brandKernel: BrandKernel = {
  brand: { name: 'Marca Teste', slug: 'marca-teste', industry: 'Servicos' },
  strategy: {
    purpose: 'Ajudar clientes a crescer com clareza.',
    archetype: 'Sábio',
    positioning: 'Especialista em crescimento claro.',
    tagline: 'Crescer com clareza',
    directives: ['Focar em clareza'],
    dePara: ['comunicacao: sair de generico para proprietario'],
    values: ['Clareza'],
    attributes: ['Especialista'],
    executionalReadiness: {
      summary: 'Time sustenta mudança com rituais claros.',
      leadership_style_signals: ['Liderança técnica'],
      cultural_blockers: ['Baixa cadência'],
      adoption_risks: ['Prometer mais do que entrega'],
      internal_alignment_level: 'medium',
      decision_profile_signals: ['Decisão centralizada'],
      behavioral_signals: ['CIS parcial'],
      capability_gaps: ['Governança'],
      implications_for_strategy: ['Criar rituais'],
      implications_for_communication: ['Evitar promessa de velocidade'],
      recommended_change_management_notes: ['Alinhar critérios semanalmente'],
      confidence_score: 70,
      source_basis: { forms: true, interviews: true, cis: true },
    },
    adoptionRisks: ['Prometer mais do que entrega'],
    changeManagementNotes: ['Alinhar critérios semanalmente'],
  },
  internal: {
    executionalReadiness: {
      summary: 'Time sustenta mudança com rituais claros.',
      leadership_style_signals: ['Liderança técnica'],
      cultural_blockers: ['Baixa cadência'],
      adoption_risks: ['Prometer mais do que entrega'],
      internal_alignment_level: 'medium',
      decision_profile_signals: ['Decisão centralizada'],
      behavioral_signals: ['CIS parcial'],
      capability_gaps: ['Governança'],
      implications_for_strategy: ['Criar rituais'],
      implications_for_communication: ['Evitar promessa de velocidade'],
      recommended_change_management_notes: ['Alinhar critérios semanalmente'],
      confidence_score: 70,
      source_basis: { forms: true, interviews: true, cis: true },
    },
    adoptionRisks: ['Prometer mais do que entrega'],
    culturalBlockers: ['Baixa cadência'],
    capabilityGaps: ['Governança'],
    internalAlignmentLevel: 'medium',
    changeManagementNotes: ['Alinhar critérios semanalmente'],
  },
  audience: {
    personas: ['Diretor de marketing'],
    clusters: ['PMEs em crescimento'],
    journeyStages: ['conhecimento: descobrir'],
    brandMoments: ['kickoff: alinhar promessa'],
  },
  voice: {
    tones: ['Claro: direto'],
    territories: ['Crescimento: clareza, metodo'],
    forbiddenWords: ['milagre: promessa sem prova'],
    naming: [],
  },
  visual: {
    keep: ['Simplicidade'],
    lose: ['Excesso visual'],
    gain: ['Mais contraste'],
    colors: ['Azul (#00326D): primary'],
    typography: ['Titulos: forte'],
    photography: 'Pessoas reais',
    behavior: 'Organizado',
    symbol: 'Simbolo simples',
    operationalGuidelines: {
      visual_principles: ['Clareza visual'],
      maintain: ['Simplicidade'],
      lose: ['Excesso visual'],
      gain: ['Mais contraste'],
      color_direction: { primary: ['Azul'], avoid: ['Neon'] },
      typography_direction: { recommended_style: 'Sans editorial', avoid: ['Infantil'] },
      image_style: { photography: ['Pessoas reais'], iconography: ['Linha fina'], avoid: ['Banco genérico'] },
      layout_behavior: { composition: ['Grid limpo'], density: 'Baixa' },
      symbol_logo_guidance: ['Assinatura discreta'],
      dos: ['Usar contraste'],
      donts: ['Nao poluir'],
      visual_risks: ['Parecer genérico'],
      prompt_guidelines: ['Gerar imagem conceitual sem texto'],
    },
    visualPrinciples: ['Clareza visual'],
    dos: ['Usar contraste'],
    donts: ['Nao poluir'],
    visualRisks: ['Parecer genérico'],
    promptGuidelines: ['Gerar imagem conceitual sem texto'],
    operationalWarnings: [],
  },
  communication: {
    waves: ['Onda 1: produto'],
    channels: ['linkedin'],
    differentials: ['Metodo proprio: evidencia'],
    proprietaryAsset: 'Metodo Teste',
    risk: 'Prometer demais',
  },
  constraints: ['Evitar promessa sem prova'],
  proofPoints: ['Case real'],
  forbiddenClaims: ['resultado garantido'],
  preferredCTAs: ['Agendar conversa'],
  channelGuidelines: ['linkedin: autoridade'],
  strategicTensions: [
    {
      title: 'Escala versus profundidade',
      theme: 'Modelo de entrega',
      tension_summary: 'VI quer escala; VE valoriza profundidade.',
      strategic_choice_needed: 'Definir promessa de campanha sem resolver a tensão.',
      risk_if_ignored: 'A campanha pode prometer velocidade sem sustentação operacional.',
      impact_on_communication: 'Evitar claims de agilidade absoluta.',
      status: 'open',
    },
  ],
  unresolvedStrategicTensions: [
    {
      title: 'Escala versus profundidade',
      theme: 'Modelo de entrega',
      tension_summary: 'VI quer escala; VE valoriza profundidade.',
      strategic_choice_needed: 'Definir promessa de campanha sem resolver a tensão.',
      risk_if_ignored: 'A campanha pode prometer velocidade sem sustentação operacional.',
      impact_on_communication: 'Evitar claims de agilidade absoluta.',
      status: 'open',
    },
  ],
  communicationRisksFromTensions: ['Modelo de entrega: Evitar claims de agilidade absoluta.'],
  checkpointContext: [],
  source: { schemaVersion: '2.0', agentsPresent: [6, 9, 12, 13], generatedFrom: 'espansione_diagnostic' },
};

const agencyRequest: AgencyRequest = {
  brandId: 'brand-1',
  requestType: 'social_post',
  channel: 'linkedin',
  objective: 'authority',
  context: 'Precisamos falar sobre o metodo da marca.',
  desiredCta: 'Agendar conversa',
};

const accountDirectorOutput: AccountDirectorOutput = {
  briefing_operacional: {
    objetivo: 'Autoridade',
    publico: 'Diretores',
    contexto: 'Contexto',
    insight: 'Insight',
    promessa: 'Clareza',
    mensagem_central: 'Mensagem',
    tom_recomendado: 'Claro',
    canal: 'linkedin',
    formato: 'social_post',
    criterio_de_sucesso: ['clareza'],
  },
  hipotese_criativa: { conceito: 'Conceito', angulo: 'Angulo', narrativa: 'Narrativa' },
  criterios_de_sucesso: ['clareza'],
  brand_memory_slices_used: ['plataforma_branding'],
  warnings: [],
};

const copywriterOutput: CopywriterOutput = {
  copy_principal: 'Texto principal',
  variacoes: ['V1'],
  cta: 'Agendar conversa',
  racional_de_tom: 'Tom claro',
  claims_utilizados: ['Metodo proprio'],
  claims_evitar: ['resultado garantido'],
  warnings: [],
};

const channelAdapterOutput: ChannelAdapterOutput = {
  channel: 'linkedin',
  request_type: 'social_post',
  adapted_content: {
    headline: 'Texto adaptado',
    body: 'Texto principal adaptado para LinkedIn.',
    caption: 'Legenda adaptada',
  },
  channel_specific_notes: ['LinkedIn pede abertura forte e parágrafos curtos.'],
  formatting_rules_applied: ['Parágrafos curtos', 'CTA claro'],
  cta: 'Agendar conversa',
  warnings: [],
};

const visualDirectorOutput: VisualDirectorOutput = {
  direcao_de_arte: 'Visual limpo',
  regras_visuais: ['Usar azul'],
  assets_necessarios: ['Foto real'],
  composicao: 'Headline + prova',
  estilo_imagem: 'Editorial',
  restricoes_visuais: ['Sem excesso'],
  warnings: [],
};

const editorOutput: EditorOutput = {
  versao_editada: 'Texto editado',
  ajustes_recomendados: ['Cortar promessa'],
  riscos_de_incoerencia: ['Claim sem prova'],
  score_aderencia: 88,
  observacoes: ['Bom ajuste'],
};

const brandComplianceOutput: BrandComplianceOutput = {
  decision: 'fail',
  overall_brand_alignment_score: 42,
  checklist: [
    { criterion: 'claims', status: 'fail', observation: 'Claim sem prova.', required_adjustment: 'Remover claim.' },
    { criterion: 'voice', status: 'warning', observation: 'Tom acima do permitido.' },
  ],
  violations: [{
    type: 'claim_without_proof',
    description: 'Promessa forte sem evidência sustentada.',
    severity: 'high',
    related_brand_memory_slice: 'plataforma_branding',
    suggested_fix: 'Suavizar promessa ou anexar prova.',
  }],
  required_adjustments: ['Remover claim sem prova.'],
  optional_improvements: ['Aproximar CTA dos CTAs preferidos.'],
  brand_memory_slices_checked: ['plataforma_branding', 'voice_profile', 'visual_identity'],
  warnings: ['Exige revisão humana.'],
};

test('todos os prompt packs sao gerados com input minimo valido', () => {
  const account = buildAccountDirectorPromptPack({ brandKernel, agencyRequest });
  const copy = buildCopywriterPromptPack({ brandKernel, agencyRequest, accountDirectorOutput });
  const channel = buildChannelAdapterPromptPack({ brandKernel, agencyRequest, accountDirectorOutput, copywriterOutput });
  const visual = buildVisualDirectorPromptPack({ brandKernel, agencyRequest, accountDirectorOutput, channelAdapterOutput });
  const editor = buildEditorPromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput,
    copywriterOutput,
    channelAdapterOutput,
    visualDirectorOutput,
  });
  const compliance = buildBrandCompliancePromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput,
    copywriterOutput,
    channelAdapterOutput,
    visualDirectorOutput,
    editorOutput,
  });
  const approver = buildApproverPromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput,
    copywriterOutput,
    channelAdapterOutput,
    visualDirectorOutput,
    editorOutput,
    brandComplianceOutput,
  });

  for (const pack of [account, copy, channel, visual, editor, compliance, approver]) {
    assert.equal(typeof pack.systemPrompt, 'string');
    assert.equal(typeof pack.userPrompt, 'string');
    assert.equal(typeof pack.promptVersion, 'string');
    assert.ok(pack.expectedOutputSchema);
    assert.match(pack.userPrompt, /Marca Teste/);
    assert.match(pack.userPrompt, /social_post/);
  }

  assert.equal(account.promptVersion, ACCOUNT_DIRECTOR_PROMPT_VERSION);
  assert.match(account.systemPrompt, /strategicTensions/);
  assert.match(account.systemPrompt, /nao resolva tensoes abertas/i);
  assert.match(account.systemPrompt, /executionalReadiness/);
  assert.match(account.userPrompt, /Escala versus profundidade/);
  assert.match(account.userPrompt, /Prometer mais do que entrega/);
  assert.equal(copy.promptVersion, COPYWRITER_PROMPT_VERSION);
  assert.match(copy.userPrompt, /Arquétipo dominante da marca: Sábio/i);
  assert.match(copy.userPrompt, /clareza intelectual/i);
  assert.equal(channel.promptVersion, CHANNEL_ADAPTER_PROMPT_VERSION);
  assert.match(channel.userPrompt, /copywriterOutput/);
  assert.match(channel.userPrompt, /LinkedIn/);
  assert.match(channel.userPrompt, /Preservar o arquétipo Sábio/i);
  assert.match(channel.userPrompt, /Não alterar Brand Memory|Nao alterar Brand Memory/i);
  assert.equal(visual.promptVersion, VISUAL_DIRECTOR_PROMPT_VERSION);
  assert.match(visual.userPrompt, /operationalGuidelines/);
  assert.match(visual.userPrompt, /Sinais visuais esperados para Sábio/i);
  assert.match(visual.userPrompt, /Nao poluir/);
  assert.match(visual.userPrompt, /Visual identity operacional incompleta/);
  assert.equal(editor.promptVersion, EDITOR_PROMPT_VERSION);
  assert.equal(compliance.promptVersion, BRAND_COMPLIANCE_PROMPT_VERSION);
  assert.match(compliance.userPrompt, /editorOutput/);
  assert.match(compliance.userPrompt, /Checar aderência arquetípica explicitamente|Checar aderencia arquetipica explicitamente/i);
  assert.match(JSON.stringify(compliance.expectedOutputSchema), /archetype/);
  assert.match(compliance.userPrompt, /strategicTensions/);
  assert.match(compliance.userPrompt, /executionalReadiness/);
  assert.equal(approver.promptVersion, APPROVER_PROMPT_VERSION);
  assert.match(approver.userPrompt, /brandComplianceOutput/);
  assert.match(approver.userPrompt, /claim_without_proof/);
});

test('erro quando falta input obrigatorio', () => {
  assert.throws(
    () => buildAccountDirectorPromptPack({ brandKernel: null as any, agencyRequest }),
    /brandKernel obrigatorio/
  );
});

test('copywriter exige accountDirectorOutput', () => {
  assert.throws(
    () => buildCopywriterPromptPack({ brandKernel, agencyRequest, accountDirectorOutput: null as any }),
    /AccountDirectorOutput invalido/
  );
});

test('editor exige copywriterOutput e aceita visualDirectorOutput opcional', () => {
  assert.throws(
    () => buildEditorPromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput: null as any,
      visualDirectorOutput,
    }),
    /CopywriterOutput invalido/
  );

  const pack = buildEditorPromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput,
    copywriterOutput,
  });
  assert.match(pack.userPrompt, /visualDirectorOutput nao existir/);
});

test('channel_adapter exige copywriterOutput', () => {
  assert.throws(
    () => buildChannelAdapterPromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput: null as any,
    }),
    /CopywriterOutput invalido/
  );
});

test('channel_adapter inclui regras específicas por canal', () => {
  const emailPack = buildChannelAdapterPromptPack({
    brandKernel,
    agencyRequest: { ...agencyRequest, channel: 'email', requestType: 'email' },
    accountDirectorOutput,
    copywriterOutput,
  });
  const websitePack = buildChannelAdapterPromptPack({
    brandKernel,
    agencyRequest: { ...agencyRequest, channel: 'website', requestType: 'landing_page_copy' },
    accountDirectorOutput,
    copywriterOutput,
  });
  const instagramPack = buildChannelAdapterPromptPack({
    brandKernel,
    agencyRequest: { ...agencyRequest, channel: 'instagram' },
    accountDirectorOutput,
    copywriterOutput,
  });

  assert.match(JSON.stringify(emailPack.expectedOutputSchema), /subject_line/);
  assert.match(JSON.stringify(emailPack.expectedOutputSchema), /preview_text/);
  assert.match(JSON.stringify(websitePack.expectedOutputSchema), /sections/);
  assert.match(JSON.stringify(instagramPack.expectedOutputSchema), /caption/);
  assert.match(JSON.stringify(instagramPack.expectedOutputSchema), /hashtags/);
  assert.match(emailPack.userPrompt, /Email:/);
  assert.match(websitePack.userPrompt, /Website:/);
  assert.match(instagramPack.userPrompt, /Instagram:/);
});

test('brand_compliance exige BrandKernel e editorOutput', () => {
  assert.throws(
    () => buildBrandCompliancePromptPack({
      brandKernel: null as any,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      channelAdapterOutput,
      visualDirectorOutput,
      editorOutput,
    }),
    /brandKernel obrigatorio/
  );

  assert.throws(
    () => buildBrandCompliancePromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      channelAdapterOutput,
      visualDirectorOutput,
      editorOutput: null as any,
    }),
    /EditorOutput invalido/
  );
});

test('approver recebe brandComplianceOutput e considera violacao high severity', () => {
  const approver = buildApproverPromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput,
    copywriterOutput,
    channelAdapterOutput,
    visualDirectorOutput,
    editorOutput,
    brandComplianceOutput,
  });

  assert.match(approver.userPrompt, /brandComplianceOutput/);
  assert.match(approver.userPrompt, /severity": "high"|severity.*high/s);
  assert.match(approver.userPrompt, /revision_requested ou rejected/i);
});

test('approver exige editorOutput', () => {
  assert.throws(
    () => buildApproverPromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      visualDirectorOutput,
      editorOutput: null as any,
    }),
    /EditorOutput invalido/
  );
});
