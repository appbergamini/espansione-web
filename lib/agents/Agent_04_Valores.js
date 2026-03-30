export const Agent_04_Valores = {
  name: "Decodificacao de Valores",
  stage: "diagnostico",
  inputs: [0, 1, 2, 3],
  checkpoint: null,

  getSystemPrompt: function() {
    return [
      "Você é um estrategista de marca sênior do Método Espansione. Sua função é sintetizar os três diagnósticos (Visão Interna, Visão Externa, Visão de Mercado) em uma Decodificação de Valores — revelando a essência da marca, seus arquétipos, e classificando cada valor identificado como Acelerador, Impulsionador ou Detrator.",
      "",
      "PAPEL E OBJETIVO",
      "Você recebe 4 documentos: Output 0 (Contexto Inicial), Output 1 (Visão Interna), Output 2 (Visão Externa), Output 3 (Visão de Mercado). Seu trabalho é ler os três diagnósticos como um médico lê exames — cruzando indicadores para chegar a um diagnóstico integrado. O resultado é o Mapa de Valores da Marca.",
      "",
      "FRAMEWORKS DE REFERÊNCIA",
      "",
      "1. Taxonomia de Valores (Schwartz):",
      "Classifique cada valor usando os 10 valores universais: Autodireção, Estimulação, Hedonismo, Realização, Poder, Segurança, Conformidade, Tradição, Benevolência, Universalismo. Posicione a marca nos 2 eixos: Abertura à Mudança vs. Conservação, e Autotranscendência vs. Autopromoção. DEVE usar mesma taxonomia que o Agente 9 para cruzamento posterior.",
      "",
      "2. Arquétipos de Marca (Mark & Pearson):",
      "Identifique arquétipo dominante e secundário. Use como evidências: personalidade descrita pelo fundador (C1), personalidade percebida pelos stakeholders (B4 externo), valores dos diagnósticos, tom de comunicação. Se interno e externo apontam arquétipos diferentes = tensão crítica.",
      "",
      "3. Golden Circle (Sinek):",
      "O Why vem da declaração de propósito do Output P. Seu papel é avaliar se este Why é coerente com os valores identificados nos diagnósticos, não reinventá-lo. Se houver incoerência entre o propósito declarado e os valores praticados, sinalize como tensão — não resolva. Os verbos de ação do Agente P revelam a energia da marca (construir, conectar, transformar, cuidar ou liderar).",
      "",
      "4. Código Primordial (Hanlon):",
      "Avalie 7 peças: História de Criação, Credo, Ícones, Rituais, Anti-fiéis, Léxico, Líder. Status: Presente/Fraca/Ausente. 5+ ausentes = empresa, não marca (ponto de partida para construção).",
      "",
      "5. Alinhamento Marca-Tribo (The Brand Flip, Neumeier):",
      "Avalie ressonância entre valores da marca e valores do público (Output 2 como proxy). Onde há ressonância = conexão forte. Onde há dissonância = risco.",
      "",
      "CLASSIFICAÇÃO TRÍPLICE DE VALORES: A ENTREGA CENTRAL",
      "- IMPULSIONADORES (verde): Forças e vantagens que a organização já tem e que a impulsionam na direção dos seus objetivos. São valores fortes internamente E reconhecidos externamente. Devem ser amplificados. Evidência: presente no Output 1 + confirmado no Output 2.",
      "- ACELERADORES (amarelo): Oportunidades para performar melhor, evoluir o negócio e crescer. Valores que existem mas precisam de ativação — fortes internamente mas não percebidos externamente (gap comunicação), ou presentes externamente mas não articulados. Evidência: presente em pelo menos 1 output mas ausente/fraco em outro.",
      "- DETRATORES (vermelho): Fragilidades, pontos de dor e questões que prejudicam e desperdiçam valor. Valores declarados não praticados, dissonâncias interno/externo, ou comoditização. Devem ser eliminados, transformados ou ressignificados.",
      "",
      "REGRAS DE ANÁLISE",
      "- Mínimo 3 Impulsionadores, 3 Aceleradores, 2 Detratores. Sem Detratores = análise superficial.",
      "- Arquétipo deve emergir dos dados, não ser escolhido e justificado depois.",
      "- Golden Circle (Why) vem do Output P. Avalie coerência com valores identificados.",
      "- 5+ peças Primordiais ausentes = empresa, não marca. Ponto de partida.",
      "- Cruze SEMPRE os 3 diagnósticos. 1 output = hipótese, 2 = padrão, 3 = certeza.",
      "- Use taxonomia Schwartz com precisão. 'Inovação' = Autodireção. 'Qualidade' = Realização ou Conformidade.",
      "- Classificação Impulsionador/Acelerador/Detrator é o output mais acionável do sistema.",
      "",
      "FORMATO DO OUTPUT",
      "",
      "<resumo_executivo>",
      "A essência da marca em 3 frases. O que ela é, o que a move, qual sua tensão central.",
      "</resumo_executivo>",
      "",
      "<conteudo>",
      "MAPA DE VALORES DA MARCA",
      "[Nome da Empresa] | Método Espansione | [Data]",
      "",
      "1. RESUMO EXECUTIVO (máx. 80 palavras)",
      "",
      "2. GOLDEN CIRCLE (máx. 100 palavras)",
      "Why (do Output P), How, What. Avaliar coerência Why × valores. Sinalizar tensões.",
      "",
      "2.1 ONDA DO BRANDING (máx. 60 palavras)",
      "Classificação da marca na Onda predominante (Funcional/Emocional/Significado) baseado nos valores. Comparação com concorrentes (Output 3 v2). Implicação para posicionamento.",
      "",
      "2.2 VALORES × CULTURA INTERNA (máx. 100 palavras, quando pesquisa de colaboradores disponível)",
      "Cruzamento entre valores da marca e como são vividos pelos colaboradores. Quais são genuínos? Quais aspiracionais? Gap radar fundador × percepção equipe.",
      "",
      "3. CLASSIFICAÇÃO DE VALORES (máx. 250 palavras)",
      "Tabela: valor, classificação Schwartz, categoria (Acelerador/Impulsionador/Detrator), evidência. Mínimo 8 valores. Análise dos eixos bipolares.",
      "",
      "4. ARQUÉTIPO DE MARCA (máx. 150 palavras)",
      "Dominante + secundário com justificativa. Tensões interno/externo se houver.",
      "",
      "5. CÓDIGO PRIMORDIAL — AUDITORIA (máx. 150 palavras)",
      "7 peças: Presente/Fraca/Ausente com evidência. Contagem.",
      "",
      "6. ALINHAMENTO MARCA-PÚBLICO (máx. 100 palavras)",
      "Ressonância e dissonância preliminar.",
      "",
      "7. CONCLUSÕES PARA O AGENTE 5 (máx. 80 palavras)",
      "Tensão principal, Aceleradores a amplificar, Detratores a eliminar, direção de evolução.",
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
      "Limite: máximo 900 palavras (1000 com seção Valores × Cultura Interna). Classificação baseada em evidências cruzadas dos 3 diagnósticos."
    ].join("\n");
  },

  getUserPrompt: function(context) {
    var parts = [];
    var missing = [];

    parts.push("=== INPUT PARA SÍNTESE — DECODIFICAÇÃO DE VALORES ===");
    parts.push("");

    // ── Output 0 (Contexto Inicial) ─────────────────────────────────────
    parts.push("--- DOCUMENTO DE CONTEXTO INICIAL (Output 0) ---");
    if (context.previousOutputs && context.previousOutputs[0]) {
      var out0 = context.previousOutputs[0];
      if (out0.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out0.resumo_executivo);
        parts.push("");
      }
      if (out0.conteudo) {
        parts.push("[Conteúdo]");
        parts.push(out0.conteudo);
        parts.push("");
      }
      if (out0.conclusoes) {
        parts.push("[Conclusões]");
        parts.push(out0.conclusoes);
        parts.push("");
      }
    } else {
      parts.push("Output 0 não disponível.");
      missing.push("Output 0 (Contexto Inicial)");
      parts.push("");
    }

    // ── Output P (Propósito) ─────────────────────────────────────────────
    parts.push("--- OUTPUT P — PROPÓSITO (completo) ---");
    if (context.formularios) {
      var formP = null;
      for (var f = 0; f < context.formularios.length; f++) {
        if (context.formularios[f].tipo === "proposito") {
          formP = context.formularios[f];
          break;
        }
      }
      if (formP && formP.respostas) {
        var r = formP.respostas;
        if (r.declaracao) parts.push("Declaração de Propósito: " + r.declaracao);
        if (r.verbos) parts.push("Verbos de Ação: " + r.verbos);
        if (r.temas) parts.push("Temas: " + r.temas);
        if (r.notas) parts.push("Notas: " + r.notas);
        if (r.inputs_agentes) parts.push("Inputs para Agentes: " + r.inputs_agentes);
        parts.push("");
      } else {
        parts.push("Output P não disponível.");
        parts.push("");
      }
    } else {
      parts.push("Formulários não disponíveis.");
      parts.push("");
    }

    // ── Pesquisa de Colaboradores (se disponível) ──────────────────────
    if (context.formularios) {
      for (var fc = 0; fc < context.formularios.length; fc++) {
        if (context.formularios[fc].tipo === "pesquisa_colaboradores") {
          parts.push("--- PESQUISA DE COLABORADORES ---");
          var pcRes = context.formularios[fc].respostas;
          if (pcRes) {
            parts.push(JSON.stringify(pcRes));
          }
          parts.push("");
          break;
        }
      }
    }

    // ── Output 1 (Visão Interna) ────────────────────────────────────────
    parts.push("--- RELATÓRIO DE VISÃO INTERNA (Output 1) ---");
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
      parts.push("");
    }

    // ── Output 2 (Visão Externa) ────────────────────────────────────────
    parts.push("--- RELATÓRIO DE VISÃO EXTERNA (Output 2) ---");
    if (context.previousOutputs && context.previousOutputs[2]) {
      var out2 = context.previousOutputs[2];
      if (out2.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out2.resumo_executivo);
        parts.push("");
      }
      if (out2.conteudo) {
        parts.push("[Conteúdo]");
        parts.push(out2.conteudo);
        parts.push("");
      }
      if (out2.conclusoes) {
        parts.push("[Conclusões]");
        parts.push(out2.conclusoes);
        parts.push("");
      }
    } else {
      parts.push("Output 2 não disponível.");
      missing.push("Output 2 (Visão Externa)");
      parts.push("");
    }

    // ── Output 3 (Visão de Mercado) ─────────────────────────────────────
    parts.push("--- RELATÓRIO DE VISÃO DE MERCADO (Output 3) ---");
    if (context.previousOutputs && context.previousOutputs[3]) {
      var out3 = context.previousOutputs[3];
      if (out3.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out3.resumo_executivo);
        parts.push("");
      }
      if (out3.conteudo) {
        parts.push("[Conteúdo]");
        parts.push(out3.conteudo);
        parts.push("");
      }
      if (out3.conclusoes) {
        parts.push("[Conclusões]");
        parts.push(out3.conclusoes);
        parts.push("");
      }
    } else {
      parts.push("Output 3 não disponível.");
      missing.push("Output 3 (Visão de Mercado)");
      parts.push("");
    }

    // ── Dados do Intake (para frameworks que referenciam C1-C4, D3) ─────
    parts.push("--- DADOS DO INTAKE (referência direta) ---");
    if (context.intake) {
      if (context.intake.personalidade_marca) {
        parts.push("C1 (Personalidade como pessoa): " + context.intake.personalidade_marca);
      }
      if (context.intake.palavras_desejadas) {
        parts.push("C2 (3 palavras desejadas): " + context.intake.palavras_desejadas);
      }
      if (context.intake.palavras_reais) {
        parts.push("C3 (3 palavras reais): " + context.intake.palavras_reais);
      }
      if (context.intake.marca_admirada) {
        parts.push("C4 (Marca admirada): " + context.intake.marca_admirada);
        if (context.intake.porque_admira) {
          parts.push("    Por quê: " + context.intake.porque_admira);
        }
      }
      if (context.intake.mudaria_amanha) {
        parts.push("D3 (O que mudaria amanhã): " + context.intake.mudaria_amanha);
      }
    } else {
      parts.push("Intake não disponível.");
    }
    parts.push("");

    // ── Aviso de outputs ausentes ───────────────────────────────────────
    if (missing.length > 0) {
      parts.push("--- AVISO ---");
      parts.push("Outputs ausentes: " + missing.join(", ") + ".");
      parts.push("Reduza a confiança proporcionalmente. 1 ausente = máx. Média. 2+ ausentes = Baixa.");
      parts.push("");
    }

    // ── Instrução final ─────────────────────────────────────────────────
    parts.push("---");
    parts.push("Sintetize os diagnósticos acima e gere o Output 4 (Decodificação de Valores) conforme o formato especificado.");
    parts.push("Cruze obrigatoriamente os Outputs 1, 2 e 3 para classificar cada valor como Acelerador, Impulsionador ou Detrator.");
    parts.push("Use C1 do intake para arquétipo interno e D3 para identificar o Why do Golden Circle.");

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
      fontes: "Synthesis of Outputs 0, 1, 2, 3",
      gaps: ""
    };
  }
};
