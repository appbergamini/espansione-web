export const Agent_02_VisaoExterna = {
  name: "Visão Externa",
  stage: "diagnostico",
  inputs: [0],
  checkpoint: null,

  getSystemPrompt: function() {
    return [
      "Você é um analista sênior de percepção de marca da Espansione (Método Espansione). Sua função é analisar as respostas de stakeholders externos sobre uma marca e gerar um Relatório de Visão Externa que revela como a marca é percebida pelo mercado.",
      "",
      "PAPEL E OBJETIVO",
      "Você recebe dois inputs: o Documento de Contexto Inicial (Output 0) e as respostas consolidadas de stakeholders externos (clientes, ex-clientes, parceiros, fornecedores). Seu trabalho é extrair padrões de percepção, identificar gaps entre como a marca se vê (dados do Output 0) e como o mercado a vê, e mapear oportunidades de posicionamento.",
      "",
      "FRAMEWORKS DE REFERÊNCIA",
      "",
      "1. Five Rings of Buying Insight (Buyer Personas, Adele Revella):",
      "Analise as respostas através das 5 lentes: Iniciativa Prioritária (o que levou o stakeholder a escolher/conhecer a marca), Fatores de Sucesso (o que espera como resultado), Barreiras Percebidas (o que gera hesitação ou frustração), Jornada de Decisão (como chegou até a marca), Critérios de Escolha (o que pesou na decisão).",
      "",
      "2. Mental Availability e Physical Availability (How Brands Grow, Byron Sharp):",
      "Avalie: Mental Availability (quão facilmente a marca vem à mente na categoria — B1 é indicador direto; palavras genéricas = fraca, palavras específicas = forte). Physical Availability (quão fácil é acessar/encontrar — C3 é proxy). Identifique Distinctive Brand Assets.",
      "",
      "3. Posicionamento Perceptual (Positioning, Ries & Trout):",
      "Avalie posicionamento real: posição mental (B1 + B4), categoria mental (C1), concorrente perceptual (C2 — revela contra quem realmente compete).",
      "",
      "4. Filtro de Viés — Respostas Socialmente Desejáveis:",
      "Sinais de resposta genuína: especificidade, emoção, contradição interna. Sinais de resposta polida: generalidade, brevidade extrema, incoerência com NPS. Respostas polidas = peso menor. Respostas específicas = peso maior.",
      "",
      "5. Diferencial Semântico — Análise Quantitativa:",
      "Para a Seção E (escala 1-7): calcule média e desvio padrão de cada par. Acima de 5 = força. Abaixo de 3 = fraqueza. Alto desvio = percepção fragmentada.",
      "",
      "REGRAS DE ANÁLISE",
      "- O GAP ANALYSIS é o coração. Cruze percepção externa com Output 0. Divergência = insight.",
      "- C2 (quem procuraria no lugar) revela competitive set real.",
      "- D2 (momento marcante) revela brand moments reais. Categorize em positivos e negativos.",
      "- D3 (o que nunca disse) produz insights mais honestos. Peso alto.",
      "- Compare palavras externas (B1) com palavras desejadas pelo fundador (C2 do intake) e palavras que ele acha que usam (C3 do intake). Triângulo de percepção.",
      "- Menos de 5 respostas = amostra insuficiente, sinalizar.",
      "- Agrupe por tipo se houver diferenças. Ex-clientes geralmente mais honestos.",
      "- NPS: 0-6 = detrator, 7-8 = passivo, 9-10 = promotor. Calcule NPS geral.",
      "- Não faça recomendações. Diagnostique.",
      "",
      "FORMATO DO OUTPUT",
      "",
      "<resumo_executivo>",
      "Os 3 insights mais críticos da visão externa. Priorize gaps sobre confirmações.",
      "</resumo_executivo>",
      "",
      "<conteudo>",
      "RELATÓRIO DE VISÃO EXTERNA",
      "[Nome da Empresa] | Método Espansione | [Data]",
      "[N] respondentes | [tipos de respondentes]",
      "",
      "1. RESUMO EXECUTIVO (máx. 80 palavras)",
      "",
      "2. TRIÂNGULO DE PERCEPÇÃO (máx. 150 palavras)",
      "3 perspectivas: o que quer ser (C2 intake), o que acha que é (C3 intake), o que o mercado vê (B1). Sobreposições, gaps, surpresas.",
      "",
      "3. MAPA DE PERCEPÇÃO EXTERNA (máx. 200 palavras)",
      "4 categorias: Forças Reconhecidas (50%+), Fraquezas Percebidas (30%+), Oportunidades Não Exploradas, Ameaças de Percepção.",
      "",
      "4. PERFIL DE ATRIBUTOS — DIFERENCIAL SEMÂNTICO (máx. 150 palavras)",
      "Média e interpretação de cada par. Zona de força (>5), neutra (3-5), fraqueza (<3).",
      "",
      "5. COMPETITIVE SET REAL (máx. 100 palavras)",
      "Baseado em C2. Concorrentes perceptuais vs declarados.",
      "",
      "6. BRAND MOMENTS (máx. 120 palavras)",
      "Baseado em D2. Momentos positivos e negativos. Padrões.",
      "",
      "7. NPS E VERBATIMS (máx. 100 palavras)",
      "NPS calculado. Verbatims por faixa (parafraseados, max 10 palavras cada).",
      "",
      "8. PERCEPÇÃO EXTERNA DA MARCA EMPREGADORA (máx. 80 palavras) [NOVO]",
      "Média da nota F1, distribuição F2 (recomendaria?), e verbatims F3. Como o mercado externo percebe a empresa como lugar para trabalhar. Cruzar com auto-avaliação do fundador (radar do Output 0) e com percepção dos colaboradores (quando disponível). Se poucas respostas, sinalizar como indicativo.",
      "",
      "9. GAPS PARA INVESTIGAÇÃO (3-5 itens)",
      "Formato: [Gap]: [O que a marca acredita] vs [O que o mercado percebe]. [Impacto].",
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
      "Limite total: máximo 880 palavras. As perguntas F1-F3 são opcionais e podem ter poucas respostas. Quando disponíveis, incluir como indicadores de percepção da marca empregadora. Não tirar conclusões fortes com menos de 3 respostas — sinalizar como indicativo."
    ].join("\n");
  },

  getUserPrompt: function(context) {
    var parts = [];
    parts.push("=== INPUT PARA ANÁLISE ===\n");

    // ── Output 0 (Documento de Contexto Inicial) ──────────────────────
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
      parts.push("");
    }

    // ── Dados do Intake (Triângulo de Percepção) ──────────────────────
    parts.push("--- DADOS DO INTAKE (para Triângulo de Percepção) ---");
    if (context.intake) {
      if (context.intake.palavras_desejadas) {
        parts.push("C2 — Palavras desejadas (como quer ser vista): " + context.intake.palavras_desejadas);
      }
      if (context.intake.palavras_reais) {
        parts.push("C3 — Palavras reais (como acha que é vista): " + context.intake.palavras_reais);
      }
      parts.push("");
    } else {
      parts.push("Dados de intake não disponíveis.");
      parts.push("");
    }

    var externForms = [];
    if (context.formularios && context.formularios.length > 0) {
      for (var f = 0; f < context.formularios.length; f++) {
        externForms.push(context.formularios[f]);
      }
    }

    if (externForms.length === 0) {
      parts.push("--- RESPOSTAS EXTERNAS ---");
      parts.push("Nenhuma resposta de stakeholders externos disponível.");
      parts.push("Sinalize confiança BAIXA — análise impossível sem dados externos.");
      parts.push("");
      return parts.join("\n");
    }

    var totalRespondentes = externForms.length;
    var npsScores = [];
    var wordFreq = {};
    var semanticSums = { E1: [], E2: [], E3: [], E4: [], E5: [], E6: [], E7: [] };
    var tipoCount = {};

    for (var i = 0; i < externForms.length; i++) {
      var r = externForms[i].respostas || {};

      var tipo = r.A1 || r.relacao || "Não informado";
      tipoCount[tipo] = (tipoCount[tipo] || 0) + 1;

      var npsVal = parseFloat(r.D1 || r.nps || "");
      if (!isNaN(npsVal)) npsScores.push(npsVal);

      var palavras = r.B1 || r.tres_palavras || "";
      if (palavras) {
        var words = palavras.split(/[,;\s]+/);
        for (var w = 0; w < words.length; w++) {
          var word = words[w].trim().toLowerCase();
          if (word.length > 2) wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      }

      var eKeys = ["E1", "E2", "E3", "E4", "E5", "E6", "E7"];
      for (var e = 0; e < eKeys.length; e++) {
        var eVal = parseFloat(r[eKeys[e]] || "");
        if (!isNaN(eVal)) semanticSums[eKeys[e]].push(eVal);
      }
    }

    var promoters = 0, passives = 0, detractors = 0;
    for (var n = 0; n < npsScores.length; n++) {
      if (npsScores[n] >= 9) promoters++;
      else if (npsScores[n] >= 7) passives++;
      else detractors++;
    }
    var npsTotal = npsScores.length;
    var npsScore = npsTotal > 0
      ? Math.round((promoters / npsTotal - detractors / npsTotal) * 100)
      : null;

    var wordList = Object.keys(wordFreq);
    wordList.sort(function(a, b) { return wordFreq[b] - wordFreq[a]; });

    var semanticStats = {};
    var eKeysList = ["E1", "E2", "E3", "E4", "E5", "E6", "E7"];
    for (var s = 0; s < eKeysList.length; s++) {
      var key = eKeysList[s];
      var vals = semanticSums[key];
      if (vals.length > 0) {
        var sum = 0;
        for (var v = 0; v < vals.length; v++) sum += vals[v];
        var mean = sum / vals.length;
        var sqDiffSum = 0;
        for (var v2 = 0; v2 < vals.length; v2++) {
          sqDiffSum += (vals[v2] - mean) * (vals[v2] - mean);
        }
        var stdDev = Math.sqrt(sqDiffSum / vals.length);
        semanticStats[key] = { media: mean.toFixed(2), desvio: stdDev.toFixed(2), n: vals.length };
      }
    }

    var tipoKeys = Object.keys(tipoCount);
    var tipoDistParts = [];
    for (var t = 0; t < tipoKeys.length; t++) {
      tipoDistParts.push(tipoKeys[t] + ": " + tipoCount[tipoKeys[t]]);
    }

    parts.push("--- DADOS PRÉ-PROCESSADOS ---");
    parts.push("Total de respondentes: " + totalRespondentes);
    if (totalRespondentes < 5) parts.push("⚠ AMOSTRA INSUFICIENTE (menos de 5 respostas)");
    parts.push("Distribuição por tipo: " + tipoDistParts.join(" | "));
    parts.push("");

    parts.push("NPS:");
    if (npsTotal > 0) {
      parts.push("  Promotores (9-10): " + promoters + " (" + Math.round(promoters / npsTotal * 100) + "%)");
      parts.push("  Passivos (7-8): " + passives + " (" + Math.round(passives / npsTotal * 100) + "%)");
      parts.push("  Detratores (0-6): " + detractors + " (" + Math.round(detractors / npsTotal * 100) + "%)");
      parts.push("  NPS Score: " + npsScore);
    } else {
      parts.push("  Sem dados de NPS disponíveis.");
    }
    parts.push("");

    parts.push("Frequência de palavras (B1 — 3 palavras):");
    var topWords = wordList.slice(0, 15);
    for (var tw = 0; tw < topWords.length; tw++) {
      parts.push("  " + topWords[tw] + ": " + wordFreq[topWords[tw]] + "x");
    }
    parts.push("");

    parts.push("Diferencial Semântico (E1-E7) — Médias e Desvio Padrão:");
    for (var sd = 0; sd < eKeysList.length; sd++) {
      var sk = eKeysList[sd];
      if (semanticStats[sk]) {
        var zona = parseFloat(semanticStats[sk].media) > 5 ? "FORÇA" :
                   parseFloat(semanticStats[sk].media) < 3 ? "FRAQUEZA" : "NEUTRA";
        parts.push("  " + sk + ": média=" + semanticStats[sk].media +
                   " | desvio=" + semanticStats[sk].desvio +
                   " | n=" + semanticStats[sk].n +
                   " | zona: " + zona);
      }
    }
    parts.push("");

    parts.push("--- RESPOSTAS INDIVIDUAIS ---");
    for (var ri = 0; ri < externForms.length; ri++) {
      var form = externForms[ri];
      var resp = form.respostas || {};
      var num = ri + 1;

      var relacao = resp.A1 || resp.relacao || "Não informado";
      var tempo = resp.A2 || resp.tempo || "Não informado";

      parts.push("RESPONDENTE " + num + " | Relação: " + relacao + " | Tempo: " + tempo);

      if (resp.B1 || resp.tres_palavras) parts.push("B1 (3 palavras): " + (resp.B1 || resp.tres_palavras));
      if (resp.B2) parts.push("B2 (faz de melhor): " + resp.B2);
      if (resp.B3) parts.push("B3 (precisa melhorar): " + resp.B3);
      if (resp.B4) parts.push("B4 (diferente dos outros): " + resp.B4);

      if (resp.C1) parts.push("C1 (categoria mental): " + resp.C1);
      if (resp.C2) parts.push("C2 (quem procuraria no lugar): " + resp.C2);
      if (resp.C3) parts.push("C3 (facilidade de acesso): " + resp.C3);

      if (resp.D1 || resp.nps) parts.push("D1 (NPS): " + (resp.D1 || resp.nps));
      if (resp.D2) parts.push("D2 (momento marcante): " + resp.D2);
      if (resp.D3) parts.push("D3 (o que nunca disse): " + resp.D3);

      var eVals = [];
      for (var ei = 0; ei < eKeysList.length; ei++) {
        if (resp[eKeysList[ei]]) eVals.push(eKeysList[ei] + "=" + resp[eKeysList[ei]]);
      }
      if (eVals.length > 0) parts.push("E1-E7 (atributos): " + eVals.join(" | "));
      parts.push("");
    }

    parts.push("---");
    parts.push("Analise os dados acima e gere o Output 2 (Visão Externa) conforme o formato especificado.");
    parts.push("Cruze obrigatoriamente as palavras externas (B1) com as palavras desejadas (C2 intake) e palavras reais (C3 intake) para montar o Triângulo de Percepção.");

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
      fontes: "Extracted Insights from External Answers",
      gaps: ""
    };
  }
};
