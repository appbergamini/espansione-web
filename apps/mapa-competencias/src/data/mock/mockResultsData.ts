import { competencyById } from "@/data/methodology";
import type { Competency, CompetencyState } from "@/data/types";

/**
 * =====================================================================
 * RESULTADOS DE DEMONSTRAÇÃO (PROTÓTIPO) — "Participante Exemplo"
 * =====================================================================
 * TUDO NESTE ARQUIVO É FICTÍCIO e existe apenas para manter o protótipo
 * navegável. Será substituído pelo motor de cálculo oficial
 * (src/services/engine.ts) e pelos textos oficiais na próxima etapa.
 *
 * NÃO misturar com a metodologia real (src/data/methodology.ts).
 * NÃO confundir estes estados/coordenadas com regras definitivas.
 * =====================================================================
 */

/** 3 prioridades da demonstração (config demo — lógica oficial virá depois). */
export const MOCK_PRIORITY_IDS = [
  "visao",
  "gerenciando-outros",
  "planejamento-e-organizacao",
];

/** Score 0–100 fictício por comportamento (posição no eixo comportamental). */
export const mockBehaviorScores: Record<string, number> = {
  reflexivo: 48,
  logico: 56,
  ponderado: 34,
  "baseado-em-fatos": 62,
  realista: 66,
  "ritmo-de-trabalho": 74,
  autossuficiencia: 70,
  "planejamento-organizacao": 52,
  multitarefa: 60,
  "tolerancia-frustracao": 46,
  "necessidade-reconhecimento": 38,
  "orientacao-detalhes": 50,
  assertividade: 44,
  sociabilidade: 54,
  "necessidade-ser-estimado": 36,
  "positividade-pessoas": 40,
  observador: 58,
  otimismo: 42,
  "tolerancia-critica": 48,
  autocontrole: 62,
};

export interface MockBehaviorDetail {
  contributions: string[];
  attentions: string[];
  contextualReading: string;
}

const CONTEXTUAL_PLACEHOLDER =
  "Leitura contextual em preparação — o texto oficial será fornecido na próxima etapa.";

/** Detalhes demo por comportamento (textos oficiais virão depois). */
export const mockBehaviorDetails: Record<string, MockBehaviorDetail> = {
  reflexivo: {
    contributions: ["Investiga e aprofunda antes de concluir", "Dá espaço para ideias amadurecerem"],
    attentions: ["Pode demorar para sair da reflexão"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  logico: {
    contributions: ["Estrutura o raciocínio em etapas", "Traz consistência lógica às decisões"],
    attentions: ["Pode engessar processos criativos"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  ponderado: {
    contributions: ["Evita decisões impulsivas", "Considera consequências antes de agir"],
    attentions: ["Pode perder velocidade de resposta"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  "baseado-em-fatos": {
    contributions: ["Decide com base em dados e evidências"],
    attentions: ["Pode desconsiderar intuições relevantes"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  realista: {
    contributions: ["Mantém os pés no chão e foco prático", "Avalia bem os recursos disponíveis"],
    attentions: ["Pode limitar ideias ambiciosas"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  "ritmo-de-trabalho": {
    contributions: ["Mantém alta carga de atividades", "Responde rapidamente às demandas"],
    attentions: ["Pode se sobrecarregar"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  autossuficiencia: {
    contributions: ["Entrega de forma independente", "Não depende do grupo para avançar"],
    attentions: ["Pode evitar pedir apoio quando necessário"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  "planejamento-organizacao": {
    contributions: ["Estrutura tarefas e rotinas", "Prefere ambiente organizado"],
    attentions: ["Pode ter dificuldade com imprevistos"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  multitarefa: {
    contributions: ["Lida com várias frentes ao mesmo tempo", "Adapta-se à variedade"],
    attentions: ["Pode dispersar o foco"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  "tolerancia-frustracao": {
    contributions: ["Se recupera após contratempos", "Segue adiante sob pressão"],
    attentions: ["Pode minimizar o impacto emocional"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  "necessidade-reconhecimento": {
    contributions: ["Busca melhoria e reconhecimento pelo que entrega"],
    attentions: ["Pode depender de validação externa"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  "orientacao-detalhes": {
    contributions: ["Nota inconsistências e zela pela precisão"],
    attentions: ["Pode se perder no detalhe"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  assertividade: {
    contributions: ["Expressa posição com clareza e firmeza"],
    attentions: ["Pode soar impositivo em algumas situações"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  sociabilidade: {
    contributions: ["Estabelece contato com facilidade", "Cria aproximação natural"],
    attentions: ["Pode priorizar o social sobre o técnico"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  "necessidade-ser-estimado": {
    contributions: ["Valoriza relações e clima do ambiente"],
    attentions: ["Pode evitar conflitos para preservar a aprovação"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  "positividade-pessoas": {
    contributions: ["Confia e dá crédito às pessoas"],
    attentions: ["Pode ser surpreendido por más intenções"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  observador: {
    contributions: ["Analisa comportamentos e intenções das pessoas"],
    attentions: ["Pode fazer leituras precipitadas"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  otimismo: {
    contributions: ["Mantém energia e perspectiva positiva"],
    attentions: ["Pode subestimar riscos"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  "tolerancia-critica": {
    contributions: ["Recebe retorno sem se abalar", "Separa opinião de identidade"],
    attentions: ["Pode ignorar críticas construtivas"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
  autocontrole: {
    contributions: ["Mantém compostura em situações tensas"],
    attentions: ["Pode esconder reações importantes"],
    contextualReading: CONTEXTUAL_PLACEHOLDER,
  },
};

/** Estado demo por competência (config demo — não é metodologia). */
export const mockCompetencyStates: Record<string, CompetencyState> = {
  visao: "prioridade",
  "gerenciando-outros": "prioridade",
  "planejamento-e-organizacao": "prioridade",
  "analise-solucao-problemas": "observacao",
  "julgamento-decisivo": "observacao",
  "defender-mudancas": "observacao",
  "foco-no-cliente": "observacao",
  negociacao: "observacao",
  "desenvolvimento-pessoas": "observacao",
  "orientacao-resultados": "base",
  "aperfeicoamento-continuo": "base",
  flexibilidade: "base",
  "influencia-persuasao": "base",
  "administracao-relacionamentos": "base",
  "persuasao-compra": "base",
};

export interface MockCompetencyDetail {
  short: string;
  relevance: string;
  contributions: string[];
  limitations: string[];
  movement: string;
  trainingId: string;
}

/**
 * Textos DEMONSTRATIVOS por competência (curto, relevância, contribuições,
 * limitações, movimento e treinamento). Tudo será substituído pelos textos
 * oficiais. Campos futuros correspondentes: contributionText, attentionText,
 * businessManifestationText, developmentMove, trainingId.
 */
export const mockCompetencyDetails: Record<string, MockCompetencyDetail> = {
  "analise-solucao-problemas": {
    short: "Resolver problemas difíceis com análise cuidadosa.",
    relevance: "No próximo nível, decisões e problemas se tornam mais complexos e exigem análise aprofundada (texto demonstrativo).",
    contributions: ["Aprofunda o entendimento do problema", "Avalia alternativas e consequências", "Baseia-se em fatos"],
    limitations: ["Pode demorar para concluir", "Pode analisar além do necessário"],
    movement: "Equilibrar profundidade e velocidade: definir prazo para a análise e decidir a partir do essencial (demonstrativo).",
    trainingId: "t-generic",
  },
  "defender-mudancas": {
    short: "Apoiar e conduzir mudanças necessárias ao avanço.",
    relevance: "O próximo nível exige implementar mudanças; conduzi-las com energia e constância faz diferença (texto demonstrativo).",
    contributions: ["Sustenta a mudança com energia", "Comunica os motivos da mudança", "Lida com resistências"],
    limitations: ["Pode avançar antes de engajar o time", "Pode subestimar a frustração gerada"],
    movement: "Engajar o time antes de implementar e comunicar ganhos em cada etapa (demonstrativo).",
    trainingId: "t-generic",
  },
  visao: {
    short: "Enxergar o longo prazo e os caminhos para evoluir.",
    relevance: "O próximo nível exige sair do operacional e definir uma direção de longo prazo (texto demonstrativo).",
    contributions: ["Pensa além do dia a dia", "Antecipa cenários", "Mobiliza energia em torno da direção"],
    limitations: ["Pode ficar na reflexão sem execução", "Pode dispersar em muitas possibilidades"],
    movement: "Transformar a visão em prioridades de 12 meses e pautá-las nas decisões semanais (demonstrativo).",
    trainingId: "t-visao",
  },
  "julgamento-decisivo": {
    short: "Decidir no tempo certo, com consciência e confiança.",
    relevance: "Decisões mais caras e frequentes exigem oportunidade, consciência e confiança (texto demonstrativo).",
    contributions: ["Decide com base em fatos", "Assume a decisão", "Considera consequências"],
    limitations: ["Pode adiar decisões por cautela", "Pode decidir cedo demais"],
    movement: "Definir critérios claros de decisão e um limite de tempo para escolher (demonstrativo).",
    trainingId: "t-generic",
  },
  "orientacao-resultados": {
    short: "Dirigir esforço e persistência para resultados relevantes.",
    relevance: "Metas mais ambiciosas exigem entrega consistente e foco no impacto (texto demonstrativo).",
    contributions: ["Mantém foco no impacto", "Persiste diante de obstáculos", "Assume responsabilidade"],
    limitations: ["Pode pressionar além da capacidade do time", "Pode abrir mão do processo"],
    movement: "Definir indicadores claros e revisar prioridades com o time (demonstrativo).",
    trainingId: "t-generic",
  },
  "aperfeicoamento-continuo": {
    short: "Buscar melhorias contínuas em processos e métodos.",
    relevance: "Crescer exige melhorar processos, qualidade e eficácia de forma contínua (texto demonstrativo).",
    contributions: ["Identifica oportunidades de melhoria", "Zela por qualidade", "Sistematiza ganhos"],
    limitations: ["Pode priorizar melhoria sobre entrega", "Pode mudar o que já funciona"],
    movement: "Instalar um ciclo simples de revisão e melhoria contínua (demonstrativo).",
    trainingId: "t-generic",
  },
  "planejamento-e-organizacao": {
    short: "Organizar o trabalho, prioridades e acompanhamento da execução.",
    relevance: "Projetos maiores exigem organização e acompanhamento para não virar desordem (texto demonstrativo).",
    contributions: ["Organiza o trabalho em etapas", "Administra prioridades", "Acompanha a execução"],
    limitations: ["Pode perder flexibilidade", "Pode planejar em excesso"],
    movement: "Consolidar um ritual semanal de planejamento e revisão de prioridades (demonstrativo).",
    trainingId: "t-planejamento",
  },
  "foco-no-cliente": {
    short: "Perceber necessidades do cliente e gerar valor.",
    relevance: "O próximo nível depende de entregar experiências e soluções que gerem valor real (texto demonstrativo).",
    contributions: ["Escuta o cliente", "Percebe necessidades", "Gera valor nas entregas"],
    limitations: ["Pode atender ao que pede, não ao que precisa", "Pode dispersar em demandas"],
    movement: "Criar um canal estruturado de escuta e validação com clientes (demonstrativo).",
    trainingId: "t-generic",
  },
  flexibilidade: {
    short: "Lidar com mudanças e adversidades de forma construtiva.",
    relevance: "Mudanças e imprevistos crescem junto com o negócio (texto demonstrativo).",
    contributions: ["Adapta-se a imprevistos", "Mantém postura construtiva", "Resiste bem à pressão"],
    limitations: ["Pode aceitar mudanças sem critério", "Pode esconder reações"],
    movement: "Adotar rituais de pausa para responder em vez de reagir (demonstrativo).",
    trainingId: "t-generic",
  },
  "influencia-persuasao": {
    short: "Mobilizar pessoas em direção a ideias e decisões.",
    relevance: "No próximo nível, convencer parceiros, clientes e o time é parte do papel (texto demonstrativo).",
    contributions: ["Adapta a abordagem ao interlocutor", "Mobiliza em torno de ideias", "Usa energia e ritmo"],
    limitations: ["Pode persuadir antes de ouvir", "Pode depender do carisma pessoal"],
    movement: "Praticar estrutura de argumentação e escuta ativa (demonstrativo).",
    trainingId: "t-generic",
  },
  "gerenciando-outros": {
    short: "Direcionar e liderar pessoas para alcançar objetivos.",
    relevance: "O fundador deixa de ser gargalo e passa a direcionar o time (texto demonstrativo).",
    contributions: ["Direciona com clareza", "Sustenta comprometimento", "Mantém responsabilização"],
    limitations: ["Pode centralizar decisões", "Pode cobrar sem desenvolver"],
    movement: "Criar rituais de alinhamento e responsabilização com o time (demonstrativo).",
    trainingId: "t-gerenciando",
  },
  "desenvolvimento-pessoas": {
    short: "Ensinar, orientar e desenvolver autonomia nas pessoas.",
    relevance: "Escalar exige que o time desenvolva capacidades e autonomia (texto demonstrativo).",
    contributions: ["Orientar com feedback", "Criar condições de aprendizado", "Perceber potencial"],
    limitations: ["Pode ser complacente", "Pode adiar conversas difíceis"],
    movement: "Instituir conversas de desenvolvimento individuais periódicas (demonstrativo).",
    trainingId: "t-generic",
  },
  "administracao-relacionamentos": {
    short: "Desenvolver e manter relações positivas e produtivas.",
    relevance: "Relações relevantes sustentam vendas, parcerias e o time (texto demonstrativo).",
    contributions: ["Mantém relações produtivas", "Percebe pessoas e contextos", "Equilibra firmeza e empatia"],
    limitations: ["Pode investir em relações erradas", "Pode evitar desconfortos"],
    movement: "Mapear relações estratégicas e definir planos de aproximação (demonstrativo).",
    trainingId: "t-generic",
  },
  negociacao: {
    short: "Construir acordos sustentáveis e mutuamente benéficos.",
    relevance: "Acordos melhores protegem margem e relações no crescimento (texto demonstrativo).",
    contributions: ["Compreende interesses das partes", "Mantém a calma na pressão", "Constrói acordos sustentáveis"],
    limitations: ["Pode ceder para preservar a relação", "Pode endurecer em excesso"],
    movement: "Preparar cada negociação com interesses, alternativas e limites (demonstrativo).",
    trainingId: "t-generic",
  },
  "persuasao-compra": {
    short: "Comunicar valor e favorecer decisões de compra.",
    relevance: "Vender mais e melhor é central para o próximo nível declarado (texto demonstrativo).",
    contributions: ["Compreende o interlocutor", "Comunica valor com clareza", "Usa ritmo e aproximação"],
    limitations: ["Pode pressionar além do necessário", "Pode focar no produto, não na necessidade"],
    movement: "Estruturar propostas de valor orientadas à necessidade do cliente (demonstrativo).",
    trainingId: "t-generic",
  },
};

/** Coordenadas demo na Matriz do Próximo Nível (relevância × necessidade). */
export const mockMatrixCoords: Record<string, { relevancia: number; necessidade: number }> = {
  visao: { relevancia: 88, necessidade: 84 },
  "gerenciando-outros": { relevancia: 84, necessidade: 66 },
  "planejamento-e-organizacao": { relevancia: 74, necessidade: 78 },
  "julgamento-decisivo": { relevancia: 70, necessidade: 46 },
  "defender-mudancas": { relevancia: 64, necessidade: 45 },
  "foco-no-cliente": { relevancia: 62, necessidade: 40 },
  negociacao: { relevancia: 56, necessidade: 38 },
  "influencia-persuasao": { relevancia: 50, necessidade: 42 },
  "aperfeicoamento-continuo": { relevancia: 48, necessidade: 36 },
  "orientacao-resultados": { relevancia: 66, necessidade: 24 },
  "analise-solucao-problemas": { relevancia: 44, necessidade: 34 },
  flexibilidade: { relevancia: 42, necessidade: 30 },
  "administracao-relacionamentos": { relevancia: 38, necessidade: 28 },
  "desenvolvimento-pessoas": { relevancia: 34, necessidade: 24 },
  "persuasao-compra": { relevancia: 30, necessidade: 20 },
};

/* ------------------- helpers ------------------- */

export function getMockBehaviorScore(behaviorId: string): number {
  return mockBehaviorScores[behaviorId] ?? 50;
}

export function getMockBehaviorDetail(behaviorId: string): MockBehaviorDetail {
  return (
    mockBehaviorDetails[behaviorId] ?? {
      contributions: [],
      attentions: [],
      contextualReading: CONTEXTUAL_PLACEHOLDER,
    }
  );
}

export function getMockCompetencyState(competencyId: string): CompetencyState {
  return mockCompetencyStates[competencyId] ?? "base";
}

export function getMockCompetencyDetail(competencyId: string): MockCompetencyDetail {
  return mockCompetencyDetails[competencyId] ?? mockCompetencyDetails["analise-solucao-problemas"];
}

/** Competências da demonstração ordenadas por prioridade (3 itens). */
export function getMockPriorityCompetencies(): Competency[] {
  return MOCK_PRIORITY_IDS.map((id) => competencyById.get(id)).filter(
    (c): c is Competency => Boolean(c)
  );
}

export function getMockMatrixCoords(competencyId: string): { relevancia: number; necessidade: number } {
  return mockMatrixCoords[competencyId] ?? { relevancia: 50, necessidade: 50 };
}
