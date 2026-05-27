export function getPrimaryAdminAction({
  pendingCheckpoint,
  nextAgent,
  brandMemoryExportReady,
  brandMemoryExportValid,
  brandMemoryExportInvalid,
} = {}) {
  if (pendingCheckpoint) {
    return { type: 'approve_checkpoint' };
  }

  if (nextAgent !== null && nextAgent !== undefined && Number(nextAgent) !== 16) {
    return {
      type: 'run_agent',
      agentNum: Number(nextAgent),
      label: `Executar Agente ${Number(nextAgent)}`,
    };
  }

  if (brandMemoryExportReady) {
    return {
      type: 'generate_brand_memory',
      agentNum: 16,
      label: brandMemoryExportInvalid ? 'Regenerar Brand Memory' : 'Gerar Brand Memory',
    };
  }

  if (brandMemoryExportValid) {
    return { type: 'load_brand_memory', label: 'Carregar Brand Memory' };
  }

  if (nextAgent !== null && nextAgent !== undefined) {
    return {
      type: 'run_agent',
      agentNum: Number(nextAgent),
      label: `Executar Agente ${Number(nextAgent)}`,
    };
  }

  return { type: 'done', label: 'Fluxo pronto' };
}

export function canPrepareBrandMemoryBeforeEditorial({
  brandMemoryExportReady,
  brandMemoryExportValid,
  hasEditorialOutput,
} = {}) {
  return !!(brandMemoryExportReady || brandMemoryExportValid) && !hasEditorialOutput;
}
