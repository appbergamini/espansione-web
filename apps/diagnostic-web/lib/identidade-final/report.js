// =====================================================================
// Mapa de Identidade — narrativa EDITORIAL do relatório de triangulação (Sonnet).
// Produz a cópia do relatório visual (reportHtml): veredito, a leitura da
// "descida" entre os 3 olhares, os pontos de escolha (divergências), a
// causa-raiz, a voz de dentro (propósito), a prontidão e o caminho.
import { AIRouter } from '../ai/router';

const MODEL_KEY = 'claude-sonnet'; // claude-sonnet-4-6
const PUBLICO_NOME = { socios: 'Você (sócios)', colaboradores: 'Equipe', clientes: 'Clientes' };

const SYSTEM = `Você é um estrategista sênior da Espansione escrevendo o relatório do Mapa de Identidade Estratégica para a liderança de uma empresa.

O diferencial deste mapa é a TRIANGULAÇÃO: os mesmos indicadores foram avaliados por três públicos — Você (sócios), a Equipe e os Clientes. O padrão quase sempre é uma DESCIDA: você acredita mais do que a equipe, que acredita mais do que o cliente. O ouro está na DISTÂNCIA entre os olhares — é ali que a causa aparece. Alinhamento = identidade forte; divergência = valor que mora na cabeça dos sócios e não foi traduzido.

Voz: madura, específica, para o dono. Lê o gap como percepção (a empresa acredita entregar algo que o mercado não percebe) e diz o que isso implica. Cada divergência é uma ESCOLHA (ex.: ou o diferencial não é tão único, ou não chega ao cliente — decidir qual é a primeira escolha). Reconhece a força antes de expor a distância.

Regras inegociáveis:
- Baseie-se ESTRITAMENTE nos dados (notas 0–100 por público e indicador, gaps, índices, e o propósito declarado pelos sócios, se houver). Não invente números.
- Client-facing em pt-BR. NUNCA cite metodologia, IA, modelo, DISC, consultorias, nem como foi calculado. Método proprietário da Espansione.
- Pode marcar UM trecho curto por campo com *asteriscos* para ênfase. Parcimônia.

Responda APENAS um objeto JSON válido, sem texto fora dele:
{
  "verdict": "manchete de 1 frase que captura a distância central entre os olhares (ex.: a marca vale mais na sua cabeça do que na percepção de quem compra)",
  "subverdict": "1 a 2 frases situando: você, equipe e clientes responderam às mesmas perguntas; este é o retrato dos três olhares juntos",
  "olhares_leitura": "1 a 2 frases lendo o padrão de descida das barras — onde a queda para o cliente é maior, mora a causa",
  "divergencias": [
    { "headline": "o ponto de escolha em 1 frase (ex.: o diferencial que você vê, o cliente não vê)", "texto": "1 parágrafo: as duas hipóteses/o que a distância significa e qual é a escolha" }
  ],
  "causa_raiz": "1 parágrafo: o nó único que explica as divergências (o que torna a empresa valiosa vive na cabeça dos sócios e não foi traduzido). Termine com uma síntese curta.",
  "voz_de_dentro": "1 a 2 frases cruzando o propósito declarado pelos sócios com os outros olhares — a ideia mais valiosa é a que menos circula",
  "prontidao": "1 parágrafo: quão pronta a empresa está para percorrer o caminho (a matéria-prima existe nos sócios; falta tradução)",
  "caminho": [
    { "headline": "o passo em 1 frase", "texto": "por que este passo, nesta ordem, destrava o resto" }
  ],
  "cta_hook": "1 a 2 frases conduzindo à devolutiva com a Espansione"
}

Em "divergencias": exatamente 3, na ordem dos maiores gaps recebidos. Em "caminho": 3 passos, na ordem que destrava (o que tira o gargalo primeiro).`;

function tryParseJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first !== -1 && last > first) { try { return JSON.parse(text.slice(first, last + 1)); } catch {} }
  return null;
}

function montarDados(result, proposito, aberturas) {
  const pubs = Object.keys(result.porPublico || {});
  const gerais = {};
  for (const p of pubs) gerais[PUBLICO_NOME[p] || p] = result.porPublico[p]?.geral ?? null;

  const tri = (result.triangulacao || []).filter((t) => t.gap != null);
  const divergencias = tri.slice(0, 3).map((t) => ({
    indicador: t.indicador, sistema: t.sistema, gap: t.gap,
    por_publico: Object.fromEntries(Object.entries(t.porPublico || {}).map(([p, n]) => [PUBLICO_NOME[p] || p, n])),
  }));
  const olhares = tri.slice(0, 6).map((t) => ({ indicador: t.indicador, gap: t.gap }));

  const indices = {};
  if (result.indices?.enps) indices.eNPS_equipe = result.indices.enps.score;
  if (result.indices?.nps) indices.NPS_clientes = result.indices.nps.score;

  const driversCliente = [];
  for (const arr of Object.values(result.drivers || {})) for (const d of arr || []) {
    driversCliente.push({ indicador: d.indicador, top: (d.ranking || []).slice(0, 4).map((r) => r.opcao) });
  }

  return {
    indice_geral_por_publico: gerais,
    maiores_divergencias: divergencias,
    outros_olhares: olhares,
    indices,
    drivers_do_cliente: driversCliente,
    proposito_declarado_pelos_socios: proposito || null,
    outras_respostas_abertas: aberturas && aberturas.length ? aberturas.slice(0, 6) : null,
  };
}

export async function gerarRelatorioTriangulacao({ cliente, result, proposito = null, aberturas = [] }) {
  const dados = montarDados(result, proposito, aberturas);
  const user = `Empresa: ${cliente || 'Empresa'}\n\nDADOS DA TRIANGULAÇÃO (JSON):\n${JSON.stringify(dados, null, 2)}`;

  const resp = await AIRouter.callModel(SYSTEM, [{ role: 'user', content: user }], {
    modelKey: MODEL_KEY,
    maxTokens: 8000,
    temperature: 0.55,
  });

  const narrativa = tryParseJson(resp?.text || '');
  if (!narrativa) throw new Error('IA não retornou JSON válido para o relatório de identidade');
  return { ...narrativa, modelo: 'claude-sonnet-4-6', gerado_em: null };
}
