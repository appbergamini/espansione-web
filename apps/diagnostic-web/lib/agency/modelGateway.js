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
      },
    };

    return {
      agentId,
      data: outputByAgent[agentId],
      warnings: [`MockModelGateway usado para ${agentId}.`],
      brandMemorySlicesUsed: extractSlices(promptPack),
    };
  }
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
