/**
 * Brand Memory Loader v2
 * ----------------------
 * Consumes the EspansioneDiagnostic emitted by Agent 16 and writes it to
 * Brand Memory via the brand_snapshots strategy (one row per agent per
 * diagnostic_run, with full export as JSONB).
 *
 * Refuses to load unless diagnostic_runs.human_reviewed_at is set.
 *
 * Location in monorepo: packages/brand-memory/src/brand-memory-loader-v2.ts
 *
 * Dependencies:
 *   - @espansione/types (EspansioneDiagnostic shape)
 *   - @supabase/supabase-js
 *   - openai (for embeddings)
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type OpenAI from 'openai';
import type {
  EspansioneDiagnostic,
  Persona,
} from '@espansione/types';
import {
  CONTRIBUTING_AGENTS,
  REQUIRED_AGENTS,
  CRITICAL_AGENTS,
} from '@espansione/types';

// ============================================================
// PUBLIC API
// ============================================================

export interface LoaderOptions {
  /**
   * If true (default), the loader refuses to write unless the diagnostic_run
   * has human_reviewed_at set. Set to false only for tests or admin overrides.
   */
  requireHumanReview?: boolean;

  /**
   * Reviewer identifier — required when bypassRunCheck is true and you want
   * the loader to set human_reviewed_at itself (rare; prefer the UI flow).
   */
  reviewedBy?: string;
}

export interface LoadResult {
  brandId: string;
  runId: string;
  version: number;
  snapshotsWritten: number;
  personasExtracted: number;
  pillarsExtracted: number;
  contentSeedsCreated: number;
}

/**
 * Main entry point. Takes an EspansioneDiagnostic (output of Agent 16) and
 * loads it into Brand Memory. Idempotent at the (brand, version) level —
 * re-running with the same version overwrites.
 */
export async function loadDiagnosticToBrandMemory(
  supabase: SupabaseClient,
  openai: OpenAI,
  diagnostic: EspansioneDiagnostic,
  opts: LoaderOptions = {}
): Promise<LoadResult> {
  validateDiagnostic(diagnostic);

  const brand = await upsertBrand(supabase, diagnostic);
  const run = await createOrFindRun(supabase, brand.id, diagnostic);

  if (opts.requireHumanReview !== false) {
    await assertHumanReviewed(supabase, run.id, opts.reviewedBy);
  }

  await archivePreviousActive(supabase, brand.id);

  const snapshotsWritten = await insertAllSnapshots(supabase, brand.id, run.id, diagnostic);
  const personas = await extractPersonas(supabase, brand.id, run.id, diagnostic);
  const pillars = await extractEditorialPillars(supabase, brand.id, run.id, diagnostic, personas);
  const contentSeedsCreated = await seedContentExamples(supabase, openai, brand.id, diagnostic);

  await markRunComplete(supabase, run.id);

  return {
    brandId: brand.id,
    runId: run.id,
    version: run.version,
    snapshotsWritten,
    personasExtracted: personas.length,
    pillarsExtracted: pillars.length,
    contentSeedsCreated,
  };
}

// ============================================================
// READ HELPERS — used by the agency layer agents
// ============================================================

/**
 * Returns the full active EspansioneDiagnostic for a brand, reconstructed
 * from the active snapshots. Returns null if no human-reviewed run exists.
 *
 * Agents that need the whole picture (Account Director) call this.
 * Agents that need only one slice (Copywriter → voice) should call
 * getActiveSnapshot instead, which is cheaper.
 */
export async function getActiveDiagnostic(
  supabase: SupabaseClient,
  brandId: string
): Promise<EspansioneDiagnostic | null> {
  const { data: row, error } = await supabase
    .from('active_brand_memory')
    .select('*')
    .eq('brand_id', brandId)
    .maybeSingle();

  if (error || !row) return null;

  return rebuildDiagnostic(row);
}

/**
 * Returns the active snapshot of a single agent for a brand. Typed by the
 * caller — most efficient way to read one slice. Returns null if absent.
 *
 * Example:
 *   const voice = await getActiveSnapshot<VoiceProfile>(supabase, brandId, 10);
 */
export async function getActiveSnapshot<T = unknown>(
  supabase: SupabaseClient,
  brandId: string,
  agentId: number
): Promise<T | null> {
  const { data, error } = await supabase
    .from('brand_snapshots')
    .select('data, diagnostic_run_id, diagnostic_runs!inner(human_reviewed_at)')
    .eq('brand_id', brandId)
    .eq('agent_id', agentId)
    .eq('is_active', true)
    .not('diagnostic_runs.human_reviewed_at', 'is', null)
    .maybeSingle();

  if (error || !data) return null;
  return data.data as T;
}

// ============================================================
// VALIDATION
// ============================================================

function validateDiagnostic(d: EspansioneDiagnostic): void {
  if (d.schema_version !== '2.0') {
    throw new LoaderError(
      `Unsupported schema_version: "${d.schema_version}". Loader expects "2.0".`
    );
  }
  if (d.meta.load_status === 'blocked') {
    const errors = d.meta.validation_errors
      .filter((e) => e.severity === 'fatal')
      .map((e) => `  - agent ${e.agent}: ${e.error}`)
      .join('\n');
    throw new LoaderError(
      `Cannot load: load_status is "blocked". Fatal errors:\n${errors}`
    );
  }
  if (!d.brand_slug || !d.brand_name) {
    throw new LoaderError('Missing brand_slug or brand_name');
  }
  if (!d.espansione_project_id) {
    throw new LoaderError('Missing espansione_project_id');
  }

  // Sanity: every required agent must have produced something the diagnostic carries
  for (const n of REQUIRED_AGENTS) {
    if (!d.meta.agents_present.includes(n)) {
      throw new LoaderError(
        `Required agent ${n} missing from meta.agents_present. ` +
          `Loader refuses to proceed with incomplete consolidation.`
      );
    }
  }
}

async function assertHumanReviewed(
  supabase: SupabaseClient,
  runId: string,
  reviewedBy: string | undefined
): Promise<void> {
  const { data, error } = await supabase
    .from('diagnostic_runs')
    .select('id, human_reviewed_at')
    .eq('id', runId)
    .single();

  if (error) throw new LoaderError(`Could not fetch diagnostic_run: ${error.message}`);
  if (data.human_reviewed_at) return;

  // Allow auto-setting only when reviewer is explicitly identified.
  // Default UX is: UI sets human_reviewed_at BEFORE calling loader.
  // This path exists for admin/CLI flows.
  if (!reviewedBy) {
    throw new LoaderError(
      `Diagnostic run ${runId} not approved by human reviewer. ` +
        `Set diagnostic_runs.human_reviewed_at via the review UI before loading. ` +
        `For admin override, pass opts.reviewedBy.`
    );
  }

  const { error: updErr } = await supabase
    .from('diagnostic_runs')
    .update({
      human_reviewed_at: new Date().toISOString(),
      human_reviewed_by: reviewedBy,
    })
    .eq('id', runId);

  if (updErr) throw new LoaderError(`Failed to set human review: ${updErr.message}`);
}

// ============================================================
// BRAND & RUN BOOTSTRAP
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

async function createOrFindRun(
  supabase: SupabaseClient,
  brandId: string,
  d: EspansioneDiagnostic
): Promise<{ id: string; version: number }> {
  // Check if a run already exists for this project_id — if so, reuse it.
  // This makes the loader idempotent at the project level.
  const { data: existing } = await supabase
    .from('diagnostic_runs')
    .select('id, version')
    .eq('brand_id', brandId)
    .eq('espansione_project_id', d.espansione_project_id)
    .maybeSingle();

  if (existing) return existing;

  // Otherwise create new run with auto-incremented version.
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
      methodology: 'ana_couto_decodificando_valor',
      status: 'in_progress',
      espansione_project_id: d.espansione_project_id,
      consolidated_at: d.meta.consolidated_at,
    })
    .select('id, version')
    .single();

  if (error) throw new LoaderError(`create run failed: ${error.message}`);
  return data;
}

async function archivePreviousActive(
  supabase: SupabaseClient,
  brandId: string
): Promise<void> {
  // Flip all previously-active snapshots to is_active=false.
  await supabase
    .from('brand_snapshots')
    .update({ is_active: false })
    .eq('brand_id', brandId)
    .eq('is_active', true);

  await supabase
    .from('personas')
    .update({ is_active: false })
    .eq('brand_id', brandId)
    .eq('is_active', true);

  await supabase
    .from('editorial_pillars')
    .update({ is_active: false })
    .eq('brand_id', brandId)
    .eq('is_active', true);
}

async function markRunComplete(
  supabase: SupabaseClient,
  runId: string
): Promise<void> {
  const { error } = await supabase
    .from('diagnostic_runs')
    .update({ status: 'complete', completed_at: new Date().toISOString() })
    .eq('id', runId);
  if (error) throw new LoaderError(`mark complete failed: ${error.message}`);
}

// ============================================================
// SNAPSHOT INSERTION
// ============================================================

/**
 * Mapping from agent_id to the slice of the EspansioneDiagnostic that gets
 * stored in that agent's snapshot. Keeps the loader declarative.
 */
function buildSnapshotPayloads(
  d: EspansioneDiagnostic
): { agent_id: number; data: unknown }[] {
  const payloads: { agent_id: number; data: unknown }[] = [
    { agent_id: 2, data: d.vi },
    { agent_id: 4, data: d.ve },
    { agent_id: 5, data: { vm: d.vm, sources: d.vm_sources } },
    { agent_id: 6, data: d.decodificacao },
    { agent_id: 7, data: d.values_and_attributes },
    {
      agent_id: 8,
      data: {
        diretrizes: d.diretrizes_estrategicas,
        reinforcement_logic: d.diretrizes_reinforcement_logic,
      },
    },
    { agent_id: 9, data: d.plataforma_branding },
    { agent_id: 10, data: d.voice_profile },
    { agent_id: 11, data: d.visual_identity },
    { agent_id: 12, data: d.experiencia },
    { agent_id: 13, data: d.plano_comunicacao },
  ];

  if (d.evp) {
    payloads.push({ agent_id: 14, data: d.evp });
  }

  return payloads;
}

async function insertAllSnapshots(
  supabase: SupabaseClient,
  brandId: string,
  runId: string,
  diagnostic: EspansioneDiagnostic
): Promise<number> {
  const payloads = buildSnapshotPayloads(diagnostic);

  const rows = payloads.map((p) => ({
    brand_id: brandId,
    diagnostic_run_id: runId,
    agent_id: p.agent_id,
    data: p.data,
    is_active: true,
  }));

  // Upsert because we want re-run idempotency: same (run, agent) overwrites.
  const { error } = await supabase
    .from('brand_snapshots')
    .upsert(rows, { onConflict: 'diagnostic_run_id,agent_id' });

  if (error) throw new LoaderError(`insert snapshots failed: ${error.message}`);
  return rows.length;
}

// ============================================================
// RELATIONAL EXTRACTION
// ============================================================

async function extractPersonas(
  supabase: SupabaseClient,
  brandId: string,
  runId: string,
  diagnostic: EspansioneDiagnostic
): Promise<{ id: string; name: string }[]> {
  const personas: Persona[] = diagnostic.experiencia.personas ?? [];
  if (personas.length === 0) return [];

  const rows = personas.map((p, idx) => ({
    brand_id: brandId,
    diagnostic_run_id: runId,
    name: p.name,
    role_profession: p.role_profession,
    age: p.age,
    is_internal_persona: p.is_internal_persona ?? false,
    descritivo: p.descritivo,
    jtbd: p.jtbd,
    full_data: p,
    priority: idx + 1,
    is_active: true,
  }));

  const { data, error } = await supabase
    .from('personas')
    .insert(rows)
    .select('id, name');

  if (error) throw new LoaderError(`insert personas failed: ${error.message}`);
  return data ?? [];
}

async function extractEditorialPillars(
  supabase: SupabaseClient,
  brandId: string,
  runId: string,
  diagnostic: EspansioneDiagnostic,
  personas: { id: string; name: string }[]
): Promise<{ id: string }[]> {
  const fallbackPersonaId = personas[0]?.id ?? null;

  const fromDirecionadores = diagnostic.plataforma_branding.negocio_faz.direcionadores_experiencia.map(
    (d) => ({
      brand_id: brandId,
      diagnostic_run_id: runId,
      name: d.titulo,
      description: d.descricao,
      source: 'agent_9_direcionador' as const,
      target_persona_id: fallbackPersonaId,
      weight: 2,
      is_active: true,
    })
  );

  const fromClusters = diagnostic.plano_comunicacao.clusters_comunicacao.map((c) => ({
    brand_id: brandId,
    diagnostic_run_id: runId,
    name: c.nome,
    description: c.descricao,
    source: 'agent_13_cluster' as const,
    target_persona_id: fallbackPersonaId,
    weight: 1,
    is_active: true,
  }));

  const rows = [...fromDirecionadores, ...fromClusters];
  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from('editorial_pillars')
    .insert(rows)
    .select('id');

  if (error) throw new LoaderError(`insert pillars failed: ${error.message}`);
  return data ?? [];
}

// ============================================================
// RAG SEEDING
// ============================================================

/**
 * Seeds content_examples with brand-authored sample text from the diagnostic.
 * Day-1 references for the Copywriter: discourse, narrative, tagline.
 */
async function seedContentExamples(
  supabase: SupabaseClient,
  openai: OpenAI,
  brandId: string,
  d: EspansioneDiagnostic
): Promise<number> {
  const seeds: { content_type: string; body: string }[] = [];

  const plataforma = d.plataforma_branding;
  if (plataforma.comunicacao_fala.discurso_posicionamento) {
    seeds.push({
      content_type: 'voice_sample_discurso',
      body: plataforma.comunicacao_fala.discurso_posicionamento,
    });
  }
  if (plataforma.comunicacao_fala.tagline) {
    seeds.push({
      content_type: 'tagline',
      body: plataforma.comunicacao_fala.tagline,
    });
  }

  // Narrativa central do plano de comunicação — alta densidade de voz da marca
  if (d.plano_comunicacao.narrativa_marca.historia_central) {
    seeds.push({
      content_type: 'voice_sample_narrativa',
      body: d.plano_comunicacao.narrativa_marca.historia_central,
    });
  }

  // Exemplos do voice profile (Agente 10), se houver
  for (const tom of d.voice_profile.tons_de_voz) {
    if (tom.exemplo) {
      seeds.push({
        content_type: `voice_sample_tom_${slugify(tom.nome)}`,
        body: tom.exemplo,
      });
    }
  }

  if (seeds.length === 0) return 0;

  // Embed in parallel (small batches; OpenAI handles concurrency)
  const embeddings = await Promise.all(seeds.map((s) => embedText(openai, s.body)));

  const rows = seeds.map((s, i) => ({
    brand_id: brandId,
    content_type: s.content_type,
    body: s.body,
    embedding: embeddings[i],
    approval_status: 'approved' as const,
    metadata: { origin: 'diagnostic_seed', schema_version: '2.0' },
  }));

  const { error } = await supabase.from('content_examples').insert(rows);
  if (error) throw new LoaderError(`seed content_examples failed: ${error.message}`);

  return rows.length;
}

async function embedText(openai: OpenAI, text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// ============================================================
// READ HELPERS — internal
// ============================================================

/**
 * Reconstructs the EspansioneDiagnostic from the active_brand_memory view row.
 * Mirrors buildSnapshotPayloads in reverse.
 */
function rebuildDiagnostic(row: {
  brand_id: string;
  slug: string;
  name: string;
  industry: string | null;
  diagnostic_run_id: string;
  version: number;
  human_reviewed_at: string;
  snapshots: Record<string, unknown>;
}): EspansioneDiagnostic {
  const s = row.snapshots;
  const get = <T>(agentId: number): T => s[String(agentId)] as T;

  const ag5 = get<{ vm: unknown; sources: unknown }>(5);
  const ag8 = get<{ diretrizes: unknown; reinforcement_logic: string }>(8);

  const diagnostic: EspansioneDiagnostic = {
    brand_slug: row.slug,
    brand_name: row.name,
    industry: row.industry,
    espansione_project_id: '', // not in view; caller fetches from diagnostic_runs if needed
    schema_version: '2.0',
    vi: get<EspansioneDiagnostic['vi']>(2),
    ve: get<EspansioneDiagnostic['ve']>(4),
    vm: ag5.vm as EspansioneDiagnostic['vm'],
    vm_sources: ag5.sources as EspansioneDiagnostic['vm_sources'],
    decodificacao: get<EspansioneDiagnostic['decodificacao']>(6),
    values_and_attributes: get<EspansioneDiagnostic['values_and_attributes']>(7),
    diretrizes_estrategicas: ag8.diretrizes as EspansioneDiagnostic['diretrizes_estrategicas'],
    diretrizes_reinforcement_logic: ag8.reinforcement_logic,
    plataforma_branding: get<EspansioneDiagnostic['plataforma_branding']>(9),
    voice_profile: get<EspansioneDiagnostic['voice_profile']>(10),
    visual_identity: get<EspansioneDiagnostic['visual_identity']>(11),
    experiencia: get<EspansioneDiagnostic['experiencia']>(12),
    plano_comunicacao: get<EspansioneDiagnostic['plano_comunicacao']>(13),
    meta: {
      consolidated_at: row.human_reviewed_at,
      schema_version: '2.0',
      agents_present: Object.keys(s).map(Number).sort((a, b) => a - b),
      agents_missing: [],
      has_evp: '14' in s,
      validation_errors: [],
      missing_required_fields: [],
      gaps_by_agent: {},
      load_status: 'ready',
    },
  };

  if ('14' in s) {
    diagnostic.evp = get<EspansioneDiagnostic['evp']>(14);
  }

  return diagnostic;
}

// ============================================================
// UTILITIES
// ============================================================

class LoaderError extends Error {
  constructor(message: string) {
    super(`[BrandMemoryLoader] ${message}`);
    this.name = 'LoaderError';
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

// Re-export the agent constants for convenience.
export { CONTRIBUTING_AGENTS, REQUIRED_AGENTS, CRITICAL_AGENTS };
