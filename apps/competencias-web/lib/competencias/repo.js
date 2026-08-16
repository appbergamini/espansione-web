// =====================================================================
// Persistência da sessão do teste. Camada fina: a REGRA vive em sessao.js,
// que é puro. Aqui só entra I/O — o que mantém a lógica testável sem banco.
// =====================================================================
import crypto from 'node:crypto';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { CATALOGO_VERSAO, FAIXAS_VERSAO } from './catalog.js';
import { TOLERANCIA_PADRAO } from './faixas.js';

const COLS = 'id, token, email, projeto_id, pagamento_id, status, origem, ordem_seed, criterio_corte, catalogo_versao, faixas_versao, delta_versao, delta_valor, iniciado_em, concluido_em';

function db() {
  if (!supabaseAdmin) throw new Error('Supabase não configurado nesta zona.');
  return supabaseAdmin;
}

const novoToken = () => crypto.randomBytes(24).toString('hex');

/**
 * Cria (ou recupera) a sessão do teste.
 * Idempotente por pagamento_id quando ele existe — o fulfillment pode ser
 * reprocessado sem duplicar sessão nem perder resposta já dada.
 */
export async function criarSessao({ email = null, projetoId = null, pagamentoId = null, origem = 'pago' } = {}) {
  const client = db();

  if (pagamentoId) {
    const { data: existente } = await client
      .from('comp_assessments').select(COLS)
      .eq('pagamento_id', pagamentoId).order('created_at', { ascending: false })
      .limit(1).maybeSingle();
    if (existente) return existente;
  }

  const { data, error } = await client
    .from('comp_assessments')
    .insert([{
      token: novoToken(),
      email: email ? String(email).trim().toLowerCase() : null,
      projeto_id: projetoId,
      pagamento_id: pagamentoId,
      origem,
      status: 'not_started',
      ordem_seed: crypto.randomBytes(8).toString('hex'),
      catalogo_versao: CATALOGO_VERSAO,
      faixas_versao: FAIXAS_VERSAO,
      delta_versao: TOLERANCIA_PADRAO.versao,
      delta_valor: TOLERANCIA_PADRAO.delta,
    }])
    .select(COLS).single();
  if (error) throw error;
  return data;
}

export async function sessaoPorToken(token) {
  const { data, error } = await db()
    .from('comp_assessments').select(COLS).eq('token', token).maybeSingle();
  if (error) throw error;
  return data || null;
}

/** Respostas no formato que sessao.js consome: { item_id: payload }. */
export async function respostasDaSessao(assessmentId) {
  const { data, error } = await db()
    .from('comp_answers').select('item_id, etapa, payload')
    .eq('assessment_id', assessmentId);
  if (error) throw error;
  return Object.fromEntries(
    (data || [])
      // `__escolha_aprofundamento` é resquício do desenho antigo, em que o
      // respondente desempatava o corte. Sessões daquela época ainda têm a
      // linha; ela não é resposta de tela nenhuma.
      .filter((r) => !String(r.item_id).startsWith('__'))
      .map((r) => [r.item_id, r.payload])
  );
}

/** Grava uma resposta. Reenvio da mesma tela sobrescreve, não duplica. */
export async function gravarResposta(assessmentId, { itemId, etapa, payload, ordemExibida = null }) {
  const client = db();
  const { error } = await client
    .from('comp_answers')
    .upsert([{
      assessment_id: assessmentId,
      item_id: itemId,
      etapa,
      payload,
      ordem_exibida: ordemExibida,
      respondido_em: new Date().toISOString(),
    }], { onConflict: 'assessment_id,item_id' });
  if (error) throw error;

  await client.from('comp_assessments')
    .update({ status: 'in_progress', iniciado_em: new Date().toISOString() })
    .eq('id', assessmentId).is('iniciado_em', null);
  await client.from('comp_assessments')
    .update({ status: 'in_progress' })
    .eq('id', assessmentId).eq('status', 'not_started');
}

/**
 * Fecha a etapa do teste: grava os 12 scores e o critério do corte.
 * NÃO gera relatório — o relatório exige os dois instrumentos concluídos.
 */
export async function fecharEtapaTeste(assessmentId, { consolidado, selecao, niveis }) {
  const client = db();

  const linhas = consolidado.ranking.map((r) => ({
    assessment_id: assessmentId,
    competencia_key: r.chave,
    capacidade: r.capacidade,
    score_bruto: r.score,
    posicao: r.posicao,
    nivel_afirmado: niveis?.[r.chave]?.nivel ?? null,
    confianca_nivel: niveis?.[r.chave]?.confianca ?? null,
  }));

  const { error: e1 } = await client.from('comp_scores')
    .upsert(linhas, { onConflict: 'assessment_id,competencia_key' });
  if (e1) throw e1;

  const { error: e2 } = await client.from('comp_assessments')
    .update({ status: 'done', concluido_em: new Date().toISOString(), criterio_corte: selecao?.criterio || null })
    .eq('id', assessmentId);
  if (e2) throw e2;
}

/** Estado cru para o painel do avaliador e para o motor de cruzamento. */
export async function scoresDaSessao(assessmentId) {
  const { data, error } = await db()
    .from('comp_scores').select('competencia_key, capacidade, score_bruto, posicao, nivel_afirmado, confianca_nivel')
    .eq('assessment_id', assessmentId);
  if (error) throw error;
  return data || [];
}
