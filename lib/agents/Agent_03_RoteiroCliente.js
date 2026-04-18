export const Agent_03_RoteiroCliente = {
  name: 'Roteiro de Entrevista com Cliente',
  stage: 'diagnostico_externo',
  inputs: [2],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'TODO: definir prompt do Agente 3 — Roteiro de Entrevista com Cliente.',
      'Recebe: respostas do formulário de clientes e o Documento de Contexto Interno (Output 2).',
      'Gera: roteiro de entrevista de aprofundamento com clientes, focado no que ficou ambíguo no formulário e em hipóteses a validar.',
      '',
      'Output em XML com tags <resumo_executivo>, <conteudo>, <conclusoes>, <confianca>.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const clientes = (context.formularios || []).filter(f => f.tipo === 'intake_clientes');

    const parts = ['=== FORMULÁRIO CLIENTES ==='];
    if (clientes.length === 0) parts.push('(sem respostas)');
    for (const f of clientes) {
      parts.push(`Respondente: ${f.respondente || 'anônimo'}`);
      parts.push(JSON.stringify(f.respostas_json || {}, null, 2));
      parts.push('');
    }

    const ctxInterno = context.previousOutputs?.[2];
    if (ctxInterno) {
      parts.push('=== DOCUMENTO DE CONTEXTO INTERNO (Output 2) ===');
      if (ctxInterno.resumo_executivo) parts.push(`[Resumo] ${ctxInterno.resumo_executivo}`);
      if (ctxInterno.conteudo) parts.push(ctxInterno.conteudo);
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
      fontes: 'Formulário clientes + Contexto Interno',
      gaps: extract('gaps') || '',
    };
  },
};
