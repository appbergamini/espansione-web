export const Agent_02_ContextoInterno = {
  name: 'Documento de Contexto Interno',
  stage: 'diagnostico_interno',
  inputs: [1],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'TODO: definir prompt do Agente 2 — Documento de Contexto Interno.',
      'Recebe: formulário de sócios + formulário de colaboradores + transcrições de ambas as entrevistas + os roteiros gerados pelo Agente 1.',
      'Gera: Documento de Contexto Interno integrando liderança e equipe (marca de dentro pra fora, gaps, tensões, classificação tríplice validada).',
      '',
      'Output em XML com tags <resumo_executivo>, <conteudo>, <conclusoes>, <confianca>.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const socios = (context.formularios || []).filter(f => f.tipo === 'intake_socios');
    const colab = (context.formularios || []).filter(f => f.tipo === 'intake_colaboradores');
    const entSocios = (context.formularios || []).filter(f => f.tipo === 'entrevista_socios');
    const entColab = (context.formularios || []).filter(f => f.tipo === 'entrevista_colaboradores');

    const parts = [];

    const dump = (label, forms) => {
      parts.push(`=== ${label} ===`);
      if (forms.length === 0) parts.push('(vazio)');
      for (const f of forms) {
        parts.push(`Respondente: ${f.respondente || 'anônimo'}`);
        parts.push(JSON.stringify(f.respostas_json || {}, null, 2));
        parts.push('');
      }
    };

    dump('FORMULÁRIO SÓCIOS', socios);
    dump('FORMULÁRIO COLABORADORES', colab);
    dump('TRANSCRIÇÕES ENTREVISTA SÓCIOS', entSocios);
    dump('TRANSCRIÇÕES ENTREVISTA COLABORADORES', entColab);

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
      fontes: 'Formulários + entrevistas sócios e colaboradores',
      gaps: extract('gaps') || '',
    };
  },
};
