// =====================================================================
// Mapa de Identidade (FINAL) — narrativa do relatório de TRIANGULAÇÃO (IA Sonnet).
// =====================================================================
// Cruza a percepção dos 3 públicos (Sócios × Equipe × Externo) pelos mesmos
// indicadores. O valor está nas CONVERGÊNCIAS e DIVERGÊNCIAS: onde a empresa
// se vê diferente de como é percebida. Client-facing, fiel aos dados.
import { AIRouter } from '../ai/router';

const MODEL_KEY = 'claude-sonnet'; // claude-sonnet-4-6

const PUBLICO_NOME = { socios: 'Sócios e Diretores', colaboradores: 'Equipe (colaboradores e líderes)', clientes: 'Clientes e Fornecedores' };

const SYSTEM = `Você é um consultor estratégico sênior da Espansione escrevendo o relatório do Mapa de Identidade Estratégica de uma empresa, para o próprio cliente (a liderança).

O diferencial deste mapa é a TRIANGULAÇÃO: os mesmos indicadores foram avaliados por três públicos — Sócios/Diretores, a Equipe interna e os Clientes/Fornecedores. O ouro está nos CONTRASTES: onde a empresa se enxerga de um jeito e é percebida de outro. Alinhamento entre os três = identidade forte e coerente; divergência = risco de percepção, ruído ou ilusão interna.

Princípios inegociáveis:
- Baseie-se ESTRITAMENTE nos dados fornecidos (notas 0–100 por público e por indicador, gaps, índices). Não invente números, fatos ou exemplos.
- É client-facing em português. NUNCA cite metodologias, frameworks, consultorias, "IA", "modelo", DISC, nem como foi calculado. O método é proprietário da Espansione.
- Interprete os GAPS como percepção: um indicador onde os sócios pontuam alto e os clientes baixo significa que a empresa acredita entregar algo que o mercado não percebe. Diga o que isso implica para o negócio.
- Tom consultivo, específico, honesto e construtivo. Reconheça as convergências fortes antes de expor as divergências.

Responda APENAS com um objeto JSON válido, sem texto fora dele:
{
  "panorama": "2 a 3 parágrafos: quão alinhados estão os três públicos no geral, o que a identidade da empresa revela e por que os contrastes importam",
  "por_sistema": [
    { "sistema": "Marca", "leitura": "1 parágrafo: como cada público vê este sistema, citando as notas, onde convergem e onde divergem" }
  ],
  "maiores_divergencias": [
    { "indicador": "nome do indicador", "leitura": "1 a 2 frases: o que essa diferença de percepção significa na prática e o risco/oportunidade" }
  ],
  "indices": "1 parágrafo sobre eNPS (equipe), NPS (clientes) e satisfação, se houver dados",
  "drivers_do_cliente": "1 parágrafo sobre o que os clientes valorizam e onde pedem melhoria, se houver dados",
  "recomendacoes": ["ação prática e específica a partir dos contrastes", "..."],
  "fechamento": "1 parágrafo de síntese, realista e encorajador"
}`;

function tryParseJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first !== -1 && last > first) { try { return JSON.parse(text.slice(first, last + 1)); } catch {} }
  return null;
}

// monta o payload legível para a IA (sem códigos crus)
function montarDados(result) {
  const pubs = Object.keys(result.porPublico || {});
  const geralPorPublico = {};
  for (const p of pubs) geralPorPublico[PUBLICO_NOME[p] || p] = result.porPublico[p]?.geral ?? null;

  // notas por sistema × público
  const sistemas = {};
  for (const p of pubs) {
    const sis = result.porPublico[p]?.sistemas || {};
    for (const [nome, dados] of Object.entries(sis)) {
      (sistemas[nome] = sistemas[nome] || {})[PUBLICO_NOME[p] || p] = dados?.nota ?? null;
    }
  }

  // maiores divergências (indicadores com maior gap)
  const divergencias = (result.triangulacao || [])
    .filter((t) => t.gap != null)
    .slice(0, 6)
    .map((t) => ({
      indicador: t.indicador,
      sistema: t.sistema,
      gap: t.gap,
      por_publico: Object.fromEntries(Object.entries(t.porPublico || {}).map(([p, n]) => [PUBLICO_NOME[p] || p, n])),
    }));

  const indices = {};
  if (result.indices?.enps) indices.eNPS_equipe = result.indices.enps.score;
  if (result.indices?.nps) indices.NPS_clientes = result.indices.nps.score;
  if (result.indices?.satisfacao) {
    const sat = {};
    for (const [p, arr] of Object.entries(result.indices.satisfacao)) {
      sat[PUBLICO_NOME[p] || p] = (arr || []).map((s) => ({ indicador: s.indicador, media: s.media }));
    }
    indices.satisfacao = sat;
  }

  const drivers = {};
  for (const [p, arr] of Object.entries(result.drivers || {})) {
    drivers[PUBLICO_NOME[p] || p] = (arr || []).map((d) => ({
      indicador: d.indicador,
      top: (d.ranking || []).slice(0, 5).map((r) => `${r.opcao} (${r.count})`),
    }));
  }

  return { indice_geral_por_publico: geralPorPublico, notas_por_sistema: sistemas, maiores_divergencias: divergencias, indices, drivers };
}

export async function gerarRelatorioTriangulacao({ cliente, result }) {
  const dados = montarDados(result);
  const user = `Empresa: ${cliente || 'Empresa'}\n\nDADOS DA TRIANGULAÇÃO (JSON):\n${JSON.stringify(dados, null, 2)}`;

  const resp = await AIRouter.callModel(SYSTEM, [{ role: 'user', content: user }], {
    modelKey: MODEL_KEY,
    maxTokens: 8000,
    temperature: 0.55,
  });

  const narrativa = tryParseJson(resp?.text || '');
  if (!narrativa) throw new Error('IA não retornou JSON válido para o relatório de identidade');

  const porSistema = {};
  for (const s of narrativa.por_sistema || []) if (s && s.sistema) porSistema[s.sistema] = s;
  return { ...narrativa, porSistema, modelo: 'claude-sonnet-4-6', gerado_em: null };
}
