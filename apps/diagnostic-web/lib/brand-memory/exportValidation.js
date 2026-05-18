export const BRAND_MEMORY_EXPORT_SLICES_BY_AGENT = {
  2: ['vi'],
  4: ['ve'],
  5: ['vm', 'vm_sources'],
  6: ['decodificacao'],
  7: ['values_and_attributes'],
  8: ['diretrizes_estrategicas'],
  9: ['plataforma_branding'],
  10: ['voice_profile'],
  11: ['visual_identity'],
  12: ['experiencia'],
  13: ['plano_comunicacao'],
  14: ['evp'],
};

export const REQUIRED_BRAND_MEMORY_EXPORT_AGENT_IDS = [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
export const OPTIONAL_BRAND_MEMORY_EXPORT_AGENT_IDS = [14];
export const BRAND_MEMORY_EXPORT_VALID_STATUSES = new Set(['valid', 'warning']);

const TAG_REGEX = /<brand_memory_export>([\s\S]*?)<\/brand_memory_export>/i;
const SLICE_ALIASES_BY_AGENT = {
  5: { vm_sources: ['sources'] },
  6: { decodificacao: ['__root__'] },
  7: { values_and_attributes: ['__root__'] },
  8: { diretrizes_estrategicas: ['diretrizes'] },
  12: { experiencia: ['__root__'] },
  13: { plano_comunicacao: ['__root__'] },
};

export function getExpectedBrandMemorySlices(agentId) {
  return BRAND_MEMORY_EXPORT_SLICES_BY_AGENT[Number(agentId)] || [];
}

export function extractBrandMemoryExportRaw(outputContent = '') {
  const match = String(outputContent || '').match(TAG_REGEX);
  return match ? stripJsonFence(match[1].trim()) : '';
}

export function extractBrandMemoryExportJson(outputContent = '') {
  const raw = extractBrandMemoryExportRaw(outputContent);
  if (!raw) return null;
  return JSON.parse(raw);
}

export function validateAgentBrandMemoryExport({ agentId, outputContent, expectedSlices } = {}) {
  const normalizedAgentId = String(agentId ?? '');
  const expected = Array.isArray(expectedSlices) ? expectedSlices : getExpectedBrandMemorySlices(agentId);
  const result = {
    agent_id: normalizedAgentId,
    expected_slices: expected,
    found_slices: [],
    missing_slices: [],
    invalid_slices: [],
    warnings: [],
    errors: [],
    status: 'not_applicable',
  };

  const raw = extractBrandMemoryExportRaw(outputContent);
  if (!raw) {
    if (expected.length === 0) return result;
    result.missing_slices = [...expected];
    result.errors.push('Tag <brand_memory_export> ausente.');
    result.status = 'missing';
    return result;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    result.missing_slices = [...expected];
    result.invalid_slices = [...expected];
    result.errors.push(`JSON invalido no <brand_memory_export>: ${error.message}`);
    result.status = 'invalid';
    return result;
  }

  if (!isPlainObject(parsed)) {
    result.missing_slices = [...expected];
    result.invalid_slices = [...expected];
    result.errors.push('O <brand_memory_export> deve conter um objeto JSON na raiz.');
    result.status = 'invalid';
    return result;
  }

  if (expected.length === 0) {
    result.warnings.push('Agente sem slices esperados emitiu <brand_memory_export>. O bloco foi ignorado para prontidao da Brand Memory.');
  }

  if (!parsed.schema_version) {
    result.warnings.push('schema_version ausente no <brand_memory_export>.');
  } else if (String(parsed.schema_version) !== '2.0') {
    result.warnings.push(`schema_version inesperado: ${parsed.schema_version}.`);
  }

  if (parsed.agent_id === undefined || parsed.agent_id === null) {
    result.warnings.push('agent_id ausente no <brand_memory_export>.');
  } else if (Number(parsed.agent_id) !== Number(agentId)) {
    result.warnings.push(`agent_id divergente: esperado ${agentId}, recebido ${parsed.agent_id}.`);
  }

  for (const slice of expected) {
    const resolved = resolveSliceValue(parsed, slice, agentId);
    if (!resolved.found) {
      result.missing_slices.push(slice);
      continue;
    }

    if (!hasMinimalSliceStructure(resolved.value)) {
      result.invalid_slices.push(slice);
      continue;
    }

    result.found_slices.push(slice);
    if (resolved.alias && resolved.alias !== slice) {
      result.warnings.push(`Slice ${slice} encontrado via formato equivalente (${resolved.alias}).`);
    }
  }

  if (result.missing_slices.length > 0) {
    result.errors.push(`Slices ausentes: ${result.missing_slices.join(', ')}.`);
  }
  if (result.invalid_slices.length > 0) {
    result.errors.push(`Slices com estrutura minima invalida: ${result.invalid_slices.join(', ')}.`);
  }

  if (result.errors.length > 0) result.status = 'invalid';
  else if (result.warnings.length > 0) result.status = 'warning';
  else result.status = 'valid';

  return result;
}

export function buildBrandMemoryExportReadiness(outputs = [], { includeEvp = false } = {}) {
  const outputsByAgent = normalizeOutputsByAgent(outputs);
  const expectedAgents = [
    ...REQUIRED_BRAND_MEMORY_EXPORT_AGENT_IDS,
    ...OPTIONAL_BRAND_MEMORY_EXPORT_AGENT_IDS,
  ];

  const items = expectedAgents.map((agentNum) => {
    const expectedSlices = getExpectedBrandMemorySlices(agentNum);
    const output = outputsByAgent[agentNum] || null;
    const isEvp = agentNum === 14;
    const required = !isEvp || includeEvp;

    if (isEvp && !includeEvp && !output) {
      return decorateReadinessItem({
        agentNum,
        output,
        required,
        result: {
          agent_id: String(agentNum),
          expected_slices: expectedSlices,
          found_slices: [],
          missing_slices: [],
          invalid_slices: [],
          warnings: ['EVP fora do escopo deste projeto.'],
          errors: [],
          status: 'not_applicable',
        },
      });
    }

    let result = normalizeStoredValidationResult(output?.brand_memory_export_validation_result);
    if (!result) {
      result = validateAgentBrandMemoryExport({
        agentId: String(agentNum),
        outputContent: output?.conteudo || '',
        expectedSlices,
      });
      if (output && result.status !== 'not_applicable') {
        result = {
          ...result,
          warnings: [
            ...result.warnings,
            'Output legado validado em leitura; reprocessar o agente para persistir esta validacao.',
          ],
          status: result.status === 'valid' ? 'warning' : result.status,
        };
      }
    }

    return decorateReadinessItem({ agentNum, output, required, result });
  });

  const blockingItems = items.filter((item) => item.blocking);
  return {
    ready: blockingItems.length === 0,
    items,
    blockingItems,
  };
}

export function assertBrandMemoryExportsReadyForAgent16(outputs = [], { includeEvp = false } = {}) {
  const readiness = buildBrandMemoryExportReadiness(outputs, { includeEvp });
  if (readiness.ready) return readiness;

  const detail = readiness.blockingItems
    .map((item) => {
      const slices = item.expected_slices.join(', ');
      const reason = [...item.errors, ...item.warnings].filter(Boolean).join(' ');
      return `Agente ${item.agent_num} (${slices}): ${reason || item.status}`;
    })
    .join(' | ');

  const error = new Error(
    `Agente 16 bloqueado: exports obrigatorios da Brand Memory estao ausentes ou invalidos. ${detail} Reprocesse os agentes indicados antes de gerar a Brand Memory.`,
  );
  error.code = 'BRAND_MEMORY_EXPORTS_NOT_READY';
  error.readiness = readiness;
  throw error;
}

function decorateReadinessItem({ agentNum, output, required, result }) {
  const blocking = required && ['missing', 'invalid'].includes(result.status);
  return {
    ...result,
    agent_num: agentNum,
    output_id: output?.id || null,
    output_created_at: output?.created_at || null,
    required,
    blocking,
    recommended_action: getRecommendedAction({ result, required, agentNum }),
  };
}

function getRecommendedAction({ result, required, agentNum }) {
  if (!required) return 'Opcional. Nao bloqueia a Brand Memory.';
  if (result.status === 'valid') return 'Pronto para o Agente 16.';
  if (result.status === 'warning') return 'Pode seguir, mas revise os avisos.';
  if (result.status === 'missing') return `Reprocessar Agente ${agentNum} para emitir <brand_memory_export>.`;
  if (result.status === 'invalid') return `Corrigir e reprocessar Agente ${agentNum}.`;
  return 'Sem acao necessaria.';
}

function normalizeOutputsByAgent(outputs) {
  if (!outputs) return {};
  if (!Array.isArray(outputs)) return outputs;
  return [...outputs]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .reduce((acc, output) => {
      if (!acc[output.agent_num]) acc[output.agent_num] = output;
      return acc;
    }, {});
}

function normalizeStoredValidationResult(value) {
  if (!value || typeof value !== 'object') return null;
  if (!value.status || !Array.isArray(value.expected_slices)) return null;
  return {
    agent_id: String(value.agent_id ?? ''),
    expected_slices: Array.isArray(value.expected_slices) ? value.expected_slices : [],
    found_slices: Array.isArray(value.found_slices) ? value.found_slices : [],
    missing_slices: Array.isArray(value.missing_slices) ? value.missing_slices : [],
    invalid_slices: Array.isArray(value.invalid_slices) ? value.invalid_slices : [],
    warnings: Array.isArray(value.warnings) ? value.warnings : [],
    errors: Array.isArray(value.errors) ? value.errors : [],
    status: value.status,
  };
}

function resolveSliceValue(parsed, slice, agentId) {
  if (Object.prototype.hasOwnProperty.call(parsed, slice)) {
    return { found: true, value: parsed[slice], alias: slice };
  }

  const aliases = SLICE_ALIASES_BY_AGENT[Number(agentId)]?.[slice] || [];
  for (const alias of aliases) {
    if (alias === '__root__') {
      const rootValue = omitExportMetadata(parsed);
      return { found: Object.keys(rootValue).length > 0, value: rootValue, alias };
    }
    if (Object.prototype.hasOwnProperty.call(parsed, alias)) {
      return { found: true, value: parsed[alias], alias };
    }
  }

  return { found: false, value: undefined, alias: null };
}

function omitExportMetadata(value) {
  if (!isPlainObject(value)) return {};
  const { schema_version, agent_id, _gaps, ...rest } = value;
  return rest;
}

function stripJsonFence(text) {
  let next = String(text || '').trim();
  next = next.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const firstBrace = next.indexOf('{');
  const lastBrace = next.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) next = next.slice(firstBrace, lastBrace + 1).trim();
  return next;
}

function hasMinimalSliceStructure(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isPlainObject(value)) return Object.keys(value).length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
