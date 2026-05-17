// FIX.24 — labels e cores compartilhados pela UI de Curadoria.

export const CATEGORIA_LABEL = {
  marca_percepcao:           'Marca e percepção',
  proposito_visao:           'Propósito e visão',
  cultura_valores:           'Cultura e valores',
  lideranca:                 'Liderança',
  comunicacao_interna:       'Comunicação interna',
  experiencia_colaborador:   'Experiência do colaborador',
  posicionamento:            'Posicionamento',
  diferenciacao_competitiva: 'Diferenciação competitiva',
  jornada_cliente:           'Jornada do cliente',
  riscos_tensoes:            'Riscos e tensões',
  oportunidades:             'Oportunidades',
  recomendacoes_prioritarias:'Recomendações prioritárias',
};

export const CATEGORIAS_LISTA = Object.keys(CATEGORIA_LABEL);

export const STATUS_LABEL = {
  pendente_revisao:     'Aguardando validação',
  aprovado:             'Aprovado para relatório',
  editado:              'Editado',
  excluido:             'Excluído do relatório',
  somente_bastidor:     'Somente bastidor',
  levar_discussao:      'Levar para discussão',
  reanalise_solicitada: 'Reanálise solicitada',
  validado_cliente:     'Validado com cliente',
};

export const STATUS_LISTA = Object.keys(STATUS_LABEL);

export const STATUS_COR = {
  pendente_revisao:     { fg: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  aprovado:             { fg: '#10b981', bg: 'rgba(16,185,129,0.14)' },
  editado:              { fg: '#6BA3FF', bg: 'rgba(107,163,255,0.14)' },
  excluido:             { fg: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  somente_bastidor:     { fg: '#a78bfa', bg: 'rgba(167,139,250,0.14)' },
  levar_discussao:      { fg: '#ec4899', bg: 'rgba(236,72,153,0.14)' },
  reanalise_solicitada: { fg: '#fb7185', bg: 'rgba(251,113,133,0.14)' },
  validado_cliente:     { fg: '#22c55e', bg: 'rgba(34,197,94,0.14)' },
};

export function getEffectiveField(block, field) {
  // Campos editados têm precedência sobre ai_*. Usado pela UI e
  // futuramente pelo Agente 15 ao consumir blocos aprovados.
  const editedKey = `edited_${field}`;
  const aiKey = `ai_${field}`;
  if (field === 'titulo') {
    return block.edited_titulo || block.titulo;
  }
  if (block[editedKey] != null && String(block[editedKey]).trim()) {
    return block[editedKey];
  }
  return block[aiKey] || null;
}
