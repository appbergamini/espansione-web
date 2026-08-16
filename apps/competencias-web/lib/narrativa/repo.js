// =====================================================================
// Cache da narrativa. Camada fina: só I/O.
// =====================================================================
import { supabaseAdmin } from '../supabaseAdmin.js';

export const COLS_NARRATIVA =
  'narrativa, narrativa_status, narrativa_modelo, narrativa_versao, narrativa_em, narrativa_iniciada_em';

/** Uma geração que passou disto morreu no meio; a trava pode ser tomada. */
const TRAVA_MINUTOS = 3;

function db() {
  if (!supabaseAdmin) throw new Error('Supabase não configurado nesta zona.');
  return supabaseAdmin;
}

export async function narrativaDaSessao(assessmentId) {
  const { data, error } = await db()
    .from('comp_assessments').select(COLS_NARRATIVA).eq('id', assessmentId).maybeSingle();
  if (error) throw error;
  return data || null;
}

/** Cache aproveitável: gerada, e gerada pela versão de prompt que está no ar. */
export function aproveitavel(linha, versaoAtual) {
  return Boolean(
    linha &&
    linha.narrativa_status === 'ok' &&
    linha.narrativa &&
    linha.narrativa_versao === versaoAtual
  );
}

/**
 * Trava condicional. É um UPDATE com WHERE composto: o Postgres resolve a
 * corrida, não o JavaScript. Devolve true só para quem pegou a trava —
 * dois requests simultâneos não geram (nem cobram) em dobro.
 *
 * Pega a trava quem encontrar a narrativa: ausente, falhada, de versão
 * antiga, ou travada há mais de TRAVA_MINUTOS (processo que morreu).
 */
export async function tentarTravar(assessmentId, versaoAtual) {
  const limite = new Date(Date.now() - TRAVA_MINUTOS * 60_000).toISOString();
  const { data, error } = await db()
    .from('comp_assessments')
    .update({ narrativa_status: 'gerando', narrativa_iniciada_em: new Date().toISOString() })
    .eq('id', assessmentId)
    .or([
      'narrativa_status.is.null',
      'narrativa_status.eq.falhou',
      `narrativa_versao.neq.${versaoAtual}`,
      `and(narrativa_status.eq.gerando,narrativa_iniciada_em.lt.${limite})`,
    ].join(','))
    .select('id');
  if (error) throw error;
  return (data || []).length > 0;
}

export async function gravarNarrativa(assessmentId, { narrativa, modelo, versao }) {
  const { error } = await db()
    .from('comp_assessments')
    .update({
      narrativa,
      narrativa_status: 'ok',
      narrativa_modelo: modelo,
      narrativa_versao: versao,
      narrativa_em: new Date().toISOString(),
    })
    .eq('id', assessmentId);
  if (error) throw error;
}

/**
 * Marca a falha e SOLTA a trava. Sem isso, um erro transitório da API
 * deixaria a sessão presa em 'gerando' por três minutos a cada tentativa.
 */
export async function marcarFalha(assessmentId) {
  const { error } = await db()
    .from('comp_assessments')
    .update({ narrativa_status: 'falhou', narrativa_iniciada_em: null })
    .eq('id', assessmentId);
  if (error) throw error;
}
