// lib/forms/socios_v4_schema.js
// Schema do intake_socios v4. Fonte única de verdade para campos,
// validações e metadados do formulário de sócios.

export const PARTES = [
  { id: 1, titulo: 'Identificação da Empresa',      estimativaMin: 5 },
  { id: 2, titulo: 'A Empresa e sua Marca',         estimativaMin: 10 },
  { id: 3, titulo: 'Propósito e Essência',          estimativaMin: 15 },
  { id: 4, titulo: 'Marca Empregadora e Cultura',   estimativaMin: 10 },
  { id: 5, titulo: 'Visão, Futuro e Estratégia',    estimativaMin: 15 },
  { id: 6, titulo: 'Diagnóstico 360° do Negócio',   estimativaMin: 15 },
];

export const ARQUETIPOS = [
  { key: 'mago',        label: 'Mago',         descricao: 'Transforma, revela o invisível, provoca mudança' },
  { key: 'heroi',       label: 'Herói',        descricao: 'Vence desafios, prova valor, inspira pela coragem' },
  { key: 'sabio',       label: 'Sábio',        descricao: 'Ensina, esclarece, conduz pelo conhecimento' },
  { key: 'rebelde',     label: 'Rebelde',      descricao: 'Rompe com o estabelecido, provoca' },
  { key: 'cuidador',    label: 'Cuidador',     descricao: 'Acolhe, protege, serve' },
  { key: 'explorador',  label: 'Explorador',   descricao: 'Busca o novo, desafia limites, descobre' },
  { key: 'criador',     label: 'Criador',      descricao: 'Inventa, dá forma ao que não existia' },
  { key: 'bobo',        label: 'Bobo-da-corte', descricao: 'Diverte, provoca pelo humor, quebra a seriedade' },
  { key: 'amante',      label: 'Amante',       descricao: 'Conecta, encanta, cria laços' },
  { key: 'comum',       label: 'Cara-comum',   descricao: 'Se iguala, representa o cotidiano' },
  { key: 'inocente',    label: 'Inocente',     descricao: 'Traz leveza, simplicidade, pureza' },
  { key: 'governante',  label: 'Governante',   descricao: 'Lidera, organiza, traz ordem' },
];

export const RADAR_EMPREGADORA_DIMENSOES = [
  'Propósito Inspirador',
  'Cultura Organizacional Viva',
  'Liderança Humanizada',
  'Clima Organizacional Saudável',
  'Comunicação Interna Transparente',
  'Desenvolvimento e Aprendizado',
  'Reconhecimento e Valorização',
  'Diversidade e Inclusão',
  'Visão e Alinhamento Estratégico',
  'Experiência do Colaborador',
  'Reputação e Imagem da Marca',
];

export const PILARES_360 = {
  estrategia: { nome: 'Estratégia', inicio:  1, fim:  8 },
  financas:   { nome: 'Finanças',   inicio:  9, fim: 16 },
  comercial:  { nome: 'Comercial',  inicio: 17, fim: 24 },
  marketing:  { nome: 'Marketing',  inicio: 25, fim: 32 },
  pessoas:    { nome: 'Pessoas',    inicio: 33, fim: 40 },
  operacao:   { nome: 'Operação',   inicio: 41, fim: 48 },
};

// 48 afirmações da Parte 6 em ordem exata (1-8: Estratégia; 9-16: Finanças; ...)
export const AFIRMACOES_360 = [
  // Estratégia (1-8)
  'Sua empresa tem visão de futuro clara (horizonte de 3 a 5 anos) definida, documentada e compartilhada pela liderança.',
  'A missão, os valores e o posicionamento da marca estão definidos e disseminados na empresa.',
  'Existe um planejamento estratégico formal, com metas e indicadores acompanhados de forma recorrente.',
  'Você possui Plano de Ação específico para combater os atuais pontos fracos da empresa.',
  'Decisões estratégicas são tomadas com base em dados de mercado, concorrência e clientes — não apenas em intuição.',
  'Os processos mais relevantes estão definidos e são executados sistematicamente com o mesmo rigor.',
  'Há reuniões formais mensais de resultado para discutir e projetar os próximos passos do negócio.',
  'Está claro para você a atuação, com direitos e deveres, dos sócios do negócio.',
  // Finanças (9-16)
  'Sua empresa tem clareza mensal sobre receitas, custos, margem de lucro e fluxo de caixa.',
  'Há separação clara entre contas da pessoa física (sócios) e contas da pessoa jurídica (empresa).',
  'Sua empresa possui reserva financeira capaz de sustentar a operação por pelo menos 3 meses em cenário de baixa.',
  'Sua empresa é gerenciada por um orçamento claro de despesas e receitas para os próximos 12 meses.',
  'Você calcula a margem de contribuição dos produtos/serviços com todos os custos atualizados.',
  'Investimentos relevantes (marketing, tecnologia, expansão, contratações) são avaliados com métricas de retorno (ROI, payback, ponto de equilíbrio).',
  'Sua empresa possui demonstrativos contábeis (DRE, balanço) mensalmente atualizados e efetivamente usados para tomada de decisão.',
  'A política de preços é revisada periodicamente considerando custos, concorrência e percepção de valor do cliente.',
  // Comercial (17-24)
  'Seus vendedores sabem claramente quais são as metas semanais e mensais.',
  'Sua equipe de vendas possui técnicas claras de prospecção de novos clientes.',
  'Sua empresa possui processos de pós-venda e relacionamento que garantem a fidelidade do cliente.',
  'Há acompanhamento sistemático dos resultados individuais de cada vendedor, com feedbacks regulares.',
  'Sua empresa possui uma política de Gestão da Carteira de Clientes que potencializa cada cliente.',
  'Seus vendedores são treinados em técnicas de negociação e superação de objeções.',
  'Seu modelo de Comissionamento estimula os vendedores e propicia crescimento sustentável.',
  'Seu negócio possui trabalho ativo de Funil de Vendas e sistema de CRM adequado à operação.',
  // Marketing (25-32)
  'Sua empresa possui estratégia desenhada para conquista de novos clientes, praças e mercados.',
  'Sua empresa entende as principais mudanças de comportamento do consumidor (dores, jornada, novos problemas).',
  'Sua empresa possui canais de atendimento ativos (WhatsApp, site, telefone, e-mail, redes sociais).',
  'Sua empresa pesquisa concorrentes para avaliar oportunidades, ameaças e boas práticas.',
  'Sua empresa possui planejamento de marketing estruturado e em implementação.',
  'Sua empresa produz conteúdos consistentes para redes sociais, com assuntos relevantes ao público.',
  'Sua empresa faz gestão de tráfego nas plataformas digitais (Google, Meta etc.).',
  'Sua empresa mede o ROI do marketing e gerencia o investimento com precisão.',
  // Pessoas (33-40)
  'Sua empresa possui Plano de Treinamento e Desenvolvimento ativo para capacitar colaboradores.',
  'Todas as pessoas sabem especificamente as atribuições do seu cargo e os resultados que devem gerar.',
  'Sua empresa possui Plano de Cargos e Carreira transparente e conhecido por todos.',
  'Sua empresa vivencia e reconhece quem atua de acordo com seus Valores e Missão.',
  'Os líderes inspiram confiança e engajamento por meio de um comportamento profissional exemplar.',
  'Há sistemática periódica de feedbacks e Planos de Desenvolvimento Individual.',
  'O Clima Organizacional propicia que as pessoas trabalhem felizes, entendendo seu trabalho como algo maior.',
  'Os processos de seleção, recrutamento e gestão de pessoas são claros, eficientes e alinhados à cultura.',
  // Operação (41-48)
  'Os processos críticos de entrega ao cliente estão documentados e são executados com consistência.',
  'A promessa comunicada pela marca encontra capacidade real de execução na operação do dia a dia.',
  'Existe visibilidade sobre os principais gargalos que afetam a experiência do cliente.',
  'Sua empresa possui sistemas/ferramentas de gestão (ERP, CRM, planilhas integradas) adequados ao porte atual.',
  'Há indicadores operacionais acompanhados recorrentemente (prazo de entrega, retrabalho, produtividade, satisfação).',
  'Fornecedores e parceiros-chave estão mapeados, com planos de contingência para eventuais rupturas.',
  'A operação está preparada para suportar um crescimento de 30–50% sem colapso estrutural.',
  'Existe documentação e padronização mínima para que a ausência ou saída de uma pessoa-chave não pare a operação.',
];

/**
 * Valida se campos obrigatórios mínimos foram preenchidos.
 * Obrigatórios: Partes 1, 2, 3 e 6 (mínimo 80% do 360°).
 */
export function validarFormulario(dados) {
  const erros = {};

  const parte1Obrigatorios = [
    'p1_nome_completo', 'p1_email', 'p1_telefone',
    'p1_razao_social', 'p1_ano_fundacao', 'p1_segmento',
    'p1_estagio_negocio', 'p1_decisoes_12m',
  ];
  for (const campo of parte1Obrigatorios) {
    if (!dados[campo] || String(dados[campo]).trim() === '') {
      erros[campo] = 'Campo obrigatório';
    }
  }

  if (!dados.p2_oferta_cliente)      erros.p2_oferta_cliente      = 'Campo obrigatório';
  if (!dados.p2_personalidade_marca) erros.p2_personalidade_marca = 'Campo obrigatório';
  if (!dados.p2_diferenciais)        erros.p2_diferenciais        = 'Campo obrigatório';

  if (!dados.p3_historia_criacao)    erros.p3_historia_criacao    = 'Campo obrigatório';
  if (!dados.p3_problema_resolver)   erros.p3_problema_resolver   = 'Campo obrigatório';
  if (!dados.p3_valores_inegociaveis) erros.p3_valores_inegociaveis = 'Campo obrigatório';

  let respondidas360 = 0;
  for (let i = 1; i <= 48; i++) {
    const v = dados[`parte6_q${i}`];
    if (typeof v === 'number' && v >= 1 && v <= 4) respondidas360++;
  }
  if (respondidas360 < 38) {
    erros._p6_completude = `Responda ao menos 80% das afirmações do Diagnóstico 360° (${respondidas360} de 48 respondidas).`;
  }

  return { valido: Object.keys(erros).length === 0, erros };
}

export function construirPayload(dados, projetoId, token) {
  return {
    projetoId,
    tipo: 'intake_socios',
    token,
    respostas: dados,
  };
}
