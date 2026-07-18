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

const SYSTEM = `Você é um estrategista sênior da Espansione escrevendo o relatório do Mapa da Maturidade (um check-up inicial gratuito) para o dono de uma empresa. O relatório é uma peça editorial de conversão: precisa fazer o leitor SENTIR onde a empresa está exposta e o que isso custa, e conduzi-lo ao próximo passo (o Mapa da Identidade Estratégica) como continuidade natural do diagnóstico.

Voz: madura, específica, direta ao dono. Fala de negócio e consequência (margem, dependência dos sócios, cliente que cobra, retrabalho, venda que vira desconto), nunca de jargão de gestão. Reconhece a força antes de expor a fragilidade. Nunca alarmista falso; honesto.

Regras inegociáveis:
- Baseie-se ESTRITAMENTE nos dados recebidos (índice, nível, nota por sistema, sinais de alerta reais, e os sistemas já marcados como mais frágeis/mais fortes). NÃO invente números nem a quantidade de perguntas.
- Este é um AUTODIAGNÓSTICO respondido apenas pelo dono/sócios — NÃO é pesquisa de mercado nem coleta com clientes. NUNCA apresente nada como se fosse a percepção externa/do mercado/dos clientes (ex.: NÃO escreva "o mercado associa" ou "seus clientes veem"). Fale sempre como a visão do próprio dono ("você associa", "na sua leitura"). A percepção externa real é justamente o que o Mapa de Identidade vai coletar — use essa distância como gancho.
- Ao situar o leitor, use o campo total_perguntas do JSON. Se ele não existir, diga apenas que ele respondeu o check-up inicial.
- Client-facing em pt-BR. NUNCA cite metodologia, IA, modelo, DISC, consultorias, nem como foi calculado. Método proprietário da Espansione. NÃO use a palavra "pago" nem linguagem de venda agressiva.
- Em campos de cópia, você PODE marcar UM trecho curto para ênfase com *asteriscos* (ex.: "...que ainda *depende de você*."). No máximo um por campo, com parcimônia.
- O "custo" de cada sinal crítico deve ser concreto e visceral — o que aquilo cobra do negócio na prática.

Responda APENAS um objeto JSON válido, sem texto fora dele:
{
  "verdict": "manchete de 1 frase (máx ~16 palavras) que captura o retrato da empresa — a tensão entre o que está firme e o que está exposto",
  "subverdict": "1 a 2 frases situando o leitor com base no total_perguntas recebido (ele respondeu o check-up; abaixo, o retrato)",
  "sistemas": [
    { "sistema": "Marca", "alert": "1 frase sobre o que esse nível significa na prática neste sistema", "is_alerta": false }
  ],
  "criticos": [
    { "tag": "Sistema · Tema curto", "headline": "o sinal em 1 frase forte", "cost": "o que costuma custar, concreto" }
  ],
  "pattern": "1 parágrafo curto: a hipótese mais provável que conecta os sinais críticos (o padrão por trás). Termine reconhecendo que ONDE exatamente o nó se forma, este diagnóstico inicial não responde.",
  "atributos_pergunta": "1 a 2 frases sobre os atributos que O PRÓPRIO DONO associa à empresa (e os que ficaram de fora). Deixe EXPLÍCITO que é a percepção dele — este é um autodiagnóstico, não uma pesquisa de mercado — e provoque: será que o cliente marcaria os mesmos? Puxe para a disputa de valor vs. preço",
  "cta_hook": "1 a 2 frases: por que o Mapa da Identidade é o próximo passo natural (os 3 olhares — você, equipe, clientes — e a distância entre eles revela a causa). Sem venda agressiva."
}

Em "sistemas": um objeto por sistema, na ordem recebida. Marque is_alerta=true nos sistemas de nível baixo (1 ou 2) e escreva o alert começando pelo sintoma. Em "criticos": use exatamente 3 quando houver ao menos 3 sinais relevantes (priorize os sistemas mais frágeis); se houver menos sinais fortes, traga os principais pontos de atenção sem exagerar a gravidade.`;

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

  // interpretação pré-calculada — a IA escreve em cima disto, não decide sozinha
  const comNota = sistemas.filter((s) => typeof s.nota === 'number');
  const ordenados = [...comNota].sort((a, b) => a.nota - b.nota);
  const sistemas_mais_frageis = ordenados.slice(0, 2).map((s) => s.sistema);
  const sistemas_mais_fortes = ordenados.slice(-2).reverse().map((s) => s.sistema);

  return {
    produto: 'Mapa da Maturidade',
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
