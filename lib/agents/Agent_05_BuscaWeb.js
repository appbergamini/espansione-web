import { AC_TRIPLICE, AC_INVESTIGACAO_SIMULTANEA, AC_RDPC, AC_PRINCIPIOS } from './_anaCoutoKB';
import { researchCliente, formatResearchForPrompt } from '../ai/tavilyResearch';

export const Agent_05_BuscaWeb = {
  name: 'Pesquisa de Mercado e Concorrência',
  stage: 'diagnostico_externo',
  inputs: [],
  checkpoint: null,

  async enrichContext(context) {
    const projeto = context.projeto || {};
    const socios = (context.formularios || []).filter(f => f.tipo === 'intake_socios');
    let site = '';
    for (const f of socios) {
      const r = f.respostas_json || {};
      const cand = r.site_instagram || r.site || r.url || '';
      if (cand) {
        const urlMatch = String(cand).match(/https?:\/\/\S+|www\.\S+|\S+\.(com\.br|com|net|org|io)\b\S*/i);
        if (urlMatch) { site = urlMatch[0]; break; }
      }
    }
    const research = await researchCliente({
      nome: projeto.cliente || projeto.nome,
      segmento: projeto.segmento,
      site,
    });
    return { ...context, tavilyResearch: research };
  },

  getSystemPrompt() {
    return [
      'Você é analista de pesquisa aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Produz a VISÃO DE MERCADO (VM) da Investigação Simultânea. Recebe resultados brutos de uma busca web (Tavily) organizados em queries dirigidas — presença oficial, imprensa, reviews, concorrência e branding. Sintetiza em documento estruturado com olhar Ana Couto.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_INVESTIGACAO_SIMULTANEA,
      '',
      AC_TRIPLICE,
      '',
      AC_RDPC,
      '',
      'OBJETIVO (AC — VM)',
      '- Mapear como a marca se apresenta publicamente (presença digital, imprensa, reviews).',
      '- Identificar concorrentes diretos e mapear seu posicionamento.',
      '- Avaliar criticamente os concorrentes usando RDPC (cores verde/amarelo/vermelho).',
      '- Comparar linguagem pública da marca × linguagem pública dos concorrentes × linguagem dos clientes (quando disponível).',
      '- Classificar achados na Tríplice VM (Impulsionadores, Detratores, Aceleradores vistos do mercado).',
      '',
      'REGRAS',
      '- Cite URL de origem para cada afirmação não-óbvia (formato [N] apontando pra lista de fontes).',
      '- Classifique cada insight: (E) declarado pela empresa, (C) declarado por clientes públicos, (M) declarado pela mídia.',
      '- Evite opinião — descreva.',
      '- Se uma query veio vazia/erro, sinalize e reduza confiança.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3 frases sobre o panorama da presença pública e como a marca se posiciona vs. concorrência.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'DOCUMENTO DE VISÃO DE MERCADO (VM)',
      '',
      '1. PRESENÇA DIGITAL OFICIAL (máx. 200 palavras) — site, redes sociais, Reclame Aqui, Google Reviews.',
      '',
      '2. LINGUAGEM PÚBLICA DA EMPRESA (máx. 150 palavras) — tom, palavras recorrentes, temas narrados.',
      '',
      '3. MENÇÕES NA MÍDIA (bullets) — entrevistas, press releases, prêmios, críticas.',
      '',
      '4. CONCORRÊNCIA DIRETA (máx. 300 palavras) — 3–5 concorrentes, o que cada um faz, posicionamento público, AVALIAÇÃO RDPC de cada um (verde/amarelo/vermelho por critério).',
      '',
      '5. PERCEPÇÃO PÚBLICA / REVIEWS (bullets) — o que clientes falam publicamente.',
      '',
      '6. DECODIFICAÇÃO DE VALOR — VM (CLASSIFICAÇÃO TRÍPLICE):',
      '   - Impulsionadores de mercado (bullets)',
      '   - Detratores de mercado (bullets)',
      '   - Aceleradores de mercado — oportunidades do cenário competitivo (bullets)',
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
      'Limite: 1400 palavras.',
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
      '=== RESULTADOS TAVILY (queries dirigidas) ===',
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
