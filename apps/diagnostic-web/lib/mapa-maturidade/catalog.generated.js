// =====================================================================
// GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.
// Fonte: data/maturidade/mapa_maturidade_final.xlsx.
// Regenerar: node scripts/build-maturidade-final.cjs
// Perguntas: 41 (40 pontuam) · Sistemas: 4
// =====================================================================

export const SISTEMAS_MATURIDADE = [
  "Marca",
  "Negócios",
  "Comunicação",
  "Pessoas"
];

/** @typedef {Object} PerguntaMaturidade */
export const CATALOGO_MATURIDADE = [
  {
    "id": "MM2-MAR-01",
    "sistema": "Marca",
    "dimensao": "Reconhecimento de mercado",
    "indicador": "Reconhecimento espontâneo",
    "o_que_identifica": "Identifica se o mercado já reconhece a empresa sem depender de explicações longas.",
    "pergunta": "Clientes chegam até a empresa já entendendo o que ela faz.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa precisa se explicar do zero em quase toda oportunidade.",
    "identidade_aprofunda": "Investigar clareza de posicionamento, proposta de valor, promessa de marca e linguagem usada pelos públicos."
  },
  {
    "id": "MM2-MAR-02",
    "sistema": "Marca",
    "dimensao": "Valor percebido",
    "indicador": "Valor antes do preço",
    "o_que_identifica": "Identifica se a marca ajuda o cliente a perceber valor antes de comparar preço.",
    "pergunta": "Nas conversas comerciais, os clientes percebem valor antes de questionar preço.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa entra rapidamente em comparação por preço.",
    "identidade_aprofunda": "Investigar diferenciais percebidos, critérios de escolha do cliente e coerência entre promessa e entrega."
  },
  {
    "id": "MM2-MAR-03",
    "sistema": "Marca",
    "dimensao": "Confiança",
    "indicador": "Confiança inicial",
    "o_que_identifica": "Identifica se a empresa gera confiança logo de início, sem precisar se provar exaustivamente.",
    "pergunta": "As pessoas confiam na empresa desde os primeiros contatos.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 8,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa precisa se provar muito antes que as pessoas confiem e decidam.",
    "identidade_aprofunda": "Investigar percepção de risco, provas de valor, reputação e sinais de credibilidade da marca."
  },
  {
    "id": "MM2-MAR-04",
    "sistema": "Marca",
    "dimensao": "Indicação",
    "indicador": "Indicações espontâneas",
    "o_que_identifica": "Identifica se clientes e parceiros indicam a empresa sem estímulo constante.",
    "pergunta": "A empresa recebe indicações espontâneas de clientes, parceiros ou mercado.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A geração de oportunidades depende quase totalmente de prospecção ativa ou relações pessoais.",
    "identidade_aprofunda": "Investigar experiência do cliente, fatores de recomendação e atributos de confiança."
  },
  {
    "id": "MM2-MAR-05",
    "sistema": "Marca",
    "dimensao": "Preferência",
    "indicador": "Preferência em recompra",
    "o_que_identifica": "Identifica se a marca permanece como opção natural quando surge uma nova necessidade.",
    "pergunta": "Quem já comprou volta a considerar a empresa em necessidades semelhantes.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa vende uma vez, mas não se consolida como escolha recorrente.",
    "identidade_aprofunda": "Investigar satisfação, entrega, relacionamento, pós-venda e percepção de valor."
  },
  {
    "id": "MM2-MAR-06",
    "sistema": "Marca",
    "dimensao": "Consistência pública",
    "indicador": "Padrão de apresentação",
    "o_que_identifica": "Identifica se a empresa se apresenta de forma consistente em materiais, canais e propostas.",
    "pergunta": "A apresentação da empresa é consistente em canais, materiais e propostas.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Cada canal ou material parece comunicar uma empresa diferente.",
    "identidade_aprofunda": "Investigar identidade verbal, visual, narrativa da marca e alinhamento entre áreas."
  },
  {
    "id": "MM2-MAR-07",
    "sistema": "Marca",
    "dimensao": "Autoridade",
    "indicador": "Provas de capacidade",
    "o_que_identifica": "Identifica se a empresa demonstra capacidade por meio de evidências, cases, histórico ou argumentos concretos.",
    "pergunta": "A empresa mostra evidências claras de capacidade: resultados, cases, depoimentos.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa afirma que entrega valor, mas mostra poucas evidências.",
    "identidade_aprofunda": "Investigar provas de valor, diferenciais reais, argumentos comerciais e percepção dos clientes."
  },
  {
    "id": "MM2-MAR-08",
    "sistema": "Marca",
    "dimensao": "Reputação",
    "indicador": "Reputação como ativo comercial",
    "o_que_identifica": "Identifica se a reputação ajuda a abrir portas e facilitar negociações.",
    "pergunta": "A reputação da empresa abre conversas e novas oportunidades.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A marca não contribui de forma relevante para gerar oportunidades.",
    "identidade_aprofunda": "Investigar imagem percebida, lembrança de marca, indicação e autoridade no mercado."
  },
  {
    "id": "MM2-MAR-09",
    "sistema": "Marca",
    "dimensao": "Atratividade",
    "indicador": "Atratividade para talentos e parceiros",
    "o_que_identifica": "Identifica se a marca desperta interesse em pessoas e parceiros relevantes.",
    "pergunta": "A empresa desperta interesse em bons profissionais, parceiros e fornecedores.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa tem dificuldade de atrair pessoas e parceiros alinhados.",
    "identidade_aprofunda": "Investigar marca empregadora, cultura percebida, proposta ao colaborador e reputação relacional."
  },
  {
    "id": "MM2-MAR-10",
    "sistema": "Marca",
    "dimensao": "Memória de marca",
    "indicador": "Associação positiva",
    "o_que_identifica": "Identifica se a empresa desperta associações positivas quando é lembrada.",
    "pergunta": "Quando falam da empresa, as pessoas usam adjetivos positivos.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa desperta associações neutras, genéricas ou negativas.",
    "identidade_aprofunda": "Investigar atributos desejados, atributos percebidos e desalinhamento entre intenção e percepção."
  },
  {
    "id": "MM2-MAR-10b",
    "sistema": "Marca",
    "dimensao": "Memória de marca",
    "indicador": "Atributos percebidos",
    "o_que_identifica": "Capta QUAIS atributos a empresa desperta, para comparar com os desejados.",
    "pergunta": "Quais adjetivos as pessoas mais associam à empresa hoje? (escolha até 3)",
    "response_type": "multipla",
    "opcoes": [
      "Confiável",
      "Inovadora",
      "Especialista",
      "Próxima/Humana",
      "Ágil",
      "Sofisticada",
      "Acessível",
      "Diferente/Original"
    ],
    "score_family": "brand_attributes",
    "pontua": false,
    "peso": 0,
    "relevancia": 7,
    "exibicao": "condicional",
    "regra_condicional": {
      "depende": "MM2-MAR-10",
      "valores": [
        2,
        3
      ]
    },
    "obrigatoria": false,
    "sinal_alerta": null,
    "identidade_aprofunda": "Investigar atributos percebidos × desejados e a distância entre a intenção da marca e a percepção real."
  },
  {
    "id": "MM2-NEG-01",
    "sistema": "Negócios",
    "dimensao": "Direção",
    "indicador": "Prioridades ativas",
    "o_que_identifica": "Identifica se as prioridades realmente orientam a rotina.",
    "pergunta": "As decisões da rotina estão conectadas às prioridades do negócio.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa decide muito pela urgência e pouco pela estratégia.",
    "identidade_aprofunda": "Investigar intenção estratégica, prioridades reais, conflitos de decisão e visão dos sócios."
  },
  {
    "id": "MM2-NEG-02",
    "sistema": "Negócios",
    "dimensao": "Comercial",
    "indicador": "Previsibilidade comercial",
    "o_que_identifica": "Identifica se a geração de vendas é previsível ou irregular.",
    "pergunta": "A empresa tem rotina consistente para gerar novas oportunidades comerciais.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "As vendas oscilam muito e dependem de indicação, esforço pontual ou sorte.",
    "identidade_aprofunda": "Investigar processo comercial, posicionamento, proposta de valor e argumentos de venda."
  },
  {
    "id": "MM2-NEG-03",
    "sistema": "Negócios",
    "dimensao": "Foco estratégico",
    "indicador": "Capacidade de dizer não",
    "o_que_identifica": "Identifica se a empresa protege o foco, recusando o que a dispersa.",
    "pergunta": "A empresa consegue recusar demandas que desviam o foco do prioritário.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa aceita quase tudo e se dispersa, perdendo foco, prazo e rentabilidade.",
    "identidade_aprofunda": "Investigar prioridades estratégicas, cliente ideal, critérios de decisão e disciplina de foco."
  },
  {
    "id": "MM2-NEG-04",
    "sistema": "Negócios",
    "dimensao": "Margem",
    "indicador": "Controle de rentabilidade",
    "o_que_identifica": "Identifica se crescimento se converte em resultado financeiro.",
    "pergunta": "A empresa acompanha se cada venda ou projeto gera margem adequada.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa vende, mas não sabe com clareza onde ganha ou perde dinheiro.",
    "identidade_aprofunda": "Investigar formação de preço, margem, custos, proposta de valor e modelo de entrega."
  },
  {
    "id": "MM2-NEG-05",
    "sistema": "Negócios",
    "dimensao": "Entrega",
    "indicador": "Cumprimento de prazos e combinados",
    "o_que_identifica": "Identifica se a operação sustenta o que foi vendido.",
    "pergunta": "A empresa cumpre prazos, condições e entregas combinadas.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Há atrasos, desalinhamentos ou entregas diferentes do combinado.",
    "identidade_aprofunda": "Investigar gargalos operacionais, clareza de escopo, comunicação e capacidade da equipe."
  },
  {
    "id": "MM2-NEG-06",
    "sistema": "Negócios",
    "dimensao": "Processos",
    "indicador": "Padronização de rotinas críticas",
    "o_que_identifica": "Identifica se a empresa depende de improviso em atividades importantes.",
    "pergunta": "As rotinas críticas do negócio têm padrão mínimo de execução.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A qualidade varia conforme a pessoa, o dia ou a urgência.",
    "identidade_aprofunda": "Investigar processos, papéis, treinamento, documentação e pontos de retrabalho."
  },
  {
    "id": "MM2-NEG-07",
    "sistema": "Negócios",
    "dimensao": "Indicadores",
    "indicador": "Acompanhamento de números",
    "o_que_identifica": "Identifica se a gestão tem dados suficientes para decidir.",
    "pergunta": "A empresa acompanha indicadores de vendas, margem, caixa e satisfação.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Decisões são tomadas mais por sensação do que por dados.",
    "identidade_aprofunda": "Investigar indicadores disponíveis, rotina de gestão e qualidade das informações."
  },
  {
    "id": "MM2-NEG-08",
    "sistema": "Negócios",
    "dimensao": "Capacidade",
    "indicador": "Capacidade de atendimento",
    "o_que_identifica": "Identifica se o volume atual já pressiona a estrutura.",
    "pergunta": "A empresa atende a demanda atual sem sobrecarga nem perda de qualidade.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A operação já trabalha no limite e qualquer crescimento gera desorganização.",
    "identidade_aprofunda": "Investigar estrutura, equipe, processos, gargalos, tecnologia e priorização."
  },
  {
    "id": "MM2-NEG-09",
    "sistema": "Negócios",
    "dimensao": "Execução",
    "indicador": "Reuniões que geram ação",
    "o_que_identifica": "Identifica se as rotinas de gestão convertem conversa em decisão e ação.",
    "pergunta": "Reuniões terminam com decisões, responsáveis e próximos passos claros.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Muita reunião e pouca decisão; os mesmos assuntos voltam à pauta sem avançar.",
    "identidade_aprofunda": "Investigar governança, rituais de gestão, responsabilização e foco na execução."
  },
  {
    "id": "MM2-NEG-10",
    "sistema": "Negócios",
    "dimensao": "Escala",
    "indicador": "Dependência dos sócios no crescimento",
    "o_que_identifica": "Identifica se a empresa cresce com autonomia ou aumenta dependência dos donos.",
    "pergunta": "A empresa cresce sem aumentar a dependência dos sócios.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Quanto mais a empresa cresce, mais os sócios se tornam gargalo.",
    "identidade_aprofunda": "Investigar centralização, liderança, autonomia, processos e modelo de gestão."
  },
  {
    "id": "MM2-COM-01",
    "sistema": "Comunicação",
    "dimensao": "Clareza interna",
    "indicador": "Prioridades compreendidas",
    "o_que_identifica": "Identifica se as pessoas entendem o que é prioridade na prática.",
    "pergunta": "As pessoas entendem com clareza as prioridades atuais da empresa.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Cada pessoa ou área trabalha com uma interpretação diferente do que é prioridade.",
    "identidade_aprofunda": "Investigar alinhamento da liderança, narrativa estratégica e rituais de comunicação."
  },
  {
    "id": "MM2-COM-02",
    "sistema": "Comunicação",
    "dimensao": "Fluxo de informação",
    "indicador": "Informação no tempo certo",
    "o_que_identifica": "Identifica falhas de fluxo, atrasos e ruídos de informação.",
    "pergunta": "As informações importantes chegam às pessoas certas no momento certo.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Informações chegam tarde, incompletas ou por canais informais.",
    "identidade_aprofunda": "Investigar canais, responsáveis, rotinas, registro e comunicação entre áreas."
  },
  {
    "id": "MM2-COM-03",
    "sistema": "Comunicação",
    "dimensao": "Integração entre áreas",
    "indicador": "Repasses claros",
    "o_que_identifica": "Identifica se áreas trocam informações suficientes para atender bem o cliente.",
    "pergunta": "Os repasses entre áreas evitam retrabalho e falhas na entrega.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa perde tempo corrigindo erros causados por falta de repasse.",
    "identidade_aprofunda": "Investigar fluxo da jornada do cliente, interfaces entre áreas e pontos de ruptura."
  },
  {
    "id": "MM2-COM-04",
    "sistema": "Comunicação",
    "dimensao": "Proposta comercial",
    "indicador": "Compreensão da proposta",
    "o_que_identifica": "Identifica se a proposta ajuda o cliente a decidir com segurança.",
    "pergunta": "As propostas deixam claros escopo, valor, prazo e próximos passos.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Clientes têm dúvidas sobre o que está incluso, o que será entregue ou como será conduzido.",
    "identidade_aprofunda": "Investigar mensagem de valor, proposta comercial, objeções e clareza da oferta."
  },
  {
    "id": "MM2-COM-05",
    "sistema": "Comunicação",
    "dimensao": "Explicação da oferta",
    "indicador": "Facilidade de entendimento",
    "o_que_identifica": "Identifica se a empresa comunica seus produtos ou serviços de forma simples.",
    "pergunta": "É fácil para o cliente entender o que a empresa oferece.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "O cliente precisa de muitas explicações para entender a oferta.",
    "identidade_aprofunda": "Investigar posicionamento, linguagem, materiais comerciais e percepção do cliente."
  },
  {
    "id": "MM2-COM-06",
    "sistema": "Comunicação",
    "dimensao": "Acompanhamento do cliente",
    "indicador": "Atualizações durante a entrega",
    "o_que_identifica": "Identifica se o cliente fica informado durante a jornada.",
    "pergunta": "Durante a entrega, o cliente sabe andamento, prazos e próximos passos.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "O cliente precisa cobrar atualizações ou fica inseguro sobre o andamento.",
    "identidade_aprofunda": "Investigar pontos de contato, responsáveis, cadência de comunicação e experiência do cliente."
  },
  {
    "id": "MM2-COM-07",
    "sistema": "Comunicação",
    "dimensao": "Transparência",
    "indicador": "Comunicação em problemas",
    "o_que_identifica": "Identifica se a empresa preserva confiança quando há falhas ou mudanças.",
    "pergunta": "Mudanças, atrasos ou problemas são comunicados com transparência e agilidade.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Problemas são comunicados tarde ou de forma pouco clara.",
    "identidade_aprofunda": "Investigar protocolos, autonomia, cultura de transparência e gestão de expectativas."
  },
  {
    "id": "MM2-COM-08",
    "sistema": "Comunicação",
    "dimensao": "Canais",
    "indicador": "Canais definidos",
    "o_que_identifica": "Identifica se há clareza sobre onde comunicar e registrar informações.",
    "pergunta": "A empresa tem canais claros para comunicar decisões e mudanças.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "As informações ficam espalhadas em conversas, aplicativos e pessoas.",
    "identidade_aprofunda": "Investigar governança de canais, responsabilidades e disciplina de registro."
  },
  {
    "id": "MM2-COM-09",
    "sistema": "Comunicação",
    "dimensao": "Feedback",
    "indicador": "Feedbacks registrados",
    "o_que_identifica": "Identifica se reclamações, sugestões e percepções viram informação útil.",
    "pergunta": "Feedbacks de clientes e colaboradores são registrados de forma organizada.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Feedbacks aparecem em conversas soltas e se perdem sem tratamento.",
    "identidade_aprofunda": "Investigar mecanismos de escuta, indicadores, tratamento de feedback e plano de ação."
  },
  {
    "id": "MM2-COM-10",
    "sistema": "Comunicação",
    "dimensao": "Aprendizado",
    "indicador": "Feedbacks convertidos em melhoria",
    "o_que_identifica": "Identifica se a escuta gera mudança prática.",
    "pergunta": "A empresa transforma feedbacks de clientes em melhorias concretas.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A empresa escuta, mas pouco transforma em melhoria concreta.",
    "identidade_aprofunda": "Investigar causas dos feedbacks, priorização, responsabilidades e rituais de melhoria."
  },
  {
    "id": "MM2-PES-01",
    "sistema": "Pessoas",
    "dimensao": "Papéis",
    "indicador": "Responsabilidades claras",
    "o_que_identifica": "Identifica se existe confusão sobre quem decide, faz ou responde por cada entrega.",
    "pergunta": "As responsabilidades de cada pessoa ou área são claras na rotina.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Há sobreposição, lacunas ou dúvidas sobre quem deve resolver o quê.",
    "identidade_aprofunda": "Investigar organograma, descrição de papéis, autonomia e pontos de decisão."
  },
  {
    "id": "MM2-PES-02",
    "sistema": "Pessoas",
    "dimensao": "Autonomia",
    "indicador": "Decisões no nível certo",
    "o_que_identifica": "Identifica se tudo precisa subir para sócios ou líderes.",
    "pergunta": "As pessoas tomam decisões compatíveis com suas responsabilidades.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A rotina trava porque decisões simples dependem sempre de poucas pessoas.",
    "identidade_aprofunda": "Investigar centralização, confiança, preparo, medo de errar e critérios de decisão."
  },
  {
    "id": "MM2-PES-03",
    "sistema": "Pessoas",
    "dimensao": "Liderança",
    "indicador": "Acompanhamento da execução",
    "o_que_identifica": "Identifica se líderes acompanham prioridades e removem obstáculos.",
    "pergunta": "As lideranças acompanham entregas, prioridades e obstáculos com frequência.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A liderança só percebe problemas quando eles já estão grandes.",
    "identidade_aprofunda": "Investigar rituais de liderança, feedback, metas, comunicação e preparo dos líderes."
  },
  {
    "id": "MM2-PES-04",
    "sistema": "Pessoas",
    "dimensao": "Produtividade",
    "indicador": "Ritmo de entrega",
    "o_que_identifica": "Identifica se a equipe entrega com ritmo adequado ou vive apagando incêndios.",
    "pergunta": "A equipe entrega o prioritário sem viver em constante urgência.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A rotina é dominada por urgências, retrabalho e interrupções.",
    "identidade_aprofunda": "Investigar prioridades, processos, capacidade, competências e organização do trabalho."
  },
  {
    "id": "MM2-PES-05",
    "sistema": "Pessoas",
    "dimensao": "Competências",
    "indicador": "Preparo para a função",
    "o_que_identifica": "Identifica se a equipe tem competências suficientes para a entrega atual.",
    "pergunta": "As pessoas têm preparo técnico e comportamental para suas funções.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Falhas de entrega estão ligadas a lacunas de preparo ou comportamento.",
    "identidade_aprofunda": "Investigar competências por função, trilhas de desenvolvimento e perfil comportamental."
  },
  {
    "id": "MM2-PES-06",
    "sistema": "Pessoas",
    "dimensao": "Atendimento",
    "indicador": "Padrão de atendimento",
    "o_que_identifica": "Identifica se o cliente recebe experiência consistente independentemente de quem atende.",
    "pergunta": "O atendimento ao cliente é consistente, independentemente da pessoa ou canal.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A experiência do cliente varia muito conforme quem atende.",
    "identidade_aprofunda": "Investigar treinamento, cultura de atendimento, comunicação, liderança e critérios de qualidade."
  },
  {
    "id": "MM2-PES-07",
    "sistema": "Pessoas",
    "dimensao": "Centralização",
    "indicador": "Delegação sustentada",
    "o_que_identifica": "Identifica se a delegação se sustenta ou se o controle volta para a direção.",
    "pergunta": "A direção delega decisões e as respeita, sem retomar o controle.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "As decisões voltam para os sócios/direção e a delegação não se sustenta.",
    "identidade_aprofunda": "Investigar centralização, confiança, autonomia, preparo dos líderes e critérios de decisão."
  },
  {
    "id": "MM2-PES-08",
    "sistema": "Pessoas",
    "dimensao": "Responsabilidade",
    "indicador": "Senso de dono",
    "o_que_identifica": "Identifica se as pessoas assumem compromissos até a conclusão.",
    "pergunta": "As pessoas assumem responsabilidade por suas entregas, compromissos e resultados.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "Demandas ficam sem dono, paradas ou precisam ser cobradas repetidamente.",
    "identidade_aprofunda": "Investigar cultura de responsabilização, autonomia, feedback e acompanhamento."
  },
  {
    "id": "MM2-PES-09",
    "sistema": "Pessoas",
    "dimensao": "Retenção",
    "indicador": "Manutenção de pessoas importantes",
    "o_que_identifica": "Identifica risco de perda de pessoas-chave ou dificuldade de manter talentos.",
    "pergunta": "A empresa retém os profissionais importantes para operação e crescimento.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A saída ou desmotivação de pessoas-chave ameaça a continuidade do negócio.",
    "identidade_aprofunda": "Investigar reconhecimento, liderança, clima, proposta ao colaborador e plano de desenvolvimento."
  },
  {
    "id": "MM2-PES-10",
    "sistema": "Pessoas",
    "dimensao": "Liderança estratégica",
    "indicador": "Tempo para o estratégico",
    "o_que_identifica": "Identifica se a liderança consegue sair do operacional para pensar o negócio.",
    "pergunta": "Os líderes dedicam tempo a pensar o futuro do negócio.",
    "response_type": "escala4_frequencia",
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
        "label": "Não sei/Não se aplica",
        "value": -1
      }
    ],
    "score_family": "maturity",
    "pontua": true,
    "peso": 1,
    "relevancia": 10,
    "exibicao": "nucleo",
    "regra_condicional": null,
    "obrigatoria": true,
    "sinal_alerta": "A liderança vive apagando incêndios e não sobra tempo para pensar o negócio.",
    "identidade_aprofunda": "Investigar papéis, delegação, prioridades da liderança e desenvolvimento de gestores."
  }
];

export const REGUA_MATURIDADE = [
  {
    "min": 0,
    "max": 29,
    "faixa": "0% a 29%",
    "nivel": 1,
    "nivel_nome": "Crítico/Reativo",
    "leitura": "Há muitos sinais de fragilidade operacional e baixa integração entre os sistemas.",
    "mensagem": "O Mapa da Identidade deve ser indicado para entender as causas antes de qualquer plano de ação."
  },
  {
    "min": 30,
    "max": 56,
    "faixa": "30% a 56%",
    "nivel": 2,
    "nivel_nome": "Em estruturação",
    "leitura": "Há práticas em andamento, mas elas ainda não geram consistência suficiente.",
    "mensagem": "O aprofundamento deve priorizar os sistemas com menor pontuação e os sintomas recorrentes."
  },
  {
    "min": 57,
    "max": 83,
    "faixa": "57% a 83%",
    "nivel": 3,
    "nivel_nome": "Em consolidação",
    "leitura": "A empresa possui boa base, mas ainda apresenta lacunas que limitam crescimento e percepção de valor.",
    "mensagem": "O Mapa da Identidade deve explicar as inconsistências e indicar onde evoluir."
  },
  {
    "min": 84,
    "max": 100,
    "faixa": "84% a 100%",
    "nivel": 4,
    "nivel_nome": "Integrado",
    "leitura": "A empresa demonstra boa maturidade nos sinais avaliados.",
    "mensagem": "O aprofundamento pode focar diferenciação, escala, refinamento de posicionamento e oportunidades."
  }
];

export const CADASTRO_MATURIDADE = [
  {
    "id": "CAD-MM-001",
    "campo": "Nome",
    "pergunta": "Nome do respondente",
    "response_type": "texto_curto",
    "opcoes": [],
    "uso": "Identificação do lead/empresa"
  },
  {
    "id": "CAD-MM-002",
    "campo": "Empresa",
    "pergunta": "Nome da empresa",
    "response_type": "texto_curto",
    "opcoes": [],
    "uso": "Identificação da empresa avaliada"
  },
  {
    "id": "CAD-MM-003",
    "campo": "Papel",
    "pergunta": "Qual é seu papel na empresa?",
    "response_type": "selecao_unica",
    "opcoes": [
      "Fundador(a)",
      "Sócio(a)",
      "Diretor(a)",
      "Gestor(a)",
      "Outro"
    ],
    "uso": "Confirmar se a pessoa possui visão geral do negócio"
  },
  {
    "id": "CAD-MM-004",
    "campo": "Porte",
    "pergunta": "Quantas pessoas trabalham atualmente na empresa?",
    "response_type": "selecao_unica",
    "opcoes": [
      "1 a 4",
      "5 a 10",
      "11 a 30",
      "31 a 100",
      "Mais de 100"
    ],
    "uso": "Segmentar resultados por porte"
  },
  {
    "id": "CAD-MM-005",
    "campo": "Segmento",
    "pergunta": "Qual é o principal segmento de atuação da empresa?",
    "response_type": "texto_curto",
    "opcoes": [],
    "uso": "Segmentar resultados por setor"
  },
  {
    "id": "CAD-MM-006",
    "campo": "Contato",
    "pergunta": "Qual é seu melhor e-mail ou WhatsApp para receber o resultado?",
    "response_type": "texto_curto",
    "opcoes": [],
    "uso": "Envio do resultado do mapa"
  }
];
