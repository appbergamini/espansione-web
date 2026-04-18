export const Agent_01_RoteirosInternos = {
  name: 'Roteiros de Entrevista Internos',
  stage: 'pre_diagnostico',
  inputs: [],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'TODO: definir prompt do Agente 1 — Roteiros de Entrevista Internos.',
      'Recebe: respostas do formulário de sócios e do formulário de colaboradores.',
      'Gera: dois roteiros de entrevista de aprofundamento — um para sócios e outro para colaboradores — focados no que ficou ambíguo ou incompleto nos formulários.',
      '',
      'Output em XML com tags <resumo_executivo>, <conteudo>, <conclusoes>, <confianca>.',
      'Dentro de <conteudo>, use duas seções claramente marcadas: ROTEIRO SÓCIOS e ROTEIRO COLABORADORES.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const socios = (context.formularios || []).filter(f => f.tipo === 'intake_socios');
    const colab = (context.formularios || []).filter(f => f.tipo === 'intake_colaboradores');

    const parts = ['=== FORMULÁRIO SÓCIOS ==='];
    if (socios.length === 0) parts.push('(sem respostas)');
    for (const f of socios) {
      parts.push(`Respondente: ${f.respondente || 'anônimo'}`);
      parts.push(JSON.stringify(f.respostas_json || {}, null, 2));
      parts.push('');
    }

    parts.push('=== FORMULÁRIO COLABORADORES ===');
    if (colab.length === 0) parts.push('(sem respostas)');
    for (const f of colab) {
      parts.push(`Respondente: ${f.respondente || 'anônimo'}`);
      parts.push(JSON.stringify(f.respostas_json || {}, null, 2));
      parts.push('');
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
      fontes: 'Formulários sócios + colaboradores',
      gaps: extract('gaps') || '',
    };
  },
};
