// =====================================================================
// Os dois índices do avaliador. NENHUM dos dois aparece para o respondente.
//
// Nomes distintos de propósito: "aderência" significava três coisas no
// material de origem, e a palavra foi aposentada.
//   · Índice de Ajuste    — % dos 48 checks dentro da faixa (em faixas.js)
//   · Índice de Coerência — declaração × evidência (aqui)
// =====================================================================
import { ANCORAS, K_APARICOES } from './catalog.js';

/**
 * ÍNDICE DE COERÊNCIA — o quanto o autorrelato bate com a contagem factual.
 *
 * LIMITE QUE PRECISA SER LEMBRADO: isto compara uma medida RELATIVA com uma
 * ABSOLUTA. O score de competência é ipsativo — diz onde a competência está
 * dentro do perfil da pessoa, não a altura dela. Alguém genuinamente forte
 * em tudo ainda soma zero. Comparar isso com "quantos clientes você
 * procurou" é comparar coisas de naturezas diferentes.
 *
 * Por isso: sinal fraco, para o avaliador levar em conta na sessão de
 * leitura, NUNCA número exibido nem gatilho automático de nada. Os cortes
 * abaixo são os da SPEC e são hipóteses — calibrar com a distribuição real.
 */
export function indiceCoerencia(respostas, scores) {
  const valores = ANCORAS
    .map((a) => respostas[a.id]?.valor)
    .filter((v) => Number.isInteger(v));

  if (valores.length === 0) return null;

  // âncoras: 0..4 → 0..100
  const evidenciaMedia = (valores.reduce((a, b) => a + b, 0) / valores.length / 4) * 100;

  // competências que as âncoras verificam: score -K..+K → 0..100
  const verificadas = [...new Set(ANCORAS.flatMap((a) => a.verifica))];
  const declarados = verificadas
    .map((c) => scores[c])
    .filter((v) => Number.isInteger(v))
    .map((v) => ((v + K_APARICOES) / (2 * K_APARICOES)) * 100);

  if (declarados.length === 0) return null;
  const declaracaoMedia = declarados.reduce((a, b) => a + b, 0) / declarados.length;

  const valor = evidenciaMedia - declaracaoMedia;
  const leitura = valor >= -10 ? 'coerente' : valor > -25 ? 'atencao' : 'revisar_na_sessao';

  return {
    evidenciaMedia: Number(evidenciaMedia.toFixed(2)),
    declaracaoMedia: Number(declaracaoMedia.toFixed(2)),
    valor: Number(valor.toFixed(2)),
    leitura,
    ancorasRespondidas: valores.length,
    competenciasVerificadas: verificadas.length,
  };
}

export const LEITURA_COERENCIA = {
  coerente: 'O que a pessoa diz sobre si bate com o que ela conta ter feito.',
  atencao: 'Há distância entre autorrelato e evidência. Vale sondar na sessão.',
  revisar_na_sessao: 'REVISAR ANTES DE ACEITAR O RESULTADO. A evidência não sustenta o autorrelato.',
};
