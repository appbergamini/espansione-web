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

  const parsedNextAgent = Number(nextAgent);
  const nextAgentNum =
    nextAgent === null || nextAgent === undefined || !Number.isFinite(parsedNextAgent)
      ? null
      : parsedNextAgent;
  const canPrioritizeBrandMemory =
    nextAgentNum === null || nextAgentNum === 15 || nextAgentNum === 16;

  if (canPrioritizeBrandMemory) {
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
  }

  if (nextAgentNum !== null && nextAgentNum !== 16) {
    return {
      type: 'run_agent',
      agentNum: nextAgentNum,
      label: `Executar Agente ${nextAgentNum}`,
    };
  }

  if (nextAgentNum !== null) {
    return {
      type: 'run_agent',
      agentNum: nextAgentNum,
      label: `Executar Agente ${nextAgentNum}`,
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
