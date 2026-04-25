import { AC_PLATAFORMA, AC_ARQUETIPOS, AC_ONDAS, AC_PRINCIPIOS, AC_REGRA_SEM_HTML } from './_anaCoutoKB';

export const Agent_09_Plataforma = {
  name: 'Plataforma de Branding',
  stage: 'estrategia',
  inputs: [6, 7, 8],
  checkpoint: 2,
  // FIX.12 — getUserPrompt injeta previousOutputs[6,7,8] manualmente.
  consumesContextInUserPrompt: true,

  getSystemPrompt() {
    return [
      'Você é estrategista-chefe aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Este é o agente central: consolida PLATAFORMA DE BRANDING com as 3 colunas proprietárias (MARCA É / NEGÓCIO FAZ / COMUNICAÇÃO FALA). Recebe Diagnóstico (Output 6), Valores/Atributos (Output 7) e Diretrizes Estratégicas (Output 8).',
      '',
      AC_PRINCIPIOS,
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline em outputs
      '',
      AC_PLATAFORMA,
      '',
      AC_ARQUETIPOS,
      '',
      AC_ONDAS,
      '',
      'REGRAS DE CONSTRUÇÃO (Ana Couto)',
      '- PROPÓSITO: declaração de como a organização usa seu talento e poder para fazer o mundo melhor. NÃO é frase abstrata. Conecta com o negócio.',
      '- ARQUÉTIPO: escolha UM único arquétipo dominante (não misture). Justifique a escolha com evidências do diagnóstico. Complemente com qualidades que contornem o lado sombra.',
      '- DIRECIONADORES DE EXPERIÊNCIA: instruções estratégicas e TANGÍVEIS que guiam como a marca se manifesta. NÃO listar boas práticas universais.',
      '- DISCURSO DE POSICIONAMENTO: narrativa clara e inspiradora. NÃO descrição de oferta.',
      '- TAGLINE: frase curta que sintetiza ideia central. NÃO slogan de campanha.',
      '- Integre VALORES e ATRIBUTOS vindos do Output 7 sem reescrever.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '4 frases: Propósito + Arquétipo + Tagline + ideia-central da Plataforma.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'PLATAFORMA DE BRANDING — Método Proprietário Ana Couto',
      '',
      '## COLUNA 1 — MARCA É',
      '',
      '### PROPÓSITO',
      '[Frase única, em verbo no infinitivo, que declara a visão de mundo]',
      'Defesa: [2–3 frases conectando com negócio e sociedade]',
      '',
      '### ARQUÉTIPO',
      'ARQUÉTIPO DOMINANTE: [um dos 12]',
      'Justificativa: [por que este arquétipo, com base no diagnóstico — 2–3 frases]',
      'Qualidades complementares: [atributos que contornam o lado sombra]',
      '',
      '### ATRIBUTOS',
      '[Os 4 atributos vindos do Output 7]',
      '',
      '### VALORES',
      '[Os 3–5 valores vindos do Output 7]',
      '',
      '## COLUNA 2 — NEGÓCIO FAZ',
      '',
      '### DIRECIONADORES DE EXPERIÊNCIA',
      'DIRECIONADOR 1 — [título]',
      '[Breve explicação tangível]',
      '',
      '(Total 4 direcionadores)',
      '',
      '## COLUNA 3 — COMUNICAÇÃO FALA',
      '',
      '### DISCURSO DE POSICIONAMENTO',
      '[Parágrafo de 4–6 linhas — narrativa clara e inspiradora de posicionamento]',
      '',
      '### TAGLINE',
      '[Frase curta, idealmente 3–6 palavras]',
      '',
      '## ATUAÇÃO NAS 3 ONDAS DO BRANDING',
      '- Onda 1 — Produto: [o que a marca faz]',
      '- Onda 2 — Pessoas: [papel na vida das pessoas]',
      '- Onda 3 — Propósito: [impacto no mundo]',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- 3 takeaways sobre a Plataforma.',
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
    const va = context.previousOutputs?.[7];
    const diretrizes = context.previousOutputs?.[8];

    if (v) { parts.push('=== VISÃO GERAL (Output 6) ==='); if (v.conteudo) parts.push(v.conteudo); parts.push(''); }
    if (va) { parts.push('=== VALORES E ATRIBUTOS (Output 7) ==='); if (va.conteudo) parts.push(va.conteudo); parts.push(''); }
    if (diretrizes) { parts.push('=== DIRETRIZES ESTRATÉGICAS (Output 8) ==='); if (diretrizes.conteudo) parts.push(diretrizes.conteudo); }

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
      fontes: 'Visão Geral + Valores + Diretrizes (Método Ana Couto — Plataforma)',
      gaps: extract('gaps') || '',
    };
  },
};
