import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';
import {
  approveCreativeAsset,
  archiveCreativeAsset,
  rejectCreativeAsset,
} from '../../../../lib/agency/creativeAssets';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);
    const { id } = req.query || {};

    if (req.method === 'PATCH' || req.method === 'POST') {
      const { action, notes, reason } = req.body || {};
      if (action === 'approve') {
        const asset = await approveCreativeAsset(supabaseAdmin, id, notes);
        return res.status(200).json({ success: true, asset });
      }
      if (action === 'reject') {
        const asset = await rejectCreativeAsset(supabaseAdmin, id, reason);
        return res.status(200).json({ success: true, asset });
      }
      if (action === 'archive') {
        const asset = await archiveCreativeAsset(supabaseAdmin, id);
        return res.status(200).json({ success: true, asset });
      }
      return res.status(400).json({ success: false, error: 'Ação inválida para ativo visual.' });
    }

    if (req.method === 'DELETE') {
      const asset = await archiveCreativeAsset(supabaseAdmin, id);
      return res.status(200).json({ success: true, asset });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[agency/assets/:id]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}
