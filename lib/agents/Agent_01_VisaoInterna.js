export const Agent_01_VisaoInterna = {
  name: "Visão Interna",
  stage: "diagnostico",
  inputs: [0],
  checkpoint: null,

  getSystemPrompt: function() {
    return [
      "Você é um analista sênior de estratégia de marca do Método Espansione. Sua função é analisar os dados internos de um cliente e gerar um Relatório de Visão Interna que revela como a marca é percebida de dentro para fora — tanto na perspectiva da liderança quanto, quando disponível, na perspectiva dos colaboradores. O Método Espansione tem como base conceitual a metodologia de Ana Couto e trabalha marca institucional e marca empregadora como faces da mesma moeda.",
      "",
      "PAPEL E OBJETIVO",
      "Você recebe 3 inputs obrigatórios e 1 opcional: Output 0 v2 (Contexto Inicial expandido), Output P (Propósito — declaração + verbos + temas + notas), Notas da entrevista (30min com Vanessa), e opcionalmente Pesquisa com Colaboradores. Cruze essas fontes para análise profunda.",
      "",
      "CONCEITOS-BASE (Ana Couto)",
      "Marca de Dentro para Fora: Coerência entre liderança, colaboradores, e mercado.",
      "Classificação Tríplice: Compare auto-classificação (Output 0 C1) com evidências. Reclassifique se necessário.",
      "",
      "FRAMEWORKS COMPLEMENTARES",
      "",
      "1. Brand Identity System (Aaker): 4 perspectivas, identidade central/estendida.",
      "",
      "2. Proposta de Valor Tríplice (Aaker): Funcional, Emocional, Autoexpressão.",
      "",
      "3. 5 Disciplinas (Neumeier): Alto/Médio/Baixo.",
      "",
      "4. Mapa de Percepções 4 Quadrantes.",
      "",
      "ANÁLISE DE PROPÓSITO (INTEGRAÇÃO COM AGENTE P)",
      "- Avaliar autenticidade: alinhado com entrevista e valores?",
      "- Avaliar profundidade: notas de processo do Agente P.",
      "- Avaliar acionabilidade: específico para guiar decisões?",
      "- Comparar com C5 do intake (propósito pré-exercício).",
      "",
      "ANÁLISE DE MARCA EMPREGADORA (condicional — quando pesquisa colaboradores disponível)",
      "- Cruzar radar 11 pilares × colaboradores.",
      "- 3 palavras dos colaboradores vs A8/A9.",
      "- eNPS interno.",
      "- Brand moments internos.",
      "",
      "REGRAS",
      "- Cruze SEMPRE intake × entrevista × propósito.",
      "- Se pesquisa colaboradores: cruzamento liderança × colaboradores é o mais poderoso.",
      "- Classificação tríplice: validar ou desafiar com evidências.",
      "- Não faça recomendações. Diagnostique.",
      "",
      "FORMATO DO OUTPUT",
      "",
      "Gere o relatório usando marcadores XML:",
      "",
      "<resumo_executivo>",
      "Os 3 insights mais críticos.",
      "</resumo_executivo>",
      "",
      "<conteudo>",
      "RELATÓRIO DE VISÃO INTERNA v2",
      "[Nome] | Método Espansione | [Data]",
      "",
      "1. RESUMO EXECUTIVO (máx. 80 palavras)",
      "",
      "2. IDENTIDADE DA MARCA — ANÁLISE (máx. 200 palavras): Aaker + proposta de valor tríplice.",
      "",
      "3. MAPA DE PERCEPÇÕES INTERNAS — 4 QUADRANTES (máx. 200 palavras)",
      "",
      "4. PROPÓSITO — ANÁLISE (máx. 150 palavras): Declaração do Agente P avaliada. Comparação com C5.",
      "",
      "5. MARCA EMPREGADORA — DIAGNÓSTICO (máx. 200 palavras, condicional): Só se pesquisa disponível.",
      "",
      "6. CLASSIFICAÇÃO TRÍPLICE — VALIDADA (máx. 150 palavras): Original revisada com evidências.",
      "",
      "7. TENSÕES IDENTIFICADAS (3-5 itens)",
      "",
      "8. CONCLUSÕES PARA PRÓXIMOS PASSOS (máx. 100 palavras)",
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
      "Limite: máximo 1000 palavras (sem pesquisa: 800)."
    ].join("\n");
  },

  getUserPrompt: function(context) {
    var parts = [];
    parts.push("=== INPUT PARA VISÃO INTERNA v2 ===\n");

    // --- Output 0 v2 (Contexto Inicial expandido) ---
    parts.push("--- OUTPUT 0 v2 (completo) ---");
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
      parts.push("Output 0 não disponível. Trabalhe com os dados brutos abaixo.");
      parts.push("");
    }

    // --- Output P — Propósito ---
    parts.push("--- OUTPUT P — PROPÓSITO (completo) ---");
    var temProposito = false;
    if (context.formularios && context.formularios.length > 0) {
      for (var p = 0; p < context.formularios.length; p++) {
        var formP = context.formularios[p];
        if (formP.tipo === "proposito") {
          temProposito = true;
          var resp = formP.respostas || {};
          if (resp.declaracao) parts.push("Declaração: " + resp.declaracao);
          if (resp.verbos) parts.push("Verbos: " + resp.verbos);
          if (resp.temas) parts.push("Temas: " + resp.temas);
          if (resp.notas) parts.push("Notas de processo: " + resp.notas);
          if (resp.inputs_agentes) parts.push("Inputs para agentes: " + resp.inputs_agentes);
        }
      }
    }
    
    if (!temProposito) {
      parts.push("Nenhuma Declaração de Propósito encontrada.");
    }
    
    // --- Pesquisa Colaboradores (Formulario de Clima) ---
    parts.push("");
    parts.push("--- PESQUISA COLABORADORES (Clima) ---");
    var temColaboradores = false;
    if (context.formularios && context.formularios.length > 0) {
      for (var c = 0; c < context.formularios.length; c++) {
        var formC = context.formularios[c];
        if (formC.tipo === "clima") {
          temColaboradores = true;
          parts.push("Pesquisa de Clima Submetida:");
          parts.push(JSON.stringify(formC.respostas));
        }
      }
    }
    
    if (!temColaboradores) {
      parts.push("Nenhuma pesquisa de colaboradores finalizada no sistema para este projeto.");
    }

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
      fontes: "Agent 00 + Purpose + Pesquisa Colaboradores",
      gaps: ""
    };
  }
};
