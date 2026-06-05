import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { tokenValido } from '../../../lib/tokens/respondenteToken';
import { AIRouter } from '../../../lib/ai/router';

// Entrevista guiada por IA — Slice 2.
// Decide se UMA pergunta de aprofundamento vale a pena após a resposta. É o que
// separa "questionário" de "entrevista": só repergunta quando a resposta ficou
// rasa, genérica ou deixou a hipótese do roteiro sem resolver. Nunca bloqueia o
// fluxo — qualquer falha devolve followup: null.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { token, pergunta, hipotese, resposta } = req.body || {};
  if (!pergunta || !resposta || resposta.trim().length < 20) {
    return res.status(200).json({ success: true, followup: null });
  }

  try {
    // Validação leve do token (gate de custo). Inválido → segue sem follow-up.
    if (token && supabaseAdmin) {
      const { data: resp } = await supabaseAdmin
        .from('respondentes')
        .select('token_expira_em')
        .eq('token', String(token).trim())
        .maybeSingle();
      if (!resp || !tokenValido(resp.token_expira_em)) {
        return res.status(200).json({ success: true, followup: null });
      }
    }

    const system = [
      'Você é um entrevistador qualitativo de marca, atento e gentil (método Ana Couto).',
      'Recebe UMA pergunta, a hipótese que ela investiga e a resposta do entrevistado.',
      'Decida se vale UMA única pergunta de aprofundamento — apenas quando a resposta',
      'ficou rasa, genérica, evasiva, ou deixou a hipótese sem resolver.',
      'Se a resposta já foi concreta e suficiente, NÃO pergunte nada.',
      'O follow-up deve ser curto, específico, conversacional, em pt-BR, pedindo um',
      'exemplo concreto, uma história ou um esclarecimento — nunca uma pergunta dupla.',
      'Responda APENAS JSON: { "followup": "..." } ou { "followup": null }.',
    ].join('\n');

    const user = [
      `Pergunta: ${pergunta}`,
      hipotese ? `Hipótese investigada: ${hipotese}` : '',
      `Resposta: ${resposta}`,
    ].filter(Boolean).join('\n');

    const { text } = await AIRouter.callModel(system, [{ role: 'user', content: user }], {
      modelKey: 'gemini-flash',
      temperature: 0.3,
      maxTokens: 300,
    });

    let followup = null;
    try {
      let t = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
      const i = t.indexOf('{');
      if (i > 0) t = t.slice(i);
      const parsed = JSON.parse(t);
      const f = parsed?.followup;
      followup = typeof f === 'string' && f.trim().length > 0 ? f.trim() : null;
    } catch {
      followup = null;
    }

    return res.status(200).json({ success: true, followup });
  } catch (err) {
    console.error('[entrevista/followup] erro:', err);
    return res.status(200).json({ success: true, followup: null });
  }
}
