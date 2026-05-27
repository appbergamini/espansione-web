import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';
import { archiveBrandAssetKitItem } from '../../../../lib/agency/brandAssetKit';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  const { id } = req.query || {};
  if (!id) return res.status(400).json({ success: false, error: 'id obrigatório' });

  try {
    await requireAgencyUser(supabaseAdmin, user);

    if (req.method === 'DELETE' || req.method === 'PATCH') {
      const item = await archiveBrandAssetKitItem(supabaseAdmin, id);
      return res.status(200).json({ success: true, item });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[agency/brand-book/:id]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}
