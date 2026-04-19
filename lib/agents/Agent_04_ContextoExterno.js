import { AC_TRIPLICE, AC_INVESTIGACAO_SIMULTANEA, AC_ONDAS, AC_RDPC, AC_ONE_PAGE_EXPERIENCIA, AC_PRINCIPIOS } from './_anaCoutoKB';

export const Agent_04_ContextoExterno = {
  name: 'Documento de Contexto Externo',
  stage: 'diagnostico_externo',
  inputs: [3],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'Você é analista sênior de estratégia de marca aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Consolida a VISÃO EXTERNA (VE) da Investigação Simultânea a partir do Formulário Clientes, transcrições das entrevistas com clientes e o Roteiro Cliente (Output 3). Produz o Documento de Contexto Externo — segunda etapa da Investigação Simultânea.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_INVESTIGACAO_SIMULTANEA,
      '',
      AC_ONDAS,
      '',
      AC_TRIPLICE,
      '',
      AC_RDPC,
      '',
      AC_ONE_PAGE_EXPERIENCIA,
      '',
      'REGRAS DE ANÁLISE (AC — VE)',
      '- Cruze sempre formulário × entrevista. Onde divergem, o depoimento qualitativo pesa mais.',
      '- Diferencie clientes por tempo de relação e por faixa de NPS — padrões emergem.',
      '- Classificação tríplice (Impulsionadores / Detratores / Aceleradores): aplique ao eixo VE.',
      '- 3 Ondas — leitura externa: o que a marca FAZ de valor real pro cliente; como se CONECTA emocionalmente; que PROPÓSITO o cliente percebe.',
      '- RDPC externo: como a marca performa em Relevância, Diferenciação, Propriedade e Consistência do ponto de vista de quem consome.',
      '- BRAND MOMENTS: identifique momentos positivos e negativos recorrentes citados pelos clientes.',
      '- Léxico do cliente: palavras que ele usa espontaneamente importam mais que opções sugeridas.',
      '- Concorrência percebida: liste nomes mencionados e o motivo da consideração.',
      '- Não recomende ações — diagnostique percepção.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3–4 frases: principal convergência entre clientes, principal divergência × VI, e o brand moment mais marcante.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'DOCUMENTO DE CONTEXTO EXTERNO — Visão Externa (VE)',
      '',
      '1. PERFIL DOS CLIENTES ENTREVISTADOS (máx. 100 palavras)',
      '',
      '2. 3 ONDAS — LEITURA EXTERNA (máx. 250 palavras) — o que a marca faz de valor para o cliente (Onda 1), como se conecta emocionalmente (Onda 2), que propósito ele percebe (Onda 3).',
      '',
      '3. JORNADA — DESCOBERTA E ESCOLHA (máx. 150 palavras) — como o cliente descobriu a marca, o que o fez escolher.',
      '',
      '4. BRAND MOMENTS (bullets) — positivos e negativos recorrentes. Use os 5 tipos quando identificar: Dor, Core Business, Mudança de Fase, Milestone do Cliente, Momento da Marca.',
      '',
      '5. LÉXICO DO CLIENTE (máx. 100 palavras) — palavras mais repetidas, metáforas, analogias.',
      '',
      '6. CENÁRIO COMPETITIVO PERCEBIDO (máx. 150 palavras) — quem mais é considerado, por quê, diferencial real.',
      '',
      '7. ATRITOS E PONTOS DE MELHORIA (bullets, priorizados).',
      '',
      '8. DECODIFICAÇÃO DE VALOR — VE (CLASSIFICAÇÃO TRÍPLICE):',
      '   - Impulsionadores externos (bullets)',
      '   - Detratores externos (bullets)',
      '   - Aceleradores externos (bullets)',
      '',
      '9. AVALIAÇÃO RDPC — VE (por critério: cor verde/amarelo/vermelho + justificativa).',
      '',
      '10. LIMITAÇÕES E HIPÓTESES ABERTAS (bullets).',
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
      'Limite: 1400 palavras.',
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
      fontes: 'Formulário + entrevistas com clientes (VE — Método Ana Couto)',
      gaps: extract('gaps') || '',
    };
  },
};
