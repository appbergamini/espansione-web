// =====================================================================
// Mapa de Maturidade Espansione — textos interpretativos por pilar × nível
// =====================================================================
// 8 pilares × 4 níveis = 32 textos. Tom estratégico, claro, não alarmista,
// client-facing. Não citar metodologias, ferramentas ou marcas de terceiros.

export const TEXTOS = {
  DE: {
    1: 'A empresa ainda opera com baixa clareza de direção, decidindo mais por urgência do que por prioridade. O foco se dispersa e o crescimento tende a depender de oportunidades pontuais.',
    2: 'A empresa já apresenta sinais de direção, mas falta consistência em definir e sustentar prioridades. O foco se perde diante de demandas e pressões da rotina.',
    3: 'A empresa decide com base em prioridades na maior parte do tempo, com algumas oscilações na disciplina de escolha e na visão de futuro.',
    4: 'A direção estratégica está incorporada à rotina decisória — prioridades claras, foco protegido e tempo dedicado a pensar o futuro do negócio.',
  },
  LI: {
    1: 'A liderança ainda está concentrada na direção ou nos sócios, e as decisões dependem de aprovação. A delegação é frágil e as pessoas são pouco desenvolvidas.',
    2: 'A empresa já distribui responsabilidades, mas a autonomia e a delegação variam, e as conversas de desenvolvimento acontecem de forma irregular.',
    3: 'As lideranças decidem e desenvolvem pessoas com boa frequência, com espaço para fortalecer a delegação e a antecipação de conflitos.',
    4: 'A liderança opera com autonomia e clareza de papéis, delega com confiança, desenvolve pessoas e tem suas decisões respeitadas pela direção.',
  },
  CP: {
    1: 'Comportamentos esperados e valores ainda não são claros nem reforçados, e a cultura se forma por hábito. Atrair e reter pessoas alinhadas tende a ser difícil.',
    2: 'A empresa reconhece seus valores, mas eles ainda não aparecem de forma consistente nas decisões e na rotina; o reforço depende de pessoas específicas.',
    3: 'A cultura está presente nas decisões e na liderança com boa frequência, com espaço para padronizar como comportamentos são orientados e reconhecidos.',
    4: 'A cultura é viva e coerente: orienta atitudes e decisões, é reforçada com consistência, e a empresa atrai, engaja e retém pessoas alinhadas.',
  },
  PM: {
    1: 'A empresa comunica de forma genérica o que faz e por que é diferente, e o posicionamento não orienta decisões. A diferença frente aos concorrentes é pouco percebida.',
    2: 'Há elementos de posicionamento, mas ainda não são usados como referência consistente; a diferenciação percebida pelo cliente varia.',
    3: 'O posicionamento está claro e é percebido com boa frequência por time e clientes, com espaço para reforçar a diferença frente aos concorrentes.',
    4: 'O posicionamento é claro, diferenciado e coerente entre promessa e entrega — usado como referência interna e percebido nitidamente pelo mercado.',
  },
  EC: {
    1: 'A experiência entregue é inconsistente e depende de quem atende. Feedbacks de clientes raramente viram melhoria e a confiança é frágil.',
    2: 'A empresa já se preocupa com a experiência, mas a consistência e o uso de feedbacks ainda são irregulares.',
    3: 'A experiência é consistente na maior parte do tempo e reforça o posicionamento, com espaço para sistematizar a escuta e a geração de valor percebido.',
    4: 'A experiência é consistente, reforça a marca e supera expectativas; a empresa escuta o cliente e transforma isso em valor e fidelização.',
  },
  DC: {
    1: 'A geração de oportunidades é reativa e depende de poucas pessoas; as conversas comerciais se apoiam muito no preço e as objeções desestabilizam o processo.',
    2: 'Há iniciativa comercial, mas a escuta do cliente e a comunicação de valor ainda são irregulares, com dependência do preço como argumento.',
    3: 'A equipe cria oportunidades e comunica valor com boa frequência, com espaço para fortalecer o trato de objeções e reduzir a dependência de preço.',
    4: 'A área comercial age com iniciativa, entende o cliente antes de propor, conduz conversas por valor e lida bem com objeções e perdas.',
  },
  GE: {
    1: 'Prioridades raramente viram planos com responsáveis e prazos; o acompanhamento é reativo e o crescimento gera caos e sobrecarga.',
    2: 'A empresa já transforma parte das prioridades em planos, mas o acompanhamento e a antecipação de riscos ainda são irregulares.',
    3: 'Planejamento e acompanhamento acontecem com boa frequência, com espaço para antecipar desvios e ganhar escalabilidade.',
    4: 'A empresa transforma prioridades em planos claros, acompanha a execução, antecipa riscos e absorve crescimento sem perder o controle.',
  },
  DP: {
    1: 'A empresa ainda não tem clareza sobre como escolhe competir — eficiência, proximidade ou diferenciação aparecem de forma difusa, sem uma aposta consciente.',
    2: 'Há sinais de uma direção competitiva, mas ela ainda não é deliberada nem sustentada com consistência nas decisões.',
    3: 'A empresa já tem uma direção competitiva razoavelmente clara, com espaço para torná-la mais explícita e coerente em toda a operação.',
    4: 'A empresa sabe como escolhe competir e sustenta essa aposta com consistência — seja por eficiência, proximidade, diferenciação ou inovação.',
  },
};

export function getTextoInterpretativo(pillarCode, level) {
  const porPilar = TEXTOS[pillarCode];
  if (!porPilar) return '';
  return porPilar[level] || porPilar[1] || '';
}
