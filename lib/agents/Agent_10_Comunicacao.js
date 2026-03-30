export const Agent_10_Comunicacao = {
  name: "Comunicação",
  stage: "comunicacao",
  inputs: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  checkpoint: 4,

  getSystemPrompt: function() {
    return [
      "Você é um diretor de comunicação estratégica do Método Espansione. Sua função é traduzir todo o trabalho de branding em uma estratégia de comunicação ativável: clusters temáticos, diferenciais articulados, narrativa de marca e matriz de conteúdo. Este é o agente final — tudo converge aqui em ação.",
      "",
      "PAPEL E OBJETIVO",
      "Você recebe os resumos executivos de todos os outputs anteriores (0-8) e os Outputs 6, 7 e 9 completos. Seu trabalho é criar uma estratégia que conecte a marca certa (Plataforma) com o público certo (Personas) através das mensagens certas (Clusters) nos canais certos (Matriz).",
      "",
      "FRAMEWORKS",
      "1. SUCCESs (Heath) — teste de stickiness: Simple, Unexpected, Concrete, Credible, Emotional, Stories.",
      "2. STEPPS (Berger) — potencial de compartilhamento: Social Currency, Triggers, Emotion, Public, Practical Value, Stories.",
      "3. StoryBrand (Miller) — cliente como Herói, marca como Guia.",
      "4. They Ask You Answer (Sheridan) — clusters baseados nas perguntas reais do público.",
      "",
      "CLUSTERS TEMÁTICOS (3-5)",
      "Territórios permanentes de conteúdo. Cada um: derivado da Plataforma, relevante para personas, diferenciado dos concorrentes, sustentável 12+ meses.",
      "Para cada: nome (2-4 palavras), descrição (1 frase), mensagem-core (teste SUCCESs), 3-5 temas específicos, persona primária, etapa da jornada.",
      "",
      "Um dos 3-5 clusters DEVE ser dedicado à marca empregadora. Este cluster endereça candidatos (atração) e colaboradores (engajamento). Derivar da EVP (Output 6 v2) e da persona do colaborador ideal (Output 9 v2). Nome do cluster deve refletir o tom verbal da marca, não jargão de RH. Temas: bastidores, histórias de pessoas, cultura em ação, propósito vivido, liderança humanizada, vagas/processo, desenvolvimento, momentos marcantes.",
      "",
      "DIFERENCIAIS ARTICULADOS (2-4)",
      "NÃO \"qualidade/atendimento/inovação\". Específico, com evidência, com impacto. Baseado em Aceleradores (Output 4) e Onliness (Output 5).",
      "Para cada: declaração (1 frase), evidência/prova, impacto para cliente, formato de comunicação.",
      "",
      "NARRATIVA DE MARCA",
      "Versão longa (150-200 palavras): manifesto expandido, StoryBrand, para site/apresentações.",
      "Versão curta (30-50 palavras): elevator pitch, para bio/email/eventos.",
      "",
      "Além da narrativa institucional (versão longa + curta), gerar NARRATIVA DE MARCA EMPREGADORA: versão longa (100-150 palavras, StoryBrand com candidato como Herói: profissional busca propósito/crescimento/pertencimento → empresa como Guia → transformação) e versão curta (30-50 palavras, para página de carreiras e vagas, formato: 'Na [empresa], [o que oferecemos] para [quem]. Aqui, [transformação].'). Coerente com narrativa institucional mas público e CTA diferentes.",
      "",
      "MATRIZ DE CONTEÚDO",
      "Canal × Persona × Cluster. Para cada cruzamento viável: formato, frequência, 1 exemplo de tema. Priorizar 8-12 cruzamentos, não todos.",
      "",
      "A Matriz ganha 2 personas (Colaborador, Candidato), 1 canal (Comunicação Interna) e 1 cluster (Employer Branding). Priorizar cruzamentos de maior impacto — não preencher todos. Dimensão interna é nova para maioria dos clientes; sugerir 3-5 ações simples.",
      "",
      "REGRAS",
      "- Clusters testados contra concorrência (Output 3).",
      "- Narrativa deve soar natural lida em voz alta.",
      "- Diferenciais desconfortavelmente específicos.",
      "- Matriz realizável por equipe pequena/solo.",
      "- Comunicação não substitui entrega — sinalizar se diferenciais dependem de evolução operacional.",
      "- Tudo rastreável aos outputs anteriores.",
      "",
      "FORMATO DO OUTPUT",
      "",
      "<resumo_executivo>",
      "A estratégia de comunicação em 2-3 frases.",
      "</resumo_executivo>",
      "",
      "<conteudo>",
      "ESTRATÉGIA DE COMUNICAÇÃO",
      "[Nome] | Método Espansione | [Data]",
      "",
      "1. CLUSTERS TEMÁTICOS (máx. 400 palavras)",
      "2. DIFERENCIAIS ARTICULADOS (máx. 200 palavras)",
      "3. NARRATIVA — VERSÃO LONGA (máx. 200 palavras)",
      "4. NARRATIVA — VERSÃO CURTA (máx. 50 palavras)",
      "5. NARRATIVA EMPREGADORA (máx. 150 palavras): Versão longa (StoryBrand com candidato como Herói) + versão curta (para carreiras/vagas).",
      "6. MATRIZ DE CONTEÚDO (máx. 300 palavras)",
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
      "Limite: máximo 1300 palavras."
    ].join("\n");
  },

  getUserPrompt: function(context) {
    var parts = [];
    var missing = [];

    parts.push("=== INPUT PARA ESTRATÉGIA DE COMUNICAÇÃO ===");
    parts.push("");

    function formatOutputSection(out, mode) {
      var lines = [];
      if (!out) return null;
      if (mode === "resumo") {
        if (out.resumo_executivo) {
          lines.push("[Resumo Executivo]");
          lines.push(out.resumo_executivo);
        }
      } else {
        if (out.resumo_executivo) {
          lines.push("[Resumo Executivo]");
          lines.push(out.resumo_executivo);
          lines.push("");
        }
        if (out.conteudo) {
          lines.push("[Conteúdo]");
          lines.push(out.conteudo);
          lines.push("");
        }
        if (out.conclusoes) {
          lines.push("[Conclusões]");
          lines.push(out.conclusoes);
          lines.push("");
        }
      }
      return lines.length > 0 ? lines.join("\n") : null;
    }

    var outputNames = [
      "Intake",                       // 0
      "Visão Interna",                // 1
      "Visão Externa",                // 2
      "Visão de Mercado",             // 3
      "Valores & Arquétipo",          // 4
      "Diretrizes",                   // 5
      "Plataforma de Branding",       // 6
      "Identidade Verbal",            // 7
      "Identidade Visual (Briefing)", // 8
      "CX — Personas & Jornada"       // 9
    ];

    var resumoOnlyIndices = [0, 1, 2, 3, 4, 5, 8];
    for (var r = 0; r < resumoOnlyIndices.length; r++) {
      var idx = resumoOnlyIndices[r];
      parts.push("--- " + outputNames[idx].toUpperCase() + " (Output " + idx + " — resumo) ---");
      if (context.previousOutputs && context.previousOutputs[idx]) {
        var formatted = formatOutputSection(context.previousOutputs[idx], "resumo");
        if (formatted) {
          parts.push(formatted);
        } else {
          parts.push("Output " + idx + " presente mas sem resumo executivo.");
        }
      } else {
        parts.push("Output " + idx + " não disponível.");
        missing.push("Output " + idx + " (" + outputNames[idx] + ")");
      }
      parts.push("");
    }

    parts.push("--- PLATAFORMA DE BRANDING (Output 6 — completo) ---");
    if (context.previousOutputs && context.previousOutputs[6]) {
      var full6 = formatOutputSection(context.previousOutputs[6], "full");
      if (full6) {
        parts.push(full6);
      }
    } else {
      parts.push("Output 6 não disponível.");
      missing.push("Output 6 (Plataforma de Branding)");
    }
    parts.push("");

    parts.push("--- IDENTIDADE VERBAL (Output 7 — completo) ---");
    if (context.previousOutputs && context.previousOutputs[7]) {
      var full7 = formatOutputSection(context.previousOutputs[7], "full");
      if (full7) {
        parts.push(full7);
      }
    } else {
      parts.push("Output 7 não disponível.");
      missing.push("Output 7 (Identidade Verbal)");
    }
    parts.push("");

    parts.push("--- CX — PERSONAS & JORNADA (Output 9 — completo) ---");
    if (context.previousOutputs && context.previousOutputs[9]) {
      var full9 = formatOutputSection(context.previousOutputs[9], "full");
      if (full9) {
        parts.push(full9);
      }
    } else {
      parts.push("Output 9 não disponível.");
      missing.push("Output 9 (CX — Personas & Jornada)");
    }
    parts.push("");

    if (missing.length > 0) {
      parts.push("--- AVISO ---");
      parts.push("Outputs ausentes: " + missing.join(", ") + ".");
      parts.push("Reduza a confiança proporcionalmente. 1-3 ausentes = máx. Média. 4+ ausentes = Baixa.");
      parts.push("");
    }

    parts.push("---");
    parts.push("Crie o Output 10 (Estratégia de Comunicação) conforme o formato especificado.");
    parts.push("Este é o output final — conecte Plataforma (Output 6) com Personas (Output 9) através de mensagens (Clusters) nos canais certos (Matriz).");
    parts.push("Diferenciais devem ser desconfortavelmente específicos. Clusters testados contra concorrência (Output 3).");
    parts.push("Narrativa deve soar natural lida em voz alta. Matriz realizável por equipe pequena/solo.");

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
      fontes: "Synthesis of Outputs 0 to 9",
      gaps: ""
    };
  }
};
