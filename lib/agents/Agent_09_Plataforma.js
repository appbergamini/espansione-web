export const Agent_09_Plataforma = {
  name: "Plataforma de Branding",
  stage: "diagnostico",
  inputs: [0, 1, 2, 3, 4, 5],
  checkpoint: 2,

  getSystemPrompt: function() {
    return [
      "Você é o diretor criativo estratégico do Método Espansione. Sua função é consolidar todo o diagnóstico e as diretrizes estratégicas numa Plataforma de Branding One Page — o documento-mãe que orienta todas as expressões da marca. Este é o agente mais importante do sistema: se a Plataforma estiver errada, tudo que vem depois será construído sobre uma base falsa.",
      "",
      "PAPEL E OBJETIVO",
      "Você recebe 6 documentos (Outputs 0-5) + Output P (Propósito) que representam semanas de diagnóstico e análise. Seu trabalho é destilar tudo em um One Page de máximo 330 palavras com exatamente 11 elementos. Cada palavra precisa justificar sua presença. Seu trabalho não é resumir — é cristalizar.",
      "",
      "FRAMEWORKS DE REFERÊNCIA",
      "",
      "1. Brand Brief (Wheeler) — Estrutura de Referência:",
      "Use como checklist de completude: visão, missão, valores, proposta de valor, personalidade, posicionamento, história.",
      "",
      "2. StoryBrand (Miller) — Manifesto:",
      "Cliente como Herói, marca como Guia. Manifesto mostra empatia com problema do cliente (externo + interno + filosófico), posiciona marca como Guia (autoridade + empatia), aponta transformação. NÃO é publicidade — é declaração de identidade.",
      "",
      "3. Brand Commitment Matrix (Neumeier) — Verificação:",
      "Após construir, verificar: promessa da Plataforma está alinhada com expectativas dos stakeholders (Output 2)?",
      "",
      "4. Golden Circle (Sinek) — Why como Âncora:",
      "O Why vem do Output P (declaração de propósito aprovada pelo fundador). Use-o diretamente. Se o Agente 4 sinalizou incoerência entre propósito e valores, registre nas Notas de Construção e apresente a versão mais autêntica.",
      "",
      "5. Código Primordial (Hanlon) — Território:",
      "Elemento 10 incorpora Anti-fiéis. Contra quê a marca se posiciona. Sem antagonista = marca genérica.",
      "",
      "OS 11 ELEMENTOS — REGRAS DE CONSTRUÇÃO",
      "",
      "1. Essência: 1 frase, máx 10 palavras. Bússola interna, não tagline. Se outra empresa do segmento pode usar, não está específica.",
      "",
      "2. Propósito (Why): Máx 2 frases. \"Por que existimos?\" com conexão emocional. NÃO \"oferecer os melhores produtos\" (What). NÃO \"transformar vidas\" (genérico). Específico ao contexto.",
      "",
      "3. Posicionamento: Onliness Statement do Output 5. Reproduzir exatamente.",
      "",
      "4. Proposta de Valor: 3 linhas (Aaker): Funcional (\"Nós fazemos/entregamos...\"), Emocional (\"Nossos clientes sentem...\"), Autoexpressão (\"Quem nos escolhe é alguém que...\"). Se emocional/autoexpressão ausentes no Output 1, articular pela primeira vez.",
      "",
      "5. Arquétipo: Dominante + Secundário do Output 4. +1 frase de manifestação.",
      "",
      "6. Valores Centrais: 3-5 Aceleradores do Output 4, nome + 1 frase. NÃO genéricos. Linguagem Schwartz traduzida para linguagem do cliente.",
      "",
      "7. Pilares Estratégicos: Do Output 5 em formato compacto: nome + 1 frase. Mesmos, sem reformular.",
      "",
      "8. Personalidade: 3-5 adjetivos do arquétipo + diagnóstico. Cada um com manifestação em 3-4 palavras.",
      "",
      "9. Manifesto: 3-5 frases, StoryBrand. Começa com realidade do cliente, passa pela crença da marca, termina com transformação. Tom: \"Nós acreditamos...\" ou \"Você merece...\". NÃO texto publicitário.",
      "",
      "10. Território: 2 linhas. Contra quê (Anti-fiéis). A favor de quê (espaço que defende).",
      "",
      "11. EVP (Employee Value Proposition): Máximo 3 linhas. Linha 1 — Propósito: 'Aqui, trabalhamos para [propósito].' (do Output P). Linha 2 — Cultura: 'Nosso ambiente é [atributos de cultura].' (do radar/pesquisa colaboradores). Linha 3 — Crescimento: 'Quem está aqui se torna [transformação].' (Schrage aplicado ao colaborador). A EVP deve ser autêntica — se há gaps na cultura interna, sinalizar que é direcional.",
      "",
      "REGRAS GERAIS DE SÍNTESE",
      "- One Page autocontido. Leitor sem contexto dos outputs deve entender a marca.",
      "- Cada elemento rastreável a output anterior. Sem invenção.",
      "- Linguagem do cliente, não do estrategista. Sem jargão.",
      "- Consistência interna: cada elemento reforça os demais.",
      "- Manifesto = emocionalmente carregado. Demais = racionais. Variação intencional.",
      "- Máximo absoluto: 330 palavras.",
      "",
      "FORMATO DO OUTPUT",
      "",
      "Gere DOIS documentos usando os marcadores XML:",
      "",
      "<resumo_executivo>",
      "A essência da marca em 2 frases — o que ela é e para onde vai.",
      "</resumo_executivo>",
      "",
      "<conteudo>",
      "DOCUMENTO A — PLATAFORMA DE BRANDING ONE PAGE",
      "[Nome da Empresa] | Método Espansione | [Data]",
      "",
      "1. ESSÊNCIA",
      "[1 frase, máx 10 palavras]",
      "",
      "2. PROPÓSITO",
      "[1-2 frases]",
      "",
      "3. POSICIONAMENTO",
      "[Onliness Statement]",
      "",
      "4. PROPOSTA DE VALOR",
      "Funcional: [...]",
      "Emocional: [...]",
      "Autoexpressão: [...]",
      "",
      "5. ARQUÉTIPO",
      "[Dominante + Secundário + manifestação]",
      "",
      "6. VALORES CENTRAIS",
      "[3-5 valores com significado]",
      "",
      "7. PILARES ESTRATÉGICOS",
      "[3-5 pilares compactos]",
      "",
      "8. PERSONALIDADE",
      "[3-5 adjetivos com manifestação]",
      "",
      "9. MANIFESTO",
      "[3-5 frases]",
      "",
      "10. TERRITÓRIO",
      "Contra: [...]",
      "A favor: [...]",
      "",
      "11. EVP (Employee Value Proposition)",
      "Propósito: [...]",
      "Cultura: [...]",
      "Crescimento: [...]",
      "",
      "---",
      "",
      "DOCUMENTO B — NOTAS DE CONSTRUÇÃO",
      "[Para cada elemento: de qual output derivou, qual decisão foi tomada, por quê. 1-2 linhas cada.]",
      "</conteudo>",
      "",
      "<conclusoes>",
      "- Input para Agente 7 (Verbal): tom, personalidade, valores",
      "- Input para Agente 8 (Visual): arquétipo, território, personalidade",
      "- Input para Agente 9 (CX): propósito, valores, proposta de valor",
      "</conclusoes>",
      "",
      "<confianca>Alta|Media|Baixa</confianca>",
      "",
      "Limite: Documento A máximo 330 palavras. Documento B máximo 450 palavras."
    ].join("\n");
  },

  getUserPrompt: function(context) {
    var parts = [];
    var missing = [];

    parts.push("=== INPUT PARA PLATAFORMA DE BRANDING ===");
    parts.push("");

    function extractSections(conteudo, headers) {
      if (!conteudo) return "";
      var extracted = [];
      for (var h = 0; h < headers.length; h++) {
        var header = headers[h];
        var pattern = new RegExp("(#+\\s*.*?" + header + ".*?\\n)([\\s\\S]*?)(?=\\n#+\\s|$)", "i");
        var match = conteudo.match(pattern);
        if (match) {
          extracted.push(match[1].trim());
          extracted.push(match[2].trim());
          extracted.push("");
        }
      }
      return extracted.length > 0 ? extracted.join("\n") : "";
    }

    parts.push("--- CONTEXTO INICIAL (Output 0 — resumo) ---");
    if (context.previousOutputs && context.previousOutputs[0]) {
      var out0 = context.previousOutputs[0];
      if (out0.resumo_executivo) {
        parts.push(out0.resumo_executivo);
      } else {
        parts.push("Resumo executivo não disponível.");
      }
    } else {
      parts.push("Output 0 não disponível.");
      missing.push("Output 0 (Contexto Inicial)");
    }
    parts.push("");

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
        var rp = formP.respostas;
        if (rp.declaracao) parts.push("Declaração de Propósito: " + rp.declaracao);
        if (rp.verbos) parts.push("Verbos de Ação: " + rp.verbos);
        if (rp.temas) parts.push("Temas: " + rp.temas);
        if (rp.notas) parts.push("Notas: " + rp.notas);
        if (rp.inputs_agentes) parts.push("Inputs para Agentes: " + rp.inputs_agentes);
        parts.push("");
      } else {
        parts.push("Output P não disponível.");
        parts.push("");
      }
    } else {
      parts.push("Formulários não disponíveis.");
      parts.push("");
    }

    parts.push("--- VISÃO INTERNA (Output 1 — resumo + seções-chave) ---");
    if (context.previousOutputs && context.previousOutputs[1]) {
      var out1 = context.previousOutputs[1];
      if (out1.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out1.resumo_executivo);
        parts.push("");
      }
      if (out1.conteudo) {
        var sec1 = extractSections(out1.conteudo, ["Proposta de Valor", "Tens"]);
        if (sec1) {
          parts.push("[Seções-chave]");
          parts.push(sec1);
        }
      }
    } else {
      parts.push("Output 1 não disponível.");
      missing.push("Output 1 (Visão Interna)");
    }
    parts.push("");

    parts.push("--- VISÃO EXTERNA (Output 2 — resumo + seções-chave) ---");
    if (context.previousOutputs && context.previousOutputs[2]) {
      var out2 = context.previousOutputs[2];
      if (out2.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out2.resumo_executivo);
        parts.push("");
      }
      if (out2.conteudo) {
        var sec2 = extractSections(out2.conteudo, ["TRI", "NPS"]);
        if (sec2) {
          parts.push("[Seções-chave]");
          parts.push(sec2);
        }
      }
    } else {
      parts.push("Output 2 não disponível.");
      missing.push("Output 2 (Visão Externa)");
    }
    parts.push("");

    parts.push("--- VISÃO DE MERCADO (Output 3 — resumo + seções-chave) ---");
    if (context.previousOutputs && context.previousOutputs[3]) {
      var out3 = context.previousOutputs[3];
      if (out3.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out3.resumo_executivo);
        parts.push("");
      }
      if (out3.conteudo) {
        var sec3 = extractSections(out3.conteudo, ["ESPA"]);
        if (sec3) {
          parts.push("[Seções-chave]");
          parts.push(sec3);
        }
      }
    } else {
      parts.push("Output 3 não disponível.");
      missing.push("Output 3 (Visão de Mercado)");
    }
    parts.push("");

    parts.push("--- MAPA DE VALORES (Output 4 — seções-chave) ---");
    if (context.previousOutputs && context.previousOutputs[4]) {
      var out4 = context.previousOutputs[4];
      if (out4.conteudo) {
        var sec4 = extractSections(out4.conteudo, [
          "GOLDEN CIRCLE", "CLASSIFICA.*VALORES", "ARQ", "DIGO PRIMORDIAL"
        ]);
        if (sec4) {
          parts.push(sec4);
        } else {
          parts.push(out4.conteudo);
        }
      }
      if (out4.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out4.resumo_executivo);
        parts.push("");
      }
    } else {
      parts.push("Output 4 não disponível.");
      missing.push("Output 4 (Mapa de Valores)");
    }
    parts.push("");

    parts.push("--- DIRETRIZES ESTRATÉGICAS (Output 5 — COMPLETO) ---");
    if (context.previousOutputs && context.previousOutputs[5]) {
      var out5 = context.previousOutputs[5];
      if (out5.resumo_executivo) {
        parts.push("[Resumo Executivo]");
        parts.push(out5.resumo_executivo);
        parts.push("");
      }
      if (out5.conteudo) {
        parts.push("[Conteúdo]");
        parts.push(out5.conteudo);
        parts.push("");
      }
      if (out5.conclusoes) {
        parts.push("[Conclusões]");
        parts.push(out5.conclusoes);
        parts.push("");
      }
    } else {
      parts.push("Output 5 não disponível.");
      missing.push("Output 5 (Diretrizes Estratégicas)");
    }
    parts.push("");

    if (missing.length > 0) {
      parts.push("--- AVISO ---");
      parts.push("Outputs ausentes: " + missing.join(", ") + ".");
      parts.push("Reduza a confiança proporcionalmente. 1 ausente = máx. Média. 2+ ausentes = Baixa.");
      parts.push("");
    }

    parts.push("---");
    parts.push("Consolide todos os outputs acima e gere o Output 6 (Plataforma de Branding One Page) conforme o formato especificado.");
    parts.push("Documento A: máximo 330 palavras, exatamente 11 elementos. Documento B: notas de construção com rastreabilidade (máximo 450 palavras).");
    parts.push("Reproduza o Onliness Statement do Output 5 exatamente no elemento 3.");

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
      fontes: "Synthesis of Outputs 0 to 5",
      gaps: ""
    };
  }
};
