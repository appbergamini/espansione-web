// =====================================================================
// Mapa da Maturidade — narrativa do relatório VENDEDOR (IA Sonnet 4.6).
// =====================================================================
// O check-up é a porta de entrada gratuita. O relatório precisa: (1) dizer o
// nível de cada sistema, (2) expor o risco de NÃO agir, (3) empurrar para o
// aprofundamento pago (Mapa da Identidade Estratégica). Tom consultivo que
// vende — nunca raso, nunca alarmista falso. Fiel aos dados: usa os sinais de
// alerta reais das respostas baixas; não inventa números nem cita métodos.
import { AIRouter } from '../ai/router';

const MODEL_KEY = 'claude-sonnet'; // claude-sonnet-4-6

const SYSTEM = `Você é um consultor estratégico sênior da Espansione escrevendo o relatório do Mapa da Maturidade (um check-up gratuito) para o dono de uma empresa.

Objetivo do relatório: mostrar com clareza em que nível a empresa está em cada sistema, tornar visível o RISCO de manter esse nível, e conduzir naturalmente o leitor a aprofundar no Mapa da Identidade Estratégica (o instrumento pago que investiga as causas). É um texto que VENDE o próximo passo — consultivo, específico e honesto, sem ser alarmista falso nem raso.

Princípios inegociáveis:
- Baseie-se ESTRITAMENTE nos dados fornecidos (nível, nota, leitura da faixa e sinais de alerta reais). Não invente fatos, números ou exemplos fora dos dados.
- É client-facing em português. NUNCA cite metodologias, frameworks, consultorias, "IA", "modelo", "agente", DISC, nem como o resultado foi calculado. O método é proprietário da Espansione.
- Fale do NEGÓCIO e das consequências práticas (perda de vendas, dependência dos sócios, ruído com clientes, retrabalho, evasão de talentos) — nunca de "governança" ou jargão de RH.
- Para cada sistema em nível baixo, o risco deve ser concreto e o convite ao aprofundamento deve nascer do próprio diagnóstico (não um anúncio colado no fim).
- Reconheça o que está forte antes de apontar o que trava — realista e encorajador.

Responda APENAS com um objeto JSON válido, sem texto fora dele, neste formato:
{
  "panorama": "2 a 3 parágrafos: em que estágio geral a empresa está (cite o índice e o nome do nível), o contraste entre sistemas fortes e frágeis, e por que olhar isso agora importa para o crescimento",
  "sistemas": [
    {
      "sistema": "Marca",
      "nivel": 2,
      "diagnostico": "1 parágrafo respondendo 'qual é o seu nível?' — o que esse nível significa na prática para este sistema, citando os sinais concretos observados",
      "riscos": "1 parágrafo respondendo 'quais riscos esse nível traz para o crescimento?' — consequências reais de manter esse patamar",
      "por_que_aprofundar": "1 parágrafo respondendo 'por que vale aprofundar?' — o que o Mapa da Identidade Estratégica revelaria/resolveria aqui, conduzindo ao próximo passo"
    }
  ],
  "prioridade": "1 parágrafo: por qual(is) sistema(s) começar e por quê, ligando à urgência do negócio",
  "chamada_final": "1 parágrafo curto e direto convidando a avançar para o Mapa da Identidade Estratégica, sem soar como propaganda genérica"
}`;

function tryParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {}
  }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) {
    try {
      return JSON.parse(text.slice(first, last + 1));
    } catch {}
  }
  return null;
}

// payload legível para a IA — sem códigos crus de pergunta
function montarDados(result) {
  return {
    indice_geral: result.general_score,
    nivel_geral: result.general_nivel,
    nivel_geral_nome: result.general_level,
    leitura_geral: result.general_leitura,
    sistemas_fortes: result.strong_systems,
    sistemas_criticos: result.critical_systems,
    atributos_de_marca_percebidos: result.atributos_marca || [],
    sistemas: (result.sistemas || []).map((s) => ({
      sistema: s.sistema,
      nota: s.nota,
      nivel: s.nivel,
      nivel_nome: s.nivel_nome,
      leitura: s.leitura,
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
  if (!narrativa) {
    throw new Error('IA não retornou JSON válido para o relatório de maturidade');
  }
  // indexa sistemas por nome para o PDF consumir fácil
  const porSistema = {};
  for (const s of narrativa.sistemas || []) {
    if (s && s.sistema) porSistema[s.sistema] = s;
  }
  return { ...narrativa, porSistema, modelo: 'claude-sonnet-4-6', gerado_em: null };
}
