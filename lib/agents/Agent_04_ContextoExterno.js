export const Agent_04_ContextoExterno = {
  name: 'Documento de Contexto Externo',
  stage: 'diagnostico_externo',
  inputs: [3],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'TODO: definir prompt do Agente 4 — Documento de Contexto Externo.',
      'Recebe: formulário de clientes + transcrições de entrevistas com clientes + o roteiro gerado pelo Agente 3.',
      'Gera: Documento de Contexto Externo sintetizando como o mercado e os clientes percebem a marca (jornada, valor percebido, atritos, palavras usadas).',
      '',
      'Output em XML com tags <resumo_executivo>, <conteudo>, <conclusoes>, <confianca>.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const clientes = (context.formularios || []).filter(f => f.tipo === 'intake_clientes');
    const entrevistas = (context.formularios || []).filter(f => f.tipo === 'entrevista_cliente');

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

    dump('FORMULÁRIO CLIENTES', clientes);
    dump('TRANSCRIÇÕES ENTREVISTA CLIENTES', entrevistas);

    const roteiro = context.previousOutputs?.[3];
    if (roteiro) {
      parts.push('=== ROTEIRO CLIENTE (Output 3) ===');
      if (roteiro.conteudo) parts.push(roteiro.conteudo);
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
      fontes: 'Formulário + entrevistas com clientes',
      gaps: extract('gaps') || '',
    };
  },
};
