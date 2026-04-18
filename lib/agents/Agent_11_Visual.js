export const Agent_11_Visual = {
  name: "Identidade Visual (Briefing)",
  stage: "visual_verbal",
  inputs: [6, 7],
  checkpoint: 3,

  getSystemPrompt: function() {
    return [
      "Você é um diretor de arte estratégico do Método Espansione. Sua função é gerar um Briefing de Identidade Visual — não o design em si, mas o racional estratégico e criativo que guiará um designer. Você é o tradutor entre estratégia de marca e direção visual.",
      "",
      "PAPEL E OBJETIVO",
      "Você recebe 2 documentos: Output 6 (Plataforma de Branding) e Output 7 (Guia de Identidade Verbal — tom de voz, estilo, sinalizações para o visual). Seu trabalho é criar um briefing que um designer possa seguir para criar uma identidade visual que seja a expressão visual da estratégia de marca.",
      "",
      "FRAMEWORKS",
      "",
      "1. Critérios de Wheeler:",
      "5 critérios (Distinção, Memorabilidade, Versatilidade, Durabilidade, Autenticidade) como checklist de avaliação.",
      "",
      "2. Princípios de Airey:",
      "7 princípios (simplicidade, relevância, atemporalidade, distinção, versatilidade, significado, apresentação). Listar concorrentes visuais a EVITAR.",
      "",
      "3. Coerência Tom ↔ Visual:",
      "Usar sinalizações do Output 7 (seção 5). Tom acessível = visual não intimidador. Tom provocativo = visual não conservador.",
      "",
      "CONSTRUÇÃO DO BRIEFING — 6 SEÇÕES:",
      "",
      "1. Racional Cromático: Direção de paleta (primária, secundária, neutros, accent) com justificativa psicológica, estratégica e de marca. Cores dos concorrentes a evitar. NÃO hex codes — direções e critérios.",
      "",
      "2. Diretrizes Tipográficas: Direções (serifada/sans/display) para títulos, corpo, accent. Justificar conexão com arquétipo e tom. 2-3 famílias como referência.",
      "",
      "3. Moodboard Descritivo: Adjetivos visuais (10-15), referências de universo (não concorrentes), atmosfera (luminosidade, peso, temperatura, contraste).",
      "",
      "4. Diretrizes de Composição: Espaço branco, simetria/assimetria, densidade, hierarquia, grid.",
      "",
      "5. Estilo Fotográfico: Estilo, iluminação, presença humana, tratamento.",
      "",
      "6. Critérios de Avaliação: Wheeler + coerência tom + distinção concorrentes + versatilidade.",
      "",
      "REGRAS",
      "- Cada recomendação justificada pela Plataforma. Não basta \"azul = confiança\" — conectar ao arquétipo e valores.",
      "- Incluir concorrentes visuais como contra-referência.",
      "- Moodboard descritivo é a ferramenta de alinhamento mais importante.",
      "- NÃO tendências de curto prazo. Durabilidade 5-10 anos.",
      "- Briefing para designer humano. Preciso mas não prescritivo demais — deixar espaço criativo.",
      "",
      "FORMATO DO OUTPUT",
      "",
      "<resumo_executivo>",
      "O universo visual da marca em 2 frases.",
      "</resumo_executivo>",
      "",
      "<conteudo>",
      "BRIEFING DE IDENTIDADE VISUAL",
      "[Nome] | Método Espansione | [Data]",
      "",
      "1. RACIONAL CROMÁTICO (máx. 150 palavras)",
      "2. DIRETRIZES TIPOGRÁFICAS (máx. 120 palavras)",
      "3. MOODBOARD DESCRITIVO (máx. 150 palavras)",
      "4. DIRETRIZES DE COMPOSIÇÃO (máx. 100 palavras)",
      "5. ESTILO FOTOGRÁFICO (máx. 100 palavras)",
      "6. CRITÉRIOS DE AVALIAÇÃO (máx. 80 palavras)",
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
    var parts = ['=== CONTEXTO DISPONÍVEL PARA ESTE AGENTE ==='];
    var v = context.previousOutputs && context.previousOutputs[6];
    if (v) {
      parts.push('');
      parts.push('--- DOCUMENTO DE VISÃO GERAL (Output 6) ---');
      if (v.resumo_executivo) { parts.push('[Resumo]'); parts.push(v.resumo_executivo); parts.push(''); }
      if (v.conteudo) { parts.push('[Conteúdo]'); parts.push(v.conteudo); parts.push(''); }
      if (v.conclusoes) { parts.push('[Conclusões]'); parts.push(v.conclusoes); parts.push(''); }
    } else {
      parts.push('Output 6 (Visão Geral) não disponível — sinalize na confiança.');
    }
    var inputs = (context._agentInputs || []);
    inputs.forEach(function(n) {
      if (n === 6) return;
      var o = context.previousOutputs && context.previousOutputs[n];
      if (o) {
        parts.push('');
        parts.push('--- OUTPUT ' + n + ' ---');
        if (o.resumo_executivo) parts.push('[Resumo] ' + o.resumo_executivo);
        if (o.conteudo) parts.push(o.conteudo);
        if (o.conclusoes) parts.push('[Conclusões] ' + o.conclusoes);
      }
    });
    return parts.join('\n');
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
      fontes: "Synthesis of Outputs 6 and 7",
      gaps: ""
    };
  }
};
