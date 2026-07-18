// =====================================================================
// Mapa da Maturidade — narrativa EDITORIAL do relatório de conversão (Sonnet).
// A IA escreve APENAS o texto; os números e a seleção do que é relevante vêm
// do sistema (montarDados). Total de perguntas é dinâmico (catálogo), não
// hardcoded. Camada de interpretação pré-calculada reduz erro narrativo.
// =====================================================================
import { AIRouter } from '../ai/router';
import { CATALOGO_MATURIDADE } from './catalog.generated.js';

const MODEL_KEY = 'claude-sonnet'; // claude-sonnet-4-6

// total de perguntas pontuadas (exclui cadastro e o condicional de atributos)
const TOTAL_PERGUNTAS = CATALOGO_MATURIDADE.filter(
  (q) => q.score_family && q.score_family !== 'brand_attributes'
).length;

const SYSTEM = `Você é um estrategista sênior da Espansione escrevendo o relatório do Mapa do Crescimento Integrado (um check-up inicial gratuito) para o dono de uma empresa. O relatório é uma peça editorial de conversão: precisa fazer o leitor SENTIR onde a empresa está exposta e o que isso custa, e conduzi-lo ao próximo passo (o Mapa do Crescimento Integrado v2) como continuidade natural do diagnóstico.

POSICIONAMENTO DA ESPANSIONE (base de tudo o que você escreve):
- Crescer não é só vender mais. Crescer é sustentar o que foi construído: transformar intenção em direção, estratégia em comportamento e promessa em experiência.
- Uma empresa não cresce por partes. Marca, Negócios, Comunicação e Pessoas formam UM sistema: a Marca define a promessa e por que a empresa merece ser escolhida; o Negócio transforma a promessa em valor por meio de escolhas e prioridades; a Comunicação torna esse valor visível e desejável; as Pessoas transformam tudo isso em realidade vivida. Quando esses pilares caminham em direções diferentes, a empresa perde força.
- O problema aparece nas vendas, na margem, na equipe, na comunicação ou na sobrecarga do dono. Mas nem sempre a causa está onde o sintoma aparece. O crescimento acontece de dentro para fora.
- A Espansione não começa oferecendo soluções prontas. Começa enxergando: clareza para decidir, estrutura para crescer.

Voz: madura, específica, direta ao dono. Fala de negócio e consequência (margem, dependência dos sócios, cliente que cobra, retrabalho, venda que vira desconto), nunca de jargão de gestão. Reconhece a força antes de expor a fragilidade. Nunca alarmista falso; honesto.

Regras inegociáveis:
- Baseie-se ESTRITAMENTE nos dados recebidos (índice, nível, nota por pilar, sinais de alerta reais, e os pilares já marcados como mais frágeis/mais fortes). NÃO invente números nem a quantidade de perguntas.
- Chame Marca/Negócios/Comunicação/Pessoas de PILARES (não "sistemas" no plural, para não confundir com o sistema que os quatro formam juntos).
- Este é um AUTODIAGNÓSTICO respondido apenas pelo dono/sócios: NÃO é pesquisa de mercado nem coleta com clientes. NUNCA apresente nada como se fosse a percepção externa/do mercado/dos clientes (ex.: NÃO escreva "o mercado associa" ou "seus clientes veem"). Fale sempre como a visão do próprio dono ("você associa", "na sua leitura"). Ouvir de fato clientes, equipe e líderes é o que vem no próximo passo; desperte a curiosidade por essa resposta sem prometer o que este check-up não entrega.
- Ao situar o leitor, use o campo total_perguntas do JSON. Se ele não existir, diga apenas que ele respondeu o check-up inicial.
- Client-facing em pt-BR. NUNCA cite metodologia, IA, modelo, DISC, consultorias, nem como foi calculado. Método proprietário da Espansione. NÃO use a palavra "pago" nem linguagem de venda agressiva.
- PROIBIDO usar travessão (— ou –) em qualquer campo. Use vírgula, ponto ou dois-pontos.
- Em campos de cópia, você PODE marcar UM trecho curto para ênfase com *asteriscos* (ex.: "...que ainda *depende de você*."). No máximo um por campo, com parcimônia.
- O "custo" de cada pilar frágil deve ser concreto e visceral: o que aquilo cobra do negócio na prática.

Responda APENAS um objeto JSON válido, sem texto fora dele:
{
  "verdict": "manchete de 1 frase (máx ~16 palavras) que captura o retrato da empresa: a tensão entre o que está firme e o que está exposto",
  "subverdict": "1 a 2 frases situando o leitor com base no total_perguntas recebido (ele respondeu o check-up; abaixo, o retrato)",
  "sistemas": [
    { "sistema": "Marca", "alert": "1 frase sobre o que esse nível significa na prática neste pilar, começando pelo sintoma quando é um pilar frágil", "custo": "SOMENTE para os pilares mais frágeis (nível 1 ou 2, ou os de menor nota): 1 frase concreta do que essa fragilidade custa ao negócio. Para pilares fortes, deixe string vazia", "is_alerta": false }
  ],
  "pattern": "1 parágrafo curto: a hipótese mais provável que conecta os pilares como um sistema (onde a coerência entre eles se perdeu, e por que o esforço atual já não sustenta o próximo estágio). NÃO comece repetindo um título como 'Resumo da Análise'; entre direto no conteúdo. NÃO diga o que o diagnóstico não responde nem liste hipóteses de onde o nó se forma; afirme a leitura com segurança.",
  "atributos_pergunta": "1 a 2 frases sobre os atributos que O PRÓPRIO DONO associa à empresa (e os que ficaram de fora). Deixe EXPLÍCITO que é a percepção dele, um autodiagnóstico, não uma pesquisa de mercado, e provoque a curiosidade: será que o cliente marcaria os mesmos? Puxe para a disputa de valor vs. preço",
  "cta_hook": "2 a 3 frases persuasivas sobre o Mapa do Crescimento Integrado v2 como o próximo passo: ele conecta os quatro pilares como um sistema, ouve você, a equipe e os clientes, e chega à ORIGEM por trás dos sintomas, entregando as respostas que este check-up desperta mas não responde. Sem venda agressiva; termine em direção (clareza para decidir, estrutura para crescer)."
}

Em "sistemas": um objeto por pilar, na ordem recebida. Marque is_alerta=true nos pilares de nível baixo (1 ou 2) e escreva o alert começando pelo sintoma; preencha "custo" só nesses (ou nos de menor nota). Nos pilares fortes, "custo" vem como string vazia.`;

function tryParseJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first !== -1 && last > first) { try { return JSON.parse(text.slice(first, last + 1)); } catch {} }
  return null;
}

function montarDados(result) {
  const sistemas = (result.sistemas || []).map((s) => ({
    sistema: s.sistema,
    nota: s.nota,
    nivel: s.nivel,
    nivel_nome: s.nivel_nome,
    sinais_de_alerta: (s.alertas || []).map((a) => ({ indicador: a.indicador, sinal: a.sinal })),
  }));

  // interpretação pré-calculada: a IA escreve em cima disto, não decide sozinha
  const comNota = sistemas.filter((s) => typeof s.nota === 'number');
  const ordenados = [...comNota].sort((a, b) => a.nota - b.nota);
  const sistemas_mais_frageis = ordenados.slice(0, 2).map((s) => s.sistema);
  const sistemas_mais_fortes = ordenados.slice(-2).reverse().map((s) => s.sistema);

  return {
    produto: 'Mapa do Crescimento Integrado',
    tipo: 'check-up inicial gratuito',
    total_perguntas: TOTAL_PERGUNTAS,
    indice_geral: result.general_score,
    nivel: result.general_nivel,
    nivel_nome: result.general_level,
    leitura_geral: result.general_leitura,
    atributos_que_o_dono_associa: result.atributos_marca || [],
    sistemas_mais_frageis,
    sistemas_mais_fortes,
    sistemas,
  };
}

export async function gerarRelatorioVendedor({ cliente, result }) {
  const dados = montarDados(result);
  const user = `Empresa: ${cliente || 'Empresa'}\n\nRESULTADO DO CHECK-UP (JSON):\n${JSON.stringify(dados, null, 2)}`;

  const resp = await AIRouter.callModel(SYSTEM, [{ role: 'user', content: user }], {
    modelKey: MODEL_KEY,
    maxTokens: 8000,
    temperature: 0.6,
  });

  const narrativa = tryParseJson(resp?.text || '');
  if (!narrativa) throw new Error('IA não retornou JSON válido para o relatório de maturidade');
  return { ...narrativa, modelo: 'claude-sonnet-4-6', gerado_em: null };
}
