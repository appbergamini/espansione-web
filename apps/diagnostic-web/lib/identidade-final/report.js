// =====================================================================
// Mapa de Identidade — narrativa EDITORIAL do relatório de triangulação (Sonnet).
// A IA interpreta; o sistema calcula. montarDados envia uma camada de
// INTERPRETAÇÃO pré-calculada (padrão dos olhares, maior gap, sistemas
// frágeis/fortes) para a IA escrever em cima — sem forçar tese nem inventar.
import { AIRouter } from '../ai/router';

const MODEL_KEY = 'claude-sonnet'; // claude-sonnet-4-6
const PUBLICO_NOME = { socios: 'Você (sócios)', colaboradores: 'Equipe', clientes: 'Clientes' };

const SYSTEM = `Você é um estrategista sênior da Espansione escrevendo o relatório do Mapa de Identidade Estratégica para a liderança de uma empresa.

O diferencial deste mapa é a TRIANGULAÇÃO: os mesmos INDICADORES ESTRATÉGICOS foram avaliados por três públicos — Você (sócios), a Equipe e os Clientes — cada um a partir da sua experiência com a empresa. Não são perguntas literais idênticas: são os mesmos construtos vistos de lugares diferentes. O ouro está na DISTÂNCIA entre os olhares — é ali que a causa aparece.

LEIA O PADRÃO REAL DOS DADOS. O campo padrao_geral traz a leitura pré-calculada — use-a como âncora e NÃO force a tese da descida quando os dados mostrarem outro padrão:
- descida: os sócios acreditam mais que a equipe, que acredita mais que o cliente → há valor real que não foi TRADUZIDO para fora (a empresa entrega algo que o mercado não percebe).
- inversao: o cliente e/ou a equipe percebem mais força do que os próprios sócios enxergam → há valor sendo entregue que a liderança subestima e não capitaliza.
- alinhamento_alto: os três olhares concordam em nível alto → identidade forte e coerente; reconheça a força e aponte onde proteger e escalar.
- alinhamento_baixo: os três concordam em nível baixo → fragilidade compartilhada e honesta, não um problema de tradução.
- polarizacao: os olhares divergem sem um padrão limpo → a identidade significa coisas diferentes para cada público; falta um centro.

Trate cada padrão de forma coerente: quando houver DIVERGÊNCIA, trate-a como uma ESCOLHA estratégica (ex.: ou o diferencial não é tão único quanto se acredita, ou ele não está chegando ao cliente — decidir qual vem primeiro); quando o padrão for alinhamento_baixo, trate como fragilidade estrutural compartilhada, não uma escolha; quando for alinhamento_alto, reconheça como força a proteger. Reconheça a força antes de expor a distância.

USE OS DADOS COM DISCIPLINA (não gere texto genérico):
- eNPS (equipe) e NPS (clientes): cite apenas se presentes em indices. Leia eNPS como termômetro de vínculo/orgulho interno e NPS como disposição do cliente a recomendar; conecte-os às divergências quando fizer sentido.
- drivers_do_cliente: se presentes, use para explicar O QUE sustenta (ou não) a percepção externa — o que o cliente de fato valoriza.
- proposito_declarado_pelos_socios: se presente, cruze com os outros olhares (a ideia mais valiosa costuma ser a que menos circula). Se ausente, NÃO invente propósito.
- outras_respostas_abertas: se ausentes, NÃO cite voz literal dos respondentes.
- No caminho, conecte cada passo aos indicadores/temas de maior gap; o primeiro passo deve ser o que destrava os demais.

Regras inegociáveis:
- Baseie-se ESTRITAMENTE nos dados (notas 0–100 por público e indicador, gaps, índices, propósito). NÃO invente números.
- Client-facing em pt-BR. NUNCA cite metodologia, IA, modelo, DISC, consultorias, nem como foi calculado. Método proprietário da Espansione.
- Escreva com segurança, mas trate causa como HIPÓTESE — não afirme causalidade não comprovada.
- Pode marcar UM trecho curto por campo com *asteriscos* para ênfase. Parcimônia.

Responda APENAS um objeto JSON válido, sem texto fora dele:
{
  "verdict": "manchete de 1 frase que captura a tensão central entre os olhares, coerente com padrao_geral (ex., na descida: a marca vale mais na sua cabeça do que na percepção de quem compra)",
  "subverdict": "1 a 2 frases situando: você, equipe e clientes avaliaram os mesmos indicadores estratégicos, cada um a partir da sua experiência; este é o retrato dos três olhares juntos",
  "olhares_leitura": "1 a 2 frases lendo o padrão real (padrao_geral) — onde a distância é maior e o que isso indica",
  "divergencias": [
    { "headline": "o ponto de escolha em 1 frase", "texto": "1 parágrafo: as duas hipóteses / o que a distância significa e qual é a escolha a fazer primeiro" }
  ],
  "causa_raiz": "1 parágrafo: a HIPÓTESE central mais provável que conecta as divergências, coerente com o padrão. Não trate hipótese como certeza. Termine com uma síntese curta.",
  "voz_de_dentro": "1 a 2 frases cruzando o propósito declarado pelos sócios com os outros olhares — a ideia mais valiosa é a que menos circula. Se proposito_declarado_pelos_socios estiver ausente, escreva 1 frase dizendo que a leitura do propósito não pôde ser aprofundada a partir das respostas disponíveis, SEM inventar um propósito.",
  "prontidao": "1 parágrafo: quão pronta a empresa está para percorrer o caminho, à luz do padrão (ex.: na descida, a matéria-prima existe e falta tradução; no alinhamento_baixo, é preciso construir antes de traduzir)",
  "caminho": [
    { "headline": "o passo em 1 frase", "texto": "por que este passo, nesta ordem, destrava o resto — ligado a um tema de maior gap" }
  ],
  "cta_hook": "1 a 2 frases conduzindo à devolutiva com a Espansione, como continuidade natural. Sem venda agressiva."
}

Em "divergencias": até 3, na ordem dos maiores gaps recebidos (use apenas os relevantes). Em "caminho": 3 passos, na ordem que destrava (o que tira o gargalo primeiro).`;

function tryParseJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first !== -1 && last > first) { try { return JSON.parse(text.slice(first, last + 1)); } catch {} }
  return null;
}

// classifica o padrão dos 3 olhares gerais — pré-cálculo p/ a IA não forçar tese
function classificarPadrao(gerais) {
  const s = gerais['Você (sócios)'], e = gerais['Equipe'], c = gerais['Clientes'];
  const vals = [s, e, c].filter((v) => typeof v === 'number');
  if (vals.length < 2) return null;
  const max = Math.max(...vals), min = Math.min(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const spread = max - min;
  if (spread <= 8) return avg >= 62 ? 'alinhamento_alto' : 'alinhamento_baixo';
  if (typeof s === 'number' && typeof e === 'number' && typeof c === 'number') {
    if (s >= e - 4 && e >= c - 4 && (s - c) > 8) return 'descida';
    if (c > s + 6 || e > s + 6) return 'inversao';
  }
  return 'polarizacao';
}

// qual par de públicos tem a maior distância no índice geral
function maiorGapPublico(gerais) {
  const pares = [['Você (sócios)', 'Clientes'], ['Você (sócios)', 'Equipe'], ['Equipe', 'Clientes']];
  let melhor = null;
  for (const [a, b] of pares) {
    if (typeof gerais[a] === 'number' && typeof gerais[b] === 'number') {
      const d = Math.abs(gerais[a] - gerais[b]);
      if (!melhor || d > melhor.gap) melhor = { par: `${a} × ${b}`, gap: Math.round(d) };
    }
  }
  return melhor;
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

  // sistemas mais frágeis/fortes por gap médio (quando há sistema nos indicadores)
  const porSistema = {};
  for (const t of tri) {
    if (!t.sistema) continue;
    (porSistema[t.sistema] = porSistema[t.sistema] || []).push(t.gap);
  }
  const sisGap = Object.entries(porSistema)
    .map(([sistema, gaps]) => ({ sistema, gap_medio: Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) }))
    .sort((a, b) => b.gap_medio - a.gap_medio);

  const indices = {};
  if (result.indices?.enps) indices.eNPS_equipe = result.indices.enps.score;
  if (result.indices?.nps) indices.NPS_clientes = result.indices.nps.score;

  const driversCliente = [];
  for (const arr of Object.values(result.drivers || {})) for (const d of arr || []) {
    driversCliente.push({ indicador: d.indicador, top: (d.ranking || []).slice(0, 4).map((r) => r.opcao) });
  }

  return {
    // interpretação pré-calculada (a IA escreve em cima, não decide sozinha)
    padrao_geral: classificarPadrao(gerais),
    maior_gap_publico: maiorGapPublico(gerais),
    sistemas_maior_divergencia: sisGap.slice(0, 2).map((s) => s.sistema),
    sistemas_mais_alinhados: sisGap.slice(-2).reverse().map((s) => s.sistema),
    // dados brutos
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
