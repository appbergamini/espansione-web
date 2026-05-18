import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAccountDirectorPromptPack,
  buildApproverPromptPack,
  buildCopywriterPromptPack,
  buildEditorPromptPack,
  buildVisualDirectorPromptPack,
  ACCOUNT_DIRECTOR_PROMPT_VERSION,
  COPYWRITER_PROMPT_VERSION,
  VISUAL_DIRECTOR_PROMPT_VERSION,
  EDITOR_PROMPT_VERSION,
  APPROVER_PROMPT_VERSION,
} from '../prompt-packs.ts';
import type {
  AccountDirectorOutput,
  AgencyRequest,
  BrandKernel,
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

test('todos os prompt packs sao gerados com input minimo valido', () => {
  const account = buildAccountDirectorPromptPack({ brandKernel, agencyRequest });
  const copy = buildCopywriterPromptPack({ brandKernel, agencyRequest, accountDirectorOutput });
  const visual = buildVisualDirectorPromptPack({ brandKernel, agencyRequest, accountDirectorOutput });
  const editor = buildEditorPromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput,
    copywriterOutput,
    visualDirectorOutput,
  });
  const approver = buildApproverPromptPack({
    brandKernel,
    agencyRequest,
    accountDirectorOutput,
    copywriterOutput,
    visualDirectorOutput,
    editorOutput,
  });

  for (const pack of [account, copy, visual, editor, approver]) {
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
  assert.match(account.userPrompt, /Escala versus profundidade/);
  assert.equal(copy.promptVersion, COPYWRITER_PROMPT_VERSION);
  assert.equal(visual.promptVersion, VISUAL_DIRECTOR_PROMPT_VERSION);
  assert.match(visual.userPrompt, /operationalGuidelines/);
  assert.match(visual.userPrompt, /Nao poluir/);
  assert.match(visual.userPrompt, /Visual identity operacional incompleta/);
  assert.equal(editor.promptVersion, EDITOR_PROMPT_VERSION);
  assert.equal(approver.promptVersion, APPROVER_PROMPT_VERSION);
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

test('editor exige copywriterOutput e visualDirectorOutput', () => {
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

  assert.throws(
    () => buildEditorPromptPack({
      brandKernel,
      agencyRequest,
      accountDirectorOutput,
      copywriterOutput,
      visualDirectorOutput: null as any,
    }),
    /VisualDirectorOutput invalido/
  );
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
