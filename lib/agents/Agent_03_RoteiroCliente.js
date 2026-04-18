export const Agent_03_RoteiroCliente = {
  name: 'Roteiro de Entrevista com Cliente',
  stage: 'diagnostico_externo',
  inputs: [2],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'Você é analista sênior do Método Espansione. Recebe o Formulário de Clientes (múltiplos respondentes) e o Documento de Contexto Interno (Output 2) já produzido. Seu trabalho é gerar um roteiro de entrevista de aprofundamento com clientes selecionados.',
      '',
      'OBJETIVO DO ROTEIRO',
      '- Validar ou refutar hipóteses do Contexto Interno com a voz de quem usa a marca.',
      '- Aprofundar ambiguidades das respostas do formulário (palavras genéricas, NPS sem justificativa clara, momentos marcantes vagos).',
      '- Explorar o valor real percebido (além do produto/serviço) e a jornada emocional do cliente.',
      '',
      'CONCEITOS',
      '- Proposta de Valor Tríplice (Aaker): Funcional, Emocional, Autoexpressão.',
      '- Mapa de Percepções 4 Quadrantes: posicionamento × diferenciação.',
      '- Jobs to be Done: o que o cliente realmente está contratando a marca para fazer.',
      '',
      'REGRAS DO ROTEIRO',
      '- Entre 8 e 10 perguntas.',
      '- Abertura rápida (contexto + permissão).',
      '- Perguntas comportamentais: "conte sobre uma vez em que..." em vez de "você gosta de...".',
      '- Cada pergunta declara objetivo ("objetivo: mapear brand moments positivos").',
      '- Fechamento: pergunta projetiva sobre como o cliente recomendaria a marca a alguém.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3 frases com as hipóteses mais importantes a validar com o cliente.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'ROTEIRO DE ENTREVISTA COM CLIENTES',
      '',
      '## 1. AMBIGUIDADES E HIPÓTESES A VALIDAR',
      '- bullet',
      '',
      '## 2. ROTEIRO',
      'Abertura: ...',
      '1. [Pergunta] — objetivo: ...',
      '...',
      'Fechamento: ...',
      '',
      '## 3. CRITÉRIOS DE SELEÇÃO DOS ENTREVISTADOS',
      'Sugestão de perfis: clientes recentes, clientes antigos, clientes que recomendam muito (NPS 9-10), clientes com baixo NPS (0-6).',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- Takeaway 1',
      '- Takeaway 2',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 900 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const clientes = (context.formularios || []).filter(f => f.tipo === 'intake_clientes');

    const parts = ['=== FORMULÁRIO CLIENTES ==='];
    if (clientes.length === 0) parts.push('(sem respostas — marque como limitação)');
    for (const f of clientes) {
      parts.push(`Respondente: ${f.respondente || 'anônimo'}`);
      parts.push(JSON.stringify(f.respostas_json || {}, null, 2));
      parts.push('');
    }

    const ctxInterno = context.previousOutputs?.[2];
    if (ctxInterno) {
      parts.push('=== DOCUMENTO DE CONTEXTO INTERNO (Output 2) ===');
      if (ctxInterno.resumo_executivo) parts.push(`[Resumo] ${ctxInterno.resumo_executivo}`);
      if (ctxInterno.conteudo) parts.push(ctxInterno.conteudo);
      if (ctxInterno.conclusoes) parts.push(`[Conclusões] ${ctxInterno.conclusoes}`);
    } else {
      parts.push('=== CONTEXTO INTERNO NÃO DISPONÍVEL — sinalize na confiança ===');
    }

    return parts.join('\n');
  },

  parseOutput(rawText) {
    const extract = (tag) => {
      const m = rawText.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].trim() : '';
    };
    return {
      conteudo: extract('conteudo'),
      resumo_executivo: extract('resumo_executivo'),
      conclusoes: extract('conclusoes'),
      confianca: extract('confianca') || 'Media',
      fontes: 'Formulário clientes + Contexto Interno',
      gaps: extract('gaps') || '',
    };
  },
};
