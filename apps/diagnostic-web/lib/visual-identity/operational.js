const TAG_REGEX = /<brand_memory_export>([\s\S]*?)<\/brand_memory_export>/i;

export function extractVisualOperationalSliceFromAgent11Output(output) {
  const source = normalizeJson(output?.brand_memory_export_json) ?? parseBrandMemoryExport(output?.conteudo);
  const visual = source?.visual_identity ?? source;
  return normalizeVisualOperationalSlice(visual?.operational_guidelines ?? deriveFromLegacyVisualIdentity(visual));
}

export function normalizeVisualOperationalSlice(input) {
  if (!input || typeof input !== 'object') return null;
  return {
    visual_principles: normalizeArray(input.visual_principles),
    maintain: normalizeArray(input.maintain),
    lose: normalizeArray(input.lose),
    gain: normalizeArray(input.gain),
    color_direction: {
      primary: normalizeArray(input.color_direction?.primary),
      secondary: normalizeArray(input.color_direction?.secondary),
      avoid: normalizeArray(input.color_direction?.avoid),
      notes: firstString(input.color_direction?.notes),
    },
    typography_direction: {
      recommended_style: firstString(input.typography_direction?.recommended_style),
      hierarchy_notes: firstString(input.typography_direction?.hierarchy_notes),
      avoid: normalizeArray(input.typography_direction?.avoid),
    },
    image_style: {
      photography: normalizeArray(input.image_style?.photography),
      illustration: normalizeArray(input.image_style?.illustration),
      iconography: normalizeArray(input.image_style?.iconography),
      avoid: normalizeArray(input.image_style?.avoid),
    },
    layout_behavior: {
      composition: normalizeArray(input.layout_behavior?.composition),
      density: firstString(input.layout_behavior?.density),
      hierarchy: firstString(input.layout_behavior?.hierarchy),
      whitespace: firstString(input.layout_behavior?.whitespace),
    },
    symbol_logo_guidance: normalizeArray(input.symbol_logo_guidance),
    dos: normalizeArray(input.dos),
    donts: normalizeArray(input.donts),
    visual_risks: normalizeArray(input.visual_risks),
    prompt_guidelines: normalizeArray(input.prompt_guidelines),
  };
}

function deriveFromLegacyVisualIdentity(visual) {
  if (!visual || typeof visual !== 'object') return null;
  return {
    visual_principles: [visual.comportamento_visual, visual.forma?.como_cria_propriedade].filter(Boolean),
    maintain: visual.manter_perder_ganhar?.manter ?? [],
    lose: visual.manter_perder_ganhar?.perder ?? [],
    gain: visual.manter_perder_ganhar?.ganhar ?? [],
    color_direction: {
      primary: (visual.color_palette?.principal ?? []).map((color) => `${color.nome}${color.hex ? ` ${color.hex}` : ''}`),
      secondary: (visual.color_palette?.complementar ?? []).map((color) => `${color.nome}${color.hex ? ` ${color.hex}` : ''}`),
      notes: 'Sistema Visual Operacional derivado de visual_identity legado.',
    },
    typography_direction: {
      recommended_style: [visual.typography?.titulos?.estilo, visual.typography?.corpo?.estilo].filter(Boolean).join(' / '),
      hierarchy_notes: visual.typography?.logica_contraste,
    },
    image_style: {
      photography: visual.fotografia ? [visual.fotografia.estilo, ...(visual.fotografia.temas ?? [])].filter(Boolean) : [],
      illustration: visual.ilustracao ? [visual.ilustracao.estilo, visual.ilustracao.papel_na_marca].filter(Boolean) : [],
      iconography: visual.iconografia ? [visual.iconografia.estilo, visual.iconografia.regras_consistencia].filter(Boolean) : [],
      avoid: [visual.fotografia?.proibido].filter(Boolean),
    },
    layout_behavior: {
      composition: [visual.forma?.descricao].filter(Boolean),
      hierarchy: visual.comportamento_visual,
    },
    symbol_logo_guidance: visual.simbolo_logo ? [visual.simbolo_logo.defesa].filter(Boolean) : [],
    dos: [...(visual.manter_perder_ganhar?.manter ?? []), ...(visual.manter_perder_ganhar?.ganhar ?? [])],
    donts: [...(visual.manter_perder_ganhar?.perder ?? []), visual.fotografia?.proibido].filter(Boolean),
    visual_risks: ['Visual identity operacional incompleta.'],
    prompt_guidelines: [],
  };
}

function parseBrandMemoryExport(content) {
  if (typeof content !== 'string') return null;
  const match = content.match(TAG_REGEX);
  if (!match) return null;
  return normalizeJson(match[1]);
}

function normalizeJson(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function firstString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}
