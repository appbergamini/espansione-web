import { AC_TRIPLICE, AC_MOMENTO, AC_RDPC, AC_ONDAS, AC_INVESTIGACAO_SIMULTANEA, AC_DE_PARA, AC_PRINCIPIOS, PORTER_ESTRATEGIA } from './_anaCoutoKB';

export const Agent_06_VisaoGeral = {
  name: 'Visão Geral — Decodificação de Valor e DE-PARA',
  stage: 'sintese',
  inputs: [2, 4, 5],
  checkpoint: 1,

  getSystemPrompt() {
    return [
      'Você é o estrategista-chefe aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Recebe as 3 Visões da Investigação Simultânea consolidadas (VI — Output 2, VE — Output 4, VM — Output 5) e o Mapeamento Comportamental (DISC) da liderança. Sua missão: decodificar o valor existente e potencial da marca, consolidar a Tríplice cruzada e construir o DE-PARA. Este documento é a BASE DO DIAGNÓSTICO que vai destravar as Diretrizes Estratégicas (Agente 8) e a Plataforma de Branding (Agente 9).',
      '',
      AC_PRINCIPIOS,
      '',
      AC_INVESTIGACAO_SIMULTANEA,
      '',
      AC_MOMENTO,
      '',
      AC_ONDAS,
      '',
      AC_TRIPLICE,
      '',
      AC_RDPC,
      '',
      AC_DE_PARA,
      '',
      PORTER_ESTRATEGIA,
      '',
      'REGRAS DE SÍNTESE (AC — Branding constrói valor)',
      '- Priorize PADRÕES que aparecem em pelo menos 2 das 4 fontes (VI+VE+VM+DISC).',
      '- Para cada afirmação, indique a(s) fonte(s): (I) Interno, (E) Externo, (M) Mercado, (D) DISC.',
      '- Conflitos entre as fontes são material valioso — EXPLICITE, não esconda.',
      '- Consolide a Tríplice CRUZADA: pegue os principais Impulsionadores/Detratores/Aceleradores que aparecem em várias visões.',
      '- Construa o DE-PARA nos 3 pilares (Negócio, Marca, Comunicação) — isso vira o GPS estratégico.',
      '- Avalie RDPC CONSOLIDADO da marca (verde/amarelo/vermelho) em cada critério.',
      '- Não prescreva Diretrizes aqui ainda — prepare o terreno. As Diretrizes são o próximo passo (Agente 8).',
      '- O DISC (liderança) informa como a personalidade dos tomadores de decisão se traduz (ou não) na marca.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '4–5 frases: Momento da Marca consolidado, tensão central do diagnóstico, oportunidade mais clara, e sinal da liderança DISC.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'VISÃO GERAL — Decodificação de Valor e DE-PARA',
      '',
      '1. PERFIL ESTRATÉGICO (máx. 150 palavras) — quem é a marca, em qual Momento está, consolidado das 3 Visões.',
      '',
      '2. ESSÊNCIA CONVERGENTE (máx. 200 palavras) — o que aparece igual em VI+VE+VM (o que sustenta a marca).',
      '',
      '3. GAPS DE PERCEPÇÃO (máx. 250 palavras) — divergências entre VI × VE × VM, e entre o que liderança declara × o que é vivido.',
      '',
      '4. COERÊNCIA NAS 3 ONDAS (máx. 150 palavras) — Produto, Pessoas, Propósito: onde há alinhamento, onde há ruptura.',
      '',
      '5. ESTILO DE LIDERANÇA DISC (máx. 150 palavras) — como o perfil comportamental da liderança se reflete (ou contradiz) a identidade da marca.',
      '',
      '6. ANÁLISE COMPETITIVA — PORTER (máx. 250 palavras):',
      '   - Mapeamento das 5 Forças para esta marca (intensidade: baixa/média/alta + justificativa).',
      '   - Estratégia Genérica atual vs. aspirada (Liderança em Custo / Diferenciação / Foco) — a marca está no meio (stuck in the middle)?',
      '   - Pontos da Cadeia de Valor onde a vantagem competitiva se hospeda (ou deveria se hospedar).',
      '',
      '7. AVALIAÇÃO RDPC CONSOLIDADA (cada critério com cor + justificativa em 2 frases).',
      '',
      '8. DECODIFICAÇÃO DE VALOR — TRÍPLICE CRUZADA (I+E+M):',
      '   - IMPULSIONADORES (bullets, marcados (I)(E)(M) conforme fonte)',
      '   - DETRATORES (bullets, marcados)',
      '   - ACELERADORES (bullets, marcados)',
      '',
      '9. DE-PARA ESTRATÉGICO:',
      '   NEGÓCIO — SAIR [retrato hoje] → IR [visão de futuro]',
      '   MARCA — SAIR → IR',
      '   COMUNICAÇÃO — SAIR → IR',
      '',
      '10. HIPÓTESES PARA OS AGENTES DE CONSTRUÇÃO (bullet) — o que cada próximo agente (Valores, Diretrizes, Plataforma, Verbal, Visual, Experiência, Comunicação) precisa validar, resolver ou desenvolver a partir deste diagnóstico.',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- 3 a 5 takeaways que capturam a essência do diagnóstico consolidado.',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 2200 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];

    if (context.cisAssessments && context.cisAssessments.length > 0) {
      parts.push('=== MAPEAMENTO COMPORTAMENTAL (DISC) — equipe ===');
      for (const a of context.cisAssessments) {
        parts.push(`${a.nome || a.email} — Perfil: ${a.perfil_label || 'n/d'}`);
        parts.push(JSON.stringify(a.scores_json || {}, null, 2));
        parts.push('');
      }
    } else {
      parts.push('=== MAPEAMENTO DISC — (nenhum respondente ainda; marque como limitação) ===');
    }

    const posicionamento = (context.formularios || []).filter(f => f.tipo === 'posicionamento_estrategico');
    if (posicionamento.length > 0) {
      parts.push('');
      parts.push('=== TESTE DE POSICIONAMENTO ESTRATÉGICO — respostas dos sócios ===');
      parts.push('Disciplinas de valor (Treacy & Wiersema): Excelência Operacional, Intimidade com Cliente, Liderança em Produto. Use como insumo para a Análise Competitiva Porter (mapeia a Estratégia Genérica atual).');
      for (const p of posicionamento) {
        const r = p.respostas_json || {};
        parts.push('');
        parts.push(`Respondente: ${p.respondente || 'anônimo'}`);
        if (r.scores) parts.push(`Scores (0-1): EO=${r.scores.excelencia_operacional}  IC=${r.scores.intimidade_cliente}  LP=${r.scores.lideranca_produto}`);
        if (r.interpretacao) parts.push(`Interpretação: dominante=${r.interpretacao.dominante}, secundária=${r.interpretacao.secundaria}, fraca=${r.interpretacao.fraco}`);
      }
    }

    const ctxInterno = context.previousOutputs?.[2];
    if (ctxInterno) {
      parts.push('=== CONTEXTO INTERNO / VI (Output 2) ===');
      if (ctxInterno.resumo_executivo) parts.push(`[Resumo] ${ctxInterno.resumo_executivo}`);
      if (ctxInterno.conteudo) parts.push(ctxInterno.conteudo);
      if (ctxInterno.conclusoes) parts.push(`[Conclusões] ${ctxInterno.conclusoes}`);
      parts.push('');
    }

    const ctxExterno = context.previousOutputs?.[4];
    if (ctxExterno) {
      parts.push('=== CONTEXTO EXTERNO / VE (Output 4) ===');
      if (ctxExterno.resumo_executivo) parts.push(`[Resumo] ${ctxExterno.resumo_executivo}`);
      if (ctxExterno.conteudo) parts.push(ctxExterno.conteudo);
      if (ctxExterno.conclusoes) parts.push(`[Conclusões] ${ctxExterno.conclusoes}`);
      parts.push('');
    }

    const vm = context.previousOutputs?.[5];
    if (vm) {
      parts.push('=== VISÃO DE MERCADO / VM (Output 5) ===');
      if (vm.resumo_executivo) parts.push(`[Resumo] ${vm.resumo_executivo}`);
      if (vm.conteudo) parts.push(vm.conteudo);
      if (vm.fontes) parts.push(`[Fontes] ${vm.fontes}`);
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
      fontes: 'Síntese: VI + VE + VM + DISC (Método Ana Couto — Diagnóstico e DE-PARA)',
      gaps: extract('gaps') || '',
    };
  },
};
