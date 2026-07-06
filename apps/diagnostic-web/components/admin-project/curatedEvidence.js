// Helpers puros de 'curated evidence' e brand memory export do painel do
// projeto (extraídos de pages/adm/[id].js — item 2). Sem componentes/estado.

function buildCuratedEvidenceForm(pack) {
  return {
    strongEvidence: evidenceToText(pack?.strong_evidence || []),
    weakEvidence: evidenceToText(pack?.weak_evidence || []),
    contradictions: contradictionsToText(pack?.contradictions || []),
    evidenceGaps: textLinesToText(pack?.evidence_gaps || []),
    sensitivePoints: textLinesToText(pack?.sensitive_points || []),
    unresolvedQuestions: textLinesToText(pack?.unresolved_questions || []),
    assumptionsToValidate: textLinesToText(pack?.assumptions_to_validate || []),
    curatorNotes: pack?.curator_notes || '',
  };
}

function evidenceToText(items) {
  return (items || []).map((item) => [
    item.source_lens || 'vi',
    item.title || '',
    item.description || '',
    item.source_reference || '',
  ].join(' | ').replace(/\s+\|\s+$/g, '')).join('\n');
}

function contradictionsToText(items) {
  return (items || []).map((item) => [
    item.title || '',
    item.vi_signal || '',
    item.ve_signal || '',
    item.vm_signal || '',
    item.why_it_matters || '',
  ].join(' | ').replace(/\s+\|\s+$/g, '')).join('\n');
}

function textLinesToText(items) {
  return (items || []).join('\n');
}

function parseEvidenceLines(text, strength) {
  return parseTextLines(text).map((line) => {
    const [lensRaw, titleRaw, descriptionRaw, referenceRaw] = line.split('|').map((part) => part.trim());
    const lens = ['vi', 've', 'vm'].includes(lensRaw) ? lensRaw : 'vi';
    return {
      source_lens: lens,
      title: titleRaw || (['vi', 've', 'vm'].includes(lensRaw) ? descriptionRaw : lensRaw) || 'Evidência',
      description: descriptionRaw || titleRaw || line,
      source_reference: referenceRaw || undefined,
      evidence_strength: strength,
    };
  });
}

function parseContradictionLines(text) {
  return parseTextLines(text).map((line) => {
    const [title, viSignal, veSignal, vmSignal, why] = line.split('|').map((part) => part.trim());
    return {
      title: title || 'Contradição VI/VE/VM',
      vi_signal: viSignal || undefined,
      ve_signal: veSignal || undefined,
      vm_signal: vmSignal || undefined,
      why_it_matters: why || line,
      should_preserve_for_strategy: true,
    };
  });
}

function parseTextLines(text) {
  return String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);
}

function hasUsableAgent16BrandMemoryExport(output) {
  if (!output) return false;
  if (output.brand_memory_export_json && typeof output.brand_memory_export_json === 'object') return true;
  try {
    const parsed = extractBrandMemoryExportJson(output.conteudo || '');
    return !!(parsed?.espansione_diagnostic || parsed?.schema_version);
  } catch {
    return false;
  }
}

export {
  buildCuratedEvidenceForm,
  evidenceToText,
  contradictionsToText,
  textLinesToText,
  parseEvidenceLines,
  parseContradictionLines,
  parseTextLines,
  hasUsableAgent16BrandMemoryExport,
};
