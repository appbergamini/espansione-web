export const Agent_00_Intake = {
  name: "Intake & Briefing Inicial",
  stage: "pre_diagnostico",
  inputs: [],
  checkpoint: null,

  getSystemPrompt() {
    return `Você é um analista estratégico de branding do Método Espansione. Sua função é processar os dados de intake de um novo cliente e gerar um Documento de Contexto Inicial que servirá como base para todo o projeto de branding. O Método Espansione tem como base conceitual a metodologia de Ana Couto e é complementado por referências globais em cada fase.

PAPEL E OBJETIVO
Você recebe as respostas de um formulário de intake expandido com 3 blocos: Bloco A (empresa e marca), Bloco B (marca empregadora e cultura, incluindo radar de 11 pilares), Bloco C (visão, propósito e futuro, incluindo classificação tríplice Aceleradores/Impulsionadores/Detratores). Seu trabalho é analisar essas respostas e gerar um documento estruturado que contextualiza o cliente para todos os agentes subsequentes.

CONCEITOS-BASE (Ana Couto)
Classificação de Momento: Criação, Fortalecimento, Reposicionamento, Expansão.
Classificação Tríplice: Impulsionadores (forças atuais), Detratores (fragilidades), Aceleradores (oportunidades). Analise criticamente a auto-classificação do cliente.
Marca de Dentro para Fora: Marca institucional e marca empregadora como faces da mesma moeda. Radar de 11 pilares como indicadores da saúde da marca por dentro.

FRAMEWORKS COMPLEMENTARES
Enquadramento Estratégico (Playing to Win, Lafley & Martin): Where to Play / How to Win.
Estrutura de Brand Brief (Wheeler): visão, público, proposta de valor, cenário competitivo, personalidade.

REGRAS DE ANÁLISE
- A8 vs A9 (palavras desejadas vs reais) = gap de percepção crítico.
- A7 (personalidade como pessoa) = autoimagem da marca.
- C7 (mudaria amanhã) = dor mais urgente.
- Radar B9: pilares <5 são alertas, >8 são forças. Distância entre maior e menor = inconsistência.
- Compare C5 (propósito declarado) com C4 (motivação de criação). Motivação geralmente mais verdadeira.
- Mínimo 3 hipóteses para investigação.

FORMATO DO OUTPUT

Gere o documento exatamente nesta estrutura, usando marcadores XML:

<resumo_executivo>
2-3 frases com insights mais críticos.
</resumo_executivo>

<conteudo>
DOCUMENTO DE CONTEXTO INICIAL v2
[Nome] | Método Espansione

1. PERFIL DA EMPRESA (máx. 100 palavras)

2. MOMENTO DA MARCA (máx. 80 palavras)

3. MAPA DE PERCEPÇÕES INICIAIS (máx. 150 palavras): A7, A8 vs A9, A10, C6.

4. PERFIL DE MARCA EMPREGADORA (máx. 150 palavras): Radar 11 pilares, fortes >7, fracos <5, B10 prioridade, gap B3 vs B4.

5. CLASSIFICAÇÃO TRÍPLICE DECLARADA (máx. 100 palavras): C1 com análise de coerência.

6. ENQUADRAMENTO ESTRATÉGICO (máx. 100 palavras): Where/How, C2 5 anos, C3 necessário.

7. HIPÓTESES PARA INVESTIGAÇÃO (3-5 itens)

8. ROTEIRO SUGERIDO PARA ENTREVISTA (5-7 perguntas)
</conteudo>

<conclusoes>
- Takeaway 1
- Takeaway 2
- Takeaway 3
</conclusoes>

<confianca>Alta|Media|Baixa</confianca>

Limite: máximo 600 palavras (excluindo roteiro).`;
  },

  getUserPrompt(context) {
    const intake = context.intake || {};
    return `=== DADOS DO FORMULÁRIO DE INTAKE ===

BLOCO A — A EMPRESA E SUA MARCA
A1. Nome: ${intake.nome_empresa || ""}
A2. Tempo de mercado: ${intake.tempo_mercado || ""}
A3. O que vendem e para quem: ${intake.produtos_publico || ""}
A4. Organização: ${intake.organizacao || ""}
A5. Clima interno: ${intake.clima_interno || ""}
A6. Desafios liderança: ${intake.desafios_lideranca || ""}
A7. Personalidade como pessoa: ${intake.personalidade_marca || ""}
A8. 3 palavras desejadas: ${intake.palavras_desejadas || ""}
A9. 3 palavras reais: ${intake.palavras_reais || ""}
A10. Marca admirada: ${intake.marca_admirada || ""}

BLOCO B — MARCA EMPREGADORA E CULTURA
B1. ${intake.b1 || ""}
B2. ${intake.b2 || ""}
B3. ${intake.b3 || ""}
B4. ${intake.b4 || ""}
B5. ${intake.b5 || ""}
B6. ${intake.b6 || ""}
B7. ${intake.b7 || ""}
B8. ${intake.b8 || ""}
B9. RADAR (11 pilares, 0-10): ${intake.radar_pilares || ""}
B10. Área mais importante: ${intake.area_prioritaria || ""}

BLOCO C — VISÃO, PROPÓSITO E FUTURO
C1. CLASSIFICAÇÃO TRÍPLICE:
  Impulsionadores: ${intake.impulsionadores || ""}
  Detratores: ${intake.detratores || ""}
  Aceleradores: ${intake.aceleradores || ""}
C2. Onde em 5 anos: ${intake.visao_5anos || ""}
C3. O que é necessário: ${intake.necessario || ""}
C4. Motivação de criação: ${intake.motivacao_criacao || ""}
C5. Propósito declarado: ${intake.proposito_declarado || ""}
C6. Diferencial percebido: ${intake.diferencial_percebido || ""}
C7. Mudaria amanhã: ${intake.mudaria_amanha || ""}`;
  },

  parseOutput(rawText) {
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
      fontes: "Intake do cliente (3 blocos)",
      gaps: ""
    };
  }
};
