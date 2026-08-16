// =====================================================================
// GERADO AUTOMATICAMENTE — NÃO EDITAR À MÃO.
// Fonte: data/competencias/itens_v1.xlsx + data/competencias/faixas_v5.xlsx
// Regenerar: node scripts/build-competencias.cjs
//
// Desenho: 12 blocos · 12 competências · 4 aparições cada
// Score por competência varia de -4 a +4; a soma dos 12 é sempre 0.
// Itens ancorados: 24 de 24 · 22 ainda em RASCUNHO (não calibrados)
// =====================================================================

export const CATALOGO_VERSAO = "itens-v1";
export const FAIXAS_VERSAO = "faixas-v5";

export const CAPACIDADES = [
  "Sustentar-se",
  "Decidir",
  "Traduzir Valor",
  "Fazer Acontecer"
];
export const PILARES = [
  "determinacao",
  "conexao",
  "constancia",
  "precisao"
];

export const N_BLOCOS = 12;
export const K_APARICOES = 4;

/** Competências sem cobertura de âncora de evidência — não têm verificação factual. */
export const SEM_ANCORA = [
  "persistir_ajustar",
  "coerencia_etica",
  "formular_valor",
  "comunicar_posicionar"
];

export const COMPETENCIAS = [
  {
    "chave": "autoconsciencia",
    "nome": "Autoconsciência e autoeficácia",
    "capacidade": "Sustentar-se"
  },
  {
    "chave": "persistir_ajustar",
    "nome": "Persistir e ajustar",
    "capacidade": "Sustentar-se"
  },
  {
    "chave": "coerencia_etica",
    "nome": "Coerência ética",
    "capacidade": "Sustentar-se"
  },
  {
    "chave": "leitura_oportunidade",
    "nome": "Leitura de oportunidade e de cliente",
    "capacidade": "Decidir"
  },
  {
    "chave": "julgamento_incerteza",
    "nome": "Julgamento sob incerteza",
    "capacidade": "Decidir"
  },
  {
    "chave": "direcao_modelo",
    "nome": "Direção e modelo de negócio",
    "capacidade": "Decidir"
  },
  {
    "chave": "formular_valor",
    "nome": "Formular a proposta de valor",
    "capacidade": "Traduzir Valor"
  },
  {
    "chave": "comunicar_posicionar",
    "nome": "Comunicar e posicionar",
    "capacidade": "Traduzir Valor"
  },
  {
    "chave": "vender_negociar",
    "nome": "Vender, negociar e relacionar",
    "capacidade": "Traduzir Valor"
  },
  {
    "chave": "iniciativa_experimentacao",
    "nome": "Iniciativa e experimentação",
    "capacidade": "Fazer Acontecer"
  },
  {
    "chave": "gestao_recursos",
    "nome": "Gestão de recursos e operação",
    "capacidade": "Fazer Acontecer"
  },
  {
    "chave": "liderar_mobilizar",
    "nome": "Liderar e mobilizar pessoas",
    "capacidade": "Fazer Acontecer"
  }
];

export const BLOCOS = [
  {
    "id": "B01",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Peço a quem trabalha comigo um retorno franco sobre a minha condução",
        "capacidade": "Sustentar-se",
        "competencia": "autoconsciencia"
      },
      {
        "opcao": "B",
        "afirmacao": "Converso com clientes para entender o problema, não para vender",
        "capacidade": "Decidir",
        "competencia": "leitura_oportunidade"
      },
      {
        "opcao": "C",
        "afirmacao": "Explico o que o negócio entrega em uma frase que o cliente repete",
        "capacidade": "Traduzir Valor",
        "competencia": "formular_valor"
      },
      {
        "opcao": "D",
        "afirmacao": "Testo uma ideia nova em pequena escala antes de investir",
        "capacidade": "Fazer Acontecer",
        "competencia": "iniciativa_experimentacao"
      }
    ]
  },
  {
    "id": "B02",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Depois de um mês ruim, mudo a abordagem em vez de insistir",
        "capacidade": "Sustentar-se",
        "competencia": "persistir_ajustar"
      },
      {
        "opcao": "B",
        "afirmacao": "Defino quanto posso perder antes de entrar numa aposta nova",
        "capacidade": "Decidir",
        "competencia": "julgamento_incerteza"
      },
      {
        "opcao": "C",
        "afirmacao": "O mercado entende com clareza no que a minha empresa é boa",
        "capacidade": "Traduzir Valor",
        "competencia": "comunicar_posicionar"
      },
      {
        "opcao": "D",
        "afirmacao": "Sei quantos meses o caixa da empresa aguenta hoje",
        "capacidade": "Fazer Acontecer",
        "competencia": "gestao_recursos"
      }
    ]
  },
  {
    "id": "B03",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Recuso negócio que dá dinheiro mas contraria o que a empresa defende",
        "capacidade": "Sustentar-se",
        "competencia": "coerencia_etica"
      },
      {
        "opcao": "B",
        "afirmacao": "Sei dizer em uma frase como o negócio ganha dinheiro",
        "capacidade": "Decidir",
        "competencia": "direcao_modelo"
      },
      {
        "opcao": "C",
        "afirmacao": "Procuro clientes novos toda semana, mesmo com a agenda cheia",
        "capacidade": "Traduzir Valor",
        "competencia": "vender_negociar"
      },
      {
        "opcao": "D",
        "afirmacao": "Delego tarefas importantes e não refaço o trabalho do outro",
        "capacidade": "Fazer Acontecer",
        "competencia": "liderar_mobilizar"
      }
    ]
  },
  {
    "id": "B04",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Reconheço na frente da equipe quando uma decisão minha deu errado",
        "capacidade": "Sustentar-se",
        "competencia": "autoconsciencia"
      },
      {
        "opcao": "B",
        "afirmacao": "Decido com a informação que tenho, em vez de esperar por mais",
        "capacidade": "Decidir",
        "competencia": "julgamento_incerteza"
      },
      {
        "opcao": "C",
        "afirmacao": "Peço o fechamento em vez de esperar o cliente voltar",
        "capacidade": "Traduzir Valor",
        "competencia": "vender_negociar"
      },
      {
        "opcao": "D",
        "afirmacao": "Calculo a margem antes de fechar um preço",
        "capacidade": "Fazer Acontecer",
        "competencia": "gestao_recursos"
      }
    ]
  },
  {
    "id": "B05",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Atravesso períodos de resultado fraco sem perder o ritmo de trabalho",
        "capacidade": "Sustentar-se",
        "competencia": "persistir_ajustar"
      },
      {
        "opcao": "B",
        "afirmacao": "Escolho conscientemente que tipo de cliente não quero atender",
        "capacidade": "Decidir",
        "competencia": "direcao_modelo"
      },
      {
        "opcao": "C",
        "afirmacao": "Encontro um jeito diferente de resolver o problema do cliente",
        "capacidade": "Traduzir Valor",
        "competencia": "formular_valor"
      },
      {
        "opcao": "D",
        "afirmacao": "Dou o retorno difícil na hora, sem adiar para a próxima semana",
        "capacidade": "Fazer Acontecer",
        "competencia": "liderar_mobilizar"
      }
    ]
  },
  {
    "id": "B06",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Cumpro o combinado com fornecedor mesmo quando ninguém cobraria",
        "capacidade": "Sustentar-se",
        "competencia": "coerencia_etica"
      },
      {
        "opcao": "B",
        "afirmacao": "Percebo o que o cliente faz, não só o que ele diz",
        "capacidade": "Decidir",
        "competencia": "leitura_oportunidade"
      },
      {
        "opcao": "C",
        "afirmacao": "Falo do meu trabalho de um jeito que desperta interesse",
        "capacidade": "Traduzir Valor",
        "competencia": "comunicar_posicionar"
      },
      {
        "opcao": "D",
        "afirmacao": "Começo o que precisa ser feito sem esperar o momento ideal",
        "capacidade": "Fazer Acontecer",
        "competencia": "iniciativa_experimentacao"
      }
    ]
  },
  {
    "id": "B07",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Sei nomear as duas coisas que eu faço pior no negócio",
        "capacidade": "Sustentar-se",
        "competencia": "autoconsciencia"
      },
      {
        "opcao": "B",
        "afirmacao": "Defino metas com número e prazo, e acompanho numa rotina fixa",
        "capacidade": "Decidir",
        "competencia": "direcao_modelo"
      },
      {
        "opcao": "C",
        "afirmacao": "Mantenho uma mensagem consistente em todos os canais",
        "capacidade": "Traduzir Valor",
        "competencia": "comunicar_posicionar"
      },
      {
        "opcao": "D",
        "afirmacao": "Trato o conflito diretamente com quem está envolvido",
        "capacidade": "Fazer Acontecer",
        "competencia": "liderar_mobilizar"
      }
    ]
  },
  {
    "id": "B08",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Abandono uma linha de produto quando os números não confirmam a aposta",
        "capacidade": "Sustentar-se",
        "competencia": "persistir_ajustar"
      },
      {
        "opcao": "B",
        "afirmacao": "Identifico um segmento mal atendido antes dos concorrentes",
        "capacidade": "Decidir",
        "competencia": "leitura_oportunidade"
      },
      {
        "opcao": "C",
        "afirmacao": "Sustento o preço quando o cliente pede desconto",
        "capacidade": "Traduzir Valor",
        "competencia": "vender_negociar"
      },
      {
        "opcao": "D",
        "afirmacao": "Faço mudanças no negócio a partir do que o teste mostrou",
        "capacidade": "Fazer Acontecer",
        "competencia": "iniciativa_experimentacao"
      }
    ]
  },
  {
    "id": "B09",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Considero o efeito sobre a equipe antes de decidir um corte",
        "capacidade": "Sustentar-se",
        "competencia": "coerencia_etica"
      },
      {
        "opcao": "B",
        "afirmacao": "Comparo dois ou três caminhos antes de escolher um",
        "capacidade": "Decidir",
        "competencia": "julgamento_incerteza"
      },
      {
        "opcao": "C",
        "afirmacao": "Sei dizer por que o cliente escolhe a gente e não o concorrente",
        "capacidade": "Traduzir Valor",
        "competencia": "formular_valor"
      },
      {
        "opcao": "D",
        "afirmacao": "Padronizo o que se repete para não depender de mim",
        "capacidade": "Fazer Acontecer",
        "competencia": "gestao_recursos"
      }
    ]
  },
  {
    "id": "B10",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Assumo projetos que exigem mais do que eu já provei que dou conta",
        "capacidade": "Sustentar-se",
        "competencia": "autoconsciencia"
      },
      {
        "opcao": "B",
        "afirmacao": "Descubro por que um cliente parou de comprar, indo atrás dele",
        "capacidade": "Decidir",
        "competencia": "leitura_oportunidade"
      },
      {
        "opcao": "C",
        "afirmacao": "Mantenho contato com clientes antigos sem ter nada a vender",
        "capacidade": "Traduzir Valor",
        "competencia": "vender_negociar"
      },
      {
        "opcao": "D",
        "afirmacao": "Deixo claro para cada pessoa o que se espera dela",
        "capacidade": "Fazer Acontecer",
        "competencia": "liderar_mobilizar"
      }
    ]
  },
  {
    "id": "B11",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Retomo negociações que travaram, com um ângulo diferente",
        "capacidade": "Sustentar-se",
        "competencia": "persistir_ajustar"
      },
      {
        "opcao": "B",
        "afirmacao": "Assumo um risco calculado quando a janela de oportunidade é curta",
        "capacidade": "Decidir",
        "competencia": "julgamento_incerteza"
      },
      {
        "opcao": "C",
        "afirmacao": "Transformo um pedido difícil de cliente numa oferta nova",
        "capacidade": "Traduzir Valor",
        "competencia": "formular_valor"
      },
      {
        "opcao": "D",
        "afirmacao": "Levo uma ideia adiante mesmo sem ter todo o time convencido",
        "capacidade": "Fazer Acontecer",
        "competencia": "iniciativa_experimentacao"
      }
    ]
  },
  {
    "id": "B12",
    "opcoes": [
      {
        "opcao": "A",
        "afirmacao": "Digo ao cliente quando a minha solução não é a melhor para ele",
        "capacidade": "Sustentar-se",
        "competencia": "coerencia_etica"
      },
      {
        "opcao": "B",
        "afirmacao": "Recuso oportunidades que não cabem na direção que escolhi",
        "capacidade": "Decidir",
        "competencia": "direcao_modelo"
      },
      {
        "opcao": "C",
        "afirmacao": "Adapto a mensagem a públicos diferentes sem perder o essencial",
        "capacidade": "Traduzir Valor",
        "competencia": "comunicar_posicionar"
      },
      {
        "opcao": "D",
        "afirmacao": "Separo com rigor as contas pessoais das contas da empresa",
        "capacidade": "Fazer Acontecer",
        "competencia": "gestao_recursos"
      }
    ]
  }
];

export const BANCO_ITENS = [
  {
    "chave": "autoconsciencia",
    "n": 1,
    "afirmacao": "Peço a quem trabalha comigo um retorno franco sobre a minha condução",
    "bloco": "B01"
  },
  {
    "chave": "autoconsciencia",
    "n": 2,
    "afirmacao": "Reconheço na frente da equipe quando uma decisão minha deu errado",
    "bloco": "B04"
  },
  {
    "chave": "autoconsciencia",
    "n": 3,
    "afirmacao": "Sei nomear as duas coisas que eu faço pior no negócio",
    "bloco": "B07"
  },
  {
    "chave": "autoconsciencia",
    "n": 4,
    "afirmacao": "Assumo projetos que exigem mais do que eu já provei que dou conta",
    "bloco": "B10"
  },
  {
    "chave": "persistir_ajustar",
    "n": 1,
    "afirmacao": "Depois de um mês ruim, mudo a abordagem em vez de insistir",
    "bloco": "B02"
  },
  {
    "chave": "persistir_ajustar",
    "n": 2,
    "afirmacao": "Atravesso períodos de resultado fraco sem perder o ritmo de trabalho",
    "bloco": "B05"
  },
  {
    "chave": "persistir_ajustar",
    "n": 3,
    "afirmacao": "Abandono uma linha de produto quando os números não confirmam a aposta",
    "bloco": "B08"
  },
  {
    "chave": "persistir_ajustar",
    "n": 4,
    "afirmacao": "Retomo negociações que travaram, com um ângulo diferente",
    "bloco": "B11"
  },
  {
    "chave": "coerencia_etica",
    "n": 1,
    "afirmacao": "Recuso negócio que dá dinheiro mas contraria o que a empresa defende",
    "bloco": "B03"
  },
  {
    "chave": "coerencia_etica",
    "n": 2,
    "afirmacao": "Cumpro o combinado com fornecedor mesmo quando ninguém cobraria",
    "bloco": "B06"
  },
  {
    "chave": "coerencia_etica",
    "n": 3,
    "afirmacao": "Considero o efeito sobre a equipe antes de decidir um corte",
    "bloco": "B09"
  },
  {
    "chave": "coerencia_etica",
    "n": 4,
    "afirmacao": "Digo ao cliente quando a minha solução não é a melhor para ele",
    "bloco": "B12"
  },
  {
    "chave": "leitura_oportunidade",
    "n": 1,
    "afirmacao": "Converso com clientes para entender o problema, não para vender",
    "bloco": "B01"
  },
  {
    "chave": "leitura_oportunidade",
    "n": 2,
    "afirmacao": "Percebo o que o cliente faz, não só o que ele diz",
    "bloco": "B06"
  },
  {
    "chave": "leitura_oportunidade",
    "n": 3,
    "afirmacao": "Identifico um segmento mal atendido antes dos concorrentes",
    "bloco": "B08"
  },
  {
    "chave": "leitura_oportunidade",
    "n": 4,
    "afirmacao": "Descubro por que um cliente parou de comprar, indo atrás dele",
    "bloco": "B10"
  },
  {
    "chave": "julgamento_incerteza",
    "n": 1,
    "afirmacao": "Defino quanto posso perder antes de entrar numa aposta nova",
    "bloco": "B02"
  },
  {
    "chave": "julgamento_incerteza",
    "n": 2,
    "afirmacao": "Decido com a informação que tenho, em vez de esperar por mais",
    "bloco": "B04"
  },
  {
    "chave": "julgamento_incerteza",
    "n": 3,
    "afirmacao": "Comparo dois ou três caminhos antes de escolher um",
    "bloco": "B09"
  },
  {
    "chave": "julgamento_incerteza",
    "n": 4,
    "afirmacao": "Assumo um risco calculado quando a janela de oportunidade é curta",
    "bloco": "B11"
  },
  {
    "chave": "direcao_modelo",
    "n": 1,
    "afirmacao": "Sei dizer em uma frase como o negócio ganha dinheiro",
    "bloco": "B03"
  },
  {
    "chave": "direcao_modelo",
    "n": 2,
    "afirmacao": "Escolho conscientemente que tipo de cliente não quero atender",
    "bloco": "B05"
  },
  {
    "chave": "direcao_modelo",
    "n": 3,
    "afirmacao": "Defino metas com número e prazo, e acompanho numa rotina fixa",
    "bloco": "B07"
  },
  {
    "chave": "direcao_modelo",
    "n": 4,
    "afirmacao": "Recuso oportunidades que não cabem na direção que escolhi",
    "bloco": "B12"
  },
  {
    "chave": "formular_valor",
    "n": 1,
    "afirmacao": "Explico o que o negócio entrega em uma frase que o cliente repete",
    "bloco": "B01"
  },
  {
    "chave": "formular_valor",
    "n": 2,
    "afirmacao": "Encontro um jeito diferente de resolver o problema do cliente",
    "bloco": "B05"
  },
  {
    "chave": "formular_valor",
    "n": 3,
    "afirmacao": "Sei dizer por que o cliente escolhe a gente e não o concorrente",
    "bloco": "B09"
  },
  {
    "chave": "formular_valor",
    "n": 4,
    "afirmacao": "Transformo um pedido difícil de cliente numa oferta nova",
    "bloco": "B11"
  },
  {
    "chave": "comunicar_posicionar",
    "n": 1,
    "afirmacao": "O mercado entende com clareza no que a minha empresa é boa",
    "bloco": "B02"
  },
  {
    "chave": "comunicar_posicionar",
    "n": 2,
    "afirmacao": "Falo do meu trabalho de um jeito que desperta interesse",
    "bloco": "B06"
  },
  {
    "chave": "comunicar_posicionar",
    "n": 3,
    "afirmacao": "Mantenho uma mensagem consistente em todos os canais",
    "bloco": "B07"
  },
  {
    "chave": "comunicar_posicionar",
    "n": 4,
    "afirmacao": "Adapto a mensagem a públicos diferentes sem perder o essencial",
    "bloco": "B12"
  },
  {
    "chave": "vender_negociar",
    "n": 1,
    "afirmacao": "Procuro clientes novos toda semana, mesmo com a agenda cheia",
    "bloco": "B03"
  },
  {
    "chave": "vender_negociar",
    "n": 2,
    "afirmacao": "Peço o fechamento em vez de esperar o cliente voltar",
    "bloco": "B04"
  },
  {
    "chave": "vender_negociar",
    "n": 3,
    "afirmacao": "Sustento o preço quando o cliente pede desconto",
    "bloco": "B08"
  },
  {
    "chave": "vender_negociar",
    "n": 4,
    "afirmacao": "Mantenho contato com clientes antigos sem ter nada a vender",
    "bloco": "B10"
  },
  {
    "chave": "iniciativa_experimentacao",
    "n": 1,
    "afirmacao": "Testo uma ideia nova em pequena escala antes de investir",
    "bloco": "B01"
  },
  {
    "chave": "iniciativa_experimentacao",
    "n": 2,
    "afirmacao": "Começo o que precisa ser feito sem esperar o momento ideal",
    "bloco": "B06"
  },
  {
    "chave": "iniciativa_experimentacao",
    "n": 3,
    "afirmacao": "Faço mudanças no negócio a partir do que o teste mostrou",
    "bloco": "B08"
  },
  {
    "chave": "iniciativa_experimentacao",
    "n": 4,
    "afirmacao": "Levo uma ideia adiante mesmo sem ter todo o time convencido",
    "bloco": "B11"
  },
  {
    "chave": "gestao_recursos",
    "n": 1,
    "afirmacao": "Sei quantos meses o caixa da empresa aguenta hoje",
    "bloco": "B02"
  },
  {
    "chave": "gestao_recursos",
    "n": 2,
    "afirmacao": "Calculo a margem antes de fechar um preço",
    "bloco": "B04"
  },
  {
    "chave": "gestao_recursos",
    "n": 3,
    "afirmacao": "Padronizo o que se repete para não depender de mim",
    "bloco": "B09"
  },
  {
    "chave": "gestao_recursos",
    "n": 4,
    "afirmacao": "Separo com rigor as contas pessoais das contas da empresa",
    "bloco": "B12"
  },
  {
    "chave": "liderar_mobilizar",
    "n": 1,
    "afirmacao": "Delego tarefas importantes e não refaço o trabalho do outro",
    "bloco": "B03"
  },
  {
    "chave": "liderar_mobilizar",
    "n": 2,
    "afirmacao": "Dou o retorno difícil na hora, sem adiar para a próxima semana",
    "bloco": "B05"
  },
  {
    "chave": "liderar_mobilizar",
    "n": 3,
    "afirmacao": "Trato o conflito diretamente com quem está envolvido",
    "bloco": "B07"
  },
  {
    "chave": "liderar_mobilizar",
    "n": 4,
    "afirmacao": "Deixo claro para cada pessoa o que se espera dela",
    "bloco": "B10"
  }
];

export const ANCORAS = [
  {
    "id": "EVI-01",
    "pergunta": "Nos últimos 30 dias, com quantos clientes ou potenciais clientes você conversou?",
    "opcoes": [
      {
        "label": "0",
        "valor": 0
      },
      {
        "label": "1 a 3",
        "valor": 1
      },
      {
        "label": "4 a 10",
        "valor": 2
      },
      {
        "label": "11 a 20",
        "valor": 3
      },
      {
        "label": "mais de 20",
        "valor": 4
      }
    ],
    "verifica": [
      "leitura_oportunidade",
      "vender_negociar"
    ]
  },
  {
    "id": "EVI-02",
    "pergunta": "Nos últimos 90 dias, quantas mudanças você fez no negócio a partir de um teste?",
    "opcoes": [
      {
        "label": "0",
        "valor": 0
      },
      {
        "label": "1",
        "valor": 1
      },
      {
        "label": "2 a 3",
        "valor": 2
      },
      {
        "label": "4 a 6",
        "valor": 3
      },
      {
        "label": "7 ou mais",
        "valor": 4
      }
    ],
    "verifica": [
      "iniciativa_experimentacao",
      "julgamento_incerteza"
    ]
  },
  {
    "id": "EVI-03",
    "pergunta": "Quando você olhou o fluxo de caixa da empresa pela última vez?",
    "opcoes": [
      {
        "label": "Nunca",
        "valor": 0
      },
      {
        "label": "Há mais de 6 meses",
        "valor": 1
      },
      {
        "label": "Neste trimestre",
        "valor": 2
      },
      {
        "label": "Neste mês",
        "valor": 3
      },
      {
        "label": "Esta semana",
        "valor": 4
      }
    ],
    "verifica": [
      "gestao_recursos",
      "direcao_modelo"
    ]
  },
  {
    "id": "EVI-04",
    "pergunta": "Nos últimos 90 dias, quantas conversas difíceis você teve com alguém do time?",
    "opcoes": [
      {
        "label": "0",
        "valor": 0
      },
      {
        "label": "1",
        "valor": 1
      },
      {
        "label": "2 a 3",
        "valor": 2
      },
      {
        "label": "4 a 6",
        "valor": 3
      },
      {
        "label": "7 ou mais",
        "valor": 4
      }
    ],
    "verifica": [
      "liderar_mobilizar",
      "autoconsciencia"
    ]
  }
];

/** Competências que ainda não têm os 2 itens ancorados. Vazio = etapa 2 completa. */
export const SEM_ANCORADOS_COMPLETOS = [];

/**
 * Quantos itens ancorados ainda são RASCUNHO — escritos seguindo as regras,
 * mas sem calibração de piloto. Enquanto for > 0, o relatório não deve
 * afirmar nível como se fosse validado.
 */
export const ANCORADOS_EM_RASCUNHO = 22;

export const ANCORADOS = [
  {
    "id": "ANC-vender_negociar-1",
    "competencia": "vender_negociar",
    "situacao": "Um cliente diz que o seu preço está alto.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Ofereço um desconto para não perder a venda"
      },
      {
        "nivel": 2,
        "texto": "Explico com mais detalhe tudo o que está incluído"
      },
      {
        "nivel": 3,
        "texto": "Pergunto com o que ele está comparando"
      },
      {
        "nivel": 4,
        "texto": "Investigo o resultado que ele espera e reabro a conversa"
      }
    ]
  },
  {
    "id": "ANC-gestao_recursos-1",
    "competencia": "gestao_recursos",
    "situacao": "Aparece uma oportunidade que exige investir agora.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Decido pelo que o movimento do caixa parece permitir"
      },
      {
        "nivel": 2,
        "texto": "Confiro o saldo em conta antes de decidir"
      },
      {
        "nivel": 3,
        "texto": "Projeto o caixa dos próximos meses e vejo se cabe"
      },
      {
        "nivel": 4,
        "texto": "Defino quanto posso perder e a que ponto eu desisto"
      }
    ]
  },
  {
    "competencia": "autoconsciencia",
    "situacao": "Uma decisão sua deu errado e a equipe percebeu.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Sigo em frente sem voltar ao assunto"
      },
      {
        "nivel": 2,
        "texto": "Assumo o erro na hora e mudo de rumo"
      },
      {
        "nivel": 3,
        "texto": "Explico o que me levou àquilo e o que faria diferente"
      },
      {
        "nivel": 4,
        "texto": "Peço à equipe o que eu não enxerguei e reviso o combinado"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-autoconsciencia-1"
  },
  {
    "competencia": "autoconsciencia",
    "situacao": "Você repete um mesmo tipo de erro há alguns meses.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Atribuo ao ritmo do período e sigo"
      },
      {
        "nivel": 2,
        "texto": "Redobro o cuidado nas próximas vezes"
      },
      {
        "nivel": 3,
        "texto": "Escrevo em que situações isso acontece e o que dispara"
      },
      {
        "nivel": 4,
        "texto": "Coloco alguém para me avisar quando o padrão aparecer"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-autoconsciencia-2"
  },
  {
    "competencia": "persistir_ajustar",
    "situacao": "Uma frente do negócio está no vermelho há três meses.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Espero o mercado melhorar antes de mexer"
      },
      {
        "nivel": 2,
        "texto": "Aumento o esforço na mesma direção"
      },
      {
        "nivel": 3,
        "texto": "Defino um prazo e um número que decidem se continuo"
      },
      {
        "nivel": 4,
        "texto": "Testo uma versão menor da frente antes de encerrar ou dobrar"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-persistir_ajustar-1"
  },
  {
    "competencia": "persistir_ajustar",
    "situacao": "Uma negociação importante travou e o cliente parou de responder.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Deixo de lado e foco em quem responde"
      },
      {
        "nivel": 2,
        "texto": "Insisto no mesmo contato até obter resposta"
      },
      {
        "nivel": 3,
        "texto": "Procuro entender o que mudou do lado dele antes de voltar"
      },
      {
        "nivel": 4,
        "texto": "Retomo com um desenho diferente, feito para o que travou"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-persistir_ajustar-2"
  },
  {
    "competencia": "coerencia_etica",
    "situacao": "Um fornecedor oferece vantagem pessoal para você fechar com ele.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Evito o assunto e adio a decisão"
      },
      {
        "nivel": 2,
        "texto": "Recuso e sigo com a cotação normal"
      },
      {
        "nivel": 3,
        "texto": "Recuso e digo a ele qual regra eu uso para escolher"
      },
      {
        "nivel": 4,
        "texto": "Recuso e deixo essa regra escrita para quem compra aqui"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-coerencia_etica-1"
  },
  {
    "competencia": "coerencia_etica",
    "situacao": "Dá para entregar menos do que combinou e ninguém vai notar.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Entrego como está, o cliente não vai perceber"
      },
      {
        "nivel": 2,
        "texto": "Entrego o combinado, mesmo custando mais"
      },
      {
        "nivel": 3,
        "texto": "Aviso o cliente do que mudou e reviso o prazo"
      },
      {
        "nivel": 4,
        "texto": "Mudo o jeito de fechar contrato para não prometer o que aperta"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-coerencia_etica-2"
  },
  {
    "competencia": "leitura_oportunidade",
    "situacao": "Um cliente antigo comprou bem menos este ano.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Espero ele voltar quando precisar"
      },
      {
        "nivel": 2,
        "texto": "Ofereço uma condição melhor para reativar"
      },
      {
        "nivel": 3,
        "texto": "Ligo para entender o que mudou no negócio dele"
      },
      {
        "nivel": 4,
        "texto": "Uso o que descobri para rever a oferta de clientes parecidos"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-leitura_oportunidade-1"
  },
  {
    "competencia": "leitura_oportunidade",
    "situacao": "Você ouve a mesma reclamação de três clientes diferentes.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Anoto e sigo, cada caso é um caso"
      },
      {
        "nivel": 2,
        "texto": "Resolvo o problema de cada um deles"
      },
      {
        "nivel": 3,
        "texto": "Procuro o que há em comum entre os três"
      },
      {
        "nivel": 4,
        "texto": "Mudo a etapa que gera a reclamação e aviso os demais"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-leitura_oportunidade-2"
  },
  {
    "competencia": "julgamento_incerteza",
    "situacao": "Aparece uma chance boa, mas com informação incompleta.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Deixo passar, sem dado eu não decido"
      },
      {
        "nivel": 2,
        "texto": "Vou pelo que a experiência diz"
      },
      {
        "nivel": 3,
        "texto": "Defino quanto posso perder e entro até esse limite"
      },
      {
        "nivel": 4,
        "texto": "Faço uma versão pequena que me dá o dado que falta"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-julgamento_incerteza-1"
  },
  {
    "competencia": "julgamento_incerteza",
    "situacao": "Dois caminhos possíveis e prazo curto para escolher.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Peço a alguém de fora que escolha por mim"
      },
      {
        "nivel": 2,
        "texto": "Escolho o que parece mais seguro"
      },
      {
        "nivel": 3,
        "texto": "Comparo os dois pelo que cada um custa se der errado"
      },
      {
        "nivel": 4,
        "texto": "Escolho um e defino o sinal que me faria voltar atrás"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-julgamento_incerteza-2"
  },
  {
    "competencia": "direcao_modelo",
    "situacao": "Chega um pedido grande, fora do que a empresa faz.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Aceito, é dinheiro entrando"
      },
      {
        "nivel": 2,
        "texto": "Aceito e depois vejo como entregar"
      },
      {
        "nivel": 3,
        "texto": "Calculo o que atender isso tira das outras entregas"
      },
      {
        "nivel": 4,
        "texto": "Recuso e digo ao cliente onde a empresa é realmente boa"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-direcao_modelo-1"
  },
  {
    "competencia": "direcao_modelo",
    "situacao": "Alguém pergunta em uma frase como a empresa ganha dinheiro.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Depende, cada mês é de um jeito"
      },
      {
        "nivel": 2,
        "texto": "Falo do que a gente mais vende"
      },
      {
        "nivel": 3,
        "texto": "Digo de onde vem a maior parte da margem"
      },
      {
        "nivel": 4,
        "texto": "Uso essa frase para decidir o que a empresa não faz"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-direcao_modelo-2"
  },
  {
    "competencia": "formular_valor",
    "situacao": "Um cliente pede algo que você não faz hoje.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Digo que não trabalhamos com isso"
      },
      {
        "nivel": 2,
        "texto": "Encaminho para alguém que faça"
      },
      {
        "nivel": 3,
        "texto": "Pergunto que resultado ele espera com aquilo"
      },
      {
        "nivel": 4,
        "texto": "Viro o pedido numa oferta que serve a outros clientes"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-formular_valor-1"
  },
  {
    "competencia": "formular_valor",
    "situacao": "Um cliente novo pergunta por que deveria escolher a sua empresa.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Falo do tempo de mercado e da estrutura"
      },
      {
        "nivel": 2,
        "texto": "Listo tudo o que a empresa entrega"
      },
      {
        "nivel": 3,
        "texto": "Digo o problema específico que a gente resolve melhor"
      },
      {
        "nivel": 4,
        "texto": "Mostro um caso parecido com o dele e o resultado"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-formular_valor-2"
  },
  {
    "competencia": "comunicar_posicionar",
    "situacao": "Sua equipe descreve a empresa de um jeito diferente do seu.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Cada um fala do seu jeito, tudo bem"
      },
      {
        "nivel": 2,
        "texto": "Corrijo quando ouço algo diferente"
      },
      {
        "nivel": 3,
        "texto": "Escrevo a frase que todos devem usar"
      },
      {
        "nivel": 4,
        "texto": "Monto a frase com eles a partir do que os clientes repetem"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-comunicar_posicionar-1"
  },
  {
    "competencia": "comunicar_posicionar",
    "situacao": "Você vai falar para um público que não conhece o seu setor.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Uso a mesma apresentação de sempre"
      },
      {
        "nivel": 2,
        "texto": "Tiro os termos técnicos da apresentação"
      },
      {
        "nivel": 3,
        "texto": "Começo pelo problema que aquele público reconhece"
      },
      {
        "nivel": 4,
        "texto": "Reescrevo o exemplo central com a realidade deles"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-comunicar_posicionar-2"
  },
  {
    "competencia": "vender_negociar",
    "situacao": "Uma proposta enviada há duas semanas não teve resposta.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Espero, se tiver interesse ele procura"
      },
      {
        "nivel": 2,
        "texto": "Reenvio o documento perguntando se chegou"
      },
      {
        "nivel": 3,
        "texto": "Ligo para saber o que falta para ele decidir"
      },
      {
        "nivel": 4,
        "texto": "Ofereço um primeiro passo menor para destravar a decisão"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-vender_negociar-2"
  },
  {
    "competencia": "iniciativa_experimentacao",
    "situacao": "Você tem uma ideia que pode melhorar a operação.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Guardo para quando sobrar tempo"
      },
      {
        "nivel": 2,
        "texto": "Aplico de uma vez em toda a operação"
      },
      {
        "nivel": 3,
        "texto": "Começo por uma parte pequena antes de estender"
      },
      {
        "nivel": 4,
        "texto": "Defino antes o que vou olhar para saber se funcionou"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-iniciativa_experimentacao-1"
  },
  {
    "competencia": "iniciativa_experimentacao",
    "situacao": "Um concorrente lançou algo que você vinha pensando em fazer.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Deixo para lá, ele saiu na frente"
      },
      {
        "nivel": 2,
        "texto": "Faço o mesmo, o quanto antes"
      },
      {
        "nivel": 3,
        "texto": "Vejo o que ele deixou de fora e começo por ali"
      },
      {
        "nivel": 4,
        "texto": "Coloco no ar uma versão simples para ouvir cliente rápido"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-iniciativa_experimentacao-2"
  },
  {
    "competencia": "gestao_recursos",
    "situacao": "Um custo fixo da empresa subiu bastante este mês.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Descubro quando o contador fecha o mês"
      },
      {
        "nivel": 2,
        "texto": "Corto o que der para cortar rápido"
      },
      {
        "nivel": 3,
        "texto": "Vejo quanto isso pesa na margem antes de mexer"
      },
      {
        "nivel": 4,
        "texto": "Reviso o preço ou o processo que criou esse custo"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-gestao_recursos-2"
  },
  {
    "competencia": "liderar_mobilizar",
    "situacao": "Alguém do time entrega abaixo do combinado há semanas.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Assumo a parte dela para não atrasar"
      },
      {
        "nivel": 2,
        "texto": "Chamo a atenção quando o atraso aparece"
      },
      {
        "nivel": 3,
        "texto": "Marco uma conversa e digo o que espero, com prazo"
      },
      {
        "nivel": 4,
        "texto": "Refaço o combinado e acompanho num ritmo fixo"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-liderar_mobilizar-1"
  },
  {
    "competencia": "liderar_mobilizar",
    "situacao": "Você precisa passar uma entrega importante para outra pessoa.",
    "niveis": [
      {
        "nivel": 1,
        "texto": "Faço eu mesmo, sai mais rápido"
      },
      {
        "nivel": 2,
        "texto": "Passo e vou conferindo cada etapa"
      },
      {
        "nivel": 3,
        "texto": "Explico o resultado esperado e combino pontos de checagem"
      },
      {
        "nivel": 4,
        "texto": "Deixo a pessoa decidir o caminho e respondo quando ela chama"
      }
    ],
    "rascunho": true,
    "versao": "ancorados-rascunho-v1",
    "id": "ANC-liderar_mobilizar-2"
  }
];

export const FAIXAS = [
  {
    "competencia": "autoconsciencia",
    "faixas": {
      "determinacao": {
        "minimo": 35,
        "maximo": 70
      },
      "conexao": {
        "minimo": 45,
        "maximo": 85
      },
      "constancia": {
        "minimo": 40,
        "maximo": 80
      },
      "precisao": {
        "minimo": 10,
        "maximo": 45
      }
    },
    "confianca": "MEDIA",
    "observacao": "Determinação em faixa média: alguma para autoeficácia, muita bloqueia autocrítica."
  },
  {
    "competencia": "persistir_ajustar",
    "faixas": {
      "determinacao": {
        "minimo": 35,
        "maximo": 75
      },
      "conexao": {
        "minimo": 25,
        "maximo": 65
      },
      "constancia": {
        "minimo": 50,
        "maximo": 90
      },
      "precisao": {
        "minimo": 10,
        "maximo": 50
      }
    },
    "confianca": "ALTA",
    "observacao": "Constância alta sustenta; Precisão alta transforma persistência em insistência."
  },
  {
    "competencia": "coerencia_etica",
    "faixas": {
      "determinacao": {
        "minimo": 10,
        "maximo": 50
      },
      "conexao": {
        "minimo": 40,
        "maximo": 80
      },
      "constancia": {
        "minimo": 45,
        "maximo": 85
      },
      "precisao": {
        "minimo": 30,
        "maximo": 60
      }
    },
    "confianca": "BAIXA",
    "observacao": "Valores não são estilo comportamental. Faixa indicativa; não usar como diagnóstico forte."
  },
  {
    "competencia": "leitura_oportunidade",
    "faixas": {
      "determinacao": {
        "minimo": 20,
        "maximo": 55
      },
      "conexao": {
        "minimo": 50,
        "maximo": 90
      },
      "constancia": {
        "minimo": 45,
        "maximo": 85
      },
      "precisao": {
        "minimo": 10,
        "maximo": 45
      }
    },
    "confianca": "ALTA",
    "observacao": "Oposição limpa: escuta pede Conexão e Constância; Precisão alta corta a conversa."
  },
  {
    "competencia": "julgamento_incerteza",
    "faixas": {
      "determinacao": {
        "minimo": 50,
        "maximo": 90
      },
      "conexao": {
        "minimo": 25,
        "maximo": 65
      },
      "constancia": {
        "minimo": 20,
        "maximo": 55
      },
      "precisao": {
        "minimo": 30,
        "maximo": 65
      }
    },
    "confianca": "ALTA",
    "observacao": "Precisão em faixa estreita nos dois lados: baixa = risco não calculado; alta = paralisia."
  },
  {
    "competencia": "direcao_modelo",
    "faixas": {
      "determinacao": {
        "minimo": 35,
        "maximo": 70
      },
      "conexao": {
        "minimo": 15,
        "maximo": 50
      },
      "constancia": {
        "minimo": 40,
        "maximo": 80
      },
      "precisao": {
        "minimo": 40,
        "maximo": 80
      }
    },
    "confianca": "MEDIA",
    "observacao": "Exige Constância e Precisão juntas — orçamento apertado, deixa pouco para os outros dois."
  },
  {
    "competencia": "formular_valor",
    "faixas": {
      "determinacao": {
        "minimo": 30,
        "maximo": 65
      },
      "conexao": {
        "minimo": 50,
        "maximo": 90
      },
      "constancia": {
        "minimo": 30,
        "maximo": 70
      },
      "precisao": {
        "minimo": 10,
        "maximo": 50
      }
    },
    "confianca": "ALTA",
    "observacao": "Precisão alta não simplifica: quer dizer tudo, e nada fica."
  },
  {
    "competencia": "comunicar_posicionar",
    "faixas": {
      "determinacao": {
        "minimo": 35,
        "maximo": 70
      },
      "conexao": {
        "minimo": 55,
        "maximo": 95
      },
      "constancia": {
        "minimo": 25,
        "maximo": 60
      },
      "precisao": {
        "minimo": 10,
        "maximo": 45
      }
    },
    "confianca": "ALTA",
    "observacao": "A faixa mais exigente em Conexão do modelo inteiro."
  },
  {
    "competencia": "vender_negociar",
    "faixas": {
      "determinacao": {
        "minimo": 45,
        "maximo": 85
      },
      "conexao": {
        "minimo": 50,
        "maximo": 90
      },
      "constancia": {
        "minimo": 10,
        "maximo": 45
      },
      "precisao": {
        "minimo": 25,
        "maximo": 60
      }
    },
    "confianca": "ALTA",
    "observacao": "Pede as duas pontas: firmeza para pedir e conexão para conquistar. Constância alta espera demais."
  },
  {
    "competencia": "iniciativa_experimentacao",
    "faixas": {
      "determinacao": {
        "minimo": 55,
        "maximo": 95
      },
      "conexao": {
        "minimo": 35,
        "maximo": 75
      },
      "constancia": {
        "minimo": 20,
        "maximo": 55
      },
      "precisao": {
        "minimo": 10,
        "maximo": 45
      }
    },
    "confianca": "ALTA",
    "observacao": "A faixa mais exigente em Determinação. Precisão alta: o teste nunca fica pronto."
  },
  {
    "competencia": "gestao_recursos",
    "faixas": {
      "determinacao": {
        "minimo": 15,
        "maximo": 50
      },
      "conexao": {
        "minimo": 20,
        "maximo": 55
      },
      "constancia": {
        "minimo": 40,
        "maximo": 80
      },
      "precisao": {
        "minimo": 50,
        "maximo": 90
      }
    },
    "confianca": "ALTA",
    "observacao": "Espelho de Iniciativa. Determinação alta compromete recurso sem base."
  },
  {
    "competencia": "liderar_mobilizar",
    "faixas": {
      "determinacao": {
        "minimo": 45,
        "maximo": 85
      },
      "conexao": {
        "minimo": 45,
        "maximo": 85
      },
      "constancia": {
        "minimo": 30,
        "maximo": 65
      },
      "precisao": {
        "minimo": 10,
        "maximo": 45
      }
    },
    "confianca": "MEDIA",
    "observacao": "Precisão alta refaz o trabalho do outro — não delega."
  }
];

export const LEITURA_FAIXA = [
  {
    "competencia": "autoconsciencia",
    "pilarCritico": "precisao",
    "abaixo": "Age sem checar o efeito que causa",
    "dentro": "Reflete sem travar",
    "acima": "Corta a reflexão antes que ela aconteça"
  },
  {
    "competencia": "persistir_ajustar",
    "pilarCritico": "constancia",
    "abaixo": "Abandona antes do resultado aparecer",
    "dentro": "Atravessa e ajusta",
    "acima": "Sustenta além do que faz sentido"
  },
  {
    "competencia": "coerencia_etica",
    "pilarCritico": "determinacao",
    "abaixo": "Cede diante de pressão",
    "dentro": "Sustenta a posição com equilíbrio",
    "acima": "Decide sozinho, sem freio externo"
  },
  {
    "competencia": "leitura_oportunidade",
    "pilarCritico": "conexao",
    "abaixo": "Não abre a conversa",
    "dentro": "Escuta e extrai padrão",
    "acima": "Fala mais do que escuta"
  },
  {
    "competencia": "julgamento_incerteza",
    "pilarCritico": "precisao",
    "abaixo": "Arrisca sem calcular a perda",
    "dentro": "Calcula e decide",
    "acima": "Paralisa buscando mais informação"
  },
  {
    "competencia": "direcao_modelo",
    "pilarCritico": "conexao",
    "abaixo": "Fecha direção sem consultar",
    "dentro": "Escolhe e comunica",
    "acima": "Abraça toda oportunidade nova, não fecha nada"
  },
  {
    "competencia": "formular_valor",
    "pilarCritico": "precisao",
    "abaixo": "Promete o que não entrega",
    "dentro": "Estrutura sem engessar",
    "acima": "Não consegue simplificar: quer dizer tudo"
  },
  {
    "competencia": "comunicar_posicionar",
    "pilarCritico": "conexao",
    "abaixo": "Comunica sem conquistar",
    "dentro": "Convence e engaja",
    "acima": "Encanta sem sustentar"
  },
  {
    "competencia": "vender_negociar",
    "pilarCritico": "determinacao",
    "abaixo": "Não pede o fechamento nem defende preço",
    "dentro": "Propõe com firmeza",
    "acima": "Pressiona e queima o relacionamento"
  },
  {
    "competencia": "iniciativa_experimentacao",
    "pilarCritico": "determinacao",
    "abaixo": "Espera autorização para agir",
    "dentro": "Começa e testa barato",
    "acima": "Age sem critério e não fecha"
  },
  {
    "competencia": "gestao_recursos",
    "pilarCritico": "precisao",
    "abaixo": "Não acompanha o que gasta",
    "dentro": "Controla sem burocratizar",
    "acima": "Controla tanto que trava a operação"
  },
  {
    "competencia": "liderar_mobilizar",
    "pilarCritico": "precisao",
    "abaixo": "Delega sem acompanhar",
    "dentro": "Confia e cobra",
    "acima": "Refaz o trabalho do outro — não delega"
  }
];
