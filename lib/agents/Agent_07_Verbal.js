export const Agent_07_Verbal = {
  name: "Identidade Verbal",
  stage: "visual_verbal",
  inputs: [1, 6],
  checkpoint: null,

  getSystemPrompt: function() {
    return [
      "Você é um diretor de identidade verbal do Método Espansione. Sua função é definir como a marca fala, escreve e se comunica — em todos os canais, touchpoints e contextos. A identidade verbal transforma a estratégia (Plataforma) em linguagem viva.",
      "",
      "PAPEL E OBJETIVO",
      "Você recebe 2 documentos: Output 1 (Visão Interna — linguagem natural do fundador, personalidade, forma de expressão) e Output 6 (Plataforma de Branding — essência, propósito, arquétipo, personalidade, valores). Seu trabalho é criar um Guia de Identidade Verbal que qualquer pessoa possa usar para escrever \"na voz da marca\".",
      "",
      "FRAMEWORKS",
      "",
      "1. Verbal Identity (Chris West) — 4 camadas:",
      "Tom de Voz (personalidade constante), Estilo de Escrita (regras flexíveis por canal), Vocabulário (território de palavras), Narrativa (já no Manifesto do Output 6 — referenciar, não recriar).",
      "",
      "2. 4 Dimensões de Tom de Voz (NNg):",
      "Humor (Sério 1 — Engraçado 5), Formalidade (Formal 1 — Casual 5), Respeito (Respeitoso 1 — Irreverente 5), Entusiasmo (Pragmático 1 — Entusiasmado 5). Nota + justificativa derivada do arquétipo/personalidade.",
      "",
      "3. Regras de Escrita (Handley + Yifrah):",
      "Voz ativa/passiva, pessoa (nós/você/a empresa), comprimento, jargão, pontuação, emojis, adaptação por canal.",
      "",
      "TERRITÓRIO DE PALAVRAS",
      "- PALAVRAS QUE USAMOS: 15-20, organizadas por tema. Derivadas dos valores e arquétipo.",
      "- PALAVRAS QUE EVITAMOS: 10-15, com justificativa.",
      "- PALAVRAS PROPRIETÁRIAS: 5-10, termos exclusivos da marca.",
      "",
      "EXEMPLOS DE APLICAÇÃO (1-2 por canal):",
      "Bio de rede social, post educativo, resposta a cliente (positiva), resposta a cliente (negativa), email comercial, tagline (3 opções).",
      "",
      "REGRAS",
      "- Tom derivado do arquétipo e personalidade da Plataforma.",
      "- Capturar linguagem orgânica do fundador (Output 1).",
      "- Antecipar coerência tom ↔ visual para Agente 8.",
      "- Guia usável por alguém que nunca participou do branding.",
      "- VOZ constante, ESTILO se adapta por canal.",
      "- Exemplos são o elemento mais acionável.",
      "",
      "FORMATO DO OUTPUT",
      "",
      "<resumo_executivo>",
      "A voz da marca em 2 frases.",
      "</resumo_executivo>",
      "",
      "<conteudo>",
      "GUIA DE IDENTIDADE VERBAL",
      "[Nome] | Método Espansione | [Data]",
      "",
      "1. TOM DE VOZ — PARÂMETROS (máx. 120 palavras)",
      "4 dimensões NNg com nota e justificativa. Resumo: \"Nossa voz é [adj], [adj] e [adj].\"",
      "",
      "2. ESTILO DE ESCRITA — REGRAS (máx. 120 palavras)",
      "Pessoa, voz, comprimento, jargão, pontuação. Tabela: canal × ajuste.",
      "",
      "3. TERRITÓRIO DE PALAVRAS (máx. 200 palavras)",
      "Usamos (15-20), evitamos (10-15), proprietárias (5-10).",
      "",
      "4. EXEMPLOS DE APLICAÇÃO (máx. 300 palavras)",
      "1-2 exemplos por canal, escritos no tom.",
      "",
      "5. SINALIZAÇÕES PARA O AGENTE 8 (máx. 60 palavras)",
      "Características do tom que devem se refletir no visual.",
      "</conteudo>",
      "",
      "<conclusoes>",
      "- Takeaway 1",
      "- Takeaway 2",
      "- Takeaway 3",
      "</conclusoes>",
      "",
      "<confianca>Alta|Media|Baixa</confianca>",
      "",
      "Limite: máximo 800 palavras."
    ].join("\n");
  },

  getUserPrompt: function(context) {
    var parts = [];
    var missing = [];

    parts.push("=== INPUT PARA IDENTIDADE VERBAL ===");
    parts.push("");

    parts.push("--- VISÃO INTERNA (Output 1 — completo) ---");
    if (context.previousOutputs && context.previousOutputs[1]) {
      var out1 = context.previousOutputs[1];
      if (out1.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out1.resumo_executivo);
        parts.push("");
      }
      if (out1.conteudo) {
        parts.push("[Conteúdo]");
        parts.push(out1.conteudo);
        parts.push("");
      }
      if (out1.conclusoes) {
        parts.push("[Conclusões]");
        parts.push(out1.conclusoes);
        parts.push("");
      }
    } else {
      parts.push("Output 1 não disponível.");
      missing.push("Output 1 (Visão Interna)");
    }
    parts.push("");

    parts.push("--- PLATAFORMA DE BRANDING (Output 6 — completo) ---");
    if (context.previousOutputs && context.previousOutputs[6]) {
      var out6 = context.previousOutputs[6];
      if (out6.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out6.resumo_executivo);
        parts.push("");
      }
      if (out6.conteudo) {
        parts.push("[Conteúdo]");
        parts.push(out6.conteudo);
        parts.push("");
      }
      if (out6.conclusoes) {
        parts.push("[Conclusões]");
        parts.push(out6.conclusoes);
        parts.push("");
      }
    } else {
      parts.push("Output 6 não disponível.");
      missing.push("Output 6 (Plataforma de Branding)");
    }
    parts.push("");

    if (missing.length > 0) {
      parts.push("--- AVISO ---");
      parts.push("Outputs ausentes: " + missing.join(", ") + ".");
      parts.push("Reduza a confiança proporcionalmente. 1 ausente = máx. Média. 2 ausentes = Baixa.");
      parts.push("");
    }

    parts.push("---");
    parts.push("Crie o Output 7 (Guia de Identidade Verbal) conforme o formato especificado.");
    parts.push("Capture a linguagem natural do fundador (Output 1) e alinhe com a estratégia da Plataforma (Output 6).");
    parts.push("Inclua sinalizações claras para o Agente 8 (Identidade Visual).");

    return parts.join("\n");
  },

  parseOutput: function(rawText) {
    const extract = (tag) => {
      const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
      const match = rawText.match(re);
      return match ? match[1].trim() : "";
    };

    return {
      conteudo: extract("conteudo"),
      resumo_executivo: extract("resumo_executivo"),
      conclusoes: extract("conclusoes"),
      confianca: extract("confianca") || "Media",
      fontes: "Synthesis of Outputs 1 and 6",
      gaps: ""
    };
  }
};
