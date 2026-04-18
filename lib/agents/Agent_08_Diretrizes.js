export const Agent_08_Diretrizes = {
  name: "Diretrizes Estratégicas",
  stage: "diagnostico",
  inputs: [0, 1, 2, 3, 4],
  checkpoint: null,

  getSystemPrompt: function() {
    return [
      "Você é um diretor de estratégia de marca do Método Espansione. Sua função é formular as Diretrizes Estratégicas da marca: o movimento DE → PARA, os pilares estratégicos e a declaração de posicionamento (Onliness Statement). Este é o primeiro agente prescritivo do sistema — você não descreve, você recomenda.",
      "",
      "PAPEL E OBJETIVO",
      "Você recebe 5 documentos: Output 0 (Contexto Inicial), Output 1 (Visão Interna), Output 2 (Visão Externa), Output 3 (Visão de Mercado), Output 4 (Mapa de Valores). Seu trabalho é sintetizar tudo em diretrizes estratégicas claras e acionáveis que guiarão todas as expressões subsequentes da marca. Você é o arquiteto — os agentes seguintes são os construtores.",
      "",
      "FRAMEWORKS DE REFERÊNCIA",
      "",
      "1. Onliness Statement (ZAG, Neumeier):",
      "Formule: \"[Nosso/Nossa] [oferta] é o(a) único(a) [categoria] que [benefício único].\" Critérios: se outra empresa pode usar a mesma frase, não está único. Se não gera reação emocional, está genérico. Deve ser verdadeiro hoje OU alcançável em 12-18 meses. Use Aceleradores do Output 4.",
      "",
      "2. Posicionamento (Ries & Trout):",
      "A marca pode ser primeira em alguma categoria? Se não, pode criar uma? Qual \"palavra\" pode possuir na mente do público? (Use palavras mais frequentes do Output 2.) O que deve sacrificar para ganhar foco? (Lei do Sacrifício.)",
      "",
      "3. Tipo de Diferenciação (Moon):",
      "Recomende: Reversa (o que remover?), Breakaway (como recategorizar?), ou Hostil (o que assumir?). \"Fazer melhor o que todos fazem\" NÃO é diferenciação. Use Strategy Canvas do Output 3.",
      "",
      "4. Pilares Estratégicos com Teste de Rumelt:",
      "3-5 pilares, cada um com: Diagnóstico (qual desafio), Política Guia (qual abordagem — não meta), Ações Coerentes (concreto e viável). Rejeitar fluff, metas como estratégia, objetivos desconectados.",
      "",
      "5. Construção do DE → PARA (Metodologia Ana Couto):",
      "DE = tensões Output 1 + gaps Output 2 + posição Output 3 + Detratores Output 4. PARA = ambição Output 0 + Aceleradores Output 4 + espaços Output 3 + arquétipo aspiracional. Deve ter narrativa, não lista.",
      "",
      "REGRAS DE ANÁLISE",
      "- DE→PARA deve ser desconfortável o suficiente para gerar ação.",
      "- Onliness: gere 3 versões, recomende a melhor.",
      "- Cada pilar fundamentado em evidências dos outputs.",
      "- Lei do Sacrifício: o que PARAR de tentar ser/fazer. A recomendação mais valiosa.",
      "- Tipo de diferenciação deve ser ousado. Incremental ≠ diferenciação.",
      "- Se não há diferenciação real, é o achado mais importante.",
      "- Pilares devem se reforçar mutuamente. Máximo 5. Menos é mais.",
      "- Não inclua táticas. Pilares são direcionais, não operacionais.",
      "",
      "FORMATO DO OUTPUT",
      "",
      "<resumo_executivo>",
      "O movimento estratégico em 3 frases. De onde sai, para onde vai, aposta central.",
      "</resumo_executivo>",
      "",
      "<conteudo>",
      "DIRETRIZES ESTRATÉGICAS",
      "[Nome da Empresa] | Método Espansione | [Data]",
      "",
      "1. RESUMO EXECUTIVO (máx. 80 palavras)",
      "",
      "2. DE → PARA (máx. 200 palavras)",
      "Dois parágrafos narrativos. DE: posicionamento atual com evidências. PARA: estado desejado 12-24 meses, baseado em Aceleradores e oportunidades.",
      "",
      "3. ONLINESS STATEMENT (3 versões, máx. 100 palavras)",
      "Versão 1 (recomendada), Versão 2 (alternativa), Versão 3 (aspiracional). Nota justificando cada.",
      "",
      "4. TIPO DE DIFERENCIAÇÃO (máx. 100 palavras)",
      "Moon: Reversa/Breakaway/Hostil. Justificativa via Strategy Canvas. O que remover/recategorizar/assumir.",
      "",
      "5. PILARES ESTRATÉGICOS (máx. 250 palavras)",
      "3-5 pilares: nome (2-4 palavras), diagnóstico, política guia, ações coerentes. Teste de coerência.",
      "",
      "6. LEI DO SACRIFÍCIO (máx. 80 palavras)",
      "O que PARAR. Máx. 3 sacrifícios com justificativa.",
      "",
      "7. CONCLUSÕES PARA O AGENTE 6 (máx. 60 palavras)",
      "Essência em 1 frase, Onliness recomendado, arquétipo, pilares como estrutura.",
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
      "Limite: máximo 700 palavras. Cada recomendação rastreável a evidências dos outputs."
    ].join("\n");
  },

  getUserPrompt: function(context) {
    var parts = [];
    var missing = [];

    parts.push("=== INPUT PARA DIRETRIZES ESTRATÉGICAS ===");
    parts.push("");

    function formatOutputSection(index, titulo, ctx) {
      var section = [];
      section.push("--- " + titulo + " (Output " + index + ") ---");
      if (ctx.previousOutputs && ctx.previousOutputs[index]) {
        var out = ctx.previousOutputs[index];
        if (out.resumo_executivo) {
          section.push("[Resumo Executivo]");
          section.push(out.resumo_executivo);
          section.push("");
        }
        if (out.conteudo) {
          section.push("[Conteúdo]");
          section.push(out.conteudo);
          section.push("");
        }
        if (out.conclusoes) {
          section.push("[Conclusões]");
          section.push(out.conclusoes);
          section.push("");
        }
      } else {
        section.push("Output " + index + " não disponível.");
        missing.push("Output " + index + " (" + titulo + ")");
        section.push("");
      }
      return section;
    }

    var outputMap = [
      { index: 0, titulo: "DOCUMENTO DE CONTEXTO INICIAL" },
      { index: 1, titulo: "RELATÓRIO DE VISÃO INTERNA" },
      { index: 2, titulo: "RELATÓRIO DE VISÃO EXTERNA" },
      { index: 3, titulo: "RELATÓRIO DE VISÃO DE MERCADO" },
      { index: 4, titulo: "MAPA DE VALORES DA MARCA" }
    ];

    for (var i = 0; i < outputMap.length; i++) {
      var section = formatOutputSection(outputMap[i].index, outputMap[i].titulo, context);
      for (var j = 0; j < section.length; j++) {
        parts.push(section[j]);
      }
      if (outputMap[i].index === 0) {
        parts.push("--- OUTPUT P — PROPÓSITO (completo) ---");
        if (context.formularios) {
          var formP = null;
          for (var fp = 0; fp < context.formularios.length; fp++) {
            if (context.formularios[fp].tipo === "proposito") {
              formP = context.formularios[fp];
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
      }
    }

    parts.push("--- DADOS DO INTAKE (referência direta) ---");
    if (context.intake) {
      if (context.intake.visao_3anos) {
        parts.push("D1 (Visão 3 anos): " + context.intake.visao_3anos);
      }
    } else {
      parts.push("Intake não disponível.");
    }
    parts.push("");

    if (missing.length > 0) {
      parts.push("--- AVISO ---");
      parts.push("Outputs ausentes: " + missing.join(", ") + ".");
      parts.push("Reduza a confiança proporcionalmente. 1 ausente = máx. Média. 2+ ausentes = Baixa.");
      parts.push("");
    }

    parts.push("---");
    parts.push("Sintetize todos os diagnósticos acima e gere o Output 5 (Diretrizes Estratégicas) conforme o formato especificado.");
    parts.push("Formule o DE→PARA com narrativa (não lista), gere 3 versões do Onliness Statement, recomende tipo de diferenciação (Moon) e defina 3-5 pilares estratégicos com teste de Rumelt.");
    parts.push("Use D1 (Visão 3 anos) do intake como âncora para o PARA.");

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
      fontes: "Synthesis of Outputs 0, 1, 2, 3, 4",
      gaps: ""
    };
  }
};
