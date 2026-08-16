// =====================================================================
// A COSTURA. Puro, testável sem banco e sem rede.
//
// Recebe os blocos do motor (a verdade) e a narrativa da IA (a prosa), e
// devolve os blocos com o texto trocado. Regras:
//
//   1. A estrutura é sempre a do motor. Ordem, chaves, posições, níveis,
//      rotas e passos da faixa NUNCA vêm da narrativa — não há caminho
//      de código por onde eles pudessem vir.
//   2. Texto da IA só entra se for string não-vazia. Campo faltando ou em
//      branco cai no texto do motor. É por isso que uma narrativa parcial
//      degrada em vez de quebrar.
//   3. Item que a IA devolveu com chave desconhecida é ignorado em
//      silêncio; item do motor que a IA não citou fica com o texto dele.
//
// Consequência de desenho: se a IA sumir — chave inválida, timeout, API
// fora do ar — o cliente recebe o relatório de template. Nunca uma tela
// de erro, nunca um relatório com buraco.
// =====================================================================
import { ROTULO_PILAR, PILARES } from '@espansione/cis';

const CHAVE_DO_PILAR = Object.fromEntries(PILARES.map((p) => [ROTULO_PILAR[p], p]));

/** String de verdade, com conteúdo. `''`, `'  '`, null e não-string caem fora. */
const usavel = (v) => typeof v === 'string' && v.trim().length > 0;

/** Preferir o texto da IA; cair no do motor quando não houver. */
const pick = (daIa, doMotor) => (usavel(daIa) ? daIa.trim() : doMotor);

/**
 * @param {Object} relatorio — saída de gerarRelatorio()
 * @param {Object|null} narrativa — saída da IA, ou null
 * @returns {Object} { blocos, abertura, fechamento, temNarrativa }
 */
export function aplicarNarrativa(relatorio, narrativa) {
  if (!narrativa || typeof narrativa !== 'object') {
    return { blocos: relatorio.blocos, abertura: null, fechamento: null, temNarrativa: false };
  }

  const blocos = relatorio.blocos.map((b) => {
    const n = narrativa[b.id];
    if (!n || typeof n !== 'object') return b;

    const base = { ...b, titulo: pick(n.titulo, b.titulo) };

    switch (b.id) {
      case 'onde_voce_esta':
      case 'suas_competencias':
        // Blocos que o motor entrega só com dados — o texto é adição pura.
        return { ...base, texto: pick(n.texto, base.texto ?? null) };

      case 'jeito_de_trabalhar':
        return {
          ...base,
          texto: pick(n.texto, b.texto),
          // A régua (natural/emContexto/equilibrio) fica intocada: ela é o
          // resultado do instrumento, e a IA não escreve resultado.
          pilares: casarPorPilar(b.pilares, n.pilares),
        };

      case 'por_que':
        return {
          ...base,
          texto: pick(n.texto, base.texto ?? null),
          // O padrão recorrente só existe se o MOTOR o encontrou. Se a IA
          // escreveu um parágrafo e o motor não achou padrão nenhum, o
          // parágrafo é descartado: seria uma conclusão inventada.
          padraoRecorrente: b.padraoRecorrente
            ? { ...b.padraoRecorrente, texto: pick(n.padraoRecorrente, b.padraoRecorrente.texto) }
            : null,
          leituras: casarPorChave(b.leituras, n.leituras, 'chave'),
        };

      case 'sustenta_custa':
        return {
          ...base,
          texto: pick(n.texto, b.texto),
          leituras: casarPorPilar(b.leituras, n.leituras),
        };

      case 'trilha':
        return {
          ...base,
          introducao: pick(n.introducao, b.introducao),
          // `itens` carrega ordem, rota e pilarAlvo: só o texto é acrescido.
          itens: casarPorChave(b.itens, n.itens, 'chave', 'texto'),
        };

      case 'passo_7_dias':
        // Sem competência na trilha não há passo — a IA não inventa um.
        return b.competencia ? { ...base, texto: pick(n.texto, b.texto) } : base;

      case 'convite':
        return { ...base, texto: pick(n.texto, b.texto) };

      default:
        return base;
    }
  });

  return {
    blocos,
    abertura: usavel(narrativa.abertura) ? narrativa.abertura.trim() : null,
    fechamento: usavel(narrativa.fechamento) ? narrativa.fechamento.trim() : null,
    temNarrativa: true,
  };
}

/**
 * Casa itens do motor com textos da IA pela chave. O motor manda na lista:
 * item que a IA não citou fica com o texto dele; item que a IA inventou
 * não entra.
 */
function casarPorChave(itensDoMotor, itensDaIa, campoChave, campoDestino = 'texto') {
  if (!Array.isArray(itensDoMotor)) return itensDoMotor;
  const porChave = new Map(
    (Array.isArray(itensDaIa) ? itensDaIa : [])
      .filter((i) => i && typeof i[campoChave] === 'string')
      .map((i) => [i[campoChave], i])
  );
  return itensDoMotor.map((item) => {
    const n = porChave.get(item[campoChave]);
    return { ...item, [campoDestino]: pick(n?.texto, item[campoDestino] ?? null) };
  });
}

/** Idem, mas a IA devolve o RÓTULO do pilar (é o que ela viu no brief). */
function casarPorPilar(itensDoMotor, itensDaIa) {
  if (!Array.isArray(itensDoMotor)) return itensDoMotor;
  const porPilar = new Map(
    (Array.isArray(itensDaIa) ? itensDaIa : [])
      .filter((i) => i && typeof i.pilar === 'string')
      .map((i) => [CHAVE_DO_PILAR[i.pilar] || i.pilar, i])
  );
  return itensDoMotor.map((item) => {
    const n = porPilar.get(item.pilar);
    return { ...item, texto: pick(n?.texto, item.texto) };
  });
}
