// lib/pdf/pdfToken.js
//
// Bloco D · TASK 4.3 — token HMAC curto usado apenas para habilitar o
// modo ?print=true da página /adm/[id]/outputs/[stage] durante a
// geração de PDF. O Chromium headless que roda server-side não tem
// cookies de sessão do usuário, então autenticamos a request com um
// token de curta duração assinado pelo próprio app.
//
// Formato do token (base64url): `{payload}.{signature}`
//   payload   = `${projetoId}:${stage}:${expMillis}`
//   signature = HMAC-SHA256(payload, secret), truncado para 16 bytes
//
// TTL padrão: 60 segundos. Mais que suficiente para o Playwright
// navegar até a URL e terminar de renderizar.

import crypto from 'crypto';

const DEFAULT_TTL_MS = 60 * 1000;

function getSecret() {
  const secret =
    process.env.PDF_EXPORT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      '[pdfToken] Nenhum segredo disponível — defina PDF_EXPORT_SECRET (ou reuse SUPABASE_SERVICE_ROLE_KEY).',
    );
  }
  return secret;
}

function base64UrlEncode(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function signPayload(payload, secret) {
  return base64UrlEncode(
    crypto.createHmac('sha256', secret).update(payload).digest().slice(0, 16),
  );
}

/**
 * Emite um token válido por {ttlMs} ms.
 *
 * @param {{ projetoId: string, stage: number | string, ttlMs?: number }} params
 * @returns {string}
 */
export function emitirTokenPdf({ projetoId, stage, ttlMs = DEFAULT_TTL_MS }) {
  if (!projetoId || stage === undefined || stage === null) {
    throw new Error('[pdfToken] projetoId e stage são obrigatórios');
  }

  const exp = Date.now() + Math.max(1000, ttlMs);
  const payload = `${projetoId}:${stage}:${exp}`;
  const signature = signPayload(payload, getSecret());

  return `${base64UrlEncode(payload)}.${signature}`;
}

/**
 * Valida um token emitido por emitirTokenPdf.
 *
 * @param {string} token
 * @param {{ projetoId: string, stage: number | string }} expected
 * @returns {boolean}
 */
export function validarTokenPdf(token, expected) {
  if (!token || typeof token !== 'string') return false;

  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return false;

    const payload = Buffer.from(
      encodedPayload.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf8');

    const [projetoId, stage, expStr] = payload.split(':');
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || exp < Date.now()) return false;

    if (String(expected.projetoId) !== projetoId) return false;
    if (String(expected.stage) !== stage) return false;

    const expected_sig = signPayload(payload, getSecret());

    // Comparação de comprimento constante para evitar timing attacks.
    const a = Buffer.from(signature);
    const b = Buffer.from(expected_sig);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (_err) {
    return false;
  }
}
