// lib/tokens/respondenteToken.js
//
// TASK FIX.1 — fonte única de geração, validação e renovação de
// tokens de respondentes. Persistidos em `respondentes.token` +
// `respondentes.token_expira_em` (ver migration 10_respondentes_token.sql).
//
// Contrato:
//   - Token tem 48 caracteres hex (24 bytes random) — gerado com
//     crypto.randomBytes no servidor.
//   - Imutável ao longo da vida do respondente.
//   - Expira em EXPIRACAO_DIAS. Reenvio de convite RENOVA a expiração
//     sem trocar o token (preserva respostas parciais).
//
// Consumido por: pages/api/respondentes.js (criação), by-token.js
// (validação), convites/enviar-batch.js + convites/form-link.js
// (envio e renovação), pages/form/{socios,colaboradores,clientes}.js
// (tratamento de erro).

import crypto from 'crypto';

const TOKEN_BYTES = 24;     // → 48 chars hex
const EXPIRACAO_DIAS = 30;

/**
 * Gera token novo + data de expiração. Use na criação do respondente.
 * @returns {{ token: string, token_expira_em: string }} ISO string na expiração
 */
export function gerarTokenRespondente() {
  const token = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  return {
    token,
    token_expira_em: calcularExpiracao(),
  };
}

/**
 * Verifica se um token ainda é válido (não expirou).
 * Tolerante a strings ISO ou Date.
 * @param {string|Date|null} tokenExpiraEm
 * @returns {boolean}
 */
export function tokenValido(tokenExpiraEm) {
  if (!tokenExpiraEm) return false;
  const exp = tokenExpiraEm instanceof Date
    ? tokenExpiraEm.getTime()
    : new Date(tokenExpiraEm).getTime();
  if (!Number.isFinite(exp)) return false;
  return exp > Date.now();
}

/**
 * Renova a expiração preservando o token. Usado quando o admin reenvia
 * um convite: o respondente que já começou a responder continua onde
 * parou — o token é o mesmo, só a janela de validade foi estendida.
 * @returns {{ token_expira_em: string }}
 */
export function renovarExpiracao() {
  return { token_expira_em: calcularExpiracao() };
}

/**
 * Constantes de erro usadas pelas APIs de token. Payloads têm formato
 * compatível com `res.status(xxx).json({ success: false, ...ERRO })`.
 */
export const ERROS_TOKEN = {
  AUSENTE: {
    codigo: 'TOKEN_AUSENTE',
    mensagem: 'Link inválido — token ausente. Solicite um novo convite ao administrador do projeto.',
  },
  NAO_EXISTE: {
    codigo: 'TOKEN_NAO_EXISTE',
    mensagem: 'Link inválido. Solicite um novo convite ao administrador do projeto.',
  },
  EXPIRADO: {
    codigo: 'TOKEN_EXPIRADO',
    mensagem: 'Este link expirou. Solicite um novo convite ao administrador do projeto.',
  },
};

// ─── internos ─────────────────────────────────────────────────────

function calcularExpiracao() {
  const d = new Date();
  d.setDate(d.getDate() + EXPIRACAO_DIAS);
  return d.toISOString();
}
