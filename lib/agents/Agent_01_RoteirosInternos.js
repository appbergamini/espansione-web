import { AC_TRIPLICE, AC_INVESTIGACAO_SIMULTANEA, AC_ONDAS, AC_PRINCIPIOS } from './_anaCoutoKB';

export const Agent_01_RoteirosInternos = {
  name: 'Roteiros de Entrevista Internos',
  stage: 'pre_diagnostico',
  inputs: [],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'Você é analista sênior do MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Está preparando a VISÃO INTERNA (VI) da Investigação Simultânea: recebe o Formulário Sócios e o Formulário Colaboradores. Seu trabalho é identificar contradições, priorizar quem deve ser entrevistado e gerar roteiros individualizados.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_INVESTIGACAO_SIMULTANEA,
      '',
      AC_ONDAS,
      '',
      AC_TRIPLICE,
      '',
      'ANÁLISE PREPARATÓRIA',
      '- Identifique contradições ENTRE pessoas (sócio X afirma Y, colaborador W responde Z = gap).',
      '- Identifique AMBIGUIDADES individuais: respostas rasas ou abstratas que pedem aprofundamento.',
      '- Identifique lacunas temáticas nas 3 Ondas: algum aspecto de Produto/Pessoas/Propósito ainda não investigado?',
      '- Mapeie padrões por perfil (antigos × novos colaboradores, sócios entre si).',
      '',
      'PRIORIZAÇÃO DE ENTREVISTADOS',
      'Como nem sempre é possível entrevistar todos, rankeie de 1 (imprescindível) a N (opcional).',
      'Critérios Ana Couto:',
      '- Todos os sócios são IMPRESCINDÍVEIS — VI começa pela liderança.',
      '- Entre colaboradores: priorize quem traz resposta MAIS divergente da liderança (insight cruzado).',
      '- Diversidade de perspectiva: tempo de casa, função, posição na hierarquia.',
      '- Quem respondeu de forma MAIS rica ou contraditória merece aprofundamento.',
      '',
      'ROTEIROS INDIVIDUALIZADOS (Branding Aplicado AC)',
      'Para CADA pessoa, gere um roteiro enxuto e personalizado:',
      '- 6 a 10 perguntas por roteiro.',
      '- Cada pergunta ancorada na resposta real da pessoa (cite trechos).',
      '- Cada pergunta declara OBJETIVO — apontando qual ponto da Tríplice (Impulsionador/Detrator/Acelerador) ou qual Onda (Produto/Pessoas/Propósito) está sendo investigado.',
      '- Perguntas comportamentais: "conte sobre uma vez em que..." em vez de "você gosta de...".',
      '- Para colaboradores: preservar confidencialidade. Roteiro se refere por "Colaborador N — cargo · tempo de casa".',
      '- Abertura contextualiza a resposta específica da pessoa; fechamento é projetivo sobre futuro/visão.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3–4 frases: principais contradições detectadas, padrões por perfil, e o que mais precisa ser validado para a Visão Interna.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'ROTEIROS DE ENTREVISTA — VISÃO INTERNA (VI)',
      '',
      '## 1. CONTRADIÇÕES E GAPS DETECTADOS',
      '- bullet (quem disse o quê × quem disse o contrário — cite trechos)',
      '...',
      '',
      '## 2. PRIORIZAÇÃO DE ENTREVISTADOS',
      'Rank 1 — {Nome} ({papel}): justificativa em 1 frase.',
      'Rank 2 — {Nome} ({papel}): ...',
      '...',
      'Cenário mínimo (3 entrevistas): {A}, {B}, {C}.',
      'Cenário ideal (todos): ordem acima.',
      '',
      '## 3. ROTEIROS INDIVIDUALIZADOS',
      '',
      '### 3.1 {Nome} — {papel}',
      'Abertura: [2–3 frases de contexto específico pra esta pessoa]',
      '1. [Pergunta] — objetivo: [ponto da Tríplice ou Onda investigada]',
      '2. ...',
      '...',
      'Fechamento: ...',
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
      'Limite: 3000 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const socios = (context.formularios || []).filter(f => f.tipo === 'intake_socios');
    const colab = (context.formularios || []).filter(f => f.tipo === 'intake_colaboradores');

    const parts = [];
    parts.push('=== PESSOAS DISPONÍVEIS PARA ENTREVISTA ===');
    parts.push('');
    parts.push('SÓCIOS:');
    if (socios.length === 0) parts.push('(nenhum)');
    socios.forEach((f, i) => parts.push(`  ${i + 1}. ${f.respondente || 'Sócio anônimo'}`));
    parts.push('');
    parts.push('COLABORADORES (respostas anônimas — refira-se por função/tempo de casa, não por nome):');
    if (colab.length === 0) parts.push('(nenhum)');
    colab.forEach((f, i) => {
      const r = f.respostas_json || {};
      parts.push(`  ${i + 1}. Colaborador ${i + 1} — ${r.cargo || '(sem cargo)'} · ${r.tempo_casa || '(sem tempo de casa)'}`);
    });
    parts.push('');

    parts.push('=== RESPOSTAS DOS SÓCIOS ===');
    if (socios.length === 0) parts.push('(vazio — sinalize confiança BAIXA)');
    for (const f of socios) {
      parts.push('');
      parts.push(`--- SÓCIO: ${f.respondente || 'anônimo'} ---`);
      parts.push(JSON.stringify(f.respostas_json || {}, null, 2));
    }
    parts.push('');

    parts.push('=== RESPOSTAS DOS COLABORADORES (ANÔNIMAS) ===');
    if (colab.length === 0) parts.push('(vazio — sinalize confiança BAIXA)');
    colab.forEach((f, i) => {
      const r = f.respostas_json || {};
      parts.push('');
      parts.push(`--- COLABORADOR ${i + 1} — ${r.cargo || 'sem cargo'} · ${r.tempo_casa || 'sem tempo de casa'} ---`);
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
      fontes: 'Formulários sócios + colaboradores (VI — Método Ana Couto)',
      gaps: extract('gaps') || '',
    };
  },
};
