import { AC_DIRETRIZES, AC_DE_PARA, AC_PRINCIPIOS, AC_REGRA_SEM_HTML, AC_REGRA_FINDINGS } from './_anaCoutoKB';

export const Agent_08_Diretrizes = {
  name: 'Diretrizes Estratégicas',
  stage: 'estrategia',
  inputs: [6, 7],
  checkpoint: null,
  // FIX.12 — getUserPrompt injeta previousOutputs[6,7] manualmente.
  consumesContextInUserPrompt: true,

  getSystemPrompt() {
    return [
      'Você é estrategista sênior aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. A partir do diagnóstico (Output 6 — Visão Geral com DE-PARA) e dos Valores/Atributos (Output 7), você define DIRETRIZES ESTRATÉGICAS — 3 a 5 recomendações específicas que vão guiar toda a construção de marca dos próximos agentes.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline em outputs
      '',
      AC_REGRA_FINDINGS, // FIX.24 — findings_json estruturado pra curadoria
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
      // FIX-BME-V2 — Exportação estruturada para Brand Memory (camada de Agência).
      // Aditiva, não substitui nada do output existente. O Agente 16 consome esta tag.
      'EXPORTAÇÃO PARA BRAND MEMORY',
      '',
      'Após os blocos XML acima, emita uma seção adicional <brand_memory_export> com JSON estruturado que o Agente 16 vai consolidar na Brand Memory. Esta seção NÃO substitui nada do output existente — é aditiva.',
      '',
      'REGRAS:',
      '- Emita exclusivamente JSON válido entre as tags. Sem comentários, sem markdown, sem texto antes ou depois do `{`.',
      '- schema_version sempre "2.0", agent_id sempre 8.',
      '- O array diretrizes do JSON deve ter o MESMO conteúdo das diretrizes que você emitiu em <conteudo>, normalizado: o título do <conteudo> vira titulo, "O QUE" vira o_que, "POR QUÊ" vira por_que, "COMO" vira como, "DE-PARA" vira de_para_link.',
      '- Numere as diretrizes em ordem (1, 2, 3…), igual à ordem em <conteudo>.',
      '- reinforcement_logic recebe o texto da seção "COMO ESTAS DIRETRIZES SE REFORÇAM".',
      '- Para campos sem elementos: emita null e registre em _gaps com { field, reason }.',
      '- Strings em português, byte-a-byte como você as escreveu no <conteudo>.',
      '',
      'CAMPOS OBRIGATÓRIOS MÍNIMOS:',
      '- diretrizes: pelo menos 1 item',
      '- reinforcement_logic: string não-vazia',
      '',
      'FORMATO:',
      '',
      '<brand_memory_export>',
      '{',
      '  "schema_version": "2.0",',
      '  "agent_id": 8,',
      '  "diretrizes": [',
      '    {',
      '      "numero": 1,',
      '      "titulo": "Reivindicar a categoria Narrativa Patrimonial",',
      '      "o_que": "Posicionar a GSIM como a guardiã da história e da autoridade perene das empresas, distanciando-se de agências de conteúdo efêmero.",',
      '      "por_que": "Resolve a divergência comunicacional entre a promessa de agilidade e a entrega de profundidade, além de criar um oceano azul imune à comoditização pela IA generativa.",',
      '      "como": "Substituir o pitch de \'agência 360\' por \'Consultoria de Narrativa Patrimonial\'. Focar a prospecção exclusivamente em setores de alta complexidade (Indústria, Saúde, ESG) e C-Levels.",',
      '      "de_para_link": {',
      '        "sair_de": "Produtora cara e caprichosa",',
      '        "ir_para": "Consultoria de Narrativa B2B"',
      '      }',
      '    }',
      '  ],',
      '  "reinforcement_logic": "As diretrizes formam um sistema onde o novo posicionamento justifica o tempo e o preço do rigor...",',
      '  "_gaps": []',
      '}',
      '</brand_memory_export>',
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
