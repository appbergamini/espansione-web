// lib/deliverable/extractFromOutput.js
//
// Bloco D · TASK 4.4 — helpers defensivos que extraem seções
// específicas do Markdown de cada agente.
//
// O entregável final reorganiza conteúdo por parte EDITORIAL (Partes
// 0-7), enquanto os outputs estão organizados por AGENTE (1-15). Por
// exemplo: a Parte 1.4 do entregável ("Cultura × Direção") vem da
// Seção 1.4 do Agente 6 — não do output inteiro do Agente 6.
//
// PRINCÍPIO: todos os extratores são defensivos — retornam null se a
// seção não foi encontrada, NUNCA lançam erro. Cada parte do entregável
// tem fallback elegante para seção ausente.

/**
 * Extrai uma seção específica (por título) de um Markdown, até o
 * próximo cabeçalho do mesmo nível (## ou #) OU até um título-limite
 * explícito.
 *
 * @param {string} conteudo
 * @param {string} tituloSecao    Ex.: "## 1.4 CULTURA COMPORTAMENTAL × DIREÇÃO ESTRATÉGICA"
 * @param {string|null} proximoTitulo Onde parar; se null, para no próximo H2 (##).
 * @returns {string|null}
 */
export function extrairSecao(conteudo, tituloSecao, proximoTitulo = null) {
  if (!conteudo || typeof conteudo !== 'string') return null;

  const inicio = conteudo.indexOf(tituloSecao);
  if (inicio === -1) return null;

  let fim;
  if (proximoTitulo) {
    fim = conteudo.indexOf(proximoTitulo, inicio + tituloSecao.length);
    if (fim === -1) fim = conteudo.length;
  } else {
    // Próximo "\n## " (H2). Se não encontrar, vai até o fim.
    const match = conteudo
      .slice(inicio + tituloSecao.length)
      .match(/\n##\s/);
    fim = match
      ? inicio + tituloSecao.length + match.index
      : conteudo.length;
  }

  const raw = conteudo.slice(inicio, fim).trim();
  return raw || null;
}

/**
 * Extrai Parte A do output com separador "# PARTE A" / "# PARTE B".
 * Usado no Agente 2 v2 (analítica × devolutiva).
 * @param {string} conteudo
 * @returns {string|null}
 */
export function extrairParteA(conteudo) {
  return extrairSecao(conteudo, '# PARTE A', '# PARTE B');
}

/**
 * Extrai Parte B do output com separador "# PARTE A" / "# PARTE B".
 * @param {string} conteudo
 * @returns {string|null}
 */
export function extrairParteB(conteudo) {
  if (!conteudo) return null;
  const marker = '# PARTE B';
  const inicio = conteudo.indexOf(marker);
  if (inicio === -1) return null;
  return conteudo.slice(inicio).trim() || null;
}

// ─── Helpers específicos por parte editorial do entregável ──────────

/**
 * Tenta localizar a Carta de Abertura dentro do output do Agente 15.
 * Cobre variantes de capitalização típicas do prompt.
 */
export function extrairCartaAbertura(output15) {
  if (!output15?.conteudo) return null;
  const tentativas = [
    ['## CARTA DE ABERTURA', '## SUMÁRIO EXECUTIVO'],
    ['## Carta de Abertura',  '## Sumário Executivo'],
  ];
  for (const [ini, fim] of tentativas) {
    const s = extrairSecao(output15.conteudo, ini, fim);
    if (s) return s;
  }
  return null;
}

/**
 * Tenta localizar o Sumário Executivo no output do Agente 15.
 * Até o próximo H2 (ou fim).
 */
export function extrairSumarioExecutivo(output15) {
  if (!output15?.conteudo) return null;
  const tentativas = ['## SUMÁRIO EXECUTIVO', '## Sumário Executivo'];
  for (const t of tentativas) {
    const s = extrairSecao(output15.conteudo, t);
    if (s) return s;
  }
  return null;
}

/**
 * Parte 1.4 do entregável — Cultura × Direção — vive na Seção 1.4 do
 * Agente 6 (Decodificação). Cobre variantes de redação.
 */
export function extrairCulturaVsDirecao(output6) {
  if (!output6?.conteudo) return null;
  const tentativas = [
    '## 1.4 CULTURA COMPORTAMENTAL × DIREÇÃO ESTRATÉGICA',
    '## 1.4 Cultura Comportamental × Direção Estratégica',
    '### 1.4 CULTURA COMPORTAMENTAL × DIREÇÃO ESTRATÉGICA',
    '### 1.4 Cultura × Direção',
  ];
  for (const t of tentativas) {
    const s = extrairSecao(output6.conteudo, t);
    if (s) return s;
  }
  return null;
}

/**
 * Seção 2 do Agente 6 — Posicionamento Competitivo Declarado T&W.
 */
export function extrairPosicionamentoTw(output6) {
  if (!output6?.conteudo) return null;
  const tentativas = [
    '## 2. POSICIONAMENTO COMPETITIVO DECLARADO',
    '## 2 POSICIONAMENTO COMPETITIVO DECLARADO',
    '## 2. Posicionamento Competitivo Declarado',
    '## Posicionamento Declarado T&W',
  ];
  for (const t of tentativas) {
    const s = extrairSecao(output6.conteudo, t);
    if (s) return s;
  }
  return null;
}

/**
 * Seção de leitura editorial da visão de mercado (dentro do Agente 6).
 */
export function extrairCuradoriaMercado(output6) {
  if (!output6?.conteudo) return null;
  const tentativas = [
    '## 3. LEITURA EDITORIAL DA VISÃO DE MERCADO',
    '## 3 LEITURA EDITORIAL DA VISÃO DE MERCADO',
    '## LEITURA DE MERCADO',
    '## Curadoria de Mercado',
  ];
  for (const t of tentativas) {
    const s = extrairSecao(output6.conteudo, t);
    if (s) return s;
  }
  return null;
}

/**
 * Manifesto dentro do output do Agente 9 (Plataforma de Branding).
 * Usado com tratamento editorial especial na Parte 3.
 */
export function extrairManifesto(output9) {
  if (!output9?.conteudo) return null;
  const tentativas = ['## MANIFESTO', '## Manifesto', '### MANIFESTO'];
  for (const t of tentativas) {
    const s = extrairSecao(output9.conteudo, t);
    if (s) return s;
  }
  return null;
}

/**
 * Roadmap consolidado dentro do Agente 13 (Plano de Comunicação).
 */
export function extrairRoadmap(output13) {
  if (!output13?.conteudo) return null;
  const tentativas = [
    ['## ROADMAP CONSOLIDADO DE ATIVAÇÃO', '## KPIs'],
    ['## ROADMAP',                           '## KPIs'],
    ['## Roadmap',                           '## KPIs'],
  ];
  for (const [ini, fim] of tentativas) {
    const s = extrairSecao(output13.conteudo, ini, fim);
    if (s) return s;
  }
  return null;
}

/**
 * KPIs de branding/comunicação dentro do output do Agente 13.
 */
export function extrairKpis(output13) {
  if (!output13?.conteudo) return null;
  const tentativas = [
    '## KPIs DE BRANDING E COMUNICAÇÃO',
    '## KPIs',
    '## Indicadores',
  ];
  for (const t of tentativas) {
    const s = extrairSecao(output13.conteudo, t);
    if (s) return s;
  }
  return null;
}

/**
 * Remove uma seção específica do Markdown (ex.: Manifesto do Agente 9
 * quando queremos renderizar a Plataforma sem Manifesto porque o
 * Manifesto vira bloco separado na Parte 3).
 */
export function removerSecao(conteudo, tituloSecao) {
  if (!conteudo || typeof conteudo !== 'string') return conteudo || '';
  const secao = extrairSecao(conteudo, tituloSecao);
  if (!secao) return conteudo;
  return conteudo.replace(secao, '').replace(/\n{3,}/g, '\n\n').trim();
}
