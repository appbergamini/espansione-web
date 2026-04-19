const TAVILY_ENDPOINT = 'https://api.tavily.com/search';

function cleanKey() {
  const raw = process.env.TAVILY_API_KEY || '';
  return raw.replace(/[\r\n\s]/g, '');
}

export async function researchCliente({ nome, segmento }) {
  const apiKey = cleanKey();
  if (!apiKey) {
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

  const runQuery = async (q) => {
    try {
      const res = await fetch(TAVILY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          query: q.query,
          search_depth: q.depth,
          max_results: 5,
          include_answer: true,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return [q.label, { error: `HTTP ${res.status}: ${text.slice(0, 200)}` }];
      }

      const r = await res.json();
      return [q.label, {
        answer: r.answer || '',
        results: (r.results || []).map(x => ({
          title: x.title,
          url: x.url,
          content: (x.content || '').slice(0, 1500),
          score: x.score,
        })),
      }];
    } catch (err) {
      return [q.label, { error: err.message }];
    }
  };

  const pairs = await Promise.all(queries.map(runQuery));
  return { available: true, queries: Object.fromEntries(pairs) };
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
