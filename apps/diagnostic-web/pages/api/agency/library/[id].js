import { getServerUser } from '../../../../lib/getServerUser';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { requireAgencyUser } from '../../../../lib/agency/runtime';
import { archiveBrandLibraryItem } from '../../../../lib/agency/library';

export default async function handler(req, res) {
  const { user } = await getServerUser(req, res);
  if (!user) return res.status(401).json({ success: false, error: 'Não autenticado' });
  if (!supabaseAdmin) return res.status(500).json({ success: false, error: 'Supabase admin indisponível' });

  try {
    await requireAgencyUser(supabaseAdmin, user);
    const { id } = req.query || {};

    if (req.method === 'DELETE') {
      const item = await archiveBrandLibraryItem(supabaseAdmin, id);
      return res.status(200).json({ success: true, item });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('[agency/library/:id]', error);
    return res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
}
