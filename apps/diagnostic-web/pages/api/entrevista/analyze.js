import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { tokenValido } from '../../../lib/tokens/respondenteToken';
import { callEntrevistaModel, extrairJson } from '../../../lib/ai/entrevistaModel';

// Entrevista guiada por IA — Slice 4.
// Uma chamada por resposta que faz DUAS coisas:
//   1. follow-up: decide UMA pergunta de aprofundamento (só se a resposta ficou
//      rasa ou deixou a hipótese do roteiro em aberto);
//   2. cobertura: identifica quais das PERGUNTAS SEGUINTES já foram respondidas
//      por esta resposta, devolvendo uma frase de reconhecimento para cada —
//      para a entrevista não repetir o que a pessoa já disse.
// Nunca bloqueia: qualquer falha devolve { followup: null, cobertas: [] }.

const VAZIO = { success: true, followup: null, cobertas: [] };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { token, pergunta, hipotese, resposta, proximas } = req.body || {};
  if (!pergunta || !resposta || resposta.trim().length < 20) {
    return res.status(200).json(VAZIO);
  }

  try {
    if (token && supabaseAdmin) {
      const { data: resp } = await supabaseAdmin
        .from('respondentes')
        .select('token_expira_em')
        .eq('token', String(token).trim())
        .maybeSingle();
      if (!resp || !tokenValido(resp.token_expira_em)) {
        return res.status(200).json(VAZIO);
      }
    }

    const lista = Array.isArray(proximas) ? proximas.filter((p) => typeof p?.i === 'number' && p?.pergunta) : [];
    const idsValidos = new Set(lista.map((p) => p.i));

    const system = [
      'Você é um entrevistador qualitativo de marca, atento e gentil (método Ana Couto).',
      'Recebe a pergunta atual, a hipótese que ela investiga, a resposta do entrevistado',
      'e a lista das PERGUNTAS SEGUINTES (com índice). Faça duas coisas:',
      '',
      '1) FOLLOW-UP: decida UMA pergunta de aprofundamento apenas se a resposta ficou',
      '   rasa, genérica, evasiva ou deixou a hipótese sem resolver. Se já foi concreta,',
      '   não pergunte nada. Curta, específica, conversacional, em pt-BR, sem pergunta dupla.',
      '',
      '2) COBERTURA: identifique quais das PERGUNTAS SEGUINTES já foram SUBSTANCIALMENTE',
      '   respondidas por esta resposta (não apenas tangenciadas). Para cada uma, devolva o',
      '   índice e uma frase curta de reconhecimento em pt-BR, citando o que a pessoa disse,',
      '   ex.: "Você já comentou sobre o atendimento quando falou da Ana." Seja conservador:',
      '   na dúvida, NÃO marque como coberta.',
      '',
      'Responda APENAS JSON:',
      '{ "followup": "..."|null, "cobertas": [ { "i": <indice>, "reconhecimento": "..." } ] }',
    ].join('\n');

    const user = [
      `Pergunta atual: ${pergunta}`,
      hipotese ? `Hipótese investigada: ${hipotese}` : '',
      `Resposta: ${resposta}`,
      '',
      'Perguntas seguintes:',
      lista.length ? lista.map((p) => `[${p.i}] ${p.pergunta}`).join('\n') : '(nenhuma)',
    ].filter(Boolean).join('\n');

    const { text } = await callEntrevistaModel(system, user, { temperature: 0.3, maxTokens: 700 });

    let followup = null;
    let cobertas = [];
    const parsed = extrairJson(text);
    if (parsed) {
      const f = parsed.followup;
      followup = typeof f === 'string' && f.trim().length > 0 ? f.trim() : null;
      if (Array.isArray(parsed.cobertas)) {
        cobertas = parsed.cobertas
          .filter((c) => idsValidos.has(c?.i) && typeof c?.reconhecimento === 'string' && c.reconhecimento.trim())
          .map((c) => ({ i: c.i, reconhecimento: c.reconhecimento.trim() }));
      }
    }

    return res.status(200).json({ success: true, followup, cobertas });
  } catch (err) {
    console.error('[entrevista/analyze] erro:', err);
    return res.status(200).json(VAZIO);
  }
}
