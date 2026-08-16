// =====================================================================
// A chamada ao modelo. Única fronteira de rede deste módulo.
//
// Desenho: esta função ou devolve uma narrativa válida, ou lança. Ela não
// devolve meia narrativa e não decide o que fazer no erro — quem chama é
// que sabe se cai no template (relatório) ou se apenas registra (job de
// background).
// =====================================================================
import Anthropic from '@anthropic-ai/sdk';
import { ESQUEMA_NARRATIVA, MODELO, NARRATIVA_VERSAO } from './esquema.js';
import { SISTEMA, mensagem } from './prompt.js';
import { conferirBrief } from './brief.js';

/**
 * Esforço padrão. Medido neste relatório, não herdado de outro projeto:
 * `high` produz o melhor texto e leva ~80s; `medium` fica perto e é bem
 * mais rápido. Como o cliente espera do outro lado, o valor é uma decisão
 * de produto — por isso está aqui, nomeado, e não escondido na chamada.
 */
const ESFORCO = process.env.NARRATIVA_ESFORCO || 'high';

let cliente = null;
function anthropic() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY ausente nesta zona.');
  if (!cliente) cliente = new Anthropic();
  return cliente;
}

export function narrativaDisponivel() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * @param {Object} brief — saída de montarBrief()
 * @returns {Promise<{narrativa: Object, modelo: string, versao: string, uso: Object}>}
 */
export async function gerarNarrativa(brief, { esforco = ESFORCO } = {}) {
  // Rede de segurança do lado de cá: nada que pareça resultado numérico
  // sai daqui. Barato, e fecha a classe de bug em que alguém acrescenta
  // um campo ao brief "só para dar contexto ao modelo".
  const conferencia = conferirBrief(brief);
  if (!conferencia.limpo) {
    throw new Error(`brief impróprio para envio: ${conferencia.achados.join(', ')}`);
  }

  const stream = anthropic().beta.messages.stream({
    model: MODELO,
    // Folga real: o pensamento adaptativo divide este teto com o texto.
    // Um relatório de ~1.500 palavras cabe de sobra; apertar aqui trunca
    // no meio do último bloco, que é o modo de falha mais chato de achar.
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: SISTEMA,
    messages: [{ role: 'user', content: mensagem(brief) }],
    output_config: {
      effort: esforco,
      format: { type: 'json_schema', schema: ESQUEMA_NARRATIVA },
    },
    // Os classificadores do modelo podem recusar um pedido. Aqui é
    // improvável (relatório de negócio), mas quando acontece a recusa
    // volta como HTTP 200 — sem isto, viraria queda silenciosa para o
    // template. Com isto, outro modelo escreve e o cliente nem sabe.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  });

  const resposta = await stream.finalMessage();

  // stop_reason ANTES de ler content: numa recusa o array vem vazio, e
  // `content[0].text` estouraria com um erro que não explica nada.
  if (resposta.stop_reason === 'refusal') {
    throw new Error(`modelo recusou (${resposta.stop_details?.category || 'sem categoria'})`);
  }
  if (resposta.stop_reason === 'max_tokens') {
    throw new Error('resposta truncada em max_tokens — o JSON sai inválido');
  }

  const texto = resposta.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  if (!texto) throw new Error('resposta sem bloco de texto');

  return {
    narrativa: JSON.parse(texto),
    modelo: resposta.model,
    versao: NARRATIVA_VERSAO,
    uso: {
      entrada: resposta.usage?.input_tokens ?? null,
      saida: resposta.usage?.output_tokens ?? null,
    },
  };
}
