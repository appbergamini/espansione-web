export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
];

// Mantém apenas as UTMs conhecidas, em formato seguro para persistência.
export function sanitizarUtms(raw = {}) {
  const utms = {};
  for (const key of UTM_KEYS) {
    const valorRaw = Array.isArray(raw?.[key]) ? raw[key][0] : raw?.[key];
    if (valorRaw == null) continue;
    const valor = String(valorRaw).trim().slice(0, 200);
    if (valor) utms[key] = valor;
  }
  return utms;
}
