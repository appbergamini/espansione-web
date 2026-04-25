// FIX.17 — normaliza `scores_json` do mapeamento DISC para o formato
// legado que o RelatorioDisc + narrativeGenerator esperam (`comp`, `dA`,
// `lead`, `disc`, `profile`). O banco tem dois formatos coabitando:
//   - Legado: { disc, dA, lead, comp, profile }
//   - Novo:   { disc, discA, leadership, competencies, profileLabel }
// Ver lib/cis/parseCis.js para a estória completa.
//
// Esta normalização é específica do PDF individual (RelatorioDisc, que
// usa nomes em Title Case com acentos para competências). Para usos
// "agregados" (Agente 2, viz, relatório consolidado) prefira getCisParsed
// do parseCis.js, que devolve schema canônico em snake_case.

const COMP_TITLE_CASE = {
  ousadia: 'Ousadia',
  comando: 'Comando',
  objetividade: 'Objetividade',
  assertividade: 'Assertividade',
  empatia: 'Empatia',
  paciencia: 'Paciência',
  persistencia: 'Persistência',
  planejamento: 'Planejamento',
  persuasao: 'Persuasão',
  extroversao: 'Extroversão',
  entusiasmo: 'Entusiasmo',
  sociabilidade: 'Sociabilidade',
  organizacao: 'Organização',
  detalhismo: 'Detalhismo',
  prudencia: 'Prudência',
  concentracao: 'Concentração',
};

function stripAccents(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function ensureDiscAxes(obj) {
  // FIX.18 — RelatorioDisc faz `value / max * 100` em <Bar>; se a chave
  // estiver ausente, NaN% chega no react-pdf e ele joga "Invalid value
  // NaN% for setWidth". Garantir as 4 chaves com 0 evita isso e mostra
  // barra vazia em vez de quebrar o render inteiro.
  const out = { ...(obj || {}) };
  for (const k of ['D', 'I', 'S', 'C']) {
    const v = out[k] ?? out[k.toLowerCase()];
    out[k] = (typeof v === 'number' && Number.isFinite(v)) ? v : 0;
  }
  return out;
}

export function normalizeScoresLegacy(scores) {
  if (!scores || typeof scores !== 'object') return null;
  const out = { ...scores };

  // disc — chave igual nos dois formatos
  out.disc = ensureDiscAxes(out.disc);

  // dA — formato novo usa discA / disc_adaptado
  if (!out.dA || typeof out.dA !== 'object') {
    out.dA = (out.discA && typeof out.discA === 'object' ? out.discA : null)
          || (out.disc_adaptado && typeof out.disc_adaptado === 'object' ? out.disc_adaptado : null)
          || {};
  }
  out.dA = ensureDiscAxes(out.dA);

  // lead — formato novo usa leadership com 4 chaves DIFERENTES
  // (visionaria/executora/relacional/analitica vs Executivo/Motivador/
  // Metódico/Sistemático). Modelos distintos; não tentamos mapear,
  // só garantimos que `lead` existe pra Object.entries não quebrar.
  if (!out.lead || typeof out.lead !== 'object') out.lead = {};

  // comp — formato novo usa `competencies` (snake_case sem acento) ou
  // `competencias` (português). RelatorioDisc procura por chaves em
  // Title Case com acento, então convertemos.
  if (!out.comp || typeof out.comp !== 'object' || Object.keys(out.comp).length === 0) {
    const src = (out.competencies && typeof out.competencies === 'object') ? out.competencies
              : (out.competencias && typeof out.competencias === 'object') ? out.competencias
              : null;
    if (src) {
      const converted = {};
      for (const [k, v] of Object.entries(src)) {
        const norm = stripAccents(k);
        const titled = COMP_TITLE_CASE[norm] || k;
        converted[titled] = v;
      }
      out.comp = converted;
    } else {
      out.comp = {};
    }
  }

  // profile — formato novo usa profileLabel
  if (typeof out.profile !== 'string' || !out.profile.trim()) {
    out.profile = (typeof out.profileLabel === 'string' && out.profileLabel.trim()) ? out.profileLabel : '—';
  }

  return out;
}
