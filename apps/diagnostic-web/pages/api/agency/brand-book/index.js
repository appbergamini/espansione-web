import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';
import {
  createBrandAssetKitItem,
  listBrandAssetKitItems,
  summarizeBrandAssetKit,
} from '../../../../lib/agency/brandAssetKit';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);

    if (req.method === 'GET') {
      const { brand_id, asset_type, status, search } = req.query || {};
      const items = await listBrandAssetKitItems(supabaseAdmin, brand_id, {
        assetType: asset_type,
        status,
        search,
      });
      return res.status(200).json({
        success: true,
        items,
        summary: summarizeBrandAssetKit(items),
      });
    }

    if (req.method === 'POST') {
      const item = await createBrandAssetKitItem(supabaseAdmin, req.body || {});
      return res.status(200).json({ success: true, item });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[agency/brand-book]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}
