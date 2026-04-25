import { AC_COMUNICACAO, AC_ONDAS, AC_PRINCIPIOS, AC_REGRA_SEM_HTML } from './_anaCoutoKB';

export const Agent_13_Comunicacao = {
  name: 'Comunicação — A Marca Fala',
  stage: 'comunicacao',
  inputs: [6, 7, 8, 9, 10, 11, 12],
  checkpoint: 4,
  // FIX.12 — getUserPrompt itera previousOutputs[6..12] manualmente.
  // Backlog FIX.13: reintroduzir cache_control ephemeral em user msg
  // pra este e o Agente 15 (7+ inputs).
  consumesContextInUserPrompt: true,

  getSystemPrompt() {
    return [
      'Você é estrategista de comunicação aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Esta é a última etapa da construção — dar vida à marca na comunicação. Recebe todos os outputs anteriores (6..12) e produz o PLANO DE COMUNICAÇÃO que vai ativar a marca.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline em outputs
      '',
      AC_COMUNICACAO,
      '',
      AC_ONDAS,
      '',
      'REGRAS (Ana Couto — A marca FALA)',
      '- Cada mensagem deve partir da Plataforma (Discurso de Posicionamento + Tagline) e respeitar o UVV Verbal (tons + territórios).',
      '- Histórias únicas e relevantes — não é catálogo de ativos, é narrativa.',
      '- Atuação nas 3 Ondas: comunicação de Produto (Onda 1), de Pessoas (Onda 2) e de Propósito (Onda 3). Distribua mensagens entre essas camadas.',
      '- Considere Brand Moments identificados na CX como oportunidades de ativação.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3 frases: a história central que esta marca precisa contar nos próximos 12 meses.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'PLANO DE COMUNICAÇÃO — A Marca Fala',
      '',
      '## HISTÓRIA CENTRAL',
      '[Parágrafo de 5–7 linhas — a história única e relevante que esta marca vai contar. Deve sair do Propósito e ancorar no Discurso de Posicionamento]',
      '',
      '## MENSAGENS-MESTRE (3 mensagens)',
      '',
      '### MENSAGEM 1 — Onda 1 (Produto)',
      'O que a marca faz — [frase de posicionamento do produto/oferta]',
      'Narrativa de apoio: [2 frases]',
      'Onde ativar: [canais]',
      '',
      '### MENSAGEM 2 — Onda 2 (Pessoas)',
      'Como a marca se conecta — [frase sobre papel na vida das pessoas]',
      'Narrativa de apoio: [2 frases]',
      'Onde ativar: [canais]',
      '',
      '### MENSAGEM 3 — Onda 3 (Propósito)',
      'Que mundo a marca defende — [frase sobre propósito]',
      'Narrativa de apoio: [2 frases]',
      'Onde ativar: [canais]',
      '',
      '## CANAIS E FORMATOS',
      '- Digital (site, redes sociais, e-mail, podcasts): [prioridade, formato, cadência]',
      '- Mídia tradicional (se aplicável): [prioridade, formato]',
      '- Comunicação interna: [frequência, canais]',
      '- Ativação em Brand Moments: [pontuais, conforme CX]',
      '',
      '## CALENDÁRIO MACRO (12 meses)',
      '- Trimestre 1: [foco narrativo]',
      '- Trimestre 2: [foco narrativo]',
      '- Trimestre 3: [foco narrativo]',
      '- Trimestre 4: [foco narrativo]',
      '',
      '## KPIS COMPATÍVEIS COM PLATAFORMA',
      '- Consistência: [como medir coerência da voz]',
      '- Propriedade: [como medir vocabulário único]',
      '- Relevância: [como medir engajamento qualificado]',
      '- Diferenciação: [como medir share of voice distinto]',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- 3 takeaways sobre a ativação da marca.',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 2500 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];
    const labels = {
      6: 'VISÃO GERAL', 7: 'VALORES E ATRIBUTOS', 8: 'DIRETRIZES ESTRATÉGICAS',
      9: 'PLATAFORMA DE BRANDING', 10: 'IDENTIDADE VERBAL (UVV)',
      11: 'BRIEFING VISUAL (One Page de Personalidade)', 12: 'ONE PAGE DE EXPERIÊNCIA',
    };
    for (const n of [6, 7, 8, 9, 10, 11, 12]) {
      const o = context.previousOutputs?.[n];
      if (o) {
        parts.push(`=== OUTPUT ${n} — ${labels[n]} ===`);
        if (o.resumo_executivo) parts.push(`[Resumo] ${o.resumo_executivo}`);
        if (o.conteudo) parts.push(o.conteudo);
        parts.push('');
      }
    }
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
      fontes: 'Pipeline completo (Método Ana Couto — Comunicação)',
      gaps: extract('gaps') || '',
    };
  },
};
