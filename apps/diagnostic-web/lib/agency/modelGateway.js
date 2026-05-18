import { AIRouter } from '../ai/router.js';

const DEFAULT_AGENCY_MODEL_KEY = 'gemini-flash';

export function getAgencyModelGateway() {
  const mode = process.env.AGENCY_MODEL_GATEWAY || (process.env.NODE_ENV === 'production' ? 'real' : 'mock');
  if (mode === 'mock') return new MockModelGateway();
  return new AIRouterModelGateway({
    modelKey: process.env.AGENCY_MODEL_KEY || DEFAULT_AGENCY_MODEL_KEY,
  });
}

export class AIRouterModelGateway {
  constructor({ modelKey = DEFAULT_AGENCY_MODEL_KEY } = {}) {
    this.modelKey = modelKey;
  }

  async generateStructuredOutput({ agentId, promptPack }) {
    if (!agentId || !promptPack?.systemPrompt || !promptPack?.userPrompt) {
      throw new Error('ModelGatewayInput incompleto para geração da Agência.');
    }

    const systemPrompt = [
      promptPack.systemPrompt,
      '',
      'CONTRATO DE SAIDA',
      '- Responda somente JSON valido, sem Markdown, sem crases e sem texto fora do JSON.',
      '- O JSON deve representar apenas o objeto data do agente atual.',
      '- Use strings vazias ou arrays vazios quando nao houver informacao suficiente.',
      '- Nao invente evidencias, numeros, provas ou claims.',
    ].join('\n');

    const userPrompt = [
      promptPack.userPrompt,
      '',
      'SCHEMA ESPERADO',
      JSON.stringify(promptPack.expectedOutputSchema, null, 2),
    ].join('\n');

    const result = await AIRouter.callModel(
      systemPrompt,
      [{ role: 'user', content: userPrompt }],
      {
        modelKey: this.modelKey,
        maxTokens: Number(process.env.AGENCY_MODEL_MAX_TOKENS || 6000),
        temperature: Number(process.env.AGENCY_MODEL_TEMPERATURE || 0.2),
      }
    );

    const data = parseJsonObject(result.text);
    return {
      agentId,
      data,
      warnings: collectWarnings(data),
      brandMemorySlicesUsed: extractSlices(promptPack),
      provider: inferProvider(result.model),
      model: result.model,
      promptVersion: promptPack.promptVersion,
      tokens: {
        input: result.tokensIn || 0,
        output: result.tokensOut || 0,
        total: (result.tokensIn || 0) + (result.tokensOut || 0),
      },
      estimatedCost: 0,
      temperature: Number(process.env.AGENCY_MODEL_TEMPERATURE || 0.2),
    };
  }
}

export class MockModelGateway {
  async generateStructuredOutput({ agentId, promptPack }) {
    const request = extractAgencyRequest(promptPack);
    const outputByAgent = {
      account_director: {
        briefing_operacional: {
          objetivo: 'Transformar o pedido em uma peça clara e coerente com a Brand Memory.',
          publico: 'Público definido no pedido ou cluster principal da Brand Memory.',
          contexto: 'Contexto sintetizado a partir do pedido estruturado.',
          insight: 'A marca precisa comunicar com clareza sem extrapolar provas disponíveis.',
          promessa: 'Promessa baseada na plataforma de marca.',
          mensagem_central: 'Mensagem central provisória para validação humana.',
          tom_recomendado: 'Claro, proprietário e consistente.',
          canal: request.channel || 'linkedin',
          formato: request.requestType || 'social_post',
          criterio_de_sucesso: ['Coerência com Brand Memory', 'CTA claro', 'Sem claims sem prova'],
        },
        hipotese_criativa: {
          conceito: 'Clareza que vira ação',
          angulo: 'Autoridade com prova',
          narrativa: 'Conectar diagnóstico, tensão do público e promessa da marca.',
        },
        criterios_de_sucesso: ['Coerência estratégica', 'Clareza de mensagem', 'Aderência ao canal'],
        brand_memory_slices_used: ['decodificacao', 'plataforma_branding', 'experiencia', 'plano_comunicacao'],
        warnings: ['Output mockado para validação de fluxo; ainda não é geração final de IA.'],
        quality_metadata: {
          confidence_score: 72,
          evidence_strength: 'medium',
          evidence_gaps: ['Validar provas antes de transformar briefing em peça final.'],
          assumptions: ['Pedido estruturado representa o objetivo real da demanda.'],
          contradictions: [],
          needs_human_attention: true,
          risk_summary: 'Briefing mockado exige revisão humana antes da criação.',
          source_coverage: { vi: true, ve: true, vm: true, forms: true, interviews: false, market_research: true },
        },
      },
      copywriter: {
        copy_principal: 'Texto mockado do copywriter para validar o fluxo da Agência IA.',
        variacoes: ['Variação A mockada', 'Variação B mockada'],
        headline: 'Headline mockada',
        legenda: 'Legenda mockada',
        cta: request.desiredCta || 'Agendar conversa',
        racional_de_tom: 'Tom claro e consistente com a Brand Memory.',
        claims_utilizados: [],
        claims_evitar: ['Resultados garantidos sem prova'],
        warnings: ['Substituir por geração real quando o gateway seguro for ativado.'],
      },
      visual_director: {
        direcao_de_arte: 'Direção visual mockada baseada no BrandKernel.',
        regras_visuais: ['Usar contraste', 'Evitar excesso visual'],
        assets_necessarios: ['Imagem principal', 'Variação para social'],
        composicao: 'Headline, prova e CTA em hierarquia simples.',
        estilo_imagem: 'Editorial limpo',
        cores: [],
        tipografia: 'Seguir tipografia direcional da Brand Memory',
        restricoes_visuais: ['Não usar caminhos marcados como perder'],
        prompt_visual_opcional: 'Mock: gerar imagem alinhada à identidade visual.',
        warnings: ['Direção visual mockada; não é arte final.'],
      },
      editor: {
        versao_editada: 'Versão editada mockada, pronta para aprovação de marca.',
        ajustes_recomendados: ['Confirmar prova antes de publicar'],
        riscos_de_incoerencia: ['Claim sem sustentação se números forem adicionados depois'],
        score_aderencia: 82,
        observacoes: ['Fluxo validado com mock.'],
        quality_metadata: {
          confidence_score: 80,
          evidence_strength: 'medium',
          evidence_gaps: ['Não há peça real para revisão editorial completa.'],
          assumptions: ['A copy mockada será substituída por geração real.'],
          contradictions: [],
          needs_human_attention: true,
          risk_summary: 'Não publicar conteúdo mockado.',
        },
        quality_assessment: {
          quality_status: 'risky',
          quality_score: 45,
          quality_issues: ['Conteúdo mockado não pode ser tratado como peça final.', 'Confirmar prova antes de publicar.'],
          strategic_alignment_score: 82,
          evidence_risk_score: 80,
          review_reason: 'Editor identificou risco de publicação sem prova e sem geração real.',
          assessed_by: 'agent',
        },
      },
      approver: {
        decisao: 'revision_requested',
        checklist: [
          { criterio: 'Coerência estratégica', status: 'pass', observacao: 'Base aderente à Brand Memory.' },
          { criterio: 'Claims com prova', status: 'warning', observacao: 'Confirmar evidências antes da publicação.' },
        ],
        ajustes_obrigatorios: ['Substituir outputs mockados por geração real antes de publicar.'],
        risco_principal: 'Publicar peça mockada como se fosse final.',
        justificativa: 'Fluxo técnico aprovado, conteúdo final ainda depende de execução real e revisão humana.',
        quality_metadata: {
          confidence_score: 76,
          evidence_strength: 'medium',
          evidence_gaps: ['Faltam evidências finais da peça real.'],
          assumptions: ['A revisão humana ocorrerá antes de uso externo.'],
          contradictions: [],
          needs_human_attention: true,
          risk_summary: 'Publicação automática ou sem revisão humana seria inadequada.',
        },
        quality_assessment: {
          quality_status: 'risky',
          quality_score: 40,
          quality_issues: ['Substituir outputs mockados por geração real antes de publicar.', 'Confirmar evidências antes da publicação.'],
          strategic_alignment_score: 76,
          evidence_risk_score: 85,
          review_reason: 'Fluxo técnico aprovado, mas o material ainda não é publicável.',
          assessed_by: 'agent',
        },
      },
    };

    return {
      agentId,
      data: outputByAgent[agentId],
      warnings: [`MockModelGateway usado para ${agentId}.`],
      brandMemorySlicesUsed: extractSlices(promptPack),
      provider: 'mock',
      model: 'mock',
      promptVersion: promptPack?.promptVersion,
      tokens: { input: 0, output: 0, total: 0 },
      estimatedCost: 0,
      temperature: 0,
    };
  }
}

function parseJsonObject(text = '') {
  const cleaned = String(text)
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const slice = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(slice);
    } catch {}
  }

  throw new Error('Modelo retornou resposta que não é JSON válido.');
}

function collectWarnings(data) {
  return Array.isArray(data?.warnings) ? data.warnings : [];
}

function extractSlices(promptPack) {
  const text = `${promptPack.systemPrompt}\n${promptPack.userPrompt}`;
  return ['decodificacao', 'plataforma_branding', 'experiencia', 'plano_comunicacao']
    .filter((slice) => text.includes(slice));
}

function extractAgencyRequest(promptPack) {
  const text = promptPack?.userPrompt || '';
  const channel = text.match(/"channel":\s*"([^"]+)"/)?.[1];
  const requestType = text.match(/"requestType":\s*"([^"]+)"/)?.[1];
  const desiredCta = text.match(/"desiredCta":\s*"([^"]+)"/)?.[1];
  return { channel, requestType, desiredCta };
}

function inferProvider(model = '') {
  const value = String(model || '').toLowerCase();
  if (value.includes('gemini')) return 'google';
  if (value.includes('gpt') || value.includes('openai')) return 'openai';
  return 'unknown';
}
