// =====================================================================
// Pré-aquecimento: começa a escrever o relatório no instante em que o
// segundo instrumento fecha, e não quando o cliente abre a página.
//
// Por que isso existe: escrever ~1.500 palavras com pensamento adaptativo
// leva dezenas de segundos. Entre a última resposta do comportamental e o
// clique no relatório há a tela de conclusão — tempo humano que já estava
// passando de qualquer forma. É de graça, e é a diferença entre abrir o
// relatório pronto e encarar um spinner no momento mais importante do
// produto.
//
// Não é caminho crítico: se falhar, o próprio relatório gera na abertura.
// =====================================================================
import { respostasDaSessao } from '../competencias/repo.js';
import { pilaresDaSessao } from '../comportamental/repo.js';
import { estadoDaSessao } from '../competencias/sessao.js';
import { consolidar } from '../competencias/score.js';
import { gerarRelatorio } from '../competencias/relatorio.js';
import { ETAPA2_DISPONIVEL } from '../competencias/catalog.js';
import { garantirNarrativa } from './index.js';

/**
 * `waitUntil` é o único jeito de segurar trabalho depois da resposta numa
 * API route do Pages Router — `after()` do Next é só App Router. Import
 * dinâmico e tolerante: fora da Vercel (dev, teste) o módulo pode não
 * resolver, e aí o trabalho roda no próprio await.
 */
async function emSegundoPlano(promessa) {
  let waitUntil;
  try {
    ({ waitUntil } = await import('@vercel/functions'));
  } catch {
    // Barulhento de propósito. Sem waitUntil o `await` abaixo segura a
    // resposta da última pergunta por ~80s — e como o cliente ainda
    // recebe tudo certo no fim, o sintoma é "o teste travou no final",
    // que ninguém liga ao pacote faltando. Já custou uma vez.
    console.warn('[narrativa] @vercel/functions indisponível — geração vai bloquear a resposta');
    await promessa;
    return;
  }
  waitUntil(promessa);
}

/**
 * Dispara a geração e devolve na hora. NUNCA lança: quem chama está no
 * meio de gravar a última resposta do cliente, e nada aqui pode
 * atrapalhar isso.
 */
export async function preaquecerNarrativa(sessao) {
  try {
    await emSegundoPlano(montarEGerar(sessao));
  } catch (e) {
    console.error('[narrativa] pré-aquecimento não disparou', sessao?.id, e?.message || e);
  }
}

async function montarEGerar(sessao) {
  const pilares = await pilaresDaSessao(sessao.id);
  if (!pilares) return;

  const respostas = await respostasDaSessao(sessao.id);
  const consolidado = consolidar(respostas);
  const estado = estadoDaSessao({ respostas, seed: sessao.ordem_seed, etapa2Habilitada: ETAPA2_DISPONIVEL });

  const relatorio = gerarRelatorio({
    consolidado,
    pilares,
    niveis: estado.niveis || {},
    aprofundadas: estado.selecao?.selecionadas || [],
    delta: sessao.delta_valor,
  });

  // esperar:false — aqui não há ninguém do outro lado esperando. Se outro
  // processo já pegou a trava, este simplesmente sai.
  await garantirNarrativa(sessao.id, relatorio, { esperar: false });
}
