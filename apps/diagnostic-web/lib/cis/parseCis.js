// lib/cis/parseCis.js
//
// Normaliza um registro de `cis_assessments` em um objeto de schema estável
// para consumo por agentes — especialmente Agente 2 (Consolidado VI).
//
// ─── AUDITORIA (2026-04-22) ────────────────────────────────────────────────
// Queries executadas:
//   select count(*), count(scores_json) from cis_assessments
//   select distinct jsonb_object_keys(scores_json) from cis_assessments ...
//   select id, jsonb_object_keys(scores_json) from cis_assessments group by id, chave
//   select jsonb_pretty(scores_json) from cis_assessments limit 3
//
// Banco tinha 11 registros com scores_json não-nulo — e DOIS FORMATOS conviviam:
//
// ── FORMATO A (NOVO — 3 registros mais recentes, compatível com a spec) ──
//   disc     → { D, I, S, C } self, scores 0-100
//   dA       → { D, I, S, C } adaptado (ambiente externo), scores 0-100
//   comp     → 16 competências DISC-alinhadas em português capitalizado com
//              acentos: "Ousadia", "Comando", "Objetividade", "Assertividade",
//              "Empatia", "Paciência", "Persistência", "Planejamento",
//              "Persuasão", "Extroversão", "Entusiasmo", "Sociabilidade",
//              "Organização", "Detalhismo", "Prudência", "Concentração"
//   lead     → OBJETO com scores por estilo (não string):
//              { "Executivo", "Motivador", "Metódico", "Sistemático" }
//   profile  → string curta tipo "DI" (derivação do DISC, NÃO é Jung/MBTI)
//
// ── FORMATO B (LEGADO — 8 registros antigos, instrumento descontinuado) ──
//   disc / discA     → mesmos nomes D/I/S/C (compatível)
//   competencies     → 16 competências GENÉRICAS de liderança em snake_case
//                      lowercase, scores 1-10: "execucao", "inovacao",
//                      "delegacao", "negociacao", "comunicacao", "criatividade",
//                      "gestao_pessoas", "tomada_decisao", etc.
//                      NÃO mapeia para o schema-alvo.
//   leadership       → { analitica, executora, relacional, visionaria }
//                      estilos diferentes dos atuais.
//   profileLabel     → rótulo compacto tipo "Técnico Discreto — Precisão"
//
// Decisão: parser prioriza Formato A. Registros do Formato B preservam DISC
// (o schema D/I/S/C é idêntico), mas as competências/estilos não se mapeiam —
// ficam `null` e `meta.completo = false` por consequência (DISC completo
// exige >= 12 das 16 competências DISC-alinhadas). Isso faz com que o agregado
// do Agente 2 ignore assessments legados, que é a decisão correta: o schema
// novo só deve operar sobre o instrumento novo.
//
// Jung (MBTI) NÃO está disponível nos dois formatos. `parseJung` retorna nulls;
// o bloco fica no schema para caso o instrumento seja enriquecido depois.
//
// ─── Princípios ────────────────────────────────────────────────────────────
// - Nunca lançar exceção por dados ausentes — retornar null nos campos.
// - Sempre preencher `meta.completo` para o agente saber a confiabilidade.
// - Normalizar nomes de competências para snake_case sem acentos.

export const COMPETENCIAS_KEYS = [
  'ousadia', 'comando', 'objetividade', 'assertividade',
  'empatia', 'paciencia', 'persistencia', 'planejamento',
  'persuasao', 'extroversao', 'entusiasmo', 'sociabilidade',
  'organizacao', 'detalhismo', 'prudencia', 'concentracao',
];

// Estilos de liderança válidos (mantidos como estão no banco).
export const ESTILOS_VALIDOS = ['Executivo', 'Motivador', 'Metodico', 'Sistematico'];

/**
 * Normaliza chave para snake_case sem acentos.
 * "Paciência" → "paciencia", "Organização" → "organizacao".
 */
function normalizeKey(key) {
  return String(key || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

/**
 * Extrai scores DISC (self) de scores_json.
 */
function parseDisc(scores_json) {
  const disc = { D: null, I: null, S: null, C: null, dominante: null };
  if (!scores_json) return disc;

  const source = scores_json.disc || scores_json.DISC || {};
  for (const key of ['D', 'I', 'S', 'C']) {
    const val = source[key] ?? source[key.toLowerCase()];
    if (typeof val === 'number') disc[key] = val;
  }

  const valid = Object.entries(disc)
    .filter(([k, v]) => ['D', 'I', 'S', 'C'].includes(k) && v !== null);
  if (valid.length > 0) {
    disc.dominante = valid.reduce((max, curr) => (curr[1] > max[1] ? curr : max))[0];
  }
  return disc;
}

/**
 * Extrai DISC adaptado (comportamento sob pressão / ambiente externo).
 * No banco: chave `dA` (ou `discA`). Estrutura igual ao `disc` self.
 */
function parseDiscAdaptado(scores_json) {
  const disc = { D: null, I: null, S: null, C: null, dominante: null };
  if (!scores_json) return disc;

  const source = scores_json.dA || scores_json.discA || scores_json.disc_adaptado || {};
  for (const key of ['D', 'I', 'S', 'C']) {
    const val = source[key] ?? source[key.toLowerCase()];
    if (typeof val === 'number') disc[key] = val;
  }

  const valid = Object.entries(disc)
    .filter(([k, v]) => ['D', 'I', 'S', 'C'].includes(k) && v !== null);
  if (valid.length > 0) {
    disc.dominante = valid.reduce((max, curr) => (curr[1] > max[1] ? curr : max))[0];
  }
  return disc;
}

/**
 * Extrai tipo Jung (MBTI) — mantido para compatibilidade futura.
 * Instrumento atual NÃO produz Jung; retorna campos nulls.
 */
function parseJung(scores_json) {
  const jung = {
    extroversao_introversao: null,
    sensacao_intuicao: null,
    pensamento_sentimento: null,
    julgamento_percepcao: null,
    tipo: null,
  };
  if (!scores_json) return jung;

  const source = scores_json.jung || scores_json.mbti || null;
  if (!source) return jung;

  if (typeof source.tipo === 'string' && source.tipo.length === 4) {
    jung.tipo = source.tipo.toUpperCase();
    jung.extroversao_introversao = jung.tipo[0];
    jung.sensacao_intuicao = jung.tipo[1];
    jung.pensamento_sentimento = jung.tipo[2];
    jung.julgamento_percepcao = jung.tipo[3];
    return jung;
  }
  if (source.EI) jung.extroversao_introversao = source.EI;
  if (source.SN) jung.sensacao_intuicao = source.SN;
  if (source.TF) jung.pensamento_sentimento = source.TF;
  if (source.JP) jung.julgamento_percepcao = source.JP;

  if (jung.extroversao_introversao && jung.sensacao_intuicao &&
      jung.pensamento_sentimento && jung.julgamento_percepcao) {
    jung.tipo = jung.extroversao_introversao + jung.sensacao_intuicao +
                jung.pensamento_sentimento + jung.julgamento_percepcao;
  }
  return jung;
}

/**
 * Extrai as 16 competências, normalizando nomes (PT com acento → snake_case).
 */
function parseCompetencias(scores_json) {
  const result = {};
  for (const key of COMPETENCIAS_KEYS) result[key] = null;
  if (!scores_json) return result;

  const source = scores_json.comp
              || scores_json.competencias
              || scores_json.competencies
              || scores_json.competencias_scores
              || {};
  for (const [rawKey, value] of Object.entries(source)) {
    const normalized = normalizeKey(rawKey);
    if (COMPETENCIAS_KEYS.includes(normalized) && typeof value === 'number') {
      result[normalized] = value;
    }
  }
  return result;
}

/**
 * Extrai estilo de liderança dominante.
 * No banco: `lead` é OBJETO com scores por estilo. Tomamos o de maior score.
 * Aceita também string direta em `estilo_lideranca` / `estiloLideranca` / `leadership_style`.
 */
function parseEstiloLideranca(scores_json) {
  if (!scores_json) return null;

  // Caso 1: string direta
  const direto = scores_json.estilo_lideranca
              || scores_json.estiloLideranca
              || scores_json.leadership_style
              || null;
  if (typeof direto === 'string' && direto.trim()) {
    return normalizeEstilo(direto);
  }

  // Caso 2: objeto com scores (formato real no banco)
  const obj = scores_json.lead || scores_json.leadership || null;
  if (obj && typeof obj === 'object') {
    let max = null;
    for (const [rawKey, value] of Object.entries(obj)) {
      if (typeof value !== 'number') continue;
      if (max === null || value > max.value) max = { key: rawKey, value };
    }
    if (max) return normalizeEstilo(max.key);
  }
  return null;
}

function normalizeEstilo(raw) {
  const base = String(raw)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')       // remove acentos
    .trim()
    .toLowerCase();
  const map = {
    executivo: 'Executivo',
    executor:  'Executivo',   // compatibilidade com spec original
    motivador: 'Motivador',
    metodico:  'Metodico',
    sistematico: 'Sistematico',
  };
  return map[base] || null;
}

/**
 * Completude: DISC completo (4 scores) + pelo menos 12 das 16 competências.
 */
function calcularCompletude(disc, competencias) {
  const discCompleto = ['D', 'I', 'S', 'C'].every(k => typeof disc[k] === 'number');
  const preenchidas = Object.values(competencias).filter(v => typeof v === 'number').length;
  return discCompleto && preenchidas >= 12;
}

/**
 * Função principal. Recebe um registro de cis_assessments, retorna schema estável.
 * Retorna null se o argumento for null/undefined.
 */
export function getCisParsed(assessment) {
  if (!assessment) return null;
  const scores = assessment.scores_json || {};

  const disc = parseDisc(scores);
  const disc_adaptado = parseDiscAdaptado(scores);
  const jung = parseJung(scores);
  const competencias = parseCompetencias(scores);
  const estilo_lideranca = parseEstiloLideranca(scores);

  return {
    disc,
    disc_adaptado,
    jung,
    competencias,
    estilo_lideranca,
    perfil_label: assessment.perfil_label || scores.profile || scores.profileLabel || null,
    meta: {
      assessment_id: assessment.id,
      participante_nome: assessment.nome || assessment.participante_nome || null,
      papel: assessment.papel || null,
      completo: calcularCompletude(disc, competencias),
    },
  };
}

/**
 * Filtra assessments para só colaboradores. Centraliza a tolerância a
 * grafia (singular ou plural) — o banco usa 'colaboradores' (plural)
 * em respondentes, mas mantemos fallback caso algum seed escreva no
 * singular.
 *
 * @param {Array} assessments
 * @returns {Array}
 */
export function filtrarColaboradores(assessments) {
  return (assessments || []).filter(
    a => a?.papel === 'colaborador' || a?.papel === 'colaboradores',
  );
}

/**
 * Agregação canônica do time: filtra colaboradores e delega ao agregador.
 * Usada pelos resolvers de markers `*_time` (`radar_disc_time`,
 * `barras_jung_time`, `heatmap_competencias_time`, `badge_estilo_lideranca`).
 * Retorna null quando não há colaboradores com CIS completo.
 *
 * Pré-requisito: cada assessment precisa ter `papel` (enriquecido via
 * respondentes — ver db.getCisAssessmentsByProjeto e o fetcher do
 * resolver em lib/output/resolveVizData.js).
 *
 * @param {Array} assessments Assessments do projeto (sócios + colaboradores)
 * @returns {Object|null}
 */
export function agregarCisDoTime(assessments) {
  const colab = filtrarColaboradores(assessments);
  if (colab.length === 0) return null;
  return aggregateCisByProject(colab);
}

/**
 * Agrega múltiplos assessments de um projeto em uma estrutura coletiva.
 * Útil para Agente 2 consumir o perfil do time/sociedade.
 */
export function aggregateCisByProject(assessments) {
  const parsed = (assessments || [])
    .map(getCisParsed)
    .filter(a => a !== null && a.meta.completo);

  if (parsed.length === 0) {
    return {
      total: (assessments || []).length,
      completos: 0,
      disc_coletivo: null,
      competencias_coletivas: null,
      jung_coletivo: null,
      estilos_distribuicao: null,
      individuos: [],
    };
  }

  // DISC coletivo: média
  const disc_coletivo = { D: 0, I: 0, S: 0, C: 0 };
  for (const p of parsed) {
    for (const k of ['D', 'I', 'S', 'C']) {
      if (typeof p.disc[k] === 'number') disc_coletivo[k] += p.disc[k];
    }
  }
  for (const k of ['D', 'I', 'S', 'C']) {
    disc_coletivo[k] = Math.round(disc_coletivo[k] / parsed.length);
  }

  // Competências coletivas: média por competência (só as presentes)
  const competencias_coletivas = {};
  for (const key of COMPETENCIAS_KEYS) {
    const vals = parsed.map(p => p.competencias[key]).filter(v => v !== null);
    competencias_coletivas[key] = vals.length > 0
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : null;
  }

  // Jung coletivo: contagem por eixo
  const jung_coletivo = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  for (const p of parsed) {
    if (p.jung.extroversao_introversao) jung_coletivo[p.jung.extroversao_introversao]++;
    if (p.jung.sensacao_intuicao)       jung_coletivo[p.jung.sensacao_intuicao]++;
    if (p.jung.pensamento_sentimento)   jung_coletivo[p.jung.pensamento_sentimento]++;
    if (p.jung.julgamento_percepcao)    jung_coletivo[p.jung.julgamento_percepcao]++;
  }

  // Distribuição de estilos
  const estilos_distribuicao = { Executivo: 0, Motivador: 0, Metodico: 0, Sistematico: 0 };
  for (const p of parsed) {
    if (p.estilo_lideranca && estilos_distribuicao[p.estilo_lideranca] !== undefined) {
      estilos_distribuicao[p.estilo_lideranca]++;
    }
  }

  return {
    total: assessments.length,
    completos: parsed.length,
    disc_coletivo,
    competencias_coletivas,
    jung_coletivo,
    estilos_distribuicao,
    individuos: parsed,
  };
}
