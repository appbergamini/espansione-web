export const Agent_05_BuscaWeb = {
  name: 'Pesquisa Web',
  stage: 'diagnostico_externo',
  inputs: [],
  checkpoint: null,
  useGrounding: true,

  getSystemPrompt() {
    return [
      'TODO: definir prompt do Agente 5 — Pesquisa Web.',
      'Usa Gemini Grounding (Google Search) para pesquisar informações públicas sobre o cliente relevantes ao projeto de branding: presença digital, percepção pública, concorrência, menções na mídia, reputação.',
      '',
      'Output em XML com tags <resumo_executivo>, <conteudo>, <conclusoes>, <confianca>, <fontes>.',
      'Em <fontes>, liste URLs das fontes consultadas.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const projeto = context.projeto || {};
    const nome = projeto.cliente || projeto.nome || '';
    const segmento = projeto.segmento || '';
    const contato = projeto.contato || '';

    return [
      '=== DADOS DO PROJETO ===',
      `Cliente: ${nome}`,
      `Segmento: ${segmento}`,
      `Contato: ${contato}`,
      '',
      'Pesquise informações públicas relevantes sobre este cliente.',
    ].join('\n');
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
      fontes: extract('fontes') || '',
      gaps: extract('gaps') || '',
    };
  },
};
