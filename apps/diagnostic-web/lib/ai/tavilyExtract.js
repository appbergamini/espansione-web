// lib/ai/tavilyExtract.js
// Wrapper minimalista do Tavily Extract.
// Usado pelo Agente 5 v2 para captura literal do conteúdo bruto dos sites
// institucionais dos 5 concorrentes principais.

function cleanKey() {
  return (process.env.TAVILY_API_KEY || '').replace(/[\r\n\s]/g, '');
}

/**
 * Extrai conteúdo bruto de até N URLs via Tavily Extract.
 *
 * @param {string[]} urls  URLs a extrair (máx 20 por chamada)
 * @returns {Promise<{ results: Array<{url, raw_content}>, failed_results: Array }>}
 */
export async function tavilyExtract(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    return { results: [], failed_results: [] };
  }
  const apiKey = cleanKey();
  if (!apiKey) {
    return { results: [], failed_results: urls.map(u => ({ url: u, error: 'TAVILY_API_KEY ausente' })) };
  }

  try {
    const resp = await fetch('https://api.tavily.com/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        urls: urls.slice(0, 20),
        extract_depth: 'advanced',
        include_images: false,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      console.error('[tavilyExtract] HTTP', resp.status, text.slice(0, 200));
      return {
        results: [],
        failed_results: urls.map(u => ({ url: u, error: `HTTP ${resp.status}` })),
      };
    }
    return await resp.json();
  } catch (err) {
    console.error('[tavilyExtract] erro:', err.message);
    return {
      results: [],
      failed_results: urls.map(u => ({ url: u, error: err.message })),
    };
  }
}

/**
 * Formata o conteúdo extraído para consumo pelo prompt do agente.
 * Trunca em ~8k chars por URL para não estourar contexto.
 */
export function formatarExtractParaPrompt(resultadosExtract) {
  if (!resultadosExtract?.results?.length) return '(nenhum conteúdo extraído)';

  return resultadosExtract.results.map(r => {
    const conteudo = r.raw_content || '(sem conteúdo)';
    const truncado = conteudo.length > 8000 ? conteudo.substring(0, 8000) + '…[truncado]' : conteudo;
    return `--- FONTE: ${r.url} ---\n${truncado}`;
  }).join('\n\n');
}
