// =====================================================================
// GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.
// Fonte: data/identidade/banco_mvp_v1.xlsx (aba Banco_Completo_Anotado).
// Regenerar: node scripts/build-identidade-catalog.cjs
// Total de perguntas: 222
// =====================================================================

/** @typedef {Object} PerguntaIdentidade */
export const CATALOGO_IDENTIDADE = [
  {
    "id": "CL-COM-001",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Clareza e oportunidade",
    "indicador_canonico": "comunicacao.interna_clareza",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 20,
    "response_type": "escala4_frequencia",
    "pergunta": "Recebo as informações necessárias com clareza e no momento adequado.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-COM-002",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Transparência",
    "indicador_canonico": "comunicacao.transparencia",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 21,
    "response_type": "escala4_frequencia",
    "pergunta": "Decisões, mudanças e prioridades são comunicadas com transparência.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-COM-003",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Adequação dos canais",
    "indicador_canonico": "comunicacao.canais_adequacao",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "Os canais utilizados facilitam o acesso às informações importantes.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "CL-COM-004",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Comunicação entre áreas",
    "indicador_canonico": "comunicacao.entre_areas",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 22,
    "response_type": "escala4_frequencia",
    "pergunta": "A comunicação entre áreas funciona de forma clara e colaborativa.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-COM-005",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Escuta",
    "indicador_canonico": "comunicacao.escuta_interna",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 23,
    "response_type": "escala4_frequencia",
    "pergunta": "Minha opinião é ouvida e considerada quando pode contribuir para decisões ou melhorias.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-COM-006",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação da liderança",
    "indicador": "As lideranças comunicam expectativas e decisões de maneira consistente.",
    "indicador_canonico": "comunicacao.lideranca_consistencia",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 24,
    "response_type": "escala4_frequencia",
    "pergunta": "As lideranças comunicam expectativas e decisões de maneira consistente.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": "correção: colunas deslocadas no banco original"
  },
  {
    "id": "CL-COM-007",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação externa",
    "indicador": "Clareza da mensagem externa",
    "indicador_canonico": "comunicacao.externa_clareza_mensagem",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 25,
    "response_type": "escala4_concordancia",
    "pergunta": "Consigo explicar com clareza o que a empresa faz, para quem e por que é diferente.",
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
    "observacao": ""
  },
  {
    "id": "CL-COM-008",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação externa",
    "indicador": "Coerência da comunicação",
    "indicador_canonico": "comunicacao.externa_fidelidade",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 26,
    "response_type": "escala4_concordancia",
    "pergunta": "A comunicação externa representa com fidelidade a realidade da empresa e da entrega.",
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
    "observacao": ""
  },
  {
    "id": "CL-COM-009",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Experiência e relacionamento",
    "indicador": "Feedback do cliente",
    "indicador_canonico": "comunicacao.uso_feedback",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 27,
    "response_type": "escala4_frequencia",
    "pergunta": "Os feedbacks de clientes chegam às áreas envolvidas e geram aprendizado.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-COM-010",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Satisfação",
    "indicador": "Satisfação com comunicação interna",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com a comunicação interna da empresa?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-COM-011",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Desafios",
    "indicador": "Problemas de comunicação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais problemas mais prejudicam a comunicação? Selecione até três.",
    "opcoes": [
      "Informação atrasada",
      "Falta de clareza",
      "Excesso de mensagens",
      "Falta de transparência",
      "Ruído entre áreas",
      "Centralização",
      "Canais inadequados",
      "Reuniões improdutivas",
      "Falta de escuta",
      "Lideranças desalinhadas",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "CL-COM-012",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Síntese",
    "indicador": "Informação ausente",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Qual informação importante você sente falta de receber?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-MAR-001",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Imagem espontânea",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quando você pensa na empresa, quais são as três primeiras palavras que vêm à sua mente?",
    "opcoes": [
      "3 palavras"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "CL-MAR-002",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Conhecimento do propósito",
    "indicador_canonico": "marca.proposito_clareza",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 5,
    "response_type": "escala4_concordancia",
    "pergunta": "Eu conheço claramente o propósito da empresa.",
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
    "observacao": ""
  },
  {
    "id": "CL-MAR-003",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Conexão com propósito",
    "indicador_canonico": "marca.proposito_conexao",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "Percebo como meu trabalho contribui para o propósito e para o valor entregue pela empresa.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "CL-MAR-004",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Valores e cultura",
    "indicador": "Conhecimento dos valores",
    "indicador_canonico": "marca.valores_conhecimento",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "Eu conheço os valores que orientam a empresa.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "CL-MAR-005",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Valores e cultura",
    "indicador": "Vivência dos valores",
    "indicador_canonico": "marca.valores_vividos",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 6,
    "response_type": "escala4_frequencia",
    "pergunta": "Os valores da empresa são vividos nas decisões e atitudes do dia a dia.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-MAR-006",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Valores e cultura",
    "indicador": "Valor mais forte",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "selecao_unica",
    "pergunta": "Qual valor da empresa é mais percebido na prática?",
    "opcoes": [
      "Lista de valores cadastrados pelos sócios + Outro + Não sei"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-MAR-007",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Valores e cultura",
    "indicador": "Valor a fortalecer",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "selecao_unica",
    "pergunta": "Qual valor mais precisa ser fortalecido na prática?",
    "opcoes": [
      "Lista de valores cadastrados pelos sócios + Outro + Não sei"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-MAR-008",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Conhecimento da diferenciação",
    "indicador_canonico": "marca.diferenciacao_clareza",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 7,
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
    "observacao": ""
  },
  {
    "id": "CL-MAR-009",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Concorrentes percebidos",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais empresas ou alternativas você considera os principais concorrentes? Informe até três.",
    "opcoes": [
      "Até 3 nomes"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "CL-MAR-010",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Força da imagem",
    "indicador_canonico": "marca.reputacao",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 8,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa possui uma imagem forte e respeitada no mercado.",
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
    "observacao": ""
  },
  {
    "id": "CL-MAR-011",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Cultura e marca empregadora",
    "indicador": "Coerência interna e externa",
    "indicador_canonico": "marca.coerencia_identitaria",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 9,
    "response_type": "escala4_concordancia",
    "pergunta": "O que a empresa comunica para fora combina com o que é vivido internamente.",
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
    "observacao": ""
  },
  {
    "id": "CL-MAR-012",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Cultura e marca empregadora",
    "indicador": "Orgulho",
    "indicador_canonico": "marca.orgulho",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 10,
    "response_type": "escala4_concordancia",
    "pergunta": "Eu sinto orgulho de trabalhar nesta empresa.",
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
    "observacao": ""
  },
  {
    "id": "CL-MAR-013",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Cultura e marca empregadora",
    "indicador": "Pertencimento",
    "indicador_canonico": "marca.pertencimento",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 11,
    "response_type": "escala4_concordancia",
    "pergunta": "Eu me sinto parte da empresa e reconheço minha contribuição para o que ela representa.",
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
    "observacao": ""
  },
  {
    "id": "CL-MAR-014",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Cultura e marca empregadora",
    "indicador": "eNPS",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "nps",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 12,
    "response_type": "escala_0_10_nps",
    "pergunta": "De 0 a 10, o quanto você recomendaria esta empresa como um bom lugar para trabalhar?",
    "opcoes": [
      "0 = De forma alguma",
      "10 = Com certeza"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-MAR-015",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Síntese",
    "indicador": "Incoerência percebida",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Qual é a principal incoerência entre o que a empresa diz ser e o que você vivencia no dia a dia?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-NEG-001",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Direção estratégica",
    "indicador": "Clareza da direção",
    "indicador_canonico": "negocios.direcao_clareza",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 13,
    "response_type": "escala4_concordancia",
    "pergunta": "Eu compreendo as principais prioridades e a direção de crescimento da empresa.",
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
    "observacao": ""
  },
  {
    "id": "CL-NEG-002",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Direção estratégica",
    "indicador": "Clareza de metas",
    "indicador_canonico": "negocios.metas_clareza",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 14,
    "response_type": "escala4_concordancia",
    "pergunta": "As metas e resultados esperados da minha área são claros.",
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
    "observacao": ""
  },
  {
    "id": "CL-NEG-003",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Oferta e cliente",
    "indicador": "Proposta de valor",
    "indicador_canonico": "negocios.proposta_valor_clareza",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 15,
    "response_type": "escala4_concordancia",
    "pergunta": "Eu compreendo o valor que a empresa entrega aos clientes.",
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
    "observacao": ""
  },
  {
    "id": "CL-NEG-004",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Oferta e cliente",
    "indicador": "Cliente prioritário",
    "indicador_canonico": "negocios.cliente_prioritario",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 16,
    "response_type": "escala4_concordancia",
    "pergunta": "Eu compreendo quais perfis de clientes são prioritários para a empresa.",
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
    "observacao": ""
  },
  {
    "id": "CL-NEG-005",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e concorrência",
    "indicador": "Conhecimento competitivo",
    "indicador_canonico": "negocios.conhecimento_competitivo",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 17,
    "response_type": "escala4_concordancia",
    "pergunta": "Conheço os principais concorrentes e alternativas que disputam os mesmos clientes.",
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
    "observacao": ""
  },
  {
    "id": "CL-NEG-006",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e concorrência",
    "indicador": "Forças dos concorrentes",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Em quais aspectos os concorrentes parecem superiores? Selecione até três.",
    "opcoes": [
      "Preço",
      "Qualidade",
      "Atendimento",
      "Marca/reputação",
      "Especialização",
      "Inovação",
      "Agilidade",
      "Conveniência",
      "Presença digital",
      "Relacionamento",
      "Experiência",
      "Escala/capacidade",
      "Não sei",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "CL-NEG-007",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e concorrência",
    "indicador": "Forças da empresa",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Em quais aspectos a empresa parece superior aos concorrentes? Selecione até três.",
    "opcoes": [
      "Preço",
      "Qualidade",
      "Atendimento",
      "Marca/reputação",
      "Especialização",
      "Inovação",
      "Agilidade",
      "Conveniência",
      "Presença digital",
      "Relacionamento",
      "Experiência",
      "Capacidade de resolver problemas",
      "Não sei",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "CL-NEG-008",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Processos e execução",
    "indicador": "Processos",
    "indicador_canonico": "negocios.processos",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 18,
    "response_type": "escala4_concordancia",
    "pergunta": "Os processos de trabalho ajudam a equipe a entregar com qualidade e produtividade.",
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
    "observacao": ""
  },
  {
    "id": "CL-NEG-009",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Processos e execução",
    "indicador": "Recursos",
    "indicador_canonico": "negocios.recursos",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "A equipe possui informações, ferramentas e recursos suficientes para realizar o trabalho.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "CL-NEG-010",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Processos e execução",
    "indicador": "Acompanhamento",
    "indicador_canonico": "negocios.acompanhamento_resultados",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_frequencia",
    "pergunta": "Os resultados são acompanhados e os desvios geram ações de melhoria.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "CL-NEG-011",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Crescimento",
    "indicador": "Capacidade de crescer",
    "indicador_canonico": "negocios.escalabilidade",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 19,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa está preparada para crescer sem perder qualidade, controle e agilidade.",
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
    "observacao": ""
  },
  {
    "id": "CL-NEG-012",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Satisfação com resultados da empresa",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com os resultados gerais da empresa?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-NEG-013",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Satisfação com resultados da área",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com os resultados da sua área?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-NEG-014",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Prioridades",
    "indicador": "Barreiras ao crescimento",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais fatores mais limitam hoje os resultados e o crescimento? Selecione até três.",
    "opcoes": [
      "Falta de direção",
      "Processos",
      "Pessoas/competências",
      "Liderança",
      "Comunicação",
      "Vendas",
      "Marketing/posicionamento",
      "Tecnologia",
      "Recursos financeiros",
      "Excesso de centralização",
      "Falta de inovação",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "CL-NEG-015",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Síntese",
    "indicador": "Barreira não prevista",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Existe alguma barreira importante aos resultados que não apareceu nas opções anteriores? Qual?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PER-001",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Área",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 1,
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
    "observacao": ""
  },
  {
    "id": "CL-PER-002",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Papel",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 2,
    "response_type": "selecao_unica",
    "pergunta": "Você possui responsabilidade formal de liderança de pessoas?",
    "opcoes": [
      "Sim",
      "Não",
      "Prefiro não informar"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PER-003",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Tempo de empresa",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 3,
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
    "observacao": ""
  },
  {
    "id": "CL-PER-004",
    "publico": "colaboradores",
    "subperfil": "lider",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Tempo de liderança",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 4,
    "response_type": "selecao_unica",
    "pergunta": "Há quanto tempo você exerce função de liderança nesta empresa?",
    "opcoes": [
      "Menos de 6 meses",
      "6 a 12 meses",
      "1 a 3 anos",
      "3 a 5 anos",
      "Mais de 5 anos"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-001",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Experiência de trabalho",
    "indicador": "Satisfação geral",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação em trabalhar nesta empresa?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-002",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Experiência de trabalho",
    "indicador": "Motivação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "Como você avalia sua motivação para realizar seu trabalho atualmente?",
    "opcoes": [
      "0 = Sem motivação",
      "10 = Muito motivado(a)"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-003",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Experiência de trabalho",
    "indicador": "Satisfação com a função",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com sua função e atividades atuais?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-004",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Experiência de trabalho",
    "indicador": "Autenticidade e segurança",
    "indicador_canonico": "pessoas.seguranca_psicologica",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "Sinto que posso ser autêntico(a), discordar e apontar problemas sem medo de retaliação.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "CL-PES-005",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Estrutura e papéis",
    "indicador": "Clareza do papel",
    "indicador_canonico": "pessoas.papeis_clareza",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 28,
    "response_type": "escala4_concordancia",
    "pergunta": "Meu papel, minhas responsabilidades e os resultados esperados são claros.",
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
    "observacao": ""
  },
  {
    "id": "CL-PES-006",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Direção",
    "indicador_canonico": "pessoas.lideranca_direcao",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 29,
    "response_type": "escala4_frequencia",
    "pergunta": "Minha liderança orienta prioridades e expectativas com clareza.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-007",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Feedback",
    "indicador_canonico": "pessoas.lideranca_feedback",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 30,
    "response_type": "escala4_frequencia",
    "pergunta": "Minha liderança oferece feedback útil e consistente sobre meu trabalho.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-008",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Desenvolvimento",
    "indicador_canonico": "pessoas.lideranca_desenvolve_equipe",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 31,
    "response_type": "escala4_frequencia",
    "pergunta": "Minha liderança contribui para meu desenvolvimento profissional.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-009",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Satisfação com liderança",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com sua liderança imediata?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-010",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Autonomia",
    "indicador": "Autonomia para decidir",
    "indicador_canonico": "pessoas.autonomia_nivel",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 32,
    "response_type": "escala4_concordancia",
    "pergunta": "Tenho autonomia compatível com minhas responsabilidades.",
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
    "observacao": ""
  },
  {
    "id": "CL-PES-011",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Competências e desenvolvimento",
    "indicador": "Competência para a função",
    "indicador_canonico": "pessoas.competencia_funcao",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 33,
    "response_type": "escala4_concordancia",
    "pergunta": "Possuo conhecimentos, habilidades e recursos para desempenhar bem minha função.",
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
    "observacao": ""
  },
  {
    "id": "CL-PES-012",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Competências e desenvolvimento",
    "indicador": "Oportunidades de desenvolvimento",
    "indicador_canonico": "pessoas.desenvolvimento_oferta",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 34,
    "response_type": "escala4_frequencia",
    "pergunta": "A empresa oferece oportunidades adequadas de aprendizagem e desenvolvimento.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-013",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Colaboração",
    "indicador": "Relacionamento da equipe",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com o relacionamento na equipe?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-014",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Colaboração",
    "indicador": "Integração entre áreas",
    "indicador_canonico": "pessoas.colaboracao",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 35,
    "response_type": "escala4_frequencia",
    "pergunta": "As áreas colaboram entre si para resolver problemas e alcançar melhores resultados.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-015",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Performance",
    "indicador": "Responsabilidade por resultados",
    "indicador_canonico": "pessoas.performance_resultados",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 36,
    "response_type": "escala4_frequencia",
    "pergunta": "As pessoas assumem responsabilidade por suas decisões, compromissos e entregas.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-016",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Reconhecimento",
    "indicador": "Reconhecimento justo",
    "indicador_canonico": "pessoas.reconhecimento",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 37,
    "response_type": "escala4_frequencia",
    "pergunta": "O bom desempenho e os comportamentos alinhados são reconhecidos de forma justa.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-017",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Condições de trabalho",
    "indicador": "Benefícios",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com os benefícios oferecidos?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-018",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Condições de trabalho",
    "indicador": "Carga sustentável",
    "indicador_canonico": "pessoas.carga_sustentavel",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "A carga de trabalho é compatível com o tempo, os recursos e as prioridades disponíveis.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "CL-PES-019",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Retenção",
    "indicador": "Motivos de permanência",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais fatores mais contribuem para você permanecer na empresa? Selecione até três.",
    "opcoes": [
      "Trabalho realizado",
      "Propósito",
      "Cultura",
      "Liderança",
      "Equipe",
      "Reconhecimento",
      "Desenvolvimento",
      "Remuneração",
      "Benefícios",
      "Estabilidade",
      "Flexibilidade",
      "Autonomia",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "CL-PES-020",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Retenção",
    "indicador": "Riscos de saída",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais fatores poderiam levar você a deixar a empresa? Selecione até três.",
    "opcoes": [
      "Liderança",
      "Falta de reconhecimento",
      "Remuneração",
      "Benefícios",
      "Sobrecarga",
      "Falta de crescimento",
      "Cultura",
      "Conflitos",
      "Falta de autonomia",
      "Falta de propósito",
      "Outra oportunidade",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "CL-PES-021",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Síntese",
    "indicador": "Barreiras à entrega",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais fatores mais dificultam sua entrega de resultados? Selecione até três.",
    "opcoes": [
      "Prioridades pouco claras",
      "Processos",
      "Sistemas/ferramentas",
      "Falta de informação",
      "Sobrecarga",
      "Falta de autonomia",
      "Falta de conhecimento",
      "Comunicação entre áreas",
      "Decisões lentas",
      "Conflitos",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "CL-PES-022",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Síntese",
    "indicador": "Mudança prioritária",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Qual mudança teria maior impacto positivo sobre sua experiência e seus resultados?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-L01",
    "publico": "colaboradores",
    "subperfil": "lider",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Feedback da direção",
    "indicador_canonico": "pessoas.lider_recebe_feedback",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 38,
    "response_type": "escala4_frequencia",
    "pergunta": "Recebo feedback consistente da direção sobre minha atuação como líder.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-L02",
    "publico": "colaboradores",
    "subperfil": "lider",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Autoridade para decidir",
    "indicador_canonico": "pessoas.lider_autoridade",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 39,
    "response_type": "escala4_concordancia",
    "pergunta": "Tenho autoridade suficiente para tomar as decisões esperadas da minha função.",
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
    "observacao": ""
  },
  {
    "id": "CL-PES-L03",
    "publico": "colaboradores",
    "subperfil": "lider",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Delegação",
    "indicador_canonico": "pessoas.lider_delegacao",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 40,
    "response_type": "escala4_frequencia",
    "pergunta": "Delego responsabilidades com clareza e acompanho sem centralizar excessivamente.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-L04",
    "publico": "colaboradores",
    "subperfil": "lider",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Gestão de conflitos",
    "indicador_canonico": "pessoas.lider_conflitos",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 41,
    "response_type": "escala4_frequencia",
    "pergunta": "Consigo antecipar e conduzir conflitos de maneira construtiva.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-L05",
    "publico": "colaboradores",
    "subperfil": "lider",
    "sistema": "Pessoas",
    "objetivo": "Performance",
    "indicador": "Gestão de desempenho",
    "indicador_canonico": "pessoas.lider_gestao_desempenho",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 42,
    "response_type": "escala4_frequencia",
    "pergunta": "Acompanho o desempenho da equipe com metas, conversas e planos de melhoria.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "CL-PES-L06",
    "publico": "colaboradores",
    "subperfil": "lider",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Satisfação com papel de líder",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com as condições para exercer sua função de liderança?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-COM-001",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação externa",
    "indicador": "Clareza da oferta",
    "indicador_canonico": "comunicacao.externa_clareza_mensagem",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 20,
    "response_type": "escala4_concordancia",
    "pergunta": "A comunicação deixa claro o que a empresa oferece e para quem suas soluções são indicadas.",
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
    "observacao": ""
  },
  {
    "id": "EX-COM-002",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação externa",
    "indicador": "Clareza do valor",
    "indicador_canonico": "comunicacao.externa_clareza_valor",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "A comunicação ajuda a compreender os benefícios e diferenciais da empresa.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "EX-COM-003",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação externa",
    "indicador": "Consistência",
    "indicador_canonico": "comunicacao.consistencia_canais",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 21,
    "response_type": "escala4_concordancia",
    "pergunta": "A mensagem é consistente entre canais, propostas, profissionais e experiência entregue.",
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
    "observacao": ""
  },
  {
    "id": "EX-COM-004",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Relacionamento",
    "indicador": "Facilidade de contato",
    "indicador_canonico": "comunicacao.contato_facilidade",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 22,
    "response_type": "escala4_concordancia",
    "pergunta": "É fácil localizar o canal correto e entrar em contato com a empresa.",
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
    "observacao": ""
  },
  {
    "id": "EX-COM-005",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Relacionamento",
    "indicador": "Agilidade da resposta",
    "indicador_canonico": "comunicacao.resposta_agilidade",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 23,
    "response_type": "escala4_concordancia",
    "pergunta": "As respostas são claras e fornecidas no prazo adequado.",
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
    "observacao": ""
  },
  {
    "id": "EX-COM-006",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Relacionamento",
    "indicador": "Transparência",
    "indicador_canonico": "comunicacao.transparencia",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 24,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa comunica prazos, condições, mudanças e problemas com transparência.",
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
    "observacao": ""
  },
  {
    "id": "EX-COM-007",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Marketing e conteúdo",
    "indicador": "Utilidade do conteúdo",
    "indicador_canonico": "comunicacao.conteudo_utilidade",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "Os conteúdos e informações da empresa são úteis para compreender soluções, tendências ou decisões.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "EX-COM-008",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Escuta",
    "indicador": "A empresa demonstra ouvir sugestões, dúvidas e reclamações.",
    "indicador_canonico": "comunicacao.escuta_cliente",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 25,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa demonstra ouvir sugestões, dúvidas e reclamações.",
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
    "observacao": "correção: colunas deslocadas no banco original"
  },
  {
    "id": "EX-COM-009",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Satisfação",
    "indicador": "Satisfação com comunicação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com a comunicação da empresa?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-COM-010",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Síntese",
    "indicador": "Ponto de atrito",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "selecao_unica",
    "pergunta": "Em qual ponto da comunicação existe maior dificuldade?",
    "opcoes": [
      "Encontrar informações",
      "Primeiro contato",
      "Entender a solução",
      "Proposta/negociação",
      "Alinhamento durante a entrega",
      "Suporte",
      "Cobrança",
      "Pós-venda",
      "Comunicação com fornecedores",
      "Não há dificuldade",
      "Outro"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-COM-011",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Síntese",
    "indicador": "Feedback não tratado",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Existe alguma sugestão, dúvida ou reclamação que não foi adequadamente tratada? Conte brevemente.",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-MAR-001",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e imagem",
    "indicador": "Imagem espontânea",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais são as três primeiras palavras que vêm à sua mente quando pensa nesta empresa?",
    "opcoes": [
      "3 palavras"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "EX-MAR-002",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e imagem",
    "indicador": "Personalidade percebida",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais características melhor descrevem a personalidade desta empresa? Selecione até cinco.",
    "opcoes": [
      "Confiável",
      "Próxima",
      "Inovadora",
      "Especialista",
      "Ágil",
      "Humana",
      "Ousada",
      "Tradicional",
      "Sofisticada",
      "Prática",
      "Inspiradora",
      "Responsável",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "EX-MAR-003",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Clareza da diferenciação",
    "indicador_canonico": "marca.diferenciacao_clareza",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 6,
    "response_type": "escala4_concordancia",
    "pergunta": "Percebo claramente o que diferencia esta empresa das demais alternativas.",
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
    "observacao": ""
  },
  {
    "id": "EX-MAR-004",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Diferencial percebido",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais fatores mais diferenciam esta empresa? Selecione até três.",
    "opcoes": [
      "Confiança",
      "Relacionamento",
      "Qualidade técnica",
      "Atendimento",
      "Especialização",
      "Reputação",
      "Resultado entregue",
      "Agilidade",
      "Conveniência",
      "Inovação",
      "Personalização",
      "Preço",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "EX-MAR-005",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Reputação",
    "indicador_canonico": "marca.reputacao",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 7,
    "response_type": "escala4_concordancia",
    "pergunta": "Esta empresa possui uma reputação sólida e positiva.",
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
    "observacao": ""
  },
  {
    "id": "EX-MAR-006",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Confiança",
    "indicador_canonico": "marca.confianca_promessa",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 8,
    "response_type": "escala4_concordancia",
    "pergunta": "Confio que esta empresa cumpre o que promete.",
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
    "observacao": ""
  },
  {
    "id": "EX-MAR-007",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Valores e coerência",
    "indicador": "Coerência",
    "indicador_canonico": "marca.coerencia_identitaria",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 9,
    "response_type": "escala4_concordancia",
    "pergunta": "Percebo coerência entre o discurso da empresa e a forma como ela atua.",
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
    "observacao": ""
  },
  {
    "id": "EX-MAR-008",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Valores e coerência",
    "indicador": "Valores percebidos",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais valores você mais percebe na atuação da empresa? Selecione até três.",
    "opcoes": [
      "Confiança",
      "Transparência",
      "Respeito",
      "Qualidade",
      "Inovação",
      "Proximidade",
      "Responsabilidade",
      "Agilidade",
      "Ética",
      "Excelência",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "EX-MAR-009",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Consistência entre pessoas",
    "indicador_canonico": "marca.consistencia_representacao",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 10,
    "response_type": "escala4_concordancia",
    "pergunta": "Diferentes profissionais da empresa representam a marca de forma consistente.",
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
    "observacao": ""
  },
  {
    "id": "EX-MAR-010",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Satisfação com a marca",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com a imagem e a reputação desta empresa?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-MAR-011",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "NPS",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "nps",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 11,
    "response_type": "escala_0_10_nps",
    "pergunta": "De 0 a 10, o quanto você recomendaria esta empresa para alguém?",
    "opcoes": [
      "0 = De forma alguma",
      "10 = Com certeza"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-MAR-012",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Síntese",
    "indicador": "Apresentação espontânea",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Como você apresentaria esta empresa em poucas palavras para alguém da sua rede?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-MAR-N1",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Clareza do propósito (percebida)",
    "indicador_canonico": "marca.proposito_clareza",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 12,
    "response_type": "escala4_concordancia",
    "pergunta": "Entendo claramente o motivo de existir desta empresa, além dos produtos ou serviços que ela vende.",
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
    "observacao": "nova (MVP v1) — promove proposito_clareza para [3P]"
  },
  {
    "id": "EX-NEG-001",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Negócios",
    "objetivo": "Necessidade e escolha",
    "indicador": "Necessidade de origem",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Que problema, necessidade ou objetivo levou você a procurar esse tipo de solução?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-NEG-002",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Negócios",
    "objetivo": "Necessidade e escolha",
    "indicador": "Razões de escolha",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais fatores mais influenciaram sua decisão de escolher ou considerar esta empresa? Selecione até três.",
    "opcoes": [
      "Confiança",
      "Reputação",
      "Atendimento",
      "Qualidade técnica",
      "Especialização",
      "Resultado esperado",
      "Indicação",
      "Relacionamento",
      "Clareza da proposta",
      "Preço",
      "Conveniência",
      "Experiência anterior",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "EX-NEG-003",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Negócios",
    "objetivo": "Mercado e concorrência",
    "indicador": "Alternativas consideradas",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais outras empresas ou alternativas você avaliou antes de escolher?",
    "opcoes": [
      "Concorrentes cadastrados pelos sócios + Outro + Nenhuma"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "EX-NEG-004",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Negócios",
    "objetivo": "Mercado e concorrência",
    "indicador": "Alternativa substituta",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "selecao_unica",
    "pergunta": "Se não pudesse contratar esta empresa, qual alternativa escolheria?",
    "opcoes": [
      "Concorrentes cadastrados pelos sócios + Fazer internamente",
      "Adiar a decisão",
      "Não contratar",
      "Outro"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-NEG-005",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Negócios",
    "objetivo": "Valor e resultados",
    "indicador": "Resultado entregue",
    "indicador_canonico": "negocios.resultado_entregue",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 13,
    "response_type": "escala4_concordancia",
    "pergunta": "A solução entregue atendeu ao problema, necessidade ou resultado esperado.",
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
    "observacao": ""
  },
  {
    "id": "EX-NEG-006",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Negócios",
    "objetivo": "Valor e resultados",
    "indicador": "Satisfação com resultado",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com a experiência ou o resultado entregue?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-NEG-007",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Negócios",
    "objetivo": "Valor e resultados",
    "indicador": "Preço e benefício",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "ordinal_index",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "selecao_unica",
    "pergunta": "Como você avalia o preço em relação ao benefício entregue?",
    "opcoes": [
      "Preço abaixo do valor entregue",
      "Preço justo pelo valor entregue",
      "Preço elevado, mas vale o investimento",
      "Preço alto para a entrega atual",
      "Não sei avaliar"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-NEG-008",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Entrega e operação",
    "indicador": "Confiabilidade",
    "indicador_canonico": "negocios.confiabilidade_entrega",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 14,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa cumpre os compromissos assumidos com qualidade e previsibilidade.",
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
    "observacao": ""
  },
  {
    "id": "EX-NEG-009",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Entrega e operação",
    "indicador": "Agilidade",
    "indicador_canonico": "negocios.agilidade",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 15,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa responde e resolve demandas com agilidade adequada.",
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
    "observacao": ""
  },
  {
    "id": "EX-NEG-010",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Negócios",
    "objetivo": "Entrega e operação",
    "indicador": "Personalização",
    "indicador_canonico": "negocios.personalizacao",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 16,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa compreende o contexto e adapta a solução às necessidades relevantes.",
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
    "observacao": ""
  },
  {
    "id": "EX-NEG-011",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Negócios",
    "objetivo": "Continuidade",
    "indicador": "Recompra/renovação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "nps",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 17,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é a probabilidade de voltar a contratar ou renovar com esta empresa?",
    "opcoes": [
      "0 = De forma alguma",
      "10 = Com certeza"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-NEG-012",
    "publico": "clientes",
    "subperfil": "fornecedor",
    "sistema": "Negócios",
    "objetivo": "Relação com fornecedores",
    "indicador": "Organização da demanda",
    "indicador_canonico": "negocios.organizacao_demanda",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 18,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa organiza demandas, prazos e informações de maneira adequada para seus fornecedores e parceiros.",
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
    "observacao": ""
  },
  {
    "id": "EX-NEG-013",
    "publico": "clientes",
    "subperfil": "fornecedor",
    "sistema": "Negócios",
    "objetivo": "Relação com fornecedores",
    "indicador": "Cumprimento de compromissos",
    "indicador_canonico": "negocios.confiabilidade_entrega",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 19,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa cumpre os compromissos comerciais e financeiros estabelecidos com fornecedores e parceiros.",
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
    "observacao": ""
  },
  {
    "id": "EX-NEG-014",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Comparação competitiva",
    "indicador": "Aspecto a melhorar",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Em qual aspecto outra empresa ou alternativa é melhor do que esta?",
    "opcoes": [
      "Preço",
      "Qualidade",
      "Atendimento",
      "Especialização",
      "Inovação",
      "Agilidade",
      "Conveniência",
      "Comunicação",
      "Experiência",
      "Tecnologia",
      "Não identifico",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "EX-PER-001",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Relação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 1,
    "response_type": "selecao_unica",
    "pergunta": "Qual é sua relação principal com a empresa?",
    "opcoes": [
      "Cliente atual",
      "Ex-cliente",
      "Potencial cliente",
      "Fornecedor",
      "Parceiro",
      "Outro"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-PER-002",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Tempo de relação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 2,
    "response_type": "selecao_unica",
    "pergunta": "Há quanto tempo você conhece ou se relaciona com a empresa?",
    "opcoes": [
      "Menos de 3 meses",
      "3 a 12 meses",
      "1 a 3 anos",
      "Mais de 3 anos",
      "Ainda não houve contratação"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-PER-003",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Identificação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": 3,
    "response_type": "texto_curto",
    "pergunta": "Nome ou identificação do respondente.",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-PER-004",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Segmentação",
    "indicador": "Cargo/relação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": 4,
    "response_type": "texto_curto",
    "pergunta": "Qual é seu cargo, profissão ou área de atuação?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-PER-005",
    "publico": "clientes",
    "subperfil": "cliente",
    "sistema": "Perfil",
    "objetivo": "Origem",
    "indicador": "Canal de origem",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 5,
    "response_type": "selecao_unica",
    "pergunta": "Como você conheceu a empresa?",
    "opcoes": [
      "Indicação",
      "Google",
      "Instagram",
      "LinkedIn",
      "WhatsApp",
      "Site",
      "Evento",
      "Prospecção ativa",
      "Parceria",
      "Networking",
      "Cliente antigo",
      "Outro"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-PES-001",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Competência percebida",
    "indicador": "Conhecimento",
    "indicador_canonico": "pessoas.competencia_percebida",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 26,
    "response_type": "escala4_concordancia",
    "pergunta": "Os profissionais demonstram conhecimento e preparo para realizar seu trabalho.",
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
    "observacao": ""
  },
  {
    "id": "EX-PES-002",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Competência percebida",
    "indicador": "Compreensão da necessidade",
    "indicador_canonico": "pessoas.compreensao_necessidade",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 27,
    "response_type": "escala4_concordancia",
    "pergunta": "Os profissionais procuram compreender a necessidade antes de propor ou executar uma solução.",
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
    "observacao": ""
  },
  {
    "id": "EX-PES-003",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Comportamento",
    "indicador": "Interesse genuíno",
    "indicador_canonico": "pessoas.interesse_genuino",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "Os profissionais demonstram interesse genuíno em ajudar e gerar uma boa experiência.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "EX-PES-004",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Comportamento",
    "indicador": "Responsabilidade",
    "indicador_canonico": "pessoas.responsabilidade",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 28,
    "response_type": "escala4_concordancia",
    "pergunta": "Os profissionais assumem responsabilidade pelas demandas até sua resolução.",
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
    "observacao": ""
  },
  {
    "id": "EX-PES-005",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Colaboração",
    "indicador": "Integração da equipe",
    "indicador_canonico": "pessoas.colaboracao",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 29,
    "response_type": "escala4_concordancia",
    "pergunta": "Percebo alinhamento e colaboração entre as diferentes pessoas e áreas com quem interajo.",
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
    "observacao": ""
  },
  {
    "id": "EX-PES-006",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Consistência",
    "indicador": "Consistência do atendimento",
    "indicador_canonico": "pessoas.consistencia_atendimento",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 30,
    "response_type": "escala4_concordancia",
    "pergunta": "A qualidade do relacionamento e do atendimento é consistente, independentemente do profissional envolvido.",
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
    "observacao": ""
  },
  {
    "id": "EX-PES-007",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Relacionamento",
    "indicador": "Respeito e profissionalismo",
    "indicador_canonico": "pessoas.respeito_profissionalismo",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "Os profissionais atuam com respeito, ética e profissionalismo.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "EX-PES-008",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Relacionamento",
    "indicador": "Confiança na equipe",
    "indicador_canonico": "pessoas.confianca_equipe",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 31,
    "response_type": "escala4_concordancia",
    "pergunta": "Sinto confiança nas pessoas que representam esta empresa.",
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
    "observacao": ""
  },
  {
    "id": "EX-PES-009",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Satisfação",
    "indicador": "Satisfação com a equipe",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com as pessoas com quem se relaciona nesta empresa?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "EX-PES-010",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Síntese",
    "indicador": "Comportamento marcante",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Há algum comportamento da equipe que mereça ser destacado, de forma positiva ou negativa?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "PRI-CLI",
    "publico": "clientes",
    "subperfil": "todos",
    "sistema": "Priorização",
    "objetivo": "Priorização v1",
    "indicador": "Prioridades (até 3)",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 32,
    "response_type": "multipla_ate3",
    "pergunta": "Em quais pontos esta empresa deveria melhorar primeiro? (escolha até 3)",
    "opcoes": [
      "Clareza da oferta",
      "Agilidade",
      "Personalização",
      "Confiabilidade da entrega",
      "Comunicação",
      "Relacionamento e atendimento",
      "Consistência",
      "Preço/valor"
    ],
    "max_escolhas": 3,
    "observacao": "nova (MVP v1) — substitui índice de importância"
  },
  {
    "id": "PRI-COL",
    "publico": "colaboradores",
    "subperfil": "todos",
    "sistema": "Priorização",
    "objetivo": "Priorização v1",
    "indicador": "Prioridades (até 3)",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 43,
    "response_type": "multipla_ate3",
    "pergunta": "Quais temas devem receber mais atenção nos próximos 12 meses? (escolha até 3)",
    "opcoes": [
      "Clareza de direção",
      "Liderança",
      "Desenvolvimento e aprendizado",
      "Reconhecimento",
      "Comunicação interna",
      "Processos e recursos",
      "Colaboração entre áreas",
      "Carga de trabalho",
      "Autonomia",
      "Cultura e valores"
    ],
    "max_escolhas": 3,
    "observacao": "nova (MVP v1) — substitui índice de importância"
  },
  {
    "id": "PRI-SOC",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Priorização",
    "objetivo": "Priorização v1",
    "indicador": "Prioridades (até 3)",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 43,
    "response_type": "multipla_ate3",
    "pergunta": "Quais temas devem receber mais atenção nos próximos 12 meses? (escolha até 3)",
    "opcoes": [
      "Posicionamento e diferenciação",
      "Proposta de valor",
      "Estratégia e prioridades",
      "Escalabilidade e processos",
      "Comunicação externa",
      "Comunicação interna",
      "Liderança",
      "Desenvolvimento de pessoas",
      "Cultura e valores",
      "Experiência do cliente"
    ],
    "max_escolhas": 3,
    "observacao": "nova (MVP v1) — substitui índice de importância"
  },
  {
    "id": "SD-COM-001",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Clareza interna",
    "indicador_canonico": "comunicacao.interna_clareza",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 25,
    "response_type": "escala4_frequencia",
    "pergunta": "As informações necessárias chegam às pessoas com clareza e no momento adequado.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-COM-002",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Transparência",
    "indicador_canonico": "comunicacao.transparencia",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 26,
    "response_type": "escala4_frequencia",
    "pergunta": "Decisões, mudanças e prioridades são comunicadas com transparência.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-COM-003",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Canais",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais canais formais de comunicação interna são utilizados atualmente?",
    "opcoes": [
      "Reuniões",
      "E-mail",
      "WhatsApp/Teams/Slack",
      "Intranet",
      "Murais",
      "Comunicados",
      "Newsletter",
      "Conversas individuais",
      "Não existem canais formais",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-COM-004",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Desafios",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais são os maiores desafios da comunicação interna? Selecione até três.",
    "opcoes": [
      "Informação atrasada",
      "Mensagens pouco claras",
      "Excesso de canais",
      "Centralização",
      "Ruído entre áreas",
      "Falta de registro",
      "Falta de transparência",
      "Reuniões improdutivas",
      "Lideranças comunicam versões diferentes",
      "Baixa escuta",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-COM-005",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação interna",
    "indicador": "Mensagem da liderança",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "O que a comunicação dos sócios e líderes precisa transmitir com mais consistência?",
    "opcoes": [
      "Direção",
      "Confiança",
      "Transparência",
      "Proximidade",
      "Responsabilidade",
      "Agilidade",
      "Segurança",
      "Inovação",
      "Reconhecimento",
      "Clareza sobre resultados",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-COM-006",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação externa",
    "indicador": "Mensagem central",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Em uma frase, qual mensagem principal a empresa precisa transmitir ao mercado?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-COM-007",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação externa",
    "indicador": "Clareza da mensagem",
    "indicador_canonico": "comunicacao.externa_clareza_mensagem",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 27,
    "response_type": "escala4_concordancia",
    "pergunta": "A comunicação externa explica com clareza o que a empresa faz, para quem e por que é diferente.",
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
    "observacao": ""
  },
  {
    "id": "SD-COM-008",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação externa",
    "indicador": "Consistência entre canais",
    "indicador_canonico": "comunicacao.consistencia_canais",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 28,
    "response_type": "escala4_frequencia",
    "pergunta": "A mensagem e a identidade da empresa são consistentes nos diferentes canais e pontos de contato.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-COM-009",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Marketing e autoridade",
    "indicador": "Autoridade percebida",
    "indicador_canonico": "comunicacao.autoridade",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "O conteúdo e a presença da empresa demonstram conhecimento, credibilidade e autoridade.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "SD-COM-010",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação comercial",
    "indicador": "Comunicação de valor",
    "indicador_canonico": "comunicacao.comercial_valor",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 29,
    "response_type": "escala4_frequencia",
    "pergunta": "A equipe comercial comunica valor com clareza, sem depender principalmente do preço como argumento.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-COM-011",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Comunicação comercial",
    "indicador": "Clareza da proposta",
    "indicador_canonico": "comunicacao.comercial_clareza_proposta",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 30,
    "response_type": "escala4_frequencia",
    "pergunta": "Propostas, apresentações e conversas comerciais deixam claro o problema resolvido, a entrega e o valor esperado.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-COM-012",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Experiência e relacionamento",
    "indicador": "Escuta do cliente",
    "indicador_canonico": "comunicacao.escuta_cliente",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 31,
    "response_type": "escala4_frequencia",
    "pergunta": "A empresa coleta feedbacks de clientes de forma sistemática e intencional.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-COM-013",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Experiência e relacionamento",
    "indicador": "Uso do feedback",
    "indicador_canonico": "comunicacao.uso_feedback",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 32,
    "response_type": "escala4_frequencia",
    "pergunta": "Os feedbacks de clientes são transformados em melhorias de processos, comunicação e experiência.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-COM-014",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Experiência e relacionamento",
    "indicador": "Ponto de atrito",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "selecao_unica",
    "pergunta": "Em qual ponto da jornada ocorre hoje o maior ruído ou atrito de comunicação?",
    "opcoes": [
      "Descoberta da marca",
      "Primeiro contato",
      "Diagnóstico/briefing",
      "Proposta",
      "Negociação",
      "Contratação",
      "Entrega",
      "Suporte",
      "Cobrança",
      "Pós-venda/renovação",
      "Comunicação interna",
      "Outro"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-COM-015",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Comunicação",
    "objetivo": "Satisfação",
    "indicador": "Satisfação com comunicação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com a comunicação atual da empresa?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-001",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Origem",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Como a empresa surgiu e qual contexto motivou sua criação?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-002",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Problema de origem",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Que problema, necessidade ou indignação os fundadores queriam resolver?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-003",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Propósito declarado",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Em uma frase, qual é o propósito da empresa além do resultado financeiro?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-004",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Clareza do propósito",
    "indicador_canonico": "marca.proposito_clareza",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 7,
    "response_type": "escala4_concordancia",
    "pergunta": "O propósito da empresa está claramente definido e orienta decisões importantes.",
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
    "observacao": ""
  },
  {
    "id": "SD-MAR-005",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Identidade e propósito",
    "indicador": "Impacto e legado",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Se a empresa deixasse de existir, o que seria perdido além de seus produtos, serviços e empregos?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-006",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Valores e cultura",
    "indicador": "Valores inegociáveis",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais são os valores inegociáveis da empresa? Informe até cinco.",
    "opcoes": [
      "Até 5 respostas"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-MAR-007",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Valores e cultura",
    "indicador": "Valores na decisão",
    "indicador_canonico": "marca.valores_vividos",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 8,
    "response_type": "escala4_frequencia",
    "pergunta": "Os valores da empresa orientam de forma consistente as decisões e os comportamentos do dia a dia.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-008",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Personalidade",
    "indicador": "Atributos desejados",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais atributos devem representar a personalidade da marca? Selecione até cinco.",
    "opcoes": [
      "Confiável",
      "Próxima",
      "Inovadora",
      "Especialista",
      "Ágil",
      "Humana",
      "Ousada",
      "Tradicional",
      "Sofisticada",
      "Prática",
      "Inspiradora",
      "Responsável",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-MAR-009",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Promessa",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Qual é a principal promessa que a empresa faz ao mercado, mesmo que ainda não esteja formalizada?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-010",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Diferenciação defensável",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "O que diferencia a empresa de forma relevante e difícil de copiar em relação às demais alternativas do mercado?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-011",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Clareza da diferenciação",
    "indicador_canonico": "marca.diferenciacao_clareza",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 9,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa possui um diferencial claro, consistente e fácil de explicar.",
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
    "observacao": ""
  },
  {
    "id": "SD-MAR-012",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Uso do posicionamento",
    "indicador_canonico": "marca.posicionamento_uso",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 10,
    "response_type": "escala4_frequencia",
    "pergunta": "O posicionamento da marca é utilizado como referência para decisões de oferta, atendimento, comunicação e crescimento.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-013",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Percepção desejada",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais três palavras você gostaria que clientes, colaboradores e parceiros usassem para descrever a empresa?",
    "opcoes": [
      "3 palavras"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-MAR-014",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Posicionamento",
    "indicador": "Percepção atual",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais três palavras você acredita que clientes, colaboradores e parceiros usam hoje para descrever a empresa?",
    "opcoes": [
      "3 palavras"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-MAR-015",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Território de valor",
    "indicador": "Estratégia predominante",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "selecao_unica",
    "pergunta": "Qual dimensão mais sustenta hoje a escolha da empresa pelos clientes?",
    "opcoes": [
      "Eficiência, previsibilidade e preço competitivo",
      "Proximidade, confiança e personalização",
      "Diferenciação, inovação e especialização",
      "Combinação equilibrada",
      "Não está claro"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-016",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Cultura e marca empregadora",
    "indicador": "Cultura atual",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Como você descreveria a cultura atual da empresa, de forma honesta e sem linguagem institucional?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-017",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Cultura e marca empregadora",
    "indicador": "Coerência identitária",
    "indicador_canonico": "marca.coerencia_identitaria",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 11,
    "response_type": "escala4_concordancia",
    "pergunta": "Existe coerência entre o que a empresa diz, o que entrega ao mercado e o que vive internamente.",
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
    "observacao": ""
  },
  {
    "id": "SD-MAR-018",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Cultura e marca empregadora",
    "indicador": "Proposta de valor ao colaborador",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Qual é a proposta de valor oferecida aos colaboradores e por que ela é relevante?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-019",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Cultura e marca empregadora",
    "indicador": "Atratividade empregadora",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Por que um profissional talentoso deveria escolher trabalhar nesta empresa em vez de escolher outra organização?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-020",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Reputação percebida",
    "indicador_canonico": "marca.reputacao",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 12,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa possui uma reputação forte e coerente com o posicionamento que deseja ocupar.",
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
    "observacao": ""
  },
  {
    "id": "SD-MAR-021",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Satisfação com a reputação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com a reputação atual da empresa?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-022",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Visão futura",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Como você deseja que a empresa seja reconhecida daqui a três anos?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-MAR-N1",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Personalidade",
    "indicador": "Personalidade da marca",
    "indicador_canonico": "marca.personalidade",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 13,
    "response_type": "escala4_frequencia",
    "pergunta": "A personalidade da marca (tom, jeito de se comunicar e de se relacionar) é clara e aplicada de forma consistente.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": "nova (MVP v1)"
  },
  {
    "id": "SD-MAR-N2",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Marca",
    "objetivo": "Imagem e reputação",
    "indicador": "Promessa cumprida",
    "indicador_canonico": "marca.confianca_promessa",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 14,
    "response_type": "escala4_frequencia",
    "pergunta": "A empresa cumpre, de forma consistente, a promessa que faz ao mercado.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": "nova (MVP v1) — cria anchor [2P] com EX-MAR-006"
  },
  {
    "id": "SD-NEG-001",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Oferta e proposta de valor",
    "indicador": "Oferta",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "O que a empresa vende? Descreva as principais soluções, produtos ou serviços.",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-002",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Oferta e proposta de valor",
    "indicador": "Público prioritário",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Para quem a empresa vende? Descreva o perfil de cliente prioritário.",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-003",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Oferta e proposta de valor",
    "indicador": "Transformação entregue",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Qual é a principal transformação ou benefício entregue ao cliente?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-004",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Oferta e proposta de valor",
    "indicador": "Clareza da proposta de valor",
    "indicador_canonico": "negocios.proposta_valor_clareza",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 15,
    "response_type": "escala4_concordancia",
    "pergunta": "A proposta de valor da empresa é clara, relevante para o cliente e sustentável para o negócio.",
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
    "observacao": ""
  },
  {
    "id": "SD-NEG-005",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Direção estratégica",
    "indicador": "Clareza estratégica",
    "indicador_canonico": "negocios.direcao_clareza",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 16,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa possui objetivos estratégicos claros para os próximos três anos.",
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
    "observacao": ""
  },
  {
    "id": "SD-NEG-006",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Direção estratégica",
    "indicador": "Priorização",
    "indicador_canonico": "negocios.priorizacao",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 17,
    "response_type": "escala4_frequencia",
    "pergunta": "As prioridades estratégicas são definidas e protegidas mesmo diante das urgências da rotina.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-007",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Direção estratégica",
    "indicador": "Prioridades atuais",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "ranking",
    "pergunta": "Quais temas deveriam receber maior atenção nos próximos 12 meses? Selecione e ordene até três.",
    "opcoes": [
      "Posicionamento",
      "Crescimento comercial",
      "Rentabilidade",
      "Processos e produtividade",
      "Experiência do cliente",
      "Liderança",
      "Cultura",
      "Pessoas",
      "Comunicação interna",
      "Comunicação externa",
      "Inovação",
      "Tecnologia",
      "Outro"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-008",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Direção estratégica",
    "indicador": "Desafio central",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Qual é hoje o principal desafio para alcançar os objetivos da empresa?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-009",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e concorrência",
    "indicador": "Concorrentes",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais são os principais concorrentes ou alternativas que disputam a mesma decisão do cliente? Informe até cinco.",
    "opcoes": [
      "Até 5 nomes"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-NEG-010",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e concorrência",
    "indicador": "Referências de mercado",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Quais empresas você considera referência e por quais motivos?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-011",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e concorrência",
    "indicador": "Vantagem dos concorrentes",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Em quais aspectos os concorrentes são percebidos como superiores? Selecione até três.",
    "opcoes": [
      "Preço",
      "Qualidade",
      "Atendimento",
      "Marca/reputação",
      "Especialização",
      "Inovação",
      "Agilidade",
      "Conveniência",
      "Presença digital",
      "Relacionamento",
      "Experiência do cliente",
      "Escala/capacidade",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-NEG-012",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e concorrência",
    "indicador": "Vantagem própria",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Em quais aspectos a empresa é superior às demais alternativas? Selecione até três.",
    "opcoes": [
      "Preço",
      "Qualidade",
      "Atendimento",
      "Marca/reputação",
      "Especialização",
      "Inovação",
      "Agilidade",
      "Conveniência",
      "Presença digital",
      "Relacionamento",
      "Experiência do cliente",
      "Capacidade de resolver problemas",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-NEG-013",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e cliente",
    "indicador": "Razões de escolha",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Na sua percepção, quais fatores mais influenciam os clientes a escolherem a empresa? Selecione até três.",
    "opcoes": [
      "Confiança",
      "Relacionamento",
      "Qualidade técnica",
      "Atendimento",
      "Especialização",
      "Indicação",
      "Reputação",
      "Resultado esperado",
      "Experiência anterior",
      "Agilidade",
      "Conveniência",
      "Preço",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-NEG-014",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e cliente",
    "indicador": "Barreiras de compra",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais barreiras ou objeções aparecem com mais frequência antes da compra? Selecione até cinco.",
    "opcoes": [
      "Preço",
      "Prazo",
      "Medo de não obter resultado",
      "Falta de clareza sobre a entrega",
      "Comparação com concorrentes",
      "Preferência por fornecedor conhecido",
      "Dúvida técnica",
      "Dúvida sobre retorno",
      "Falta de urgência",
      "Decisão lenta",
      "Cliente acredita que consegue fazer internamente",
      "Receio de trocar fornecedor",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-NEG-015",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Modelo e escalabilidade",
    "indicador": "Padronização",
    "indicador_canonico": "negocios.padronizacao",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 18,
    "response_type": "escala4_concordancia",
    "pergunta": "A entrega possui padrões suficientes para garantir consistência, qualidade e capacidade de crescimento.",
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
    "observacao": ""
  },
  {
    "id": "SD-NEG-016",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Modelo e escalabilidade",
    "indicador": "Escalabilidade",
    "indicador_canonico": "negocios.escalabilidade",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 19,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa consegue crescer sem aumentar na mesma proporção a dependência dos sócios, os custos e a complexidade operacional.",
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
    "observacao": ""
  },
  {
    "id": "SD-NEG-017",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Gestão e execução",
    "indicador": "Planos de execução",
    "indicador_canonico": "negocios.execucao_planos",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 20,
    "response_type": "escala4_frequencia",
    "pergunta": "As prioridades são transformadas em planos com responsáveis, prazos e critérios de acompanhamento.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-018",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Gestão e execução",
    "indicador": "Indicadores",
    "indicador_canonico": "negocios.indicadores_gestao",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 21,
    "response_type": "escala4_frequencia",
    "pergunta": "A empresa acompanha indicadores confiáveis para orientar decisões e corrigir desvios.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-019",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Gestão e execução",
    "indicador": "Riscos",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "ranking",
    "pergunta": "Quais riscos mais ameaçam os resultados e o crescimento? Selecione e ordene até três.",
    "opcoes": [
      "Caixa/financeiro",
      "Concentração de clientes",
      "Dependência dos sócios",
      "Pessoas-chave",
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
    "observacao": ""
  },
  {
    "id": "SD-NEG-020",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Satisfação com resultados",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com os resultados gerais da empresa?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-021",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Resultado financeiro",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com rentabilidade e geração de caixa?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-022",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Resultado comercial",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com os resultados comerciais?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-023",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Resultado operacional",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com produtividade, qualidade e cumprimento de prazos?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-NEG-024",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Síntese",
    "indicador": "Forças, fragilidades e oportunidades",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Condicional",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": false,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Classifique os principais fatores da empresa em impulsionadores, detratores e aceleradores.",
    "opcoes": [
      "Cadastrar itens em três grupos: Impulsionadores",
      "Detratores",
      "Aceleradores"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-NEG-N1",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e concorrência",
    "indicador": "Conhecimento competitivo",
    "indicador_canonico": "negocios.conhecimento_competitivo",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 22,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa conhece bem seus concorrentes e o que a diferencia diante das alternativas do mercado.",
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
    "observacao": "nova (MVP v1) — cria anchor [2P] com CL-NEG-005"
  },
  {
    "id": "SD-NEG-N2",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Mercado e cliente",
    "indicador": "Cliente prioritário",
    "indicador_canonico": "negocios.cliente_prioritario",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 23,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa tem clareza sobre quais perfis de clientes são prioritários e direciona esforços a eles.",
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
    "observacao": "nova (MVP v1) — cria anchor [2P] com CL-NEG-004"
  },
  {
    "id": "SD-NEG-N3",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Negócios",
    "objetivo": "Resultados",
    "indicador": "Sustentabilidade de resultados",
    "indicador_canonico": "negocios.resultados",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 24,
    "response_type": "escala4_concordancia",
    "pergunta": "A empresa entrega resultados financeiros consistentes e sustentáveis para sustentar o crescimento.",
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
    "observacao": "nova (MVP v1)"
  },
  {
    "id": "SD-PER-001",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Identificação",
    "indicador": "Respondente",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 1,
    "response_type": "texto_curto",
    "pergunta": "Nome completo do respondente.",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PER-002",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Identificação",
    "indicador": "Função",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 2,
    "response_type": "selecao_unica",
    "pergunta": "Qual é seu cargo ou papel atual na empresa?",
    "opcoes": [
      "Fundador(a)",
      "Sócio(a)",
      "Diretor(a)",
      "Conselheiro(a)",
      "Outro"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PER-003",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Contexto",
    "indicador": "Tempo de empresa",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 3,
    "response_type": "selecao_unica",
    "pergunta": "Há quanto tempo você atua na empresa?",
    "opcoes": [
      "Menos de 1 ano",
      "1 a 3 anos",
      "3 a 5 anos",
      "5 a 10 anos",
      "Mais de 10 anos"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PER-004",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Contexto",
    "indicador": "Porte",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 4,
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
    "observacao": ""
  },
  {
    "id": "SD-PER-005",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Contexto",
    "indicador": "Estrutura societária",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 5,
    "response_type": "numero",
    "pergunta": "Quantos sócios participam atualmente da empresa?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PER-006",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Perfil",
    "objetivo": "Contexto",
    "indicador": "Segmento",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": 6,
    "response_type": "texto_curto",
    "pergunta": "Qual é o principal segmento de atuação da empresa?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-001",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Estrutura e papéis",
    "indicador": "Clareza de papéis",
    "indicador_canonico": "pessoas.papeis_clareza",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 33,
    "response_type": "escala4_concordancia",
    "pergunta": "Papéis, responsabilidades e níveis de decisão estão claramente definidos.",
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
    "observacao": ""
  },
  {
    "id": "SD-PES-002",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Estrutura e papéis",
    "indicador": "Autonomia",
    "indicador_canonico": "pessoas.autonomia_nivel",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 34,
    "response_type": "escala4_frequencia",
    "pergunta": "As decisões são tomadas no nível adequado, sem dependência excessiva dos sócios ou da direção.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-003",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Papel estratégico",
    "indicador_canonico": "pessoas.lideranca_papel_estrategico",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "Os líderes compreendem claramente seu papel na execução da estratégia.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "SD-PES-004",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Alinhamento da liderança",
    "indicador_canonico": "pessoas.lideranca_alinhamento",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_frequencia",
    "pergunta": "As lideranças atuam de forma alinhada entre si e com a direção da empresa.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "SD-PES-005",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Direção e acompanhamento",
    "indicador_canonico": "pessoas.lideranca_direcao",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 35,
    "response_type": "escala4_frequencia",
    "pergunta": "Os líderes orientam prioridades, acompanham entregas e corrigem desvios com consistência.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-006",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Feedback aos líderes",
    "indicador_canonico": "pessoas.lideranca_feedback",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 36,
    "response_type": "escala4_frequencia",
    "pergunta": "A direção oferece feedback periódico e estruturado aos líderes sobre sua atuação.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-007",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Desenvolvimento das equipes",
    "indicador_canonico": "pessoas.lideranca_desenvolve_equipe",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 37,
    "response_type": "escala4_frequencia",
    "pergunta": "Os líderes desenvolvem as pessoas por meio de orientação, feedback, delegação e acompanhamento.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-008",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Liderança",
    "indicador": "Satisfação com lideranças",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, qual é seu grau de satisfação com o desempenho atual das lideranças?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-009",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Atração e seleção",
    "indicador": "Processo de contratação",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Como é realizado o processo de contratação e quem participa das decisões?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-010",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Atração e seleção",
    "indicador": "Critérios de seleção",
    "indicador_canonico": "pessoas.selecao_criterios",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_frequencia",
    "pergunta": "A empresa utiliza critérios claros para selecionar pessoas alinhadas às competências e à cultura necessárias.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "SD-PES-011",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Competências",
    "indicador": "Lacunas comportamentais",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais competências comportamentais mais precisam ser desenvolvidas? Selecione até três.",
    "opcoes": [
      "Comunicação",
      "Escuta",
      "Assertividade",
      "Colaboração",
      "Planejamento e organização",
      "Decisão",
      "Resiliência",
      "Iniciativa",
      "Adaptabilidade",
      "Negociação",
      "Responsabilidade por resultados",
      "Liderança",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-PES-012",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Competências",
    "indicador": "Capacidade para crescer",
    "indicador_canonico": "pessoas.competencia_funcao",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 38,
    "response_type": "escala4_concordancia",
    "pergunta": "As competências atuais da equipe são suficientes para sustentar o crescimento planejado.",
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
    "observacao": ""
  },
  {
    "id": "SD-PES-013",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Desenvolvimento",
    "indicador": "Investimento em desenvolvimento",
    "indicador_canonico": "pessoas.desenvolvimento_oferta",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Identidade Pago",
    "is_free": false,
    "is_paid_core": true,
    "is_paid_extra": true,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 39,
    "response_type": "escala4_frequencia",
    "pergunta": "A empresa desenvolve de forma contínua as competências técnicas, comportamentais e de liderança necessárias.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-014",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Performance",
    "indicador": "Entrega de resultados",
    "indicador_canonico": "pessoas.performance_resultados",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 40,
    "response_type": "escala4_frequencia",
    "pergunta": "As pessoas entregam os resultados esperados com qualidade, responsabilidade e consistência.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-015",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Performance",
    "indicador": "Colaboração",
    "indicador_canonico": "pessoas.colaboracao",
    "anchor_cobertura": "3P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 41,
    "response_type": "escala4_frequencia",
    "pergunta": "Existe colaboração efetiva entre equipes e áreas para alcançar objetivos comuns.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-016",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Performance",
    "indicador": "Reconhecimento",
    "indicador_canonico": "pessoas.reconhecimento",
    "anchor_cobertura": "2P",
    "score_family": "maturity",
    "tier_mvp": "Core",
    "produto": "Maturidade Free + Identidade Pago",
    "is_free": true,
    "is_paid_core": true,
    "is_paid_extra": false,
    "usar_no_calculo_v1": true,
    "obrigatoria": true,
    "ordem_core": 42,
    "response_type": "escala4_frequencia",
    "pergunta": "A empresa reconhece e reforça atitudes e resultados alinhados à estratégia.",
    "opcoes": [
      {
        "label": "Nunca",
        "value": 0
      },
      {
        "label": "Poucas vezes",
        "value": 1
      },
      {
        "label": "Muitas vezes",
        "value": 2
      },
      {
        "label": "Sempre",
        "value": 3
      },
      {
        "label": "Não se aplica",
        "value": -1
      }
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-017",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Engajamento e retenção",
    "indicador": "Engajamento percebido",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "satisfaction",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala_0_10",
    "pergunta": "De 0 a 10, como você avalia o nível de engajamento atual da equipe?",
    "opcoes": [
      "0 = Totalmente insatisfeito",
      "10 = Totalmente satisfeito"
    ],
    "max_escolhas": null,
    "observacao": ""
  },
  {
    "id": "SD-PES-018",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Engajamento e retenção",
    "indicador": "Barreiras ao desempenho",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "multipla_ate3",
    "pergunta": "Quais fatores mais comprometem o engajamento e a entrega das pessoas? Selecione até três.",
    "opcoes": [
      "Liderança",
      "Comunicação",
      "Falta de clareza",
      "Sobrecarga",
      "Processos",
      "Falta de autonomia",
      "Falta de reconhecimento",
      "Competências insuficientes",
      "Conflitos",
      "Remuneração/benefícios",
      "Falta de perspectiva",
      "Outro"
    ],
    "max_escolhas": 3,
    "observacao": ""
  },
  {
    "id": "SD-PES-019",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Engajamento e retenção",
    "indicador": "Sucessão",
    "indicador_canonico": "pessoas.sucessao",
    "anchor_cobertura": "1P",
    "score_family": "maturity",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "escala4_concordancia",
    "pergunta": "Existem pessoas preparadas ou planos de sucessão para posições críticas.",
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
    "observacao": "rebaixada p/ Aprofundamento (fora do Core MVP)"
  },
  {
    "id": "SD-PES-020",
    "publico": "socios",
    "subperfil": "todos",
    "sistema": "Pessoas",
    "objetivo": "Síntese",
    "indicador": "Desafio de pessoas",
    "indicador_canonico": null,
    "anchor_cobertura": null,
    "score_family": "none",
    "tier_mvp": "Aprofundamento",
    "produto": "Aprofundamento / v2",
    "is_free": false,
    "is_paid_core": false,
    "is_paid_extra": false,
    "usar_no_calculo_v1": false,
    "obrigatoria": true,
    "ordem_core": null,
    "response_type": "aberta",
    "pergunta": "Qual é hoje o maior desafio relacionado à liderança e à gestão de pessoas?",
    "opcoes": [],
    "max_escolhas": null,
    "observacao": ""
  }
];
