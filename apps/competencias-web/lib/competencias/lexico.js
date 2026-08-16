// =====================================================================
// Léxico: qual característica nomeia cada pilar DENTRO de cada competência.
//
// As 16 características não são 16 sinais independentes — são transformação
// linear dos 4 fatores, com correlações acima de 0,99 entre as do mesmo
// pilar. Citar duas do mesmo pilar como causas distintas é dizer a mesma
// coisa duas vezes. Por isso: UMA etiqueta por pilar, escolhida pelo
// contexto da competência de que se está falando.
//
// As 16 nunca aparecem como lista. Só nomeadas dentro de um argumento.
// =====================================================================
import { ETIQUETA_POR_CONTEXTO } from '@espansione/cis';

const CONTEXTO = {
  autoconsciencia:           { determinacao: 'conflito', conexao: 'abertura',     constancia: 'escuta',      precisao: 'decisao' },
  persistir_ajustar:         { determinacao: 'risco',    conexao: 'engajamento',  constancia: 'longo_prazo', precisao: 'rotina' },
  coerencia_etica:           { determinacao: 'conflito', conexao: 'rede',         constancia: 'escuta',      precisao: 'decisao' },
  leitura_oportunidade:      { determinacao: 'ruido',    conexao: 'rede',         constancia: 'escuta',      precisao: 'foco' },
  julgamento_incerteza:      { determinacao: 'risco',    conexao: 'abertura',     constancia: 'antecipacao', precisao: 'decisao' },
  direcao_modelo:            { determinacao: 'ruido',    conexao: 'rede',         constancia: 'antecipacao', precisao: 'rotina' },
  formular_valor:            { determinacao: 'ruido',    conexao: 'venda',        constancia: 'escuta',      precisao: 'foco' },
  comunicar_posicionar:      { determinacao: 'ruido',    conexao: 'engajamento',  constancia: 'longo_prazo', precisao: 'foco' },
  vender_negociar:           { determinacao: 'conflito', conexao: 'venda',        constancia: 'longo_prazo', precisao: 'decisao' },
  iniciativa_experimentacao: { determinacao: 'risco',    conexao: 'engajamento',  constancia: 'antecipacao', precisao: 'operacao' },
  gestao_recursos:           { determinacao: 'risco',    conexao: 'rede',         constancia: 'antecipacao', precisao: 'operacao' },
  liderar_mobilizar:         { determinacao: 'pessoas',  conexao: 'engajamento',  constancia: 'desenvolver', precisao: 'operacao' },
};

/** A característica que nomeia `pilar` no contexto de `competencia`. */
export function etiqueta(competencia, pilar) {
  const ctx = CONTEXTO[competencia]?.[pilar];
  const mapa = ETIQUETA_POR_CONTEXTO[pilar];
  if (!mapa) return null;
  return (ctx && mapa[ctx]) || Object.values(mapa)[0];
}

/**
 * Escolhe até `max` características para uma competência, uma por pilar,
 * priorizando os pilares sinalizados e mais distantes da faixa.
 * NUNCA devolve duas do mesmo pilar — é a regra que impede o texto de
 * parecer profundo dizendo a mesma coisa com outro nome.
 */
export function etiquetasDe(competencia, pilaresSinalizados = [], porPilar = {}, max = 3) {
  const ordenados = [...pilaresSinalizados].sort(
    (a, b) => (porPilar[b]?.distancia || 0) - (porPilar[a]?.distancia || 0)
  );
  const vistos = new Set();
  const out = [];
  for (const p of ordenados) {
    if (vistos.has(p) || out.length >= max) continue;
    vistos.add(p);
    const e = etiqueta(competencia, p);
    if (e) out.push({ pilar: p, caracteristica: e });
  }
  return out;
}

/**
 * Um passo concreto para os próximos 7 dias, por competência.
 * Escrito para funcionar tanto quando a rota é comportamental quanto
 * quando é técnica — o que muda é a moldura em volta, não a ação.
 */
export const PASSO_7_DIAS = {
  autoconsciencia: 'Peça a duas pessoas do time um retorno franco sobre uma decisão sua das últimas semanas.',
  persistir_ajustar: 'Escolha a frente que mais te preocupa e defina o número e o prazo que decidem se ela continua.',
  coerencia_etica: 'Escreva em uma frase a regra que você usa para recusar um negócio, e mostre a quem vende.',
  leitura_oportunidade: 'Ligue para três clientes que compraram menos este ano e pergunte o que mudou no negócio deles.',
  julgamento_incerteza: 'Na próxima decisão de peso, escreva antes quanto você pode perder e a que ponto desiste.',
  direcao_modelo: 'Escreva em uma frase de onde vem a maior parte da sua margem, e teste com um sócio ou parceiro.',
  formular_valor: 'Pergunte a três clientes por que escolheram você, e compare com o que você costuma dizer.',
  comunicar_posicionar: 'Peça a três pessoas do time que descrevam a empresa em uma frase e compare as respostas.',
  vender_negociar: 'Retome duas propostas paradas perguntando o que falta para a pessoa decidir.',
  iniciativa_experimentacao: 'Escolha uma ideia parada e rode uma versão pequena dela esta semana, com data para olhar o resultado.',
  gestao_recursos: 'Projete o caixa das próximas 12 semanas e marque a semana mais apertada.',
  liderar_mobilizar: 'Tenha a conversa difícil que você vem adiando, com o combinado novo escrito no fim.',
};
