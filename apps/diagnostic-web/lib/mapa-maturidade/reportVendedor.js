// =====================================================================
// Mapa da Maturidade — narrativa EDITORIAL do relatório de conversão (Sonnet).
// Produz a cópia do relatório visual (reportHtml): veredito, alertas por
// sistema, os sinais mais críticos com "o que custa", o padrão por trás e a
// provocação dos atributos de marca. Fiel aos dados; tom consultivo que vende.
// =====================================================================
import { AIRouter } from '../ai/router';

const MODEL_KEY = 'claude-sonnet'; // claude-sonnet-4-6

const SYSTEM = `Você é um estrategista sênior da Espansione escrevendo o relatório do Mapa da Maturidade (um check-up gratuito) para o dono de uma empresa. O relatório é uma peça editorial de conversão: precisa fazer o leitor SENTIR onde a empresa está exposta e o que isso custa, e conduzi-lo ao próximo passo (o Mapa da Identidade Estratégica, pago).

Voz: madura, específica, direta ao dono. Fala de negócio e consequência (margem, dependência dos sócios, cliente que cobra, retrabalho, venda que vira desconto), nunca de jargão de gestão. Reconhece a força antes de expor a fragilidade. Nunca alarmista falso; honesto.

Regras inegociáveis:
- Baseie-se ESTRITAMENTE nos dados (score, nível, nota por sistema, sinais de alerta reais). Não invente números.
- Client-facing em pt-BR. NUNCA cite metodologia, IA, modelo, DISC, consultorias, nem como foi calculado. Método proprietário da Espansione.
- Em campos de cópia, você PODE marcar UM trecho curto para ênfase com *asteriscos* (ex.: "...que ainda *depende de você*."). Use no máximo um por campo, com parcimônia.
- O "custo" de cada sinal crítico deve ser concreto e visceral — o que aquilo cobra do negócio na prática.

Responda APENAS um objeto JSON válido, sem texto fora dele:
{
  "verdict": "manchete de 1 frase (máx ~16 palavras) que captura o retrato da empresa — a tensão entre o que está firme e o que está exposto",
  "subverdict": "1 a 2 frases situando o leitor (ele respondeu 40 perguntas; abaixo, o retrato)",
  "sistemas": [
    { "sistema": "Marca", "alert": "1 frase sobre o que esse nível significa na prática neste sistema", "is_alerta": false }
  ],
  "criticos": [
    { "tag": "Sistema · Tema curto", "headline": "o sinal em 1 frase forte", "cost": "o que costuma custar, concreto" }
  ],
  "pattern": "1 parágrafo curto: a raiz provável que conecta os sinais críticos (o padrão por trás). Termine reconhecendo que ONDE exatamente o nó se forma, este diagnóstico não responde.",
  "atributos_pergunta": "1 a 2 frases provocando sobre os atributos que o mercado associa (e os que ficaram de fora) — puxando para a disputa de valor vs. preço",
  "cta_hook": "1 a 2 frases: por que o Mapa da Identidade é o próximo passo (os 3 olhares — você, equipe, clientes — e a distância entre eles revela a causa)"
}

Em "sistemas": um objeto por sistema, na ordem recebida. Marque is_alerta=true nos sistemas de nível baixo (1 ou 2) e escreva o alert começando pelo sintoma. Em "criticos": exatamente 3, dos sistemas mais frágeis.`;

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
  return {
    indice_geral: result.general_score,
    nivel: result.general_nivel,
    nivel_nome: result.general_level,
    leitura_geral: result.general_leitura,
    atributos_de_marca_percebidos: result.atributos_marca || [],
    sistemas: (result.sistemas || []).map((s) => ({
      sistema: s.sistema,
      nota: s.nota,
      nivel: s.nivel,
      nivel_nome: s.nivel_nome,
      sinais_de_alerta: (s.alertas || []).map((a) => ({ indicador: a.indicador, sinal: a.sinal })),
    })),
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
