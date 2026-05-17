// lib/forms/colaboradores_v3_schema.js
//
// Schema do intake_colaboradores v3.
//
// CONTRATO CRÍTICO DE ANONIMATO:
// - respostas (gravadas em formularios.respostas_json) NUNCA carregam
//   _respondente_id — o backend (TASK 1.2) descarta antes de persistir
//   para tipos TIPOS_ANONIMOS.
// - O bloco opt-in, quando aceito, vai em `_opt_in` dentro de respostas;
//   o backend (TASK 1.2) reconhece, grava em opt_in_entrevistas e
//   descarta do payload antes de persistir respostas_json.
// - UI não exibe nome/e-mail do respondente (mesmo sabendo internamente
//   via token) — reforça a percepção de anonimato.

export const BLOCOS = [
  { id: 1, titulo: 'Perfil',                                  estimativaMin: 1 },
  { id: 2, titulo: 'Marca e Propósito',                       estimativaMin: 2 },
  { id: 3, titulo: 'Cultura vivida',                          estimativaMin: 1 },
  { id: 4, titulo: 'Segurança psicológica',                   estimativaMin: 1 },
  { id: 5, titulo: 'Liderança imediata',                      estimativaMin: 1 },
  { id: 6, titulo: 'Coerência e momentos-chave',              estimativaMin: 2 },
  { id: 7, titulo: 'Motivação e permanência',                 estimativaMin: 2 },
  { id: 8, titulo: 'Participação opcional em entrevista',     estimativaMin: 1 },
];

export const AREAS = [
  'Administrativo / Financeiro',
  'Comercial / Vendas',
  'Marketing / Comunicação',
  'Operação / Produção / Entrega',
  'Atendimento / Relacionamento',
  'Tecnologia / Produto',
  'Pessoas / Gestão / Liderança',
  'Outro',
];

export const TEMPOS_CASA = [
  'Menos de 6 meses',
  '6 a 12 meses',
  '1 a 3 anos',
  '3 a 5 anos',
  'Mais de 5 anos',
];

export const INDICOU_VAGA_OPCOES = [
  'Sim, indiquei',
  'Não, mas indicaria se tivesse vaga alinhada',
  'Não indicaria',
  'Nunca houve vaga aberta no meu período',
];

export const TEXTO_CONSENTIMENTO_OPT_IN =
  'Aceito que meu nome e contato sejam registrados em área separada do banco de dados, para uso exclusivo de agendamento de entrevista. Entendo que minhas respostas anteriores permanecem anônimas e não serão vinculadas a esta identificação.';

/**
 * Valida o formulário. Obrigatórios:
 * - Bloco 1: área + tempo de casa
 * - Bloco 2: ao menos 2 das 3 palavras-empresa + imagem_mercado + conhece_proposito
 * - Bloco 3: valores no dia a dia + opinião ouvida
 * - Bloco 5: nota da liderança (0-10)
 * - Bloco 7: eNPS + follow-up
 * - Bloco 8: se "Sim" → nome + contato + consentimento
 * Blocos 4 e 6 são opcionais.
 */
export function validarFormulario(dados) {
  const erros = {};

  // Bloco 1
  if (!dados.b1_area)       erros.b1_area       = 'Selecione sua área';
  if (!dados.b1_tempo_casa) erros.b1_tempo_casa = 'Selecione seu tempo de casa';

  // Bloco 2
  const palavrasEmpresa = [dados.b2_palavra1_empresa, dados.b2_palavra2_empresa, dados.b2_palavra3_empresa]
    .filter(p => p && String(p).trim() !== '');
  if (palavrasEmpresa.length < 2) {
    erros.b2_palavras_empresa = 'Preencha pelo menos 2 palavras';
  }
  if (typeof dados.b2_imagem_mercado !== 'number')    erros.b2_imagem_mercado    = 'Responda a escala';
  if (typeof dados.b2_conhece_proposito !== 'number') erros.b2_conhece_proposito = 'Responda a escala';

  // Bloco 3
  if (typeof dados.b3_valores_no_dia_a_dia !== 'number') erros.b3_valores_no_dia_a_dia = 'Responda a escala';
  if (typeof dados.b3_opiniao_ouvida !== 'number')       erros.b3_opiniao_ouvida       = 'Responda a escala';

  // Bloco 5
  if (typeof dados.b5_nota_lideranca !== 'number') erros.b5_nota_lideranca = 'Dê uma nota de 0 a 10';

  // Bloco 7
  if (typeof dados.b7_enps !== 'number') erros.b7_enps = 'Dê uma nota de 0 a 10';
  if (!dados.b7_enps_porque || String(dados.b7_enps_porque).trim() === '') {
    erros.b7_enps_porque = 'Explique sua nota';
  }

  // Bloco 8 — condicional
  if (dados.b8_topa_entrevista === 'sim') {
    if (!dados.b8_nome || String(dados.b8_nome).trim() === '') erros.b8_nome = 'Informe seu nome';
    if (!dados.b8_contato || String(dados.b8_contato).trim() === '') erros.b8_contato = 'Informe seu contato';
    if (!dados.b8_consentimento) erros.b8_consentimento = 'É preciso aceitar o termo de consentimento';
  }

  return { valido: Object.keys(erros).length === 0, erros };
}

/**
 * Monta payload para /api/formularios.
 *
 * Destino:
 * - respostas contém os blocos 1-7 + b8_topa_entrevista (sim/nao apenas).
 * - Se b8_topa_entrevista === 'sim' + consentimento, coloca `_opt_in` dentro
 *   de respostas com { aceito, nome, contato, consentimento_texto, area, tempo_casa }.
 *   O backend (TASK 1.2):
 *     (a) reconhece _opt_in, cria registro em opt_in_entrevistas,
 *     (b) remove _opt_in antes de persistir respostas_json,
 *     (c) remove _respondente_id + _respondente_email para tipos anônimos.
 *
 * Os campos b8_nome, b8_contato, b8_consentimento NÃO entram em respostas —
 * são redirecionados exclusivamente para o bloco _opt_in.
 */
export function construirPayload(dados, projetoId, token) {
  const {
    b8_topa_entrevista, b8_nome, b8_contato, b8_consentimento,
    ...respostasLimpas
  } = dados;

  const respostas = {
    ...respostasLimpas,
    // Registra apenas "sim/nao" no corpo anônimo — sem identificar.
    b8_topa_entrevista: b8_topa_entrevista === 'sim' ? 'sim' : 'nao',
  };

  if (b8_topa_entrevista === 'sim' && b8_nome && b8_contato && b8_consentimento) {
    respostas._opt_in = {
      aceito: true,
      nome: String(b8_nome).trim(),
      contato: String(b8_contato).trim(),
      consentimento_texto: TEXTO_CONSENTIMENTO_OPT_IN,
      area: dados.b1_area || null,
      tempo_casa: dados.b1_tempo_casa || null,
    };
  }

  return {
    projetoId,
    tipo: 'intake_colaboradores',
    token,
    respostas,
  };
}
