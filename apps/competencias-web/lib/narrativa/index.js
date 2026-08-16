// =====================================================================
// Orquestração: cache → trava → geração → cache.
//
// Contrato com quem chama: NUNCA lança e NUNCA propaga erro de IA. Devolve
// a narrativa, ou null. `null` significa "use o texto do motor" — e é por
// isso que nenhuma indisponibilidade da API vira tela de erro para quem
// pagou pelo relatório.
// =====================================================================
import { montarBrief } from './brief.js';
import { gerarNarrativa, narrativaDisponivel } from './gerar.js';
import { NARRATIVA_VERSAO } from './esquema.js';
import { aproveitavel, gravarNarrativa, marcarFalha, narrativaDaSessao, tentarTravar } from './repo.js';

/**
 * Quanto esperar por uma geração que já está em curso em outro processo.
 *
 * Medido, não chutado: escrever o relatório leva ~80s com esforço alto.
 * Um limite de 25s pareceria generoso e faria exatamente a coisa errada —
 * desistir aos 25 e servir o template para quem estava a 15 segundos de
 * receber o texto bom. O teto da função na Vercel é 300s; 150 cabe.
 */
const ESPERA_MAXIMA_MS = 150_000;
const INTERVALO_MS = 2_000;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {string} assessmentId
 * @param {Object} relatorio — saída de gerarRelatorio()
 * @param {Object} [opcoes]
 * @param {boolean} [opcoes.esperar] — esperar geração alheia em curso.
 *   true no caminho do cliente (ele está com a tela aberta); false no
 *   pré-aquecimento, que não tem ninguém esperando do outro lado.
 * @returns {Promise<Object|null>}
 */
export async function garantirNarrativa(assessmentId, relatorio, { esperar = true } = {}) {
  if (!narrativaDisponivel()) return null;

  try {
    const cache = await narrativaDaSessao(assessmentId);
    if (aproveitavel(cache, NARRATIVA_VERSAO)) return cache.narrativa;

    const travou = await tentarTravar(assessmentId, NARRATIVA_VERSAO);

    if (!travou) {
      // Outro processo está gerando — tipicamente o pré-aquecimento
      // disparado no fim do comportamental. Esperar por ele é melhor que
      // gerar de novo: mesma resposta, metade do custo.
      return esperar ? await esperarNarrativa(assessmentId) : null;
    }

    const brief = montarBrief(relatorio);
    const { narrativa, modelo, versao, uso } = await gerarNarrativa(brief);
    await gravarNarrativa(assessmentId, { narrativa, modelo, versao });
    console.log('[narrativa] gerada', assessmentId, modelo, uso);
    return narrativa;
  } catch (e) {
    // Detalhe, não só a mensagem: um 400 da API e um timeout de função
    // produzem sintomas idênticos do lado do cliente (texto do motor, sem
    // erro visível) e só o log distingue os dois. `status` e `error` vêm
    // do SDK da Anthropic; `code` vem do Supabase.
    console.error('[narrativa] falhou', assessmentId, {
      mensagem: e?.message,
      status: e?.status ?? null,
      tipo: e?.error?.error?.type ?? e?.name ?? null,
      code: e?.code ?? null,
    });
    try { await marcarFalha(assessmentId); } catch { /* o log acima já basta */ }
    return null;
  }
}

async function esperarNarrativa(assessmentId) {
  const limite = Date.now() + ESPERA_MAXIMA_MS;
  while (Date.now() < limite) {
    await dormir(INTERVALO_MS);
    const linha = await narrativaDaSessao(assessmentId);
    if (aproveitavel(linha, NARRATIVA_VERSAO)) return linha.narrativa;
    // Falhou do outro lado: não adianta esperar o relógio inteiro.
    if (linha?.narrativa_status === 'falhou') return null;
  }
  return null;
}

export { NARRATIVA_VERSAO } from './esquema.js';
export { aplicarNarrativa } from './aplicar.js';
