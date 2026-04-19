import { researchCliente, formatResearchForPrompt } from '../ai/tavilyResearch';

export const Agent_05_BuscaWeb = {
  name: 'Pesquisa Web',
  stage: 'diagnostico_externo',
  inputs: [],
  checkpoint: null,

  async enrichContext(context) {
    const projeto = context.projeto || {};
    const research = await researchCliente({
      nome: projeto.cliente || projeto.nome,
      segmento: projeto.segmento,
    });
    return { ...context, tavilyResearch: research };
  },

  getSystemPrompt() {
    return [
      'Você é analista de pesquisa do Método Espansione. Recebe resultados brutos de uma busca web (via Tavily) organizados em 4 queries dirigidas: presença pública, reviews/reclamações, concorrência e branding/posicionamento. Sua tarefa é sintetizar tudo em um relatório estruturado de Pesquisa Web.',
      '',
      'OBJETIVO',
      '- Mapear presença digital da marca (site, redes, Reclame Aqui, Google reviews).',
      '- Identificar menções na mídia, entrevistas, prêmios, críticas.',
      '- Mapear concorrência direta e posicionamento público.',
      '- Comparar linguagem da empresa × linguagem dos clientes.',
      '',
      'REGRAS',
      '- Cite a URL de origem para cada afirmação não-óbvia (use o formato [1], [2] etc. apontando para a lista de fontes).',
      '- Classifique cada insight: (E) declarado pela empresa, (C) declarado por clientes, (M) declarado pela mídia.',
      '- Evite opinião; descreva.',
      '- Se uma query veio vazia ou com erro, sinalize na limitação e reduza confiança.',
      '- Não faça avaliação ética; só observação + citação.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3 frases sobre o panorama da presença pública.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'PESQUISA WEB — PRESENÇA PÚBLICA',
      '',
      '1. PRESENÇA DIGITAL (máx. 200 palavras)',
      '2. LINGUAGEM PÚBLICA DA EMPRESA (máx. 150 palavras) — tom, palavras recorrentes, temas.',
      '3. MENÇÕES NA MÍDIA (bullet)',
      '4. CONCORRÊNCIA DIRETA (máx. 250 palavras) — 3–5 concorrentes e posicionamento público.',
      '5. PERCEPÇÃO PÚBLICA / REVIEWS (bullet) — o que clientes falam publicamente.',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- Takeaway 1',
      '- Takeaway 2',
      '</conclusoes>',
      '',
      '<fontes>',
      '1. https://...',
      '2. https://...',
      '</fontes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 1200 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const projeto = context.projeto || {};
    const nome = projeto.cliente || projeto.nome || '';
    const segmento = projeto.segmento || '';

    const parts = [
      '=== DADOS DO PROJETO ===',
      `Cliente: ${nome}`,
      `Segmento: ${segmento}`,
      '',
      '=== RESULTADOS TAVILY (4 queries dirigidas) ===',
      formatResearchForPrompt(context.tavilyResearch),
    ];
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
      fontes: extract('fontes') || '',
      gaps: extract('gaps') || '',
    };
  },
};
