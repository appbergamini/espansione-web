import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';
import {
  createLearningSuggestion,
  listLearningSuggestions,
} from '../../../../lib/agency/learning';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);

    if (req.method === 'GET') {
      const {
        brand_id,
        learning_type,
        status,
        source_agency_run_id,
        source_agency_request_id,
        source_library_item_id,
        search,
      } = req.query || {};
      const items = await listLearningSuggestions(supabaseAdmin, brand_id, {
        learningType: learning_type,
        status,
        sourceAgencyRunId: source_agency_run_id,
        sourceAgencyRequestId: source_agency_request_id,
        sourceLibraryItemId: source_library_item_id,
        search,
      });
      return res.status(200).json({ success: true, suggestions: items });
    }

    if (req.method === 'POST') {
      const suggestion = await createLearningSuggestion(supabaseAdmin, req.body || {});
      return res.status(200).json({ success: true, suggestion });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[agency/learnings]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}
