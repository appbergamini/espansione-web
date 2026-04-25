import { AC_ONE_PAGE_EXPERIENCIA, AC_ONDAS, AC_PRINCIPIOS, AC_REGRA_SEM_HTML, AC_REGRA_FINDINGS } from './_anaCoutoKB';

export const Agent_12_CX = {
  name: 'Experiência — One Page de Experiência',
  stage: 'cx',
  inputs: [6, 9],
  checkpoint: null,
  // FIX.12 — getUserPrompt injeta previousOutputs[6,9] manualmente.
  consumesContextInUserPrompt: true,

  getSystemPrompt() {
    return [
      'Você é estrategista de experiência aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Recebe o Diagnóstico (Output 6) e a Plataforma de Branding (Output 9). Constrói a ONE PAGE DE EXPERIÊNCIA — conecta marca com pessoas através de Personas, Jornada e Brand Moments.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline em outputs
      '',
      AC_REGRA_FINDINGS, // FIX.24 — findings_json estruturado pra curadoria
      '',
      AC_ONE_PAGE_EXPERIENCIA,
      '',
      AC_ONDAS,
      '',
      'REGRAS (Ana Couto — A marca FAZ)',
      '- Personas são personagens fictícios baseados em dados reais. Exercite empatia.',
      '- Cada persona tem Jobs to Be Done (o que ela busca contratar da marca).',
      '- Jornada Ideal cobre 4 passos macro: Conhecimento, Compra, Uso, Fidelização.',
      '- Brand Moments: criam picos na experiência — 5 tipos (Dor / Core Business / Mudanças de Fase / Milestones do Cliente / Momento da Marca).',
      '- A experiência deve materializar os DIRECIONADORES da Plataforma e vivificar o Propósito.',
      '- Foco: preencher vales (resolver dores) + construir picos (Brand Moments memoráveis).',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3 frases: a experiência-chave que esta marca precisa construir.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'ONE PAGE DE EXPERIÊNCIA — Método Ana Couto',
      '',
      '## PROPÓSITO E DIRECIONADORES',
      '[Transcrever da Plataforma para contextualizar]',
      '',
      '## PERSONAS (2 a 4)',
      '',
      '### PERSONA 1 — [Nome fictício, idade, contexto]',
      'Descritivo breve: [vida, trabalho, aspirações]',
      'JTBD (Jobs to Be Done): [o que ela está contratando desta marca]',
      'Momentos de verdade: [os pontos em que a experiência decide se ela fica ou vai]',
      '',
      '(Repetir para 2–4 personas)',
      '',
      '## JORNADA IDEAL',
      '',
      '### 1. CONHECIMENTO',
      '[Como a persona descobre a marca — canais, estímulos, narrativa]',
      '',
      '### 2. COMPRA',
      '[Decisão e ato de compra — fricções, facilitadores]',
      '',
      '### 3. USO',
      '[Experiência de uso — ritual, qualidade, acompanhamento]',
      '',
      '### 4. FIDELIZAÇÃO',
      '[Recompra, advocacy, comunidade]',
      '',
      '## BRAND MOMENTS',
      '[3–5 Brand Moments prioritários, classificando cada um nos 5 tipos]',
      '',
      '### BRAND MOMENT 1 — [Nome]',
      'Tipo: [Dor / Core Business / Mudança de Fase / Milestone / Momento da Marca]',
      'O que acontece: [descrição em 2 frases]',
      'Como manifesta o Propósito: [1 frase]',
      'Por que é memorável: [1 frase]',
      '',
      '## COERÊNCIA COM AS 3 ONDAS',
      '- Onda 1 (Produto): como a jornada resolve a necessidade funcional',
      '- Onda 2 (Pessoas): como cria conexão emocional',
      '- Onda 3 (Propósito): como expressa o impacto maior',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- 3 takeaways sobre experiência.',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 2500 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];
    const v = context.previousOutputs?.[6];
    const plat = context.previousOutputs?.[9];
    if (v) { parts.push('=== VISÃO GERAL (Output 6) ==='); if (v.resumo_executivo) parts.push(v.resumo_executivo); if (v.conteudo) parts.push(v.conteudo); parts.push(''); }
    if (plat) { parts.push('=== PLATAFORMA DE BRANDING (Output 9) ==='); if (plat.conteudo) parts.push(plat.conteudo); }
    return parts.join('\n');
  },

  parseOutput(rawText) {
    const extract = (tag) => {
      const m = rawText.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return m ? m[1].trim() : '';
    };
    return {
      conteudo: extract('conteudo'),
      resumo_executivo: extract('resumo_executivo'),
      conclusoes: extract('conclusoes'),
      confianca: extract('confianca') || 'Media',
      fontes: 'Visão Geral + Plataforma (Método Ana Couto — One Page de Experiência)',
      gaps: extract('gaps') || '',
    };
  },
};
