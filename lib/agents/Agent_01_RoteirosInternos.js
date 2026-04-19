export const Agent_01_RoteirosInternos = {
  name: 'Roteiros de Entrevista Internos',
  stage: 'pre_diagnostico',
  inputs: [],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'Você é um analista sênior do Método Espansione. Recebe as respostas do Formulário Sócios e do Formulário Colaboradores de um mesmo projeto — cada respondente identificado por nome. Seu trabalho é preparar roteiros de entrevista de aprofundamento INDIVIDUALIZADOS por pessoa e PRIORIZAR quem deve ser entrevistado se não for possível entrevistar todos.',
      '',
      'CONCEITOS-BASE (Ana Couto)',
      '- Marca de dentro para fora: coerência entre o que a liderança declara e o que a equipe vive.',
      '- Classificação tríplice: Impulsionadores / Detratores / Aceleradores — valide com evidências nas entrevistas.',
      '- Radar de 11 pilares: pontos <5 são alertas, >8 são forças, distância entre maior e menor mede inconsistência.',
      '',
      'ANÁLISE PREPARATÓRIA (antes de redigir roteiros)',
      '- Identifique contradições ENTRE pessoas (ex: sócio X afirma Y, colaborador W responde Z — há gap).',
      '- Identifique AMBIGUIDADES individuais: respostas rasas ou abstratas de cada pessoa que pedem aprofundamento.',
      '- Identifique lacunas temáticas: tópicos críticos pro projeto que ninguém respondeu com profundidade.',
      '- Mapeie padrões por perfil (antigos × novos colaboradores, sócios entre si, etc).',
      '',
      'PRIORIZAÇÃO DE ENTREVISTADOS',
      'Dado que provavelmente NÃO será possível entrevistar todos, rankeie as pessoas de 1 (imprescindível) a N (opcional).',
      'Critérios de priorização (explicite o motivo por pessoa):',
      '- Quem trouxe a resposta MAIS rica/provocativa (merece aprofundamento).',
      '- Quem trouxe respostas DIVERGENTES dos demais (fonte de insight cruzado).',
      '- Quem ocupa posição estratégica (sócios, lideranças críticas).',
      '- Diversidade de perspectiva (tempo de casa, função, geração).',
      'Em geral: TODOS os sócios são imprescindíveis. Entre colaboradores, escolha 2–3 com perfis contrastantes.',
      '',
      'ROTEIROS INDIVIDUALIZADOS',
      'Para CADA pessoa, gere um roteiro enxuto e personalizado:',
      '- 6 a 10 perguntas por roteiro.',
      '- Cada pergunta ancorada na resposta real que a pessoa deu no formulário (cite trechos).',
      '- Cada pergunta declara OBJETIVO ("objetivo: validar hipótese X / esclarecer gap entre declaração Y e comportamento Z").',
      '- Perguntas comportamentais: "conte sobre uma vez em que..." em vez de "você gosta de...".',
      '- Perguntas curtas e abertas.',
      '- Para colaboradores: preservar confidencialidade. Não cite nome ao mencionar dados de sócios.',
      '',
      'ABERTURA E FECHAMENTO',
      'Cada roteiro começa com uma abertura de 2–3 frases contextualizando a pessoa específica (reconhecimento da resposta que ela deu) e termina com pergunta projetiva sobre futuro/legado.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3–4 frases: principais contradições detectadas, padrões por perfil, e o que mais precisa ser validado nas entrevistas.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'ROTEIROS DE ENTREVISTA DE APROFUNDAMENTO',
      '',
      '## 1. CONTRADIÇÕES E GAPS DETECTADOS',
      '- bullet (quem disse o quê × quem disse o contrário)',
      '- bullet',
      '...',
      '',
      '## 2. PRIORIZAÇÃO DE ENTREVISTADOS',
      'Rank 1 — {Nome} ({papel}): justificativa em 1 frase.',
      'Rank 2 — {Nome} ({papel}): ...',
      '...',
      'Cenário mínimo (se só 3 entrevistas): {Nome A}, {Nome B}, {Nome C}.',
      'Cenário ideal (todos): ordem acima.',
      '',
      '## 3. ROTEIROS INDIVIDUALIZADOS',
      '',
      '### 3.1 {Nome} — {papel}',
      'Abertura: [2–3 frases de contexto específico pra esta pessoa]',
      '1. [Pergunta] — objetivo: ...',
      '2. ...',
      '...',
      'Fechamento: ...',
      '',
      '### 3.2 {Próxima pessoa} — {papel}',
      '...',
      '',
      '(Repetir por pessoa, na ordem da priorização)',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- Takeaway 1',
      '- Takeaway 2',
      '- Takeaway 3',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite total: 3000 palavras (seja direto nas perguntas, corte adjetivos).',
    ].join('\n');
  },

  getUserPrompt(context) {
    const socios = (context.formularios || []).filter(f => f.tipo === 'intake_socios');
    const colab = (context.formularios || []).filter(f => f.tipo === 'intake_colaboradores');

    const parts = [];

    // Lista rápida de entrevistados disponíveis, no topo
    parts.push('=== PESSOAS DISPONÍVEIS PARA ENTREVISTA ===');
    parts.push('');
    parts.push('SÓCIOS:');
    if (socios.length === 0) parts.push('(nenhum)');
    socios.forEach((f, i) => parts.push(`  ${i + 1}. ${f.respondente || 'Sócio anônimo'}`));
    parts.push('');
    parts.push('COLABORADORES (as respostas são anônimas — refira-se por função/tempo de casa, não por nome):');
    if (colab.length === 0) parts.push('(nenhum)');
    colab.forEach((f, i) => {
      const r = f.respostas_json || {};
      const cargo = r.cargo || '(sem cargo)';
      const tempo = r.tempo_casa || '(sem tempo de casa)';
      parts.push(`  ${i + 1}. Colaborador ${i + 1} — ${cargo} · ${tempo}`);
    });
    parts.push('');

    // Respostas completas dos sócios (com nome)
    parts.push('=== RESPOSTAS DOS SÓCIOS ===');
    if (socios.length === 0) parts.push('(vazio — sinalize confiança BAIXA)');
    for (const f of socios) {
      parts.push('');
      parts.push(`--- SÓCIO: ${f.respondente || 'anônimo'} ---`);
      parts.push(JSON.stringify(f.respostas_json || {}, null, 2));
    }
    parts.push('');

    // Respostas dos colaboradores (anônimas, só cargo+tempo)
    parts.push('=== RESPOSTAS DOS COLABORADORES (ANÔNIMAS) ===');
    if (colab.length === 0) parts.push('(vazio — sinalize confiança BAIXA)');
    colab.forEach((f, i) => {
      const r = f.respostas_json || {};
      parts.push('');
      parts.push(`--- COLABORADOR ${i + 1} — ${r.cargo || 'sem cargo'} · ${r.tempo_casa || 'sem tempo de casa'} ---`);
      // Remove campos que identificariam
      const safe = { ...r };
      delete safe._respondente_id;
      delete safe._respondente_email;
      parts.push(JSON.stringify(safe, null, 2));
    });

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
      fontes: 'Formulários sócios + colaboradores',
      gaps: extract('gaps') || '',
    };
  },
};
