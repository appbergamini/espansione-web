// =====================================================================
// Montagem de formulário do Mapa de Identidade (FINAL) por público.
// Ordem = ordem do catálogo (Excel); bloco aberto dos sócios vem ao fim.
// =====================================================================
import { perguntasPorPublico } from './catalog.js';

// eslint-disable-next-line no-unused-vars
export function montarFormulario(publico, { lider = false } = {}) {
  // O FINAL não tem bloco de líder adicional (33 fixas p/ colaboradores);
  // o parâmetro `lider` fica por compatibilidade de assinatura com as APIs.
  return perguntasPorPublico(publico);
}

// perguntas obrigatórias ainda não respondidas por UM respondente.
// Recebe a LISTA de perguntas (assinatura usada por session/finalize).
export function obrigatoriasFaltando(perguntas, answers = {}) {
  const faltando = [];
  for (const q of perguntas) {
    if (!q.obrigatoria) continue;
    if (q.regra_condicional) {
      const dep = answers[q.regra_condicional.depende];
      if (!q.regra_condicional.valores.includes(String(dep))) continue;
    }
    const v = answers[q.id];
    const respondida = q.response_type.startsWith('escala')
      ? typeof v === 'number'
      : v != null && v !== '' && !(Array.isArray(v) && v.length === 0);
    if (!respondida) faltando.push(q.id);
  }
  return faltando;
}
