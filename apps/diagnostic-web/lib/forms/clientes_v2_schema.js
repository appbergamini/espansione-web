// lib/forms/clientes_v2_schema.js
// Schema do intake_clientes v2.
// Formulário IDENTIFICADO (não anônimo) — _respondente_id é persistido em respostas_json.

export const SECOES = [
  { id: 1, titulo: 'Quem é você',                           estimativaMin: 2 },
  { id: 2, titulo: 'Como você decide',                      estimativaMin: 3 },
  { id: 3, titulo: 'Jornada e atendimento',                 estimativaMin: 2 },
  { id: 4, titulo: 'Experiência e valor',                   estimativaMin: 3 },
  { id: 5, titulo: 'Personalidade da marca',                estimativaMin: 2 },
  { id: 6, titulo: 'Futuro e recomendação',                 estimativaMin: 2 },
  { id: 7, titulo: 'Participação opcional em entrevista',   estimativaMin: 1 },
];

export const FATORES_ESCOLHA = [
  { id: 'preco',         label: 'Preço / Custo-benefício' },
  { id: 'qualidade',     label: 'Qualidade técnica / Resultado' },
  { id: 'atendimento',   label: 'Atendimento / Experiência do cliente' },
  { id: 'recomendacao',  label: 'Recomendação de terceiros / Autoridade' },
  { id: 'localizacao',   label: 'Localização / Facilidade de acesso' },
];

export const TEMPO_CLIENTE = [
  'Menos de 3 meses',
  '3 a 12 meses',
  '1 a 3 anos',
  'Mais de 3 anos',
];

export const FREQUENCIA_USO = [
  'Diariamente / Semanalmente',
  'Mensalmente',
  'Algumas vezes por ano',
  'Esporadicamente, conforme necessidade',
];

export const IMPORTANCIA_SERVICO = [
  'Essencial (não vivo sem)',
  'Importante (uso com frequência)',
  'Ocasional (uso apenas quando necessário)',
];

export const PERCEPCAO_PRECO = [
  'Preço justo pelo alto valor entregue',
  'Preço elevado, mas vale o investimento',
  'Preço abaixo do que a entrega vale',
  'Preço alto para a entrega atual',
];

export const CANAIS_INTERACAO = [
  'Instagram / Redes Sociais',
  'WhatsApp',
  'Site oficial',
  'Google (busca ou mapas)',
  'Indicação pessoal',
  'Espaço físico / presencial',
  'E-mail',
  'Outro',
];

export const DIMENSOES_ATENDIMENTO = [
  'Cordialidade e empatia',
  'Conhecimento técnico / do produto',
  'Tempo de resposta / agilidade',
  'Clareza nas informações',
  'Confiança transmitida',
];

export const MUDARIA_POR_PRECO = [
  { value: 'sim',       label: 'Sim, mudaria sem pensar' },
  { value: 'pensaria',  label: 'Pensaria no assunto' },
  { value: 'nao',       label: 'Não, o vínculo é mais forte que preço' },
];

export const CANAIS_CONTATO = ['WhatsApp', 'E-mail', 'Telefone'];

export const HORARIOS_PREFERIDOS = [
  'Manhã (8h-12h)',
  'Tarde (12h-18h)',
  'Final de tarde (18h-20h)',
];

export const TEXTO_CONSENTIMENTO_OPT_IN_CLIENTE =
  'Autorizo o contato para agendamento de entrevista em profundidade sobre minha experiência com a marca.';

/**
 * Normaliza nome de dimensão para chave: "Cordialidade e empatia" → "cordialidade_e_empatia"
 */
export function toKey(label) {
  return String(label || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Validação. Regras:
 * - Seção 1: nome, profissão, cidade, tempo_cliente, frequência, importância, problema_resolver obrigatórios
 * - Seção 2: ranking completo (5 itens)
 * - Seção 3: ≥1 canal marcado + ≥3 das 5 dimensões de atendimento avaliadas
 * - Seção 4: satisfação, percepção de preço, mudaria por preço obrigatórios
 * - Seção 5: marca_uma_palavra obrigatório
 * - Seção 6: NPS (0-10) + NPS follow-up obrigatórios
 * - Seção 7: se "Sim" → canal_preferido + contato + horário obrigatórios
 */
export function validarFormulario(dados) {
  const erros = {};

  // Seção 1
  if (!dados.s1_nome_completo || String(dados.s1_nome_completo).trim() === '') erros.s1_nome_completo = 'Campo obrigatório';
  if (!dados.s1_profissao)      erros.s1_profissao       = 'Campo obrigatório';
  if (!dados.s1_cidade_estado)  erros.s1_cidade_estado   = 'Campo obrigatório';
  if (!dados.s1_tempo_cliente)  erros.s1_tempo_cliente   = 'Selecione uma opção';
  if (!dados.s1_frequencia_uso) erros.s1_frequencia_uso  = 'Selecione uma opção';
  if (!dados.s1_importancia)    erros.s1_importancia     = 'Selecione uma opção';
  if (!dados.s1_problema_resolver || String(dados.s1_problema_resolver).trim() === '') erros.s1_problema_resolver = 'Campo obrigatório';

  // Seção 2 — ranking completo (5)
  if (!Array.isArray(dados.s2_ranking_fatores) || dados.s2_ranking_fatores.length !== 5) {
    erros.s2_ranking_fatores = 'Ordene os 5 fatores (toque e arraste ou use as setas)';
  }

  // Seção 3 — canais + ≥3 dimensões avaliadas
  if (!Array.isArray(dados.s3_canais_interacao) || dados.s3_canais_interacao.length === 0) {
    erros.s3_canais_interacao = 'Selecione ao menos um canal';
  }
  const avaliadas = DIMENSOES_ATENDIMENTO.filter(dim => {
    const v = dados[`s3_atendimento_${toKey(dim)}`];
    return typeof v === 'number' && v >= 0 && v <= 10;
  });
  if (avaliadas.length < 3) {
    erros.s3_atendimento = 'Avalie ao menos 3 das 5 dimensões';
  }

  // Seção 4
  if (typeof dados.s4_satisfacao !== 'number') erros.s4_satisfacao = 'Dê uma nota de 0 a 10';
  if (!dados.s4_percepcao_preco)    erros.s4_percepcao_preco    = 'Selecione uma opção';
  if (!dados.s4_mudaria_por_preco)  erros.s4_mudaria_por_preco  = 'Selecione uma opção';

  // Seção 5
  if (!dados.s5_marca_uma_palavra || String(dados.s5_marca_uma_palavra).trim() === '') {
    erros.s5_marca_uma_palavra = 'Defina em uma palavra';
  }

  // Seção 6
  if (typeof dados.s6_nps !== 'number') erros.s6_nps = 'Dê uma nota de 0 a 10';
  if (!dados.s6_nps_porque || String(dados.s6_nps_porque).trim() === '') erros.s6_nps_porque = 'Explique sua nota';

  // Seção 7 (condicional)
  if (dados.s7_topa_entrevista === 'sim') {
    if (!dados.s7_canal_preferido) erros.s7_canal_preferido = 'Selecione o canal';
    if (!dados.s7_contato || String(dados.s7_contato).trim() === '') erros.s7_contato = 'Informe o contato';
    if (!dados.s7_horario)         erros.s7_horario         = 'Selecione o horário preferido';
  }

  return { valido: Object.keys(erros).length === 0, erros };
}

/**
 * Monta payload para /api/formularios.
 * Cliente é identificado: _respondente_id fica no respostas_json normalmente.
 * Opt-in segue o padrão: bloco _opt_in separado para /api/formularios rotear
 * para opt_in_entrevistas.
 */
export function construirPayload(dados, projetoId, token, respondenteId) {
  const {
    s7_topa_entrevista, s7_canal_preferido, s7_contato, s7_horario,
    ...respostasLimpas
  } = dados;

  const respostas = {
    ...respostasLimpas,
    s7_topa_entrevista: s7_topa_entrevista === 'sim' ? 'sim' : 'nao',
  };

  const payload = {
    projetoId,
    tipo: 'intake_clientes',
    token,
    respostas,
  };

  if (s7_topa_entrevista === 'sim' && s7_contato) {
    payload.respostas._opt_in = {
      aceito: true,
      nome: dados.s1_nome_completo,
      contato: String(s7_contato).trim(),
      canal_preferido: s7_canal_preferido,
      horario_preferido: s7_horario,
      consentimento_texto: TEXTO_CONSENTIMENTO_OPT_IN_CLIENTE,
    };
  }

  return payload;
}
