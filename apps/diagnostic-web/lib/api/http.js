// Helpers finos para handlers de API (Next Pages Router).
// Padroniza: roteamento por método, 405, try/catch → 500, e erros tipados.
// Mantém a forma de resposta atual: { success: false, error } com status.

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const httpErrors = {
  badRequest: (m = 'Requisição inválida') => new HttpError(400, m),
  unauthorized: (m = 'Não autenticado') => new HttpError(401, m),
  forbidden: (m = 'Sem permissão') => new HttpError(403, m),
  notFound: (m = 'Não encontrado') => new HttpError(404, m),
  conflict: (m = 'Conflito') => new HttpError(409, m),
};

/**
 * Cria um handler que roteia por método HTTP e trata erros de forma uniforme.
 * @param {Record<string, (req, res) => Promise<any>>} handlers - ex: { GET, POST }
 *
 *   export default createApiHandler({
 *     async GET(req, res) { ... res.status(200).json(...) },
 *     async POST(req, res) { if (!x) throw httpErrors.badRequest(); ... },
 *   });
 */
export function createApiHandler(handlers) {
  const metodos = Object.keys(handlers);
  return async function handler(req, res) {
    const fn = handlers[req.method];
    if (!fn) {
      res.setHeader('Allow', metodos.join(', '));
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    try {
      return await fn(req, res);
    } catch (e) {
      if (e instanceof HttpError) {
        return res.status(e.status).json({ success: false, error: e.message });
      }
      console.error('[api]', req.method, req.url, e?.message || e);
      return res.status(500).json({ success: false, error: e?.message || 'Erro interno' });
    }
  };
}

/**
 * Lê campos do body (POST) ou da query (GET), exigindo os obrigatórios.
 * @returns objeto com os campos pedidos; lança 400 se faltar obrigatório.
 */
export function parseInput(req, { required = [], optional = [] } = {}) {
  const src = req.method === 'GET' ? (req.query || {}) : (req.body || {});
  const out = {};
  for (const k of required) {
    const v = src[k];
    if (v === undefined || v === null || v === '') throw httpErrors.badRequest(`Campo obrigatório: ${k}`);
    out[k] = v;
  }
  for (const k of optional) out[k] = src[k];
  return out;
}
