// lib/maturidade/computeMaturidade360.js
//
// Computa o score de maturidade 360° a partir das respostas da Parte 6
// do intake_socios v4 (48 afirmações em 6 pilares, escala 1-4).
//
// ─── Mapeamento ────────────────────────────────────────────────────────────
//   Estratégia  → perguntas  1–8   (max 32)
//   Finanças    → perguntas  9–16  (max 32)
//   Comercial   → perguntas 17–24  (max 32)
//   Marketing   → perguntas 25–32  (max 32)
//   Pessoas     → perguntas 33–40  (max 32)
//   Operação    → perguntas 41–48  (max 32)
//
// Convenção oficial de campos no respostas_json: `parte6_q1` … `parte6_q48`
// com valores inteiros 1–4. Parser aceita variações (`p6_q1`, `maturidade_q1`,
// e strings numéricas como "3") para tolerância a versões anteriores.
//
// Classificação de prioridade por percentual:
//   < 50   → Alta (demanda atenção urgente)
//   50–74  → Media
//   >= 75  → Baixa (pilar sólido)

const PILARES = {
  estrategia: { nome: 'Estratégia', inicio:  1, fim:  8 },
  financas:   { nome: 'Finanças',   inicio:  9, fim: 16 },
  comercial:  { nome: 'Comercial',  inicio: 17, fim: 24 },
  marketing:  { nome: 'Marketing',  inicio: 25, fim: 32 },
  pessoas:    { nome: 'Pessoas',    inicio: 33, fim: 40 },
  operacao:   { nome: 'Operação',   inicio: 41, fim: 48 },
};

const PREFIXOS_ACEITOS = ['parte6_q', 'p6_q', 'maturidade_q'];

function getRespostaValor(respostas_json, numeroPergunta) {
  for (const prefixo of PREFIXOS_ACEITOS) {
    const chave = `${prefixo}${numeroPergunta}`;
    const valor = respostas_json[chave];
    if (typeof valor === 'number' && valor >= 1 && valor <= 4) return valor;
    if (typeof valor === 'string' && /^[1-4]$/.test(valor.trim())) {
      return parseInt(valor.trim(), 10);
    }
  }
  return null;
}

function classificarPrioridade(percentual) {
  if (percentual === null) return null;
  if (percentual < 50) return 'Alta';
  if (percentual < 75) return 'Media';
  return 'Baixa';
}

/**
 * Calcula scores de maturidade para UM respondente (sócio).
 * @param {object} respostas_json payload do intake_socios
 * @returns {object|null}
 */
export function computeMaturidade360(respostas_json) {
  if (!respostas_json || typeof respostas_json !== 'object') return null;

  const pilares = {};
  let totalScore = 0;
  let totalMax = 0;
  let totalRespondidas = 0;

  for (const [chave, config] of Object.entries(PILARES)) {
    const qtd = config.fim - config.inicio + 1;
    const max = qtd * 4;
    let score = 0;
    let respondidas = 0;

    for (let q = config.inicio; q <= config.fim; q++) {
      const valor = getRespostaValor(respostas_json, q);
      if (valor !== null) { score += valor; respondidas++; }
    }

    let percentual = null;
    if (respondidas === qtd) {
      percentual = Math.round((score / max) * 100);
    } else if (respondidas > 0) {
      // Extrapola proporcionalmente para não distorcer
      const scoreProjetado = (score / respondidas) * qtd;
      percentual = Math.round((scoreProjetado / max) * 100);
    }

    pilares[chave] = {
      score,
      max,
      percentual,
      prioridade: classificarPrioridade(percentual),
      respondidas,
      total_perguntas: qtd,
    };

    totalScore += score;
    totalMax += max;
    totalRespondidas += respondidas;
  }

  const pilaresComResposta = Object.entries(pilares)
    .filter(([_, p]) => p.percentual !== null);

  let pilar_mais_forte = null;
  let pilar_mais_fraco = null;
  if (pilaresComResposta.length > 0) {
    pilar_mais_forte = pilaresComResposta.reduce((a, b) =>
      a[1].percentual > b[1].percentual ? a : b
    )[0];
    pilar_mais_fraco = pilaresComResposta.reduce((a, b) =>
      a[1].percentual < b[1].percentual ? a : b
    )[0];
  }

  const prioridades = { alta: [], media: [], baixa: [] };
  for (const [chave, p] of Object.entries(pilares)) {
    if (p.prioridade === 'Alta')  prioridades.alta.push(chave);
    else if (p.prioridade === 'Media') prioridades.media.push(chave);
    else if (p.prioridade === 'Baixa') prioridades.baixa.push(chave);
  }

  return {
    pilares,
    total: {
      score: totalScore,
      max: totalMax,
      percentual: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null,
    },
    prioridades,
    pilar_mais_forte,
    pilar_mais_fraco,
    completude: {
      respondidas: totalRespondidas,
      total: 48,
      percentual: Math.round((totalRespondidas / 48) * 100),
    },
    calculado_em: new Date().toISOString(),
  };
}

/**
 * Agrega múltiplas maturidades (múltiplos sócios) em uma visão coletiva.
 * Preserva scores individuais por pilar para o Agente 2 identificar outliers
 * e classifica divergência entre sócios (alta/media/baixa) via desvio padrão.
 */
export function agregateMaturidades(maturidades) {
  if (!maturidades || maturidades.length === 0) return null;
  if (maturidades.length === 1) return maturidades[0];

  const pilaresKeys = Object.keys(maturidades[0].pilares);
  const pilares = {};

  for (const pilar of pilaresKeys) {
    const scores = maturidades.map(m => m.pilares[pilar].score);
    const percentuais = maturidades
      .map(m => m.pilares[pilar].percentual)
      .filter(p => p !== null);

    const mediaScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const mediaPercentual = percentuais.length > 0
      ? Math.round(percentuais.reduce((a, b) => a + b, 0) / percentuais.length)
      : null;

    let divergencia = null;
    if (percentuais.length > 1) {
      const media = percentuais.reduce((a, b) => a + b, 0) / percentuais.length;
      const variancia = percentuais.reduce((acc, p) => acc + Math.pow(p - media, 2), 0) / percentuais.length;
      const desvio = Math.sqrt(variancia);
      divergencia = desvio > 15 ? 'alta' : desvio > 8 ? 'media' : 'baixa';
    }

    pilares[pilar] = {
      score: mediaScore,
      max: maturidades[0].pilares[pilar].max,
      percentual: mediaPercentual,
      prioridade: classificarPrioridade(mediaPercentual),
      divergencia_entre_socios: divergencia,
      scores_individuais: scores,
    };
  }

  const totalScore = Object.values(pilares).reduce((acc, p) => acc + p.score, 0);
  const totalMax   = Object.values(pilares).reduce((acc, p) => acc + p.max, 0);

  const pilaresComResposta = Object.entries(pilares).filter(([_, p]) => p.percentual !== null);
  const pilar_mais_forte = pilaresComResposta.length > 0
    ? pilaresComResposta.reduce((a, b) => a[1].percentual > b[1].percentual ? a : b)[0] : null;
  const pilar_mais_fraco = pilaresComResposta.length > 0
    ? pilaresComResposta.reduce((a, b) => a[1].percentual < b[1].percentual ? a : b)[0] : null;

  const prioridades = { alta: [], media: [], baixa: [] };
  for (const [chave, p] of Object.entries(pilares)) {
    if (p.prioridade === 'Alta')  prioridades.alta.push(chave);
    else if (p.prioridade === 'Media') prioridades.media.push(chave);
    else if (p.prioridade === 'Baixa') prioridades.baixa.push(chave);
  }

  return {
    pilares,
    total: {
      score: totalScore,
      max: totalMax,
      percentual: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null,
    },
    prioridades,
    pilar_mais_forte,
    pilar_mais_fraco,
    completude: {
      respondidas: maturidades.reduce((acc, m) => acc + m.completude.respondidas, 0),
      total: 48 * maturidades.length,
      percentual: Math.round(
        maturidades.reduce((acc, m) => acc + m.completude.percentual, 0) / maturidades.length
      ),
    },
    socios_respondentes: maturidades.length,
    calculado_em: new Date().toISOString(),
  };
}
