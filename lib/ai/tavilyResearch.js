import { tavily } from '@tavily/core';

const client = process.env.TAVILY_API_KEY
  ? tavily({ apiKey: process.env.TAVILY_API_KEY })
  : null;

export async function researchCliente({ nome, segmento }) {
  if (!client) {
    return { available: false, reason: 'TAVILY_API_KEY não configurada' };
  }
  if (!nome) {
    return { available: false, reason: 'Nome do cliente não informado no projeto' };
  }

  const queries = [
    { label: 'presenca', query: `"${nome}" site oficial OR entrevista OR imprensa`, depth: 'basic' },
    { label: 'reviews', query: `"${nome}" reclame aqui OR avaliação OR review OR google`, depth: 'advanced' },
    { label: 'concorrentes', query: `"${nome}" ${segmento ? segmento + ' ' : ''}concorrentes OR alternativas OR vs`, depth: 'basic' },
    { label: 'marca', query: `"${nome}" branding OR posicionamento OR marca`, depth: 'basic' },
  ];

  const results = {};
  for (const q of queries) {
    try {
      const r = await client.search(q.query, {
        searchDepth: q.depth,
        maxResults: 5,
        includeAnswer: true,
      });
      results[q.label] = {
        answer: r.answer || '',
        results: (r.results || []).map(x => ({
          title: x.title,
          url: x.url,
          content: x.content?.slice(0, 1500) || '',
          score: x.score,
        })),
      };
    } catch (err) {
      results[q.label] = { error: err.message };
    }
  }

  return { available: true, queries: results };
}

export function formatResearchForPrompt(research) {
  if (!research?.available) {
    return `(Pesquisa Tavily indisponível: ${research?.reason || 'sem dados'})`;
  }
  const parts = [];
  for (const [label, block] of Object.entries(research.queries)) {
    parts.push(`### Query: ${label.toUpperCase()}`);
    if (block.error) { parts.push(`Erro: ${block.error}`); parts.push(''); continue; }
    if (block.answer) { parts.push(`Resumo Tavily: ${block.answer}`); parts.push(''); }
    (block.results || []).forEach((r, i) => {
      parts.push(`[${i + 1}] ${r.title}`);
      parts.push(`URL: ${r.url}`);
      parts.push(r.content);
      parts.push('');
    });
  }
  return parts.join('\n');
}
