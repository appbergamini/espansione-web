// lib/output/resolveVizData.js
//
// Busca no Supabase os dados necessários para renderizar cada marker
// <!-- VIZ:xxx --> encontrado no Markdown do output do agente.
// Retorna um objeto indexado pela chave canônica ("tipo" ou
// "tipo:parametro"), consumido por components/output/OutputRenderer.js.
//
// Chamado server-side (getServerSideProps) — usa supabaseAdmin
// para bypass de RLS.

import { supabaseAdmin } from '../supabaseAdmin';
import { parseVizMarkers, vizMarkerKey, slugify } from './parseVizMarkers';
import { getCisParsed, aggregateCisByProject } from '../cis/parseCis';

const MARKERS_CIS = new Set([
  'radar_disc_socio',
  'radar_disc_time',
  'barras_jung_time',
  'heatmap_competencias_time',
  'badge_estilo_lideranca',
]);

/**
 * Resolve todos os dados de visualização presentes no conteúdo.
 *
 * @param {string} projetoId
 * @param {string} conteudo Markdown do output com markers
 * @returns {Promise<Object>} vizData indexado por chave canônica
 */
export async function resolveVizData(projetoId, conteudo) {
  const markers = parseVizMarkers(conteudo);
  if (!markers.length || !projetoId) return {};

  const tipos = new Set(markers.map(m => m.tipo));
  const vizData = {};

  // ─── CIS: uma única consulta, distribui para todos os markers ───────
  let cisAssessments = null;
  if ([...MARKERS_CIS].some(t => tipos.has(t))) {
    cisAssessments = await fetchCisAssessmentsDoProjeto(projetoId);
  }

  const agregado = cisAssessments ? aggregateCisByProject(cisAssessments) : null;

  // ─── Maturidade 360°: uma única consulta ────────────────────────────
  let maturidade360 = null;
  if (tipos.has('radar_maturidade_360')) {
    maturidade360 = await fetchMaturidade360(projetoId);
  }

  // ─── Popular vizData por marker ─────────────────────────────────────
  for (const marker of markers) {
    const chave = vizMarkerKey(marker);

    switch (marker.tipo) {
      case 'radar_disc_socio': {
        const dados = resolverRadarDiscSocio(cisAssessments, marker.parametro);
        if (dados) vizData[chave] = dados;
        break;
      }

      case 'radar_disc_time': {
        const dados = resolverRadarDiscTime(agregado);
        if (dados) vizData[chave] = dados;
        break;
      }

      case 'barras_jung_time': {
        const dados = resolverBarrasJungTime(agregado);
        if (dados) vizData[chave] = dados;
        break;
      }

      case 'heatmap_competencias_time': {
        const dados = resolverHeatmapCompetencias(agregado);
        if (dados) vizData[chave] = dados;
        break;
      }

      case 'badge_estilo_lideranca': {
        const dados = resolverBadgeEstilo(agregado);
        if (dados) vizData[chave] = dados;
        break;
      }

      case 'radar_maturidade_360': {
        if (maturidade360) vizData[chave] = maturidade360;
        break;
      }
    }
  }

  return vizData;
}

// ─── Fetchers ─────────────────────────────────────────────────────────

async function fetchCisAssessmentsDoProjeto(projetoId) {
  const { data, error } = await supabaseAdmin
    .from('cis_assessments')
    .select('id, nome, email, genero, perfil_label, scores_json')
    .eq('projeto_id', projetoId);

  if (error) {
    console.error('[resolveVizData] cis_assessments:', error.message);
    return [];
  }
  return data || [];
}

async function fetchMaturidade360(projetoId) {
  const { data, error } = await supabaseAdmin
    .from('intake_data')
    .select('valor')
    .eq('projeto_id', projetoId)
    .eq('campo', 'maturidade_360')
    .maybeSingle();

  if (error) {
    console.error('[resolveVizData] intake_data maturidade_360:', error.message);
    return null;
  }
  if (!data || !data.valor) return null;

  try {
    return typeof data.valor === 'string' ? JSON.parse(data.valor) : data.valor;
  } catch (err) {
    console.error('[resolveVizData] parse maturidade_360:', err.message);
    return null;
  }
}

// ─── Resolvers por tipo ───────────────────────────────────────────────

function resolverRadarDiscSocio(assessments, slug) {
  if (!assessments || !slug) return null;
  let alvo = assessments.find(a => slugify(a.nome) === slug);
  if (!alvo) {
    // Fallback: o agente pode emitir um slug com nome completo (ex.
    // "rafael-menezes-de-souza") enquanto o banco guarda uma versão curta
    // ("Rafael Menezes") — ou vice-versa. Aceita match se um slug for prefixo
    // do outro E a correspondência entre os sócios do projeto for única.
    const candidatos = assessments.filter(a => {
      const s = slugify(a.nome);
      return s && (s.startsWith(slug) || slug.startsWith(s));
    });
    if (candidatos.length === 1) alvo = candidatos[0];
  }
  if (!alvo) return null;

  const parsed = getCisParsed(alvo);
  if (!parsed || !parsed.disc) return null;

  return {
    D: parsed.disc.D,
    I: parsed.disc.I,
    S: parsed.disc.S,
    C: parsed.disc.C,
    dominante: parsed.disc.dominante || null,
    contexto: `Sócio ${alvo.nome || ''}`.trim(),
    confiabilidade: parsed.meta?.completo ? 'completa' : 'parcial',
  };
}

function resolverRadarDiscTime(agregado) {
  if (!agregado || !agregado.disc_coletivo) return null;
  const { D, I, S, C } = agregado.disc_coletivo;
  const dominante = argmaxChave({ D, I, S, C });
  const cobertura = calcularCobertura(agregado);

  return {
    D, I, S, C,
    dominante,
    contexto: 'Time coletivo',
    confiabilidade: cobertura >= 70 ? 'completa' : 'parcial',
  };
}

function resolverBarrasJungTime(agregado) {
  if (!agregado || !agregado.jung_coletivo) return null;
  const jung = agregado.jung_coletivo;
  return {
    E: jung.E || 0,
    I: jung.I || 0,
    S: jung.S || 0,
    N: jung.N || 0,
    T: jung.T || 0,
    F: jung.F || 0,
    J: jung.J || 0,
    P: jung.P || 0,
    total: agregado.completos || 0,
  };
}

function resolverHeatmapCompetencias(agregado) {
  if (!agregado || !agregado.competencias_coletivas) return null;
  return agregado.competencias_coletivas;
}

function resolverBadgeEstilo(agregado) {
  if (!agregado || !agregado.estilos_distribuicao) return null;
  const dist = agregado.estilos_distribuicao;

  const total = Object.values(dist).reduce((acc, n) => acc + (n || 0), 0);
  if (total === 0) return null;

  // argmax com desempate pela ordem fixa dos estilos
  const ordem = ['Executivo', 'Motivador', 'Metodico', 'Sistematico'];
  let dominante = null;
  let maxQtd = -1;
  for (const estilo of ordem) {
    const qtd = dist[estilo] || 0;
    if (qtd > maxQtd) { maxQtd = qtd; dominante = estilo; }
  }

  // Componente BadgeEstiloLideranca aceita chave Executor OU Executivo —
  // normaliza-se internamente. Mantemos Executivo (como vem do banco)
  // e passamos distribuição no formato nativo do agregado.
  return {
    dominante,
    distribuicao: {
      Executor:    dist.Executivo    || 0,
      Motivador:   dist.Motivador   || 0,
      Metodico:    dist.Metodico    || 0,
      Sistematico: dist.Sistematico || 0,
    },
    total_lideres: total,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────

function argmaxChave(obj) {
  let melhor = null;
  let valor = -Infinity;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'number' && v > valor) { valor = v; melhor = k; }
  }
  return melhor;
}

/**
 * Cobertura em %: completos / total do agregado CIS.
 * Usada para decidir rótulo 'completa' vs 'parcial'.
 */
function calcularCobertura(agregado) {
  if (!agregado || !agregado.total) return 0;
  return Math.round((agregado.completos / agregado.total) * 100);
}
