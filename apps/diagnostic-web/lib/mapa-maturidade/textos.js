// =====================================================================
// Mapa de Maturidade Espansione — textos interpretativos por pilar × nível
// =====================================================================
// Conteúdo client-facing. Tom estratégico, claro, profissional e NÃO
// alarmista. Não citar metodologias, ferramentas ou marcas de terceiros.
// 6 pilares × 4 níveis = 24 textos. Indexado por código de pilar e nível (1–4).

export const TEXTOS = {
  DE: {
    1: 'A empresa ainda opera com baixa clareza de direção, tomando decisões de forma mais reativa do que estratégica. O crescimento tende a depender de oportunidades pontuais, urgências ou decisões concentradas em poucas pessoas.',
    2: 'A empresa já apresenta sinais de direção estratégica, mas ainda falta consistência na definição e sustentação das prioridades. O foco pode se perder diante de demandas, oportunidades ou pressões da rotina.',
    3: 'A empresa possui direção e prioridades com boa frequência, mas ainda pode apresentar oscilações na disciplina de escolha, comunicação estratégica ou coerência entre ambição e estrutura.',
    4: 'A direção estratégica está incorporada à rotina decisória. A empresa demonstra clareza sobre prioridades, foco e coerência entre crescimento, estrutura e escolhas.',
  },
  LI: {
    1: 'A liderança ainda está muito concentrada na direção ou nos sócios, e as decisões dependem com frequência de aprovação. A operação tende a sobrecarregar poucas pessoas e a autonomia das equipes é limitada.',
    2: 'A empresa já distribui responsabilidades, mas a delegação ainda é inconsistente e a autonomia varia conforme a situação. Conversas de alinhamento e desenvolvimento de pessoas acontecem de forma irregular.',
    3: 'As lideranças assumem decisões e responsabilidades com boa frequência, embora ainda haja espaço para fortalecer a delegação, o desenvolvimento de pessoas e a antecipação de conflitos.',
    4: 'A liderança opera com autonomia e clareza de papéis, delega com confiança e desenvolve pessoas de forma consistente. Decisões e conversas difíceis acontecem no tempo certo, sem depender da direção.',
  },
  CP: {
    1: 'Os comportamentos esperados e os valores ainda não estão claros nem reforçados na rotina, e a cultura se forma mais por hábito do que por intenção. Atrair e reter pessoas alinhadas tende a ser difícil.',
    2: 'A empresa já reconhece seus valores e comportamentos desejados, mas eles ainda não aparecem de forma consistente nas decisões e na rotina. O reforço da cultura depende de pessoas ou momentos específicos.',
    3: 'A cultura está presente nas decisões e na liderança com boa frequência, embora ainda haja oscilações em como os comportamentos são orientados, corrigidos e reconhecidos. A colaboração entre áreas pode ser fortalecida.',
    4: 'A cultura é viva e orienta atitudes, decisões e a forma de trabalhar. A empresa reforça comportamentos com coerência e consegue atrair, engajar e reter pessoas alinhadas ao seu jeito de ser.',
  },
  IE: {
    1: 'A empresa ainda comunica de forma genérica o que faz e por que é diferente, e a identidade aparece de maneira inconsistente nos pontos de contato. A promessa de marca e a experiência entregue nem sempre conversam.',
    2: 'A empresa já tem elementos de posicionamento, mas a identidade ainda não é usada de forma consistente como referência de comunicação e decisão. A coerência entre marca, atendimento e experiência varia.',
    3: 'A identidade estratégica está clara e é percebida com boa frequência por clientes e equipe, embora ainda haja espaço para reforçar a diferenciação e a coerência em todos os pontos de contato.',
    4: 'A identidade é clara, diferenciada e coerente entre o que a empresa promete e o que entrega. Equipe, clientes e mercado percebem o posicionamento de forma consistente, e ele orienta decisões e comunicação.',
  },
  CO: {
    1: 'A geração de receita ainda depende fortemente de indicações, do relacionamento dos sócios ou de esforços pontuais, sem uma rotina comercial estruturada. O acompanhamento de oportunidades e indicadores é incipiente.',
    2: 'A empresa já tem iniciativas comerciais, mas a rotina de geração e acompanhamento de oportunidades ainda é irregular. O discurso de valor e o uso de indicadores precisam ganhar consistência.',
    3: 'A área comercial opera com estrutura e acompanhamento na maior parte do tempo, com discurso alinhado ao posicionamento, mas ainda há espaço para fortalecer indicadores e reduzir a dependência de poucos canais.',
    4: 'A empresa tem rotina comercial estruturada, acompanha oportunidades e indicadores e comunica valor de forma alinhada ao posicionamento. A geração de receita é previsível e não depende de esforços isolados.',
  },
  PL: {
    1: 'As prioridades ainda raramente viram planos com responsáveis e prazos, e a execução é acompanhada de forma reativa. A operação depende muito de pessoas específicas e absorve mal o crescimento.',
    2: 'A empresa já transforma parte das prioridades em planos, mas o acompanhamento e a antecipação de riscos ainda são irregulares. Processos essenciais dependem de pessoas e o crescimento gera sobrecarga.',
    3: 'O planejamento e o acompanhamento da execução acontecem com boa frequência, embora ainda haja espaço para antecipar desvios, formalizar processos e ganhar escalabilidade diante de novas demandas.',
    4: 'A empresa transforma prioridades em planos claros, acompanha a execução e antecipa riscos com consistência. Os processos essenciais estão documentados e a operação absorve crescimento sem gerar caos.',
  },
};

// Texto interpretativo de um pilar para um nível (1–4). Fallback seguro.
export function getTextoInterpretativo(pillarCode, level) {
  const porPilar = TEXTOS[pillarCode];
  if (!porPilar) return '';
  return porPilar[level] || porPilar[1] || '';
}
