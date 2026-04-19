import { AC_DIRETRIZES, AC_DE_PARA, AC_PRINCIPIOS } from './_anaCoutoKB';

export const Agent_08_Diretrizes = {
  name: 'Diretrizes Estratégicas',
  stage: 'estrategia',
  inputs: [6, 7],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'Você é estrategista sênior aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. A partir do diagnóstico (Output 6 — Visão Geral com DE-PARA) e dos Valores/Atributos (Output 7), você define DIRETRIZES ESTRATÉGICAS — 3 a 5 recomendações específicas que vão guiar toda a construção de marca dos próximos agentes.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_DE_PARA,
      '',
      AC_DIRETRIZES,
      '',
      'REGRAS (Ana Couto)',
      '- 3 a 5 diretrizes — nem mais, nem menos.',
      '- Cada diretriz tem TÍTULO curto (4–6 palavras) + DEFESA breve (3–5 frases).',
      '- Cada diretriz é ESPECÍFICA para esta empresa — não é frase genérica aplicável a qualquer marca.',
      '- Importante ficar claro o COMO — uma diretriz não é intenção, é instrução prática.',
      '- As diretrizes devem juntas endereçar: (a) resolver os Detratores, (b) amplificar os Impulsionadores, (c) ativar os Aceleradores do diagnóstico.',
      '- Cada diretriz deve conectar explicitamente com o DE-PARA (mostre como ela faz a marca sair de X e chegar em Y).',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3 frases: o núcleo estratégico que as diretrizes juntas formam.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'DIRETRIZES ESTRATÉGICAS',
      '',
      '## DIRETRIZ 01 — [Título]',
      'O QUE: [1 frase objetiva]',
      'POR QUÊ: [conexão com Detrator/Impulsionador/Acelerador do diagnóstico]',
      'COMO: [instrução prática — 2–3 frases com direções concretas]',
      'DE-PARA: [sai de... chega em...]',
      '',
      '## DIRETRIZ 02 — [Título]',
      '...',
      '',
      '(Total 3 a 5 diretrizes)',
      '',
      '## COMO ESTAS DIRETRIZES SE REFORÇAM',
      'Breve parágrafo explicando como as diretrizes juntas formam um sistema coerente.',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- 3 takeaways sobre o direcionamento estratégico.',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 1500 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const v = context.previousOutputs?.[6];
    const va = context.previousOutputs?.[7];
    const parts = [];

    if (v) {
      parts.push('=== VISÃO GERAL — DIAGNÓSTICO (Output 6) ===');
      if (v.resumo_executivo) parts.push(`[Resumo] ${v.resumo_executivo}`);
      if (v.conteudo) parts.push(v.conteudo);
      parts.push('');
    }
    if (va) {
      parts.push('=== VALORES E ATRIBUTOS (Output 7) ===');
      if (va.resumo_executivo) parts.push(`[Resumo] ${va.resumo_executivo}`);
      if (va.conteudo) parts.push(va.conteudo);
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
      fontes: 'Visão Geral + Valores/Atributos (Método Ana Couto — Diretrizes Estratégicas)',
      gaps: extract('gaps') || '',
    };
  },
};
