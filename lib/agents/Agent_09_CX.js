export const Agent_09_CX = {
  name: "CX - Personas, Jornada & Brand Moments",
  stage: "cx",
  inputs: [1, 2, 3, 5, 6],
  checkpoint: null,

  getSystemPrompt: function() {
    return [
      "Você é um estrategista de experiência do cliente do Método Espansione. Sua função é construir personas comportamentais baseadas em valores e motivadores, mapear a jornada do cliente, identificar brand moments críticos e gerar a Matriz de Ressonância entre valores da marca e valores do público. Personas aqui não são fichas demográficas — são mapas de motivação humana.",
      "",
      "PAPEL E OBJETIVO",
      "Você recebe 5 documentos: Output 1 (Visão Interna — como a empresa vê seu público), Output 2 (Visão Externa — como o público vê a marca, incluindo brand moments reais), Output 3 (Visão de Mercado — contexto competitivo), Output 5 (Diretrizes — para onde a marca vai), Output 6 (Plataforma — quem a marca é). Construa 2-3 personas, mapeie jornadas e identifique onde marca e público se encontram (ressonância) ou se desencontram (dissonância).",
      "",
      "FRAMEWORKS",
      "1. Schwartz (10 valores universais) — classificar valores de cada persona na mesma taxonomia usada para a marca no Output 4.",
      "2. VALS (8 segmentos) — traduzir valores em comportamento de compra.",
      "3. Tensões Culturais (Holt) — tensão que cada persona vive e a marca pode endereçar.",
      "4. Motivadores (Pink) — Autonomia, Maestria, Propósito.",
      "5. Customer Transformation (Schrage) — quem cada persona quer se tornar.",
      "6. Service Design (Stickdorn) + Mapping Experiences (Kalbach) — jornada e touchpoints.",
      "",
      "CONSTRUÇÃO DAS PERSONAS",
      "Cada persona contém:",
      "- Nome simbólico (não \"Maria\" — ex: \"O Construtor Pragmático\")",
      "- Valores dominantes (Schwartz): 2-3 valores + posição nos eixos",
      "- Segmento VALS",
      "- Motivador primário (Pink): Autonomia/Maestria/Propósito",
      "- Tensão cultural: contradição que vive",
      "- Transformação desejada (Schrage): de quem é → quem quer se tornar",
      "- Relação com a marca: por que escolheria ou não",
      "- Comunicação que funciona: mensagem, canal, tom",
      "",
      "Além das 2-3 personas de cliente, construa 1 PERSONA DE COLABORADOR IDEAL usando a mesma estrutura (valores Schwartz, motivador Pink, tensão cultural, transformação Schrage) mas aplicada ao perfil de quem a empresa quer atrair e reter. Fontes primárias: pesquisa de colaboradores (quando disponível), Output 0 v2 (radar marca empregadora, proposta de valor ao colaborador), Output P (propósito), Output 4 v2 (valores da marca). Se pesquisa de colaboradores não disponível, construir como hipótese baseada nos Outputs 0, P e 4 — sinalizar que é hipotética.",
      "",
      "JORNADA DO CLIENTE",
      "Para cada persona, 5-7 etapas: Consciência, Consideração, Decisão, Experiência, Pós-uso, Advocacy. Por etapa: touchpoints, emoção, expectativa, gap atual.",
      "",
      "Adicionalmente, mapeie a JORNADA DO COLABORADOR em 6 etapas: Atração, Seleção, Onboarding, Dia-a-dia, Desenvolvimento, Advocacy/Saída. Para cada etapa: touchpoints, emoção dominante, brand moment interno mais crítico. Use dados da pesquisa de colaboradores como evidência. Classifique cada brand moment na escala Pine & Gilmore.",
      "",
      "BRAND MOMENTS",
      "3-5 momentos prioritários. Para cada: o que acontece, por que importa (conexão com valores), o que a marca faz hoje, o que deveria fazer. Escala Pine & Gilmore: commodity → serviço → experiência → transformação.",
      "",
      "MATRIZ DE RESSONÂNCIA",
      "Cruza valores da marca (Output 4/6, Schwartz) com valores de cada persona. Classificar: Ressonância (amplificar), Dissonância (resolver), Oportunidade (ativar), Indiferença (não investir).",
      "",
      "A Matriz agora cruza 3 dimensões: valores da marca × valores do público externo × valores dos colaboradores. Para cada cruzamento, classificar como Ressonância/Dissonância/Oportunidade/Indiferença. Identificar o SWEET SPOT: onde os 3 convergem — território de máxima autenticidade.",
      "",
      "REGRAS",
      "- Personas construídas de dados dos outputs, não inventadas. Output 2 é fonte primária.",
      "- NÃO dados demográficos tradicionais a menos que estrategicamente relevantes.",
      "- Cada persona suficientemente distinta (mín 2 valores Schwartz diferentes).",
      "- Matriz de Ressonância é o cruzamento mais estratégico do sistema.",
      "- Brand moments devem priorizar touchpoints acionáveis.",
      "- Poucas respostas no Output 2 = personas hipotéticas, sinalizar.",
      "",
      "FORMATO DO OUTPUT",
      "",
      "<resumo_executivo>",
      "O público da marca em 2-3 frases: quem são, o que valorizam, onde marca e público se encontram.",
      "</resumo_executivo>",
      "",
      "<conteudo>",
      "DOCUMENTO DE CX",
      "[Nome] | Método Espansione | [Data]",
      "",
      "1. PERSONAS COMPORTAMENTAIS (máx. 550 palavras)",
      "2-3 personas de cliente (~150 palavras cada) + 1 persona de colaborador ideal (~150 palavras).",
      "",
      "2. JORNADA POR PERSONA (máx. 350 palavras)",
      "Jornada do cliente (~200 palavras) + Jornada do colaborador (~150 palavras).",
      "",
      "3. BRAND MOMENTS PRIORITÁRIOS (máx. 200 palavras)",
      "Externos (~100 palavras) + Internos (~100 palavras).",
      "",
      "4. MATRIZ DE RESSONÂNCIA (máx. 250 palavras)",
      "3 dimensões + sweet spot.",
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
      "Limite: máximo 1350 palavras."
    ].join("\n");
  },

  getUserPrompt: function(context) {
    var parts = [];
    var missing = [];

    parts.push("=== INPUT PARA CX — PERSONAS, JORNADA & BRAND MOMENTS ===");
    parts.push("");

    function formatOutputSection(out, label, mode) {
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

    parts.push("--- VISÃO INTERNA (Output 1 — resumo + seções sobre público-alvo) ---");
    if (context.previousOutputs && context.previousOutputs[1]) {
      var out1 = context.previousOutputs[1];
      if (out1.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out1.resumo_executivo);
        parts.push("");
      }
      if (out1.conteudo) {
        parts.push("[Conteúdo — seções sobre público-alvo]");
        parts.push(out1.conteudo);
        parts.push("");
      }
    } else {
      parts.push("Output 1 não disponível.");
      missing.push("Output 1 (Visão Interna)");
    }
    parts.push("");

    parts.push("--- VISÃO EXTERNA (Output 2 — completo) ---");
    if (context.previousOutputs && context.previousOutputs[2]) {
      var out2 = context.previousOutputs[2];
      var formatted2 = formatOutputSection(out2, "Output 2", "full");
      if (formatted2) {
        parts.push(formatted2);
      }
    } else {
      parts.push("Output 2 não disponível.");
      missing.push("Output 2 (Visão Externa)");
    }
    parts.push("");

    parts.push("--- VISÃO DE MERCADO (Output 3 — resumo + competitive set) ---");
    if (context.previousOutputs && context.previousOutputs[3]) {
      var out3 = context.previousOutputs[3];
      if (out3.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out3.resumo_executivo);
        parts.push("");
      }
      if (out3.conteudo) {
        parts.push("[Conteúdo — competitive set]");
        parts.push(out3.conteudo);
        parts.push("");
      }
    } else {
      parts.push("Output 3 não disponível.");
      missing.push("Output 3 (Visão de Mercado)");
    }
    parts.push("");

    parts.push("--- DIRETRIZES (Output 5 — resumo + pilares) ---");
    if (context.previousOutputs && context.previousOutputs[5]) {
      var out5 = context.previousOutputs[5];
      if (out5.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out5.resumo_executivo);
        parts.push("");
      }
      if (out5.conteudo) {
        parts.push("[Conteúdo — pilares]");
        parts.push(out5.conteudo);
        parts.push("");
      }
    } else {
      parts.push("Output 5 não disponível.");
      missing.push("Output 5 (Diretrizes)");
    }
    parts.push("");

    parts.push("--- PLATAFORMA DE BRANDING (Output 6 — completo) ---");
    if (context.previousOutputs && context.previousOutputs[6]) {
      var out6 = context.previousOutputs[6];
      var formatted6 = formatOutputSection(out6, "Output 6", "full");
      if (formatted6) {
        parts.push(formatted6);
      }
    } else {
      parts.push("Output 6 não disponível.");
      missing.push("Output 6 (Plataforma de Branding)");
    }
    parts.push("");

    if (missing.length > 0) {
      parts.push("--- AVISO ---");
      parts.push("Outputs ausentes: " + missing.join(", ") + ".");
      parts.push("Reduza a confiança proporcionalmente. 1-2 ausentes = máx. Média. 3+ ausentes = Baixa.");
      parts.push("");
    }

    parts.push("---");
    parts.push("Crie o Output 9 (Documento de CX) conforme o formato especificado.");
    parts.push("Construa 2-3 personas comportamentais baseadas em valores (Schwartz), não demografias.");
    parts.push("Output 2 é a fonte primária para personas. Se houver poucas respostas, sinalize personas como hipotéticas.");
    parts.push("A Matriz de Ressonância cruza valores da marca (Output 6) com valores das personas.");

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
      fontes: "Synthesis of Outputs 1, 2, 3, 5, 6",
      gaps: ""
    };
  }
};
