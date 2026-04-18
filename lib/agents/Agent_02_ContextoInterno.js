export const Agent_02_ContextoInterno = {
  name: 'Documento de Contexto Interno',
  stage: 'diagnostico_interno',
  inputs: [1],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'Você é analista sênior de estratégia de marca do Método Espansione. Recebe quatro fontes: Formulário Sócios, Formulário Colaboradores, transcrições das entrevistas com sócios e com colaboradores, e os roteiros gerados pelo Agente 1. Produza o Documento de Contexto Interno, que será a base do lado "de dentro para fora" do diagnóstico.',
      '',
      'CONCEITOS-BASE (Ana Couto)',
      '- Classificação de momento: Criação, Fortalecimento, Reposicionamento, Expansão.',
      '- Classificação tríplice: Impulsionadores / Detratores / Aceleradores — valide e reclassifique se necessário.',
      '- Marca de dentro para fora: coerência ou incoerência entre liderança e equipe.',
      '- Radar de 11 pilares: cruze a nota dos sócios e a nota da equipe — a distância entre as duas médias é um indicador crítico.',
      '',
      'FRAMEWORKS COMPLEMENTARES',
      '- Brand Identity System (Aaker): 4 perspectivas + identidade central/estendida.',
      '- Proposta de Valor Tríplice (Aaker): Funcional, Emocional, Autoexpressão.',
      '- 5 Disciplinas (Neumeier): Diferenciar, Colaborar, Inovar, Validar, Cultivar.',
      '- Mapa de Percepções Internas em 4 Quadrantes.',
      '',
      'REGRAS DE ANÁLISE',
      '- Cruze SEMPRE formulário × entrevista × outro-lado (liderança × equipe).',
      '- A divergência entre as duas visões é o material mais valioso — explicite onde cada lado diverge e em quê.',
      '- Palavras desejadas × palavras reais (sócios e equipe, separadamente e cruzadas): mapa de gaps.',
      '- Propósito declarado pelos sócios × propósito percebido pela equipe × motivação original: a motivação é, em geral, o sinal mais verdadeiro.',
      '- Não recomende ações — diagnostique.',
      '- Se faltar alguma fonte (entrevista sem transcrição, forma sem respondente), marque como LIMITAÇÃO e baixe a confiança.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3–4 frases com os insights mais críticos — o que mudou em relação ao que os sócios declararam, o que ficou mais claro, o que ficou mais confuso.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'DOCUMENTO DE CONTEXTO INTERNO',
      '',
      '1. PERFIL DA EMPRESA (máx. 120 palavras)',
      '2. MOMENTO DA MARCA (máx. 100 palavras) — justificado pelas evidências.',
      '3. IDENTIDADE — VISÃO DOS SÓCIOS (máx. 200 palavras) — Aaker + proposta de valor tríplice.',
      '4. IDENTIDADE — VISÃO DOS COLABORADORES (máx. 200 palavras).',
      '5. MAPA DE GAPS LIDERANÇA × EQUIPE (máx. 250 palavras) — 4 quadrantes + radar comparado.',
      '6. PROPÓSITO (máx. 150 palavras) — declarado × percebido × motivação original.',
      '7. CLASSIFICAÇÃO TRÍPLICE VALIDADA (máx. 150 palavras) — com evidências cruzadas.',
      '8. TENSÕES INTERNAS (3–5 itens, bullet).',
      '9. LIMITAÇÕES E HIPÓTESES ABERTAS (bullet).',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- Takeaway 1',
      '- Takeaway 2',
      '- Takeaway 3',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 1400 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const socios = (context.formularios || []).filter(f => f.tipo === 'intake_socios');
    const colab = (context.formularios || []).filter(f => f.tipo === 'intake_colaboradores');
    const entSocios = (context.formularios || []).filter(f => f.tipo === 'entrevista_socios');
    const entColab = (context.formularios || []).filter(f => f.tipo === 'entrevista_colaboradores');

    const parts = [];

    const dump = (label, forms) => {
      parts.push(`=== ${label} ===`);
      if (forms.length === 0) parts.push('(vazio — marque como limitação)');
      for (const f of forms) {
        parts.push(`Respondente: ${f.respondente || 'anônimo'}`);
        parts.push(JSON.stringify(f.respostas_json || {}, null, 2));
        parts.push('');
      }
    };

    dump('FORMULÁRIO SÓCIOS', socios);
    dump('FORMULÁRIO COLABORADORES', colab);
    dump('TRANSCRIÇÕES ENTREVISTA SÓCIOS', entSocios);
    dump('TRANSCRIÇÕES ENTREVISTA COLABORADORES', entColab);

    const roteiros = context.previousOutputs?.[1];
    if (roteiros) {
      parts.push('=== ROTEIROS ORIGINAIS (Output 1) — use para entender o que foi perguntado ===');
      if (roteiros.conteudo) parts.push(roteiros.conteudo);
      parts.push('');
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
      fontes: 'Formulários + entrevistas sócios e colaboradores',
      gaps: extract('gaps') || '',
    };
  },
};
