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
        { code: 'ED_RESP_NOME', type: 'short', required: true, label: 'Nome completo (de quem está respondendo).' },
        { code: 'ED_RESP_NASC', type: 'short', required: true, label: 'Data de nascimento (DD/MM/AA).' },
        { code: 'ED_01', type: 'short', required: true, label: 'Nome da empresa ou marca.' },
        { code: 'ED_02', type: 'short', required: true, label: 'Site, Instagram ou principal canal digital.' },
        // ED_03 (estágio), ED_04 (colaboradores) e ED_05 (faturamento) foram
        // removidos: agora são capturados na etapa "Contexto da Empresa" do
        // Mapa de Maturidade (sem duplicar com o cliente).
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

// ── Escala de frequência (Espelho Interno, EI_05–EI_14) ─────────────
export const ESCALA_FREQUENCIA = [
  { value: 1, label: 'Nunca' },
  { value: 2, label: 'Poucas vezes' },
  { value: 3, label: 'Muitas vezes' },
  { value: 4, label: 'Sempre' },
];

// ── Formulário 3 — Espelho Interno (anônimo, multi-respondente) ──────
// Campos de escala: scale4 (frequência 1–4) e scale10 (0–10, eNPS).
export const FORM_ESPELHO_INTERNO = {
  type: FORM_TYPES.ESPELHO_INTERNO,
  slug: 'espelho-interno',
  titulo: 'Espelho Interno',
  respondente: 'Colaboradores (anônimo)',
  tempo: '5 min',
  obrigatorio: false,
  anonimo: true,
  intro: 'Esta pesquisa é anônima. Não coletamos nome, e-mail ou telefone. Responda com sinceridade — o objetivo é entender como a cultura é vivida de verdade no dia a dia.',
  blocos: [
    {
      id: 1,
      titulo: 'Sobre você (não identificável)',
      campos: [
        { code: 'EI_01', type: 'single', required: true, label: 'Em qual área você atua?', options: ['Administrativo', 'Financeiro', 'Comercial/Vendas', 'Marketing/Comunicação', 'Operação/Entrega', 'Atendimento/Relacionamento', 'Tecnologia/Produto', 'Pessoas/RH', 'Gestão/Liderança', 'Outro', 'Prefiro não informar'] },
        { code: 'EI_02', type: 'single', required: true, label: 'Há quanto tempo você está na empresa?', options: ['Menos de 6 meses', '6 a 12 meses', '1 a 3 anos', '3 a 5 anos', 'Mais de 5 anos', 'Prefiro não informar'] },
      ],
    },
    {
      id: 2,
      titulo: 'Palavras-espelho',
      campos: [
        { code: 'EI_03', type: 'words3', required: true, label: 'Quando você pensa na empresa, quais são as 3 primeiras palavras que vêm à sua mente?' },
        { code: 'EI_04', type: 'words3', required: false, label: 'Como é trabalhar aqui, em 3 palavras?' },
      ],
    },
    {
      id: 3,
      titulo: 'Cultura vivida',
      escala: 'frequencia',
      campos: [
        { code: 'EI_05', type: 'scale4', required: true, label: 'Eu conheço o propósito e os valores da empresa.' },
        { code: 'EI_06', type: 'scale4', required: true, label: 'Os valores da empresa são vividos nas decisões e atitudes do dia a dia.' },
        { code: 'EI_07', type: 'scale4', required: true, label: 'Os comportamentos esperados das pessoas são claros.' },
        { code: 'EI_08', type: 'scale4', required: true, label: 'Minha opinião é ouvida e considerada.' },
        { code: 'EI_09', type: 'scale4', required: true, label: 'Eu me sinto seguro para discordar ou apontar problemas sem medo de retaliação.' },
        { code: 'EI_10', type: 'scale4', required: true, label: 'A liderança orienta, desenvolve e dá feedback de forma consistente.' },
        { code: 'EI_11', type: 'scale4', required: true, label: 'A colaboração entre áreas ou pessoas funciona bem.' },
        { code: 'EI_12', type: 'scale4', required: true, label: 'A empresa reconhece atitudes alinhadas à cultura desejada.' },
        { code: 'EI_13', type: 'scale4', required: true, label: 'Eu sinto orgulho de trabalhar aqui.' },
        { code: 'EI_14', type: 'scale4', required: true, label: 'O que a empresa comunica para fora combina com o que é vivido internamente.' },
      ],
    },
    {
      id: 4,
      titulo: 'Síntese',
      campos: [
        { code: 'EI_15', type: 'short', required: false, label: 'O que mais fortalece a cultura da empresa hoje?' },
        { code: 'EI_16', type: 'short', required: false, label: 'O que mais enfraquece a cultura da empresa hoje?' },
        { code: 'EI_17', type: 'scale10', required: true, label: 'De 0 a 10, o quanto você recomendaria esta empresa como um bom lugar para trabalhar?' },
      ],
    },
  ],
};

// ── Formulário 4 — Espelho Externo (clientes, identificável) ────────
export const FORM_ESPELHO_EXTERNO = {
  type: FORM_TYPES.ESPELHO_EXTERNO,
  slug: 'espelho-externo',
  titulo: 'Espelho Externo',
  respondente: 'Clientes / parceiros',
  tempo: '5 min',
  obrigatorio: false,
  anonimo: false,
  intro: 'Queremos entender a sua percepção real sobre a marca — não é uma avaliação de atendimento. Suas respostas ajudam a empresa a enxergar como é vista de fora.',
  blocos: [
    {
      id: 1,
      titulo: 'Você e a marca',
      campos: [
        { code: 'EE_01', type: 'short', required: false, label: 'Nome ou identificação do respondente.' },
        { code: 'EE_02', type: 'short', required: false, label: 'Cargo, profissão ou relação com a empresa.' },
        { code: 'EE_03', type: 'single', required: true, label: 'Há quanto tempo você conhece ou é cliente da empresa?', options: ['Menos de 3 meses', '3 a 12 meses', '1 a 3 anos', 'Mais de 3 anos', 'Ainda não sou cliente, mas conheço a marca'] },
        { code: 'EE_04', type: 'single', required: true, label: 'Como você chegou até a empresa?', options: ['Indicação', 'Google', 'Instagram', 'LinkedIn', 'WhatsApp', 'Site', 'Evento', 'Prospecção ativa', 'Parceria', 'Cliente antigo', 'Networking', 'Outro'] },
      ],
    },
    {
      id: 2,
      titulo: 'Decisão e valor percebido',
      campos: [
        { code: 'EE_05', type: 'multi', required: true, max: 3, label: 'O que mais influenciou sua decisão de escolher ou considerar esta empresa? (máx. 3)', options: ['Confiança', 'Reputação', 'Atendimento', 'Qualidade técnica', 'Especialização', 'Resultado esperado', 'Indicação', 'Relacionamento', 'Clareza da proposta', 'Preço', 'Conveniência', 'Experiência anterior positiva', 'Outro'] },
        { code: 'EE_06', type: 'long', required: true, label: 'Que problema, necessidade ou desejo fez você procurar por esse tipo de solução?' },
        { code: 'EE_07', type: 'scale10', required: true, label: 'De 0 a 10, o quanto você está satisfeito com a experiência ou resultado entregue pela empresa?' },
        { code: 'EE_08', type: 'single', required: true, label: 'Como você percebe o preço em relação ao benefício entregue?', options: ['Preço justo pelo valor entregue', 'Preço elevado, mas vale o investimento', 'Preço abaixo do que a entrega vale', 'Preço alto para a entrega atual', 'Não sei avaliar'] },
      ],
    },
    {
      id: 3,
      titulo: 'Percepção de marca',
      campos: [
        { code: 'EE_09', type: 'long', required: true, label: 'Na sua visão, qual é o maior diferencial desta empresa em relação a outras opções?' },
        { code: 'EE_10', type: 'long', required: true, label: 'Se essa empresa fosse uma pessoa, como você descreveria a personalidade dela?' },
        { code: 'EE_11', type: 'short', required: true, label: 'Defina esta empresa em uma única palavra.' },
        { code: 'EE_12', type: 'short', required: false, label: 'Qual palavra você nunca usaria para descrever esta empresa?' },
        { code: 'EE_13', type: 'scale10', required: true, label: 'De 0 a 10, o quanto você recomendaria esta empresa para alguém?' },
        { code: 'EE_14', type: 'long', required: false, label: 'Como você apresentaria esta empresa em poucas palavras para alguém da sua rede?' },
      ],
    },
  ],
};

// ── Metadados dos cards do hub (Essência+Território consolidados num só) ──
export const FORMS_IDENTIDADE = [
  { type: 'lideranca', slug: 'lideranca', titulo: 'Essência + Território de Valor', respondente: 'Fundador / sócio / direção', tempo: '25 a 35 min', obrigatorio: true, shared: false, combines: [FORM_TYPES.ESSENCIA, FORM_TYPES.TERRITORIO] },
  { type: FORM_TYPES.ESPELHO_INTERNO, slug: 'espelho-interno', titulo: 'Espelho Interno', respondente: 'Colaboradores (anônimo)', tempo: '5 min', obrigatorio: false, condicional: true, shared: true, anonimo: true },
  { type: FORM_TYPES.ESPELHO_EXTERNO, slug: 'espelho-externo', titulo: 'Espelho Externo', respondente: 'Clientes / parceiros', tempo: '5 min', obrigatorio: false, condicional: true, shared: true, anonimo: false },
];

export const FORM_BY_TYPE = {
  [FORM_ESSENCIA.type]: FORM_ESSENCIA,
  [FORM_TERRITORIO.type]: FORM_TERRITORIO,
  [FORM_ESPELHO_INTERNO.type]: FORM_ESPELHO_INTERNO,
  [FORM_ESPELHO_EXTERNO.type]: FORM_ESPELHO_EXTERNO,
};
export const FORM_BY_SLUG = {
  essencia: FORM_ESSENCIA,
  territorio: FORM_TERRITORIO,
  'espelho-interno': FORM_ESPELHO_INTERNO,
  'espelho-externo': FORM_ESPELHO_EXTERNO,
};

// valida um formulário de blocos (Espelhos) — devolve códigos faltando
export function validateSurvey(formDef, answers) {
  const faltando = [];
  for (const bloco of formDef.blocos || []) {
    for (const campo of bloco.campos) {
      if (!campo.required) continue;
      const v = answers[campo.code];
      if (campo.type === 'words3') {
        const n = Array.isArray(v) ? v.filter((w) => w && w.trim()).length : 0;
        if (n < 2) faltando.push(campo.code);
      } else if (campo.type === 'multi') {
        if (!Array.isArray(v) || v.length === 0) faltando.push(campo.code);
      } else if (campo.type === 'scale4' || campo.type === 'scale10') {
        if (typeof v !== 'number') faltando.push(campo.code);
      } else if (!v || !String(v).trim()) {
        faltando.push(campo.code);
      }
    }
  }
  return faltando;
}

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
