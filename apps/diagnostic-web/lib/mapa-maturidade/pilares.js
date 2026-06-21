// =====================================================================
// Mapa de Maturidade Espansione — definição de pilares, perguntas e escala
// =====================================================================
// Conteúdo ESTÁTICO do diagnóstico (versionado no git, não no banco).
// Toda regra de negócio (score, nível, aprofundamento, recomendação) vive
// em scoring.js e consome estas constantes. A interface NÃO deve embutir
// nenhuma destas listas — sempre importar daqui.
//
// Convenção de códigos:
//   - Pilar:       DE, LI, CP, IE, CO, PL
//   - Obrigatória: <PILAR>_01..05      (5 por pilar, 30 no total)
//   - Aprofundam.: <PILAR>_AP_01..03   (3 por pilar, 18 no total)

// ── Escala de frequência (4 pontos) ─────────────────────────────────
// Mesma escala para perguntas obrigatórias E de aprofundamento.
export const ESCALA = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Poucas vezes' },
  { value: 2, label: 'Muitas vezes' },
  { value: 3, label: 'Sempre' },
];

export const VALOR_NUNCA = 0;
export const MAX_POR_PERGUNTA = 3;
export const PERGUNTAS_POR_PILAR = 5;
export const MAX_SCORE_PILAR = PERGUNTAS_POR_PILAR * MAX_POR_PERGUNTA; // 15

// label legível a partir do valor numérico
export function labelDaResposta(value) {
  const item = ESCALA.find((e) => e.value === value);
  return item ? item.label : null;
}

// ── Pilares ──────────────────────────────────────────────────────────
// `order` controla a sequência de apresentação no questionário.
// `trilha` é a recomendação corretiva associada ao pilar.
export const PILARES = [
  {
    code: 'DE',
    name: 'Direção Estratégica',
    order: 1,
    description:
      'Clareza de direção, prioridades e coerência entre ambição de crescimento e estrutura.',
    trilha: 'Clareza Estratégica e Modelo de Crescimento',
    // metadado p/ interpretação (IA/relatório); não afeta o cálculo
    mede: ['clareza de direção', 'foco', 'escolhas estratégicas', 'modelo de crescimento', 'coerência entre ambição e estrutura'],
    subdimensoes: ['foco', 'alinhamento', 'renúncia estratégica', 'disciplina de escolha'],
    perguntas: [
      { code: 'DE_01', text: 'As decisões importantes da empresa são tomadas com base em prioridades estratégicas claras.' },
      { code: 'DE_02', text: 'A empresa tem clareza sobre onde quer chegar nos próximos meses e quais escolhas precisa fazer para isso.' },
      { code: 'DE_03', text: 'A liderança sabe quais clientes, mercados ou oportunidades devem ser priorizados.' },
      { code: 'DE_04', text: 'A empresa consegue dizer “não” para demandas, projetos ou oportunidades que desviam seu foco.' },
      { code: 'DE_05', text: 'Existe coerência entre os objetivos de crescimento da empresa e a estrutura disponível para sustentá-los.' },
    ],
    aprofundamento: [
      { code: 'DE_AP_01', text: 'A empresa revisa suas prioridades estratégicas antes de assumir novos projetos, clientes ou iniciativas relevantes.' },
      { code: 'DE_AP_02', text: 'As pessoas-chave da empresa conseguem explicar com clareza quais são as prioridades mais importantes no momento.' },
      { code: 'DE_AP_03', text: 'A empresa abandona, pausa ou ajusta iniciativas quando percebe que elas não contribuem para sua direção estratégica.' },
    ],
  },
  {
    code: 'LI',
    name: 'Liderança',
    order: 2,
    description:
      'Autonomia das lideranças, clareza de responsabilidades, delegação e desenvolvimento de pessoas.',
    trilha: 'Liderança que Gera Autonomia',
    mede: ['autonomia', 'delegação', 'clareza de papéis', 'desenvolvimento de líderes', 'tomada de decisão', 'maturidade de gestão'],
    subdimensoes: ['desenvolvimento de pessoas', 'autonomia real', 'prevenção de conflitos', 'maturidade de gestão'],
    perguntas: [
      { code: 'LI_01', text: 'As lideranças conseguem tomar decisões sem depender constantemente da aprovação dos sócios, fundadores ou direção.' },
      { code: 'LI_02', text: 'As responsabilidades de cada líder ou gestor são claras para a equipe.' },
      { code: 'LI_03', text: 'A delegação acontece com clareza sobre o que precisa ser feito, por quem e com qual nível de autonomia.' },
      { code: 'LI_04', text: 'Feedbacks, alinhamentos e conversas difíceis acontecem antes que os problemas se agravem.' },
      { code: 'LI_05', text: 'As lideranças desenvolvem pessoas, em vez de apenas cobrar entregas ou resolver problemas operacionais.' },
    ],
    aprofundamento: [
      { code: 'LI_AP_01', text: 'Os líderes acompanham a evolução das pessoas com conversas frequentes sobre desempenho, comportamento e desenvolvimento.' },
      { code: 'LI_AP_02', text: 'As decisões delegadas são respeitadas pela direção, sem retomada constante de controle ou interferência excessiva.' },
      { code: 'LI_AP_03', text: 'A liderança atua preventivamente diante de conflitos, desalinhamentos ou queda de desempenho.' },
    ],
  },
  {
    code: 'CP',
    name: 'Cultura e Pessoas',
    order: 3,
    description:
      'Comportamentos esperados, valores na prática, colaboração e atração/retenção de pessoas alinhadas.',
    trilha: 'Cultura Viva e Comportamento Organizacional',
    mede: ['cultura viva', 'comportamento coletivo', 'engajamento', 'colaboração', 'retenção', 'coerência interna', 'marca empregadora'],
    subdimensoes: ['coerência cultural', 'marca empregadora interna', 'integração', 'gestão de comportamentos'],
    perguntas: [
      { code: 'CP_01', text: 'Os comportamentos esperados das pessoas são claros e reforçados na rotina da empresa.' },
      { code: 'CP_02', text: 'Os valores da empresa aparecem nas decisões, nas atitudes da liderança e na forma como a equipe trabalha.' },
      { code: 'CP_03', text: 'As pessoas colaboram entre áreas ou funções com responsabilidade e compromisso com o resultado coletivo.' },
      { code: 'CP_04', text: 'A empresa orienta, corrige e reconhece comportamentos de forma coerente com a cultura desejada.' },
      { code: 'CP_05', text: 'A empresa consegue atrair, engajar e reter pessoas alinhadas ao seu jeito de trabalhar.' },
    ],
    aprofundamento: [
      { code: 'CP_AP_01', text: 'A empresa identifica rapidamente comportamentos desalinhados com a cultura desejada.' },
      { code: 'CP_AP_02', text: 'Os processos de contratação, integração e desenvolvimento reforçam o jeito de ser e trabalhar da empresa.' },
      { code: 'CP_AP_03', text: 'As pessoas entendem quais atitudes são valorizadas, toleradas ou inaceitáveis dentro da empresa.' },
    ],
  },
  {
    code: 'IE',
    name: 'Identidade Estratégica',
    order: 4,
    description:
      'Clareza e coerência de posicionamento, marca e experiência entregue ao cliente.',
    trilha: 'Identidade Estratégica e Posicionamento',
    mede: ['marca', 'posicionamento', 'diferenciação', 'narrativa', 'coerência simbólica', 'experiência', 'percepção de mercado'],
    subdimensoes: ['diferenciação', 'narrativa', 'coerência simbólica', 'expressão prática da identidade'],
    perguntas: [
      { code: 'IE_01', text: 'A empresa comunica com clareza o que faz, para quem existe e por que é diferente.' },
      { code: 'IE_02', text: 'A marca se expressa de forma coerente nos canais de comunicação, no atendimento e na experiência entregue ao cliente.' },
      { code: 'IE_03', text: 'O posicionamento da empresa é compreendido pelo time e usado como referência na comunicação e nas decisões.' },
      { code: 'IE_04', text: 'A experiência entregue ao cliente confirma a promessa que a empresa faz no mercado.' },
      { code: 'IE_05', text: 'A identidade da empresa é percebida de forma coerente por clientes, equipe e mercado.' },
    ],
    aprofundamento: [
      { code: 'IE_AP_01', text: 'A identidade da empresa orienta escolhas de comunicação, atendimento, experiência do cliente e posicionamento.' },
      { code: 'IE_AP_02', text: 'A empresa evita mensagens genéricas e comunica uma diferença clara em relação aos concorrentes.' },
      { code: 'IE_AP_03', text: 'A equipe consegue traduzir a identidade da empresa em atitudes, linguagem e experiência entregue ao cliente.' },
    ],
  },
  {
    code: 'CO',
    name: 'Comercial',
    order: 5,
    description:
      'Rotina comercial estruturada, acompanhamento de oportunidades, discurso de valor e indicadores.',
    trilha: 'Comercial com Coerência',
    mede: ['geração de demanda', 'rotina comercial', 'conversão', 'previsibilidade', 'discurso de venda', 'relacionamento', 'dependência comercial'],
    subdimensoes: ['inteligência comercial', 'proposta de valor', 'conversão', 'relacionamento', 'fidelização'],
    perguntas: [
      { code: 'CO_01', text: 'A empresa possui uma rotina comercial estruturada para gerar novas oportunidades.' },
      { code: 'CO_02', text: 'As oportunidades comerciais são acompanhadas de forma organizada até a conversão ou perda.' },
      { code: 'CO_03', text: 'O discurso comercial comunica o valor da empresa de forma clara, consistente e alinhada ao posicionamento.' },
      { code: 'CO_04', text: 'A empresa acompanha indicadores comerciais para entender geração de demanda, conversão e relacionamento com clientes.' },
      { code: 'CO_05', text: 'A geração de receita não depende exclusivamente de indicações, relacionamento pessoal dos sócios ou esforços pontuais.' },
    ],
    aprofundamento: [
      { code: 'CO_AP_01', text: 'A empresa conhece os principais motivos pelos quais clientes compram, não compram ou deixam de comprar.' },
      { code: 'CO_AP_02', text: 'A equipe comercial ou responsável pela venda utiliza argumentos alinhados ao valor real entregue pela empresa.' },
      { code: 'CO_AP_03', text: 'A empresa possui ações consistentes para manter relacionamento, gerar recompra ou estimular indicações qualificadas.' },
    ],
  },
  {
    code: 'PL',
    name: 'Planejamento',
    order: 6,
    description:
      'Transformação de prioridades em planos, acompanhamento da execução, processos e escalabilidade.',
    trilha: 'Planejamento, Execução e Escalabilidade',
    mede: ['organização', 'execução', 'rotina de gestão', 'acompanhamento', 'processos essenciais', 'produtividade', 'escalabilidade'],
    subdimensoes: ['priorização', 'rotina de gestão', 'execução', 'aprendizagem operacional', 'melhoria contínua'],
    perguntas: [
      { code: 'PL_01', text: 'As prioridades da empresa são transformadas em planos claros, com responsáveis e prazos definidos.' },
      { code: 'PL_02', text: 'A execução dos planos é acompanhada regularmente pela liderança.' },
      { code: 'PL_03', text: 'A empresa identifica desvios, atrasos ou riscos antes que eles se transformem em crises.' },
      { code: 'PL_04', text: 'Os processos essenciais estão claros o suficiente para que a operação não dependa apenas de pessoas específicas.' },
      { code: 'PL_05', text: 'A empresa consegue absorver crescimento, novas demandas ou mudanças sem gerar excesso de caos ou sobrecarga.' },
    ],
    aprofundamento: [
      { code: 'PL_AP_01', text: 'A empresa diferencia claramente o que é prioridade estratégica, urgência operacional e demanda circunstancial.' },
      { code: 'PL_AP_02', text: 'As reuniões, rituais ou acompanhamentos geram decisões, responsáveis e próximos passos claros.' },
      { code: 'PL_AP_03', text: 'A empresa aprende com atrasos, falhas ou retrabalhos e ajusta sua forma de planejar e executar.' },
    ],
  },
];

// ── Ordem de prioridade para desempate na seleção de aprofundamento ──
// (seção 5 do spec). Pilares mais "estruturantes" primeiro.
export const ORDEM_DESEMPATE = ['LI', 'PL', 'DE', 'CO', 'CP', 'IE'];

// ── Lookups derivados (memoizados em module scope) ──────────────────
export const PILAR_BY_CODE = Object.fromEntries(PILARES.map((p) => [p.code, p]));

export const PILARES_ORDENADOS = [...PILARES].sort((a, b) => a.order - b.order);

// todas as perguntas obrigatórias, em ordem de pilar
export const PERGUNTAS_OBRIGATORIAS = PILARES_ORDENADOS.flatMap((p) =>
  p.perguntas.map((q) => ({ ...q, pillar_code: p.code, is_deepening: false }))
);

// todas as perguntas de aprofundamento, indexadas por pilar
export const APROFUNDAMENTO_BY_PILAR = Object.fromEntries(
  PILARES.map((p) => [
    p.code,
    p.aprofundamento.map((q) => ({ ...q, pillar_code: p.code, is_deepening: true })),
  ])
);

// mapa code -> pillar_code (cobre obrigatórias E aprofundamento), para validar/atribuir respostas
export const PERGUNTA_PILAR = (() => {
  const map = {};
  for (const p of PILARES) {
    for (const q of p.perguntas) map[q.code] = p.code;
    for (const q of p.aprofundamento) map[q.code] = p.code;
  }
  return map;
})();
