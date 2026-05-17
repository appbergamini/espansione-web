import { AC_PLATAFORMA, AC_PRINCIPIOS, AC_REGRA_SEM_HTML, AC_REGRA_FINDINGS } from './_anaCoutoKB';

export const Agent_07_Valores = {
  name: 'Valores e Atributos da Marca',
  stage: 'estrategia',
  inputs: [6],
  checkpoint: null,
  // FIX.12 — getUserPrompt injeta previousOutputs[6] manualmente.
  consumesContextInUserPrompt: true,

  getSystemPrompt() {
    return [
      'Você é estrategista sênior aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. A partir do diagnóstico consolidado (Visão Geral — Output 6), você define VALORES e ATRIBUTOS da marca — primeiras peças da Plataforma de Branding.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline em outputs
      '',
      AC_REGRA_FINDINGS, // FIX.24 — findings_json estruturado pra curadoria
      '',
      AC_PLATAFORMA,
      '',
      'REGRAS DE VALORES (Ana Couto)',
      '- Valores indicam TIPO DE CULTURA / COMPORTAMENTO dos colaboradores a ser praticado para que o negócio aconteça.',
      '- NÃO confundir com conjunto de valores básicos genéricos para qualquer organização (ética, transparência, confiança). Isso é baseline, não diferencial.',
      '- 3 a 5 valores que sejam ESPECÍFICOS para esta empresa — que justifiquem decisões reais de contratação, demissão, investimento.',
      '- Cada valor vem com um verbo de ação + explicação de como se manifesta na prática.',
      '',
      'REGRAS DE ATRIBUTOS (Ana Couto)',
      '- Atributos são adjetivos que se CONTRASTAM E COMPLEMENTAM para traduzir a personalidade autêntica da marca.',
      '- 4 atributos idealmente, que juntos criam tensão interessante (ex: "sofisticada e acessível", "rigorosa e calorosa").',
      '- NÃO use adjetivos genéricos ou mornos que não qualifiquem personalidade específica.',
      '- Cada atributo tem breve defesa de COMO se manifesta.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3 frases: a essência de valores+atributos que esta marca precisa assumir para resolver sua tensão central.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'VALORES E ATRIBUTOS — Plataforma de Branding (1ª parte)',
      '',
      '## VALORES',
      'VALOR 1 — [verbo + substantivo]',
      'Como se manifesta: [1-2 frases específicas].',
      'Decisões que este valor orienta: [exemplo concreto].',
      '',
      '(Repetir para 3–5 valores)',
      '',
      '## ATRIBUTOS DE PERSONALIDADE',
      'ATRIBUTO 1 — [adjetivo forte]',
      'Tensão criativa com: [outro atributo do conjunto].',
      'Como se manifesta: [1-2 frases].',
      '',
      '(4 atributos, formando um quarteto que se equilibra)',
      '',
      '## COERÊNCIA COM O DIAGNÓSTICO',
      '- Como os valores escolhidos atacam os Detratores identificados na Visão Geral.',
      '- Como os atributos amplificam os Impulsionadores.',
      '- Como o conjunto responde ao DE-PARA declarado.',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- 3 takeaways sobre personalidade da marca.',
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
      '- schema_version sempre "2.0", agent_id sempre 7.',
      '- Para campos que VOCÊ NÃO TEM elementos para preencher a partir do seu raciocínio: emita null e adicione objeto ao array _gaps com { field, reason }.',
      '- NÃO infira campos fora da sua lente (você produz valores e atributos — não toque em outros artefatos).',
      '- Strings em português, byte-a-byte como você as escreveu no <conteudo>.',
      '- Arrays vazios são [], não null.',
      '',
      'CAMPOS OBRIGATÓRIOS MÍNIMOS:',
      '- values: pelo menos 3 itens',
      '- personality_attributes: pelo menos 3 itens',
      '',
      'FORMATO:',
      '',
      '<brand_memory_export>',
      '{',
      '  "schema_version": "2.0",',
      '  "agent_id": 7,',
      '  "values": [',
      '    {',
      '      "name": "Decifrar a Complexidade",',
      '      "manifestation": "Não aceitamos o óbvio. Mergulhamos nos temas áridos até encontrar o ângulo humano e estratégico que ninguém viu.",',
      '      "decisions_oriented": "Investimento em tempo de pesquisa antes de qualquer roteiro; recusa de briefings superficiais."',
      '    }',
      '  ],',
      '  "personality_attributes": [',
      '    {',
      '      "name": "Cinematográfica",',
      '      "creative_tension_with": "Estratégica",',
      '      "manifestation": "Trazemos a luz, o enquadramento e o ritmo do cinema para o mundo corporativo."',
      '    }',
      '  ],',
      '  "diagnostic_coherence": {',
      '    "ataque_aos_detratores": "string ou null",',
      '    "amplificacao_dos_impulsionadores": "string ou null",',
      '    "resposta_ao_de_para": "string ou null"',
      '  },',
      '  "_gaps": []',
      '}',
      '</brand_memory_export>',
      '',
      'Limite: 1200 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const v = context.previousOutputs?.[6];
    const parts = ['=== VISÃO GERAL — DIAGNÓSTICO CONSOLIDADO (Output 6) ==='];
    if (v) {
      if (v.resumo_executivo) { parts.push('[Resumo]'); parts.push(v.resumo_executivo); parts.push(''); }
      if (v.conteudo) { parts.push(v.conteudo); }
      if (v.conclusoes) { parts.push(''); parts.push('[Conclusões]'); parts.push(v.conclusoes); }
    } else {
      parts.push('Output 6 (Visão Geral) não disponível — sinalize confiança BAIXA.');
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
      fontes: 'Visão Geral consolidada (Método Ana Couto — Plataforma 1ª parte)',
      gaps: extract('gaps') || '',
    };
  },
};
