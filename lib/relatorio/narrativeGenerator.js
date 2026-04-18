export async function generateNarratives(nome, sc) {
  const sorted = Object.entries(sc.comp).sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3).map(([k, v]) => `${k}(${v})`).join(', ');
  const gap3 = sorted.slice(-3).map(([k, v]) => `${k}(${v})`).join(', ');

  const prompt = `Você é um especialista em perfil comportamental DISC.
Gere narrativas para um relatório de perfil comportamental.
DADOS: Nome: ${nome}, Perfil: ${sc.profile}, DISC Natural: D=${sc.disc.D} I=${sc.disc.I} S=${sc.disc.S} C=${sc.disc.C}, DISC Adaptado: D=${sc.dA.D} I=${sc.dA.I} S=${sc.dA.S} C=${sc.dA.C}, Liderança: ${Object.entries(sc.lead).map(([k, v]) => k + '=' + v).join(', ')}, Top: ${top3}, Gap: ${gap3}
Gere APENAS este JSON (sem markdown):
{"profile_desc":"2-3 parágrafos descrevendo o perfil.","strengths":"2 parágrafos sobre forças.","development":"2 parágrafos sobre desenvolvimento.","leadership":"2 parágrafos sobre liderança.","communication":"2 parágrafos sobre comunicação.","conflict":"2 parágrafos sobre conflitos.","tips":"4 dicas práticas numeradas."}`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
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
  const dom = Object.entries(sc.disc).sort((a, b) => b[1] - a[1]);
  const p1 = dom[0][0], p2 = dom[1][0];
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
