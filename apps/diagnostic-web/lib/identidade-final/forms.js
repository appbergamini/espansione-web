// =====================================================================
// Montagem de formulário do Mapa de Identidade (FINAL) por público.
// Ordem = ordem do catálogo (Excel); bloco aberto dos sócios vem ao fim.
// =====================================================================
import { perguntasPorPublico } from './catalog.js';

// eslint-disable-next-line no-unused-vars
export function montarFormulario(publico, { lider = false, perfil = 'funil' } = {}) {
  // O FINAL não tem bloco de líder adicional (33 fixas p/ colaboradores);
  // o parâmetro `lider` fica por compatibilidade de assinatura com as APIs.
  //
  // `perfil` decide se o módulo de consultoria entra. Default 'funil' —
  // quem comprou pelo site responde só o instrumento. Só quem chama
  // dizendo 'consultoria' recebe as perguntas extras, e essa é a decisão
  // certa como default: acrescentar pergunta a quem não deveria vê-las é
  // pior do que faltar (o adapter avisa quando falta).
  const todas = perguntasPorPublico(publico);
  if (perfil === 'consultoria') return todas;
  return todas.filter((q) => q.perfil !== 'consultoria');
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
