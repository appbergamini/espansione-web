// =====================================================================
// Mapa de Maturidade — geração da narrativa do relatório por IA (Sonnet 4.6)
// =====================================================================
// Recebe o resultado consolidado + as respostas reais e devolve uma narrativa
// estruturada (JSON) que alimenta o PDF. Tom executivo, client-facing, fiel
// aos dados — nunca inventa números nem cita metodologias/ferramentas.

import { AIRouter } from '../ai/router';
import { PILAR_BY_CODE } from './pilares';

const MODEL_KEY = 'claude-sonnet'; // claude-sonnet-4-6

const SYSTEM = `Você é um consultor estratégico sênior da Espansione, escrevendo o relatório do Mapa de Maturidade de uma empresa para o próprio cliente.

Princípios:
- Tom executivo, claro, objetivo e construtivo. Nunca alarmista, nunca raso.
- Baseie-se ESTRITAMENTE nos dados fornecidos (níveis, percentuais e respostas). Não invente fatos, números ou exemplos que não estejam nos dados.
- É um texto que o cliente vai ler. NÃO cite metodologias, frameworks, consultorias ou marcas de terceiros. NÃO use jargão de RH/gestão como "governança". NÃO mencione "IA", "modelo", "agente" nem como o diagnóstico foi calculado.
- Conecte os pilares entre si quando fizer sentido (ex.: liderança fraca pressionando planejamento).
- Seja específico: cite o que a empresa indicou fazer "sempre" como força e o que indicou "nunca/poucas vezes" como lacuna, usando linguagem natural (sem repetir códigos de pergunta).

Responda APENAS com um objeto JSON válido, sem texto fora dele, neste formato:
{
  "panorama_executivo": "2 a 4 parágrafos sobre o estágio geral da empresa, citando o índice e os contrastes entre pilares fortes e frágeis",
  "pilares": [
    { "code": "DE", "analise": "1 a 2 parágrafos sobre este pilar, citando práticas presentes e ausentes", "destaques": ["força concreta", "..."], "riscos": ["lacuna concreta", "..."] }
  ],
  "prioridades": "1 a 2 parágrafos explicando por onde começar e por quê",
  "plano_de_acao": ["ação prática e específica", "..."],
  "fechamento": "1 parágrafo de síntese, realista e encorajador"
}`;

function tryParseJson(text) {
  if (!text) return null;
  // 1) direto
  try {
    return JSON.parse(text);
  } catch {}
  // 2) bloco ```json ... ```
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {}
  }
  // 3) do primeiro { ao último }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) {
    try {
      return JSON.parse(text.slice(first, last + 1));
    } catch {}
  }
  return null;
}

// monta o payload legível (não envia códigos crus de pergunta)
function montarDados(result, respostasPorPilar) {
  return {
    indice_geral: result.general_score,
    nivel_geral: result.general_level,
    alerta: result.alert || null,
    pilares_criticos: result.critical_pillars,
    pilares_fortes: result.strong_pillars,
    pilares: result.pillars.map((p) => {
      const def = PILAR_BY_CODE[p.code] || {};
      const respostas = respostasPorPilar[p.code] || [];
      return {
        code: p.code,
        pilar: p.name,
        avalia: def.mede || [],
        subdimensoes: def.subdimensoes || [],
        nivel: p.level,
        nivel_nome: p.level_name,
        percentual: p.percentage_score,
        pontuacao: `${p.raw_score}/${p.max_score}`,
        tem_lacuna_critica: p.critical_gap,
        respostas: respostas.map((r) => ({ afirmacao: r.text, resposta: r.label })),
      };
    }),
    trilhas_recomendadas: result.recommendations.map((r) => ({
      pilar: r.pillar,
      prioridade: r.priority,
      trilha: r.trail,
    })),
  };
}

export async function gerarNarrativaRelatorio({ cliente, result, respostasPorPilar }) {
  const dados = montarDados(result, respostasPorPilar);
  const user = `Empresa: ${cliente || 'Empresa'}\n\nDADOS DO DIAGNÓSTICO (JSON):\n${JSON.stringify(
    dados,
    null,
    2
  )}`;

  const resp = await AIRouter.callModel(SYSTEM, [{ role: 'user', content: user }], {
    modelKey: MODEL_KEY,
    maxTokens: 8000,
    temperature: 0.5,
  });

  const narrativa = tryParseJson(resp?.text || '');
  if (!narrativa) {
    throw new Error('IA não retornou JSON válido para o relatório');
  }
  // normaliza pilares como mapa por code para o PDF consumir fácil
  const pilaresMap = {};
  for (const p of narrativa.pilares || []) {
    if (p && p.code) pilaresMap[p.code] = p;
  }
  return { ...narrativa, pilaresMap, modelo: 'claude-sonnet-4-6', gerado_em: null };
}
