import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);

    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { brand_id } = req.query || {};
    if (!brand_id) return res.status(400).json({ success: false, error: 'brand_id obrigatório' });

    const { data, error } = await supabaseAdmin
      .from('brand_memory_versions')
      .select('id, brand_id, diagnostic_run_id, source_output_id, version_number, status, change_summary, validation_status, validation_errors, approved_by, activated_at, created_at, updated_at')
      .eq('brand_id', brand_id)
      .order('version_number', { ascending: false });

    if (error) throw error;
    const versions = data || [];
    return res.status(200).json({
      success: true,
      versions,
      activeVersion: versions.find((version) => version.status === 'active') || null,
    });
  } catch (error) {
    console.error('[agency/brand-memory-versions]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}
