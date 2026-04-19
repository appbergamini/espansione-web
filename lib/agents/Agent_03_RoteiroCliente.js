export const Agent_03_RoteiroCliente = {
  name: 'Roteiro de Entrevista com Cliente',
  stage: 'diagnostico_externo',
  inputs: [2],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'Você é analista sênior do Método Espansione. Recebe o Formulário de Clientes (múltiplos respondentes, cada um identificado) e o Documento de Contexto Interno (Output 2) já produzido. Seu trabalho é preparar roteiros de entrevista de aprofundamento INDIVIDUALIZADOS por cliente e PRIORIZAR a ordem de entrevista.',
      '',
      'OBJETIVO DOS ROTEIROS',
      '- Validar ou refutar hipóteses do Contexto Interno com a voz de quem usa a marca.',
      '- Aprofundar ambiguidades específicas da resposta de cada cliente (palavras genéricas, NPS sem justificativa clara, brand moments vagos).',
      '- Explorar o valor real percebido (além do produto/serviço) e a jornada emocional do cliente.',
      '',
      'CONCEITOS',
      '- Proposta de Valor Tríplice (Aaker): Funcional, Emocional, Autoexpressão.',
      '- Mapa de Percepções 4 Quadrantes: posicionamento × diferenciação.',
      '- Jobs to be Done: o que o cliente realmente está contratando a marca para fazer.',
      '',
      'ANÁLISE PREPARATÓRIA',
      '- Leia as respostas de CADA cliente e marque ambiguidades específicas dele.',
      '- Compare entre clientes: quem diverge? quem repete o mesmo padrão?',
      '- Cruze com o Contexto Interno (Output 2): que hipóteses internas cada cliente pode validar/refutar?',
      '',
      'PRIORIZAÇÃO DE CLIENTES PARA ENTREVISTA',
      'Dado que raramente todos podem ser entrevistados, rankeie os clientes de 1 (imprescindível) a N (opcional).',
      'Critérios de priorização (explicite motivo por cliente):',
      '- Detratores ou clientes com NPS baixo (0-6) — tendem a trazer os insights mais ricos e menos defensivos.',
      '- Clientes com respostas contraditórias ou inesperadas.',
      '- Clientes que validam ou refutam hipóteses críticas do Contexto Interno.',
      '- Diversidade de perfil: tempo de relação, segmento, faixa de NPS.',
      '- Promotores extremos (NPS 9-10) — validar o "por que" da paixão.',
      'Em geral: se só 1 entrevista for possível, escolha um detrator articulado. Se 2, adicione um promotor extremo. Se 3, incluir um neutro.',
      '',
      'ROTEIROS INDIVIDUALIZADOS',
      'Para CADA cliente, gere um roteiro enxuto e personalizado:',
      '- 6 a 10 perguntas por roteiro.',
      '- Cada pergunta ancorada em resposta real que o cliente deu (cite trechos).',
      '- Cada pergunta declara OBJETIVO ("objetivo: validar hipótese X / explorar brand moment positivo Y").',
      '- Perguntas comportamentais: "conte sobre uma vez em que..." em vez de "você gosta de...".',
      '- Abertura contextual (permissão + referência à nota/resposta do cliente).',
      '- Fechamento projetivo (como recomendaria a marca, o que faria se fosse líder lá).',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3–4 frases: principais hipóteses do Contexto Interno a validar nas entrevistas e os clientes mais críticos pra ouvir.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'ROTEIROS DE ENTREVISTA COM CLIENTES',
      '',
      '## 1. AMBIGUIDADES E HIPÓTESES A VALIDAR',
      '- bullet (hipótese / ambiguidade)',
      '...',
      '',
      '## 2. PRIORIZAÇÃO DE ENTREVISTAS',
      'Rank 1 — {Nome do cliente} ({perfil: tempo de relação, NPS, segmento}): justificativa em 1 frase.',
      'Rank 2 — {Nome}: ...',
      '...',
      'Cenário mínimo (1 entrevista): {Nome}.',
      'Cenário recomendado (3 entrevistas): {A}, {B}, {C}.',
      'Cenário ideal (todos): ordem acima.',
      '',
      '## 3. ROTEIROS INDIVIDUALIZADOS',
      '',
      '### 3.1 {Nome do cliente}',
      'Abertura: [2–3 frases contextuais — agradecimento + referência à resposta específica]',
      '1. [Pergunta] — objetivo: ...',
      '2. ...',
      '...',
      'Fechamento: ...',
      '',
      '### 3.2 {Próximo cliente}',
      '...',
      '',
      '(Repetir por cliente, na ordem da priorização)',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- Takeaway 1',
      '- Takeaway 2',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 2500 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const clientes = (context.formularios || []).filter(f => f.tipo === 'intake_clientes');

    const parts = [];

    parts.push('=== CLIENTES DISPONÍVEIS PARA ENTREVISTA ===');
    parts.push('');
    if (clientes.length === 0) {
      parts.push('(nenhum — sinalize confiança BAIXA e justifique no relatório)');
    } else {
      clientes.forEach((f, i) => {
        const r = f.respostas_json || {};
        const nome = f.respondente || 'Cliente anônimo';
        const nps = r.nps ?? r.satisfacao ?? '?';
        const tempo = r.tempo_cliente || r.tempo_relacao || '?';
        const profissao = r.profissao || '?';
        parts.push(`  ${i + 1}. ${nome} — ${profissao} · relação: ${tempo} · NPS/satisfação: ${nps}`);
      });
    }
    parts.push('');

    parts.push('=== RESPOSTAS COMPLETAS DOS CLIENTES ===');
    for (const f of clientes) {
      parts.push('');
      parts.push(`--- CLIENTE: ${f.respondente || 'anônimo'} ---`);
      const safe = { ...(f.respostas_json || {}) };
      delete safe._respondente_id;
      delete safe._respondente_email;
      parts.push(JSON.stringify(safe, null, 2));
    }
    parts.push('');

    const ctxInterno = context.previousOutputs?.[2];
    if (ctxInterno) {
      parts.push('=== DOCUMENTO DE CONTEXTO INTERNO (Output 2) ===');
      if (ctxInterno.resumo_executivo) parts.push(`[Resumo] ${ctxInterno.resumo_executivo}`);
      if (ctxInterno.conteudo) parts.push(ctxInterno.conteudo);
      if (ctxInterno.conclusoes) parts.push(`[Conclusões] ${ctxInterno.conclusoes}`);
    } else {
      parts.push('=== CONTEXTO INTERNO NÃO DISPONÍVEL — sinalize na confiança e limite o cruzamento ===');
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
