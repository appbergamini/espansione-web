const TAVILY_ENDPOINT = 'https://api.tavily.com/search';

function cleanKey() {
  const raw = process.env.TAVILY_API_KEY || '';
  return raw.replace(/[\r\n\s]/g, '');
}

function extractDomain(url) {
  if (!url) return '';
  const m = String(url).match(/^(?:https?:\/\/)?(?:www\.)?([^\/\s?#]+)/i);
  return m ? m[1].toLowerCase() : '';
}

export async function researchCliente({ nome, segmento, site }) {
  const apiKey = cleanKey();
  if (!apiKey) return { available: false, reason: 'TAVILY_API_KEY não configurada' };
  if (!nome) return { available: false, reason: 'Nome do cliente não informado no projeto' };

  const domain = extractDomain(site);
  const contexto = segmento ? ` ${segmento}` : '';

  // Queries com contexto suficiente para desambiguar nomes curtos (ex.: "GSIM")
  const queries = [
    {
      label: 'oficial',
      query: domain ? `"${nome}"${contexto} site:${domain}` : `"${nome}"${contexto} site oficial sobre nós`,
      depth: 'basic',
      includeDomains: domain ? [domain] : undefined,
    },
    {
      label: 'presenca',
      query: `"${nome}"${contexto} entrevista OR imprensa OR mídia OR prêmio`,
      depth: 'basic',
    },
    {
      label: 'reviews',
      query: `"${nome}"${contexto} reclame aqui OR avaliação OR review OR google reviews OR linkedin`,
      depth: 'advanced',
    },
    {
      label: 'concorrentes',
      query: segmento
        ? `"${segmento}" concorrentes Brasil principais empresas`
        : `"${nome}" concorrentes OR alternativas`,
      depth: 'basic',
    },
    {
      label: 'marca',
      query: `"${nome}"${contexto} branding OR posicionamento OR estratégia de marca`,
      depth: 'basic',
    },
  ];

  const runQuery = async (q) => {
    try {
      const payload = {
        api_key: apiKey,
        query: q.query,
        search_depth: q.depth,
        max_results: 5,
        include_answer: true,
      };
      if (q.includeDomains && q.includeDomains.length > 0) {
        payload.include_domains = q.includeDomains;
      }

      const res = await fetch(TAVILY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        return [q.label, { error: `HTTP ${res.status}: ${text.slice(0, 200)}`, query: q.query }];
      }

      const r = await res.json();
      return [q.label, {
        query: q.query,
        answer: r.answer || '',
        results: (r.results || []).map(x => ({
          title: x.title,
          url: x.url,
          content: (x.content || '').slice(0, 1500),
          score: x.score,
        })),
      }];
    } catch (err) {
      return [q.label, { error: err.message, query: q.query }];
    }
  };

  const pairs = await Promise.all(queries.map(runQuery));
  return { available: true, domain, queries: Object.fromEntries(pairs) };
}

export function formatResearchForPrompt(research) {
  if (!research?.available) {
    return `(Pesquisa Tavily indisponível: ${research?.reason || 'sem dados'})`;
  }
  const parts = [];
  if (research.domain) parts.push(`Domínio oficial conhecido: ${research.domain}`);
  parts.push('');
  for (const [label, block] of Object.entries(research.queries)) {
    parts.push(`### Query: ${label.toUpperCase()}`);
    if (block.query) parts.push(`Termo pesquisado: ${block.query}`);
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
