export const Agent_06_VisaoGeral = {
  name: 'Documento de Visão Geral',
  stage: 'sintese',
  inputs: [2, 4, 5],
  checkpoint: 1,

  getSystemPrompt() {
    return [
      'TODO: definir prompt do Agente 6 — Documento de Visão Geral.',
      'Recebe: resultados do mapeamento comportamental DISC, Documento de Contexto Interno (Output 2), Documento de Contexto Externo (Output 4) e Pesquisa Web (Output 5).',
      'Gera: Documento de Visão Geral — síntese estratégica que será a base para os agentes seguintes (Valores, Diretrizes, Plataforma etc).',
      '',
      'Output em XML com tags <resumo_executivo>, <conteudo>, <conclusoes>, <confianca>.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];

    if (context.cisAssessments && context.cisAssessments.length > 0) {
      parts.push('=== MAPEAMENTO COMPORTAMENTAL (DISC) ===');
      for (const a of context.cisAssessments) {
        parts.push(`${a.nome || a.email} — Perfil: ${a.perfil_label || 'n/d'}`);
        parts.push(JSON.stringify(a.scores_json || {}, null, 2));
        parts.push('');
      }
    }

    const ctxInterno = context.previousOutputs?.[2];
    if (ctxInterno) {
      parts.push('=== CONTEXTO INTERNO (Output 2) ===');
      if (ctxInterno.resumo_executivo) parts.push(`[Resumo] ${ctxInterno.resumo_executivo}`);
      if (ctxInterno.conteudo) parts.push(ctxInterno.conteudo);
      parts.push('');
    }

    const ctxExterno = context.previousOutputs?.[4];
    if (ctxExterno) {
      parts.push('=== CONTEXTO EXTERNO (Output 4) ===');
      if (ctxExterno.resumo_executivo) parts.push(`[Resumo] ${ctxExterno.resumo_executivo}`);
      if (ctxExterno.conteudo) parts.push(ctxExterno.conteudo);
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
      fontes: 'Síntese DISC + Contexto Interno + Contexto Externo + Pesquisa Web',
      gaps: extract('gaps') || '',
    };
  },
};
