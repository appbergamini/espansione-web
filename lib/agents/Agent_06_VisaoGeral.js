export const Agent_06_VisaoGeral = {
  name: 'Documento de Visão Geral',
  stage: 'sintese',
  inputs: [2, 4, 5],
  checkpoint: 1,

  getSystemPrompt() {
    return [
      'Você é o estrategista-chefe do Método Espansione. Recebe 4 fontes consolidadas: resultado do Mapeamento Comportamental (DISC) da liderança, Documento de Contexto Interno (Output 2), Documento de Contexto Externo (Output 4) e Pesquisa Web (Output 5). Sua missão: produzir o Documento de Visão Geral — a síntese estratégica que vira o ponto de partida de todos os agentes subsequentes (Valores, Diretrizes, Plataforma, Verbal, Visual, CX, Comunicação).',
      '',
      'CONCEITOS-BASE',
      '- Ana Couto — momento da marca, tríplice, marca de dentro para fora.',
      '- Aaker — Brand Identity System, proposta de valor tríplice.',
      '- Lafley & Martin, Playing to Win — Where to Play / How to Win.',
      '- Wheeler, Designing Brand Identity — brand brief estrutural.',
      '- DISC — perfil comportamental de liderança como lente de como a marca se expressa.',
      '',
      'REGRAS DE SÍNTESE',
      '- Priorize PADRÕES que aparecem em pelo menos 2 das 4 fontes.',
      '- Para cada afirmação, indique se vem de (I)nterno, (E)xterno, (W)eb ou (D)ISC — ou combinação.',
      '- Conflitos entre as fontes são valiosos — não esconda, explicite.',
      '- O Documento de Visão Geral deve ser autossuficiente: alguém que NÃO leu os 4 inputs deve entender a situação da marca só com esse texto.',
      '- Não recomende ações específicas ainda — isso é o papel dos agentes 7+.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '4–5 frases: o panorama estratégico — momento, tensão central, oportunidade mais clara.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'DOCUMENTO DE VISÃO GERAL',
      '',
      '1. PERFIL ESTRATÉGICO (máx. 150 palavras) — quem é a marca, em qual momento está.',
      '2. ESSÊNCIA (máx. 200 palavras) — identidade central convergente entre interno e externo.',
      '3. GAPS DE PERCEPÇÃO (máx. 200 palavras) — liderança × equipe × cliente × público.',
      '4. ESTILO DE LIDERANÇA — DISC (máx. 150 palavras) — como o perfil da liderança se traduz (ou não) na marca.',
      '5. CENÁRIO COMPETITIVO (máx. 150 palavras) — consolidação do que veio do cliente + da web.',
      '6. TENSÕES CENTRAIS (3–5 bullets).',
      '7. OPORTUNIDADES ESTRATÉGICAS (3–5 bullets, priorizadas).',
      '8. HIPÓTESES PARA AGENTES SEGUINTES (bullet) — o que cada agente (Valores, Diretrizes, Plataforma etc.) precisa validar ou desenvolver.',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- 3–5 takeaways que capturam a essência.',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 1800 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];

    if (context.cisAssessments && context.cisAssessments.length > 0) {
      parts.push('=== MAPEAMENTO COMPORTAMENTAL (DISC) — liderança ===');
      for (const a of context.cisAssessments) {
        parts.push(`${a.nome || a.email} — Perfil: ${a.perfil_label || 'n/d'}`);
        parts.push(JSON.stringify(a.scores_json || {}, null, 2));
        parts.push('');
      }
    } else {
      parts.push('=== MAPEAMENTO DISC — (nenhum respondente ainda; marque como limitação) ===');
    }

    const ctxInterno = context.previousOutputs?.[2];
    if (ctxInterno) {
      parts.push('=== CONTEXTO INTERNO (Output 2) ===');
      if (ctxInterno.resumo_executivo) parts.push(`[Resumo] ${ctxInterno.resumo_executivo}`);
      if (ctxInterno.conteudo) parts.push(ctxInterno.conteudo);
      if (ctxInterno.conclusoes) parts.push(`[Conclusões] ${ctxInterno.conclusoes}`);
      parts.push('');
    }

    const ctxExterno = context.previousOutputs?.[4];
    if (ctxExterno) {
      parts.push('=== CONTEXTO EXTERNO (Output 4) ===');
      if (ctxExterno.resumo_executivo) parts.push(`[Resumo] ${ctxExterno.resumo_executivo}`);
      if (ctxExterno.conteudo) parts.push(ctxExterno.conteudo);
      if (ctxExterno.conclusoes) parts.push(`[Conclusões] ${ctxExterno.conclusoes}`);
      parts.push('');
    }

    const web = context.previousOutputs?.[5];
    if (web) {
      parts.push('=== PESQUISA WEB (Output 5) ===');
      if (web.resumo_executivo) parts.push(`[Resumo] ${web.resumo_executivo}`);
      if (web.conteudo) parts.push(web.conteudo);
      if (web.fontes) parts.push(`[Fontes] ${web.fontes}`);
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
      fontes: 'Síntese: DISC + Contexto Interno + Contexto Externo + Pesquisa Web',
      gaps: extract('gaps') || '',
    };
  },
};
