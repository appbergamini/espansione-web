// =====================================================================
// Camada de nomenclatura Espansione sobre a saída do instrumento.
//
// REGRA ABSOLUTA: os rótulos internos de fator (D/I/S/C) e o nome do
// instrumento de origem NÃO aparecem em nenhuma superfície de cliente.
// Fora daqui, só existem os 4 pilares.
//
// O fluxo do Teste de Competências consome APENAS os 4 pilares (natural e
// em contexto). As 16 características entram só como léxico — nomeiam o
// pilar com precisão editorial dentro do texto — e nunca como lista.
// =====================================================================

export const PILARES = ['determinacao', 'conexao', 'constancia', 'precisao'];

export const ROTULO_PILAR = {
  determinacao: 'Determinação',
  conexao: 'Conexão',
  constancia: 'Constância',
  precisao: 'Precisão',
};

// Mapa interno fator → pilar. Único ponto do sistema onde D/I/S/C aparece.
const FATOR_PARA_PILAR = { D: 'determinacao', I: 'conexao', S: 'constancia', C: 'precisao' };

// Léxico: as 16 características, agrupadas pelo pilar que elas nomeiam.
// Usadas para dar nome ao pilar dentro do texto — no máximo 3 por
// competência, e NUNCA duas do mesmo pilar (elas são a mesma informação:
// os coeficientes das 16 são transformação linear dos 4 fatores).
export const LEXICO_PILAR = {
  determinacao: ['Ousadia', 'Comando', 'Objetividade', 'Assertividade'],
  conexao: ['Persuasão', 'Extroversão', 'Entusiasmo', 'Sociabilidade'],
  constancia: ['Empatia', 'Paciência', 'Persistência', 'Planejamento'],
  precisao: ['Organização', 'Detalhismo', 'Prudência', 'Concentração'],
};

// Qual etiqueta usar conforme o que está sendo dito.
export const ETIQUETA_POR_CONTEXTO = {
  determinacao: { risco: 'Ousadia', pessoas: 'Comando', ruido: 'Objetividade', conflito: 'Assertividade' },
  conexao: { venda: 'Persuasão', engajamento: 'Entusiasmo', rede: 'Sociabilidade', abertura: 'Extroversão' },
  constancia: { escuta: 'Empatia', desenvolver: 'Paciência', longo_prazo: 'Persistência', antecipacao: 'Planejamento' },
  precisao: { operacao: 'Detalhismo', decisao: 'Prudência', foco: 'Concentração', rotina: 'Organização' },
};

/**
 * Converte a saída bruta do instrumento nos 4 pilares, natural e em contexto.
 * @param {{disc:object, dA:object}} scores — saída de calcularScores
 * @returns {{determinacao:{natural:number,emContexto:number}, ...}}
 */
export function derivarPilares(scores) {
  if (!scores || !scores.disc || !scores.dA) return null;
  const out = {};
  for (const [fator, pilar] of Object.entries(FATOR_PARA_PILAR)) {
    out[pilar] = {
      natural: scores.disc[fator],
      emContexto: scores.dA[fator],
    };
  }
  return out;
}

/**
 * Gap natural × em contexto, por pilar. Opera sobre os 4 pilares BRUTOS —
 * nunca sobre as 16 características, porque o bloco "em contexto" da matriz
 * quase não diferencia entre elas (coeficientes somam 0,54–0,58 nas 16 linhas,
 * todos positivos: ele desloca as 16 para cima de forma quase uniforme).
 *
 * Números de gap NUNCA são expostos ao cliente — só o texto derivado deles.
 * @param {object} pilares — saída de derivarPilares
 * @param {number} corte — diferença a partir da qual o gap conta como grande
 */
export function lerGap(pilares, corte = 20) {
  if (!pilares) return null;
  const porPilar = {};
  let grandes = 0;
  for (const p of PILARES) {
    const delta = pilares[p].emContexto - pilares[p].natural;
    // "superior a 20 pontos" — estritamente maior, não >=.
    const grande = Math.abs(delta) > corte;
    if (grande) grandes++;
    porPilar[p] = {
      delta,
      grande,
      // acima = a pessoa força uma postura que não é natural (custa energia,
      // e não é fragilidade). abaixo = o ambiente suprime algo natural.
      direcao: delta > 0 ? 'acima' : delta < 0 ? 'abaixo' : 'igual',
    };
  }
  return {
    porPilar,
    pilaresComGapGrande: grandes,
    // 3 ou 4 pilares com gap grande = esforço de adaptação generalizado:
    // o papel atual não cabe na pessoa. É conversa de próximo estágio.
    adaptacaoGeneralizada: grandes >= 3,
    coerente: grandes === 0,
  };
}
