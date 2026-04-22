// =====================================================================
// DEPRECATED — TASK 5.1 (Agente 5 v2)
// Este módulo fazia o research custom do Agente 5 pré-v2 com queries
// Tavily Search determinísticas. Substituído por:
//   - lib/ai/deepResearch.js  → deep research via Claude web_search nativo
//   - lib/ai/tavilyExtract.js → captura literal do conteúdo bruto dos sites
//
// Mantido no repo para referência histórica. Pode ser removido após
// validação do Agente 5 v2 em 2-3 projetos reais.
// =====================================================================

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

async function runTavily({ apiKey, query, depth = 'basic', maxResults = 5, includeDomains }) {
  try {
    const payload = {
      api_key: apiKey,
      query,
      search_depth: depth,
      max_results: maxResults,
      include_answer: true,
    };
    if (includeDomains && includeDomains.length > 0) payload.include_domains = includeDomains;

    const res = await fetch(TAVILY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      return { query, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    const r = await res.json();
    return {
      query,
      answer: r.answer || '',
      results: (r.results || []).map(x => ({
        title: x.title,
        url: x.url,
        content: (x.content || '').slice(0, 1500),
        score: x.score,
        publishedDate: x.published_date || null,
      })),
    };
  } catch (err) {
    return { query, error: err.message };
  }
}

// ─── Pesquisa padrão (usada por Agente 5 como primeira passada) ────────────────
export async function researchCliente({ nome, segmento, site }) {
  const apiKey = cleanKey();
  if (!apiKey) return { available: false, reason: 'TAVILY_API_KEY não configurada' };
  if (!nome) return { available: false, reason: 'Nome do cliente não informado no projeto' };

  const domain = extractDomain(site);
  const contexto = segmento ? ` ${segmento}` : '';

  const queries = [
    { label: 'oficial',      query: domain ? `"${nome}"${contexto} site:${domain}` : `"${nome}"${contexto} site oficial sobre nós`, depth: 'basic', includeDomains: domain ? [domain] : undefined },
    { label: 'presenca',     query: `"${nome}"${contexto} entrevista OR imprensa OR mídia OR prêmio`, depth: 'basic' },
    { label: 'reviews',      query: `"${nome}"${contexto} reclame aqui OR avaliação OR review OR google reviews OR linkedin`, depth: 'advanced' },
    { label: 'concorrentes', query: segmento ? `"${segmento}" concorrentes Brasil principais empresas` : `"${nome}" concorrentes OR alternativas`, depth: 'basic' },
    { label: 'marca',        query: `"${nome}"${contexto} branding OR posicionamento OR estratégia de marca`, depth: 'basic' },
  ];

  const results = await Promise.all(queries.map(q => runTavily({ apiKey, query: q.query, depth: q.depth, includeDomains: q.includeDomains }).then(r => [q.label, r])));
  return { available: true, domain, queries: Object.fromEntries(results) };
}

// ─── Deep research (Agente 5 VM): por concorrente + categoria + tendências ────
export async function researchVisaoMercado({ cliente, segmento, geografia, concorrentes = [], site }) {
  const apiKey = cleanKey();
  if (!apiKey) return { available: false, reason: 'TAVILY_API_KEY não configurada' };
  if (!cliente) return { available: false, reason: 'Nome do cliente não informado no projeto' };

  const geo = geografia || 'Brasil';
  const catStr = segmento || 'categoria não informada';

  const brandBlock = async () => {
    const domain = extractDomain(site);
    const q = domain ? `"${cliente}" ${segmento || ''} site:${domain}` : `"${cliente}" ${segmento || ''} sobre propósito posicionamento`;
    return { label: 'marca_projeto', data: await runTavily({ apiKey, query: q, depth: 'basic', includeDomains: domain ? [domain] : undefined }) };
  };

  const perConcorrente = async (nomeC) => {
    const queries = [
      { key: 'oficial',     q: `"${nomeC}" ${segmento || ''} sobre propósito missão valores`, depth: 'basic' },
      { key: 'linkedin',    q: `"${nomeC}" linkedin company size employees`,                  depth: 'basic' },
      { key: 'movimentos',  q: `"${nomeC}" aquisição OR funding OR rodada OR CEO OR expansão ${geo}`, depth: 'advanced' },
      { key: 'reviews',     q: `"${nomeC}" reclame aqui OR glassdoor OR reviews`,            depth: 'basic' },
      { key: 'imprensa',    q: `"${nomeC}" entrevista OR reportagem ${segmento || ''} ${geo}`, depth: 'basic' },
    ];
    const res = await Promise.all(queries.map(async q => [q.key, await runTavily({ apiKey, query: q.q, depth: q.depth })]));
    return { nome: nomeC, queries: Object.fromEntries(res) };
  };

  const categoriaBlocks = async () => {
    const queries = [
      { key: 'tamanho',     q: `tamanho mercado "${catStr}" ${geo} dados`,                         depth: 'advanced' },
      { key: 'crescimento', q: `"${catStr}" ${geo} crescimento projeção 2024 OR 2025 OR 2026`,     depth: 'advanced' },
      { key: 'estrutura',   q: `"${catStr}" ${geo} principais players líderes concentração`,      depth: 'basic' },
      { key: 'regulacao',   q: `"${catStr}" ${geo} regulamentação órgão regulador lei`,           depth: 'basic' },
      { key: 'movimentos',  q: `"${catStr}" ${geo} aquisição OR M&A OR entrantes últimos meses`,  depth: 'advanced' },
    ];
    const res = await Promise.all(queries.map(async q => [q.key, await runTavily({ apiKey, query: q.q, depth: q.depth })]));
    return Object.fromEntries(res);
  };

  const tendenciasBlocks = async () => {
    const queries = [
      { key: 'consultorias', q: `tendências "${catStr}" ${geo} McKinsey OR BCG OR Deloitte OR Gartner`, depth: 'advanced' },
      { key: 'setoriais',    q: `"${catStr}" ${geo} relatório setorial associação tendências`,        depth: 'advanced' },
      { key: 'benchmarks',   q: `benchmark marca "${catStr}" OR categoria adjacente inovação branding`, depth: 'advanced' },
    ];
    const res = await Promise.all(queries.map(async q => [q.key, await runTavily({ apiKey, query: q.q, depth: q.depth })]));
    return Object.fromEntries(res);
  };

  // Executa em paralelo por bloco; cada bloco já paraleliza suas queries internamente
  const [brand, concBlocks, categoria, tendencias] = await Promise.all([
    brandBlock(),
    Promise.all(concorrentes.slice(0, 4).map(perConcorrente)),
    categoriaBlocks(),
    tendenciasBlocks(),
  ]);

  return {
    available: true,
    metadados: { cliente, segmento, geografia: geo, site: site || null, concorrentes: concorrentes.slice(0, 4) },
    marca_projeto: brand.data,
    concorrentes: concBlocks,
    categoria,
    tendencias,
  };
}

// ─── Formatadores ──────────────────────────────────────────────────────────────
export function formatResearchForPrompt(research) {
  if (!research?.available) {
    return `(Pesquisa Tavily indisponível: ${research?.reason || 'sem dados'})`;
  }
  const parts = [];
  if (research.domain) parts.push(`Domínio oficial conhecido: ${research.domain}`);
  parts.push('');
  for (const [label, block] of Object.entries(research.queries || {})) {
    parts.push(`### Query: ${label.toUpperCase()}`);
    if (block.query) parts.push(`Termo pesquisado: ${block.query}`);
    if (block.error) { parts.push(`Erro: ${block.error}`); parts.push(''); continue; }
    if (block.answer) { parts.push(`Resumo Tavily: ${block.answer}`); parts.push(''); }
    (block.results || []).forEach((r, i) => {
      parts.push(`[${i + 1}] ${r.title}`);
      parts.push(`URL: ${r.url}${r.publishedDate ? ` · pub: ${r.publishedDate}` : ''}`);
      parts.push(r.content);
      parts.push('');
    });
  }
  return parts.join('\n');
}

function formatQueryBlock(label, block) {
  const parts = [`### ${label}`];
  if (block.query) parts.push(`_Termo:_ ${block.query}`);
  if (block.error) { parts.push(`_Erro:_ ${block.error}`); return parts.join('\n'); }
  if (block.answer) parts.push(`_Resumo Tavily:_ ${block.answer}`);
  (block.results || []).forEach((r, i) => {
    parts.push(`[${i + 1}] ${r.title}`);
    parts.push(`URL: ${r.url}${r.publishedDate ? ` · pub: ${r.publishedDate}` : ''}`);
    parts.push(r.content);
  });
  return parts.join('\n');
}

export function formatDeepResearchForPrompt(research) {
  if (!research?.available) {
    return `(Pesquisa Tavily Visão de Mercado indisponível: ${research?.reason || 'sem dados'})`;
  }
  const parts = [];
  parts.push('## METADADOS DA PESQUISA');
  parts.push(`Cliente: ${research.metadados.cliente}`);
  parts.push(`Segmento: ${research.metadados.segmento || '(não informado)'}`);
  parts.push(`Geografia: ${research.metadados.geografia}`);
  parts.push(`Site oficial: ${research.metadados.site || '(não informado)'}`);
  parts.push(`Concorrentes analisados: ${research.metadados.concorrentes.join(', ') || '(nenhum fornecido — análise de categoria apenas)'}`);
  parts.push('');

  parts.push('## BLOCO — MARCA DO PROJETO (referência)');
  parts.push(formatQueryBlock('marca_projeto', research.marca_projeto || {}));
  parts.push('');

  parts.push('## BLOCO — CONCORRENTES (deep dive)');
  (research.concorrentes || []).forEach((c, i) => {
    parts.push(`### Concorrente ${i + 1}: ${c.nome}`);
    for (const [key, block] of Object.entries(c.queries || {})) {
      parts.push(formatQueryBlock(key, block));
    }
    parts.push('');
  });

  parts.push('## BLOCO — CATEGORIA / MERCADO');
  for (const [key, block] of Object.entries(research.categoria || {})) {
    parts.push(formatQueryBlock(key, block));
  }
  parts.push('');

  parts.push('## BLOCO — TENDÊNCIAS E BENCHMARKS');
  for (const [key, block] of Object.entries(research.tendencias || {})) {
    parts.push(formatQueryBlock(key, block));
  }
  parts.push('');

  return parts.join('\n');
}
