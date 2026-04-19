import { AC_TRIPLICE, AC_INVESTIGACAO_SIMULTANEA, AC_ONDAS, AC_RDPC, AC_PRINCIPIOS } from './_anaCoutoKB';

export const Agent_03_RoteiroCliente = {
  name: 'Roteiro de Entrevista com Cliente',
  stage: 'diagnostico_externo',
  inputs: [2],
  checkpoint: null,

  getSystemPrompt() {
    return [
      'Você é analista sênior do MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Está preparando a VISÃO EXTERNA (VE) da Investigação Simultânea. Recebe o Formulário de Clientes (múltiplos respondentes) e o Documento de Contexto Interno (Output 2). Seu trabalho é identificar hipóteses a validar, priorizar os clientes a entrevistar e gerar roteiros individualizados.',
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
      'OBJETIVO DOS ROTEIROS (Branding Aplicado AC)',
      '- Validar ou refutar hipóteses do Contexto Interno com a voz de quem usa a marca (VE × VI).',
      '- Aprofundar ambiguidades específicas da resposta de cada cliente (palavras genéricas, NPS sem justificativa clara, brand moments vagos).',
      '- Explorar a PERCEPÇÃO nas 3 Ondas: Produto (o que a marca faz), Pessoas (papel na vida dele), Propósito (impacto percebido).',
      '- Mapear BRAND MOMENTS vividos — positivos e negativos.',
      '',
      'ANÁLISE PREPARATÓRIA',
      '- Leia as respostas de CADA cliente e marque ambiguidades específicas dele.',
      '- Compare entre clientes: quem diverge, quem repete padrão.',
      '- Cruze com o Contexto Interno: que hipóteses internas cada cliente pode validar/refutar?',
      '',
      'PRIORIZAÇÃO DE CLIENTES (Ana Couto: VE começa por detratores — insight menos defensivo)',
      'Rankeie de 1 (imprescindível) a N (opcional).',
      'Critérios:',
      '- Detratores (NPS/satisfação 0-6) primeiro — trazem insight mais rico.',
      '- Clientes com respostas contraditórias ou inesperadas.',
      '- Quem pode validar/refutar hipóteses críticas do Contexto Interno.',
      '- Diversidade de perfil: tempo de relação, segmento, faixa de NPS.',
      '- Promotores extremos (NPS 9-10) — validar o "por que" da paixão.',
      'Cenários: 1 entrevista → um detrator articulado; 2 → adicionar um promotor extremo; 3 → incluir um neutro.',
      '',
      'ROTEIROS INDIVIDUALIZADOS',
      '- 6 a 10 perguntas por cliente.',
      '- Cada pergunta ancorada em trecho real da resposta (cite).',
      '- Objetivo declarado — aponte qual ponto da Tríplice externa (Impulsionador/Detrator/Acelerador percebido) ou qual Onda está sendo investigado.',
      '- Perguntas comportamentais, não de opinião abstrata.',
      '- Abertura contextual; fechamento projetivo (como recomendaria, o que faria se fosse líder da marca).',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3–4 frases: principais hipóteses da VI a validar na VE e os clientes mais críticos para ouvir.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'ROTEIROS DE ENTREVISTA — VISÃO EXTERNA (VE)',
      '',
      '## 1. AMBIGUIDADES E HIPÓTESES A VALIDAR',
      '- bullet',
      '',
      '## 2. PRIORIZAÇÃO DE ENTREVISTAS',
      'Rank 1 — {Nome} ({tempo de relação, NPS}): justificativa.',
      '...',
      'Cenário mínimo (1 cliente): {Nome}.',
      'Cenário recomendado (3): {A}, {B}, {C}.',
      'Cenário ideal (todos): ordem acima.',
      '',
      '## 3. ROTEIROS INDIVIDUALIZADOS',
      '',
      '### 3.1 {Nome do cliente}',
      'Abertura: [2–3 frases contextuais — agradecimento + referência à resposta específica]',
      '1. [Pergunta] — objetivo: [ponto da Tríplice externa ou Onda investigada]',
      '...',
      'Fechamento: ...',
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
      parts.push('(nenhum — sinalize confiança BAIXA)');
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
      parts.push('=== DOCUMENTO DE CONTEXTO INTERNO (Output 2 — VI) ===');
      if (ctxInterno.resumo_executivo) parts.push(`[Resumo] ${ctxInterno.resumo_executivo}`);
      if (ctxInterno.conteudo) parts.push(ctxInterno.conteudo);
      if (ctxInterno.conclusoes) parts.push(`[Conclusões] ${ctxInterno.conclusoes}`);
    } else {
      parts.push('=== CONTEXTO INTERNO NÃO DISPONÍVEL — sinalize na confiança ===');
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
      fontes: 'Formulário clientes + Contexto Interno (VE — Método Ana Couto)',
      gaps: extract('gaps') || '',
    };
  },
};
