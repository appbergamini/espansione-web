// =====================================================================
// Mapa de Identidade — agregações dos Espelhos Interno/Externo (funções puras)
// =====================================================================
// Calculam, a partir das submissões, os indicadores agregados que ficam no
// result_json do assessment (eNPS, NPS, médias, palavras mais citadas).

// NPS / eNPS — mesma fórmula. `scores` = array de notas 0–10.
export function calculateNPS(scores = []) {
  const valid = scores.filter((s) => typeof s === 'number' && s >= 0 && s <= 10);
  const total = valid.length;
  if (!total) return { total: 0, promoters: 0, neutrals: 0, detractors: 0, score: null };
  const promoters = valid.filter((s) => s >= 9).length;
  const detractors = valid.filter((s) => s <= 6).length;
  const neutrals = valid.filter((s) => s === 7 || s === 8).length;
  return {
    total,
    promoters,
    neutrals,
    detractors,
    score: Math.round((promoters / total - detractors / total) * 100),
  };
}

export const calculateENPS = calculateNPS;

function media(nums) {
  const v = nums.filter((n) => typeof n === 'number');
  if (!v.length) return null;
  return Math.round((v.reduce((s, n) => s + n, 0) / v.length) * 10) / 10;
}

// contagem de palavras (normalizadas) → top N [{ word, count }]
function topWords(lists, n = 8) {
  const map = new Map();
  for (const item of lists) {
    const palavras = Array.isArray(item) ? item : [item];
    for (const raw of palavras) {
      const w = String(raw || '').trim().toLowerCase();
      if (!w) continue;
      map.set(w, (map.get(w) || 0) + 1);
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word, count]) => ({ word, count }));
}

const ESCALA4_CODES = ['EI_05', 'EI_06', 'EI_07', 'EI_08', 'EI_09', 'EI_10', 'EI_11', 'EI_12', 'EI_13', 'EI_14'];

// Espelho Interno — submissions = array de { answers }
export function aggregateInternalMirror(submissions = []) {
  const ans = submissions.map((s) => s.answers || {});
  const averages = {};
  for (const code of ESCALA4_CODES) averages[code] = media(ans.map((a) => a[code]));
  return {
    applied: ans.length > 0,
    respondents_count: ans.length,
    average_scores_by_question: averages,
    enps: calculateENPS(ans.map((a) => a.EI_17)).score,
    enps_detail: calculateENPS(ans.map((a) => a.EI_17)),
    top_words_company: topWords(ans.map((a) => a.EI_03)).map((w) => w.word),
    top_words_working_here: topWords(ans.map((a) => a.EI_04)).map((w) => w.word),
  };
}

// Espelho Externo — submissions = array de { answers }
export function aggregateExternalMirror(submissions = []) {
  const ans = submissions.map((s) => s.answers || {});
  return {
    applied: ans.length > 0,
    respondents_count: ans.length,
    nps: calculateNPS(ans.map((a) => a.EE_13)).score,
    nps_detail: calculateNPS(ans.map((a) => a.EE_13)),
    average_satisfaction: media(ans.map((a) => a.EE_07)),
    top_decision_factors: topWords(ans.map((a) => a.EE_05)).map((w) => w.word),
    top_brand_words: topWords(ans.map((a) => a.EE_11)).map((w) => w.word),
    avoided_words: topWords(ans.map((a) => a.EE_12)).map((w) => w.word),
  };
}
