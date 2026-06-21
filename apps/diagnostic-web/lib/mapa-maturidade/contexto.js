// =====================================================================
// Mapa de Maturidade — etapa "Contexto da Empresa" (perfil, fora do score)
// =====================================================================
// 10 perguntas de classificação coletadas ANTES do questionário. Não entram
// no cálculo de maturidade. São salvas como snapshot por assessment (medição),
// preparando a Base de Inteligência (benchmark) sem exibir benchmark agora.

const OUTRO = 'Outro';

export const CONTEXTO_PERGUNTAS = [
  {
    code: 'CE_01', type: 'single', required: true, outro: true, outroLabel: 'Especifique o segmento',
    label: 'Qual é o segmento principal da empresa?',
    options: ['Saúde / Clínicas', 'Educação', 'Tecnologia', 'Serviços profissionais', 'Varejo', 'Indústria', 'Alimentação', 'Beleza / Estética', 'Consultoria / Treinamento', 'Construção / Arquitetura / Engenharia', 'Agro', OUTRO],
  },
  {
    code: 'CE_02', type: 'short', required: true,
    label: 'Qual é o subsegmento ou especialidade da empresa?',
    placeholder: 'Ex.: dermatologia, odontologia, escola infantil, software house, escritório de advocacia, consultoria empresarial.',
  },
  {
    code: 'CE_03', type: 'single', required: true, outro: true, outroLabel: 'Especifique o modelo de negócio',
    label: 'Qual é o modelo de negócio predominante?',
    options: ['B2B', 'B2C', 'B2B2C', 'Assinatura / recorrência', 'Projetos pontuais', 'Varejo / transacional', 'Franquia / rede', 'Misto', OUTRO],
  },
  {
    code: 'CE_04', type: 'single', required: true,
    label: 'Quantas pessoas trabalham atualmente na empresa?',
    options: ['Apenas sócios', '2 a 10', '11 a 30', '31 a 50', '51 a 100', '101 a 300', 'Mais de 300'],
  },
  {
    code: 'CE_05', type: 'single', required: true,
    label: 'Qual é a faixa de faturamento anual da empresa?',
    options: ['Até R$ 120 mil', 'R$ 120 mil a R$ 500 mil', 'R$ 500 mil a R$ 2 milhões', 'R$ 2 milhões a R$ 6 milhões', 'R$ 6 milhões a R$ 12 milhões', 'R$ 12 milhões a R$ 30 milhões', 'Acima de R$ 30 milhões', 'Prefiro não informar'],
  },
  {
    code: 'CE_06', type: 'single', required: true,
    label: 'Há quanto tempo a empresa existe?',
    options: ['Menos de 1 ano', '1 a 3 anos', '3 a 7 anos', '7 a 15 anos', 'Mais de 15 anos'],
  },
  {
    code: 'CE_07', type: 'single', required: true,
    label: 'Qual é o estágio atual do negócio?',
    options: ['Estruturação', 'Crescimento', 'Reposicionamento', 'Consolidação', 'Sucessão', 'Virada / correção de rota'],
    hints: {
      'Estruturação': 'ainda montando as bases.',
      'Crescimento': 'expandindo operação, equipe ou receita.',
      'Reposicionamento': 'redefinindo identidade, mercado ou proposta de valor.',
      'Consolidação': 'buscando maturidade, escala e previsibilidade.',
      'Sucessão': 'passando por transição de liderança ou sociedade.',
      'Virada / correção de rota': 'enfrentando crise, ruptura ou necessidade de mudança relevante.',
    },
  },
  {
    code: 'CE_08', type: 'single', required: true,
    label: 'Quantos sócios ou fundadores atuam diretamente na operação?',
    options: ['1', '2', '3', '4 ou mais', 'Nenhum atua diretamente'],
  },
  {
    code: 'CE_09', type: 'single', required: true,
    label: 'A empresa possui lideranças intermediárias?',
    options: ['Não', 'Sim, mas informalmente', 'Sim, com papéis parcialmente definidos', 'Sim, com papéis claros'],
  },
  {
    code: 'CE_10', type: 'single', required: true,
    label: 'A empresa possui equipe comercial dedicada?',
    options: ['Não', 'Sim, apenas o sócio vende', 'Sim, 1 pessoa dedicada', 'Sim, 2 a 5 pessoas', 'Sim, mais de 5 pessoas'],
  },
];

export const CONTEXTO_OUTRO_VALOR = OUTRO;

// valida o contexto — devolve códigos faltando (inclui *_outro obrigatório)
export function validarContexto(ctx = {}) {
  const faltando = [];
  for (const q of CONTEXTO_PERGUNTAS) {
    const v = ctx[q.code];
    if (q.required && (v == null || String(v).trim() === '')) { faltando.push(q.code); continue; }
    if (q.outro && v === OUTRO) {
      const extra = ctx[`${q.code}_outro`];
      if (!extra || String(extra).trim() === '') faltando.push(`${q.code}_outro`);
    }
  }
  return faltando;
}

// snapshot normalizado (campos nomeados p/ benchmark) + respostas cruas
export function buildContextSnapshot(ctx = {}) {
  const val = (code) => ctx[code] ?? null;
  const comOutro = (code) => (ctx[code] === OUTRO ? (ctx[`${code}_outro`] || OUTRO) : ctx[code] ?? null);
  return {
    segment: comOutro('CE_01'),
    segment_raw: val('CE_01'),
    segment_other: ctx.CE_01 === OUTRO ? (ctx.CE_01_outro || null) : null,
    subsegment: val('CE_02'),
    business_model: comOutro('CE_03'),
    business_model_raw: val('CE_03'),
    business_model_other: ctx.CE_03 === OUTRO ? (ctx.CE_03_outro || null) : null,
    employee_range: val('CE_04'),
    annual_revenue_range: val('CE_05'),
    company_age_range: val('CE_06'),
    business_stage: val('CE_07'),
    active_founders_count: val('CE_08'),
    has_middle_leadership: val('CE_09'),
    has_dedicated_sales_team: val('CE_10'),
    raw: { ...ctx },
  };
}
