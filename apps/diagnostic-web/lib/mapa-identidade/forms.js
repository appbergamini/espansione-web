// =====================================================================
// Mapa de Identidade Estratégica — definição dos formulários (conteúdo estático)
// =====================================================================
// Fase 1: Formulário 1 (Essência e Direção da Marca) e Formulário 2 (Território
// Estratégico de Valor). Espelho Interno/Externo entram na Fase 2.
// Conteúdo no git (não no banco). A página renderiza genericamente a partir daqui.

// Tipos de campo do Formulário 1:
//   short   → texto curto      | long  → texto longo (textarea)
//   single  → seleção única    | multi → múltipla escolha (com `max`)
//   words3  → 3 campos de texto (palavras)

export const FORM_TYPES = {
  ESSENCIA: 'identity_brand_essence_v1',
  TERRITORIO: 'identity_value_territory_v1',
  ESPELHO_INTERNO: 'identity_internal_mirror_v1',
  ESPELHO_EXTERNO: 'identity_external_mirror_v1',
};

// ── Formulário 1 — Essência e Direção da Marca (~22 perguntas, 5 blocos) ──
export const FORM_ESSENCIA = {
  type: FORM_TYPES.ESSENCIA,
  slug: 'essencia',
  titulo: 'Essência e Direção da Marca',
  respondente: 'Fundador, sócio, CEO ou direção',
  tempo: '20 a 30 min',
  obrigatorio: true,
  blocos: [
    {
      id: 1,
      titulo: 'Contexto',
      campos: [
        { code: 'ED_01', type: 'short', required: true, label: 'Nome da empresa ou marca.' },
        { code: 'ED_02', type: 'short', required: true, label: 'Site, Instagram ou principal canal digital.' },
        {
          code: 'ED_03', type: 'single', required: true, label: 'Estágio atual da empresa.',
          options: ['Estruturação', 'Crescimento', 'Reposicionamento', 'Consolidação', 'Sucessão', 'Virada ou correção de rota'],
        },
        {
          code: 'ED_04', type: 'single', required: true, label: 'Número de colaboradores.',
          options: ['Apenas eu', '2 a 10', '11 a 50', '51 a 100', 'Mais de 100'],
        },
        {
          code: 'ED_05', type: 'single', required: true, label: 'Faixa de faturamento anual.',
          options: ['Até R$ 120 mil', 'R$ 120 mil a R$ 500 mil', 'R$ 500 mil a R$ 2 milhões', 'R$ 2 milhões a R$ 6 milhões', 'R$ 6 milhões a R$ 12 milhões', 'Mais de R$ 12 milhões', 'Prefiro não informar'],
        },
      ],
    },
    {
      id: 2,
      titulo: 'Oferta, público e diferenciação',
      campos: [
        { code: 'ED_06', type: 'long', required: true, label: 'O que a empresa vende, para quem vende e qual principal transformação ou benefício entrega?' },
        { code: 'ED_07', type: 'long', required: true, label: 'O que diferencia sua empresa de forma defensável em relação às alternativas do mercado?' },
        {
          code: 'ED_08', type: 'multi', required: true, max: 3,
          label: 'Quando a empresa ganha um cliente, quais costumam ser os principais motivos? (máx. 3)',
          options: ['Confiança', 'Relacionamento', 'Qualidade técnica', 'Atendimento', 'Especialização', 'Indicação', 'Reputação', 'Experiência anterior positiva', 'Capacidade de resolver problemas complexos', 'Preço', 'Agilidade', 'Conveniência', 'Outro'],
        },
        {
          code: 'ED_09', type: 'multi', required: true, max: 5,
          label: 'Quais objeções ou barreiras aparecem com mais frequência antes da compra? (máx. 5)',
          options: ['Preço', 'Prazo', 'Medo de não dar resultado', 'Falta de clareza sobre o que será entregue', 'Comparação com concorrentes', 'Preferência por fornecedor conhecido', 'Dúvida sobre capacidade técnica', 'Dúvida sobre retorno do investimento', 'Falta de urgência', 'Processo decisório lento', 'Cliente acredita que consegue fazer internamente', 'Receio de mudar de fornecedor atual', 'Outro'],
        },
      ],
    },
    {
      id: 3,
      titulo: 'Personalidade, percepção e identidade',
      campos: [
        { code: 'ED_10', type: 'long', required: true, label: 'Se sua empresa fosse uma pessoa, como você descreveria a personalidade dela?' },
        { code: 'ED_11', type: 'words3', required: true, label: 'Quais 3 palavras você gostaria que as pessoas usassem para descrever sua empresa?' },
        { code: 'ED_12', type: 'words3', required: true, label: 'Quais 3 palavras você acredita que as pessoas realmente usam hoje para descrever sua empresa?' },
        { code: 'ED_13', type: 'long', required: true, label: 'Qual promessa sua empresa faz ao mercado, mesmo que essa promessa ainda não esteja escrita formalmente?' },
      ],
    },
    {
      id: 4,
      titulo: 'Origem, propósito e valores',
      campos: [
        { code: 'ED_14', type: 'long', required: true, label: 'Qual é a história de criação da empresa? Como tudo começou?' },
        { code: 'ED_15', type: 'long', required: true, label: 'Que problema, necessidade ou indignação deu origem à empresa?' },
        { code: 'ED_16', type: 'long', required: true, label: 'Quais valores são inegociáveis na forma como a empresa atua?' },
        { code: 'ED_17', type: 'long', required: false, label: 'A empresa possui um propósito declarado? Se sim, escreva a frase usada atualmente.' },
      ],
    },
    {
      id: 5,
      titulo: 'Cultura, marca empregadora e tensão estratégica',
      campos: [
        { code: 'ED_18', type: 'long', required: true, label: 'Como você descreveria a cultura atual da empresa de forma honesta, sem linguagem institucional?' },
        { code: 'ED_19', type: 'long', required: true, label: 'Por que alguém talentoso deveria escolher trabalhar na sua empresa em vez de escolher um concorrente?' },
        { code: 'ED_20', type: 'long', required: true, label: 'O que hoje, na cultura ou na operação, mais atrapalha a marca que vocês querem construir?' },
        { code: 'ED_21', type: 'long', required: true, label: 'Qual é a principal incoerência entre o que a empresa diz, o que entrega e o que vive internamente?' },
        { code: 'ED_22', type: 'long', required: true, label: 'Onde você quer que a empresa esteja em 3 anos, em termos de reputação, estrutura, mercado e percepção?' },
      ],
    },
  ],
};

// ── Formulário 2 — Território Estratégico de Valor (12 afirmações, escala 1–4) ──
export const ESCALA_TERRITORIO = [
  { value: 1, label: 'Mínima aderência' },
  { value: 2, label: 'Baixa aderência' },
  { value: 3, label: 'Alta aderência' },
  { value: 4, label: 'Máxima aderência' },
];

export const TERRITORIOS = {
  EO: { code: 'EO', nome: 'Eficiência e Confiabilidade' },
  PP: { code: 'PP', nome: 'Proximidade e Personalização' },
  DI: { code: 'DI', nome: 'Diferenciação e Inovação' },
};

export const FORM_TERRITORIO = {
  type: FORM_TYPES.TERRITORIO,
  slug: 'territorio',
  titulo: 'Território Estratégico de Valor',
  respondente: 'Fundador, sócio, CEO ou direção',
  tempo: '5 a 8 min',
  obrigatorio: true,
  afirmacoes: [
    { code: 'TV_EO_01', category: 'EO', peso: 1, text: 'No nosso mercado, preço competitivo, previsibilidade e eficiência influenciam fortemente a decisão de compra.' },
    { code: 'TV_EO_02', category: 'EO', peso: 1, text: 'A entrega da empresa precisa ser padronizada para garantir consistência, escala e controle de qualidade.' },
    { code: 'TV_EO_03', category: 'EO', peso: 1, text: 'Controlar custos, prazos e processos é essencial para sustentar a competitividade do negócio.' },
    { code: 'TV_EO_04', category: 'EO', peso: 1, text: 'O crescimento da empresa depende de organização, repetibilidade e capacidade de atender mais clientes com consistência.' },
    { code: 'TV_PP_01', category: 'PP', peso: 1, text: 'Conhecer profundamente o cliente é mais importante do que oferecer uma solução padronizada.' },
    { code: 'TV_PP_02', category: 'PP', peso: 1, text: 'A empresa gera valor ao adaptar sua entrega às necessidades específicas de cada cliente.' },
    { code: 'TV_PP_03', category: 'PP', peso: 1, text: 'Relacionamento, confiança e proximidade são fatores decisivos para conquistar e manter clientes.' },
    { code: 'TV_PP_04', category: 'PP', peso: 1, text: 'O sucesso da empresa depende da capacidade de entender o contexto, as dores e os critérios de decisão de cada cliente.' },
    { code: 'TV_DI_01', category: 'DI', peso: 1, text: 'A diferenciação da empresa está mais ligada à singularidade, inovação ou especialização do que ao preço.' },
    { code: 'TV_DI_02', category: 'DI', peso: 1, text: 'O cliente precisa perceber claramente que a empresa entrega algo diferente ou superior às alternativas do mercado.' },
    { code: 'TV_DI_03', category: 'DI', peso: 1, text: 'A empresa precisa evoluir constantemente sua oferta, linguagem ou experiência para manter relevância.' },
    { code: 'TV_DI_04', category: 'DI', peso: 1, text: 'Reputação, autoridade, originalidade ou excelência técnica são fatores centrais para sustentar o posicionamento da empresa.' },
  ],
};

// ── Metadados dos 4 cards do hub (3 e 4 entram na Fase 2) ───────────
export const FORMS_IDENTIDADE = [
  { type: FORM_TYPES.ESSENCIA, slug: 'essencia', titulo: 'Essência e Direção da Marca', respondente: 'Fundador / sócio / direção', tempo: '20 a 30 min', obrigatorio: true, fase: 1 },
  { type: FORM_TYPES.TERRITORIO, slug: 'territorio', titulo: 'Território Estratégico de Valor', respondente: 'Fundador / sócio / direção', tempo: '5 a 8 min', obrigatorio: true, fase: 1 },
  { type: FORM_TYPES.ESPELHO_INTERNO, slug: 'espelho-interno', titulo: 'Espelho Interno', respondente: 'Colaboradores (anônimo)', tempo: '5 min', obrigatorio: false, condicional: true, fase: 2 },
  { type: FORM_TYPES.ESPELHO_EXTERNO, slug: 'espelho-externo', titulo: 'Espelho Externo', respondente: 'Clientes / parceiros', tempo: '5 min', obrigatorio: false, condicional: true, fase: 2 },
];

export const FORM_BY_TYPE = { [FORM_ESSENCIA.type]: FORM_ESSENCIA, [FORM_TERRITORIO.type]: FORM_TERRITORIO };
export const FORM_BY_SLUG = { essencia: FORM_ESSENCIA, territorio: FORM_TERRITORIO };

// valida um bloco do Formulário 1 (campos obrigatórios preenchidos)
export function validarBlocoEssencia(bloco, answers) {
  const faltando = [];
  for (const campo of bloco.campos) {
    if (!campo.required) continue;
    const v = answers[campo.code];
    if (campo.type === 'words3') {
      const preenchidas = Array.isArray(v) ? v.filter((w) => w && w.trim()).length : 0;
      if (preenchidas < 2) faltando.push(campo.code); // mínimo 2 das 3 palavras
    } else if (campo.type === 'multi') {
      if (!Array.isArray(v) || v.length === 0) faltando.push(campo.code);
    } else if (!v || !String(v).trim()) {
      faltando.push(campo.code);
    }
  }
  return faltando;
}
