export const PROJECT_LIFECYCLE_STATUSES = [
  'project_created',
  'intake_configured',
  'diagnosis_running',
  'checkpoint_pending',
  'diagnosis_completed',
  'brand_memory_ready_to_load',
  'brand_memory_active',
  'agency_ready',
  'archived',
];

export async function markProjectBrandMemoryActive(db, projetoId) {
  if (!projetoId) return null;

  const { data, error } = await db
    .from('projetos')
    .update({ lifecycle_status: 'brand_memory_active' })
    .eq('id', projetoId)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

