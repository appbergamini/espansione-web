/**
 * Brand Memory Loader — simplified version
 * ----------------------------------------
 * Workflow real: o consultor lê o output do Agente 16 no admin, e quando
 * está bom, clica "Carregar Brand Memory". Sem revisão por agente, sem
 * edição inline, sem state machine. Confiamos no julgamento do consultor.
 *
 * One row per (brand_id, agent_id) ativo no `brand_snapshots`. Recarregar
 * sobrescreve via flag is_active.
 *
 * Location: packages/brand-memory/src/brand-memory-loader-v2.ts
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { BrandMemoryVersionStatus, EspansioneDiagnostic } from '@espansione/types';

// ============================================================
// PUBLIC API
// ============================================================

export interface LoadResult {
  brandId: string;
  diagnosticRunId: string;
  brandMemoryVersionId: string;
  versionNumber: number;
  snapshotsWritten: number;
}

export interface LoadBrandMemoryOptions {
  reviewedBy?: string;
  reviewedAt?: string;
  agent16OutputId?: string;
  changeSummary?: string;
}

export interface ActiveBrandMemoryVersion {
  id: string;
  brandId: string;
  diagnosticRunId: string | null;
  sourceOutputId: string | null;
  versionNumber: number;
  status: BrandMemoryVersionStatus;
  espansioneDiagnosticJson: EspansioneDiagnostic;
  changeSummary: string | null;
  validationStatus: string | null;
  validationErrors: unknown[];
  approvedBy: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Carrega um EspansioneDiagnostic na Brand Memory.
 * Idempotente: re-carregar sobrescreve via is_active flag.
 */
export async function loadBrandMemory(
  supabase: SupabaseClient,
  diagnostic: EspansioneDiagnostic,
  options: LoadBrandMemoryOptions = {}
): Promise<LoadResult> {
  if (!options.reviewedAt || !options.reviewedBy) {
    throw new LoaderError('Brand Memory load requires explicit human review metadata.');
  }

  if (diagnostic.schema_version !== '2.0') {
    throw new LoaderError(`Unsupported schema_version: "${diagnostic.schema_version}".`);
  }
  if (!diagnostic.brand_slug || !diagnostic.brand_name) {
    throw new LoaderError('Missing brand_slug or brand_name');
  }

  const brand = await upsertBrand(supabase, diagnostic);
  const run = await createRun(supabase, brand.id, diagnostic, options);
  await archivePreviousActive(supabase, brand.id);
  const snapshotsWritten = await insertSnapshots(supabase, brand.id, run.id, diagnostic);
  await finalizeRun(supabase, run.id);
  const version = await activateBrandMemoryVersion(supabase, brand.id, run, diagnostic, options);

  return {
    brandId: brand.id,
    diagnosticRunId: run.id,
    brandMemoryVersionId: version.id,
    versionNumber: version.versionNumber,
    snapshotsWritten,
  };
}

/**
 * Retorna o EspansioneDiagnostic ativo de uma marca, reconstruído dos snapshots.
 * Retorna null se não houver Brand Memory carregada.
 */
export async function getBrandMemory(
  supabase: SupabaseClient,
  brandId: string
): Promise<EspansioneDiagnostic | null> {
  const activeVersion = await getActiveBrandMemoryVersion(supabase, brandId);
  if (activeVersion?.espansioneDiagnosticJson) {
    return activeVersion.espansioneDiagnosticJson;
  }

  const { data: snapshots, error } = await supabase
    .from('brand_snapshots')
    .select('agent_id, data, diagnostic_run_id')
    .eq('brand_id', brandId)
    .eq('is_active', true);

  if (error || !snapshots || snapshots.length === 0) return null;

  const { data: brand } = await supabase
    .from('brands')
    .select('slug, name, industry')
    .eq('id', brandId)
    .single();

  if (!brand) return null;

  return reconstructDiagnostic(brand, snapshots);
}

export async function getActiveBrandMemoryVersion(
  supabase: SupabaseClient,
  brandId: string
): Promise<ActiveBrandMemoryVersion | null> {
  if (!brandId) return null;

  const { data, error } = await supabase
    .from('brand_memory_versions')
    .select('*')
    .eq('brand_id', brandId)
    .eq('status', 'active')
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    brandId: data.brand_id,
    diagnosticRunId: data.diagnostic_run_id,
    sourceOutputId: data.source_output_id,
    versionNumber: data.version_number,
    status: data.status,
    espansioneDiagnosticJson: data.espansione_diagnostic_json as EspansioneDiagnostic,
    changeSummary: data.change_summary,
    validationStatus: data.validation_status,
    validationErrors: data.validation_errors || [],
    approvedBy: data.approved_by,
    activatedAt: data.activated_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Retorna apenas um slice (snapshot de um agente específico).
 * Útil pros agentes da Fase 2 que precisam só de uma parte.
 */
export async function getBrandMemorySlice<T = unknown>(
  supabase: SupabaseClient,
  brandId: string,
  agentId: number
): Promise<T | null> {
  const { data, error } = await supabase
    .from('brand_snapshots')
    .select('data')
    .eq('brand_id', brandId)
    .eq('agent_id', agentId)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) return null;
  return data.data as T;
}

// ============================================================
// INTERNAL
// ============================================================

async function upsertBrand(
  supabase: SupabaseClient,
  d: EspansioneDiagnostic
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('brands')
    .upsert(
      { slug: d.brand_slug, name: d.brand_name, industry: d.industry },
      { onConflict: 'slug' }
    )
    .select('id')
    .single();

  if (error) throw new LoaderError(`upsert brand failed: ${error.message}`);
  return data;
}

async function createRun(
  supabase: SupabaseClient,
  brandId: string,
  d: EspansioneDiagnostic,
  options: LoadBrandMemoryOptions
): Promise<{ id: string; version: number }> {
  const { data: latest } = await supabase
    .from('diagnostic_runs')
    .select('version')
    .eq('brand_id', brandId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version ?? 0) + 1;

  const { data, error } = await supabase
    .from('diagnostic_runs')
    .insert({
      brand_id: brandId,
      version: nextVersion,
      schema_version: '2.0',
      espansione_project_id: d.espansione_project_id,
      agent_16_output_id: options.agent16OutputId ?? null,
      consolidated_at: d.meta.consolidated_at,
      human_reviewed_at: options.reviewedAt,
      human_reviewed_by: options.reviewedBy,
    })
    .select('id, version')
    .single();

  if (error) throw new LoaderError(`create run failed: ${error.message}`);
  return data;
}

async function activateBrandMemoryVersion(
  supabase: SupabaseClient,
  brandId: string,
  run: { id: string; version: number },
  diagnostic: EspansioneDiagnostic,
  options: LoadBrandMemoryOptions
): Promise<{ id: string; versionNumber: number }> {
  const { error: archiveError } = await supabase
    .from('brand_memory_versions')
    .update({ status: 'archived' })
    .eq('brand_id', brandId)
    .eq('status', 'active');

  if (archiveError) {
    throw new LoaderError(`archive previous Brand Memory versions failed: ${archiveError.message}`);
  }

  const validationErrors = diagnostic.meta?.validation_errors || [];
  const validationStatus = validationErrors.length > 0 ? 'warnings' : 'valid';
  const { data, error } = await supabase
    .from('brand_memory_versions')
    .insert({
      brand_id: brandId,
      diagnostic_run_id: run.id,
      source_output_id: options.agent16OutputId ?? null,
      version_number: run.version,
      status: 'active',
      espansione_diagnostic_json: diagnostic,
      change_summary: options.changeSummary ?? buildDefaultChangeSummary(run.version),
      validation_status: validationStatus,
      validation_errors: validationErrors,
      approved_by: options.reviewedBy ?? null,
      activated_at: options.reviewedAt ?? new Date().toISOString(),
    })
    .select('id, version_number')
    .single();

  if (error) throw new LoaderError(`create Brand Memory version failed: ${error.message}`);

  return {
    id: data.id,
    versionNumber: data.version_number,
  };
}

function buildDefaultChangeSummary(version: number): string {
  return version === 1
    ? 'Primeira Brand Memory ativa carregada a partir do Agente 16.'
    : `Brand Memory v${version} ativada a partir de novo carregamento revisado.`;
}

async function finalizeRun(
  supabase: SupabaseClient,
  runId: string
): Promise<void> {
  const { error } = await supabase
    .from('diagnostic_runs')
    .update({
      status: 'complete',
      completed_at: new Date().toISOString(),
    })
    .eq('id', runId);

  if (error) throw new LoaderError(`finalize run failed: ${error.message}`);
}

async function archivePreviousActive(
  supabase: SupabaseClient,
  brandId: string
): Promise<void> {
  await supabase
    .from('brand_snapshots')
    .update({ is_active: false })
    .eq('brand_id', brandId)
    .eq('is_active', true);
}

async function insertSnapshots(
  supabase: SupabaseClient,
  brandId: string,
  runId: string,
  d: EspansioneDiagnostic
): Promise<number> {
  const decodificacaoSnapshot =
    d.strategic_tensions || d.executional_readiness
      ? {
          ...d.decodificacao,
          ...(d.strategic_tensions ? { strategic_tensions: d.strategic_tensions } : {}),
          ...(d.executional_readiness ? { executional_readiness: d.executional_readiness } : {}),
        }
      : d.decodificacao;

  const payloads: { agent_id: number; data: unknown }[] = [
    { agent_id: 2, data: d.vi },
    { agent_id: 4, data: d.ve },
    { agent_id: 5, data: { vm: d.vm, sources: d.vm_sources } },
    { agent_id: 6, data: decodificacaoSnapshot },
    { agent_id: 7, data: d.values_and_attributes },
    { agent_id: 8, data: { diretrizes: d.diretrizes_estrategicas, reinforcement_logic: d.diretrizes_reinforcement_logic } },
    { agent_id: 9, data: d.plataforma_branding },
    { agent_id: 10, data: d.voice_profile },
    { agent_id: 11, data: d.visual_identity },
    { agent_id: 12, data: d.experiencia },
    { agent_id: 13, data: d.plano_comunicacao },
  ];

  if (d.evp) payloads.push({ agent_id: 14, data: d.evp });

  const rows = payloads.map((p) => ({
    brand_id: brandId,
    diagnostic_run_id: runId,
    agent_id: p.agent_id,
    data: p.data,
    is_active: true,
  }));

  const { error } = await supabase.from('brand_snapshots').insert(rows);
  if (error) throw new LoaderError(`insert snapshots failed: ${error.message}`);

  return rows.length;
}

function reconstructDiagnostic(
  brand: { slug: string; name: string; industry: string | null },
  snapshots: { agent_id: number; data: unknown; diagnostic_run_id: string }[]
): EspansioneDiagnostic {
  const byAgent = new Map(snapshots.map((s) => [s.agent_id, s.data]));

  const ag5 = byAgent.get(5) as { vm: unknown; sources: unknown };
  const ag8 = byAgent.get(8) as { diretrizes: unknown; reinforcement_logic: string };

  const diagnostic: EspansioneDiagnostic = {
    brand_slug: brand.slug,
    brand_name: brand.name,
    industry: brand.industry,
    espansione_project_id: '',
    schema_version: '2.0',
    vi: byAgent.get(2) as EspansioneDiagnostic['vi'],
    ve: byAgent.get(4) as EspansioneDiagnostic['ve'],
    vm: ag5.vm as EspansioneDiagnostic['vm'],
    vm_sources: ag5.sources as EspansioneDiagnostic['vm_sources'],
    decodificacao: byAgent.get(6) as EspansioneDiagnostic['decodificacao'],
    values_and_attributes: byAgent.get(7) as EspansioneDiagnostic['values_and_attributes'],
    diretrizes_estrategicas: ag8.diretrizes as EspansioneDiagnostic['diretrizes_estrategicas'],
    diretrizes_reinforcement_logic: ag8.reinforcement_logic,
    plataforma_branding: byAgent.get(9) as EspansioneDiagnostic['plataforma_branding'],
    voice_profile: byAgent.get(10) as EspansioneDiagnostic['voice_profile'],
    visual_identity: byAgent.get(11) as EspansioneDiagnostic['visual_identity'],
    experiencia: byAgent.get(12) as EspansioneDiagnostic['experiencia'],
    plano_comunicacao: byAgent.get(13) as EspansioneDiagnostic['plano_comunicacao'],
    meta: {
      consolidated_at: new Date().toISOString(),
      schema_version: '2.0',
      agents_present: Array.from(byAgent.keys()).sort((a, b) => a - b),
      agents_missing: [],
      has_evp: byAgent.has(14),
      validation_errors: [],
      missing_required_fields: [],
      gaps_by_agent: {},
      load_status: 'loaded',
    },
  };

  const decodificacao = diagnostic.decodificacao as EspansioneDiagnostic['decodificacao'] | undefined;
  if (decodificacao?.strategic_tensions) {
    diagnostic.strategic_tensions = decodificacao.strategic_tensions;
  } else if (decodificacao?.pontos_de_escolha_estrategica) {
    diagnostic.strategic_tensions = decodificacao.pontos_de_escolha_estrategica;
  }

  if (decodificacao?.executional_readiness) {
    diagnostic.executional_readiness = decodificacao.executional_readiness;
  }

  if (byAgent.has(14)) {
    diagnostic.evp = byAgent.get(14) as EspansioneDiagnostic['evp'];
  }

  return diagnostic;
}

class LoaderError extends Error {
  constructor(message: string) {
    super(`[BrandMemoryLoader] ${message}`);
    this.name = 'LoaderError';
  }
}
