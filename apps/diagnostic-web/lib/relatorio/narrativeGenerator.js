export async function generateNarratives(nome, sc) {
  // FIX.17 — defesa contra scores parciais. Endpoint normaliza via
  // normalizeScoresLegacy antes de chamar, mas mantemos fallbacks aqui
  // pra essa função poder ser chamada de outros lugares no futuro sem
  // a mesma exigência de pré-normalização.
  const safeComp = (sc && typeof sc.comp === 'object' && sc.comp) ? sc.comp : {};
  const safeDisc = (sc && typeof sc.disc === 'object' && sc.disc) ? sc.disc : {};
  const safeDA = (sc && typeof sc.dA === 'object' && sc.dA) ? sc.dA : {};
  const safeLead = (sc && typeof sc.lead === 'object' && sc.lead) ? sc.lead : {};
  const jungTipo = (sc?.jung?.tipo && typeof sc.jung.tipo === 'string') ? sc.jung.tipo : null;
  const estiloString = (typeof sc?.estilo_lideranca === 'string' && sc.estilo_lideranca.trim()) ? sc.estilo_lideranca : null;

  const sorted = Object.entries(safeComp).sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3).map(([k, v]) => `${k}(${v})`).join(', ') || '—';
  const gap3 = sorted.slice(-3).map(([k, v]) => `${k}(${v})`).join(', ') || '—';

  // FIX.19 — quando dA / lead estão zerados (instrumento não mediu),
  // descrever a ausência em vez de mandar "0,0,0,0" pro modelo, que
  // levava o Gemini a narrar como se fosse um perfil real e raso.
  const daHasData = ['D', 'I', 'S', 'C'].some(k => Number.isFinite(safeDA[k]) && safeDA[k] > 0);
  const leadHasData = Object.values(safeLead).some(v => Number.isFinite(v) && v > 0);

  const discAdaptadoTxt = daHasData
    ? `D=${safeDA.D} I=${safeDA.I} S=${safeDA.S} C=${safeDA.C}`
    : 'não medido por este instrumento';
  const liderancaTxt = leadHasData
    ? Object.entries(safeLead).map(([k, v]) => `${k}=${v}`).join(', ')
    : (estiloString ? `estilo dominante = "${estiloString}" (sem scores granulares)` : 'não medido');

  const prompt = `Você é um especialista sênior em perfil comportamental (DISC, Jung/MBTI, 16 competências).
Gere as narrativas do relatório executivo de ${nome}.

DADOS DO RESPONDENTE
- Nome: ${nome}
- Perfil DISC: ${sc.profile || '—'}
- DISC Natural: D=${safeDisc.D ?? '—'} I=${safeDisc.I ?? '—'} S=${safeDisc.S ?? '—'} C=${safeDisc.C ?? '—'}
- DISC Adaptado: ${discAdaptadoTxt}
- Estilos de Liderança: ${liderancaTxt}
- Tipo Jung/MBTI: ${jungTipo || '—'}
- 16 Competências (top): ${top3}
- 16 Competências (gap): ${gap3}

DIRETRIZES
- Tom executivo, técnico, direto. Sem clichês de coaching ("acreditar no seu potencial", "abrace o desafio").
- 3 a 4 parágrafos por seção (exceto "tips", que é lista).
- Cite SEMPRE os dados específicos: scores numéricos, nomes de competências do top/gap, tipo Jung, estilo de liderança. Nunca generalize.
- Cruze DISC + Jung + competências quando fizer sentido (ex.: "perfil C alto + ISTJ + alta Concentração reforça padrão analítico estruturado").
- Quando um campo aparece como "não medido", NÃO invente dado nem narrativa sobre ele — apenas omita ou registre brevemente que o instrumento não capturou.
- Em "tips": 4 recomendações concretas e personalizadas baseadas no GAP de competências e no perfil DISC, não genéricas.

Retorne EXCLUSIVAMENTE este JSON (sem markdown, sem comentário):
{"profile_desc":"3-4 parágrafos","strengths":"3-4 parágrafos","development":"3-4 parágrafos","leadership":"3-4 parágrafos","communication":"3-4 parágrafos","conflict":"3-4 parágrafos","tips":"4 dicas numeradas (1. ... 2. ... 3. ... 4. ...)"}`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(
        // FIX.20 — atualiza modelo pro catálogo atual do projeto.
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            // FIX.19 — sobe maxOutputTokens pra acomodar 7 seções com
            // 3-4 parágrafos cada (antes default ~1024 truncava o JSON).
            generationConfig: { temperature: 0.7, responseMimeType: 'application/json', maxOutputTokens: 8192 },
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        return JSON.parse(text);
      }
    } catch (e) {
      console.error('[NARRATIVES] Falha Gemini:', e.message);
    }
  }

  // Fallback sem IA
  const n = { D: 'Dominância', I: 'Influência', S: 'Estabilidade', C: 'Conformidade' };
  const dom = Object.entries(safeDisc).sort((a, b) => b[1] - a[1]);
  const p1 = dom[0]?.[0] || 'D';
  const p2 = dom[1]?.[0] || 'I';
  return {
    profile_desc: `Seu perfil ${sc.profile} combina ${n[p1]} e ${n[p2]}.\n\nEsse perfil indica um estilo de atuação que equilibra essas duas dimensões de forma complementar.`,
    strengths: `Suas maiores forças estão nas competências mais altas do seu perfil.\n\nNa prática, essas forças se manifestam no modo como você conduz suas atividades diárias.`,
    development: `As áreas com maior potencial de desenvolvimento representam oportunidades de crescimento.\n\nDesenvolvimento significa expandir seu repertório comportamental.`,
    leadership: `Seu estilo de liderança reflete diretamente seu perfil comportamental.\n\nIsso se traduz na forma como você conduz reuniões e toma decisões.`,
    communication: `Você se comunica de forma ${p1 === 'D' ? 'objetiva' : p1 === 'I' ? 'expressiva' : p1 === 'S' ? 'cuidadosa' : 'estruturada'}.\n\nAs pessoas ao seu redor tendem a se adaptar ao seu estilo comunicativo.`,
    conflict: `Sob pressão, seu instinto é ${p1 === 'D' ? 'enfrentar diretamente' : p1 === 'I' ? 'buscar aliados' : p1 === 'S' ? 'mediar com calma' : 'analisar antes de agir'}.\n\nEstratégia: pergunte-se "o que esta situação precisa de mim?"`,
    tips: `1. Priorize as 3 decisões mais importantes do dia.\n2. Peça feedback direto semanalmente.\n3. Em situações desconfortáveis, pergunte "o que esta situação precisa?"\n4. Celebre pequenas conquistas da equipe.`,
  };
}
