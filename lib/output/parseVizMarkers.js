// lib/output/parseVizMarkers.js
//
// Parser de markers de visualização em Markdown (Bloco D · TASK 4.2).
// Markers são emitidos pelos agentes (ex.: Agente 2 v2 em TASK 3.1.1).
//
// Formato reconhecido:
//   <!-- VIZ:nome -->
//   <!-- VIZ:nome:parametro -->
//
// Exemplos:
//   <!-- VIZ:radar_disc_time -->
//   <!-- VIZ:radar_disc_socio:joao-silva-souza -->

/**
 * @typedef {Object} VizMarker
 * @property {string} raw             String original (ex.: "<!-- VIZ:radar_disc_socio:joao -->")
 * @property {string} tipo            Nome do marker (ex.: "radar_disc_socio")
 * @property {string|null} parametro  Parâmetro opcional (ex.: "joao") ou null
 * @property {number} posicaoInicio   Índice do primeiro char no texto de entrada
 * @property {number} posicaoFim      Índice logo após o último char no texto
 */

const VIZ_MARKER_REGEX = /<!--\s*VIZ:([a-z_]+)(?::([a-z0-9-]+))?\s*-->/g;

/**
 * Extrai todos os markers do conteúdo Markdown, em ordem de aparição.
 *
 * @param {string} conteudo
 * @returns {VizMarker[]}
 */
export function parseVizMarkers(conteudo) {
  if (!conteudo || typeof conteudo !== 'string') return [];

  const markers = [];
  const regex = new RegExp(VIZ_MARKER_REGEX.source, 'g');
  let match;

  while ((match = regex.exec(conteudo)) !== null) {
    markers.push({
      raw: match[0],
      tipo: match[1],
      parametro: match[2] || null,
      posicaoInicio: match.index,
      posicaoFim: match.index + match[0].length,
    });
  }

  return markers;
}

/** Lista fechada dos tipos de marker suportados pelo renderizador. */
export const VIZ_TIPOS_SUPORTADOS = [
  'radar_disc_socio',
  'radar_disc_time',
  'barras_jung_time',
  'heatmap_competencias_time',
  'badge_estilo_lideranca',
  'radar_maturidade_360',
];

/**
 * @param {string} tipo
 * @returns {boolean}
 */
export function isVizTipoSuportado(tipo) {
  return VIZ_TIPOS_SUPORTADOS.includes(tipo);
}

/**
 * Gera a chave canônica do marker ("tipo" ou "tipo:parametro") usada
 * para indexar o objeto `vizData` retornado por resolveVizData.
 *
 * @param {Pick<VizMarker, 'tipo' | 'parametro'>} marker
 * @returns {string}
 */
export function vizMarkerKey(marker) {
  return marker.parametro ? `${marker.tipo}:${marker.parametro}` : marker.tipo;
}

/**
 * Slugify compatível com o formato emitido pelo Agente 2 v2 (principle #15 / TASK 3.1.1):
 *   "João Silva Souza" → "joao-silva-souza"
 *
 * @param {string} texto
 * @returns {string}
 */
export function slugify(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
