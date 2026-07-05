// =====================================================================
// GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.
// Fonte: data/identidade/mapa_identidade_final.xlsx.
// Regenerar: node scripts/build-identidade-final.cjs
// Perguntas: 106 · Indicadores comparáveis: 24
// =====================================================================

export const PUBLICOS_IDENTIDADE = [
  "socios",
  "colaboradores",
  "clientes"
];

/** @typedef {Object} PerguntaIdentidade */
export const CATALOGO_IDENTIDADE = [
  {
    "id": "D-SD-01",
    "publico": "socios",
    "sistema": "Perfil",
    "objetivo": "Contexto",
    "indicador": "Papel",
    "indicador_codigo": null,
    "classificacao": "Dado cadastral",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "selecao_unica",
    "pergunta": "Qual é seu papel atual na empresa?",
    "opcoes": [
      "Fundador(a)",
      "Sócio(a)",
      "Diretor(a)",
      "Conselheiro(a)",
      "Outro"
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "D-SD-02",
    "publico": "socios",
    "sistema": "Perfil",
    "objetivo": "Contexto",
    "indicador": "Porte",
    "indicador_codigo": null,
    "classificacao": "Dado cadastral",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "selecao_unica",
    "pergunta": "Quantas pessoas trabalham atualmente na empresa?",
    "opcoes": [
      "1 a 4",
      "5 a 10",
      "11 a 30",
      "31 a 100",
      "Mais de 100"
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "D-SD-03",
    "publico": "socios",
    "sistema": "Perfil",
    "objetivo": "Contexto",
    "indicador": "Segmento",
    "indicador_codigo": null,
    "classificacao": "Dado cadastral",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "texto_curto",
    "pergunta": "Qual é o principal segmento de atuação da empresa?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-MAR-01",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Clareza da identidade e do propósito",
    "indicador_codigo": "MAR-01",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A identidade e o propósito da empresa estão claramente definidos e orientam decisões importantes.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-MAR-02",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Diferenciação",
    "indicador_codigo": "MAR-02",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa possui um diferencial claro, relevante e difícil de copiar em relação às demais alternativas do mercado.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-MAR-03",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Promessa",
    "indicador": "Promessa e entrega",
    "indicador_codigo": "MAR-03",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A promessa feita pela marca é cumprida de forma consistente na experiência entregue.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-MAR-04",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Valores e cultura",
    "indicador": "Vivência dos valores",
    "indicador_codigo": "MAR-04",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Os valores da empresa orientam de forma consistente as decisões e os comportamentos do dia a dia.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-MAR-05",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Reputação e confiança",
    "indicador_codigo": "MAR-05",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A reputação da empresa gera confiança, preferência e indicação entre seus públicos.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-MAR-06",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Coerência cultural",
    "indicador": "Consistência da identidade",
    "indicador_codigo": "MAR-06",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A identidade da empresa é representada de forma consistente pelas lideranças, equipes e diferentes áreas.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-NEG-01",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Direção estratégica",
    "indicador": "Clareza de direção e prioridades",
    "indicador_codigo": "NEG-01",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa tem clareza sobre aonde quer chegar e sobre as escolhas estratégicas que definem esse caminho.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-NEG-02",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Cliente e proposta de valor",
    "indicador": "Conhecimento do cliente",
    "indicador_codigo": "NEG-02",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa conhece profundamente seus clientes prioritários, suas necessidades e seus critérios de decisão.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-NEG-03",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Cliente e proposta de valor",
    "indicador": "Valor entregue",
    "indicador_codigo": "NEG-03",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "As soluções da empresa resolvem problemas relevantes e geram benefícios claramente percebidos pelos clientes.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-NEG-04",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Mercado",
    "indicador": "Concorrência e adaptação",
    "indicador_codigo": "NEG-04",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa acompanha concorrentes, mudanças do mercado e oportunidades, transformando essas informações em decisões.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-NEG-05",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Execução",
    "indicador": "Processos e gestão",
    "indicador_codigo": "NEG-05",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "As prioridades são transformadas em processos, planos, responsáveis, prazos e indicadores de acompanhamento.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-NEG-06",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Resultados e capacidade de crescer",
    "indicador_codigo": "NEG-06",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa consegue crescer com resultados sustentáveis sem perder qualidade, controle ou depender excessivamente dos sócios.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-COM-01",
    "publico": "socios",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna e relacional",
    "indicador": "Clareza e oportunidade",
    "indicador_codigo": "COM-01",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Existe alinhamento interno sobre o que a empresa é, o que promete e para onde vai.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-COM-02",
    "publico": "socios",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna e relacional",
    "indicador": "Transparência",
    "indicador_codigo": "COM-02",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A comunicação interna reforça a estratégia e a identidade da empresa, não apenas tarefas e operação.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-COM-03",
    "publico": "socios",
    "sistema": "Comunicação",
    "objetivo": "Mensagem de valor",
    "indicador": "Clareza da mensagem externa",
    "indicador_codigo": "COM-03",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A comunicação externa traduz com clareza a proposta de valor e o diferencial da empresa, sem soar genérica.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-COM-04",
    "publico": "socios",
    "sistema": "Comunicação",
    "objetivo": "Coerência",
    "indicador": "Consistência entre canais e pessoas",
    "indicador_codigo": "COM-04",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A mensagem é consistente entre canais, propostas, vendedores, atendimento e experiência entregue.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-COM-05",
    "publico": "socios",
    "sistema": "Comunicação",
    "objetivo": "Relacionamento",
    "indicador": "Comunicação durante a jornada",
    "indicador_codigo": "COM-05",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A comunicação ao longo da jornada fortalece a relação e a percepção de valor pelo cliente.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-COM-06",
    "publico": "socios",
    "sistema": "Comunicação",
    "objetivo": "Escuta",
    "indicador": "Feedback e melhoria",
    "indicador_codigo": "COM-06",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa coleta feedbacks de clientes e colaboradores e os transforma em melhorias concretas.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-PES-01",
    "publico": "socios",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Direção e coordenação",
    "indicador_codigo": "PES-01",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Os líderes orientam prioridades e conduzem suas equipes com clareza e consistência.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-PES-02",
    "publico": "socios",
    "sistema": "Pessoas",
    "objetivo": "Estrutura e autonomia",
    "indicador": "Clareza de papéis e autonomia",
    "indicador_codigo": "PES-02",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Papéis, responsabilidades e níveis de decisão são claros, e as pessoas possuem autonomia compatível com suas funções.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-PES-03",
    "publico": "socios",
    "sistema": "Pessoas",
    "objetivo": "Competências",
    "indicador": "Preparo técnico e comportamental",
    "indicador_codigo": "PES-03",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "As competências técnicas e comportamentais atuais da equipe são suficientes para sustentar a estratégia.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-PES-04",
    "publico": "socios",
    "sistema": "Pessoas",
    "objetivo": "Desenvolvimento",
    "indicador": "Feedback e desenvolvimento",
    "indicador_codigo": "PES-04",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa oferece feedback e desenvolvimento contínuo para líderes e equipes.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-PES-05",
    "publico": "socios",
    "sistema": "Pessoas",
    "objetivo": "Colaboração",
    "indicador": "Integração entre pessoas e áreas",
    "indicador_codigo": "PES-05",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa tem uma cultura de colaboração entre áreas, acima de silos e interesses isolados.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-PES-06",
    "publico": "socios",
    "sistema": "Pessoas",
    "objetivo": "Performance",
    "indicador": "Responsabilidade por resultados",
    "indicador_codigo": "PES-06",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa tem uma cultura de responsabilização por resultados, e não apenas de cumprimento de tarefas.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-ESP-01",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Mercado",
    "indicador": "Concorrentes prioritários",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "multipla",
    "pergunta": "Quais são hoje os principais concorrentes ou alternativas que disputam a mesma decisão do cliente? Informe até três.",
    "opcoes": [
      "Até 3 nomes"
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-ESP-02",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Prioridades",
    "indicador": "Prioridades dos próximos 12 meses",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "ranking_top3",
    "pergunta": "Quais temas deveriam receber maior atenção nos próximos 12 meses? Selecione e ordene até três.",
    "opcoes": [
      "Posicionamento",
      "Crescimento comercial",
      "Rentabilidade",
      "Processos e produtividade",
      "Experiência do cliente",
      "Liderança",
      "Cultura",
      "Desenvolvimento das pessoas",
      "Comunicação interna",
      "Comunicação externa",
      "Inovação",
      "Tecnologia",
      "Outro"
    ],
    "max_escolhas": 3,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-ESP-03",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Satisfação com resultados",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "satisfaction",
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com os resultados atuais da empresa?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-ESP-04",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Riscos",
    "indicador": "Riscos estratégicos",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "multipla",
    "pergunta": "Quais riscos mais ameaçam o crescimento e os resultados? Selecione até três.",
    "opcoes": [
      "Caixa/financeiro",
      "Concentração de clientes",
      "Dependência dos sócios",
      "Pessoas-chave",
      "Falta de mão de obra",
      "Fornecedores",
      "Tecnologia",
      "Operação",
      "Reputação",
      "Legislação",
      "Concorrência",
      "Capacidade comercial",
      "Outro"
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-ESP-05",
    "publico": "socios",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Satisfação com as lideranças",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "satisfaction",
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com o desempenho atual das lideranças?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-SD-ESP-06",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Coerência integrada",
    "indicador": "Principal desalinhamento",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_longa",
    "pergunta": "Qual é hoje o principal desalinhamento entre Marca, Negócios, Comunicação e Pessoas que limita o crescimento?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": true
  },
  {
    "id": "D-CL-01",
    "publico": "colaboradores",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Área",
    "indicador_codigo": null,
    "classificacao": "Dado cadastral",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "selecao_unica",
    "pergunta": "Em qual área você atua?",
    "opcoes": [
      "Administrativo",
      "Financeiro",
      "Comercial/Vendas",
      "Marketing/Comunicação",
      "Operação/Entrega",
      "Atendimento/Relacionamento",
      "Tecnologia/Produto",
      "Pessoas/RH",
      "Gestão/Liderança",
      "Outro",
      "Prefiro não informar"
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "D-CL-02",
    "publico": "colaboradores",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Liderança",
    "indicador_codigo": null,
    "classificacao": "Dado cadastral",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "selecao_unica",
    "pergunta": "Você possui responsabilidade formal de liderança de pessoas?",
    "opcoes": [
      "Sim",
      "Não",
      "Prefiro não informar"
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "D-CL-03",
    "publico": "colaboradores",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Tempo de empresa",
    "indicador_codigo": null,
    "classificacao": "Dado cadastral",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "selecao_unica",
    "pergunta": "Há quanto tempo você trabalha na empresa?",
    "opcoes": [
      "Menos de 6 meses",
      "6 a 12 meses",
      "1 a 3 anos",
      "3 a 5 anos",
      "Mais de 5 anos",
      "Prefiro não informar"
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-MAR-01",
    "publico": "colaboradores",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Clareza da identidade e do propósito",
    "indicador_codigo": "MAR-01",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Eu compreendo quem a empresa é, por que existe e como meu trabalho contribui para o valor que ela pretende gerar.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-MAR-02",
    "publico": "colaboradores",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Diferenciação",
    "indicador_codigo": "MAR-02",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Consigo explicar claramente o que diferencia a empresa das demais alternativas do mercado.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-MAR-03",
    "publico": "colaboradores",
    "sistema": "Marca",
    "objetivo": "Promessa",
    "indicador": "Promessa e entrega",
    "indicador_codigo": "MAR-03",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa entrega aos clientes aquilo que sua marca e sua comunicação prometem.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-MAR-04",
    "publico": "colaboradores",
    "sistema": "Marca",
    "objetivo": "Valores e cultura",
    "indicador": "Vivência dos valores",
    "indicador_codigo": "MAR-04",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Os valores da empresa são vividos de verdade no dia a dia, e não apenas declarados.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-MAR-05",
    "publico": "colaboradores",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Reputação e confiança",
    "indicador_codigo": "MAR-05",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa possui uma imagem forte e transmite confiança aos clientes, parceiros e profissionais.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-MAR-06",
    "publico": "colaboradores",
    "sistema": "Marca",
    "objetivo": "Coerência cultural",
    "indicador": "Consistência da identidade",
    "indicador_codigo": "MAR-06",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Lideranças e áreas representam de forma consistente a identidade e os valores da empresa.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-NEG-01",
    "publico": "colaboradores",
    "sistema": "Negócios",
    "objetivo": "Direção estratégica",
    "indicador": "Clareza de direção e prioridades",
    "indicador_codigo": "NEG-01",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Eu tenho clareza sobre aonde a empresa quer chegar e sobre as escolhas estratégicas que definem esse caminho.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-NEG-02",
    "publico": "colaboradores",
    "sistema": "Negócios",
    "objetivo": "Cliente e proposta de valor",
    "indicador": "Conhecimento do cliente",
    "indicador_codigo": "NEG-02",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Eu compreendo quem são os clientes prioritários e quais necessidades orientam nosso trabalho.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-NEG-03",
    "publico": "colaboradores",
    "sistema": "Negócios",
    "objetivo": "Cliente e proposta de valor",
    "indicador": "Valor entregue",
    "indicador_codigo": "NEG-03",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Eu compreendo o valor que a empresa precisa entregar e como minha função contribui para essa entrega.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-NEG-04",
    "publico": "colaboradores",
    "sistema": "Negócios",
    "objetivo": "Mercado",
    "indicador": "Concorrência e adaptação",
    "indicador_codigo": "NEG-04",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Conheço os principais concorrentes e entendo em quais aspectos a empresa precisa se diferenciar e evoluir.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-NEG-05",
    "publico": "colaboradores",
    "sistema": "Negócios",
    "objetivo": "Execução",
    "indicador": "Processos e gestão",
    "indicador_codigo": "NEG-05",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Os processos, recursos e acompanhamentos existentes ajudam a equipe a entregar com qualidade e produtividade.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-NEG-06",
    "publico": "colaboradores",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Resultados e capacidade de crescer",
    "indicador_codigo": "NEG-06",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa está preparada para crescer sem perder qualidade, agilidade e controle.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-COM-01",
    "publico": "colaboradores",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna e relacional",
    "indicador": "Clareza e oportunidade",
    "indicador_codigo": "COM-01",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Recebo as informações necessárias com clareza e em tempo hábil para executá-las.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-COM-02",
    "publico": "colaboradores",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna e relacional",
    "indicador": "Transparência",
    "indicador_codigo": "COM-02",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A comunicação interna reforça a estratégia e a identidade da empresa, não apenas tarefas e operação.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-COM-03",
    "publico": "colaboradores",
    "sistema": "Comunicação",
    "objetivo": "Mensagem de valor",
    "indicador": "Clareza da mensagem externa",
    "indicador_codigo": "COM-03",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A comunicação externa da empresa traduz com clareza a proposta de valor e o diferencial, sem soar genérica.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-COM-04",
    "publico": "colaboradores",
    "sistema": "Comunicação",
    "objetivo": "Coerência",
    "indicador": "Consistência entre canais e pessoas",
    "indicador_codigo": "COM-04",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A comunicação é consistente entre áreas, lideranças, canais e materiais da empresa.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-COM-05",
    "publico": "colaboradores",
    "sistema": "Comunicação",
    "objetivo": "Relacionamento",
    "indicador": "Comunicação durante a jornada",
    "indicador_codigo": "COM-05",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "As informações sobre clientes, prazos, mudanças, entregas e problemas circulam adequadamente entre as áreas.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-COM-06",
    "publico": "colaboradores",
    "sistema": "Comunicação",
    "objetivo": "Escuta",
    "indicador": "Feedback e melhoria",
    "indicador_codigo": "COM-06",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Minha opinião e os feedbacks dos clientes são ouvidos e considerados para gerar melhorias.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-PES-01",
    "publico": "colaboradores",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Direção e coordenação",
    "indicador_codigo": "PES-01",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Minha liderança orienta prioridades e conduz o trabalho com clareza e consistência.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-PES-02",
    "publico": "colaboradores",
    "sistema": "Pessoas",
    "objetivo": "Estrutura e autonomia",
    "indicador": "Clareza de papéis e autonomia",
    "indicador_codigo": "PES-02",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Meu papel e os resultados esperados são claros, e tenho autonomia compatível com minhas responsabilidades.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-PES-03",
    "publico": "colaboradores",
    "sistema": "Pessoas",
    "objetivo": "Competências",
    "indicador": "Preparo técnico e comportamental",
    "indicador_codigo": "PES-03",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Possuo conhecimentos, habilidades e recursos adequados para realizar bem meu trabalho.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-PES-04",
    "publico": "colaboradores",
    "sistema": "Pessoas",
    "objetivo": "Desenvolvimento",
    "indicador": "Feedback e desenvolvimento",
    "indicador_codigo": "PES-04",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Recebo feedback útil e oportunidades adequadas para desenvolver minhas competências.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-PES-05",
    "publico": "colaboradores",
    "sistema": "Pessoas",
    "objetivo": "Colaboração",
    "indicador": "Integração entre pessoas e áreas",
    "indicador_codigo": "PES-05",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa tem uma cultura de colaboração entre áreas, acima de silos e interesses isolados.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-PES-06",
    "publico": "colaboradores",
    "sistema": "Pessoas",
    "objetivo": "Performance",
    "indicador": "Responsabilidade por resultados",
    "indicador_codigo": "PES-06",
    "classificacao": "Núcleo comparável",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa tem uma cultura de responsabilização por resultados, e não apenas de cumprimento de tarefas.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-ESP-01",
    "publico": "colaboradores",
    "sistema": "Negócios",
    "objetivo": "Mercado",
    "indicador": "Diferencial percebido pela equipe",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_curta",
    "pergunta": "Na sua visão, qual é o principal diferencial da empresa em relação aos concorrentes?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": false,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": true
  },
  {
    "id": "V30-CL-ESP-02",
    "publico": "colaboradores",
    "sistema": "Negócios",
    "objetivo": "Liderança",
    "indicador": "Satisfação com a liderança imediata",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "satisfaction",
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é o seu grau de satisfação com a sua liderança imediata?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-ESP-03",
    "publico": "colaboradores",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Satisfação com a comunicação",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "satisfaction",
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com a comunicação interna da empresa?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-ESP-04",
    "publico": "colaboradores",
    "sistema": "Pessoas",
    "objetivo": "Experiência de trabalho",
    "indicador": "Satisfação geral",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "satisfaction",
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, como voce avalia a sua experiencia em trabalhar nesta empresa?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-ESP-05",
    "publico": "colaboradores",
    "sistema": "Marca",
    "objetivo": "Marca empregadora",
    "indicador": "eNPS",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "nps",
    "response_type": "escala_0_10_nps",
    "pergunta": "De 0 a 10, o quanto você recomendaria esta empresa como um bom lugar para trabalhar?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "V30-CL-ESP-06",
    "publico": "colaboradores",
    "sistema": "Pessoas",
    "objetivo": "Prioridade",
    "indicador": "Mudança prioritária",
    "indicador_codigo": null,
    "classificacao": "Específica do público",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_longa",
    "pergunta": "Qual mudança teria maior impacto positivo sobre sua experiência de trabalho e sua capacidade de entregar resultados?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": false,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": true
  },
  {
    "id": "CLI-DAD-001",
    "publico": "clientes",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Tempo de relacionamento",
    "indicador_codigo": null,
    "classificacao": "Dado cadastral",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "selecao_unica",
    "pergunta": "Há quanto tempo você é cliente da empresa?",
    "opcoes": [
      "Menos de 3 meses",
      "De 3 a 12 meses",
      "De 1 a 3 anos",
      "Mais de 3 anos",
      "Não sei informar"
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-DAD-002",
    "publico": "clientes",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Papel na decisão",
    "indicador_codigo": null,
    "classificacao": "Dado cadastral",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "selecao_unica",
    "pergunta": "Qual foi seu papel na decisão de compra ou contratação?",
    "opcoes": [
      "Fui o decisor principal",
      "Influenciei a decisão",
      "Usei ou utilizei a solução, mas não decidi a compra",
      "Participei da compra, mas não decidi sozinho(a)",
      "Apenas acompanhei o processo",
      "Prefiro não informar"
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-MAR-001",
    "publico": "clientes",
    "sistema": "Marca",
    "objetivo": "Credibilidade percebida",
    "indicador": "Credibilidade antes da contratação",
    "indicador_codigo": "MAR-01",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Nos primeiros contatos, a empresa passou uma impressão profissional e confiável.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-MAR-002",
    "publico": "clientes",
    "sistema": "Marca",
    "objetivo": "Clareza da marca",
    "indicador": "Clareza sobre atuação e valor",
    "indicador_codigo": "MAR-02",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Ficou claro para mim o que a empresa faz e qual problema ela ajuda a resolver.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-MAR-003",
    "publico": "clientes",
    "sistema": "Marca",
    "objetivo": "Diferenciação",
    "indicador": "Diferencial percebido",
    "indicador_codigo": "MAR-03",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Percebi um diferencial claro desta empresa em relação a outras opções do mercado.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-MAR-004",
    "publico": "clientes",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Segurança na decisão",
    "indicador_codigo": "MAR-04",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A reputação da empresa — o que ouvi, li ou me indicaram — reforçou minha segurança na decisão.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-MAR-005",
    "publico": "clientes",
    "sistema": "Marca",
    "objetivo": "Promessa de marca",
    "indicador": "Coerência entre promessa e experiência",
    "indicador_codigo": "MAR-05",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A experiência recebida foi coerente com aquilo que a empresa comunicou ou prometeu.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-MAR-006",
    "publico": "clientes",
    "sistema": "Marca",
    "objetivo": "Preferência",
    "indicador": "Primeira opção considerada",
    "indicador_codigo": "MAR-06",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Em uma próxima necessidade semelhante, esta empresa seria a primeira opção que eu consideraria.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-NEG-001",
    "publico": "clientes",
    "sistema": "Negócios",
    "objetivo": "Compreensão da necessidade",
    "indicador": "Entendimento do cliente",
    "indicador_codigo": "NEG-01",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa demonstrou compreender minha necessidade antes de apresentar o produto/serviço e as condições comerciais.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-NEG-002",
    "publico": "clientes",
    "sistema": "Negócios",
    "objetivo": "Solução contratada",
    "indicador": "Resolução do problema",
    "indicador_codigo": "NEG-02",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A solução contratada resolveu o problema ou necessidade que motivou a compra.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-NEG-003",
    "publico": "clientes",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Resultado esperado versus entregue",
    "indicador_codigo": "NEG-03",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Os benefícios ou resultados entregues foram compatíveis com o que eu esperava alcançar.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-NEG-004",
    "publico": "clientes",
    "sistema": "Negócios",
    "objetivo": "Percepção de valor",
    "indicador": "Investimento justificado",
    "indicador_codigo": "NEG-04",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A entrega recebida justificou o investimento realizado.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-NEG-005",
    "publico": "clientes",
    "sistema": "Negócios",
    "objetivo": "Entrega",
    "indicador": "Cumprimento de combinados",
    "indicador_codigo": "NEG-05",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa cumpriu os combinados, prazos, condições e entregas prometidas.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-NEG-006",
    "publico": "clientes",
    "sistema": "Negócios",
    "objetivo": "Qualidade",
    "indicador": "Consistência da entrega",
    "indicador_codigo": "NEG-06",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Houve consistência na qualidade do que a empresa entregou em todos os contatos ao longo do relacionamento.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-COM-001",
    "publico": "clientes",
    "sistema": "Comunicação",
    "objetivo": "Clareza da solução",
    "indicador": "Clareza antes da contratação",
    "indicador_codigo": "COM-01",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Foi fácil entender o produto, serviço ou solução oferecida antes da contratação.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-COM-002",
    "publico": "clientes",
    "sistema": "Comunicação",
    "objetivo": "Proposta",
    "indicador": "Clareza da proposta",
    "indicador_codigo": "COM-02",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A proposta deixou claros escopo, preço, prazo, responsabilidades, condições e próximos passos.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-COM-003",
    "publico": "clientes",
    "sistema": "Comunicação",
    "objetivo": "Expectativas",
    "indicador": "Alinhamento inicial",
    "indicador_codigo": "COM-03",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa foi realista sobre o que entregaria, sem criar expectativas que depois não se cumpriram.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-COM-004",
    "publico": "clientes",
    "sistema": "Comunicação",
    "objetivo": "Contato",
    "indicador": "Facilidade de acesso",
    "indicador_codigo": "COM-04",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Foi fácil localizar o canal ou a pessoa correta quando precisei falar com a empresa.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-COM-005",
    "publico": "clientes",
    "sistema": "Comunicação",
    "objetivo": "Acompanhamento",
    "indicador": "Informações durante a entrega",
    "indicador_codigo": "COM-05",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "A forma como a empresa se comunicou ao longo da entrega me deixou seguro(a) e reforçou minha confiança nela.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-COM-006",
    "publico": "clientes",
    "sistema": "Comunicação",
    "objetivo": "Transparência",
    "indicador": "Comunicação em momentos críticos",
    "indicador_codigo": "COM-06",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Quando surgiram dúvidas, mudanças, atrasos ou problemas, a empresa comunicou com transparência e agilidade.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-PES-001",
    "publico": "clientes",
    "sistema": "Pessoas",
    "objetivo": "Atendimento",
    "indicador": "Cordialidade e respeito",
    "indicador_codigo": "PES-01",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "O atendimento recebido foi cordial, respeitoso e atencioso.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-PES-002",
    "publico": "clientes",
    "sistema": "Pessoas",
    "objetivo": "Profissionalismo",
    "indicador": "Postura profissional",
    "indicador_codigo": "PES-02",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Os profissionais que me atenderam demonstraram profissionalismo, organização e postura adequada.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-PES-003",
    "publico": "clientes",
    "sistema": "Pessoas",
    "objetivo": "Competência",
    "indicador": "Conhecimento e preparo",
    "indicador_codigo": "PES-03",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Os profissionais demonstraram conhecimento suficiente para orientar, explicar e explicar sobre o produto/serviço e executar o combinado",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-PES-004",
    "publico": "clientes",
    "sistema": "Pessoas",
    "objetivo": "Escuta",
    "indicador": "Interesse genuíno",
    "indicador_codigo": "PES-04",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Os profissionais demonstraram escuta e interesse genuíno em compreender minha necessidade.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-PES-005",
    "publico": "clientes",
    "sistema": "Pessoas",
    "objetivo": "Responsabilidade",
    "indicador": "Encaminhamento e resolução",
    "indicador_codigo": "PES-05",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Os profissionais assumiram responsabilidade pelas minhas demandas até que fossem encaminhadas ou resolvidas.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-PES-006",
    "publico": "clientes",
    "sistema": "Pessoas",
    "objetivo": "Padrão de atendimento",
    "indicador": "Consistência entre canais e pessoas",
    "indicador_codigo": "PES-06",
    "classificacao": "Núcleo pontuado",
    "subperfil": "todos",
    "score_family": "maturity",
    "response_type": "escala4_concordancia",
    "pergunta": "Recebi um padrão de atendimento consistente, independentemente do profissional ou canal utilizado.",
    "opcoes": [
      {
        "label": "Discordo totalmente",
        "value": 0
      },
      {
        "label": "Discordo parcialmente",
        "value": 1
      },
      {
        "label": "Concordo parcialmente",
        "value": 2
      },
      {
        "label": "Concordo totalmente",
        "value": 3
      },
      {
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": true,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-VAL-001",
    "publico": "clientes",
    "sistema": "Valor do Cliente",
    "objetivo": "Decisão de compra",
    "indicador": "Fatores considerados",
    "indicador_codigo": null,
    "classificacao": "Complementar fechado",
    "subperfil": "todos",
    "score_family": "choice_driver",
    "response_type": "multipla_ate3",
    "pergunta": "O que você levou em consideração na hora de escolher esta empresa? Selecione até 3 opções.",
    "opcoes": [
      "Confiança na empresa",
      "Credibilidade da marca",
      "Indicação de alguém",
      "Atendimento inicial",
      "Clareza da proposta",
      "Qualidade técnica percebida",
      "Especialização",
      "Resultado prometido",
      "Relacionamento com a equipe",
      "Agilidade",
      "Preço",
      "Prazo de entrega",
      "Facilidade de contratação",
      "Experiência anterior positiva",
      "Segurança transmitida pela empresa",
      "Não sei informar"
    ],
    "max_escolhas": 3,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-VAL-002",
    "publico": "clientes",
    "sistema": "Valor do Cliente",
    "objetivo": "Decisão de compra",
    "indicador": "Fator decisivo de escolha",
    "indicador_codigo": null,
    "classificacao": "Complementar fechado",
    "subperfil": "todos",
    "score_family": "choice_driver_main",
    "response_type": "selecao_unica",
    "pergunta": "Qual foi o principal fator decisivo para escolher esta empresa? Selecione apenas 1 opção.",
    "opcoes": [
      "Confiança na empresa",
      "Credibilidade da marca",
      "Indicação de alguém",
      "Atendimento inicial",
      "Clareza da proposta",
      "Qualidade técnica percebida",
      "Especialização",
      "Resultado prometido",
      "Relacionamento com a equipe",
      "Agilidade",
      "Preço",
      "Prazo de entrega",
      "Facilidade de contratação",
      "Experiência anterior positiva",
      "Segurança transmitida pela empresa",
      "Não sei informar"
    ],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-VAL-003",
    "publico": "clientes",
    "sistema": "Valor do Cliente",
    "objetivo": "Percepção de valor",
    "indicador": "O que é valor para o cliente",
    "indicador_codigo": null,
    "classificacao": "Complementar fechado",
    "subperfil": "todos",
    "score_family": "value_driver",
    "response_type": "multipla_ate3",
    "pergunta": "Para você, o que mais representa valor em uma solução como essa? Selecione até 3 opções.",
    "opcoes": [
      "Resolver meu problema com eficiência",
      "Ter segurança e confiança",
      "Receber orientação clara",
      "Cumprir prazos",
      "Ter qualidade técnica",
      "Ter atendimento próximo e humano",
      "Ter agilidade",
      "Evitar retrabalho",
      "Ter transparência",
      "Ter uma solução personalizada",
      "Ter facilidade durante o processo",
      "Ter suporte após a entrega",
      "Ter bom custo-benefício",
      "Sentir que a empresa entende meu contexto",
      "Ter uma experiência simples e sem desgaste",
      "Não sei informar"
    ],
    "max_escolhas": 3,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-EXP-001",
    "publico": "clientes",
    "sistema": "Experiência",
    "objetivo": "Satisfação",
    "indicador": "Satisfação geral",
    "indicador_codigo": null,
    "classificacao": "Complementar fechado",
    "subperfil": "todos",
    "score_family": "satisfaction",
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com sua experiência geral com a empresa?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-EXP-002",
    "publico": "clientes",
    "sistema": "Experiência",
    "objetivo": "Recomendação",
    "indicador": "NPS",
    "indicador_codigo": null,
    "classificacao": "Complementar fechado",
    "subperfil": "todos",
    "score_family": "nps",
    "response_type": "escala_0_10_nps",
    "pergunta": "De 0 a 10, o quanto você recomendaria esta empresa para alguém que busca uma solução semelhante?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "CLI-VAL-004",
    "publico": "clientes",
    "sistema": "Valor do Cliente",
    "objetivo": "Melhoria de valor",
    "indicador": "Prioridade de melhoria",
    "indicador_codigo": null,
    "classificacao": "Complementar fechado",
    "subperfil": "todos",
    "score_family": "improvement_driver",
    "response_type": "multipla_ate3",
    "pergunta": "Qual aspecto teria maior impacto para aumentar sua percepção de valor sobre a empresa? Selecione até 3 opções.",
    "opcoes": [
      "Mais clareza sobre o produto ou serviço",
      "Mais clareza na proposta",
      "Melhor cumprimento de prazos",
      "Mais agilidade no atendimento",
      "Melhor acompanhamento durante a entrega",
      "Mais transparência quando houver problemas",
      "Melhor preparo técnico dos profissionais",
      "Mais profissionalismo no atendimento",
      "Mais personalização da solução",
      "Melhor pós-venda",
      "Melhor custo-benefício",
      "Melhor padrão entre profissionais e canais",
      "Mais facilidade para contratar ou acompanhar o serviço",
      "Mais segurança sobre os resultados esperados",
      "Nenhum ponto crítico no momento",
      "Não sei informar"
    ],
    "max_escolhas": 3,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": null,
    "aberta": false
  },
  {
    "id": "AB-SD-MAR-01",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Problema de origem",
    "indicador_codigo": null,
    "classificacao": "Bloco aberto",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_longa",
    "pergunta": "Que problema, necessidade ou indignação os fundadores queriam resolver quando criaram a empresa?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": "Identificar a razão de origem e confrontá-la com o propósito, a proposta de valor e a atuação atual.",
    "aberta": true
  },
  {
    "id": "AB-SD-MAR-02",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Propósito declarado",
    "indicador_codigo": null,
    "classificacao": "Bloco aberto",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_longa",
    "pergunta": "Em uma frase, qual é o propósito da empresa além do resultado financeiro?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": "Construção ou revisão do propósito e avaliação do alinhamento entre os sócios.",
    "aberta": true
  },
  {
    "id": "AB-SD-MAR-03",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Marca empregadora",
    "indicador": "Proposta de valor ao colaborador",
    "indicador_codigo": null,
    "classificacao": "Bloco aberto",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_longa",
    "pergunta": "Qual é a proposta de valor oferecida aos colaboradores e por que um profissional talentoso deveria escolher trabalhar nesta empresa em vez de escolher outra organização?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": "Construção da EVP, marca empregadora e identificação dos fatores de atração e retenção.",
    "aberta": true
  },
  {
    "id": "AB-SD-MAR-04",
    "publico": "socios",
    "sistema": "Marca",
    "objetivo": "Visão futura",
    "indicador": "Reputação desejada",
    "indicador_codigo": null,
    "classificacao": "Bloco aberto",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_longa",
    "pergunta": "Como você deseja que a empresa seja reconhecida daqui a três anos por clientes, colaboradores e parceiros?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": "Definição da percepção futura desejada e comparação com a imagem atual.",
    "aberta": true
  },
  {
    "id": "AB-SD-NEG-01",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Oferta e proposta de valor",
    "indicador": "Oferta, público e transformação",
    "indicador_codigo": null,
    "classificacao": "Bloco aberto",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_estruturada_3",
    "pergunta": "Descreva: (a) o que a empresa vende; (b) para quem vende; e (c) qual transformação ou benefício principal entrega.",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": "Construção da proposta de valor e comparação entre a visão dos diferentes sócios.",
    "aberta": true
  },
  {
    "id": "AB-SD-NEG-02",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Direção estratégica",
    "indicador": "Desafio central",
    "indicador_codigo": null,
    "classificacao": "Bloco aberto",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_longa",
    "pergunta": "Qual é hoje o principal desafio para a empresa alcançar seus objetivos estratégicos?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": "Identificar a barreira percebida como mais crítica e confrontá-la com os indicadores quantitativos.",
    "aberta": true
  },
  {
    "id": "AB-SD-NEG-03",
    "publico": "socios",
    "sistema": "Negócios",
    "objetivo": "Mercado e referências",
    "indicador": "Referências estratégicas",
    "indicador_codigo": null,
    "classificacao": "Bloco aberto",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_longa",
    "pergunta": "Quais empresas você considera referência para o negócio e o que, especificamente, podemos aprender com cada uma delas?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": false,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": "Mapear referências, modelos mentais e oportunidades de aprendizagem ou diferenciação.",
    "aberta": true
  },
  {
    "id": "AB-SD-PES-01",
    "publico": "socios",
    "sistema": "Pessoas",
    "objetivo": "Liderança e gestão de pessoas",
    "indicador": "Desafio central de pessoas",
    "indicador_codigo": null,
    "classificacao": "Bloco aberto",
    "subperfil": "todos",
    "score_family": "none",
    "response_type": "aberta_longa",
    "pergunta": "Qual é hoje o maior desafio relacionado à liderança e à gestão de pessoas?",
    "opcoes": [],
    "max_escolhas": null,
    "obrigatoria": true,
    "pontua_maturidade": false,
    "regra_condicional": null,
    "uso_relatorio": "Identificar a causa humana percebida como mais crítica e orientar as trilhas de liderança e pessoas.",
    "aberta": true
  }
];

export const MATRIZ_INDICADORES = [
  {
    "codigo": "MAR-01",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Clareza da identidade e do propósito",
    "mede": "Compreensão de quem a empresa é, por que existe e qual valor busca gerar."
  },
  {
    "codigo": "MAR-02",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Diferenciação",
    "mede": "Clareza e percepção do diferencial diante das alternativas do mercado."
  },
  {
    "codigo": "MAR-03",
    "sistema": "Marca",
    "objetivo": "Promessa",
    "indicador": "Promessa e entrega",
    "mede": "Coerência entre a promessa da marca e a experiência efetivamente entregue."
  },
  {
    "codigo": "MAR-04",
    "sistema": "Marca",
    "objetivo": "Valores e cultura",
    "indicador": "Vivência dos valores",
    "mede": "Presença dos valores nas decisões, atitudes e relações."
  },
  {
    "codigo": "MAR-05",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Reputação e confiança",
    "mede": "Força da reputação e confiança gerada nos públicos."
  },
  {
    "codigo": "MAR-06",
    "sistema": "Marca",
    "objetivo": "Coerência cultural",
    "indicador": "Consistência da identidade",
    "mede": "Consistência da identidade entre áreas, lideranças, profissionais e pontos de contato."
  },
  {
    "codigo": "NEG-01",
    "sistema": "Negócios",
    "objetivo": "Direção estratégica",
    "indicador": "Clareza de direção e prioridades",
    "mede": "Existência e compreensão de objetivos e prioridades estratégicas."
  },
  {
    "codigo": "NEG-02",
    "sistema": "Negócios",
    "objetivo": "Cliente e proposta de valor",
    "indicador": "Conhecimento do cliente",
    "mede": "Compreensão dos clientes prioritários, suas necessidades e critérios de decisão."
  },
  {
    "codigo": "NEG-03",
    "sistema": "Negócios",
    "objetivo": "Cliente e proposta de valor",
    "indicador": "Valor entregue",
    "mede": "Relevância da solução e capacidade de gerar valor percebido."
  },
  {
    "codigo": "NEG-04",
    "sistema": "Negócios",
    "objetivo": "Mercado",
    "indicador": "Concorrência e adaptação",
    "mede": "Conhecimento das alternativas do mercado e capacidade de adaptação."
  },
  {
    "codigo": "NEG-05",
    "sistema": "Negócios",
    "objetivo": "Execução",
    "indicador": "Processos e gestão",
    "mede": "Estrutura de processos, recursos, indicadores e acompanhamento."
  },
  {
    "codigo": "NEG-06",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Resultados e capacidade de crescer",
    "mede": "Consistência dos resultados e capacidade de crescer sem perda de controle ou qualidade."
  },
  {
    "codigo": "COM-01",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna e relacional",
    "indicador": "Clareza e oportunidade",
    "mede": "Informações claras, compreensíveis e fornecidas no momento adequado."
  },
  {
    "codigo": "COM-02",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna e relacional",
    "indicador": "Transparência",
    "mede": "Transparência sobre decisões, condições, mudanças, riscos e problemas."
  },
  {
    "codigo": "COM-03",
    "sistema": "Comunicação",
    "objetivo": "Mensagem de valor",
    "indicador": "Clareza da mensagem externa",
    "mede": "Capacidade de explicar o que a empresa oferece, para quem e por que é relevante."
  },
  {
    "codigo": "COM-04",
    "sistema": "Comunicação",
    "objetivo": "Coerência",
    "indicador": "Consistência entre canais e pessoas",
    "mede": "Consistência da mensagem entre canais, propostas, áreas e profissionais."
  },
  {
    "codigo": "COM-05",
    "sistema": "Comunicação",
    "objetivo": "Relacionamento",
    "indicador": "Comunicação durante a jornada",
    "mede": "Qualidade da comunicação durante as etapas do relacionamento e da entrega."
  },
  {
    "codigo": "COM-06",
    "sistema": "Comunicação",
    "objetivo": "Escuta",
    "indicador": "Feedback e melhoria",
    "mede": "Capacidade de ouvir públicos e transformar feedbacks em melhoria."
  },
  {
    "codigo": "PES-01",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Direção e coordenação",
    "mede": "Capacidade das lideranças e profissionais de orientar e conduzir o trabalho."
  },
  {
    "codigo": "PES-02",
    "sistema": "Pessoas",
    "objetivo": "Estrutura e autonomia",
    "indicador": "Clareza de papéis e autonomia",
    "mede": "Clareza de papéis, responsabilidades e autonomia para decidir."
  },
  {
    "codigo": "PES-03",
    "sistema": "Pessoas",
    "objetivo": "Competências",
    "indicador": "Preparo técnico e comportamental",
    "mede": "Conhecimentos, habilidades e comportamentos necessários para a entrega."
  },
  {
    "codigo": "PES-04",
    "sistema": "Pessoas",
    "objetivo": "Desenvolvimento",
    "indicador": "Feedback e desenvolvimento",
    "mede": "Existência de orientação, feedback e aprendizagem para evolução das pessoas."
  },
  {
    "codigo": "PES-05",
    "sistema": "Pessoas",
    "objetivo": "Colaboração",
    "indicador": "Integração entre pessoas e áreas",
    "mede": "Colaboração, compartilhamento de informações e integração."
  },
  {
    "codigo": "PES-06",
    "sistema": "Pessoas",
    "objetivo": "Performance",
    "indicador": "Responsabilidade por resultados",
    "mede": "Responsabilização por decisões, compromissos, qualidade e resolução."
  }
];
