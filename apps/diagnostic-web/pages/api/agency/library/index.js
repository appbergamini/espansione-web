import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';
import { listBrandLibraryItems } from '../../../../lib/agency/library';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);

    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const {
      brand_id,
      item_type,
      channel,
      objective,
      request_type,
      audience_cluster,
      status = 'active',
      search,
    } = req.query || {};

    const items = await listBrandLibraryItems(supabaseAdmin, brand_id, {
      itemType: item_type,
      channel,
      objective,
      requestType: request_type,
      audienceCluster: audience_cluster,
      status,
      search,
    });

    return res.status(200).json({ success: true, items });
  } catch (error) {
    console.error('[agency/library]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}
