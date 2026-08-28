// =====================================================================
// Adapter: respostas do Mapa de Identidade FINAL → formato que a esteira
// dos 15 agentes espera ler.
//
// POR QUE ISTO EXISTE
// Os agentes leem `context.formularios`, um array de linhas da tabela
// `formularios`, e acessam ~35 chaves POR NOME dentro de `respostas_json`
// (r.p5_canais_ativos_hoje e afins). O FINAL grava em `id_v2_answers`,
// uma linha por resposta, com ids próprios (V30-SD-MAR-01, CONS-SD-ICP-04).
// Este módulo traduz um formato no outro.
//
// ONDE ELE ENTRA
// Em `db.getFormularios`, que é o ponto de estrangulamento único: o
// pipeline chama exatamente essa função para montar o contexto de todo
// agente (lib/ai/pipeline.js). Por isso nenhum agente precisou mudar.
//
// O QUE ELE NÃO FAZ
// Não inventa. Só entrega chave cuja pergunta declarou `chave_intake` no
// catálogo. O que não tem origem simplesmente não aparece — e o agente
// trata a ausência como já tratava (fmtTexto devolve "(em branco)").
// `lacunasDaEsteira()` lista o que ficou de fora, para isso ser visível
// em vez de silencioso.
//
// A FORMA IMPORTA TANTO QUANTO O VALOR
// fmtLista/fmtMultiselect (leanClusters.js) devolvem "(em branco)" para
// qualquer coisa que não seja Array. Entregar string numa chave de lista
// é uma falha silenciosa: o cliente respondeu e o agente não vê. O
// catálogo garante a forma (teste em __tests__/moduloConsultoria.test.js)
// e aqui a gente preserva.
// =====================================================================

import { CATALOGO_IDENTIDADE } from './catalog.generated.js';

// tipo de formulário do intake → público do FINAL
export const TIPO_PARA_PUBLICO = {
  intake_socios: 'socios',
  intake_colaboradores: 'colaboradores',
  intake_clientes: 'clientes',
};

/** Mesma precedência de session.js/finalize.js: json → num → text. */
export function valorDaResposta(row) {
  if (row?.value_json !== null && row?.value_json !== undefined) return row.value_json;
  if (row?.value_num !== null && row?.value_num !== undefined) return row.value_num;
  return row?.value_text ?? null;
}

function vazio(v) {
  if (v === null || v === undefined) return true;
  if (Array.isArray(v)) return v.filter((x) => String(x ?? '').trim()).length === 0;
  return String(v).trim() === '';
}

/**
 * Converte o valor cru na forma que o agente espera para aquela pergunta.
 * - lista → array de strings não-vazias
 * - seleção única com códigos → o CÓDIGO, não o rótulo (o Agente 13 lê
 *   'ate_50k', não 'Até R$ 50 mil/ano')
 * - resto → string
 */
export function normalizarValor(pergunta, valor) {
  const tiposDeArray = ['multipla', 'multipla_ate3', 'ranking_top3', 'aberta_curta_multipla', 'aberta_estruturada_3'];
  if (tiposDeArray.includes(pergunta.response_type)) {
    const arr = Array.isArray(valor) ? valor : [valor];
    return arr.map((x) => String(x ?? '').trim()).filter(Boolean);
  }
  if (pergunta.response_type === 'selecao_unica' && pergunta.opcoes_valores?.length) {
    const i = pergunta.opcoes.indexOf(String(valor));
    if (i >= 0 && pergunta.opcoes_valores[i]) return pergunta.opcoes_valores[i];
  }
  return typeof valor === 'string' ? valor : String(valor);
}

/**
 * Núcleo PURO — nenhum acesso a banco, para poder ser testado com um
 * objeto na mão.
 *
 * @param {string} publico  socios | colaboradores | clientes
 * @param {Object} respostas  { [question_id]: valor já desembrulhado }
 * @returns {Object} respostas_json no formato do intake
 */
export function respostasIntakeDe(publico, respostas = {}) {
  const perguntas = CATALOGO_IDENTIDADE.filter(
    (q) => q.publico === publico && q.chave_intake,
  );
  const out = {};
  for (const q of perguntas) {
    const bruto = respostas[q.id];
    if (vazio(bruto)) continue;
    out[q.chave_intake] = normalizarValor(q, bruto);
  }
  // O Agente 15 procura o nome do sócio-fundador em `_respondente_nome`
  // (leanClusters procura em `p1_nome_completo`). Mesma resposta, duas
  // chaves — espelhar aqui evita uma segunda pergunta no catálogo só para
  // isso, que a guarda de chave duplicada do builder recusaria.
  if (out.p1_nome_completo && !out._respondente_nome) {
    out._respondente_nome = out.p1_nome_completo;
  }
  if (out.a1_nome && !out._respondente_nome) {
    out._respondente_nome = out.a1_nome;
  }
  return out;
}

/**
 * Chaves que a esteira lê e que este público NÃO consegue fornecer.
 * Serve para o gap ser visível: sem isto, um bloco que ninguém mapeou
 * vira "(em branco)" no prompt do agente e ninguém fica sabendo.
 *
 * @param {string[]} chavesQueOsAgentesLeem
 */
export function lacunasDaEsteira(publico, chavesQueOsAgentesLeem = []) {
  const cobertas = new Set(
    CATALOGO_IDENTIDADE.filter((q) => q.publico === publico && q.chave_intake)
      .map((q) => q.chave_intake),
  );
  return chavesQueOsAgentesLeem.filter((k) => !cobertas.has(k));
}

/**
 * Monta as linhas no formato de `formularios` a partir das respostas de
 * cada respondente. Puro também — recebe os dados já lidos.
 *
 * @param {Object} params
 * @param {string} params.projetoId
 * @param {string} params.tipo            intake_socios | intake_colaboradores | intake_clientes
 * @param {Array}  params.respondentes    [{ id, completed_at, created_at }]
 * @param {Array}  params.answers         linhas cruas de id_v2_answers
 */
export function montarFormularios({ projetoId, tipo, respondentes = [], answers = [] }) {
  const publico = TIPO_PARA_PUBLICO[tipo];
  if (!publico) return [];

  const porRespondente = new Map();
  for (const a of answers) {
    if (!porRespondente.has(a.respondent_id)) porRespondente.set(a.respondent_id, {});
    porRespondente.get(a.respondent_id)[a.question_id] = valorDaResposta(a);
  }

  const linhas = [];
  respondentes.forEach((r, i) => {
    const respostas = porRespondente.get(r.id) || {};
    if (Object.keys(respostas).length === 0) return;
    const respostas_json = respostasIntakeDe(publico, respostas);
    linhas.push({
      id: r.id,
      projeto_id: projetoId,
      tipo,
      // Sem identificação nominal (o instrumento do funil é anônimo) o
      // respondente vira um ordinal. É o suficiente para o agente separar
      // as vozes; não é suficiente para parear com o Mapeamento
      // Comportamental — por isso o módulo de consultoria pergunta o nome.
      respondente: respostas_json._respondente_nome || `${rotulo(publico)} ${i + 1}`,
      respostas_json,
      created_at: r.completed_at || r.created_at || null,
      // Marca a origem: quem depurar um contexto de agente precisa saber
      // que estas linhas não vieram da tabela `formularios`.
      _origem: 'identidade_final',
    });
  });
  return linhas;
}

function rotulo(publico) {
  if (publico === 'socios') return 'Sócio';
  if (publico === 'colaboradores') return 'Colaborador';
  return 'Cliente';
}
