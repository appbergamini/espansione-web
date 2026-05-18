export function getStepPayload(stepOrOutput) {
  const output = stepOrOutput?.output || stepOrOutput;
  return output?.data || output || {};
}

export function normalizeDecision(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return formatValue(value.decisao || value.decision || value.status || value.resultado || value.result || value);
  }
  return String(value);
}

export function extractEditedCopy(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.copy_final || value.copy || value.texto || value.legenda || value.versao_final || formatValue(value);
  }
  return String(value);
}

export function extractEditedVisual(value) {
  if (!value || typeof value !== 'object') return '';
  return value.direcao_visual_final || value.direcao_visual || value.visual || '';
}

export function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(formatValue).filter(Boolean).join('\n');
  if (typeof value === 'object') {
    if (value.texto && value.titulo) return `${value.titulo}: ${value.texto}`;
    if (value.titulo && value.descricao) return `${value.titulo}: ${value.descricao}`;
    if (value.name && value.description) return `${value.name}: ${value.description}`;
    return Object.entries(value)
      .map(([key, item]) => `${humanizeKey(key)}: ${formatValue(item)}`)
      .join('\n');
  }
  return String(value);
}

export function buildApprovedArtworkPrompt({ request, copyStep, visualStep, editorStep, approverStep }) {
  const copy = getStepPayload(copyStep);
  const visual = getStepPayload(visualStep);
  const editor = getStepPayload(editorStep);
  const approver = getStepPayload(approverStep);
  const decision = normalizeDecision(approver.decisao || approver.decision);

  if (decision !== 'approved') {
    const error = new Error('A imagem só pode ser gerada quando o aprovador marcar a peça como aprovada.');
    error.statusCode = 400;
    throw error;
  }

  const finalCopy = extractEditedCopy(editor.versao_editada) || copy.copy_principal || copy.legenda || '';
  const finalVisual = extractEditedVisual(editor.versao_editada) || visual.direcao_de_arte || '';
  const headline = copy.headline || '';
  const cta = copy.cta || '';

  if (!finalCopy && !finalVisual) {
    const error = new Error('Não encontrei texto ou direção visual aprovada para gerar a arte.');
    error.statusCode = 400;
    throw error;
  }

  return [
    'Crie somente a imagem/fundo da arte de marketing em formato quadrado 1:1, pronta para receber texto por cima em uma camada separada.',
    'Use a direção visual aprovada como fonte principal. Não adicione logotipos, selos, marcas de terceiros, dados, números ou claims que não estejam no material aprovado.',
    'REGRA CRÍTICA: não inclua nenhuma palavra, letra, frase, número, assinatura, legenda, botão, texto simulado, placa, tipografia ou caracteres na imagem. Deixe áreas com respiro visual para aplicação posterior de texto real.',
    '',
    'CONTEXTO DO PEDIDO:',
    `Tipo: ${request?.request_type || 'social_post'}`,
    `Canal: ${request?.channel || 'instagram'}`,
    `Objetivo: ${request?.objective || 'awareness'}`,
    `Público: ${request?.audience_cluster || 'não especificado'}`,
    `Contexto: ${request?.context || 'não especificado'}`,
    '',
    'TEXTO APROVADO:',
    'O texto abaixo é apenas contexto para composição. NÃO renderize esse texto dentro da imagem.',
    finalCopy || 'Sem texto final obrigatório.',
    '',
    'HEADLINE:',
    'A headline será aplicada depois em HTML/CSS. NÃO renderize na imagem.',
    headline || 'Sem headline obrigatória.',
    '',
    'CTA:',
    'O CTA será aplicado depois em HTML/CSS. NÃO renderize na imagem.',
    cta || 'Sem CTA obrigatório.',
    '',
    'DIREÇÃO VISUAL APROVADA:',
    finalVisual || formatValue(visual),
    '',
    'REGRAS VISUAIS / RESTRIÇÕES:',
    formatValue(visual.regras_visuais || ''),
    formatValue(visual.restricoes_visuais || ''),
  ].filter(Boolean).join('\n');
}

export function buildApprovedArtworkOverlay({ copyStep, editorStep }) {
  const copy = getStepPayload(copyStep);
  const editor = getStepPayload(editorStep);
  const finalCopy = extractEditedCopy(editor.versao_editada) || copy.copy_principal || copy.legenda || '';
  const headline = formatValue(copy.headline || firstSentence(finalCopy)).trim();
  const cta = formatValue(copy.cta || '').trim();
  const body = finalCopy && finalCopy !== headline ? formatValue(finalCopy).trim() : '';

  return {
    headline,
    body: body.length > 220 ? `${body.slice(0, 217).trim()}...` : body,
    cta,
  };
}

export async function generateApprovedArtwork({ prompt }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY não configurada no servidor.');
    error.statusCode = 500;
    throw error;
  }

  const model = 'gpt-image-2-2026-04-21';
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: process.env.OPENAI_IMAGE_SIZE || '1024x1024',
      quality: process.env.OPENAI_IMAGE_QUALITY || 'medium',
    }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(json?.error?.message || 'Erro ao gerar imagem com GPT Image.');
    error.statusCode = response.status;
    throw error;
  }

  const image = json?.data?.[0];
  if (!image?.b64_json) {
    const error = new Error('A API de imagem não retornou base64.');
    error.statusCode = 502;
    throw error;
  }

  return {
    model,
    mimeType: 'image/png',
    b64: image.b64_json,
    revisedPrompt: image.revised_prompt || null,
    usage: json.usage || null,
  };
}

function humanizeKey(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function firstSentence(text) {
  return String(text || '').split(/(?<=[.!?])\s+/)[0] || '';
}
