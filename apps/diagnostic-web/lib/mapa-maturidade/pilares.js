// =====================================================================
// Mapa de Maturidade Espansione — pilares, perguntas e escala
// =====================================================================
// Modelo 2026-06-21 (v3): 7 PILARES × 7 perguntas (sem aprofundamento; o
// antigo pilar 8 "Direcionamento Competitivo" foi removido por redundância
// com o Território de Valor do Mapa de Identidade). Escala 0–3 + "Não se
// aplica" (-1), que NÃO conta no score. Conteúdo estático no git.

export const ESCALA = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Poucas vezes' },
  { value: 2, label: 'Muitas vezes' },
  { value: 3, label: 'Sempre' },
];

export const VALOR_NUNCA = 0;
// "Não se aplica": resposta válida (deixa concluir) mas excluída do cálculo.
// Persistida como -1 (a coluna value aceita -1; ver migration).
export const VALOR_NA = -1;
export const OPCAO_NA = { value: VALOR_NA, label: 'Não se aplica' };

export const MAX_POR_PERGUNTA = 3;
export const PERGUNTAS_POR_PILAR = 7;
export const MAX_SCORE_PILAR = PERGUNTAS_POR_PILAR * MAX_POR_PERGUNTA; // 21

// regras de N/A: pilar precisa de ≥4 respostas válidas; abaixo disso fica
// "dados insuficientes" e bloqueia a conclusão até revisão.
export const MIN_VALIDAS_PILAR = 4;
export const MAX_NA_POR_PILAR = PERGUNTAS_POR_PILAR - MIN_VALIDAS_PILAR; // 3

export function labelDaResposta(value) {
  if (value === VALOR_NA) return 'Não se aplica';
  const item = ESCALA.find((e) => e.value === value);
  return item ? item.label : null;
}

// ── Pilares (7 × 7) ──────────────────────────────────────────────────
export const PILARES = [
  {
    code: 'DE', name: 'Direção Estratégica', order: 1,
    mede: ['Clareza', 'Priorização', 'Foco'],
    trilha: 'Clareza Estratégica e Foco',
    perguntas: [
      { code: 'DE_01', text: 'As decisões importantes da empresa são tomadas com base em prioridades estratégicas claras.' },
      { code: 'DE_02', text: 'A empresa possui metas e prioridades claramente definidas para os próximos 12 meses.' },
      { code: 'DE_03', text: 'A liderança possui critérios claros para decidir quais clientes, mercados ou oportunidades devem ser priorizados.' },
      { code: 'DE_04', text: 'A empresa consegue dizer "não" para demandas, projetos ou oportunidades que desviam seu foco.' },
      { code: 'DE_05', text: 'Existe coerência entre os objetivos de crescimento da empresa e a estrutura disponível para sustentá-los.' },
      { code: 'DE_06', text: 'Os líderes dedicam tempo para pensar estrategicamente no futuro do negócio e não apenas para resolver questões operacionais.' },
      { code: 'DE_07', text: 'A empresa acompanha regularmente indicadores que mostram se a estratégia está sendo executada conforme o planejado.' },
    ],
  },
  {
    code: 'LI', name: 'Liderança', order: 2,
    mede: ['Autonomia', 'Delegação', 'Desenvolvimento'],
    trilha: 'Liderança que Gera Autonomia',
    perguntas: [
      { code: 'LI_01', text: 'As lideranças conseguem tomar decisões sem depender constantemente da aprovação dos sócios, fundadores ou direção.' },
      { code: 'LI_02', text: 'A delegação acontece com clareza sobre o que precisa ser feito, por quem e com qual nível de autonomia.' },
      { code: 'LI_03', text: 'Feedbacks, alinhamentos e conversas difíceis acontecem antes que os problemas se agravem.' },
      { code: 'LI_04', text: 'As lideranças desenvolvem pessoas em vez de apenas cobrar entregas ou resolver problemas operacionais.' },
      { code: 'LI_05', text: 'As decisões delegadas são respeitadas pela direção sem retomada constante de controle.' },
      { code: 'LI_06', text: 'Os líderes servem como exemplo dos comportamentos e valores esperados pela organização.' },
      { code: 'LI_07', text: 'As lideranças assumem responsabilidade pelos resultados da equipe sem transferir constantemente problemas para níveis superiores.' },
    ],
  },
  {
    code: 'CP', name: 'Cultura e Pessoas', order: 3,
    mede: ['Coerência cultural', 'Comportamento', 'Engajamento'],
    trilha: 'Cultura Viva e Comportamento Organizacional',
    perguntas: [
      { code: 'CP_01', text: 'Os comportamentos esperados das pessoas são claros e reforçados na rotina da empresa.' },
      { code: 'CP_02', text: 'Os valores da empresa aparecem nas decisões, atitudes da liderança e forma de trabalho da equipe.' },
      { code: 'CP_03', text: 'A empresa orienta, corrige e reconhece comportamentos de forma coerente com a cultura desejada.' },
      { code: 'CP_04', text: 'A empresa consegue atrair, engajar e reter pessoas alinhadas ao seu jeito de trabalhar.' },
      { code: 'CP_05', text: 'As pessoas entendem quais atitudes são valorizadas, toleradas ou inaceitáveis dentro da empresa.' },
      { code: 'CP_06', text: 'A equipe demonstra senso de responsabilidade pelos resultados coletivos e não apenas pelas atividades individuais.' },
      { code: 'CP_07', text: 'As pessoas sentem que pertencem à organização e contribuem para algo maior do que suas funções.' },
    ],
  },
  {
    code: 'PM', name: 'Posicionamento e Marca', order: 4,
    mede: ['Clareza', 'Diferenciação', 'Coerência'],
    trilha: 'Posicionamento e Diferenciação',
    perguntas: [
      { code: 'PM_01', text: 'A empresa comunica com clareza o que faz, para quem existe e por que é diferente.' },
      { code: 'PM_02', text: 'O posicionamento da empresa é compreendido pelo time e utilizado como referência para decisões e comunicação.' },
      { code: 'PM_03', text: 'A experiência entregue ao cliente confirma a promessa feita pela marca.' },
      { code: 'PM_04', text: 'A empresa evita mensagens genéricas e comunica diferenciais claros em relação aos concorrentes.' },
      { code: 'PM_05', text: 'Os clientes conseguem perceber diferenças claras entre a empresa e seus concorrentes.' },
      { code: 'PM_06', text: 'A empresa possui clareza sobre quais atributos deseja ser reconhecida pelo mercado.' },
      { code: 'PM_07', text: 'A identidade da empresa orienta decisões relacionadas à comunicação, atendimento e experiência do cliente.' },
    ],
  },
  {
    code: 'EC', name: 'Experiência do Cliente', order: 5,
    mede: ['Entrega', 'Valor', 'Satisfação'],
    trilha: 'Experiência e Valor ao Cliente',
    perguntas: [
      { code: 'EC_01', text: 'A experiência entregue ao cliente é consistente independentemente da pessoa ou área responsável pelo atendimento.' },
      { code: 'EC_02', text: 'A empresa coleta e utiliza feedbacks dos clientes para melhorar produtos, serviços ou processos.' },
      { code: 'EC_03', text: 'Os clientes demonstram confiança e tendem a permanecer ou recomendar a empresa.' },
      { code: 'EC_04', text: 'A experiência entregue reforça o posicionamento da marca.' },
      { code: 'EC_05', text: 'Existe preocupação constante em superar expectativas e gerar valor percebido.' },
      { code: 'EC_06', text: 'A empresa identifica rapidamente falhas que impactam a satisfação dos clientes.' },
      { code: 'EC_07', text: 'Os aprendizados obtidos com clientes influenciam decisões e melhorias internas.' },
    ],
  },
  {
    code: 'DC', name: 'Desenvolvimento Comercial', order: 6,
    mede: ['Iniciativa comercial', 'Escuta do cliente', 'Comunicação de valor'],
    trilha: 'Desenvolvimento Comercial',
    perguntas: [
      { code: 'DC_01', text: 'A equipe demonstra iniciativa para criar oportunidades de negócio e fortalecer relacionamentos.' },
      { code: 'DC_02', text: 'Os profissionais conseguem compreender as necessidades dos clientes antes de apresentar soluções.' },
      { code: 'DC_03', text: 'Existe confiança para conduzir conversas comerciais sem depender exclusivamente do preço como argumento.' },
      { code: 'DC_04', text: 'As pessoas lidam bem com objeções, recusas e perdas comerciais sem abandonar o processo.' },
      { code: 'DC_05', text: 'Os profissionais conseguem comunicar claramente o valor entregue pela empresa.' },
      { code: 'DC_06', text: 'A equipe comercial transmite credibilidade e confiança durante as interações com clientes.' },
      { code: 'DC_07', text: 'A empresa incentiva comportamentos comerciais alinhados ao posicionamento da marca.' },
    ],
  },
  {
    code: 'GE', name: 'Gestão da Execução', order: 7,
    mede: ['Planejamento', 'Acompanhamento', 'Escalabilidade'],
    trilha: 'Execução e Escalabilidade',
    perguntas: [
      { code: 'GE_01', text: 'As prioridades da empresa são transformadas em planos claros, com responsáveis e prazos definidos.' },
      { code: 'GE_02', text: 'A execução dos planos é acompanhada regularmente pela liderança.' },
      { code: 'GE_03', text: 'A empresa identifica desvios, atrasos ou riscos antes que eles se transformem em crises.' },
      { code: 'GE_04', text: 'A empresa consegue absorver crescimento, novas demandas ou mudanças sem gerar excesso de caos ou sobrecarga.' },
      { code: 'GE_05', text: 'As reuniões e acompanhamentos geram decisões, responsáveis e próximos passos claros.' },
      { code: 'GE_06', text: 'As equipes possuem clareza sobre quais resultados precisam entregar e como seu desempenho será avaliado.' },
      { code: 'GE_07', text: 'A empresa mantém ritmo de execução mesmo diante de mudanças, imprevistos ou aumento de demandas.' },
    ],
  },
];

// ── Lookups derivados ────────────────────────────────────────────────
export const PILAR_BY_CODE = Object.fromEntries(PILARES.map((p) => [p.code, p]));
export const PILARES_ORDENADOS = [...PILARES].sort((a, b) => a.order - b.order);

export function perguntasDoPilar(code) {
  const p = PILAR_BY_CODE[code];
  if (!p) return [];
  return p.perguntas.map((q, i) => ({ ...q, pillar_code: code, ordem: i + 1 }));
}

// todas as 49 perguntas, em ordem de pilar — usado para validar completude
export const PERGUNTAS_TODAS = PILARES_ORDENADOS.flatMap((p) => perguntasDoPilar(p.code));

export const PERGUNTA_PILAR = (() => {
  const map = {};
  for (const p of PILARES) for (const q of p.perguntas) map[q.code] = p.code;
  return map;
})();

export const PERGUNTA_TEXTO = (() => {
  const map = {};
  for (const p of PILARES) for (const q of p.perguntas) map[q.code] = q.text;
  return map;
})();
