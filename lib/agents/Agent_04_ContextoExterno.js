export const Agent_04_ContextoExterno = {
  name: 'Documento de Contexto Externo',
  stage: 'diagnostico_externo',
  inputs: [3],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'Você é analista sênior de estratégia de marca do Método Espansione. Recebe: Formulário de Clientes, transcrições das entrevistas com clientes, e o Roteiro de Cliente (Output 3). Produza o Documento de Contexto Externo — síntese de como a marca é percebida pelo mercado do ponto de vista de quem compra/usa.',
      '',
      'FRAMEWORKS',
      '- Proposta de Valor Tríplice (Aaker): o que é Funcional, Emocional e de Autoexpressão na relação.',
      '- Jobs to be Done: o que o cliente REALMENTE está contratando a marca para fazer.',
      '- Jornada do Cliente: descoberta → consideração → compra → uso → recompra/recomendação. Atritos em cada etapa.',
      '- Brand moments: momentos marcantes positivos e negativos que formam a percepção.',
      '',
      'REGRAS',
      '- Cruze sempre formulário × entrevista. Onde divergem, o depoimento qualitativo pesa mais.',
      '- Diferencie clientes por tempo de relação e por faixa de NPS — padrões geralmente emergem.',
      '- Concorrência percebida: liste os nomes mencionados e o motivo pelo qual foram considerados.',
      '- Palavras que o cliente usa espontaneamente importam mais que as opções que você sugere.',
      '- Não recomende ações — diagnostique percepção.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3–4 frases com os insights mais críticos sobre a percepção externa.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'DOCUMENTO DE CONTEXTO EXTERNO',
      '',
      '1. PERFIL DOS CLIENTES ENTREVISTADOS (máx. 100 palavras)',
      '2. JORNADA — DESCOBERTA E ESCOLHA (máx. 150 palavras)',
      '3. PROPOSTA DE VALOR PERCEBIDA (máx. 200 palavras) — Tríplice (Funcional + Emocional + Autoexpressão).',
      '4. LÉXICO DO CLIENTE (máx. 100 palavras) — palavras mais repetidas, metáforas, analogias.',
      '5. BRAND MOMENTS (bullet) — positivos e negativos recorrentes.',
      '6. ATRITOS E PONTOS DE MELHORIA (bullet, priorizados).',
      '7. CENÁRIO COMPETITIVO PERCEBIDO (máx. 150 palavras) — quem mais é considerado, por quê, diferencial real.',
      '8. JOBS TO BE DONE (2–3 itens) — o que o cliente está contratando a marca para fazer.',
      '9. LIMITAÇÕES E HIPÓTESES ABERTAS.',
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
      'Limite: 1200 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const clientes = (context.formularios || []).filter(f => f.tipo === 'intake_clientes');
    const entrevistas = (context.formularios || []).filter(f => f.tipo === 'entrevista_cliente');

    const parts = [];

    const dump = (label, forms) => {
      parts.push(`=== ${label} ===`);
      if (forms.length === 0) parts.push('(vazio — marque como limitação)');
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
      parts.push('=== ROTEIRO ORIGINAL (Output 3) ===');
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
