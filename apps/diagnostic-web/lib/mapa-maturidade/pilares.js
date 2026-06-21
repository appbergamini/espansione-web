// =====================================================================
// Mapa de Maturidade Espansione — pilares, perguntas e escala
// =====================================================================
// Modelo 2026-06-21 (v2): 8 PILARES × 5 perguntas essenciais (sem
// aprofundamento). Escala de frequência 0–3 + "Não se aplica" (-1), que NÃO
// conta no score. Conteúdo estático no git; a UI sempre importa daqui.

// ── Escala de frequência (4 pontos) + "Não se aplica" ───────────────
export const ESCALA = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Poucas vezes' },
  { value: 2, label: 'Muitas vezes' },
  { value: 3, label: 'Sempre' },
];

export const VALOR_NUNCA = 0;
// "Não se aplica": resposta válida (deixa concluir) mas excluída do cálculo do
// pilar. Persistida como -1 (a coluna value aceita -1; ver migration).
export const VALOR_NA = -1;
export const OPCAO_NA = { value: VALOR_NA, label: 'Não se aplica' };

export const MAX_POR_PERGUNTA = 3;
export const PERGUNTAS_POR_PILAR = 5;
export const MAX_SCORE_PILAR = PERGUNTAS_POR_PILAR * MAX_POR_PERGUNTA; // 15

// regras de N/A
export const MAX_NA_POR_PILAR = 1;   // até 1 N/A: calcula proporcional
export const MIN_VALIDAS_PILAR = 4;  // < 4 válidas (≥2 N/A) → dados insuficientes

export function labelDaResposta(value) {
  if (value === VALOR_NA) return 'Não se aplica';
  const item = ESCALA.find((e) => e.value === value);
  return item ? item.label : null;
}

// ── Pilares (8 × 5) ──────────────────────────────────────────────────
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
      { code: 'DE_05', text: 'Os líderes dedicam tempo para pensar estrategicamente no futuro do negócio e não apenas para resolver questões operacionais.' },
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
      { code: 'LI_04', text: 'As lideranças desenvolvem pessoas, em vez de apenas cobrar entregas ou resolver problemas operacionais.' },
      { code: 'LI_05', text: 'As decisões delegadas são respeitadas pela direção, sem retomada constante de controle ou interferência excessiva.' },
    ],
  },
  {
    code: 'CP', name: 'Cultura e Pessoas', order: 3,
    mede: ['Coerência cultural', 'Comportamento', 'Engajamento'],
    trilha: 'Cultura Viva e Comportamento Organizacional',
    perguntas: [
      { code: 'CP_01', text: 'Os comportamentos esperados das pessoas são claros e reforçados na rotina da empresa.' },
      { code: 'CP_02', text: 'Os valores da empresa aparecem nas decisões, nas atitudes da liderança e na forma como a equipe trabalha.' },
      { code: 'CP_03', text: 'A empresa orienta, corrige e reconhece comportamentos de forma coerente com a cultura desejada.' },
      { code: 'CP_04', text: 'A empresa consegue atrair, engajar e reter pessoas alinhadas ao seu jeito de trabalhar.' },
      { code: 'CP_05', text: 'As pessoas entendem quais atitudes são valorizadas, toleradas ou inaceitáveis dentro da empresa.' },
    ],
  },
  {
    code: 'PM', name: 'Posicionamento e Marca', order: 4,
    mede: ['Clareza', 'Diferenciação', 'Coerência'],
    trilha: 'Posicionamento e Diferenciação',
    perguntas: [
      { code: 'PM_01', text: 'A empresa comunica com clareza o que faz, para quem existe e por que é diferente.' },
      { code: 'PM_02', text: 'O posicionamento da empresa é compreendido pelo time e usado como referência na comunicação e nas decisões.' },
      { code: 'PM_03', text: 'A experiência entregue ao cliente confirma a promessa que a empresa faz no mercado.' },
      { code: 'PM_04', text: 'A empresa evita mensagens genéricas e comunica uma diferença clara em relação aos concorrentes.' },
      { code: 'PM_05', text: 'Os clientes conseguem perceber diferenças claras entre a empresa e seus concorrentes.' },
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
      { code: 'GE_05', text: 'As reuniões, rituais ou acompanhamentos geram decisões, responsáveis e próximos passos claros.' },
    ],
  },
  {
    code: 'DP', name: 'Direcionamento Competitivo', order: 8,
    mede: ['Eficiência', 'Proximidade com o cliente', 'Diferenciação', 'Inovação'],
    trilha: 'Direcionamento Competitivo',
    perguntas: [
      { code: 'DP_01', text: 'A capacidade de entregar com consistência, eficiência e previsibilidade é considerada uma das principais vantagens competitivas da empresa.' },
      { code: 'DP_02', text: 'Compreender profundamente os clientes e adaptar soluções às suas necessidades é uma prioridade estratégica da empresa.' },
      { code: 'DP_03', text: 'A empresa busca continuamente criar diferenciais percebidos que a tornem única para seus clientes.' },
      { code: 'DP_04', text: 'Preço é um fator primordial no meu segmento de atuação.' },
      { code: 'DP_05', text: 'A inovação faz parte das prioridades estratégicas da organização.' },
    ],
  },
];

// ── Lookups derivados ────────────────────────────────────────────────
export const PILAR_BY_CODE = Object.fromEntries(PILARES.map((p) => [p.code, p]));
export const PILARES_ORDENADOS = [...PILARES].sort((a, b) => a.order - b.order);

// as 5 perguntas de um pilar, com pillar_code/ordem (compat com o renderer)
export function perguntasDoPilar(code) {
  const p = PILAR_BY_CODE[code];
  if (!p) return [];
  return p.perguntas.map((q, i) => ({ ...q, pillar_code: code, ordem: i + 1 }));
}

// todas as 40 perguntas, em ordem de pilar — usado para validar completude
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
