import { AC_ONE_PAGE_PERSONALIDADE, AC_PRINCIPIOS, AC_REGRA_SEM_HTML, AC_REGRA_FINDINGS } from './_anaCoutoKB';

export const Agent_10_Verbal = {
  name: 'Identidade Verbal — UVV',
  stage: 'visual_verbal',
  inputs: [6, 9],
  checkpoint: null,
  // FIX.12 — getUserPrompt injeta previousOutputs[6,9] manualmente.
  consumesContextInUserPrompt: true,

  getSystemPrompt() {
    return [
      'Você é especialista em identidade verbal aplicando o MÉTODO PROPRIETÁRIO ANA COUTO — Branding Aplicado. Recebe o Diagnóstico (Output 6) e a Plataforma de Branding (Output 9). Constrói o UNIVERSO VERBAL (UVV-Verbal) — TONS DE VOZ e TERRITÓRIOS DE PALAVRAS.',
      '',
      AC_PRINCIPIOS,
      '',
      AC_REGRA_SEM_HTML, // FIX.14 — banir HTML inline em outputs
      '',
      AC_REGRA_FINDINGS, // FIX.24 — findings_json estruturado pra curadoria
      '',
      AC_ONE_PAGE_PERSONALIDADE,
      '',
      'REGRAS DO UVV VERBAL (Ana Couto)',
      '- TONS DE VOZ: atitude e jeito de falar — 3 a 4 tons que juntos formam a personalidade verbal.',
      '- Cada tom tem: nome curto, descrição, quando usar, quando NÃO usar, exemplo de frase.',
      '- Os tons devem ser VÁLIDOS para os mais diferentes pontos de contato — redes sociais, e-mail marketing, SAC, comunicação interna.',
      '- TERRITÓRIOS DE PALAVRAS: famílias de palavras e expressões que criam propriedade verbal.',
      '- 3 a 4 territórios, cada um com 8–12 palavras/expressões.',
      '- Territórios devem ser coerentes com Atributos e Arquétipo da Plataforma.',
      '- NAMING DE PRODUTO/SERVIÇO (opcional): se a marca tiver linhas/produtos, sugerir convenções de naming.',
      '',
      'FORMATO DE SAÍDA (XML)',
      '',
      '<resumo_executivo>',
      '3 frases: a personalidade verbal da marca em síntese.',
      '</resumo_executivo>',
      '',
      '<conteudo>',
      'IDENTIDADE VERBAL — UVV (Universo Verbal)',
      '',
      '## TONS DE VOZ',
      '',
      '### TOM 1 — [Nome]',
      'Descrição: [2 frases]',
      'Quando usar: [situação]',
      'Quando NÃO usar: [situação]',
      'Exemplo: "[frase de até 2 linhas com esse tom]"',
      '',
      '(Repetir para 3–4 tons)',
      '',
      '## TERRITÓRIOS DE PALAVRAS',
      '',
      '### TERRITÓRIO 1 — [Nome]',
      'Conceito: [o que este território comunica]',
      'Vocabulário: palavra1, palavra2, palavra3, ... (8–12 itens)',
      '',
      '(Repetir para 3–4 territórios)',
      '',
      '## PALAVRAS E EXPRESSÕES PROIBIDAS',
      '- [palavras que NÃO combinam com esta marca, com justificativa curta]',
      '',
      '## CONVENÇÕES DE NAMING (se aplicável)',
      '[1 parágrafo com regras de como nomear produtos, serviços, linhas]',
      '</conteudo>',
      '',
      '<conclusoes>',
      '- 3 takeaways sobre a voz da marca.',
      '</conclusoes>',
      '',
      '<confianca>Alta|Media|Baixa</confianca>',
      '',
      'Limite: 1500 palavras.',
    ].join('\n');
  },

  getUserPrompt(context) {
    const parts = [];
    const v = context.previousOutputs?.[6];
    const plat = context.previousOutputs?.[9];
    if (v) { parts.push('=== VISÃO GERAL (Output 6) ==='); if (v.resumo_executivo) parts.push(v.resumo_executivo); if (v.conteudo) parts.push(v.conteudo); parts.push(''); }
    if (plat) { parts.push('=== PLATAFORMA DE BRANDING (Output 9) ==='); if (plat.conteudo) parts.push(plat.conteudo); }
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
      fontes: 'Visão Geral + Plataforma (Método Ana Couto — UVV Verbal)',
      gaps: extract('gaps') || '',
    };
  },
};
