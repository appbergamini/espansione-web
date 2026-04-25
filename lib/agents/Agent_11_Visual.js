import { AC_ONE_PAGE_PERSONALIDADE, AC_RDPC, AC_PRINCIPIOS, AC_REGRA_SEM_HTML } from './_anaCoutoKB';

export const Agent_11_Visual = {
  name: 'Identidade Visual — One Page de Personalidade',
  stage: 'visual_verbal',
  inputs: [6, 9, 10],
  checkpoint: 3,
  // FIX.12 — getUserPrompt injeta previousOutputs[6,9,10] manualmente.
  consumesContextInUserPrompt: true,

  getSystemPrompt() {
    return [
      'Você é diretor de design aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Recebe o Diagnóstico (Output 6), a Plataforma de Branding (Output 9) e a Identidade Verbal (Output 10). Constrói o BRIEFING de IDENTIDADE VISUAL seguindo a estrutura proprietária ONE PAGE DE PERSONALIDADE.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline em outputs
      '',
      AC_ONE_PAGE_PERSONALIDADE,
      '',
      AC_RDPC,
      '',
      'REGRAS DO ONE PAGE DE PERSONALIDADE (Ana Couto)',
      '- Cada elemento visual deve funcionar como INSTRUMENTO DE ORQUESTRA — afinados e com papel claro.',
      '- Intenção estratégica direciona decisão criativa: o que queremos CONQUISTAR com este elemento?',
      '- Valorize o autêntico e verdadeiro da marca (Manter) antes de decidir o que Perder e Ganhar.',
      '- Avalie sempre nos critérios RDPC — cada elemento deve reforçar Relevância, Diferenciação, Propriedade e Consistência.',
      '',
      'Este documento é um BRIEFING para o time de design executar — não é o design final.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3 frases: a direção visual central da marca em síntese.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'BRIEFING DE IDENTIDADE VISUAL — One Page de Personalidade',
      '',
      '## MANTER / PERDER / GANHAR',
      '- MANTER: [o que tem valor na identidade atual]',
      '- PERDER: [o que não serve mais]',
      '- GANHAR: [o que precisa ser conquistado]',
      '',
      '## SÍMBOLO (LOGO)',
      'Tipo recomendado: [tipográfica / símbolo abstrato / símbolo figurativo / símbolo cambiante]',
      'Defesa: [por que este tipo — 3 frases]',
      'Conceitos a transmitir: [3 conceitos extraídos da Plataforma]',
      '',
      '## COR',
      'Paleta principal: [3–4 cores]',
      'Justificativa: [por que cada cor — referência à psicologia AC]',
      'Paleta complementar: [2–3 apoio]',
      '',
      '## FORMA',
      '[Descrição das formas proprietárias — orgânicas, geométricas, angulares, fluidas etc.]',
      'Como criam propriedade além do logo: [2 frases]',
      '',
      '## TIPOGRAFIA',
      'Hierarquia: título / subtítulo / corpo',
      'Perfis recomendados: [serifada/sans/display, com justificativa]',
      'Transmissão de personalidade: [2 frases]',
      '',
      '## FOTOGRAFIA',
      'Estilo: [editorial / documental / fashion / corporativo etc]',
      'Temas: [o que mostrar]',
      'Tratamento: [cores, cortes, proporções]',
      '',
      '## ILUSTRAÇÃO',
      'Estilo: [linear / flat / 3D / orgânico etc]',
      'Papel na marca: [o que a ilustração complementa]',
      '',
      '## ICONOGRAFIA',
      'Estilo: [simples / ornamental / geométrica etc]',
      'Consistência: [regras comuns entre os ícones]',
      '',
      '## COMPORTAMENTO VISUAL',
      '[Minimalista ou sensorial — e por quê. Como a marca se comporta visualmente em contextos variados]',
      '',
      '## AVALIAÇÃO RDPC',
      '- Relevante: [como este briefing é relevante ao público]',
      '- Diferenciada: [como se diferencia da concorrência]',
      '- Proprietária: [o que torna única]',
      '- Consistente: [coerência com Plataforma + Verbal]',
      '',
      '## MOODBOARD SUGERIDO',
      '[3–5 descrições de referências para o moodboard — sem necessariamente indicar marcas específicas, mas indicando territórios]',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- 3 takeaways sobre a direção visual.',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 2500 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];
    const v = context.previousOutputs?.[6];
    const plat = context.previousOutputs?.[9];
    const verb = context.previousOutputs?.[10];
    if (v) { parts.push('=== VISÃO GERAL (Output 6) ==='); if (v.resumo_executivo) parts.push(v.resumo_executivo); if (v.conteudo) parts.push(v.conteudo); parts.push(''); }
    if (plat) { parts.push('=== PLATAFORMA DE BRANDING (Output 9) ==='); if (plat.conteudo) parts.push(plat.conteudo); parts.push(''); }
    if (verb) { parts.push('=== IDENTIDADE VERBAL (Output 10) ==='); if (verb.conteudo) parts.push(verb.conteudo); }
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
      fontes: 'Visão Geral + Plataforma + Verbal (Método Ana Couto — One Page de Personalidade)',
      gaps: extract('gaps') || '',
    };
  },
};
