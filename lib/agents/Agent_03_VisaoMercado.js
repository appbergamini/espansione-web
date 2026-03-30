export const Agent_03_VisaoMercado = {
  name: "Visão de Mercado",
  stage: "diagnostico",
  inputs: [0],
  checkpoint: 1,

  getSystemPrompt: function() {
    return [
      "Você é um analista de inteligência de mercado e posicionamento competitivo do Método Espansione.",
      "Sua função é analisar o cenário competitivo e identificar onde a marca está posicionada em relação ao mercado.",
      "O Método Espansione tem como base conceitual a metodologia de Ana Couto — especificamente as Ondas do Branding",
      "e os critérios de marca icônica — complementada por frameworks globais de estratégia competitiva.",
      "",
      "PAPEL E OBJETIVO",
      "Você recebe: o Documento de Contexto Inicial (Output 0 v2), a lista de concorrentes perceptuais identificados",
      "pelos stakeholders (competitive set do Output 2), fichas de pesquisa competitiva de 3-5 concorrentes com",
      "critérios icônicos + classificação de onda + fatores competitivos, e dados setoriais/tendências quando disponíveis.",
      "Seu trabalho é mapear o cenário competitivo através das lentes Ana Couto, identificar padrões de posicionamento,",
      "e revelar espaços de oportunidade para a marca.",
      "",
      "CONCEITOS-BASE (Ana Couto)",
      "",
      "1. Ondas do Branding (Funcional → Emocional → Significado):",
      "Classifique cada player na onda predominante. A maioria dos mercados concentra players na onda Funcional.",
      "Oportunidade estratégica = elevar a marca para a próxima onda. A onda é o achado mais estratégico desta análise.",
      "",
      "2. Critérios de Marca Icônica (Relevante, Diferenciada, Proprietária, Consistente):",
      "Cada critério avaliado de 1 a 5 nas fichas de pesquisa. Interprete além dos scores numéricos —",
      "analise padrões: marcas podem ser relevantes mas não proprietárias (genéricas), diferenciadas mas",
      "inconsistentes (fragmentadas). O gap entre critérios revela a natureza do problema de posicionamento.",
      "",
      "3. Análise de Player (Roteiro VM):",
      "Para cada concorrente analisado nas fichas, considere: ofertas e entregas (o que vendem),",
      "territórios de comunicação (como se posicionam), argumentos de conexão (por que o cliente escolhe),",
      "códigos da categoria (elementos visuais/verbais que todos compartilham).",
      "",
      "FRAMEWORKS COMPLEMENTARES",
      "",
      "1. Strategy Canvas (Blue Ocean Strategy, Kim & Mauborgne):",
      "Construa um Strategy Canvas comparativo usando os 7 fatores competitivos das fichas de pesquisa.",
      "O Strategy Canvas revela: fatores de paridade (zona vermelha), forças e fraquezas relativas,",
      "possível oceano azul (fator que todos ignoram).",
      "",
      "2. Competitive Alternatives e Unique Attributes (Obviously Awesome, April Dunford):",
      "Para cada concorrente: Alternativa Competitiva, Atributos Únicos, Valor Derivado.",
      "",
      "3. Where to Play / How to Win (Playing to Win, Lafley & Martin):",
      "Analise cada concorrente: Where to Play (mercado, segmento, geografia, canal),",
      "How to Win (vantagem competitiva). Onde há sobreposição? Onde há espaço livre?",
      "",
      "4. Mapa de Posicionamento Perceptual 2x2:",
      "Construa usando os dois eixos mais relevantes. Posicione cada player. Identifique quadrantes vazios.",
      "",
      "REGRAS DE ANÁLISE",
      "- As Ondas do Branding são o achado mais estratégico. Sempre comece pelo mapa de ondas.",
      "- Os 4 critérios de marca icônica devem ser analisados com rigor — padrões entre critérios importam mais que scores isolados.",
      "- Compare SEMPRE competitive set declarado (Output 0) vs perceptual (Output 2). Divergência = achado crítico.",
      "- Identifique códigos da categoria — elementos que todos compartilham e que a marca precisa conhecer para decidir se segue ou quebra.",
      "- Quando vários concorrentes têm posicionamento similar na mesma onda, isso é categoria comoditizada — maior oportunidade.",
      "- Não avalie concorrentes como bons/ruins. Avalie posição e estratégia.",
      "- Menos de 3 concorrentes pesquisados = análise limitada, sinalizar.",
      "- Não faça recomendações. Mapeie o cenário.",
      "",
      "FORMATO DO OUTPUT",
      "",
      "<resumo_executivo>",
      "Os 3 achados mais estratégicos do cenário competitivo. Priorize: onda predominante do mercado,",
      "gaps nos critérios icônicos, espaços de oportunidade.",
      "</resumo_executivo>",
      "",
      "<conteudo>",
      "RELATÓRIO DE VISÃO DE MERCADO",
      "[Nome da Empresa] | Método Espansione | [Data]",
      "[N] concorrentes analisados",
      "",
      "1. RESUMO EXECUTIVO (máx. 80 palavras)",
      "",
      "2. MAPA DE ONDAS (máx. 100 palavras)",
      "Classifique cada player (cliente + concorrentes) na onda predominante: Funcional, Emocional ou Significado.",
      "Identifique a concentração do mercado. Onde está a oportunidade de elevação?",
      "",
      "3. CRITÉRIOS DE MARCA ICÔNICA — COMPARATIVO (máx. 150 palavras)",
      "Tabela comparativa dos 4 critérios (Relevante, Diferenciada, Proprietária, Consistente) × players com notas 1-5.",
      "Análise de padrões: quais critérios são fortes/fracos no mercado como um todo? Gaps entre critérios que revelam problemas estruturais.",
      "",
      "4. STRATEGY CANVAS (tabela + análise, máx. 150 palavras)",
      "Tabela 7 fatores competitivos × players com notas 1-5. Análise: fatores de paridade, força relativa,",
      "fraqueza relativa, fatores ignorados (oceano azul).",
      "",
      "5. ANÁLISE DOS CONCORRENTES (máx. 250 palavras)",
      "Para cada: onda, critérios icônicos (síntese), posicionamento (Where/How), atributos únicos (Dunford),",
      "territórios de comunicação, argumentos de conexão, força principal, vulnerabilidade.",
      "",
      "6. COMPETITIVE SET: DECLARADO VS. REAL (máx. 80 palavras)",
      "",
      "7. ESPAÇOS DE OPORTUNIDADE (máx. 120 palavras)",
      "2-3 espaços diferenciados. Para cada: o que é, por que está vazio, relação com ondas/critérios, risco.",
      "",
      "8. CÓDIGOS DA CATEGORIA (máx. 80 palavras)",
      "Elementos visuais, verbais e comportamentais que todos os players compartilham.",
      "Códigos que a marca deve conhecer para decidir se segue ou quebra.",
      "",
      "9. TENDÊNCIAS E BENCHMARKS (máx. 100 palavras, se dados disponíveis)",
      "Tendências setoriais que impactam posicionamento. Benchmarks aspiracionais de outros segmentos.",
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
      "Limite total: máximo 900 palavras. Cada afirmação sobre concorrentes deve citar fonte. Nenhuma especulação sem evidência."
    ].join("\n");
  },

  getUserPrompt: function(context) {
    var parts = [];
    parts.push("=== INPUT PARA ANÁLISE DE MERCADO ===\n");

    // ── Output 0 v2 (Documento de Contexto Inicial) ───────────────────
    parts.push("--- DOCUMENTO DE CONTEXTO INICIAL (Output 0 v2) ---");
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

    // ── Competitive Set Perceptual (do Output 2) ──────────────────────
    parts.push("--- COMPETITIVE SET PERCEPTUAL (Output 2) ---");
    if (context.previousOutputs && context.previousOutputs[2]) {
      var out2 = context.previousOutputs[2];
      var out2Text = out2.conteudo || "";
      if (out2Text) {
        parts.push("[Dados de concorrentes perceptuais extraídos da Visão Externa]");
        parts.push(out2Text);
        parts.push("");
      }
      if (out2.conclusoes) {
        parts.push("[Conclusões da Visão Externa]");
        parts.push(out2.conclusoes);
        parts.push("");
      }
    } else {
      parts.push("Output 2 (Visão Externa) não disponível.");
      parts.push("Competitive set perceptual não pode ser comparado. Use apenas o competitive set declarado (Output 0).");
      parts.push("");
    }

    // ── Pesquisa Competitiva (formulários tipo pesquisa_competitiva) ──
    var pesquisaForms = [];
    var dadosMercado = [];
    var autoavaliacao = null;

    if (context.formularios && context.formularios.length > 0) {
      for (var f = 0; f < context.formularios.length; f++) {
        var form = context.formularios[f];
        var tipo = (form.tipo || form.type || "").toLowerCase();
        if (tipo === "pesquisa_competitiva") {
          pesquisaForms.push(form);
        } else if (tipo === "dados_mercado") {
          dadosMercado.push(form);
        } else if (tipo === "autoavaliacao") {
          autoavaliacao = form;
        }
      }
    }

    // ── Fichas de Pesquisa Competitiva ─────────────────────────────────
    parts.push("--- FICHAS DE PESQUISA COMPETITIVA ---");
    if (pesquisaForms.length > 0) {
      parts.push("Total de concorrentes pesquisados: " + pesquisaForms.length);
      if (pesquisaForms.length < 3) {
        parts.push("⚠ ANÁLISE LIMITADA: menos de 3 concorrentes pesquisados.");
      }
      parts.push("");

      // ── Camada A: Critérios de Marca Icônica ──────────────────────
      var criteriosIconicos = [
        "relevante",
        "diferenciada",
        "proprietaria",
        "consistente"
      ];
      var criteriosLabels = [
        "Relevante",
        "Diferenciada",
        "Proprietária",
        "Consistente"
      ];

      // ── Camada B: Onda do Branding ────────────────────────────────
      // Fields: onda_predominante, evidencia_onda

      // ── Camada C: 7 Fatores Competitivos ──────────────────────────
      var fatores = [
        "clareza_posicionamento",
        "qualidade_visual",
        "consistencia_comunicacao",
        "presenca_digital",
        "diferenciacao",
        "profundidade_proposta_valor",
        "percepcao_preco_valor"
      ];
      var fatoresLabels = [
        "Clareza de Posicionamento",
        "Qualidade Visual",
        "Consistência de Comunicação",
        "Presença Digital",
        "Diferenciação",
        "Profundidade de Proposta de Valor",
        "Percepção de Preço/Valor"
      ];

      var playerNames = [];
      var playerCriterios = [];  // array de arrays [4 critérios icônicos]
      var playerOndas = [];      // array de strings (onda_predominante)
      var playerScores = [];     // array de arrays [7 fatores]
      for (var p = 0; p < pesquisaForms.length; p++) {
        var pResp = pesquisaForms[p].respostas || {};
        var nome = pResp.nome || pResp.nome_concorrente || ("Concorrente " + (p + 1));
        playerNames.push(nome);

        var crit = [];
        for (var ci2 = 0; ci2 < criteriosIconicos.length; ci2++) {
          var cVal2 = parseFloat(pResp[criteriosIconicos[ci2]] || "");
          crit.push(isNaN(cVal2) ? "-" : cVal2);
        }
        playerCriterios.push(crit);

        playerOndas.push(pResp.onda_predominante || "-");

        var scores = [];
        for (var fi = 0; fi < fatores.length; fi++) {
          var val = parseFloat(pResp[fatores[fi]] || "");
          scores.push(isNaN(val) ? "-" : val);
        }
        playerScores.push(scores);
      }

      if (autoavaliacao) {
        var aResp = autoavaliacao.respostas || {};
        var clienteName = aResp.nome || (context.intake && context.intake.nome_empresa) || "Cliente";
        playerNames.unshift(clienteName + " (auto)");

        var clienteCrit = [];
        for (var cc = 0; cc < criteriosIconicos.length; cc++) {
          var ccVal = parseFloat(aResp[criteriosIconicos[cc]] || "");
          clienteCrit.push(isNaN(ccVal) ? "-" : ccVal);
        }
        playerCriterios.unshift(clienteCrit);

        playerOndas.unshift(aResp.onda_predominante || "-");

        var clienteScores = [];
        for (var ca = 0; ca < fatores.length; ca++) {
          var cVal = parseFloat(aResp[fatores[ca]] || "");
          clienteScores.push(isNaN(cVal) ? "-" : cVal);
        }
        playerScores.unshift(clienteScores);
      }

      parts.push("TABELA COMPARATIVA CONSOLIDADA:");
      parts.push("");

      parts.push(">> ONDA + CRITÉRIOS DE MARCA ICÔNICA (1-5):");
      var headerCrit = "Player | Onda";
      for (var hc = 0; hc < criteriosLabels.length; hc++) {
        headerCrit += " | " + criteriosLabels[hc];
      }
      parts.push(headerCrit);
      parts.push(new Array(headerCrit.length + 1).join("-"));

      for (var rowC = 0; rowC < playerNames.length; rowC++) {
        var lineC = playerNames[rowC] + " | " + playerOndas[rowC];
        for (var colC = 0; colC < playerCriterios[rowC].length; colC++) {
          lineC += " | " + playerCriterios[rowC][colC];
        }
        parts.push(lineC);
      }
      parts.push("");

      parts.push(">> FATORES COMPETITIVOS (1-5):");
      var headerFat = "Fator";
      for (var h = 0; h < playerNames.length; h++) {
        headerFat += " | " + playerNames[h];
      }
      parts.push(headerFat);
      parts.push(new Array(headerFat.length + 1).join("-"));

      for (var row = 0; row < fatoresLabels.length; row++) {
        var line = fatoresLabels[row];
        for (var col = 0; col < playerScores.length; col++) {
          line += " | " + playerScores[col][row];
        }
        parts.push(line);
      }
      parts.push("");

      for (var ci = 0; ci < pesquisaForms.length; ci++) {
        var cForm = pesquisaForms[ci];
        var cResp = cForm.respostas || {};
        var cNome = cResp.nome || cResp.nome_concorrente || ("Concorrente " + (ci + 1));

        parts.push("CONCORRENTE " + (ci + 1) + ": " + cNome);
        if (cResp.site) parts.push("  Site: " + cResp.site);
        if (cResp.segmento) parts.push("  Segmento: " + cResp.segmento);
        if (cResp.proposta_valor) parts.push("  Proposta de valor: " + cResp.proposta_valor);
        if (cResp.tom_comunicacao) parts.push("  Tom de comunicação: " + cResp.tom_comunicacao);
        if (cResp.publico_alvo) parts.push("  Público-alvo: " + cResp.publico_alvo);
        if (cResp.diferenciais) parts.push("  Diferenciais: " + cResp.diferenciais);
        if (cResp.vulnerabilidades) parts.push("  Vulnerabilidades: " + cResp.vulnerabilidades);
        if (cResp.canais) parts.push("  Canais: " + cResp.canais);
        if (cResp.observacoes) parts.push("  Observações: " + cResp.observacoes);

        var critScores = [];
        for (var cs = 0; cs < criteriosIconicos.length; cs++) {
          var csVal = cResp[criteriosIconicos[cs]];
          if (csVal) {
            critScores.push(criteriosLabels[cs] + "=" + csVal);
          }
        }
        if (critScores.length > 0) parts.push("  Critérios Icônicos: " + critScores.join(" | "));

        if (cResp.onda_predominante) parts.push("  Onda Predominante: " + cResp.onda_predominante);
        if (cResp.evidencia_onda) parts.push("  Evidência da Onda: " + cResp.evidencia_onda);

        var fScores = [];
        for (var fs = 0; fs < fatores.length; fs++) {
          var fVal = cResp[fatores[fs]];
          if (fVal) fScores.push(fatoresLabels[fs] + "=" + fVal);
        }
        if (fScores.length > 0) parts.push("  Fatores Competitivos: " + fScores.join(" | "));
        parts.push("");
      }
    } else {
      parts.push("Nenhuma ficha de pesquisa competitiva disponível.");
      parts.push("Trabalhe com os dados do Output 0 (competitive set declarado) e Output 2 (competitive set perceptual).");
      parts.push("Sinalize confiança BAIXA para o Strategy Canvas sem dados primários de pesquisa.");
      parts.push("");
    }

    if (autoavaliacao) {
      parts.push("--- AUTOAVALIAÇÃO DO CLIENTE ---");
      var aKeys = Object.keys(autoavaliacao.respostas || {});
      for (var ak = 0; ak < aKeys.length; ak++) {
        if (autoavaliacao.respostas[aKeys[ak]]) {
          parts.push(aKeys[ak] + ": " + autoavaliacao.respostas[aKeys[ak]]);
        }
      }
      parts.push("");
    }

    if (dadosMercado.length > 0) {
      parts.push("--- DADOS DE MERCADO E TENDÊNCIAS ---");
      for (var dm = 0; dm < dadosMercado.length; dm++) {
        var dmResp = dadosMercado[dm].respostas || {};
        var dmKeys = Object.keys(dmResp);
        for (var dk = 0; dk < dmKeys.length; dk++) {
          if (dmResp[dmKeys[dk]]) {
            parts.push(dmKeys[dk] + ": " + dmResp[dmKeys[dk]]);
          }
        }
        parts.push("");
      }
    }

    parts.push("--- BENCHMARK ASPIRACIONAL (do intake) ---");
    if (context.intake && context.intake.marca_admirada) {
      parts.push("Marca admirada pelo fundador (C4): " + context.intake.marca_admirada);
      if (context.intake.porque_admira) {
        parts.push("Por quê: " + context.intake.porque_admira);
      }
    } else {
      parts.push("Marca admirada não informada no intake.");
    }
    parts.push("");

    parts.push("---");
    parts.push("Analise os dados acima e gere o Output 3 (Visão de Mercado) conforme o formato especificado.");
    parts.push("Comece pelo Mapa de Ondas — é o achado mais estratégico.");
    parts.push("Analise os 4 critérios de marca icônica em conjunto — padrões entre critérios importam mais que scores isolados.");
    parts.push("Compare obrigatoriamente o competitive set declarado (Output 0) com o perceptual (Output 2).");
    parts.push("Construa o Strategy Canvas com os 7 fatores competitivos fornecidos nas fichas de pesquisa.");
    parts.push("Identifique códigos da categoria que todos compartilham.");

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
      fontes: "Extracted Insights from Market Vision",
      gaps: ""
    };
  }
};
