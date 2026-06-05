import { AIRouter } from './router';

// Modelo dos endpoints da entrevista guiada por IA (questions/analyze).
// Tenta o provedor primário e, em falha (ex.: 429 sem crédito), cai no
// secundário automaticamente. A ordem reflete a realidade de saldo atual
// (Anthropic funded; Gemini sem crédito) — quando o Gemini for recarregado,
// basta inverter PRIMARY/FALLBACK para voltar ao modelo mais barato.
const PRIMARY = 'claude-haiku-4-5-20251001';
const FALLBACK = 'gemini-flash';

export async function callEntrevistaModel(system, user, { temperature = 0.3, maxTokens = 1000 } = {}) {
  const messages = [{ role: 'user', content: user }];
  try {
    return await AIRouter.callModel(system, messages, { modelKey: PRIMARY, temperature, maxTokens });
  } catch (e) {
    console.warn(`[entrevista] modelo primário (${PRIMARY}) falhou, tentando ${FALLBACK}:`, e.message);
    return await AIRouter.callModel(system, messages, { modelKey: FALLBACK, temperature, maxTokens });
  }
}

// Extrai o primeiro bloco JSON ({...} ou [...]) de um texto, tolerando cercas
// de código e prosa antes/depois. Retorna o objeto/array ou null.
export function extrairJson(rawText) {
  if (!rawText) return null;
  let t = String(rawText).trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const candidatos = [t.indexOf('{'), t.indexOf('[')].filter((x) => x >= 0);
  if (!candidatos.length) return null;
  const ini = Math.min(...candidatos);
  const fim = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
  if (fim <= ini) return null;
  try {
    return JSON.parse(t.slice(ini, fim + 1));
  } catch {
    return null;
  }
}
