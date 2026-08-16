// =====================================================================
// Persistência do Mapeamento Comportamental. Regra em sessao.js.
// =====================================================================
import { supabaseAdmin } from '../supabaseAdmin.js';
import { calcularScores, derivarPilares, PILARES } from '@espansione/cis';
import { montarRaw, estaCompleto } from './sessao.js';

const COLS = 'assessment_id, status, respostas, scores_json, iniciado_em, concluido_em';

function db() {
  if (!supabaseAdmin) throw new Error('Supabase não configurado nesta zona.');
  return supabaseAdmin;
}

/**
 * ORDEM IMPOSTA. O comportamental fica bloqueado até o teste concluir.
 * Motivo: quem faz o comportamental antes chega ao teste já se lendo por
 * características, e contamina a autoavaliação.
 */
export function liberado(assessment) {
  return assessment?.status === 'done';
}

export async function garantir(assessmentId) {
  const client = db();
  const { data } = await client.from('comp_comportamental').select(COLS).eq('assessment_id', assessmentId).maybeSingle();
  if (data) return data;

  const { data: nova, error } = await client
    .from('comp_comportamental')
    .insert([{ assessment_id: assessmentId, status: 'not_started', respostas: {} }])
    .select(COLS).single();
  if (error) throw error;
  return nova;
}

export async function gravarResposta(assessmentId, itemId, payload) {
  const client = db();
  const atual = await garantir(assessmentId);
  const respostas = { ...(atual.respostas || {}), [itemId]: payload };

  const patch = { respostas, status: 'in_progress' };
  if (!atual.iniciado_em) patch.iniciado_em = new Date().toISOString();

  const { data, error } = await client
    .from('comp_comportamental').update(patch).eq('assessment_id', assessmentId).select(COLS).single();
  if (error) throw error;
  return data;
}

/**
 * Fecha o instrumento: calcula, congela os 4 pilares e marca concluído.
 * Congelar em comp_pilares (em vez de recalcular na hora do relatório)
 * é o que mantém um relatório antigo reproduzível.
 *
 * Só os 4 pilares alimentam o fluxo. As 16 características ficam em
 * scores_json apenas como léxico e para o relatório avulso do instrumento —
 * não é preciso rodar a matriz no caminho do Teste de Competências.
 */
export async function fechar(assessmentId, respostas) {
  if (!estaCompleto(respostas)) throw new Error('instrumento incompleto');
  const client = db();

  const scores = calcularScores(montarRaw(respostas));
  const pilares = derivarPilares(scores);

  const { error: e1 } = await client
    .from('comp_comportamental')
    .update({ status: 'done', scores_json: scores, concluido_em: new Date().toISOString() })
    .eq('assessment_id', assessmentId);
  if (e1) throw e1;

  const linhas = PILARES.map((p) => ({
    assessment_id: assessmentId,
    pilar: p,
    natural_score: pilares[p].natural,
    em_contexto: pilares[p].emContexto,
  }));
  const { error: e2 } = await client
    .from('comp_pilares').upsert(linhas, { onConflict: 'assessment_id,pilar' });
  if (e2) throw e2;

  return { scores, pilares };
}

export async function pilaresDaSessao(assessmentId) {
  const { data, error } = await db()
    .from('comp_pilares').select('pilar, natural_score, em_contexto').eq('assessment_id', assessmentId);
  if (error) throw error;
  if (!data?.length) return null;
  return Object.fromEntries(data.map((r) => [r.pilar, { natural: r.natural_score, emContexto: r.em_contexto }]));
}
