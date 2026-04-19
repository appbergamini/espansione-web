import { AC_TRIPLICE, AC_MOMENTO, AC_RDPC, AC_ONDAS, AC_INVESTIGACAO_SIMULTANEA, AC_PRINCIPIOS } from './_anaCoutoKB';

export const Agent_02_ContextoInterno = {
  name: 'Documento de Contexto Interno',
  stage: 'diagnostico_interno',
  inputs: [1],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'Você é analista sênior de estratégia de marca aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Seu trabalho é consolidar a VISÃO INTERNA (VI) da marca a partir de quatro fontes: Formulário Sócios, Formulário Colaboradores, transcrições das entrevistas com sócios e com colaboradores, e os roteiros gerados pelo Agente 1. Produza o Documento de Contexto Interno — primeira etapa da Investigação Simultânea.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_INVESTIGACAO_SIMULTANEA,
      '',
      AC_MOMENTO,
      '',
      AC_TRIPLICE,
      '',
      AC_ONDAS,
      '',
      AC_RDPC,
      '',
      'REGRAS DE ANÁLISE (Ana Couto — de dentro para fora)',
      '- Cruze SEMPRE formulário × entrevista × outro-lado (liderança × equipe). A divergência é material de diagnóstico.',
      '- Classificação tríplice (Impulsionadores / Detratores / Aceleradores): aplique ao eixo VI.',
      '- Momento da marca (Criação / Fortalecimento / Reposicionamento / Expansão): diagnostique com base em evidências cruzadas.',
      '- 3 Ondas — avalie a coerência interna: o que a marca FAZ (Onda 1), como se CONECTA com as pessoas do time (Onda 2), e o PROPÓSITO declarado × praticado (Onda 3).',
      '- RDPC interno: avalie se a marca é Relevante, Diferenciada, Proprietária e Consistente DO PONTO DE VISTA DE QUEM VIVE POR DENTRO.',
      '- Palavras desejadas × palavras reais = gap de percepção.',
      '- Propósito declarado × propósito percebido × motivação de criação: o mais verdadeiro costuma ser o da motivação original.',
      '- Não recomende ações nesta etapa — diagnostique. Recomendações vêm nos agentes 7–13.',
      '- Se faltar fonte (entrevista sem transcrição, formulário sem respondente), sinalize como LIMITAÇÃO e reduza a confiança.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3–4 frases: Momento da Marca declarado × sugerido, principal gap liderança × equipe, e a tensão central da VI.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'DOCUMENTO DE CONTEXTO INTERNO — Visão Interna (VI)',
      '',
      '1. PERFIL DA EMPRESA (máx. 120 palavras)',
      '',
      '2. MOMENTO DA MARCA (máx. 100 palavras) — indique o momento (Criação/Fortalecimento/Reposicionamento/Expansão) com justificativa por evidências.',
      '',
      '3. 3 ONDAS — LEITURA INTERNA (máx. 250 palavras) — avalie coerência entre Produto, Pessoas e Propósito na vivência interna.',
      '',
      '4. IDENTIDADE SEGUNDO OS SÓCIOS (máx. 180 palavras).',
      '',
      '5. IDENTIDADE SEGUNDO A EQUIPE (máx. 180 palavras).',
      '',
      '6. MAPA DE GAPS LIDERANÇA × EQUIPE (máx. 200 palavras) — contradições explícitas, com citações.',
      '',
      '7. PROPÓSITO (máx. 150 palavras) — declarado × percebido × motivação original.',
      '',
      '8. DECODIFICAÇÃO DE VALOR — VI (CLASSIFICAÇÃO TRÍPLICE):',
      '   - Impulsionadores internos (bullets)',
      '   - Detratores internos (bullets)',
      '   - Aceleradores internos (bullets)',
      '',
      '9. AVALIAÇÃO RDPC — VI (bullet curto para cada critério, com cor: verde/amarelo/vermelho e justificativa).',
      '',
      '10. TENSÕES INTERNAS (3–5 itens em bullet).',
      '',
      '11. LIMITAÇÕES E HIPÓTESES ABERTAS (bullets).',
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
      'Limite: 1600 palavras.',
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
      parts.push('=== ROTEIROS ORIGINAIS (Output 1) — referência do que foi perguntado ===');
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
      fontes: 'Formulários + entrevistas sócios e colaboradores (VI — Método Ana Couto)',
      gaps: extract('gaps') || '',
    };
  },
};
